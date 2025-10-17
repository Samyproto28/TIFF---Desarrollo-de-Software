<?php

namespace Database\Seeders;

use App\Models\Provincia;
use Illuminate\Database\Seeder;

class ProvinciaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seed de las 23 provincias argentinas + CABA
     */
    public function run(): void
    {
        $provincias = [
            ['nombre' => 'Buenos Aires', 'codigo' => 'BA'],
            ['nombre' => 'Ciudad Autónoma de Buenos Aires', 'codigo' => 'CABA'],
            ['nombre' => 'Catamarca', 'codigo' => 'CT'],
            ['nombre' => 'Chaco', 'codigo' => 'CC'],
            ['nombre' => 'Chubut', 'codigo' => 'CH'],
            ['nombre' => 'Córdoba', 'codigo' => 'CB'],
            ['nombre' => 'Corrientes', 'codigo' => 'CR'],
            ['nombre' => 'Entre Ríos', 'codigo' => 'ER'],
            ['nombre' => 'Formosa', 'codigo' => 'FO'],
            ['nombre' => 'Jujuy', 'codigo' => 'JY'],
            ['nombre' => 'La Pampa', 'codigo' => 'LP'],
            ['nombre' => 'La Rioja', 'codigo' => 'LR'],
            ['nombre' => 'Mendoza', 'codigo' => 'MZ'],
            ['nombre' => 'Misiones', 'codigo' => 'MI'],
            ['nombre' => 'Neuquén', 'codigo' => 'NQ'],
            ['nombre' => 'Río Negro', 'codigo' => 'RN'],
            ['nombre' => 'Salta', 'codigo' => 'SA'],
            ['nombre' => 'San Juan', 'codigo' => 'SJ'],
            ['nombre' => 'San Luis', 'codigo' => 'SL'],
            ['nombre' => 'Santa Cruz', 'codigo' => 'SC'],
            ['nombre' => 'Santa Fe', 'codigo' => 'SF'],
            ['nombre' => 'Santiago del Estero', 'codigo' => 'SE'],
            ['nombre' => 'Tierra del Fuego', 'codigo' => 'TF'],
            ['nombre' => 'Tucumán', 'codigo' => 'TU'],
        ];

        foreach ($provincias as $provincia) {
            Provincia::firstOrCreate(
                ['codigo' => $provincia['codigo']],
                $provincia
            );
        }

        $this->command->info('Provincias cargadas exitosamente: ' . count($provincias));
    }
}
