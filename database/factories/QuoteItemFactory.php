<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuoteItem>
 */
class QuoteItemFactory extends Factory
{
    protected $model = QuoteItem::class;

    public function definition(): array
    {
        $unitPrice = fake()->randomElement([50000, 100000, 200000]);
        $qty = fake()->numberBetween(1, 5);
        $total = $unitPrice * $qty;

        return [
            'quote_id' => Quote::factory(),
            'product_id' => Product::factory(),
            'description' => fake()->sentence(4),
            'quantity' => $qty,
            'unit' => 'prestation',
            'unit_price' => $unitPrice,
            'discount_rate' => 0,
            'tax_rate' => 18.00,
            'line_total' => $total,
            'position' => 1,
        ];
    }
}
