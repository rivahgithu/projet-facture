<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoicePaymentController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\ReportController;
use App\Mail\ContactMessageMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes - Rivah Facture
|--------------------------------------------------------------------------
*/

// Page d'accueil publique
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

Route::post('/contact', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255',
        'subject' => 'required|string|max:255',
        'message' => 'required|string|max:5000',
    ]);

    Log::info('Nouveau message de contact reçu', $validated);

    try {
        Mail::to('rivahfacture@gmail.com')->send(new ContactMessageMail($validated));
    } catch (Throwable $e) {
        Log::error("Erreur lors de l'envoi de l'email de contact: " . $e->getMessage());

        return back()->with('error', "Impossible d'envoyer l'email pour le moment. Veuillez réessayer ou nous écrire à rivahfacture@gmail.com.");
    }

    return back()->with('success', 'Votre message a bien été envoyé. Notre équipe vous répondra dans les plus brefs délais !');
})->name('contact.send');

// Authentification & Invités (accessibles uniquement si non connecté)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);

    // Réinitialisation de mot de passe
    Route::get('/forgot-password', [PasswordResetController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'store'])->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'edit'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'update'])->name('password.update');
});

// Routes protégées (accessibles uniquement si connecté)
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    // Application commerciale
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/app', fn() => redirect()->route('dashboard'));

    // Gestion des Clients
    Route::post('/clients', [ClientController::class, 'store'])->name('clients.store');
    Route::put('/clients/{client}', [ClientController::class, 'update'])->name('clients.update');
    Route::delete('/clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');

    // Catalogue Produits & Services
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    // Devis Commerciaux
    Route::post('/quotes', [QuoteController::class, 'store'])->name('quotes.store');
    Route::put('/quotes/{quote}', [QuoteController::class, 'update'])->name('quotes.update');
    Route::delete('/quotes/{quote}', [QuoteController::class, 'destroy'])->name('quotes.destroy');
    Route::post('/quotes/{quote}/convert', [QuoteController::class, 'convert'])->name('quotes.convert');
    Route::get('/quotes/{quote}/pdf', [QuoteController::class, 'pdf'])->name('quotes.pdf');

    // Factures
    Route::post('/invoices', [InvoiceController::class, 'store'])->name('invoices.store');
    Route::put('/invoices/{invoice}', [InvoiceController::class, 'update'])->name('invoices.update');
    Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');
    Route::post('/invoices/{invoice}/cancel', [InvoiceController::class, 'cancel'])->name('invoices.cancel');
    Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'pdf'])->name('invoices.pdf');

    // Règlements intégrés à la Facture (aucun menu autonome)
    Route::post('/invoices/{invoice}/payments', [InvoicePaymentController::class, 'store'])->name('invoices.payments.store');
    Route::delete('/invoices/{invoice}/payments/{payment}', [InvoicePaymentController::class, 'destroy'])->name('invoices.payments.destroy');

    // Paramètres de l'entreprise
    Route::match(['put', 'post'], '/settings/company', [CompanyController::class, 'update'])->name('company.update');

    // Rapports & Exports
    Route::get('/reports/export-csv', [ReportController::class, 'exportInvoicesCsv'])->name('reports.export-csv');
});
