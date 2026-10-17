<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuoteRequest;
use App\Models\ActivityLog;
use App\Models\Invoice;
use App\Models\Quote;
use App\Services\DocumentCalculationService;
use App\Services\DocumentNumberingService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class QuoteController extends Controller
{
    public function __construct(
        protected DocumentCalculationService $calculationService,
        protected DocumentNumberingService $numberingService,
    ) {}

    /**
     * Store a newly created quote.
     */
    public function store(QuoteRequest $request): RedirectResponse
    {
        $company = $this->currentCompany();
        $validated = $request->validated();

        DB::transaction(function () use ($company, $validated) {
            $calculation = $this->calculationService->calculate($validated['items']);
            $quoteNumber = $validated['quote_number'] ?? $this->numberingService->generateQuoteNumber($company);

            $quote = $company->quotes()->create([
                'client_id' => $validated['client_id'],
                'quote_number' => $quoteNumber,
                'status' => $validated['status'] ?? 'brouillon',
                'issue_date' => $validated['issue_date'],
                'valid_until' => $validated['valid_until'] ?? null,
                'currency' => $company->currency,
                'subtotal' => $calculation['subtotal'],
                'discount_total' => $calculation['discount_total'],
                'tax_total' => $calculation['tax_total'],
                'total' => $calculation['total'],
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($calculation['items'] as $item) {
                $quote->items()->create($item);
            }

            ActivityLog::create([
                'company_id' => $company->id,
                'user_id' => auth()->id(),
                'action' => 'quote.created',
                'subject_type' => Quote::class,
                'subject_id' => $quote->id,
                'metadata' => ['quote_number' => $quote->quote_number, 'total' => $quote->total],
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Devis commercial créé avec succès.');
    }

    /**
     * Update the specified quote.
     */
    public function update(QuoteRequest $request, Quote $quote): RedirectResponse
    {
        $company = $this->currentCompany();
        abort_if($quote->company_id !== $company->id, 403, 'Action non autorisée.');

        if ($quote->status === 'converti') {
            return back()->with('error', 'Un devis déjà converti en facture ne peut plus être modifié.');
        }

        $validated = $request->validated();

        DB::transaction(function () use ($quote, $validated) {
            $calculation = $this->calculationService->calculate($validated['items']);

            $quote->update([
                'client_id' => $validated['client_id'],
                'status' => $validated['status'] ?? $quote->status,
                'issue_date' => $validated['issue_date'],
                'valid_until' => $validated['valid_until'] ?? null,
                'subtotal' => $calculation['subtotal'],
                'discount_total' => $calculation['discount_total'],
                'tax_total' => $calculation['tax_total'],
                'total' => $calculation['total'],
                'notes' => $validated['notes'] ?? null,
            ]);

            $quote->items()->delete();
            foreach ($calculation['items'] as $item) {
                $quote->items()->create($item);
            }

            ActivityLog::create([
                'company_id' => $quote->company_id,
                'user_id' => auth()->id(),
                'action' => 'quote.updated',
                'subject_type' => Quote::class,
                'subject_id' => $quote->id,
                'metadata' => ['quote_number' => $quote->quote_number, 'total' => $quote->total],
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Devis mis à jour avec succès.');
    }

    /**
     * Remove the specified quote.
     */
    public function destroy(Quote $quote): RedirectResponse
    {
        $company = $this->currentCompany();
        abort_if($quote->company_id !== $company->id, 403, 'Action non autorisée.');

        if ($quote->status === 'converti') {
            return back()->with('error', 'Un devis converti en facture ne peut pas être supprimé.');
        }

        $quote->delete();

        return back()->with('success', 'Devis supprimé.');
    }

    /**
     * Convert an accepted quote into an invoice (RB-06, RB-13).
     */
    public function convert(Quote $quote): RedirectResponse
    {
        $company = $this->currentCompany();
        abort_if($quote->company_id !== $company->id, 403, 'Action non autorisée.');

        if ($quote->converted_invoice_id !== null) {
            return back()->with('error', 'Ce devis a déjà été converti en facture.');
        }

        DB::transaction(function () use ($company, $quote) {
            $invoiceNumber = $this->numberingService->generateInvoiceNumber($company);

            $dueDate = now()->addDays($company->payment_terms)->toDateString();

            $invoice = $company->invoices()->create([
                'client_id' => $quote->client_id,
                'quote_id' => $quote->id,
                'invoice_number' => $invoiceNumber,
                'document_status' => 'émise',
                'payment_status' => 'non_payée',
                'issue_date' => now()->toDateString(),
                'due_date' => $dueDate,
                'currency' => $company->currency,
                'subtotal' => $quote->subtotal,
                'discount_total' => $quote->discount_total,
                'tax_total' => $quote->tax_total,
                'total' => $quote->total,
                'paid_total' => 0,
                'notes' => $quote->notes ? "Converti depuis le devis {$quote->quote_number}. {$quote->notes}" : "Converti depuis le devis {$quote->quote_number}.",
            ]);

            foreach ($quote->items as $item) {
                $invoice->items()->create([
                    'product_id' => $item->product_id,
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'unit' => $item->unit,
                    'unit_price' => $item->unit_price,
                    'discount_rate' => $item->discount_rate,
                    'tax_rate' => $item->tax_rate,
                    'line_total' => $item->line_total,
                    'position' => $item->position,
                ]);
            }

            $quote->update([
                'status' => 'converti',
                'converted_invoice_id' => $invoice->id,
            ]);

            ActivityLog::create([
                'company_id' => $company->id,
                'user_id' => auth()->id(),
                'action' => 'quote.converted_to_invoice',
                'subject_type' => Quote::class,
                'subject_id' => $quote->id,
                'metadata' => [
                    'quote_number' => $quote->quote_number,
                    'invoice_number' => $invoice->invoice_number,
                ],
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Devis converti en facture avec succès.');
    }

    /**
     * Generate and download or stream the PDF quotation using Dompdf.
     */
    public function pdf(Request $request, Quote $quote): Response
    {
        $company = $this->currentCompany();
        abort_if($quote->company_id !== $company->id, 403, 'Action non autorisée.');

        $quote->load(['client', 'items']);

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

        $pdf = Pdf::loadView('pdf.quote', [
            'quote' => $quote,
            'company' => $company,
            'client' => $quote->client,
            'items' => $quote->items,
            'logoBase64' => $logoBase64,
        ]);

        $pdf->setPaper('a4', 'portrait');

        $filename = "Devis-{$quote->quote_number}.pdf";

        if ($request->boolean('download')) {
            return $pdf->download($filename);
        }

        return $pdf->stream($filename);
    }
}
