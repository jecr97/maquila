<?php

namespace App\Controllers;

use App\Models\ProveedorModel;

class ProveedorController extends BaseController
{
    private ProveedorModel $model;

    public function __construct()
    {
        $this->model = new ProveedorModel();
    }

    // GET /api/proveedores
    public function index()
    {
        return $this->response->setJSON([
            'success' => true,
            'data'    => $this->model->getTodos(),
        ]);
    }

    // POST /api/proveedores
    public function store()
    {
        $data  = $this->request->getJSON(true);
        $rules = ['Nombre' => 'required|max_length[150]'];

        if (!$this->validateData($data, $rules)) {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'errors' => $this->validator->getErrors()]);
        }

        $this->model->insert([
            'Nombre'   => trim($data['Nombre']),
            'Correo'   => $data['Correo']   ?? null,
            'Telefono' => $data['Telefono'] ?? null,
        ]);

        return $this->response->setStatusCode(201)->setJSON([
            'success' => true,
            'message' => 'Proveedor registrado.',
            'id'      => $this->model->getInsertID(),
        ]);
    }

    // PUT /api/proveedores/:id
    public function update(int $id)
    {
        $prov = $this->model->find($id);
        if (!$prov || $prov['Status'] === 'Eliminado') {
            return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'Proveedor no encontrado.']);
        }

        $data  = $this->request->getJSON(true);
        $rules = ['Nombre' => 'required|max_length[150]'];

        if (!$this->validateData($data, $rules)) {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'errors' => $this->validator->getErrors()]);
        }

        $this->model->update($id, [
            'Nombre'   => trim($data['Nombre']),
            'Correo'   => $data['Correo']   ?? null,
            'Telefono' => $data['Telefono'] ?? null,
        ]);

        return $this->response->setJSON(['success' => true, 'message' => 'Proveedor actualizado.']);
    }

    // DELETE /api/proveedores/:id
    public function destroy(int $id)
    {
        $prov = $this->model->find($id);
        if (!$prov) {
            return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'No encontrado.']);
        }
        $this->model->update($id, ['Status' => 'Eliminado']);
        return $this->response->setJSON(['success' => true, 'message' => 'Proveedor eliminado.']);
    }

    // POST /api/proveedores/reiniciar
    public function reiniciar()
    {
        $db = \Config\Database::connect();
        $db->query('SET FOREIGN_KEY_CHECKS = 0');
        $db->table('piezasfaltantes')->truncate();
        $db->table('cortedetalle')->truncate();
        $db->table('corte')->truncate();
        $db->query('SET FOREIGN_KEY_CHECKS = 1');

        return $this->response->setJSON(['success' => true, 'message' => 'Datos de producción reiniciados correctamente.']);
    }
}
