<?php

namespace App\Models;

use CodeIgniter\Model;

class ModuloModel extends Model
{
    protected $table         = 'modulo';
    protected $primaryKey    = 'Id';
    protected $returnType    = 'array';
    protected $allowedFields = ['Nombre', 'Ruta', 'Icono', 'Orden', 'Status'];
    protected $useTimestamps = true;
    protected $createdField  = 'CreatedAt';
    protected $updatedField  = 'UpdatedAt';

    public function getActivos(): array
    {
        return $this->where('Status', 'Activo')->orderBy('Orden', 'ASC')->findAll();
    }

    public function getTodos(): array
    {
        return $this->orderBy('Orden', 'ASC')->findAll();
    }
}
