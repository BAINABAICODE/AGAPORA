<?php
// backend/database/seeders/SplitGeneSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SplitGene;

class SplitGeneSeeder extends Seeder
{
    public function run(): void
    {
        $splitGenes = [
            ['name' => 'split to Blue', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ['Peach-faced', "Fischer's", 'Black-masked', 'Black-cheeked']],
            ['name' => 'split to Parblue (Aqua/Turquoise)', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Pied', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ['Peach-faced', "Fischer's", 'Black-masked']],
            ['name' => 'split to Heavy Pied', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Light Pied', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Pastel', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Dilute', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ['Peach-faced']],
            ['name' => 'split to White Face', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ['Peach-faced']],
            ['name' => 'split to White', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ["Fischer's", 'Black-masked']],
            ['name' => 'split to Edged Dilute', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Fallow', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Bronze Fallow', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Orangeface', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Lutino (Peach-faced)', 'inheritance' => 'Sex-linked Recessive', 'sex_restriction' => 'Male only', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Lutino', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ["Fischer's", 'Black-masked']],
            ['name' => 'split to Opaline', 'inheritance' => 'Sex-linked Recessive', 'sex_restriction' => 'Male only', 'available_in' => ['Peach-faced']],
            ['name' => 'split to American Cinnamon', 'inheritance' => 'Sex-linked Recessive', 'sex_restriction' => 'Male only', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Pallid', 'inheritance' => 'Sex-linked Recessive', 'sex_restriction' => 'Male only', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Creamino', 'inheritance' => 'Sex-linked Recessive', 'sex_restriction' => 'Male only', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Albino', 'inheritance' => 'Sex-linked Recessive', 'sex_restriction' => 'Male only', 'available_in' => ['Peach-faced']],
            ['name' => 'split to Cinnamon', 'inheritance' => 'Recessive', 'sex_restriction' => 'All', 'available_in' => ["Fischer's", 'Black-masked']],
        ];

        foreach ($splitGenes as $gene) {
            SplitGene::create($gene);
        }
    }
}