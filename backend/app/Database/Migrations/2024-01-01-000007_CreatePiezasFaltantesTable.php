<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreatePiezasFaltantesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'Id'                 => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'IdCorte'            => ['type' => 'INT', 'unsigned' => true],
            'CantidadFaltante'   => ['type' => 'INT', 'unsigned' => true],
            'Motivo'             => ['type' => 'VARCHAR', 'constraint' => 500, 'null' => true],
            'IdUsuarioRegistro'  => ['type' => 'INT', 'unsigned' => true],
            'Status'             => ['type' => 'ENUM', 'constraint' => ['Activo', 'Eliminado'], 'default' => 'Activo'],
            'CreatedAt'          => ['type' => 'DATETIME', 'null' => true],
            'UpdatedAt'          => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('Id', true);
        $this->forge->createTable('piezasfaltantes');
    }

    public function down()
    {
        $this->forge->dropTable('piezasfaltantes');
    }
}
