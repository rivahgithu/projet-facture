<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients')->restrictOnDelete();
            $table->foreignId('quote_id')->nullable()->constrained('quotes')->nullOnDelete();
            $table->string('invoice_number', 50);
            $table->string('document_status', 30)->default('brouillon');
            $table->string('payment_status', 30)->default('non_payée');
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->string('currency', 10)->default('FCFA');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_total', 15, 2)->default(0);
            $table->decimal('tax_total', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->decimal('paid_total', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'invoice_number']);
            $table->index(['company_id', 'document_status']);
            $table->index(['company_id', 'payment_status']);
            $table->index(['company_id', 'issue_date']);
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
