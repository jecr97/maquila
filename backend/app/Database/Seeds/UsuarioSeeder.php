<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'Nombre'   => 'Administrador',
                'Usuario'  => 'admin',
                'Password' => password_hash('admin123', PASSWORD_DEFAULT),
                'Rol'      => 'Admin',
                'Status'   => 'Activo',
            ],
            [
                'Nombre'   => 'Operador',
                'Usuario'  => 'operador',
                'Password' => password_hash('oper123', PASSWORD_DEFAULT),
                'Rol'      => 'Operador',
                'Status'   => 'Activo',
            ],
        ];

        $this->db->table('usuario')->insertBatch($data);
    }
}
