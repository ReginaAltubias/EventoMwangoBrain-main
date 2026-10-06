<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interaction extends Model
{
    use HasFactory;

    protected $table = 'interactions';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'lead_id',
        'type',
        'description',
        'date',
        'user_id',
    ];

    protected $casts = [
        'date' => 'datetime',
    ];

    protected $appends = [
        'leadId',
        'userId',
    ];

    public function getLeadIdAttribute(): string
    {
        return $this->attributes['lead_id'] ?? '';
    }

    public function getUserIdAttribute(): string
    {
        return $this->attributes['user_id'] ?? 'USR-01';
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }
}
