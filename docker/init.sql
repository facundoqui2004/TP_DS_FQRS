-- Script de inicialización para la base de datos
-- Este archivo se ejecutará automáticamente cuando se cree el contenedor de MySQL

USE metahumano;

-- Crear tablas adicionales si es necesario
-- Las tablas principales se crearán automáticamente por MikroORM

-- Insertar datos de ejemplo (opcional)
-- INSERT INTO tabla_ejemplo (campo1, campo2) VALUES ('valor1', 'valor2');

-- Configuraciones adicionales
SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
