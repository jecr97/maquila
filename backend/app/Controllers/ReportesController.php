<?php

namespace App\Controllers;

class ReportesController extends BaseController
{
    // GET /api/reportes/resumen?desde=&hasta=&idProveedor=
    public function resumen()
    {
        try {
            $desde       = $this->request->getGet('desde');
            $hasta       = $this->request->getGet('hasta');
            $idProveedor = $this->request->getGet('idProveedor') ? (int) $this->request->getGet('idProveedor') : null;

            $db = \Config\Database::connect();

            // Helper to apply date + proveedor filters to a builder
            // Use $alias when the primary table has an alias (e.g., 'c' or 'pf').
            $applyFilters = function ($builder, $alias = 'c') use ($desde, $hasta, $idProveedor) {
                $createdAtCol = $alias ? ($alias . '.CreatedAt') : 'CreatedAt';
                $idProveedorCol = $alias ? ($alias . '.IdProveedor') : 'IdProveedor';
                if ($desde)       $builder->where($createdAtCol . ' >=', $desde . ' 00:00:00');
                if ($hasta)       $builder->where($createdAtCol . ' <=', $hasta . ' 23:59:59');
                if ($idProveedor) $builder->where($idProveedorCol, $idProveedor);
            };

            // Totals by status
            $qReg = $db->table('corte')->where('Status', 'Registrado');
            $applyFilters($qReg, 'corte');
            $totalRegistrados = $qReg->countAllResults();

            $qCom = $db->table('corte')->where('Status', 'Comenzado');
            $applyFilters($qCom, 'corte');
            $totalComenzados = $qCom->countAllResults();

            $qFin = $db->table('corte')->where('Status', 'Finalizado');
            $applyFilters($qFin, 'corte');
            $totalFinalizados = $qFin->countAllResults();

            $totalCortes = $totalRegistrados + $totalComenzados + $totalFinalizados;

            // Monto total ganado (de cortes finalizados)
            $montoQuery = $db->table('corte')->selectSum('MontoTotal')->where('Status', 'Finalizado');
            $applyFilters($montoQuery, 'corte');
            $montoTotal = (float) ($montoQuery->get()->getRowArray()['MontoTotal'] ?? 0);

            // Piezas totales producidas
            $piezasQuery = $db->table('corte')->selectSum('PiezasProducidas')->where('Status', 'Finalizado');
            $applyFilters($piezasQuery, 'corte');
            $piezasProducidas = (int) ($piezasQuery->get()->getRowArray()['PiezasProducidas'] ?? 0);

            // Total piezas faltantes
            $faltantesQuery = $db->table('piezasfaltantes pf')
                ->selectSum('pf.CantidadFaltante')
                ->join('corte c', 'c.Id = pf.IdCorte', 'left')
                ->where('pf.Status', 'Activo');
            if ($desde)       $faltantesQuery->where('pf.CreatedAt >=', $desde . ' 00:00:00');
            if ($hasta)       $faltantesQuery->where('pf.CreatedAt <=', $hasta . ' 23:59:59');
            if ($idProveedor) $faltantesQuery->where('c.IdProveedor', $idProveedor);
            $totalFaltantes = (int) ($faltantesQuery->get()->getRowArray()['CantidadFaltante'] ?? 0);

            // Piezas faltantes detallado (por corte)
            $faltantesDetalle = $db->table('piezasfaltantes pf')
                ->select('c.Folio, tp.Nombre as NombrePrenda, tc.Nombre as NombreCorte, SUM(pf.CantidadFaltante) as TotalFaltante')
                ->join('corte c', 'c.Id = pf.IdCorte', 'left')
                ->join('tipoprenda tp', 'tp.Id = c.IdTipoPrenda', 'left')
                ->join('tipocorte tc', 'tc.Id = c.IdTipoCorte', 'left')
                ->where('pf.Status', 'Activo');
            if ($desde)       $faltantesDetalle->where('pf.CreatedAt >=', $desde . ' 00:00:00');
            if ($hasta)       $faltantesDetalle->where('pf.CreatedAt <=', $hasta . ' 23:59:59');
            if ($idProveedor) $faltantesDetalle->where('c.IdProveedor', $idProveedor);
            $faltantesDetalle = $faltantesDetalle->groupBy('pf.IdCorte')->get()->getResultArray();

            // Agregado: Desglose por tipo de corte
            $cortesPorTipo = $db->table('corte c')
                ->select('tp.Nombre as NombrePrenda, tc.Nombre as NombreCorte, SUM(c.PiezasProducidas) as TotalPiezas, COUNT(c.Id) as TotalCortes')
                ->join('tipoprenda tp', 'tp.Id = c.IdTipoPrenda', 'left')
                ->join('tipocorte tc', 'tc.Id = c.IdTipoCorte', 'left')
                ->where('c.Status', 'Finalizado');
            $applyFilters($cortesPorTipo, 'c');
            $cortesPorTipo = $cortesPorTipo->groupBy('tp.Id, tc.Id')->get()->getResultArray();

            // Agregado: Producción por proveedor (agrupado y con detalle por prenda/corte)
            $proveedorRows = $db->table('corte c')
                ->select('p.Id as IdProveedor, p.Nombre as NombreProveedor, tp.Nombre as NombrePrenda, tc.Nombre as NombreCorte, COUNT(c.Id) as TotalCortes, SUM(c.PiezasProducidas) as TotalPiezas')
                ->join('proveedor p', 'p.Id = c.IdProveedor', 'left')
                ->join('tipoprenda tp', 'tp.Id = c.IdTipoPrenda', 'left')
                ->join('tipocorte tc', 'tc.Id = c.IdTipoCorte', 'left')
                ->where('c.Status', 'Finalizado');
            $applyFilters($proveedorRows, 'c');
            $proveedorRows = $proveedorRows->groupBy('p.Id, tp.Id, tc.Id')->get()->getResultArray();

            $cortesPorProveedor = [];
            foreach ($proveedorRows as $r) {
                $id = $r['IdProveedor'] ?? null;
                if (!$id) continue;
                if (!isset($cortesPorProveedor[$id])) {
                    $cortesPorProveedor[$id] = [
                        'IdProveedor' => $id,
                        'NombreProveedor' => $r['NombreProveedor'] ?? 'Sin proveedor',
                        'TotalCortes' => 0,
                        'TotalPiezas' => 0,
                        'Detalle' => [],
                    ];
                }
                $cortesPorProveedor[$id]['TotalCortes'] += (int) $r['TotalCortes'];
                $cortesPorProveedor[$id]['TotalPiezas'] += (int) $r['TotalPiezas'];
                $cortesPorProveedor[$id]['Detalle'][] = [
                    'NombrePrenda' => $r['NombrePrenda'] ?? '',
                    'NombreCorte' => $r['NombreCorte'] ?? '',
                    'TotalCortes' => (int) $r['TotalCortes'],
                    'TotalPiezas' => (int) $r['TotalPiezas'],
                ];
            }
            $cortesPorProveedor = array_values($cortesPorProveedor);

            return $this->response->setJSON([
                'success' => true,
                'data'    => [
                    'totalCortes'       => $totalCortes,
                    'totalRegistrados'  => $totalRegistrados,
                    'totalComenzados'   => $totalComenzados,
                    'totalFinalizados'  => $totalFinalizados,
                    'montoTotal'        => $montoTotal,
                    'piezasProducidas'  => $piezasProducidas,
                    'totalFaltantes'    => $totalFaltantes,
                    'faltantesDetalle'  => $faltantesDetalle,
                    'cortesPorTipo'     => $cortesPorTipo,
                    'cortesPorProveedor'=> $cortesPorProveedor,
                ],
            ]);
        } catch (\Exception $e) {
            return $this->response->setStatusCode(500)->setJSON([
                'success' => false,
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
        }
    }

    // GET /api/dashboard/stats
    public function dashboardStats()
    {
        $db = \Config\Database::connect();

        $registrados  = $db->table('corte')->where('Status', 'Registrado')->countAllResults();
        $enProduccion = $db->table('corte')->where('Status', 'Comenzado')->countAllResults();
        $finalizados  = $db->table('corte')->where('Status', 'Finalizado')->countAllResults();
        $faltantes    = (int) ($db->table('piezasfaltantes')
            ->selectSum('CantidadFaltante')
            ->where('Status', 'Activo')
            ->get()->getRowArray()['CantidadFaltante'] ?? 0);

        return $this->response->setJSON([
            'success' => true,
            'data'    => [
                'registrados'  => $registrados,
                'enProduccion' => $enProduccion,
                'finalizados'  => $finalizados,
                'faltantes'    => $faltantes,
            ],
        ]);
    }
}
