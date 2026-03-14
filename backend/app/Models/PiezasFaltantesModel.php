<?php

namespace App\Models;

use CodeIgniter\Model;

class PiezasFaltantesModel extends Model
{
    protected $table            = 'piezasfaltantes';
    protected $primaryKey       = 'Id';
    protected $useAutoIncrement = true;
    protected $allowedFields    = ['IdCorte', 'CantidadFaltante', 'Motivo', 'IdUsuarioRegistro', 'Status', 'AplicaDescuento'];
    protected $useTimestamps    = true;
    protected $createdField     = 'CreatedAt';
    protected $updatedField     = 'UpdatedAt';

    public function getPorCorte(int $idCorte): array
    {
        $db = \Config\Database::connect();
        return $db->table('piezasfaltantes pf')
            ->select('pf.*, u.Nombre as NombreUsuario')
            ->join('usuario u', 'u.Id = pf.IdUsuarioRegistro', 'left')
            ->where('pf.IdCorte', $idCorte)
            ->where('pf.Status', 'Activo')
            ->orderBy('pf.Id', 'DESC')
            ->get()->getResultArray();
    }

    public function totalFaltantes(int $idCorte): int
    {
        $row = $this->selectSum('CantidadFaltante')
            ->where('IdCorte', $idCorte)
            ->where('Status', 'Activo')
            ->first();
        return (int) ($row['CantidadFaltante'] ?? 0);
    }

    // Only faltantes that apply discount — used when finalizing a corte
    public function totalFaltantesConDescuento(int $idCorte): int
    {
        $row = $this->selectSum('CantidadFaltante')
            ->where('IdCorte', $idCorte)
            ->where('Status', 'Activo')
            ->where('AplicaDescuento', 1)
            ->first();
        return (int) ($row['CantidadFaltante'] ?? 0);
    }

    public function getConCorte(?string $desde = null, ?string $hasta = null, ?int $idProveedor = null): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('piezasfaltantes pf')
            ->select('pf.*, c.Folio, tp.Nombre as NombrePrenda, tc.Nombre as NombreCorte, u.Nombre as NombreUsuario, pr.Nombre as NombreProveedor')
            ->join('corte c', 'c.Id = pf.IdCorte', 'left')
            ->join('tipoprenda tp', 'tp.Id = c.IdTipoPrenda', 'left')
            ->join('tipocorte tc', 'tc.Id = c.IdTipoCorte', 'left')
            ->join('usuario u', 'u.Id = pf.IdUsuarioRegistro', 'left')
            ->join('proveedor pr', 'pr.Id = c.IdProveedor', 'left')
            ->where('pf.Status', 'Activo')
            ->orderBy('pf.Id', 'DESC');

        if ($desde)       $builder->where('pf.CreatedAt >=', $desde . ' 00:00:00');
        if ($hasta)       $builder->where('pf.CreatedAt <=', $hasta . ' 23:59:59');
        if ($idProveedor) $builder->where('c.IdProveedor', $idProveedor);

        return $builder->get()->getResultArray();
    }
}
