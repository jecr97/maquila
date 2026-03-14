<?php

namespace App\Controllers;

use App\Models\UsuarioModel;
use CodeIgniter\HTTP\ResponseInterface;

class UsuariosController extends BaseController
{
    private UsuarioModel $usuarioModel;

    public function __construct()
    {
        $this->usuarioModel = new UsuarioModel();
    }

    // ---------------------------------------------------------------
    // POST /api/auth/login
    // ---------------------------------------------------------------
    public function login()
    {
        $data = $this->request->getJSON();

        if (empty($data->usuario) || empty($data->password)) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)
                ->setJSON(['success' => false, 'message' => 'Usuario y contraseña son requeridos.']);
        }

        // Buscar por campo 'Usuario' (username)
        $usuario = $this->usuarioModel
            ->where('Usuario', esc($data->usuario))
            ->first();

        if (!$usuario) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)
                ->setJSON(['success' => false, 'message' => 'Credenciales inválidas.']);
        }

        if ($usuario['Status'] !== 'Activo') {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_FORBIDDEN)
                ->setJSON(['success' => false, 'message' => 'Usuario inactivo. Contacta al administrador.']);
        }

        // Verificar contraseña: soporta hashed ($2y$) y plain text (legado)
        $passwordValida = false;
        if (str_starts_with($usuario['Password'], '$2y$')) {
            $passwordValida = password_verify($data->password, $usuario['Password']);
        } else {
            // Contraseña en texto plano (legado) — comparar y actualizar a hash
            $passwordValida = ($data->password === $usuario['Password']);
            if ($passwordValida) {
                $this->usuarioModel->update($usuario['Id'], [
                    'Password' => password_hash($data->password, PASSWORD_DEFAULT),
                ]);
            }
        }

        if (!$passwordValida) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)
                ->setJSON(['success' => false, 'message' => 'Credenciales inválidas.']);
        }

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Login exitoso.',
            'user'    => [
                'id'     => $usuario['Id'],
                'nombre' => $usuario['Nombre'],
                'rol'    => $usuario['Rol'],
            ],
        ]);
    }

    // ---------------------------------------------------------------
    // GET /api/usuarios
    // ---------------------------------------------------------------
    public function index()
    {
        $usuarios = $this->usuarioModel->getTodos();
        return $this->response->setJSON(['success' => true, 'data' => $usuarios]);
    }

    // ---------------------------------------------------------------
    // GET /api/usuarios/:id
    // ---------------------------------------------------------------
    public function show(int $id)
    {
        $usuario = $this->usuarioModel->find($id);

        if (!$usuario) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)
                ->setJSON(['success' => false, 'message' => 'Usuario no encontrado.']);
        }

        return $this->response->setJSON(['success' => true, 'data' => $usuario]);
    }

    // ---------------------------------------------------------------
    // POST /api/usuarios
    // ---------------------------------------------------------------
    public function store()
    {
        $data = $this->request->getJSON(true);

        $rules = [
            'Nombre'   => 'required|min_length[2]|max_length[100]',
            'Usuario'  => 'required|min_length[3]|max_length[50]|is_unique[usuario.Usuario]',
            'Password' => 'required|min_length[6]',
            'Rol'      => 'permit_empty|in_list[Admin,Operador]',
        ];

        if (!$this->validateData($data, $rules)) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)
                ->setJSON(['success' => false, 'errors' => $this->validator->getErrors()]);
        }

        $id = $this->usuarioModel->insert([
            'Nombre'   => esc($data['Nombre']),
            'Usuario'  => esc($data['Usuario']),
            'Password' => password_hash($data['Password'], PASSWORD_DEFAULT),
            'Rol'      => isset($data['Rol']) ? $data['Rol'] : 'Operador',
            'Status'   => 'Activo',
        ]);

        $nuevo = $this->usuarioModel->find($id);

        return $this->response
            ->setStatusCode(ResponseInterface::HTTP_CREATED)
            ->setJSON(['success' => true, 'message' => 'Usuario creado.', 'data' => $nuevo]);
    }

    // ---------------------------------------------------------------
    // PUT /api/usuarios/:id
    // ---------------------------------------------------------------
    public function update(int $id)
    {
        $usuario = $this->usuarioModel->find($id);

        if (!$usuario) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)
                ->setJSON(['success' => false, 'message' => 'Usuario no encontrado.']);
        }

        $data = $this->request->getJSON(true);

        $rules = [
            'Nombre'  => 'required|min_length[2]|max_length[100]',
            'Usuario' => "required|min_length[3]|max_length[50]|is_unique[usuario.Usuario,Id,{$id}]",
            'Rol'     => 'permit_empty|in_list[Admin,Operador]',
        ];

        if (!empty($data['Password'])) {
            $rules['Password'] = 'min_length[6]';
        }

        if (!$this->validateData($data, $rules)) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)
                ->setJSON(['success' => false, 'errors' => $this->validator->getErrors()]);
        }

        $campos = [
            'Nombre'  => esc($data['Nombre']),
            'Usuario' => esc($data['Usuario']),
            'Rol'     => isset($data['Rol']) ? $data['Rol'] : $usuario['Rol'],
        ];

        if (!empty($data['Password'])) {
            $campos['Password'] = password_hash($data['Password'], PASSWORD_DEFAULT);
        }

        $this->usuarioModel->update($id, $campos);
        $actualizado = $this->usuarioModel->find($id);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Usuario actualizado.',
            'data'    => $actualizado,
        ]);
    }

    // ---------------------------------------------------------------
    // PATCH /api/usuarios/:id/status
    // ---------------------------------------------------------------
    public function toggleStatus(int $id)
    {
        $usuario = $this->usuarioModel->find($id);

        if (!$usuario) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)
                ->setJSON(['success' => false, 'message' => 'Usuario no encontrado.']);
        }

        $nuevoStatus = $usuario['Status'] === 'Activo' ? 'Inactivo' : 'Activo';
        $this->usuarioModel->update($id, ['Status' => $nuevoStatus]);

        return $this->response->setJSON([
            'success' => true,
            'message' => "Usuario {$nuevoStatus}.",
            'status'  => $nuevoStatus,
        ]);
    }

    // ---------------------------------------------------------------
    // DELETE /api/usuarios/:id  (soft delete)
    // ---------------------------------------------------------------
    public function destroy(int $id)
    {
        $usuario = $this->usuarioModel->find($id);

        if (!$usuario) {
            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)
                ->setJSON(['success' => false, 'message' => 'Usuario no encontrado.']);
        }

        $this->usuarioModel->update($id, ['Status' => 'Eliminado']);

        return $this->response->setJSON(['success' => true, 'message' => 'Usuario eliminado.']);
    }
}

