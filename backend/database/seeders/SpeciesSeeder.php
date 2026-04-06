<?php
// backend/database/seeders/SpeciesSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Species;

class SpeciesSeeder extends Seeder
{
    public function run(): void
    {
        $species = [
            [
                'key' => 'lilians',
                'name' => "Lilian's / Nyasa Lovebird",
                'scientific_name' => 'Agapornis lilianae',
                'description' => 'One of the smaller lovebird species, featuring a pinkish-orange head and bright green body. Lilian\'s Lovebirds are active, friendly, and social birds that enjoy living in flocks and are appreciated for their delicate appearance.',
                'gradient_from' => '#ff9eb5',
                'gradient_to' => '#ffb347',
                'image_src' => '/src/assets/birds/lilians-lovebird.png',
                'display_order' => 1
            ],
            [
                'key' => 'peach-faced',
                'name' => 'Peach-faced Lovebird',
                'scientific_name' => 'Agapornis roseicollis',
                'description' => 'One of the most popular and widely kept lovebird species. It has a bright green body, peach-colored face, and blue rump. Known for its playful personality and strong pair bonding.',
                'gradient_from' => '#ffb347',
                'gradient_to' => '#ff6b6b',
                'image_src' => '/src/assets/birds/peach-faced-lovebird.png',
                'display_order' => 2
            ],
            [
                'key' => 'masked',
                'name' => 'Masked Lovebird',
                'scientific_name' => 'Agapornis personatus',
                'description' => 'This species is easily identified by its dark black facial mask, bright yellow collar, and green body. Masked Lovebirds are playful, social birds that form strong bonds with their mates.',
                'gradient_from' => '#2c3e2d',
                'gradient_to' => '#f1c40f',
                'image_src' => '/src/assets/birds/masked-lovebird.png',
                'display_order' => 3
            ],
            [
                'key' => 'fischers',
                'name' => "Fischer's Lovebird",
                'scientific_name' => 'Agapornis fischeri',
                'description' => 'A colorful species recognized for its vibrant orange face, yellow chest, and bright green body. Fischer\'s Lovebirds are active, social, and energetic birds that thrive in flocks.',
                'gradient_from' => '#e67e22',
                'gradient_to' => '#f39c12',
                'image_src' => '/src/assets/birds/fischers-lovebird.png',
                'display_order' => 4
            ],
            [
                'key' => 'black-cheeked',
                'name' => 'Black-cheeked Lovebird',
                'scientific_name' => 'Agapornis nigrigenis',
                'description' => 'A small lovebird with a green body and dark brown to black cheeks. Closely related to the Masked Lovebird, it is gentle and social.',
                'gradient_from' => '#2c5e2e',
                'gradient_to' => '#8b5a2b',
                'image_src' => '/src/assets/birds/black-cheeked-lovebird.png',
                'display_order' => 5
            ],
            [
                'key' => 'black-winged',
                'name' => 'Black-winged Lovebird',
                'scientific_name' => 'Agapornis taranta',
                'description' => 'The largest of all lovebird species. Males display distinctive red markings on their forehead and wings, while females remain mostly green.',
                'gradient_from' => '#8b3a3a',
                'gradient_to' => '#3a6b3a',
                'image_src' => '/src/assets/birds/black-winged-lovebird.png',
                'display_order' => 6
            ],
            [
                'key' => 'red-faced',
                'name' => 'Red-faced Lovebird',
                'scientific_name' => 'Agapornis pullarius',
                'description' => 'Recognized for its bright red face and green body, this species is beautiful but difficult to breed in captivity.',
                'gradient_from' => '#e74c3c',
                'gradient_to' => '#2ecc71',
                'image_src' => '/src/assets/birds/red-faced-lovebird.png',
                'display_order' => 7
            ],
            [
                'key' => 'grey-headed',
                'name' => 'Grey-headed Lovebird',
                'scientific_name' => 'Agapornis canus',
                'description' => 'The only lovebird species native to Madagascar. Males have a gray head and green body, while females are mostly green.',
                'gradient_from' => '#95a5a6',
                'gradient_to' => '#6c9e6c',
                'image_src' => '/src/assets/birds/grey-headed-lovebird.png',
                'display_order' => 8
            ],
            [
                'key' => 'swinderns',
                'name' => "Swindern's Lovebird",
                'scientific_name' => 'Agapornis swindernianus',
                'description' => 'A rare lovebird species distinguished by a dark band around its neck and a green body. Shy and elusive, this species is rarely seen in captivity.',
                'gradient_from' => '#34495e',
                'gradient_to' => '#2c5e2e',
                'image_src' => '/src/assets/birds/swinderns-lovebird.png',
                'display_order' => 9
            ]
        ];

        foreach ($species as $speciesData) {
            Species::updateOrCreate(
                ['key' => $speciesData['key']],
                $speciesData
            );
        }
    }
}