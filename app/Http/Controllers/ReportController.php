<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Export company invoices to a safe CSV file.
     */
    public function exportInvoicesCsv(): StreamedResponse
    {
        $company = $this->currentCompany();

        $invoices = Invoice::where('company_id', $company->id)
            ->with(['client'])
            ->orderBy('issue_date', 'desc')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="factures_'.date('Y-m-d').'.csv"',
        ];

        return response()->stream(function () use ($invoices) {
            $handle = fopen('php://output', 'w');
            // BOM UTF-8 for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, [
                'N° Facture',
                'Client',
                'Date émission',
                'Échéance',
                'Statut Document',
                'Statut Paiement',
                'Sous-total HT',
                'TVA',
                'Total TTC',
                'Montant Encaissé',
                'Solde Dû',
            ], ';');

            foreach ($invoices as $inv) {
                fputcsv($handle, [
                    $this->escapeCsvFormula($inv->invoice_number),
                    $this->escapeCsvFormula($inv->client->name ?? ''),
                    $inv->issue_date->format('Y-m-d'),
                    $inv->due_date ? $inv->due_date->format('Y-m-d') : '',
                    $inv->document_status,
                    $inv->payment_status,
                    number_format((float) $inv->subtotal, 0, ',', ' ').' FCFA',
                    number_format((float) $inv->tax_total, 0, ',', ' ').' FCFA',
                    number_format((float) $inv->total, 0, ',', ' ').' FCFA',
                    number_format((float) $inv->paid_total, 0, ',', ' ').' FCFA',
                    number_format((float) $inv->balance_due, 0, ',', ' ').' FCFA',
                ], ';');
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Escape strings starting with =, +, -, @ to prevent CSV formula injection.
     */
    private function escapeCsvFormula(string $value): string
    {
        if (in_array(substr($value, 0, 1), ['=', '+', '-', '@', "\t", "\r"])) {
            return "'".$value;
        }

        return $value;
    }
}
