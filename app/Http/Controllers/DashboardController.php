<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the main commercial management dashboard.
     */
    public function index(Request $request): Response
    {
        $company = $this->currentCompany();

        $clients = Client::where('company_id', $company->id)
            ->with(['invoices'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Client $client) {
                $totalInvoiced = (float) $client->invoices->where('document_status', '!=', 'annulée')->sum('total');
                $totalPaid = (float) $client->invoices->where('document_status', '!=', 'annulée')->sum('paid_total');

                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'company_name' => $client->company_name,
                    'email' => $client->email ?? '',
                    'phone' => $client->phone ?? '',
                    'address' => $client->address ?? '',
                    'tax_id' => $client->tax_id,
                    'notes' => $client->notes,
                    'is_archived' => $client->is_archived,
                    'created_at' => $client->created_at->format('Y-m-d'),
                    'total_invoiced' => $totalInvoiced,
                    'total_paid' => $totalPaid,
                    'balance_due' => max(0, $totalInvoiced - $totalPaid),
                ];
            });

        $products = Product::where('company_id', $company->id)
            ->whereNull('archived_at')
            ->orderBy('name')
            ->get()
            ->map(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'reference' => $p->reference,
                'description' => $p->description ?? '',
                'unit' => $p->unit,
                'unit_price' => (float) $p->unit_price,
                'tax_rate' => (float) $p->tax_rate,
                'is_active' => $p->is_active,
            ]);

        $quotes = Quote::where('company_id', $company->id)
            ->with(['client', 'items'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Quote $q) => [
                'id' => $q->id,
                'quote_number' => $q->quote_number,
                'client_id' => $q->client_id,
                'client_name' => $q->client->name ?? 'Client inconnu',
                'status' => $q->status,
                'issue_date' => $q->issue_date->format('Y-m-d'),
                'valid_until' => $q->valid_until ? $q->valid_until->format('Y-m-d') : '',
                'currency' => $q->currency,
                'subtotal' => (float) $q->subtotal,
                'discount_total' => (float) $q->discount_total,
                'tax_total' => (float) $q->tax_total,
                'total' => (float) $q->total,
                'notes' => $q->notes,
                'converted_invoice_id' => $q->converted_invoice_id,
                'items' => $q->items->map(fn ($item) => [
                    'id' => (string) $item->id,
                    'product_id' => $item->product_id,
                    'description' => $item->description,
                    'quantity' => (float) $item->quantity,
                    'unit' => $item->unit ?? 'prestation',
                    'unit_price' => (float) $item->unit_price,
                    'discount_rate' => (float) $item->discount_rate,
                    'tax_rate' => (float) $item->tax_rate,
                    'line_total' => (float) $item->line_total,
                ]),
            ]);

        $invoices = Invoice::where('company_id', $company->id)
            ->with(['client', 'items', 'payments.recordedBy'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Invoice $inv) => [
                'id' => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'client_id' => $inv->client_id,
                'client_name' => $inv->client->name ?? 'Client inconnu',
                'client_email' => $inv->client->email ?? '',
                'client_address' => $inv->client->address ?? '',
                'quote_id' => $inv->quote_id,
                'document_status' => $inv->document_status,
                'payment_status' => $inv->payment_status,
                'issue_date' => $inv->issue_date->format('Y-m-d'),
                'due_date' => $inv->due_date ? $inv->due_date->format('Y-m-d') : '',
                'currency' => $inv->currency,
                'subtotal' => (float) $inv->subtotal,
                'discount_total' => (float) $inv->discount_total,
                'tax_total' => (float) $inv->tax_total,
                'total' => (float) $inv->total,
                'amount_paid' => (float) $inv->paid_total,
                'balance_due' => (float) $inv->balance_due,
                'notes' => $inv->notes,
                'items' => $inv->items->map(fn ($item) => [
                    'id' => (string) $item->id,
                    'product_id' => $item->product_id,
                    'description' => $item->description,
                    'quantity' => (float) $item->quantity,
                    'unit' => $item->unit ?? 'prestation',
                    'unit_price' => (float) $item->unit_price,
                    'discount_rate' => (float) $item->discount_rate,
                    'tax_rate' => (float) $item->tax_rate,
                    'line_total' => (float) $item->line_total,
                ]),
                'payments' => $inv->payments->where('status', 'valid')->map(fn ($p) => [
                    'id' => $p->id,
                    'invoice_id' => $p->invoice_id,
                    'amount' => (float) $p->amount,
                    'payment_date' => $p->payment_date->format('Y-m-d'),
                    'method' => $p->method,
                    'reference' => $p->reference,
                    'notes' => $p->notes,
                    'recorded_by' => $p->recordedBy->name ?? 'Utilisateur',
                ])->values(),
            ]);

        /** @var User|null $user */
        $user = Auth::user();

        return Inertia::render('AppDashboard', [
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ] : null,
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'legal_name' => $company->legal_name,
                'email' => $company->email ?? '',
                'phone' => $company->phone ?? '',
                'address' => $company->address ?? '',
                'logo_url' => $company->logo_path ? (str_starts_with($company->logo_path, 'http') || str_starts_with($company->logo_path, '/storage/') ? $company->logo_path : '/storage/'.ltrim($company->logo_path, '/')) : null,
                'currency' => $company->currency,
                'payment_terms' => $company->payment_terms,
                'invoice_prefix' => $company->invoice_prefix,
                'quote_prefix' => $company->quote_prefix,
                'tax_id' => $company->tax_id,
            ],
            'clients' => $clients,
            'products' => $products,
            'quotes' => $quotes,
            'invoices' => $invoices,
            'initialTab' => (string) $request->query('tab', 'dashboard'),
        ]);
    }
}
