<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    use HasFactory;

    protected $table = 'contacts';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'full_name',
        'company',
        'role',
        'phone',
        'whatsapp',
        'email',
        'sector',
        'org_type',
        'notes',
        'source',
        'is_complete',
        'created_by',
    ];

    protected $casts = [
        'is_complete' => 'boolean',
    ];

    protected $appends = [
        'fullName',
        'orgType',
        'isComplete',
        'createdBy',
        'createdAt',
    ];

    public function getFullNameAttribute(): string
    {
        return $this->attributes['full_name'] ?? '';
    }

    public function getOrgTypeAttribute(): ?string
    {
        return $this->attributes['org_type'] ?? null;
    }

    public function getIsCompleteAttribute(): bool
    {
        return (bool)($this->attributes['is_complete'] ?? false);
    }

    public function getCreatedByAttribute(): string
    {
        return $this->attributes['created_by'] ?? 'USR-01';
    }

    public function getCreatedAtAttribute(): ?string
    {
        return isset($this->attributes['created_at'])
            ? date('c', strtotime($this->attributes['created_at']))
            : null;
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'contact_id');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(VisitorFeedback::class, 'contact_id');
    }
}
