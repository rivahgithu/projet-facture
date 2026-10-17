<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentRequest;
use App\Models\ActivityLog;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class InvoicePaymentController extends Controller
{
    /**
     * Record a payment directly from the invoice details modal (4.7, RB-08).
     */
    public function store(PaymentRequest $request, Invoice $invoice): RedirectResponse
    {
        $company = $this->currentCompany();
        abort_if($invoice->company_id !== $company->id, 403, 'Action non autorisée.');

        if ($invoice->document_status === 'annulée') {
            return back()->with('error', 'Impossible d\'enregistrer un règlement sur une facture annulée.');
        }

        $validated = $request->validated();
        $paymentAmount = (float) $validated['amount'];
        $currentBalance = (float) $invoice->balance_due;

        // Validation RB-08: Refuser un montant supérieur au solde restant
        if ($paymentAmount > $currentBalance) {
            return back()->with('error', "Le montant ({$paymentAmount} FCFA) dépasse le solde restant dû ({$currentBalance} FCFA).");
        }

        DB::transaction(function () use ($company, $invoice, $validated, $paymentAmount) {
            $payment = $invoice->payments()->create([
                'company_id' => $company->id,
                'amount' => $paymentAmount,
                'payment_date' => $validated['payment_date'],
                'method' => $validated['method'],
                'reference' => $validated['reference'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'valid',
                'recorded_by' => auth()->id(),
            ]);

            $newPaidTotal = round((float) $invoice->paid_total + $paymentAmount, 2);
            $newBalance = max(0, round((float) $invoice->total - $newPaidTotal, 2));

            $paymentStatus = $newBalance <= 0 ? 'payée' : 'partiellement_payée';

            $invoice->update([
                'paid_total' => $newPaidTotal,
                'payment_status' => $paymentStatus,
            ]);

            ActivityLog::create([
                'company_id' => $company->id,
                'user_id' => auth()->id(),
                'action' => 'payment.recorded',
                'subject_type' => Payment::class,
                'subject_id' => $payment->id,
                'metadata' => [
                    'invoice_number' => $invoice->invoice_number,
                    'amount' => $paymentAmount,
                    'method' => $validated['method'],
                ],
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Règlement enregistré avec succès.');
    }

    /**
     * Cancel an existing payment with audit trail (4.7).
     */
    public function destroy(Invoice $invoice, Payment $payment): RedirectResponse
    {
        $company = $this->currentCompany();
        abort_if($invoice->company_id !== $company->id || $payment->company_id !== $company->id, 403, 'Action non autorisée.');

        if ($payment->status === 'cancelled') {
            return back()->with('error', 'Ce règlement est déjà annulé.');
        }

        DB::transaction(function () use ($company, $invoice, $payment) {
            $payment->update(['status' => 'cancelled']);

            $newPaidTotal = max(0, round((float) $invoice->paid_total - (float) $payment->amount, 2));
            $newBalance = max(0, round((float) $invoice->total - $newPaidTotal, 2));

            $paymentStatus = 'non_payée';
            if ($newPaidTotal > 0) {
                $paymentStatus = $newBalance <= 0 ? 'payée' : 'partiellement_payée';
            }

            $invoice->update([
                'paid_total' => $newPaidTotal,
                'payment_status' => $paymentStatus,
            ]);

            ActivityLog::create([
                'company_id' => $company->id,
                'user_id' => auth()->id(),
                'action' => 'payment.cancelled',
                'subject_type' => Payment::class,
                'subject_id' => $payment->id,
                'metadata' => [
                    'invoice_number' => $invoice->invoice_number,
                    'amount' => $payment->amount,
                ],
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Règlement annulé et solde actualisé.');
    }
}
