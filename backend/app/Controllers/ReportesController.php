<?php

namespace App\Controllers;

class ReportesController extends BaseController
{
    // GET /api/reportes/resumen?desde=&hasta=&idProveedor=
    public function resumen()
    {
        $desde       = $this->request->getGet('desde');
        $hasta       = $this->request->getGet('hasta');
        $idProveedor = $this->request->getGet('idProveedor') ? (int) $this->request->getGet('idProveedor') : null;

        $db = \Config\Database::connect();

        // Helper to apply date + proveedor filters to a corte builder
        $applyFilters = function ($builder) use ($desde, $hasta, $idProveedor) {
            if ($desde)       $builder->where('CreatedAt >=', $desde . ' 00:00:00');
            if ($hasta)       $builder->where('CreatedAt <=', $hasta . ' 23:59:59');
            if ($idProveedor) $builder->where('IdProveedor', $idProveedor);
        };

        // Totals by status
        $qReg = $db->table('corte')->where('Status', 'Registrado');
        $applyFilters($qReg);
        $totalRegistrados = $qReg->countAllResults();

        $qCom = $db->table('corte')->where('Status', 'Comenzado');
        $applyFilters($qCom);
        $totalComenzados = $qCom->countAllResults();

        $qFin = $db->table('corte')->where('Status', 'Finalizado');
        $applyFilters($qFin);
        $totalFinalizados = $qFin->countAllResults();

        $totalCortes = $totalRegistrados + $totalComenzados + $totalFinalizados;

        // Monto total ganado (de cortes finalizados)
        $montoQuery = $db->table('corte')->selectSum('MontoTotal')->where('Status', 'Finalizado');
        $applyFilters($montoQuery);
        $montoTotal = (float) ($montoQuery->get()->getRowArray()['MontoTotal'] ?? 0);

        // Piezas totales producidas
        $piezasQuery = $db->table('corte')->selectSum('PiezasProducidas')->where('Status', 'Finalizado');
        $applyFilters($piezasQuery);
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
            ],
        ]);
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
