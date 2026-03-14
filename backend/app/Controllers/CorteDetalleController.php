<?php

namespace App\Controllers;

use App\Models\CorteDetalleModel;
use App\Models\CorteModel;

class CorteDetalleController extends BaseController
{
    private CorteDetalleModel $model;

    public function __construct()
    {
        $this->model = new CorteDetalleModel();
    }

    // GET /api/cortes/:idCorte/detalles
    public function index(int $idCorte)
    {
        return $this->response->setJSON([
            'success' => true,
            'data'    => $this->model->getPorCorte($idCorte),
            'totalProcesadas' => $this->model->totalProcesadas($idCorte),
        ]);
    }

    // POST /api/cortes/:idCorte/detalles
    public function store(int $idCorte)
    {
        $corte = (new CorteModel())->find($idCorte);
        if (!$corte || !in_array($corte['Status'], ['Registrado', 'Comenzado'])) {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'message' => 'No se pueden agregar detalles a este corte.']);
        }

        $data = $this->request->getJSON(true);
        $data['IdCorte'] = $idCorte;

        $rules = [
            'PiezasProcesadas' => 'required|is_natural_no_zero',
            'IdUsuario'        => 'required|is_natural_no_zero',
        ];

        if (!$this->validateData($data, $rules)) {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'errors' => $this->validator->getErrors()]);
        }

        $this->model->insert($data);

        return $this->response->setJSON(['success' => true, 'message' => 'Detalle registrado.']);
    }

    // DELETE /api/cortes/:idCorte/detalles/:id
    public function destroy(int $idCorte, int $id)
    {
        $det = $this->model->where('IdCorte', $idCorte)->find($id);
        if (!$det) {
            return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'No encontrado.']);
        }
        $this->model->delete($id);
        return $this->response->setJSON(['success' => true, 'message' => 'Detalle eliminado.']);
    }
}
