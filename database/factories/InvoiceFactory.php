<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Company;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $subtotal = fake()->randomElement([150000, 300000, 600000, 1200000]);
        $taxTotal = round($subtotal * 0.18, 2);
        $total = $subtotal + $taxTotal;

        return [
            'company_id' => Company::factory(),
            'client_id' => Client::factory(),
            'quote_id' => null,
            'invoice_number' => 'FAC-'.date('Y').'-'.fake()->unique()->numerify('####'),
            'document_status' => 'émise',
            'payment_status' => 'non_payée',
            'issue_date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'currency' => 'FCFA',
            'subtotal' => $subtotal,
            'discount_total' => 0,
            'tax_total' => $taxTotal,
            'total' => $total,
            'paid_total' => 0,
            'notes' => 'Paiement à réception par virement bancaire ou chèque.',
            'cancelled_at' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(function (array $attributes) {
            $total = $attributes['total'] ?? 354000;

            return [
                'payment_status' => 'payée',
                'paid_total' => $total,
            ];
        });
    }

    public function partiallyPaid(float $paidAmount = 100000): static
    {
        return $this->state(fn () => [
            'payment_status' => 'partiellement_payée',
            'paid_total' => $paidAmount,
        ]);
    }
}
