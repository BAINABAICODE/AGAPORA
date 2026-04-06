<?php
// backend/database/seeders/BaseColorSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BaseColor;

class BaseColorSeeder extends Seeder
{
    public function run(): void
    {
        $baseColors = [
            ['name' => 'Green', 'dark_factor' => 0, 'inheritance' => 'Dominant', 'available_in' => ['All species']],
            ['name' => 'Dark Green', 'dark_factor' => 1, 'inheritance' => 'Dominant', 'available_in' => ['Peach-faced', "Fischer's", 'Black-masked']],
            ['name' => 'Olive', 'dark_factor' => 2, 'inheritance' => 'Dominant', 'available_in' => ['Peach-faced', "Fischer's", 'Black-masked']],
            ['name' => 'Blue', 'dark_factor' => 0, 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced', "Fischer's", 'Black-masked', 'Black-cheeked']],
            ['name' => 'Cobalt', 'dark_factor' => 1, 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced', "Fischer's", 'Black-masked']],
            ['name' => 'Mauve', 'dark_factor' => 2, 'inheritance' => 'Recessive', 'available_in' => ['Peach-faced', "Fischer's", 'Black-masked']],
            ['name' => 'Aqua (Dutch Blue)', 'dark_factor' => 0, 'inheritance' => 'Incomplete Dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Dark Aqua', 'dark_factor' => 1, 'inheritance' => 'Incomplete Dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Olive Aqua', 'dark_factor' => 2, 'inheritance' => 'Incomplete Dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Turquoise (Whitefaced Blue)', 'dark_factor' => 0, 'inheritance' => 'Incomplete Dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Dark Turquoise', 'dark_factor' => 1, 'inheritance' => 'Incomplete Dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Olive Turquoise', 'dark_factor' => 2, 'inheritance' => 'Incomplete Dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Aqua-Turquoise (Seagreen)', 'dark_factor' => 0, 'inheritance' => 'Co-dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Dark Aqua-Turquoise', 'dark_factor' => 1, 'inheritance' => 'Co-dominant', 'available_in' => ['Peach-faced']],
            ['name' => 'Olive Aqua-Turquoise', 'dark_factor' => 2, 'inheritance' => 'Co-dominant', 'available_in' => ['Peach-faced']],
        ];

        foreach ($baseColors as $color) {
            BaseColor::create($color);
        }
    }
}