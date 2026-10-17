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
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients')->restrictOnDelete();
            $table->string('quote_number', 50);
            $table->string('status', 30)->default('brouillon');
            $table->date('issue_date');
            $table->date('valid_until')->nullable();
            $table->string('currency', 10)->default('FCFA');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_total', 15, 2)->default(0);
            $table->decimal('tax_total', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('converted_invoice_id')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'quote_number']);
            $table->index(['company_id', 'status']);
            $table->index(['company_id', 'issue_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
