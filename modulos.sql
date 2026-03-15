-- ============================================================
-- Script SQL — Sistema de Módulos y Permisos
-- Base de datos: maquilaropa
-- Ejecutar en phpMyAdmin o consola MySQL de Hostinger
-- ============================================================

-- 1) Tabla de módulos del sistema
CREATE TABLE IF NOT EXISTS `modulo` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(100) NOT NULL,
  `Ruta` VARCHAR(100) NOT NULL COMMENT 'Ruta frontend, ej: /cortes',
  `Icono` VARCHAR(50) DEFAULT NULL COMMENT 'Nombre icono FontAwesome',
  `Orden` INT NOT NULL DEFAULT 0,
  `Status` ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uq_modulo_ruta` (`Ruta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2) Tabla relación usuario-módulo
CREATE TABLE IF NOT EXISTS `usuario_modulo` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `IdUsuario` INT NOT NULL,
  `IdModulo` INT NOT NULL,
  `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uq_usuario_modulo` (`IdUsuario`, `IdModulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3) Insertar los módulos del sistema (orden = posición en sidebar)
INSERT INTO `modulo` (`Nombre`, `Ruta`, `Icono`, `Orden`) VALUES
('Dashboard',           '/',                'faGauge',                1),
('Usuarios',            '/usuarios',        'faUsers',                2),
('Proveedores',         '/proveedores',     'faBuilding',             3),
('Tipos de Prenda',     '/tipos-prenda',    'faShirt',                4),
('Tipos de Corte',      '/tipos-corte',     'faScissors',             5),
('Precios de Maquila',  '/precios-maquila', 'faTags',                 6),
('Cortes',              '/cortes',          'faLayerGroup',           7),
('Producción',          '/produccion',      'faIndustry',             8),
('Piezas Faltantes',    '/piezas-faltantes','faTriangleExclamation',  9),
('Reportes',            '/reportes',        'faChartBar',            10);

-- 4) Asignar TODOS los módulos al usuario Admin (Id=1)
--    Ajusta el Id si tu admin tiene otro Id.
INSERT INTO `usuario_modulo` (`IdUsuario`, `IdModulo`)
SELECT 1, Id FROM `modulo`;

-- 5) Asignar módulos de Operador al usuario operador (Id=2)
--    Operador puede ver: Dashboard, Tipos de Prenda, Tipos de Corte,
--    Precios de Maquila, Cortes, Producción, Piezas Faltantes, Reportes.
--    Ajusta el IdUsuario=2 según tus usuarios operador existentes.
--    Si no tienes usuario operador aún, omite estas líneas.
-- INSERT INTO `usuario_modulo` (`IdUsuario`, `IdModulo`)
-- SELECT 2, Id FROM `modulo` WHERE `Ruta` IN (
--   '/', '/tipos-prenda', '/tipos-corte', '/precios-maquila',
--   '/cortes', '/produccion', '/piezas-faltantes', '/reportes'
-- );
