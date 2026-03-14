<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUsuarioTable extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'Id' => [
                'type'           => 'INT',
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'Nombre' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => false,
            ],
            'Usuario' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false,
            ],
            'Password' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => false,
            ],
            'Rol' => [
                'type'       => "ENUM('Admin','Operador')",
                'default'    => 'Operador',
                'null'       => false,
            ],
            'Status' => [
                'type'       => "ENUM('Activo','Inactivo','Eliminado')",
                'default'    => 'Activo',
                'null'       => false,
            ],
            'CreatedAt' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'UpdatedAt' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);

        $this->forge->addPrimaryKey('Id');
        $this->forge->addUniqueKey('Usuario');
        $this->forge->createTable('usuario', true);
    }

    public function down(): void
    {
        $this->forge->dropTable('usuario', true);
    }
}
