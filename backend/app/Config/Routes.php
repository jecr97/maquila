<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// Manejo de preflight OPTIONS para CORS
$routes->options('(:any)', static function () {
    return service('response')->setStatusCode(200);
});

// API routes
$routes->group('api', ['namespace' => 'App\Controllers'], function ($routes) {
    // Auth
    $routes->post('auth/login', 'UsuariosController::login');

    // Usuarios
    $routes->get('usuarios', 'UsuariosController::index');
    $routes->get('usuarios/(:num)', 'UsuariosController::show/$1');
    $routes->post('usuarios', 'UsuariosController::store');
    $routes->put('usuarios/(:num)', 'UsuariosController::update/$1');
    $routes->patch('usuarios/(:num)/status', 'UsuariosController::toggleStatus/$1');
    $routes->delete('usuarios/(:num)', 'UsuariosController::destroy/$1');

    // Tipos de Prenda
    $routes->get('tipos-prenda', 'TipoPrendaController::index');
    $routes->post('tipos-prenda', 'TipoPrendaController::store');
    $routes->put('tipos-prenda/(:num)', 'TipoPrendaController::update/$1');
    $routes->patch('tipos-prenda/(:num)/status', 'TipoPrendaController::toggleStatus/$1');
    $routes->delete('tipos-prenda/(:num)', 'TipoPrendaController::destroy/$1');

    // Tipos de Corte
    $routes->get('tipos-corte', 'TipoCorteController::index');
    $routes->post('tipos-corte', 'TipoCorteController::store');
    $routes->put('tipos-corte/(:num)', 'TipoCorteController::update/$1');
    $routes->patch('tipos-corte/(:num)/status', 'TipoCorteController::toggleStatus/$1');
    $routes->delete('tipos-corte/(:num)', 'TipoCorteController::destroy/$1');

    // Precios de Maquila
    $routes->get('precios', 'PrecioPrendaCorteController::index');
    $routes->get('precios/catalogos', 'PrecioPrendaCorteController::catalogos');
    $routes->post('precios', 'PrecioPrendaCorteController::store');
    $routes->put('precios/(:num)', 'PrecioPrendaCorteController::update/$1');
    $routes->patch('precios/(:num)/status', 'PrecioPrendaCorteController::toggleStatus/$1');
    $routes->delete('precios/(:num)', 'PrecioPrendaCorteController::destroy/$1');

    // Cortes
    $routes->get('cortes', 'CorteController::index');
    $routes->get('cortes/catalogos', 'CorteController::catalogos');
    $routes->get('cortes/(:num)', 'CorteController::show/$1');
    $routes->post('cortes', 'CorteController::store');
    $routes->put('cortes/(:num)', 'CorteController::update/$1');
    $routes->patch('cortes/(:num)/comenzar', 'CorteController::comenzar/$1');
    $routes->patch('cortes/(:num)/finalizar', 'CorteController::finalizar/$1');
    $routes->delete('cortes/(:num)', 'CorteController::destroy/$1');

    // Corte Detalle
    $routes->get('cortes/(:num)/detalles', 'CorteDetalleController::index/$1');
    $routes->post('cortes/(:num)/detalles', 'CorteDetalleController::store/$1');
    $routes->delete('cortes/(:num)/detalles/(:num)', 'CorteDetalleController::destroy/$1/$2');

    // Piezas Faltantes
    $routes->get('piezas-faltantes', 'PiezasFaltantesController::index');
    $routes->get('cortes/(:num)/faltantes', 'PiezasFaltantesController::porCorte/$1');
    $routes->post('cortes/(:num)/faltantes', 'PiezasFaltantesController::store/$1');
    $routes->delete('cortes/(:num)/faltantes/(:num)', 'PiezasFaltantesController::destroy/$1/$2');

    // Dashboard & Reportes
    $routes->get('dashboard/stats', 'ReportesController::dashboardStats');
    $routes->get('reportes/resumen', 'ReportesController::resumen');

    // Proveedores
    $routes->get('proveedores', 'ProveedorController::index');
    $routes->post('proveedores/reiniciar', 'ProveedorController::reiniciar');
    $routes->post('proveedores', 'ProveedorController::store');
    $routes->put('proveedores/(:num)', 'ProveedorController::update/$1');
    $routes->patch('proveedores/(:num)/status', 'ProveedorController::toggleStatus/$1');
    $routes->delete('proveedores/(:num)', 'ProveedorController::destroy/$1');

    // Módulos
    $routes->get('modulos', 'ModulosController::index');
    $routes->get('usuarios/(:num)/modulos', 'ModulosController::modulosDeUsuario/$1');
    $routes->post('usuarios/(:num)/modulos', 'ModulosController::sincronizarModulos/$1');
});
