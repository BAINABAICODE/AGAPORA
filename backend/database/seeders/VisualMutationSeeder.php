<?php
// backend/database/seeders/VisualMutationSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VisualMutation;

class VisualMutationSeeder extends Seeder
{
    public function run(): void
    {
        $mutations = [
            ['name' => 'Lutino (Ino)', 'inheritance' => 'Sex-linked Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Lutino', 'inheritance' => 'Recessive', 'available_in' => ["Fischer's", 'Black-masked']],
            ['name' => 'Creamino', 'inheritance' => 'Sex-linked Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Turquoise Ino', 'inheritance' => 'Sex-linked Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Albino', 'inheritance' => 'Sex-linked Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Albino', 'inheritance' => 'Recessive', 'available_in' => ["Fischer's"]],
            ['name' => 'Opaline', 'inheritance' => 'Sex-linked Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'American Cinnamon', 'inheritance' => 'Sex-linked Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Pallid', 'inheritance' => 'Sex-linked Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Orange Face Lutino', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Pied', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced', "Fischer's", 'Black-masked']],
            ['name' => 'Heavy Pied', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Light Pied', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Pastel', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Dilute', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'White Face', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'White', 'inheritance' => 'Recessive', 'available_in' => ["Fischer's", 'Black-masked']],
            ['name' => 'Edged Dilute', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Fallow', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Bronze Fallow', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Orangeface', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Dark-eyed Clear', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Dark-eyed White', 'inheritance' => 'Recessive', 'available_in' => ["Fischer's"]],
            ['name' => 'Australian Cinnamon', 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced']],
            ['name' => 'Violet', 'inheritance' => 'Incomplete Dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Double Violet', 'inheritance' => 'Incomplete Dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Euwing', 'inheritance' => 'Dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Dominant Yellow', 'inheritance' => 'Dominant', 'available_in' => ["Fischer's"]],
            ['name' => 'Dominant Pied', 'inheritance' => 'Dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Dominant Edged', 'inheritance' => 'Dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Cinnamon', 'inheritance' => 'Recessive', 'available_in' => ["Fischer's", 'Black-masked']],
        ];

        foreach ($mutations as $mutation) {
            VisualMutation::create($mutation);
        }
    }
}