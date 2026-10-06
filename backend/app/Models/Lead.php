<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory;

    protected $table = 'leads';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'contact_id',
        'solutions',
        'main_solution',
        'need',
        'has_concrete_need',
        'timeframe',
        'interest',
        'status',
        'owner_id',
        'next_action',
        'follow_up_date',
        'notes',
        'estimated_value',
    ];

    protected $casts = [
        'solutions' => 'array',
        'follow_up_date' => 'datetime',
        'estimated_value' => 'integer',
    ];

    protected $appends = [
        'contactId',
        'mainSolution',
        'hasConcreteNeed',
        'ownerId',
        'nextAction',
        'followUpDate',
        'estimatedValue',
    ];

    public function getContactIdAttribute(): string
    {
        return $this->attributes['contact_id'] ?? '';
    }

    public function getMainSolutionAttribute(): string
    {
        return $this->attributes['main_solution'] ?? '';
    }

    public function getHasConcreteNeedAttribute(): string
    {
        return $this->attributes['has_concrete_need'] ?? 'Sim';
    }

    public function getOwnerIdAttribute(): string
    {
        return $this->attributes['owner_id'] ?? 'USR-01';
    }

    public function getNextActionAttribute(): string
    {
        return $this->attributes['next_action'] ?? 'Ligar';
    }

    public function getFollowUpDateAttribute(): ?string
    {
        return isset($this->attributes['follow_up_date'])
            ? date('c', strtotime($this->attributes['follow_up_date']))
            : null;
    }

    public function getEstimatedValueAttribute(): ?int
    {
        return isset($this->attributes['estimated_value'])
            ? (int)$this->attributes['estimated_value']
            : null;
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'contact_id');
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class, 'lead_id');
    }

    public function followUps(): HasMany
    {
        return $this->hasMany(FollowUp::class, 'lead_id');
    }

    public function meetings(): HasMany
    {
        return $this->hasMany(Meeting::class, 'lead_id');
    }
}
