<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreatePrecioPrendaCorteTable extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'Id'           => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'IdTipoPrenda' => ['type' => 'INT', 'unsigned' => true, 'null' => false],
            'IdTipoCorte'  => ['type' => 'INT', 'unsigned' => true, 'null' => false],
            'Precio'       => ['type' => 'DECIMAL', 'constraint' => '10,2', 'null' => false],
            'Status'       => ['type' => "ENUM('Activo','Inactivo','Eliminado')", 'default' => 'Activo'],
            'CreatedAt'    => ['type' => 'DATETIME', 'null' => true],
            'UpdatedAt'    => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('Id');
        $this->forge->createTable('precioprendacorte', true);
    }

    public function down(): void
    {
        $this->forge->dropTable('precioprendacorte', true);
    }
}
