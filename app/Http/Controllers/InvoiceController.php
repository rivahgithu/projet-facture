<?php

namespace App\Http\Controllers;

use App\Http\Requests\InvoiceRequest;
use App\Models\ActivityLog;
use App\Models\Invoice;
use App\Services\DocumentCalculationService;
use App\Services\DocumentNumberingService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class InvoiceController extends Controller
{
    public function __construct(
        protected DocumentCalculationService $calculationService,
        protected DocumentNumberingService $numberingService,
    ) {}

    /**
     * Store a newly created invoice directly.
     */
    public function store(InvoiceRequest $request): RedirectResponse
    {
        $company = $this->currentCompany();
        $validated = $request->validated();

        DB::transaction(function () use ($company, $validated) {
            $calculation = $this->calculationService->calculate($validated['items']);
            $invoiceNumber = $validated['invoice_number'] ?? $this->numberingService->generateInvoiceNumber($company);

            $dueDate = $validated['due_date'] ?? now()->addDays($company->payment_terms)->toDateString();

            $invoice = $company->invoices()->create([
                'client_id' => $validated['client_id'],
                'quote_id' => $validated['quote_id'] ?? null,
                'invoice_number' => $invoiceNumber,
                'document_status' => $validated['document_status'] ?? 'émise',
                'payment_status' => 'non_payée',
                'issue_date' => $validated['issue_date'],
                'due_date' => $dueDate,
                'currency' => $company->currency,
                'subtotal' => $calculation['subtotal'],
                'discount_total' => $calculation['discount_total'],
                'tax_total' => $calculation['tax_total'],
                'total' => $calculation['total'],
                'paid_total' => 0,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($calculation['items'] as $item) {
                $invoice->items()->create($item);
            }

            ActivityLog::create([
                'company_id' => $company->id,
                'user_id' => Auth::id(),
                'action' => 'invoice.created',
                'subject_type' => Invoice::class,
                'subject_id' => $invoice->id,
                'metadata' => [
                    'invoice_number' => $invoice->invoice_number,
                    'total' => $invoice->total,
                ],
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Facture créée avec succès.');
    }

    /**
     * Update the specified invoice.
     */
    public function update(InvoiceRequest $request, Invoice $invoice): RedirectResponse
    {
        $company = $this->currentCompany();
        abort_if($invoice->company_id !== $company->id, 403, 'Action non autorisée.');

        if ($invoice->document_status === 'annulée') {
            return back()->with('error', 'Une facture annulée ne peut plus être modifiée.');
        }

        $validated = $request->validated();

        DB::transaction(function () use ($invoice, $validated) {
            $calculation = $this->calculationService->calculate($validated['items']);

            // Recalculate payment status in case total changed
            $paidTotal = (float) $invoice->paid_total;
            $newTotal = $calculation['total'];

            $paymentStatus = $invoice->payment_status;
            if ($paidTotal >= $newTotal && $newTotal > 0) {
                $paymentStatus = 'payée';
            } elseif ($paidTotal > 0) {
                $paymentStatus = 'partiellement_payée';
            } else {
                $paymentStatus = 'non_payée';
            }

            $invoice->update([
                'client_id' => $validated['client_id'],
                'document_status' => $validated['document_status'] ?? $invoice->document_status,
                'payment_status' => $paymentStatus,
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'] ?? $invoice->due_date,
                'subtotal' => $calculation['subtotal'],
                'discount_total' => $calculation['discount_total'],
                'tax_total' => $calculation['tax_total'],
                'total' => $newTotal,
                'notes' => $validated['notes'] ?? null,
            ]);

            $invoice->items()->delete();
            foreach ($calculation['items'] as $item) {
                $invoice->items()->create($item);
            }

            ActivityLog::create([
                'company_id' => $invoice->company_id,
                'user_id' => Auth::id(),
                'action' => 'invoice.updated',
                'subject_type' => Invoice::class,
                'subject_id' => $invoice->id,
                'metadata' => [
                    'invoice_number' => $invoice->invoice_number,
                    'total' => $invoice->total,
                ],
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Facture mise à jour avec succès.');
    }

    /**
     * Cancel or remove the specified invoice (RB-14).
     */
    public function destroy(Invoice $invoice): RedirectResponse
    {
        $company = $this->currentCompany();
        abort_if($invoice->company_id !== $company->id, 403, 'Action non autorisée.');

        if ($invoice->document_status === 'brouillon' && $invoice->payments()->count() === 0) {
            $invoice->delete();

            return back()->with('success', 'Facture brouillon supprimée.');
        }

        // Emitted invoices cannot simply be erased: they are marked as cancelled (RB-14)
        $invoice->update([
            'document_status' => 'annulée',
            'cancelled_at' => now(),
        ]);

        ActivityLog::create([
            'company_id' => $company->id,
            'user_id' => Auth::id(),
            'action' => 'invoice.cancelled',
            'subject_type' => Invoice::class,
            'subject_id' => $invoice->id,
            'metadata' => ['invoice_number' => $invoice->invoice_number],
            'created_at' => now(),
        ]);

        return back()->with('success', 'Facture annulée avec conservation de la trace d\'audit.');
    }

    /**
     * Generate and download or stream the PDF invoice using Dompdf.
     */
    public function pdf(Request $request, Invoice $invoice): Response
    {
        $company = $this->currentCompany();
        abort_if($invoice->company_id !== $company->id, 403, 'Action non autorisée.');

        $invoice->load(['client', 'items', 'payments', 'quote']);

        // Traitement du logo spécifique à chaque entreprise connectée
        $logoBase64 = null;
        if ($company->logo_path) {
            $relativePath = ltrim(str_replace('/storage/', '', $company->logo_path), '/');
            $disk = Storage::disk('public');
            if ($disk->exists($relativePath)) {
                $fileContent = $disk->get($relativePath);
                if ($fileContent) {
                    $ext = pathinfo($relativePath, PATHINFO_EXTENSION) ?: 'png';
                    $mime = match (strtolower($ext)) {
                        'jpg', 'jpeg' => 'image/jpeg',
                        'svg' => 'image/svg+xml',
                        'webp' => 'image/webp',
                        'gif' => 'image/gif',
                        default => 'image/png',
                    };
                    $logoBase64 = "data:{$mime};base64,".base64_encode($fileContent);
                }
            } elseif (file_exists(public_path($company->logo_path))) {
                $fileContent = file_get_contents(public_path($company->logo_path));
                if ($fileContent) {
                    $ext = pathinfo($company->logo_path, PATHINFO_EXTENSION) ?: 'png';
                    $mime = match (strtolower($ext)) {
                        'jpg', 'jpeg' => 'image/jpeg',
                        'svg' => 'image/svg+xml',
                        'webp' => 'image/webp',
                        'gif' => 'image/gif',
                        default => 'image/png',
                    };
                    $logoBase64 = "data:{$mime};base64,".base64_encode($fileContent);
                }
            }
        }

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'company' => $company,
            'client' => $invoice->client,
            'items' => $invoice->items,
            'logoBase64' => $logoBase64,
        ]);

        $pdf->setPaper('a4', 'portrait');

        $filename = "Facture-{$invoice->invoice_number}.pdf";

        if ($request->boolean('download')) {
            return $pdf->download($filename);
        }

        return $pdf->stream($filename);
    }
}
