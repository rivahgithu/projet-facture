<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;

class ProductController extends Controller
{
    /**
     * Store a newly created product/service in catalog.
     */
    public function store(ProductRequest $request): RedirectResponse
    {
        $company = $this->currentCompany();

        $company->products()->create($request->validated());

        return back()->with('success', 'Prestation ajoutée au catalogue.');
    }

    /**
     * Update the specified product.
     */
    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $company = $this->currentCompany();

        abort_if($product->company_id !== $company->id, 403, 'Action non autorisée.');

        $product->update($request->validated());

        return back()->with('success', 'Prestation mise à jour.');
    }

    /**
     * Archive the specified product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $company = $this->currentCompany();

        abort_if($product->company_id !== $company->id, 403, 'Action non autorisée.');

        $product->update(['archived_at' => now()]);

        return back()->with('success', 'Prestation archivée.');
    }
}
