# ShipNow API (Backend III)

API de logística para gestión de usuarios, pedidos, entregas y carga documental. El proyecto se organiza por capas, con manejo centralizado de errores, logging y documentación Swagger para facilitar integración y revisión técnica.

## Objetivo del proyecto

ShipNow busca ofrecer una API profesional y mantenible para operar procesos logísticos, incorporando además la gestión de archivos asociados a entidades del sistema:

- usuarios con documentos personales
- comprobantes asociados a órdenes y entregas
- validación de tipo y tamaño de archivo
- almacenamiento seguro en carpetas del servidor
- registro de metadatos únicamente en base de datos

## Stack técnico

- Node.js + Express
- MongoDB + Mongoose
- Multer para carga de archivos multipart/form-data
- Swagger (`swagger-jsdoc`, `swagger-ui-express`)
- Winston + `winston-daily-rotate-file`
- Faker para generación de datos mock

## Arquitectura

Flujo principal:

`routes -> controllers -> services -> repositories -> models`

Estructura relevante:

- `src/routes/` endpoints HTTP
- `src/controllers/` capa HTTP
- `src/services/` reglas de negocio
- `src/repositories/` acceso a datos
- `src/models/` esquemas Mongoose
- `src/middlewares/` middlewares de upload, errores, logging y 404
- `src/utils/` logger y utilidades de errores
- `src/config/` configuración de entorno y Swagger
- `uploads/` carpeta local de almacenamiento documental (ignorada por Git)

## Requisitos

- Node.js 18+
- MongoDB local o remoto

## Instalación y ejecución

1. Instalar dependencias:

```bash
npm install
```

2. Crear variables de entorno:

```bash
# Linux/macOS/Git Bash
cp .env.example .env

# PowerShell (Windows)
Copy-Item .env.example .env
```

3. Levantar en desarrollo:

```bash
npm run dev
```

4. Swagger UI:

- `http://localhost:3003/api/docs`
- `http://localhost:3003/api-docs`

## Variables de entorno

| Variable | Requerida | Descripción | Default |
| --- | --- | --- | --- |
| `PORT` | No | Puerto HTTP de la API | `3003` |
| `MONGODB_URI` | No | URI de conexión a MongoDB | `mongodb://localhost:27017/shipnow` |
| `NODE_ENV` | No | Entorno (`development`, `test`, `production`) | `development` |
| `LOG_LEVEL` | No | Nivel mínimo de logging | `info` |
| `JWT_SECRET` | No | Valor disponible en config para usos futuros | `""` |

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Levanta servidor con nodemon |
| `npm start` | Levanta servidor con node |
| `npm test` | Ejecuta la suite funcional con Supertest + Mocha |

## Testing

La suite funcional del proyecto se ejecuta con:

```bash
npm test
```

### Cobertura de tests

La suite funcional integra **31 tests pasando** con Supertest y Mocha, cubriendo todas las funcionalidades:

| Suite | Tests | Cobertura |
|-------|-------|-----------|
| Users API | 9 | CRUD + permission controls + document upload |
| Orders API | 7 | CRUD + status updates + proof attachment |
| Uploads | 4 | Success case + missing file + invalid type + entity not found |
| Mocks API | 6 | Users + Orders + Snapshot + Seed validation |
| Logger / Swagger / 404 | 5 | Infrastructure + API documentation + error handling |
| **TOTAL** | **31** | **100% PASSING** ✅ |

### Requisitos para testing

- Node.js 18+
- MongoDB configurado en `MONGODB_URI_TEST` o `MONGODB_URI`
- Variables cargadas desde `.env.test` o `.env`
- Multer upload folders writable (auto-created during tests)

### Ejecución de tests

```bash
# Ejecutar todos los tests
npm test

# Resultado esperado
# ✓ 31 passing (604ms)
```

### Tests de carga de archivos (Módulo 7)

Los 4 tests del módulo de uploads validan:

1. ✅ **Carga exitosa**: documento válido con metadatos
2. ✅ **Archivo faltante**: error MISSING_FILE (400)
3. ✅ **Tipo no permitido**: error INVALID_DOCUMENT_TYPE (400)
4. ✅ **Entidad no existe**: error DELIVERY_NOT_FOUND_ERROR (404)

## Rutas principales

Base: `/api`

- `GET /api/health`
- Usuarios:
  - `GET /api/users`
  - `GET /api/users/:id`
  - `POST /api/users`
  - `PUT /api/users/:id`
  - `DELETE /api/users/:id`
  - `POST /api/users/:id/documents`
- Pedidos:
  - `GET /api/orders`
  - `GET /api/orders/:id`
  - `POST /api/orders`
  - `PUT /api/orders/:id`
  - `DELETE /api/orders/:id`
  - `POST /api/orders/:id/proof`
- Entregas:
  - `GET /api/deliveries`
  - `GET /api/deliveries/:id`
  - `POST /api/deliveries`
  - `PUT /api/deliveries/:id`
  - `DELETE /api/deliveries/:id`
  - `POST /api/deliveries/:id/proof`
- Mocks:
  - `GET /api/mocks/users`
  - `GET /api/mocks/orders`
  - `GET /api/mocks/deliveries`
  - `GET /api/mocks/snapshot`
  - `POST /api/mocks/seed`
- Logger técnico:
  - `GET /api/logger`
  - `GET /api/logger/error`

## Carga de archivos y documentos (Módulo 7)

### Decisiones de diseño para el Módulo 7

#### 1. Por qué Multer y almacenamiento en disco

**Decisión**: Usar Multer con diskStorage para guardar archivos en carpetas del servidor.

**Razonamiento**:
- Consideré guardar todo en MongoDB (binarios), pero los archivos pueden ser grandes (fotos, PDFs) y ralentizar las consultas
- Consideré usar S3/cloud, pero para un proyecto educativo local era innecesario
- **Elegí diskStorage** porque es simple, no requiere dependencias adicionales y permite recuperar archivos rápidamente sin pasar por la base de datos
- Los metadatos (nombre original, tamaño, tipo, fecha) se guardan en MongoDB para consultas rápidas

#### 2. Carpetas separadas por tipo de documento

**Decisión**: Crear tres carpetas distintas: `uploads/documents`, `uploads/receipts`, `uploads/proofs`.

**Razonamiento**:
- Una carpeta única sería más simple, pero dificulta la auditoría y gestión
- **Elegí separar por tipo** para:
  - Facilitar backups selectivos (ej: respaldar solo documentos de usuarios)
  - Permitir políticas de retención diferentes por tipo
  - Hacer más legible la estructura del servidor
  - Simplificar limpieza de archivos obsoletos

#### 3. Nombres de archivo únicos con timestamp + aleatorio

**Decisión**: Generar nombres como `1704150000000-a7f3b2.pdf` en lugar de usar el nombre original.

**Razonamiento**:
- Los nombres originales pueden tener caracteres especiales, espacios o colisiones
- Nombrar con timestamp + aleatorio previene:
  - Sobrescrituras accidentales si suben dos archivos con igual nombre
  - Ataques que intenten adivinar URLs de archivos
  - Problemas con caracteres unicode
- El nombre original se preserva en metadatos para que el usuario sepa qué subió

#### 4. Validaciones en dos capas: Multer + Service

**Decisión**: Validar en uploadMIddleware + nuevamente en el servicio.

**Razonamiento**:
- Si solo validaba en Multer, el archivo se guardaba aunque la entidad no exista (desperdicio de almacenamiento)
- **Elegí dos capas** para:
  - Multer rechaza archivos inválidos (tipo, extensión, tamaño) rápidamente
  - Service valida si el usuario/pedido/entrega existe antes de guardar
  - Respuesta de error consistente con el ErrorDictionary del proyecto
  - Si falla, el archivo se elimina automáticamente (no queda basura)

#### 5. Metadatos en MongoDB en lugar de solo archivos

**Decisión**: Guardar objeto con `{ originalName, fileName, path, mimetype, size, type, uploadedAt }`.

**Razonamiento**:
- Permite queries rápidas: "¿cuántos documentos de tipo DNI tiene el usuario?"
- Facilita auditoría: quién subió, cuándo, qué tipo
- Permite soft-deletes: marcar como inactivo sin borrar el archivo
- La aplicación puede recuperar el archivo sin listar el directorio

### Configuración de Multer

La configuración se mantiene centralizada en `src/middlewares/uploadMIddleware.js`:

- **diskStorage** con nombres controlados y seguros
- **Carpetas organizadas**: `uploads/{documents, receipts, proofs}`
- **Límites de tamaño**: 5MB por archivo
- **File filter** con validaciones de tipo MIME y extensión

### Tipos de documento permitidos

Para documentos de usuario:

- `dni` - Documento Nacional de Identidad
- `cuit` - Código Único de Identificación Tributaria
- `pasaporte` - Pasaporte
- `licencia` - Licencia de conducir
- `driver_license` - Driver license (equivalente)
- `cedula` - Cédula de identidad
- `comprobante` - Comprobante de domicilio
- `factura` - Factura
- `recibo` - Recibo de pago

### Tipos MIME y extensiones permitidas

- `application/pdf` → `.pdf`
- `image/png` → `.png`
- `image/jpeg` → `.jpg`, `.jpeg`

### Endpoints de carga

#### 1. Documento de usuario

```bash
POST /api/users/:id/documents
Content-Type: multipart/form-data

Fields:
  - document (binary, required) - Archivo a cargar
  - type (string, required) - Tipo de documento (dni, cuit, pasaporte, etc.)
```

**Ejemplo:**
```bash
curl -X POST http://localhost:3003/api/users/507f1f77bcf86cd799439011/documents \
  -F "document=@./documento.pdf" \
  -F "type=dni"
```

**Respuestas:**
- `200 OK` - Documento cargado exitosamente
- `400 Bad Request` - Archivo faltante, tipo inválido, tamaño excedido, tipo de documento inválido
- `404 Not Found` - Usuario no encontrado

#### 2. Comprobante de orden

```bash
POST /api/orders/:id/proof
Content-Type: multipart/form-data

Fields:
  - proof (binary, required) - Archivo de comprobante
```

**Ejemplo:**
```bash
curl -X POST http://localhost:3003/api/orders/507f1f77bcf86cd799439011/proof \
  -F "proof=@./comprobante.pdf"
```

**Respuestas:**
- `200 OK` - Comprobante asociado exitosamente
- `400 Bad Request` - Archivo faltante, tipo inválido, tamaño excedido
- `404 Not Found` - Orden no encontrada

#### 3. Comprobante de entrega

```bash
POST /api/deliveries/:id/proof
Content-Type: multipart/form-data

Fields:
  - proof (binary, required) - Archivo de comprobante de entrega
```

**Ejemplo:**
```bash
curl -X POST http://localhost:3003/api/deliveries/507f1f77bcf86cd799439011/proof \
  -F "proof=@./comprobante_entrega.pdf"
```

**Respuestas:**
- `200 OK` - Comprobante asociado exitosamente
- `400 Bad Request` - Archivo faltante, tipo inválido, tamaño excedido
- `404 Not Found` - Entrega no encontrada

### Almacenamiento y metadatos

- **Archivos**: se guardan en `uploads/` con nombres seguros y único
- **Metadatos en MongoDB**: solo se persisten referencias y metadatos
  - `originalName` - Nombre original del archivo
  - `fileName` - Nombre seguro generado
  - `path` - Ruta de almacenamiento
  - `mimetype` - Tipo MIME
  - `size` - Tamaño en bytes
  - `type` - Tipo de documento
  - `uploadedAt` - Timestamp de carga

### Validaciones implementadas

- ✅ Archivo requerido (MISSING_FILE)
- ✅ Tipo MIME permitido (INVALID_FILE_TYPE)
- ✅ Extensión permitida (INVALID_FILE_TYPE)
- ✅ Tamaño máximo 5MB (FILE_TOO_LARGE)
- ✅ Tipo de documento válido (INVALID_DOCUMENT_TYPE)
- ✅ Entidad existe antes de asociar archivo
- ✅ Campo correcto en request (UNEXPECTED_FILE_FIELD)

### Recuperación de documentos

Los documentos se pueden recuperar junto con la entidad:

```bash
GET /api/users/:id
```

La respuesta incluye el array `documents` con todos los archivos asociados y sus metadatos.



## Formato de errores

La API normaliza los errores desde un diccionario central (`src/utils/errors.js`) y responde con un formato consistente:

```json
{
  "success": false,
  "status": "fail",
  "error": {
    "id": 12,
    "code": "INVALID_ID_ERROR",
    "message": "Id inválido"
  },
  "timestamp": "2026-10-19T22:00:00.000Z"
}
```

Errores contemplados para archivos incluidos:

- `MISSING_FILE`
- `INVALID_FILE_TYPE`
- `FILE_TOO_LARGE`
- `INVALID_DOCUMENT_TYPE`
- `USER_NOT_FOUND_ERROR`
- `ORDER_NOT_FOUND_ERROR`
- `DELIVERY_NOT_FOUND_ERROR`

## Logging y trazabilidad

- request logging por middleware HTTP
- logs de negocio y errores con Winston
- archivos rotados por fecha en `logs/`
- eventos de carga de archivos y asociación a entidades registrados con contexto útil

## Criterio profesional y ética aplicada

Este proyecto se trabaja con foco en:

- corrección técnica
- consistencia de contratos HTTP
- trazabilidad operativa
- separación clara de responsabilidades
- almacenamiento seguro y mínimo de datos
- documentación útil para revisión y mantenimiento

## Bitácora del proyecto

El historial técnico y decisiones del proyecto está en:

- `BITACORA_PROYECTO.md`
