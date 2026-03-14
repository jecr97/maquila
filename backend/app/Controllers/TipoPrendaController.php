<?php

namespace App\Controllers;

use App\Models\TipoPrendaModel;
use CodeIgniter\HTTP\ResponseInterface;

class TipoPrendaController extends BaseController
{
    private TipoPrendaModel $model;

    public function __construct()
    {
        $this->model = new TipoPrendaModel();
    }

    // GET /api/tipos-prenda
    public function index()
    {
        return $this->response->setJSON([
            'success' => true,
            'data'    => $this->model->getTodos(),
        ]);
    }

    // POST /api/tipos-prenda
    public function store()
    {
        $data  = $this->request->getJSON(true);
        $rules = [
            'Nombre'      => 'required|min_length[2]|max_length[100]|is_unique[tipoprenda.Nombre]',
            'Descripcion' => 'permit_empty|max_length[255]',
        ];

        if (!$this->validateData($data, $rules)) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)
                ->setJSON(['success' => false, 'errors' => $this->validator->getErrors()]);
        }

        $id = $this->model->insert([
            'Nombre'      => esc($data['Nombre']),
            'Descripcion' => esc($data['Descripcion'] ?? ''),
            'Status'      => 'Activo',
        ]);

        return $this->response
            ->setStatusCode(ResponseInterface::HTTP_CREATED)
            ->setJSON(['success' => true, 'message' => 'Tipo de prenda creado.', 'data' => $this->model->find($id)]);
    }

    // PUT /api/tipos-prenda/:id
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
            'Nombre'      => "required|min_length[2]|max_length[100]|is_unique[tipoprenda.Nombre,Id,{$id}]",
            'Descripcion' => 'permit_empty|max_length[255]',
        ];

        if (!$this->validateData($data, $rules)) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)
                ->setJSON(['success' => false, 'errors' => $this->validator->getErrors()]);
        }

        $this->model->update($id, [
            'Nombre'      => esc($data['Nombre']),
            'Descripcion' => esc($data['Descripcion'] ?? ''),
        ]);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Tipo de prenda actualizado.',
            'data'    => $this->model->find($id),
        ]);
    }

    // PATCH /api/tipos-prenda/:id/status
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

    // DELETE /api/tipos-prenda/:id
    public function destroy(int $id)
    {
        $registro = $this->model->find($id);
        if (!$registro) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)
                ->setJSON(['success' => false, 'message' => 'Registro no encontrado.']);
        }

        $this->model->update($id, ['Status' => 'Eliminado']);

        return $this->response->setJSON(['success' => true, 'message' => 'Tipo de prenda eliminado.']);
    }
}
