<?php

namespace App\Models;

use CodeIgniter\Model;

class PrecioPrendaCorteModel extends Model
{
    protected $table         = 'precioprendacorte';
    protected $primaryKey    = 'Id';
    protected $returnType    = 'array';
    protected $allowedFields = ['IdTipoPrenda', 'IdTipoCorte', 'Precio', 'Status'];
    protected $useTimestamps = true;
    protected $createdField  = 'CreatedAt';
    protected $updatedField  = 'UpdatedAt';

    /**
     * Retorna todos los precios activos con nombres de prenda y corte resueltos.
     */
    public function getConNombres()
    {
        return $this->db->table('precioprendacorte p')
            ->select('p.Id, p.IdTipoPrenda, p.IdTipoCorte, p.Precio, p.Status, p.CreatedAt, p.UpdatedAt')
            ->select('tp.Nombre AS NombrePrenda')
            ->select('tc.Nombre AS NombreCorte')
            ->join('tipoprenda tp', 'tp.Id = p.IdTipoPrenda', 'left')
            ->join('tipocorte tc', 'tc.Id = p.IdTipoCorte', 'left')
            ->where('p.Status !=', 'Eliminado')
            ->orderBy('tp.Nombre', 'ASC')
            ->orderBy('tc.Nombre', 'ASC')
            ->get()
            ->getResultArray();
    }

    public function existeCombinacion(int $idPrenda, int $idCorte, ?int $excludeId = null): bool
    {
        $builder = $this->where('IdTipoPrenda', $idPrenda)
                        ->where('IdTipoCorte', $idCorte)
                        ->where('Status !=', 'Eliminado');

        if ($excludeId !== null) {
            $builder = $builder->where('Id !=', $excludeId);
        }

        return $builder->countAllResults() > 0;
    }
}
