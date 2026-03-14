<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateTipoCorteTable extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'Id'          => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'Nombre'      => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => false],
            'Descripcion' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'Status'      => ['type' => "ENUM('Activo','Inactivo','Eliminado')", 'default' => 'Activo'],
            'CreatedAt'   => ['type' => 'DATETIME', 'null' => true],
            'UpdatedAt'   => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('Id');
        $this->forge->addUniqueKey('Nombre');
        $this->forge->createTable('tipocorte', true);
    }

    public function down(): void
    {
        $this->forge->dropTable('tipocorte', true);
    }
}
