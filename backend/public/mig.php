<?php
$db = new mysqli('localhost', 'root', '', 'maquilaropa');
if ($db->connect_error) { die('Connection failed: ' . $db->connect_error); }

$queries = [
    "CREATE TABLE IF NOT EXISTS `proveedor` (
        `Id` INT AUTO_INCREMENT PRIMARY KEY,
        `Nombre` VARCHAR(150) NOT NULL,
        `Correo` VARCHAR(150) DEFAULT NULL,
        `Telefono` VARCHAR(20) DEFAULT NULL,
        `Status` ENUM('Activo','Inactivo','Eliminado') NOT NULL DEFAULT 'Activo',
        `CreatedAt` DATETIME DEFAULT NULL,
        `UpdatedAt` DATETIME DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    "ALTER TABLE `corte` ADD COLUMN IF NOT EXISTS `IdProveedor` INT DEFAULT NULL",

    "ALTER TABLE `piezasfaltantes` ADD COLUMN IF NOT EXISTS `AplicaDescuento` TINYINT(1) NOT NULL DEFAULT 1",
];

foreach ($queries as $q) {
    if ($db->query($q)) echo "OK: " . substr($q, 0, 70) . "...\n";
    else echo "ERROR: " . $db->error . "\n";
}
$db->close();
echo "\nMigration done.\n";
