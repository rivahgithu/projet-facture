<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\Quote;

class DocumentNumberingService
{
    /**
     * Generate the next unique invoice number for a company.
     */
    public function generateInvoiceNumber(Company $company, ?int $year = null): string
    {
        $year = $year ?? (int) date('Y');
        $prefix = rtrim($company->invoice_prefix ?: 'FAC-', '-');

        $latest = Invoice::where('company_id', $company->id)
            ->where('invoice_number', 'LIKE', "{$prefix}-{$year}-%")
            ->orderBy('id', 'desc')
            ->first();

        $nextSequence = 1;
        if ($latest) {
            $parts = explode('-', $latest->invoice_number);
            $lastNum = (int) end($parts);
            $nextSequence = $lastNum + 1;
        }

        $padded = str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
        $candidate = "{$prefix}-{$year}-{$padded}";

        // Ensure uniqueness
        while (Invoice::where('company_id', $company->id)->where('invoice_number', $candidate)->exists()) {
            $nextSequence++;
            $padded = str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
            $candidate = "{$prefix}-{$year}-{$padded}";
        }

        return $candidate;
    }

    /**
     * Generate the next unique quote number for a company.
     */
    public function generateQuoteNumber(Company $company, ?int $year = null): string
    {
        $year = $year ?? (int) date('Y');
        $prefix = rtrim($company->quote_prefix ?: 'DEV-', '-');

        $latest = Quote::where('company_id', $company->id)
            ->where('quote_number', 'LIKE', "{$prefix}-{$year}-%")
            ->orderBy('id', 'desc')
            ->first();

        $nextSequence = 1;
        if ($latest) {
            $parts = explode('-', $latest->quote_number);
            $lastNum = (int) end($parts);
            $nextSequence = $lastNum + 1;
        }

        $padded = str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
        $candidate = "{$prefix}-{$year}-{$padded}";

        while (Quote::where('company_id', $company->id)->where('quote_number', $candidate)->exists()) {
            $nextSequence++;
            $padded = str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
            $candidate = "{$prefix}-{$year}-{$padded}";
        }

        return $candidate;
    }
}
