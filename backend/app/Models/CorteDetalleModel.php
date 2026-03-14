<?php

namespace App\Models;

use CodeIgniter\Model;

class CorteDetalleModel extends Model
{
    protected $table            = 'cortedetalle';
    protected $primaryKey       = 'Id';
    protected $useAutoIncrement = true;
    protected $allowedFields    = ['IdCorte', 'PiezasProcesadas', 'Observaciones', 'IdUsuario'];
    protected $useTimestamps    = true;
    protected $createdField     = 'CreatedAt';
    protected $updatedField     = 'UpdatedAt';

    public function getPorCorte(int $idCorte): array
    {
        $db = \Config\Database::connect();
        return $db->table('cortedetalle cd')
            ->select('cd.*, u.Nombre as NombreUsuario')
            ->join('usuario u', 'u.Id = cd.IdUsuario', 'left')
            ->where('cd.IdCorte', $idCorte)
            ->orderBy('cd.Id', 'DESC')
            ->get()->getResultArray();
    }

    public function totalProcesadas(int $idCorte): int
    {
        $row = $this->selectSum('PiezasProcesadas')->where('IdCorte', $idCorte)->first();
        return (int) ($row['PiezasProcesadas'] ?? 0);
    }
}
