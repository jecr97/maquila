<?php

namespace App\Models;

use CodeIgniter\Model;

class ProveedorModel extends Model
{
    protected $table            = 'proveedor';
    protected $primaryKey       = 'Id';
    protected $useAutoIncrement = true;
    protected $allowedFields    = ['Nombre', 'Correo', 'Telefono', 'Status'];
    protected $useTimestamps    = true;
    protected $createdField     = 'CreatedAt';
    protected $updatedField     = 'UpdatedAt';

    public function getActivos(): array
    {
        return $this->where('Status', 'Activo')->orderBy('Nombre', 'ASC')->findAll();
    }

    public function getTodos(): array
    {
        return $this->where('Status !=', 'Eliminado')->orderBy('Id', 'DESC')->findAll();
    }
}
