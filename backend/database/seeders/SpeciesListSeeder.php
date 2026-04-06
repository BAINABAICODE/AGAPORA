<?php
// backend/database/seeders/SpeciesListSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SpeciesList;

class SpeciesListSeeder extends Seeder
{
    public function run(): void
    {
        $species = [
            ['name' => 'Rosy-faced/peach-faced lovebird', 'group' => 'Non-eye ring'],
            ['name' => "Fischer's lovebird", 'group' => 'Eye ring'],
            ['name' => 'Yellow-collared/masked/black-masked', 'group' => 'Eye ring'],
            ['name' => 'Black-cheek lovebird', 'group' => 'Eye ring'],
            ['name' => 'Lilian/Nyasa lovebird', 'group' => 'Eye ring'],
            ['name' => 'Abyssinian/black-winged', 'group' => 'Non-eye ring'],
            ['name' => 'Red-headed/red-faced lovebird', 'group' => 'Non-eye ring'],
            ['name' => 'Grey-headed/Madagascar', 'group' => 'Non-eye ring'],
            ['name' => "Black-collared/Swindern's Lovebird", 'group' => 'Non-eye ring'],
        ];

        foreach ($species as $speciesData) {
            SpeciesList::create($speciesData);
        }
    }
}