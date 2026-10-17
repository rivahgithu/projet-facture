<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Client;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Utilisateur principal
        $user = User::firstOrCreate(
            ['email' => 'contact@rivah.ci'],
            [
                'name' => 'Yves Kouakou',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // 2. Entreprise principale (Rivah Digital Agency)
        $company = Company::firstOrCreate(
            ['name' => 'Rivah Digital Agency'],
            [
                'legal_name' => 'Rivah Digital SARL',
                'email' => 'contact@rivah.ci',
                'phone' => '+225 07 00 11 22 33',
                'address' => 'Cocody Riviera Palmeraie, Abidjan, Côte d\'Ivoire',
                'currency' => 'FCFA',
                'payment_terms' => 30,
                'invoice_prefix' => 'FAC-',
                'quote_prefix' => 'DEV-',
                'tax_id' => 'CI-ABJ-2024-B-12903',
            ]
        );

        // Association utilisateur - entreprise
        $company->users()->syncWithoutDetaching([
            $user->id => ['role' => 'owner'],
        ]);

        // 3. Clients
        $clientsData = [
            [
                'name' => 'M. Amadou Bamba',
                'company_name' => 'Bamba & Associés SARL',
                'email' => 'a.bamba@bamba-associes.ci',
                'phone' => '+225 05 12 34 56 78',
                'address' => 'Plateau, Immeuble Trade Center, Abidjan',
                'tax_id' => 'CI-012345678-A',
            ],
            [
                'name' => 'Dr. Awa Traoré',
                'company_name' => 'Cabinet Dentaire Ivoire',
                'email' => 'contact@dentaire-ivoire.ci',
                'phone' => '+225 07 45 67 89 01',
                'address' => 'Cocody Angré 8ème Tranche, Abidjan',
                'tax_id' => 'CI-098765432-B',
            ],
            [
                'name' => 'Mme Fatou Touré',
                'company_name' => 'TechSavvy Abidjan',
                'email' => 'f.toure@techsavvy.ci',
                'phone' => '+225 01 23 45 67 89',
                'address' => 'Zone 4, Marcory, Abidjan',
                'tax_id' => 'CI-112233445-C',
            ],
            [
                'name' => 'M. Patrick Kouassi',
                'company_name' => 'Boutique Elegance',
                'email' => 'contact@elegance-abidjan.ci',
                'phone' => '+225 05 98 76 54 32',
                'address' => 'Treichville Avenue 8, Abidjan',
                'tax_id' => 'CI-998877665-D',
            ],
            [
                'name' => 'Mme Chantal Yao',
                'company_name' => 'Alpha Consulting',
                'email' => 'c.yao@alphaconsulting.ci',
                'phone' => '+225 07 11 22 44 55',
                'address' => 'Deux Plateaux Vallon, Abidjan',
                'tax_id' => 'CI-554433221-E',
            ],
            [
                'name' => 'M. Stéphane N\'Dri',
                'company_name' => 'Restaurant Le Jardin',
                'email' => 's.ndri@lejardin-abidjan.ci',
                'phone' => '+225 01 99 88 77 66',
                'address' => 'Riviera 3, Abidjan',
                'tax_id' => 'CI-778899001-F',
            ],
        ];

        $clients = [];
        foreach ($clientsData as $c) {
            $clients[] = Client::updateOrCreate(
                ['company_id' => $company->id, 'email' => $c['email']],
                $c
            );
        }

        // 4. Catalogue de Produits & Prestations
        $productsData = [
            [
                'name' => 'Développement Site Web Vitrine',
                'reference' => 'WEB-VITRINE',
                'description' => 'Création d\'un site web vitrine responsive sur-mesure (5 pages, SEO de base, formulaire)',
                'unit' => 'forfait',
                'unit_price' => 350000,
                'tax_rate' => 18.00,
            ],
            [
                'name' => 'Développement Plateforme Web & SaaS',
                'reference' => 'WEB-SAAS',
                'description' => 'Conception application web fullstack Laravel / React avec authentification et tableau de bord',
                'unit' => 'forfait',
                'unit_price' => 1200000,
                'tax_rate' => 18.00,
            ],
            [
                'name' => 'Refonte Identité Visuelle Complète',
                'reference' => 'DESIGN-CHARTE',
                'description' => 'Création de logo vectoriel, charte graphique, cartes de visite et déclinaisons réseaux sociaux',
                'unit' => 'forfait',
                'unit_price' => 250000,
                'tax_rate' => 18.00,
            ],
            [
                'name' => 'Maintenance Technique & Sauvegardes',
                'reference' => 'MAINT-MENSUEL',
                'description' => 'Mise à jour de sécurité mensuelle, monitoring de disponibilité et sauvegardes journalières',
                'unit' => 'mois',
                'unit_price' => 75000,
                'tax_rate' => 18.00,
            ],
            [
                'name' => 'Consultance Technique Senior',
                'reference' => 'CONSULT-JOUR',
                'description' => 'Audit d\'architecture logicielle, optimisation des performances et sécurisation de bases de données',
                'unit' => 'jour',
                'unit_price' => 150000,
                'tax_rate' => 18.00,
            ],
        ];

        $products = [];
        foreach ($productsData as $p) {
            $products[] = Product::updateOrCreate(
                ['company_id' => $company->id, 'reference' => $p['reference']],
                $p
            );
        }

        // 5. Devis
        $quote1 = Quote::updateOrCreate(
            ['company_id' => $company->id, 'quote_number' => 'DEV-2026-001'],
            [
                'client_id' => $clients[0]->id,
                'status' => 'accepté',
                'issue_date' => now()->subDays(15)->toDateString(),
                'valid_until' => now()->addDays(15)->toDateString(),
                'currency' => 'FCFA',
                'subtotal' => 600000,
                'discount_total' => 0,
                'tax_total' => 108000,
                'total' => 708000,
                'notes' => 'Acompte de 50% à la commande, solde à la livraison.',
            ]
        );

        QuoteItem::updateOrCreate(
            ['quote_id' => $quote1->id, 'position' => 1],
            [
                'product_id' => $products[0]->id,
                'description' => $products[0]->description,
                'quantity' => 1,
                'unit' => 'forfait',
                'unit_price' => 350000,
                'discount_rate' => 0,
                'tax_rate' => 18.00,
                'line_total' => 350000,
            ]
        );

        QuoteItem::updateOrCreate(
            ['quote_id' => $quote1->id, 'position' => 2],
            [
                'product_id' => $products[2]->id,
                'description' => $products[2]->description,
                'quantity' => 1,
                'unit' => 'forfait',
                'unit_price' => 250000,
                'discount_rate' => 0,
                'tax_rate' => 18.00,
                'line_total' => 250000,
            ]
        );

        // 6. Factures & Règlements
        // Facture 1: Payée intégralement
        $invoice1 = Invoice::updateOrCreate(
            ['company_id' => $company->id, 'invoice_number' => 'FAC-2026-001'],
            [
                'client_id' => $clients[0]->id,
                'quote_id' => $quote1->id,
                'document_status' => 'émise',
                'payment_status' => 'payée',
                'issue_date' => now()->subDays(12)->toDateString(),
                'due_date' => now()->addDays(18)->toDateString(),
                'currency' => 'FCFA',
                'subtotal' => 600000,
                'discount_total' => 0,
                'tax_total' => 108000,
                'total' => 708000,
                'paid_total' => 708000,
                'notes' => 'Facture acquittée suite au règlement intégral.',
            ]
        );

        $quote1->update([
            'status' => 'converti',
            'converted_invoice_id' => $invoice1->id,
        ]);

        InvoiceItem::updateOrCreate(
            ['invoice_id' => $invoice1->id, 'position' => 1],
            [
                'product_id' => $products[0]->id,
                'description' => $products[0]->description,
                'quantity' => 1,
                'unit' => 'forfait',
                'unit_price' => 350000,
                'discount_rate' => 0,
                'tax_rate' => 18.00,
                'line_total' => 350000,
            ]
        );

        InvoiceItem::updateOrCreate(
            ['invoice_id' => $invoice1->id, 'position' => 2],
            [
                'product_id' => $products[2]->id,
                'description' => $products[2]->description,
                'quantity' => 1,
                'unit' => 'forfait',
                'unit_price' => 250000,
                'discount_rate' => 0,
                'tax_rate' => 18.00,
                'line_total' => 250000,
            ]
        );

        Payment::updateOrCreate(
            ['invoice_id' => $invoice1->id, 'reference' => 'VIR-SGBCI-88219'],
            [
                'company_id' => $company->id,
                'amount' => 708000,
                'payment_date' => now()->subDays(10)->toDateString(),
                'method' => 'virement',
                'notes' => 'Règlement total par virement bancaire SGBCI',
                'status' => 'valid',
                'recorded_by' => $user->id,
            ]
        );

        // Facture 2: Partiellement payée
        $invoice2 = Invoice::updateOrCreate(
            ['company_id' => $company->id, 'invoice_number' => 'FAC-2026-002'],
            [
                'client_id' => $clients[1]->id,
                'document_status' => 'émise',
                'payment_status' => 'partiellement_payée',
                'issue_date' => now()->subDays(8)->toDateString(),
                'due_date' => now()->addDays(22)->toDateString(),
                'currency' => 'FCFA',
                'subtotal' => 1200000,
                'discount_total' => 0,
                'tax_total' => 216000,
                'total' => 1416000,
                'paid_total' => 500000,
                'notes' => 'Acompte de 500 000 FCFA reçu.',
            ]
        );

        InvoiceItem::updateOrCreate(
            ['invoice_id' => $invoice2->id, 'position' => 1],
            [
                'product_id' => $products[1]->id,
                'description' => $products[1]->description,
                'quantity' => 1,
                'unit' => 'forfait',
                'unit_price' => 1200000,
                'discount_rate' => 0,
                'tax_rate' => 18.00,
                'line_total' => 1200000,
            ]
        );

        Payment::updateOrCreate(
            ['invoice_id' => $invoice2->id, 'reference' => 'CHQ-BAC-004491'],
            [
                'company_id' => $company->id,
                'amount' => 500000,
                'payment_date' => now()->subDays(7)->toDateString(),
                'method' => 'chèque',
                'notes' => 'Acompte par chèque bancaire',
                'status' => 'valid',
                'recorded_by' => $user->id,
            ]
        );

        // Facture 3: Non payée en retard
        $invoice3 = Invoice::updateOrCreate(
            ['company_id' => $company->id, 'invoice_number' => 'FAC-2026-003'],
            [
                'client_id' => $clients[2]->id,
                'document_status' => 'émise',
                'payment_status' => 'en_retard',
                'issue_date' => now()->subDays(40)->toDateString(),
                'due_date' => now()->subDays(10)->toDateString(),
                'currency' => 'FCFA',
                'subtotal' => 225000,
                'discount_total' => 0,
                'tax_total' => 40500,
                'total' => 265500,
                'paid_total' => 0,
                'notes' => 'Maintenance 3 mois échue.',
            ]
        );

        InvoiceItem::updateOrCreate(
            ['invoice_id' => $invoice3->id, 'position' => 1],
            [
                'product_id' => $products[3]->id,
                'description' => $products[3]->description,
                'quantity' => 3,
                'unit' => 'mois',
                'unit_price' => 75000,
                'discount_rate' => 0,
                'tax_rate' => 18.00,
                'line_total' => 225000,
            ]
        );

        // 7. Activity Logs
        ActivityLog::create([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'action' => 'company.initialized',
            'subject_type' => Company::class,
            'subject_id' => $company->id,
            'metadata' => ['company' => $company->name],
            'created_at' => now()->subDays(20),
        ]);

        ActivityLog::create([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'action' => 'invoice.created',
            'subject_type' => Invoice::class,
            'subject_id' => $invoice1->id,
            'metadata' => ['invoice_number' => $invoice1->invoice_number, 'amount' => $invoice1->total],
            'created_at' => now()->subDays(12),
        ]);

        ActivityLog::create([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'action' => 'payment.recorded',
            'subject_type' => Payment::class,
            'subject_id' => 1,
            'metadata' => ['invoice_number' => $invoice1->invoice_number, 'amount' => 708000, 'method' => 'virement'],
            'created_at' => now()->subDays(10),
        ]);
    }
}
