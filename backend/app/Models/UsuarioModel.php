<?php

namespace App\Models;

use CodeIgniter\Model;

class UsuarioModel extends Model
{
    protected $table         = 'usuario';
    protected $primaryKey    = 'Id';
    protected $returnType    = 'array';
    protected $allowedFields = ['Nombre', 'Usuario', 'Password', 'Rol', 'Status'];
    protected $useTimestamps = true;
    protected $createdField  = 'CreatedAt';
    protected $updatedField  = 'UpdatedAt';

    protected $hidden = ['Password'];

    public function getActivos()
    {
        return $this->where('Status', 'Activo')->findAll();
    }

    public function getTodos()
    {
        return $this->where('Status !=', 'Eliminado')->findAll();
    }
}
