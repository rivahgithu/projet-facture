<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Client;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelRelationshipsTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_has_users_clients_and_products(): void
    {
        $user = User::factory()->create();
        $company = Company::factory()->create();
        $company->users()->attach($user->id, ['role' => 'owner']);

        $client = Client::factory()->for($company)->create(['name' => 'Rivah Client']);
        $product = Product::factory()->for($company)->create(['name' => 'Conception Web', 'unit_price' => 200000]);

        $this->assertCount(1, $company->users);
        $this->assertEquals($user->id, $company->users->first()->id);
        $this->assertEquals('owner', $company->users->first()->pivot->role);

        $this->assertCount(1, $company->clients);
        $this->assertEquals('Rivah Client', $company->clients->first()->name);

        $this->assertCount(1, $company->products);
        $this->assertEquals('200000.00', $company->products->first()->unit_price);
    }

    public function test_quote_can_have_items_and_convert_to_invoice(): void
    {
        $company = Company::factory()->create();
        $client = Client::factory()->for($company)->create();
        $product = Product::factory()->for($company)->create();

        $quote = Quote::factory()->for($company)->for($client)->create([
            'quote_number' => 'DEV-2026-0001',
            'status' => 'accepté',
            'subtotal' => 100000,
            'tax_total' => 18000,
            'total' => 118000,
        ]);

        $item = QuoteItem::factory()->for($quote)->for($product)->create([
            'description' => 'Site Vitrine',
            'quantity' => 1,
            'unit_price' => 100000,
            'line_total' => 100000,
        ]);

        $this->assertCount(1, $quote->items);
        $this->assertEquals('Site Vitrine', $quote->items->first()->description);

        // Convert quote to invoice
        $invoice = Invoice::factory()->for($company)->for($client)->create([
            'quote_id' => $quote->id,
            'invoice_number' => 'FAC-2026-0001',
            'subtotal' => 100000,
            'tax_total' => 18000,
            'total' => 118000,
            'paid_total' => 0,
        ]);

        $quote->update([
            'status' => 'converti',
            'converted_invoice_id' => $invoice->id,
        ]);

        $this->assertEquals('converti', $quote->status);
        $this->assertEquals($invoice->id, $quote->convertedInvoice->id);
        $this->assertEquals($quote->id, $invoice->quote->id);
    }

    public function test_invoice_payments_and_balance_due_calculation(): void
    {
        $user = User::factory()->create();
        $company = Company::factory()->create();
        $client = Client::factory()->for($company)->create();

        $invoice = Invoice::factory()->for($company)->for($client)->create([
            'invoice_number' => 'FAC-2026-0002',
            'document_status' => 'émise',
            'payment_status' => 'non_payée',
            'total' => 300000,
            'paid_total' => 0,
        ]);

        $this->assertEquals(300000, $invoice->balance_due);

        // Enregistrer un acompte
        $payment1 = Payment::factory()->for($invoice)->for($company)->create([
            'amount' => 100000,
            'method' => 'virement',
            'status' => 'valid',
            'recorded_by' => $user->id,
        ]);

        $invoice->update([
            'paid_total' => 100000,
            'payment_status' => 'partiellement_payée',
        ]);

        $this->assertCount(1, $invoice->fresh()->payments);
        $this->assertEquals(200000, $invoice->fresh()->balance_due);
        $this->assertEquals($user->id, $payment1->recordedBy->id);

        // Enregistrer le solde
        Payment::factory()->for($invoice)->for($company)->create([
            'amount' => 200000,
            'method' => 'espèces',
            'status' => 'valid',
            'recorded_by' => $user->id,
        ]);

        $invoice->update([
            'paid_total' => 300000,
            'payment_status' => 'payée',
        ]);

        $this->assertCount(2, $invoice->fresh()->payments);
        $this->assertEquals(0, $invoice->fresh()->balance_due);
        $this->assertEquals('payée', $invoice->fresh()->payment_status);
    }

    public function test_activity_log_polymorphic_relation(): void
    {
        $user = User::factory()->create();
        $company = Company::factory()->create();
        $invoice = Invoice::factory()->for($company)->create();

        $log = ActivityLog::create([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'action' => 'invoice.issued',
            'subject_type' => Invoice::class,
            'subject_id' => $invoice->id,
            'metadata' => ['invoice_number' => $invoice->invoice_number, 'amount' => $invoice->total],
            'created_at' => now(),
        ]);

        $this->assertEquals($invoice->id, $log->subject->id);
        $this->assertEquals($user->id, $log->user->id);
        $this->assertEquals($invoice->invoice_number, $log->metadata['invoice_number']);
    }
}
