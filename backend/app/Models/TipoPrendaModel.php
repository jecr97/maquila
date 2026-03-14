<?php

namespace App\Models;

use CodeIgniter\Model;

class TipoPrendaModel extends Model
{
    protected $table         = 'tipoprenda';
    protected $primaryKey    = 'Id';
    protected $returnType    = 'array';
    protected $allowedFields = ['Nombre', 'Descripcion', 'Status'];
    protected $useTimestamps = true;
    protected $createdField  = 'CreatedAt';
    protected $updatedField  = 'UpdatedAt';

    public function getActivos()
    {
        return $this->where('Status', 'Activo')->orderBy('Nombre', 'ASC')->findAll();
    }

    public function getTodos()
    {
        return $this->where('Status !=', 'Eliminado')->orderBy('Nombre', 'ASC')->findAll();
    }
}
