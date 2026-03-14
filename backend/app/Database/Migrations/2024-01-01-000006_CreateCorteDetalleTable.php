<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateCorteDetalleTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'Id'                => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'IdCorte'           => ['type' => 'INT', 'unsigned' => true],
            'PiezasProcesadas'  => ['type' => 'INT', 'unsigned' => true],
            'Observaciones'     => ['type' => 'TEXT', 'null' => true],
            'IdUsuario'         => ['type' => 'INT', 'unsigned' => true],
            'CreatedAt'         => ['type' => 'DATETIME', 'null' => true],
            'UpdatedAt'         => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('Id', true);
        $this->forge->createTable('cortedetalle');
    }

    public function down()
    {
        $this->forge->dropTable('cortedetalle');
    }
}
