<?php

namespace App\Services;

class DocumentCalculationService
{
    /**
     * Calculate financial totals for document items (quotes or invoices).
     *
     * @param  array<int, array<string, mixed>>  $rawItems
     * @return array{
     *     items: array<int, array<string, mixed>>,
     *     subtotal: float,
     *     discount_total: float,
     *     tax_total: float,
     *     total: float
     * }
     */
    public function calculate(array $rawItems): array
    {
        $calculatedItems = [];
        $subtotal = 0.0;
        $discountTotal = 0.0;
        $taxTotal = 0.0;

        foreach ($rawItems as $index => $item) {
            $quantity = max(0.01, (float) ($item['quantity'] ?? 1));
            $unitPrice = max(0.0, (float) ($item['unit_price'] ?? 0));
            $discountRate = max(0.0, min(100.0, (float) ($item['discount_rate'] ?? 0)));
            $taxRate = max(0.0, min(100.0, (float) ($item['tax_rate'] ?? 0)));

            $lineGross = round($quantity * $unitPrice, 2);
            $lineDiscount = round($lineGross * ($discountRate / 100), 2);
            $lineNetHt = round($lineGross - $lineDiscount, 2);
            $lineTax = round($lineNetHt * ($taxRate / 100), 2);

            $subtotal += $lineGross;
            $discountTotal += $lineDiscount;
            $taxTotal += $lineTax;

            $calculatedItems[] = [
                'product_id' => ! empty($item['product_id']) ? (int) $item['product_id'] : null,
                'description' => (string) ($item['description'] ?? 'Prestation'),
                'quantity' => $quantity,
                'unit' => ! empty($item['unit']) ? (string) $item['unit'] : 'prestation',
                'unit_price' => $unitPrice,
                'discount_rate' => $discountRate,
                'tax_rate' => $taxRate,
                'line_total' => $lineGross,
                'position' => (int) ($item['position'] ?? ($index + 1)),
            ];
        }

        $total = max(0.0, round($subtotal - $discountTotal + $taxTotal, 2));

        return [
            'items' => $calculatedItems,
            'subtotal' => round($subtotal, 2),
            'discount_total' => round($discountTotal, 2),
            'tax_total' => round($taxTotal, 2),
            'total' => $total,
        ];
    }
}
