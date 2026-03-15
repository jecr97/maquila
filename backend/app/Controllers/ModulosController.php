<?php

namespace App\Controllers;

use App\Models\ModuloModel;
use App\Models\UsuarioModuloModel;
use CodeIgniter\HTTP\ResponseInterface;

class ModulosController extends BaseController
{
    private ModuloModel $moduloModel;
    private UsuarioModuloModel $umModel;

    public function __construct()
    {
        $this->moduloModel = new ModuloModel();
        $this->umModel     = new UsuarioModuloModel();
    }

    // GET /api/modulos — lista todos los módulos
    public function index()
    {
        return $this->response->setJSON([
            'success' => true,
            'data'    => $this->moduloModel->getTodos(),
        ]);
    }

    // GET /api/usuarios/:id/modulos — módulos asignados al usuario
    public function modulosDeUsuario(int $idUsuario)
    {
        $modulos = $this->umModel->getModulosDeUsuario($idUsuario);

        return $this->response->setJSON([
            'success' => true,
            'data'    => $modulos,
        ]);
    }

    // POST /api/usuarios/:id/modulos — sincronizar módulos del usuario
    // Body: { "modulos": [1, 2, 5, 7] }
    public function sincronizarModulos(int $idUsuario)
    {
        $data = $this->request->getJSON(true);

        if (!isset($data['modulos']) || !is_array($data['modulos'])) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)
                ->setJSON(['success' => false, 'message' => 'Se requiere un arreglo "modulos".']);
        }

        $this->umModel->sincronizar($idUsuario, $data['modulos']);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Módulos actualizados.',
            'data'    => $this->umModel->getModulosDeUsuario($idUsuario),
        ]);
    }
}
