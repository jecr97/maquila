<?php

namespace App\Controllers;

use App\Models\PrecioPrendaCorteModel;
use App\Models\TipoPrendaModel;
use App\Models\TipoCorteModel;
use CodeIgniter\HTTP\ResponseInterface;

class PrecioPrendaCorteController extends BaseController
{
    private PrecioPrendaCorteModel $model;

    public function __construct()
    {
        $this->model = new PrecioPrendaCorteModel();
    }

    // GET /api/precios
    public function index()
    {
        return $this->response->setJSON([
            'success' => true,
            'data'    => $this->model->getConNombres(),
        ]);
    }

    // GET /api/precios/catalogos  — para llenar los selects del formulario
    public function catalogos()
    {
        $prendas = (new TipoPrendaModel())->getActivos();
        $cortes  = (new TipoCorteModel())->getActivos();

        return $this->response->setJSON([
            'success' => true,
            'prendas' => $prendas,
            'cortes'  => $cortes,
        ]);
    }

    // POST /api/precios
    public function store()
    {
        $data  = $this->request->getJSON(true);
        $rules = [
            'IdTipoPrenda' => 'required|is_natural_no_zero',
            'IdTipoCorte'  => 'required|is_natural_no_zero',
            'Precio'       => 'required|decimal|greater_than[0]',
        ];

        if (!$this->validateData($data, $rules)) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)
                ->setJSON(['success' => false, 'errors' => $this->validator->getErrors()]);
        }

        if ($this->model->existeCombinacion((int)$data['IdTipoPrenda'], (int)$data['IdTipoCorte'])) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)
                ->setJSON(['success' => false, 'errors' => ['combinacion' => 'Ya existe un precio para esa combinación de prenda y corte.']]);
        }

        $id = $this->model->insert([
            'IdTipoPrenda' => (int)$data['IdTipoPrenda'],
            'IdTipoCorte'  => (int)$data['IdTipoCorte'],
            'Precio'       => (float)$data['Precio'],
            'Status'       => 'Activo',
        ]);

        $registros = $this->model->getConNombres();
        $nuevo = array_filter($registros, fn($r) => $r['Id'] === $id);

        return $this->response
            ->setStatusCode(ResponseInterface::HTTP_CREATED)
            ->setJSON(['success' => true, 'message' => 'Precio registrado.', 'data' => array_values($nuevo)[0] ?? null]);
    }

    // PUT /api/precios/:id
    public function update(int $id)
    {
        $registro = $this->model->find($id);
        if (!$registro) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)
                ->setJSON(['success' => false, 'message' => 'Registro no encontrado.']);
        }

        $data  = $this->request->getJSON(true);
        $rules = [
            'IdTipoPrenda' => 'required|is_natural_no_zero',
            'IdTipoCorte'  => 'required|is_natural_no_zero',
            'Precio'       => 'required|decimal|greater_than[0]',
        ];

        if (!$this->validateData($data, $rules)) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)
                ->setJSON(['success' => false, 'errors' => $this->validator->getErrors()]);
        }

        if ($this->model->existeCombinacion((int)$data['IdTipoPrenda'], (int)$data['IdTipoCorte'], $id)) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)
                ->setJSON(['success' => false, 'errors' => ['combinacion' => 'Ya existe un precio para esa combinación de prenda y corte.']]);
        }

        $this->model->update($id, [
            'IdTipoPrenda' => (int)$data['IdTipoPrenda'],
            'IdTipoCorte'  => (int)$data['IdTipoCorte'],
            'Precio'       => (float)$data['Precio'],
        ]);

        $registros = $this->model->getConNombres();
        $actualizado = array_filter($registros, fn($r) => $r['Id'] === $id);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Precio actualizado.',
            'data'    => array_values($actualizado)[0] ?? null,
        ]);
    }

    // PATCH /api/precios/:id/status
    public function toggleStatus(int $id)
    {
        $registro = $this->model->find($id);
        if (!$registro) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)
                ->setJSON(['success' => false, 'message' => 'Registro no encontrado.']);
        }

        $nuevo = $registro['Status'] === 'Activo' ? 'Inactivo' : 'Activo';
        $this->model->update($id, ['Status' => $nuevo]);

        return $this->response->setJSON(['success' => true, 'message' => "Estado: {$nuevo}.", 'status' => $nuevo]);
    }

    // DELETE /api/precios/:id
    public function destroy(int $id)
    {
        $registro = $this->model->find($id);
        if (!$registro) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)
                ->setJSON(['success' => false, 'message' => 'Registro no encontrado.']);
        }

        $this->model->update($id, ['Status' => 'Eliminado']);

        return $this->response->setJSON(['success' => true, 'message' => 'Precio eliminado.']);
    }
}
