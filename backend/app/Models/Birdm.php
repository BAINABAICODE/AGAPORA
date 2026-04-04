<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Birdm extends Model
{
    use HasFactory;

    protected $table = 'birdms';
    protected $fillable = [
        'user_id', 'bird_id', 'species', 'sex', 'age_months',
        'base_color', 'dark_factor', 'visual_mutations', 'splits',
        'mother_data', 'father_data', 'grandparents_data'
    ];
    protected $casts = [
        'visual_mutations' => 'array',
        'splits' => 'array',
        'mother_data' => 'array',
        'father_data' => 'array',
        'grandparents_data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}