<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Meeting extends Model
{
    use HasFactory;

    protected $table = 'meetings';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'lead_id',
        'type',
        'start',
        'end',
        'owner_id',
        'location',
    ];

    protected $casts = [
        'start' => 'datetime',
        'end' => 'datetime',
    ];

    protected $appends = [
        'leadId',
        'ownerId',
    ];

    public function getLeadIdAttribute(): string
    {
        return $this->attributes['lead_id'] ?? '';
    }

    public function getOwnerIdAttribute(): string
    {
        return $this->attributes['owner_id'] ?? 'USR-01';
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }
}
