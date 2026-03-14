<?php

namespace App\Models;

use CodeIgniter\Model;

class CorteModel extends Model
{
    protected $table            = 'corte';
    protected $primaryKey       = 'Id';
    protected $useAutoIncrement = true;
    protected $allowedFields    = [
        'Folio', 'IdTipoPrenda', 'IdTipoCorte', 'IdProveedor', 'CantidadPiezas', 'PrecioUnitario',
        'PiezasProducidas', 'MontoTotal', 'IdUsuarioRegistro', 'IdUsuarioFinalizo',
        'FechaFinalizacion', 'Status',
    ];
    protected $useTimestamps = true;
    protected $createdField  = 'CreatedAt';
    protected $updatedField  = 'UpdatedAt';

    public function getTodos()
    {
        return $this->where('Status !=', 'Eliminado')->orderBy('Id', 'DESC')->findAll();
    }

    public function getConNombres(?string $status = null, ?string $desde = null, ?string $hasta = null, ?int $idProveedor = null)
    {
        $db = \Config\Database::connect();
        $builder = $db->table('corte c')
            ->select('c.*, tp.Nombre as NombrePrenda, tc.Nombre as NombreCorte, u.Nombre as NombreUsuario, p.Nombre as NombreProveedor')
            ->join('tipoprenda tp', 'tp.Id = c.IdTipoPrenda', 'left')
            ->join('tipocorte tc', 'tc.Id = c.IdTipoCorte', 'left')
            ->join('usuario u', 'u.Id = c.IdUsuarioRegistro', 'left')
            ->join('proveedor p', 'p.Id = c.IdProveedor', 'left')
            ->where('c.Status !=', 'Eliminado')
            ->orderBy('c.Id', 'DESC');

        if ($status)      $builder->where('c.Status', $status);
        if ($desde)       $builder->where('c.CreatedAt >=', $desde . ' 00:00:00');
        if ($hasta)       $builder->where('c.CreatedAt <=', $hasta . ' 23:59:59');
        if ($idProveedor) $builder->where('c.IdProveedor', $idProveedor);

        return $builder->get()->getResultArray();
    }

    public function generarFolio(): string
    {
        $last = $this->selectMax('Id')->first();
        $next = ($last['Id'] ?? 0) + 1;
        return 'C-' . str_pad($next, 5, '0', STR_PAD_LEFT);
    }
}
