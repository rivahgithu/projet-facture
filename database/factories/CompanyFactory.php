<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Company>
 */
class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'legal_name' => fake()->company().' SARL',
            'email' => fake()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'logo_path' => null,
            'currency' => 'FCFA',
            'payment_terms' => 30,
            'invoice_prefix' => 'FACT-',
            'quote_prefix' => 'DEV-',
            'tax_id' => 'CI-ABJ-'.fake()->numerify('####-####'),
        ];
    }
}
