<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;

class ClientController extends Controller
{
    /**
     * Store a newly created client.
     */
    public function store(ClientRequest $request): RedirectResponse
    {
        $company = $this->currentCompany();

        $company->clients()->create($request->validated());

        return back()->with('success', 'Client créé avec succès.');
    }

    /**
     * Update the specified client.
     */
    public function update(ClientRequest $request, Client $client): RedirectResponse
    {
        $company = $this->currentCompany();

        abort_if($client->company_id !== $company->id, 403, 'Action non autorisée.');

        $client->update($request->validated());

        return back()->with('success', 'Client mis à jour avec succès.');
    }

    /**
     * Archive the specified client (soft delete to preserve billing history).
     */
    public function destroy(Client $client): RedirectResponse
    {
        $company = $this->currentCompany();

        abort_if($client->company_id !== $company->id, 403, 'Action non autorisée.');

        $client->update(['archived_at' => now()]);

        return back()->with('success', 'Client archivé avec succès.');
    }
}
