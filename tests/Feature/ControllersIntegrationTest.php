<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ControllersIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->company = Company::factory()->create([
            'currency' => 'FCFA',
            'payment_terms' => 30,
            'invoice_prefix' => 'FAC-',
            'quote_prefix' => 'DEV-',
        ]);
        $this->company->users()->attach($this->user->id, ['role' => 'owner']);
    }

    public function test_auth_registration_and_login_flow(): void
    {
        $response = $this->post('/register', [
            'name' => 'Kouassi Jean',
            'company_name' => 'Kouassi Digital',
            'email' => 'jean@kouassi.ci',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['email' => 'jean@kouassi.ci']);
        $this->assertDatabaseHas('companies', ['name' => 'Kouassi Digital']);
    }

    public function test_auth_registration_with_company_logo(): void
    {
        $disk = Storage::fake('public');

        $file = UploadedFile::fake()->image('my-logo.png', 200, 200);

        $response = $this->post('/register', [
            'name' => 'Aya Toure',
            'company_name' => 'Aya Consulting',
            'email' => 'aya@consulting.ci',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'logo' => $file,
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();

        $company = Company::where('name', 'Aya Consulting')->first();
        $this->assertNotNull($company);
        $this->assertNotNull($company->logo_path);
        $disk->assertExists($company->logo_path);
    }

    public function test_dashboard_renders_with_company_data(): void
    {
        $response = $this->actingAs($this->user)->get('/dashboard');

        $response->assertOk();
    }

    public function test_unauthenticated_user_is_redirected_to_login(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_logout_redirects_to_welcome_and_revokes_access(): void
    {
        $response = $this->actingAs($this->user)->post('/logout');

        $response->assertRedirect('/');
        $this->assertGuest();

        $dashboardResponse = $this->get('/dashboard');
        $dashboardResponse->assertRedirect('/login');
    }

    public function test_client_crud_operations(): void
    {
        $response = $this->actingAs($this->user)->post('/clients', [
            'name' => 'Nouveau Client SARL',
            'email' => 'client@sarl.ci',
            'phone' => '+225 0102030405',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('clients', ['name' => 'Nouveau Client SARL', 'company_id' => $this->company->id]);

        $client = Client::where('email', 'client@sarl.ci')->first();

        $this->actingAs($this->user)->put("/clients/{$client->id}", [
            'name' => 'Client Modifié SARL',
        ]);
        $this->assertEquals('Client Modifié SARL', $client->fresh()->name);

        // Soft archive
        $this->actingAs($this->user)->delete("/clients/{$client->id}");
        $this->assertNotNull($client->fresh()->archived_at);
    }

    public function test_product_crud_operations(): void
    {
        $response = $this->actingAs($this->user)->post('/products', [
            'name' => 'Audit Sécurité',
            'unit_price' => 250000,
            'tax_rate' => 18,
            'unit' => 'forfait',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('products', ['name' => 'Audit Sécurité', 'company_id' => $this->company->id]);

        $product = Product::where('name', 'Audit Sécurité')->first();

        $this->actingAs($this->user)->put("/products/{$product->id}", [
            'name' => 'Audit Sécurité & Performance',
            'unit_price' => 300000,
        ]);
        $this->assertEquals('Audit Sécurité & Performance', $product->fresh()->name);

        $this->actingAs($this->user)->delete("/products/{$product->id}");
        $this->assertNotNull($product->fresh()->archived_at);
    }

    public function test_quote_creation_calculation_and_conversion(): void
    {
        $client = Client::factory()->for($this->company)->create();
        $product = Product::factory()->for($this->company)->create([
            'unit_price' => 100000,
            'tax_rate' => 18,
        ]);

        $response = $this->actingAs($this->user)->post('/quotes', [
            'client_id' => $client->id,
            'issue_date' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => $product->id,
                    'description' => 'Développement spécifique',
                    'quantity' => 2,
                    'unit' => 'prestation',
                    'unit_price' => 100000,
                    'discount_rate' => 10,
                    'tax_rate' => 18,
                ],
            ],
        ]);

        $response->assertSessionHas('success');

        $quote = Quote::where('client_id', $client->id)->first();
        $this->assertNotNull($quote);
        // Quantity 2 * 100000 = 200 000 subtotal
        // Discount 10% = 20 000
        // Net = 180 000
        // Tax 18% = 32 400
        // Total = 212 400
        $this->assertEquals(200000, (float) $quote->subtotal);
        $this->assertEquals(20000, (float) $quote->discount_total);
        $this->assertEquals(32400, (float) $quote->tax_total);
        $this->assertEquals(212400, (float) $quote->total);

        // Convert quote to invoice
        $this->actingAs($this->user)->post("/quotes/{$quote->id}/convert");

        $this->assertEquals('converti', $quote->fresh()->status);
        $this->assertNotNull($quote->fresh()->converted_invoice_id);

        $invoice = Invoice::find($quote->fresh()->converted_invoice_id);
        $this->assertNotNull($invoice);
        $this->assertEquals(212400, (float) $invoice->total);
        $this->assertEquals('émise', $invoice->document_status);
    }

    public function test_quote_pdf_generation(): void
    {
        $client = Client::factory()->for($this->company)->create([
            'name' => 'Kouassi Kouassi',
            'address' => 'Bouaké',
            'email' => 'kouassi@gmail.com',
            'phone' => '0100089089',
        ]);

        $quote = Quote::factory()->for($this->company)->for($client)->create([
            'quote_number' => 'DEV-2026-796',
            'status' => 'converti',
            'issue_date' => now()->toDateString(),
            'valid_until' => now()->addDays(7)->toDateString(),
            'subtotal' => 250000,
            'tax_total' => 45000,
            'total' => 295000,
        ]);

        $quote->items()->create([
            'description' => 'Développement web',
            'quantity' => 1,
            'unit' => 'Projet',
            'unit_price' => 250000,
            'tax_rate' => 18,
            'line_total' => 250000,
            'position' => 0,
        ]);

        $response = $this->actingAs($this->user)->get("/quotes/{$quote->id}/pdf");
        $response->assertOk();
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));

        $downloadResponse = $this->actingAs($this->user)->get("/quotes/{$quote->id}/pdf?download=1");
        $downloadResponse->assertOk();
        $this->assertEquals('application/pdf', $downloadResponse->headers->get('content-type'));
        $this->assertTrue(str_contains((string) $downloadResponse->headers->get('content-disposition'), 'attachment'));
    }

    public function test_invoice_pdf_generation_with_dompdf(): void
    {
        $client = Client::factory()->for($this->company)->create([
            'name' => 'Kouassi Kouassi',
            'company_name' => 'Kouassi sarl',
            'address' => 'Bouaké',
            'email' => 'kouassi@gmail.com',
            'phone' => '0100089089',
        ]);

        $invoice = Invoice::factory()->for($this->company)->for($client)->create([
            'invoice_number' => 'FAC-2026-796',
            'document_status' => 'émise',
            'payment_status' => 'non_payée',
            'issue_date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'subtotal' => 250000,
            'tax_total' => 45000,
            'total' => 295000,
            'paid_total' => 0,
        ]);

        $invoice->items()->create([
            'description' => 'Développement web',
            'quantity' => 1,
            'unit' => 'Projet',
            'unit_price' => 250000,
            'tax_rate' => 18,
            'line_total' => 250000,
            'position' => 0,
        ]);

        // Stream PDF
        $response = $this->actingAs($this->user)->get("/invoices/{$invoice->id}/pdf");
        $response->assertOk();
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));

        // Téléchargement PDF
        $downloadResponse = $this->actingAs($this->user)->get("/invoices/{$invoice->id}/pdf?download=1");
        $downloadResponse->assertOk();
        $this->assertEquals('application/pdf', $downloadResponse->headers->get('content-type'));
        $this->assertTrue(str_contains((string) $downloadResponse->headers->get('content-disposition'), 'attachment'));
        $this->assertTrue(str_contains((string) $downloadResponse->headers->get('content-disposition'), 'Facture-FAC-2026-796.pdf'));

        // Test avec le logo personnalisé de l'entreprise
        $disk = Storage::fake('public');
        $fakeLogo = UploadedFile::fake()->image('custom_company_logo.png', 120, 40);
        $logoPath = $fakeLogo->store('logos', 'public');
        $this->company->update(['logo_path' => $logoPath]);

        $logoResponse = $this->actingAs($this->user)->get("/invoices/{$invoice->id}/pdf");
        $logoResponse->assertOk();
        $this->assertEquals('application/pdf', $logoResponse->headers->get('content-type'));

        // Isolation des données (autre entreprise => 403)
        $otherCompany = Company::factory()->create();
        $otherUser = User::factory()->create();
        $otherCompany->users()->attach($otherUser->id, ['role' => 'owner']);

        $forbiddenResponse = $this->actingAs($otherUser)->get("/invoices/{$invoice->id}/pdf");
        $forbiddenResponse->assertForbidden();
    }

    public function test_invoice_creation_and_payment_management(): void
    {
        $client = Client::factory()->for($this->company)->create();

        $this->actingAs($this->user)->post('/invoices', [
            'client_id' => $client->id,
            'issue_date' => now()->toDateString(),
            'items' => [
                [
                    'description' => 'Prestation de conseil',
                    'quantity' => 1,
                    'unit_price' => 100000,
                    'discount_rate' => 0,
                    'tax_rate' => 18,
                ],
            ],
        ]);

        $invoice = Invoice::where('client_id', $client->id)->first();
        $this->assertNotNull($invoice);
        $this->assertEquals(118000, (float) $invoice->total);
        $this->assertEquals(118000, (float) $invoice->balance_due);

        // Enregistrer un acompte
        $payResponse = $this->actingAs($this->user)->post("/invoices/{$invoice->id}/payments", [
            'amount' => 50000,
            'payment_date' => now()->toDateString(),
            'method' => 'virement',
            'reference' => 'VIR-SGBCI-1234',
        ]);
        $payResponse->assertSessionHas('success');

        $this->assertEquals(50000, (float) $invoice->fresh()->paid_total);
        $this->assertEquals(68000, (float) $invoice->fresh()->balance_due);
        $this->assertEquals('partiellement_payée', $invoice->fresh()->payment_status);

        // Tentative de paiement excédant le solde restant (RB-08) -> doit échouer
        $excessResponse = $this->actingAs($this->user)->post("/invoices/{$invoice->id}/payments", [
            'amount' => 100000,
            'payment_date' => now()->toDateString(),
            'method' => 'espèces',
        ]);
        $excessResponse->assertSessionHas('error');

        // Régler le solde exact
        $this->actingAs($this->user)->post("/invoices/{$invoice->id}/payments", [
            'amount' => 68000,
            'payment_date' => now()->toDateString(),
            'method' => 'espèces',
        ]);
        $this->assertEquals(0, (float) $invoice->fresh()->balance_due);
        $this->assertEquals('payée', $invoice->fresh()->payment_status);

        // Annuler le dernier paiement
        $payment = $invoice->fresh()->payments->first();
        $this->actingAs($this->user)->delete("/invoices/{$invoice->id}/payments/{$payment->id}");
        $this->assertEquals('cancelled', $payment->fresh()->status);
        $this->assertGreaterThan(0, (float) $invoice->fresh()->balance_due);
    }

    public function test_reports_csv_export(): void
    {
        $response = $this->actingAs($this->user)->get('/reports/export-csv');

        $response->assertOk();
        $this->assertTrue(str_contains($response->headers->get('content-type'), 'text/csv'));
    }
}
