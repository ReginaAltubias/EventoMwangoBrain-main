<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FollowUp extends Model
{
    use HasFactory;

    protected $table = 'follow_ups';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'lead_id',
        'action',
        'due_date',
        'owner_id',
        'status',
    ];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    protected $appends = [
        'leadId',
        'dueDate',
        'ownerId',
    ];

    public function getLeadIdAttribute(): string
    {
        return $this->attributes['lead_id'] ?? '';
    }

    public function getDueDateAttribute(): ?string
    {
        return isset($this->attributes['due_date'])
            ? date('c', strtotime($this->attributes['due_date']))
            : null;
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
