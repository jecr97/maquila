<?php

namespace App\Controllers;

use App\Models\PiezasFaltantesModel;
use App\Models\CorteModel;

class PiezasFaltantesController extends BaseController
{
    private PiezasFaltantesModel $model;

    public function __construct()
    {
        $this->model = new PiezasFaltantesModel();
    }

    // GET /api/piezas-faltantes  (all, with corte info)
    public function index()
    {
        $desde       = $this->request->getGet('desde');
        $hasta       = $this->request->getGet('hasta');
        $idProveedor = $this->request->getGet('idProveedor') ? (int) $this->request->getGet('idProveedor') : null;

        return $this->response->setJSON([
            'success' => true,
            'data'    => $this->model->getConCorte($desde, $hasta, $idProveedor),
        ]);
    }

    // GET /api/cortes/:idCorte/faltantes
    public function porCorte(int $idCorte)
    {
        return $this->response->setJSON([
            'success' => true,
            'data'    => $this->model->getPorCorte($idCorte),
            'totalFaltantes' => $this->model->totalFaltantes($idCorte),
        ]);
    }

    // POST /api/cortes/:idCorte/faltantes
    public function store(int $idCorte)
    {
        $corte = (new CorteModel())->find($idCorte);
        if (!$corte || $corte['Status'] === 'Eliminado') {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'message' => 'Corte no válido.']);
        }

        $data = $this->request->getJSON(true);
        $data['IdCorte'] = $idCorte;

        $rules = [
            'CantidadFaltante'   => 'required|is_natural_no_zero',
            'IdUsuarioRegistro'  => 'required|is_natural_no_zero',
        ];

        if (!$this->validateData($data, $rules)) {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'errors' => $this->validator->getErrors()]);
        }

        $this->model->insert($data);

        return $this->response->setJSON(['success' => true, 'message' => 'Piezas faltantes registradas.']);
    }

    // DELETE /api/cortes/:idCorte/faltantes/:id
    public function destroy(int $idCorte, int $id)
    {
        $pf = $this->model->where('IdCorte', $idCorte)->find($id);
        if (!$pf) {
            return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'No encontrado.']);
        }
        $this->model->update($id, ['Status' => 'Eliminado']);
        return $this->response->setJSON(['success' => true, 'message' => 'Registro eliminado.']);
    }
}
