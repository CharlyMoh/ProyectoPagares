DROP DATABASE IF EXISTS despacho_pagares_db;
CREATE DATABASE despacho_pagares_db;
USE despacho_pagares_db;


-- ============================================================================
-- 1. CATÁLOGOS GENERALES
-- ============================================================================

-- Estados de la República (Para clasificación geográfica y orden del despacho)
CREATE TABLE estados_republica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================================
-- 2. CONTROL DE ACCESOS Y ROLES (RBAC)
-- ============================================================================

-- Usuarios / Abogados del Despacho
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Almacenará el hash en producción
    rol ENUM('Socio', 'Senior', 'Junior') NOT NULL DEFAULT 'Junior',
    activo BOOLEAN DEFAULT TRUE, -- Borrado lógico: FALSE revoca el acceso al login
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================================
-- 3. ENTIDADES DE NEGOCIO
-- ============================================================================

-- Clientes / Deudores
CREATE TABLE deudores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    domicilio VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    estado_residencia_id INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estado_residencia_id) REFERENCES estados_republica(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Pagarés (Estructura Art. 170 LGTOC + Formato Formitec)
CREATE TABLE pagares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_expediente VARCHAR(50) NOT NULL, -- Caso o contrato raíz del despacho
    deudor_id INT NOT NULL,                 -- Relación directa con el deudor
    
    -- Lógica de Pagarés Consecutivos (Ej: Pagaré 1 de 3)
    numero_pagare INT NOT NULL DEFAULT 1,   -- Consecutivo actual
    total_pagares INT NOT NULL DEFAULT 1,   -- Total de la serie dividida
    
    -- Datos Financieros y Legales Obligatorios
    monto_numerico DECIMAL(12, 2) NOT NULL,
    monto_letra VARCHAR(255) NOT NULL,
    nombre_beneficiario VARCHAR(150) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    lugar_pago VARCHAR(255) NOT NULL,
    fecha_suscripcion DATE NOT NULL,
    lugar_suscripcion VARCHAR(255) NOT NULL,
    estado_suscripcion_id INT NOT NULL,     -- Estado de la república donde se firma
    
    -- Información del Aval (Opcional en formato Formitec)
    nombre_aval VARCHAR(150) DEFAULT NULL,
    domicilio_aval VARCHAR(255) DEFAULT NULL,
    
    -- Ciclo de Vida del Pagaré
    estado ENUM('Activo', 'Pendiente Autorizacion', 'Pagado', 'Cancelado') NOT NULL DEFAULT 'Activo',
    
    -- Control de Auditoría Interna
    usuario_creador_id INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (deudor_id) REFERENCES deudores(id) ON DELETE RESTRICT,
    FOREIGN KEY (estado_suscripcion_id) REFERENCES estados_republica(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_creador_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================================
-- 4. FLUJO DE AUTORIZACIONES Y AUDITORÍA
-- ============================================================================

-- Solicitudes de Modificación (Flujo Jerárquico de 3 Niveles)
CREATE TABLE solicitudes_modificacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pagare_id INT NOT NULL,
    usuario_solicita_id INT NOT NULL,       -- Abogado Junior que detecta el cambio
    justificacion TEXT NOT NULL,            -- Justificación legal obligatoria
    
    -- Valores propuestos a actualizar
    monto_propuesto DECIMAL(12, 2) DEFAULT NULL,
    fecha_vencimiento_propuesta DATE DEFAULT NULL,
    
    -- Estados de la Solicitud
    estado_solicitud ENUM('Pendiente Coordinador', 'Pendiente Socio', 'Aprobada', 'Rechazada') NOT NULL DEFAULT 'Pendiente Coordinador',
    
    -- Validación de Nivel 2 (Abogado Senior)
    usuario_valida_senior_id INT DEFAULT NULL,
    fecha_validacion_senior TIMESTAMP NULL DEFAULT NULL,
    
    -- Autorización de Nivel 3 (Socio Director)
    usuario_autoriza_socio_id INT DEFAULT NULL,
    fecha_autorizacion_socio TIMESTAMP NULL DEFAULT NULL,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pagare_id) REFERENCES pagares(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_solicita_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_valida_senior_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_autoriza_socio_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Log de Auditoría Inmutable
CREATE TABLE historial_auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pagare_id INT NOT NULL,
    usuario_id INT NOT NULL, -- Responsable de la última acción del flujo
    accion VARCHAR(100) NOT NULL, -- 'CREACION', 'MODIFICACION_AUTORIZADA', 'PAGADO', 'CANCELADO', 'BAJA_USUARIO'
    detalles_cambio TEXT NOT NULL, -- Registro de cambios estructurado en texto o JSON
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pagare_id) REFERENCES pagares(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar Estados Base
INSERT INTO estados_republica (nombre) VALUES 
('Puebla'), ('Ciudad de México'), ('Estado de México'), ('Veracruz'), ('Tlaxcala'), ('Jalisco'), ('Nuevo León');

-- Insertar los 3 Niveles de Usuarios Activos
INSERT INTO usuarios (nombre, correo, password, rol, activo) VALUES 
('Lic. Alejandro Altamirano (Director)', 'socio@despacho.com', 'socio123', 'Socio', TRUE),
('Lic. Beatriz Mendoza (Coordinadora)', 'senior@despacho.com', 'senior123', 'Senior', TRUE),
('Lic. Carlos Gómez (Postulante)', 'junior@despacho.com', 'junior123', 'Junior', TRUE);

-- Insertar deudor de muestra vinculado al catálogo de estados (1 = Puebla)
INSERT INTO deudores (nombre, domicilio, telefono, estado_residencia_id) VALUES
('Juan Pérez López', 'Av. Reforma 123, Col. Centro', '2221234567', 1);
SELECT * FROM deudores;
UPDATE deudores
SET nombre = 'Javier Nolasco Hernández'
WHERE id = 1;

SELECT * FROM pagares;
