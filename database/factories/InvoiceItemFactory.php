<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvoiceItem>
 */
class InvoiceItemFactory extends Factory
{
    protected $model = InvoiceItem::class;

    public function definition(): array
    {
        $unitPrice = fake()->randomElement([50000, 100000, 250000]);
        $qty = fake()->numberBetween(1, 4);
        $total = $unitPrice * $qty;

        return [
            'invoice_id' => Invoice::factory(),
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
