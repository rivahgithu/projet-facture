<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'name' => fake()->name(),
            'company_name' => fake()->optional()->company(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'tax_id' => fake()->optional()->numerify('CI-###-####'),
            'notes' => fake()->optional()->sentence(),
            'archived_at' => null,
        ];
    }

    public function archived(): static
    {
        return $this->state(fn () => [
            'archived_at' => now(),
        ]);
    }
}
