<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Company;
use App\Models\Quote;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Quote>
 */
class QuoteFactory extends Factory
{
    protected $model = Quote::class;

    public function definition(): array
    {
        $subtotal = fake()->randomElement([100000, 250000, 500000, 1000000]);
        $taxTotal = round($subtotal * 0.18, 2);
        $total = $subtotal + $taxTotal;

        return [
            'company_id' => Company::factory(),
            'client_id' => Client::factory(),
            'quote_number' => 'DEV-'.date('Y').'-'.fake()->unique()->numerify('####'),
            'status' => 'brouillon',
            'issue_date' => now()->toDateString(),
            'valid_until' => now()->addDays(30)->toDateString(),
            'currency' => 'FCFA',
            'subtotal' => $subtotal,
            'discount_total' => 0,
            'tax_total' => $taxTotal,
            'total' => $total,
            'notes' => 'Devis valable 30 jours à compter de la date d\'émission.',
            'converted_invoice_id' => null,
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn () => [
            'status' => 'accepté',
        ]);
    }

    public function converted(): static
    {
        return $this->state(fn () => [
            'status' => 'converti',
        ]);
    }
}
