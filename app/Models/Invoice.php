<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_id',
        'client_id',
        'quote_id',
        'invoice_number',
        'document_status',
        'payment_status',
        'issue_date',
        'due_date',
        'currency',
        'subtotal',
        'discount_total',
        'tax_total',
        'total',
        'paid_total',
        'notes',
        'cancelled_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'due_date' => 'date',
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'total' => 'decimal:2',
            'paid_total' => 'decimal:2',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * Calculate balance due (solde restant à payer).
     */
    protected function balanceDue(): Attribute
    {
        return Attribute::make(
            get: fn () => max(0, (float) $this->total - (float) $this->paid_total),
        );
    }

    /**
     * Check if invoice is overdue.
     */
    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->document_status === 'émise'
                && $this->payment_status !== 'payée'
                && $this->due_date !== null
                && $this->due_date->isPast(),
        );
    }

    /**
     * Company owning this invoice.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Client to whom this invoice is addressed.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Originating quote (if converted from quote).
     */
    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    /**
     * Line items on this invoice.
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('position');
    }

    /**
     * Payments recorded for this invoice.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->orderBy('payment_date', 'desc');
    }

    /**
     * Scope by document status (brouillon, émise, annulée).
     */
    public function scopeDocumentStatus(Builder $query, string $status): Builder
    {
        return $query->where('document_status', $status);
    }

    /**
     * Scope by payment status (non_payée, partiellement_payée, payée, en_retard).
     */
    public function scopePaymentStatus(Builder $query, string $status): Builder
    {
        return $query->where('payment_status', $status);
    }

    /**
     * Scope to find overdue invoices.
     */
    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('document_status', 'émise')
            ->where('payment_status', '!=', 'payée')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->toDateString());
    }
}
