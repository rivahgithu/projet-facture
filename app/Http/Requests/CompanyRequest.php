<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            'currency' => ['required', 'string', 'max:10'],
            'payment_terms' => ['required', 'integer', 'min:0', 'max:365'],
            'invoice_prefix' => ['required', 'string', 'max:20'],
            'quote_prefix' => ['required', 'string', 'max:20'],
            'tax_id' => ['nullable', 'string', 'max:100'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:4096'],
        ];
    }
}
