<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

abstract class Controller
{
    /**
     * Get the active company for the current authenticated user.
     */
    protected function currentCompany(): Company
    {
        /** @var User|null $user */
        $user = Auth::user();

        if ($user) {
            $company = $user->companies()->first();
            if ($company) {
                return $company;
            }
        }

        return Company::firstOrCreate(
            ['name' => 'Rivah Digital Agency'],
            [
                'legal_name' => 'Rivah Digital SARL',
                'currency' => 'FCFA',
                'payment_terms' => 30,
                'invoice_prefix' => 'FAC-',
                'quote_prefix' => 'DEV-',
                'email' => 'contact@rivah.ci',
                'phone' => '+225 07 00 11 22 33',
                'address' => 'Cocody Riviera Palmeraie, Abidjan, Côte d\'Ivoire',
                'tax_id' => 'CI-ABJ-2024-B-12903',
            ]
        );
    }
}
