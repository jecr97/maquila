<?php

namespace App\Models;

use CodeIgniter\Model;

class UsuarioModuloModel extends Model
{
    protected $table         = 'usuario_modulo';
    protected $primaryKey    = 'Id';
    protected $returnType    = 'array';
    protected $allowedFields = ['IdUsuario', 'IdModulo'];
    protected $useTimestamps = false;

    /**
     * Devuelve los módulos activos asignados a un usuario.
     */
    public function getModulosDeUsuario(int $idUsuario): array
    {
        return $this->db->table('usuario_modulo um')
            ->select('m.Id, m.Nombre, m.Ruta, m.Icono, m.Orden')
            ->join('modulo m', 'm.Id = um.IdModulo')
            ->where('um.IdUsuario', $idUsuario)
            ->where('m.Status', 'Activo')
            ->orderBy('m.Orden', 'ASC')
            ->get()
            ->getResultArray();
    }

    /**
     * Sincroniza los módulos de un usuario: borra los actuales e inserta los nuevos.
     */
    public function sincronizar(int $idUsuario, array $idsModulos): void
    {
        $this->where('IdUsuario', $idUsuario)->delete();

        $batch = [];
        foreach ($idsModulos as $idModulo) {
            $batch[] = ['IdUsuario' => $idUsuario, 'IdModulo' => (int) $idModulo];
        }
        if (!empty($batch)) {
            $this->insertBatch($batch);
        }
    }
}
