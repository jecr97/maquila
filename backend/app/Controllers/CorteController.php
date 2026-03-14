<?php

namespace App\Controllers;

use App\Models\CorteModel;
use App\Models\CorteDetalleModel;
use App\Models\PiezasFaltantesModel;
use App\Models\PrecioPrendaCorteModel;

class CorteController extends BaseController
{
    private CorteModel $model;

    public function __construct()
    {
        $this->model = new CorteModel();
    }

    // GET /api/cortes
    public function index()
    {
        $status      = $this->request->getGet('status');
        $desde       = $this->request->getGet('desde');
        $hasta       = $this->request->getGet('hasta');
        $idProveedor = $this->request->getGet('idProveedor') ? (int) $this->request->getGet('idProveedor') : null;

        return $this->response->setJSON([
            'success' => true,
            'data'    => $this->model->getConNombres($status, $desde, $hasta, $idProveedor),
        ]);
    }

    // GET /api/cortes/:id
    public function show(int $id)
    {
        $corte = $this->model->find($id);
        if (!$corte || $corte['Status'] === 'Eliminado') {
            return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'Corte no encontrado.']);
        }

        $detalleModel   = new CorteDetalleModel();
        $faltantesModel = new PiezasFaltantesModel();

        $db = \Config\Database::connect();
        $full = $db->table('corte c')
            ->select('c.*, tp.Nombre as NombrePrenda, tc.Nombre as NombreCorte, u.Nombre as NombreUsuario, p.Nombre as NombreProveedor')
            ->join('tipoprenda tp', 'tp.Id = c.IdTipoPrenda', 'left')
            ->join('tipocorte tc', 'tc.Id = c.IdTipoCorte', 'left')
            ->join('usuario u', 'u.Id = c.IdUsuarioRegistro', 'left')
            ->join('proveedor p', 'p.Id = c.IdProveedor', 'left')
            ->where('c.Id', $id)
            ->get()->getRowArray();

        $full['detalles']   = $detalleModel->getPorCorte($id);
        $full['faltantes']  = $faltantesModel->getPorCorte($id);
        $full['totalProcesadas'] = $detalleModel->totalProcesadas($id);
        $full['totalFaltantes']  = $faltantesModel->totalFaltantes($id);

        return $this->response->setJSON(['success' => true, 'data' => $full]);
    }

    // GET /api/cortes/catalogos
    public function catalogos()
    {
        $prendas     = (new \App\Models\TipoPrendaModel())->getActivos();
        $cortes      = (new \App\Models\TipoCorteModel())->getActivos();
        $proveedores = (new \App\Models\ProveedorModel())->getActivos();

        return $this->response->setJSON([
            'success'     => true,
            'prendas'     => $prendas,
            'cortes'      => $cortes,
            'proveedores' => $proveedores,
        ]);
    }

    // POST /api/cortes
    public function store()
    {
        $data  = $this->request->getJSON(true);
        $rules = [
            'IdTipoPrenda'      => 'required|is_natural_no_zero',
            'IdTipoCorte'       => 'required|is_natural_no_zero',
            'CantidadPiezas'    => 'required|is_natural_no_zero',
            'IdUsuarioRegistro' => 'required|is_natural_no_zero',
        ];

        if (!$this->validateData($data, $rules)) {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'errors' => $this->validator->getErrors()]);
        }

        // Auto-fill price from PrecioPrendaCorte
        $precioModel = new PrecioPrendaCorteModel();
        $precio = $precioModel->where('IdTipoPrenda', $data['IdTipoPrenda'])
            ->where('IdTipoCorte', $data['IdTipoCorte'])
            ->where('Status', 'Activo')
            ->first();

        $data['PrecioUnitario'] = $precio ? $precio['Precio'] : 0;
        $data['Status'] = 'Registrado';

        $this->model->insert($data);
        $id = $this->model->getInsertID();

        // Generate folio based on actual ID
        $folio = 'C-' . str_pad($id, 5, '0', STR_PAD_LEFT);
        $this->model->update($id, ['Folio' => $folio]);

        return $this->response->setJSON(['success' => true, 'message' => 'Corte registrado.', 'id' => $id, 'folio' => $folio]);
    }

    // PUT /api/cortes/:id
    public function update(int $id)
    {
        $corte = $this->model->find($id);
        if (!$corte || $corte['Status'] === 'Eliminado') {
            return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'Corte no encontrado.']);
        }

        if ($corte['Status'] === 'Finalizado') {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'message' => 'No se puede editar un corte finalizado.']);
        }

        $data  = $this->request->getJSON(true);
        $rules = [
            'IdTipoPrenda'   => 'required|is_natural_no_zero',
            'IdTipoCorte'    => 'required|is_natural_no_zero',
            'CantidadPiezas' => 'required|is_natural_no_zero',
        ];

        if (!$this->validateData($data, $rules)) {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'errors' => $this->validator->getErrors()]);
        }

        // Re-fetch price
        $precioModel = new PrecioPrendaCorteModel();
        $precio = $precioModel->where('IdTipoPrenda', $data['IdTipoPrenda'])
            ->where('IdTipoCorte', $data['IdTipoCorte'])
            ->where('Status', 'Activo')
            ->first();
        $data['PrecioUnitario'] = $precio ? $precio['Precio'] : 0;

        $allowed = ['IdTipoPrenda', 'IdTipoCorte', 'CantidadPiezas', 'PrecioUnitario', 'IdProveedor'];
        $this->model->update($id, array_intersect_key($data, array_flip($allowed)));

        return $this->response->setJSON(['success' => true, 'message' => 'Corte actualizado.']);
    }

    // PATCH /api/cortes/:id/comenzar
    public function comenzar(int $id)
    {
        $corte = $this->model->find($id);
        if (!$corte || $corte['Status'] !== 'Registrado') {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'message' => 'Solo se puede comenzar un corte en estado Registrado.']);
        }
        $this->model->update($id, ['Status' => 'Comenzado']);
        return $this->response->setJSON(['success' => true, 'message' => 'Corte comenzado.']);
    }

    // PATCH /api/cortes/:id/finalizar
    public function finalizar(int $id)
    {
        $corte = $this->model->find($id);
        if (!$corte || $corte['Status'] !== 'Comenzado') {
            return $this->response->setStatusCode(422)->setJSON(['success' => false, 'message' => 'Solo se puede finalizar un corte en estado Comenzado.']);
        }

        $data = $this->request->getJSON(true);

        $faltantesModel = new PiezasFaltantesModel();
        $totalFaltantes = $faltantesModel->totalFaltantesConDescuento($id);
        $piezasProducidas = (int) $corte['CantidadPiezas'] - $totalFaltantes;
        if ($piezasProducidas < 0) $piezasProducidas = 0;

        $montoTotal = $piezasProducidas * (float) $corte['PrecioUnitario'];

        $this->model->update($id, [
            'Status'            => 'Finalizado',
            'PiezasProducidas'  => $piezasProducidas,
            'MontoTotal'        => $montoTotal,
            'IdUsuarioFinalizo' => $data['IdUsuario'] ?? null,
            'FechaFinalizacion' => date('Y-m-d H:i:s'),
        ]);

        return $this->response->setJSON([
            'success'          => true,
            'message'          => 'Corte finalizado.',
            'piezasProducidas' => $piezasProducidas,
            'montoTotal'       => $montoTotal,
        ]);
    }

    // DELETE /api/cortes/:id
    public function destroy(int $id)
    {
        $corte = $this->model->find($id);
        if (!$corte) {
            return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'No encontrado.']);
        }
        $this->model->update($id, ['Status' => 'Eliminado']);
        return $this->response->setJSON(['success' => true, 'message' => 'Corte eliminado.']);
    }
}
