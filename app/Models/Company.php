<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'legal_name',
        'email',
        'phone',
        'address',
        'logo_path',
        'currency',
        'payment_terms',
        'invoice_prefix',
        'quote_prefix',
        'tax_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payment_terms' => 'integer',
        ];
    }

    /**
     * Users associated with this company.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'company_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Clients belonging to this company.
     */
    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    /**
     * Products and services catalog belonging to this company.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Quotes issued by this company.
     */
    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    /**
     * Invoices issued by this company.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Payments recorded for this company.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Activity logs for this company.
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }
}
