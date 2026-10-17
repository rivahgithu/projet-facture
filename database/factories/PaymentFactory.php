<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'company_id' => Company::factory(),
            'amount' => fake()->randomElement([50000, 100000, 200000, 350000]),
            'payment_date' => now()->toDateString(),
            'method' => fake()->randomElement(['espèces', 'virement', 'chèque', 'mobile_money']),
            'reference' => strtoupper(fake()->bothify('REF-####-????')),
            'notes' => fake()->optional()->sentence(),
            'status' => 'valid',
            'recorded_by' => User::factory(),
        ];
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => 'cancelled',
        ]);
    }
}
