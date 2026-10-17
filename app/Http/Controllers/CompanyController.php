<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompanyRequest;
use Illuminate\Http\RedirectResponse;

class CompanyController extends Controller
{
    /**
     * Update the company settings.
     */
    public function update(CompanyRequest $request): RedirectResponse
    {
        $company = $this->currentCompany();
        $validated = $request->validated();

        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $request->file('logo')->store('logos', 'public');
        }

        $company->update($validated);

        return back()->with('success', 'Paramètres de l\'entreprise mis à jour avec succès.');
    }
}
