<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'name' => fake()->words(3, true),
            'reference' => strtoupper(fake()->bothify('PRD-###')),
            'description' => fake()->sentence(),
            'unit' => fake()->randomElement(['prestation', 'jour', 'heure', 'forfait', 'unité']),
            'unit_price' => fake()->randomElement([25000, 50000, 75000, 150000, 300000, 500000]),
            'tax_rate' => 18.00,
            'is_active' => true,
            'archived_at' => null,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'is_active' => false,
        ]);
    }
}
