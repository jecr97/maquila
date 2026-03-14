<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateCorteTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'Id'                 => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'Folio'              => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
            'IdTipoPrenda'       => ['type' => 'INT', 'unsigned' => true],
            'IdTipoCorte'        => ['type' => 'INT', 'unsigned' => true],
            'CantidadPiezas'     => ['type' => 'INT', 'unsigned' => true],
            'PrecioUnitario'     => ['type' => 'DECIMAL', 'constraint' => '10,2'],
            'PiezasProducidas'   => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'MontoTotal'         => ['type' => 'DECIMAL', 'constraint' => '12,2', 'null' => true],
            'IdUsuarioRegistro'  => ['type' => 'INT', 'unsigned' => true],
            'IdUsuarioFinalizo'  => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'FechaFinalizacion'  => ['type' => 'DATETIME', 'null' => true],
            'Status'             => ['type' => 'ENUM', 'constraint' => ['Registrado', 'Comenzado', 'Finalizado', 'Eliminado'], 'default' => 'Registrado'],
            'CreatedAt'          => ['type' => 'DATETIME', 'null' => true],
            'UpdatedAt'          => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('Id', true);
        $this->forge->createTable('corte');
    }

    public function down()
    {
        $this->forge->dropTable('corte');
    }
}
