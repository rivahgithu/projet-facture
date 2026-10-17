<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_id',
        'name',
        'reference',
        'description',
        'unit',
        'unit_price',
        'tax_rate',
        'is_active',
        'archived_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'is_active' => 'boolean',
            'archived_at' => 'datetime',
        ];
    }

    /**
     * Check if product is archived.
     */
    protected function isArchived(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->archived_at !== null,
        );
    }

    /**
     * Company owning the product.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Quote line items referencing this product.
     */
    public function quoteItems(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    /**
     * Invoice line items referencing this product.
     */
    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Scope to only include active items.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('archived_at')->where('is_active', true);
    }

    /**
     * Scope to only include archived items.
     */
    public function scopeArchived(Builder $query): Builder
    {
        return $query->whereNotNull('archived_at');
    }
}
