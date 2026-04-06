<?php
// backend/database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Seed users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);

        // Call the SpeciesSeeder
        $this->call(SpeciesSeeder::class);
        // Call the BaseColorSeeder
        $this->call(BaseColorSeeder::class);
        // Call the SplitGeneSeeder
        $this->call(SplitGeneSeeder::class);
        // Call the VisualMutationSeeder
        $this->call(VisualMutationSeeder::class);
        // Call the SpeciesListSeeder
        $this->call(SpeciesListSeeder::class);
        
    }
}