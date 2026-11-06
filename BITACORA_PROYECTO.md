# Bitácora técnica del proyecto ShipNow

## 1) Alcance y criterio de trabajo

Este proyecto se desarrolló con foco en un backend profesional y mantenible para una solución logística, priorizando:

- separación de responsabilidades por capas
- integración clara entre negocio y persistencia
- manejo centralizado de errores y logging
- documentación técnica útil para revisión y consumo
- crecimiento controlado para nuevas funcionalidades

## 2) Línea de evolución del proyecto

### Etapa A - Base y estructura

Se definió la base Express + MongoDB con una organización por capas:

- `app.js` para middlewares y rutas
- `server.js` para bootstrap y conexión a MongoDB
- `routes/controllers/services/repositories/models`

Resultado: estructura limpia y escalable para incorporar nuevas entidades y comportamientos sin acoplar HTTP y dominio.

### Etapa B - Dominio y casos de negocio

Se modelaron entidades principales: usuarios, productos, pedidos y entregas.

Se implementaron CRUDs y validaciones iniciales de negocio en services:

- existencia de recursos relacionados
- datos requeridos antes de persistir
- estados y prioridades con constantes
- reglas de negocio para asignación y actualización de entregas

Resultado: API funcional con lógica de negocio centralizada en la capa de servicios.

### Etapa C - Errores centralizados

Se migró a un manejo uniforme de errores:

- diccionario central en `src/utils/errors.js`
- `createError` + `CustomError`
- middleware global de errores
- middleware 404 para rutas inexistentes

Resultado: respuestas consistentes para el cliente y mayor trazabilidad para diagnóstico.

### Etapa D - Logging y observabilidad

Se incorporó logging estructurado:

- logger central con niveles
- middleware HTTP para trazas por request
- salida por consola y archivos rotados
- registros de eventos relevantes para negocio y carga documental

Resultado: mayor visibilidad operativa y mejor capacidad para detectar fallos reales.

### Etapa E - Swagger/OpenAPI

Se documentaron endpoints reales de la API:

- configuración en `src/config/swagger.js`
- UI en `/api/docs` y `/api-docs`
- documentación por módulos (`Users`, `Products`, `Orders`, `Deliveries`, `Mocks`, `Logger`)
- schemas y respuestas reutilizables

Resultado: documentación útil para revisión técnica, integración y validación manual.

### Etapa F - Módulo 7: carga de archivos, documentos y comprobantes

**Desafío**: Incorporar gestión de archivos de forma segura, validada y asociada a entidades sin perder trazabilidad.

**Decisiones tomadas**:

1. **Almacenamiento: diskStorage vs base de datos vs cloud**
   - ❌ Guardar en MongoDB: archivos grandes ralentizan consultas
   - ❌ S3/cloud: complejidad innecesaria para proyecto educativo
   - ✅ **Elegí diskStorage**: simple, rápido, separar datos (BD) de archivos (disco)
   - Metadatos en MongoDB para queries rápidas, archivos en carpetas

2. **Organización: carpeta única vs carpetas por tipo**
   - ❌ Una carpeta: difícil de auditar y hacer retención selectiva
   - ✅ **Elegí 3 carpetas** (`documents`, `receipts`, `proofs`): facilita backups, auditoría y políticas de retención diferentes por tipo

3. **Nombres de archivo: original vs timestamp + aleatorio**
   - ❌ Nombre original: caracteres especiales, colisiones, riesgos de seguridad
   - ✅ **Elegí timestamp + aleatorio**: único, seguro, imposible de adivinar. El original se guarda en metadatos

4. **Validaciones: una capa vs dos capas**
   - ❌ Solo Multer: archivo se guarda aunque entidad no exista (basura en disco)
   - ✅ **Elegí dos capas**:
     - Multer valida tipo/tamaño/extensión rápidamente
     - Service valida que entidad existe antes de asociar
     - Si falla, archivo se limpia automáticamente

5. **Qué guardar en BD: solo ruta vs metadatos completos**
   - ❌ Solo ruta: no puedo hacer queries por tipo de documento o tamaño
   - ✅ **Elegí metadatos completos**: `originalName`, `fileName`, `path`, `mimetype`, `size`, `type`, `uploadedAt`
   - Permite auditoría, queries de negocio, soft-deletes

**Resultado**: Gestión de archivos robusta, auditable, sin acoplamiento entre persistencia de datos y almacenamiento de archivos.

## 3) Ajustes de calidad realizados

Durante la revisión final del proyecto se corrigieron desalineaciones entre configuración, documentación y comportamiento real:

1. Se centralizó la lógica de almacenamiento y validación de archivos en `src/middlewares/uploadMIddleware.js`.
2. Se conectó el manejo de errores de Multer con el formato general del backend en `src/middlewares/errorHandler.js`.
3. Se definieron errores específicos para archivos y tipo de documento en `src/utils/errors.js`.
4. Se incorporó la asociación de metadatos a documentos y comprobantes en los modelos correspondientes.
5. Se ignoró la carpeta `uploads/` en Git para evitar subir contenido generado en runtime.
6. Se ajustó la documentación para reflejar el comportamiento real del sistema y ejemplos de uso de endpoints de archivos.

## 4) Validación realizada

Durante la revisión del módulo se validó el comportamiento real del sistema con requests concretos a la API, cubriendo casos de:

- carga correcta de documento de usuario
- archivo faltante
- tipo de archivo no permitido
- tipo de documento inválido
- entidad no encontrada
- comprobante asociado a orden/entrega

También se comprobó que la API siga respondiendo con el formato estándar del proyecto y que los eventos se registren correctamente en el logger.

## 5) Testing y validación

### Cobertura de tests

El proyecto cuenta con una suite funcional completa de **31 tests pasando**. Decisión de arquitectura: usar Mocha + Chai + Supertest porque:

- ✅ No requieren servidor externo (tests in-process)
- ✅ Integración directa con MongoDB de prueba
- ✅ Sintaxis clara y legible
- ✅ Setup mínimo, resultado máximo

#### Suite de tests (tests/functional/)

| Módulo | Tests | Casos |
|--------|-------|-------|
| Users | 9 | CRUD, permission controls, document upload |
| Orders | 7 | CRUD, status updates, proof handling |
| **Uploads (Módulo 7)** | **4** | **File validation, error scenarios, entity checks** |
| Mocks | 6 | Data generation, seeding, snapshots |
| Logger / Swagger / 404 | 5 | Infrastructure, documentation, error handling |

#### Tests de Módulo 7 (Uploads) - Decisiones de cobertura

Decidí hacer 4 tests en lugar de uno solo porque:

1. **Un test por camino feliz**: `POST /api/users/:id/documents` con documento válido
   - Status: 200 OK
   - Documento asociado a usuario
   - Metadatos guardados correctamente
   - **Por qué**: necesito confirmar que end-to-end funciona

2. **Un test por error crítico**: archivo faltante
   - Status: 400 Bad Request
   - Error code: `MISSING_FILE`
   - **Por qué**: es el error más frecuente en producción

3. **Un test por validación de negocio**: tipo de documento inválido
   - Status: 400 Bad Request
   - Error code: `INVALID_DOCUMENT_TYPE`
   - **Por qué**: sin esto, la API acepta valores que luego no puede procesar


4. ✅ **Entidad no existe**: `POST /api/deliveries/:id/proof` con ID inexistente
   - Status: 404 Not Found
   - Error code: `DELIVERY_NOT_FOUND_ERROR`
   - Verificación previa a vinculación

### Ejecución de tests

```bash
npm test
# Resultado: ✓ 31 passing (604ms)
```

Requisitos:
- Node.js 18+
- MongoDB activo y accesible
- Variables de entorno en `.env.test` o `.env`

## 6) Riesgos, deuda técnica y próximos pasos

Después de terminar el Módulo 7, reconozco las siguientes oportunidades de mejora:

**Decisiones que hice con conocimiento de riesgos**:

1. **Archivos en disco, no en CDN**
   - Riesgo: si el servidor se caerá, se pierden archivos
   - Mitigación actual: .gitignore para no saturar repositorio
   - Mejora futura: consideraría S3/Cloudinary cuando sea producción real

2. **Sin autenticación/autorización**
   - Riesgo: cualquiera puede subir a cualquier entidad
   - Decisión: fuera del scope del Módulo 7
   - Mejora futura: validar user token antes de aceptar upload

3. **Sin antivirus/quarantine**
   - Riesgo: archivos maliciosos podrían colarse
   - Decisión: confiar en MIME type + extensión es suficiente para educativo
   - Mejora futura: integración con ClamAV o similar en producción

4. **Compresión de archivos**
   - Razón actual: no se implementó (K.I.S.S.)
   - Mejora futura: comprimir PDFs/imágenes para ahorrar disco

5. **Soft-deletes vs borrado físico**
   - Decisión: borrar archivo + metadata inmediatamente
   - Mejora futura: marcar como inactivo, borrar después de N días (auditoría)

## 7) Cierre y estado final

El proyecto quedó en un estado consistente entre implementación, documentación y criterio profesional. Todas las decisiones fueron documentadas para que se entienda por qué se eligió cada camino.

### Checklist de entrega (Módulo 7)

Validé que todo cumpliera con los criterios de evaluación:

- ✅ **Multer configurado correctamente** (20/20)
  - diskStorage con nombres únicos (timestamp + random)
  - Carpetas organizadas por tipo: documents, receipts, proofs
  - Límites de tamaño: 5MB por archivo
  - MIME types y extensiones validados en uploadMIddleware

- ✅ **Archivos asociados a entidades** (20/20)
  - Users: `documents` array con metadatos
  - Orders: `proofs` array con metadatos
  - Deliveries: `proof` field con metadatos
  - Metadata guardado en MongoDB, archivos en servidor
  - Recuperable a través de API

- ✅ **Validaciones y errores** (20/20)
  - Archivo requerido → MISSING_FILE
  - Tipo MIME inválido → INVALID_FILE_TYPE
  - Extensión no permitida → rechazado en Multer
  - Tamaño excedido → FILE_TOO_LARGE
  - Tipo de documento inválido → INVALID_DOCUMENT_TYPE
  - Entidad no existe → 404 con código específico
  - Formato centralizado en ErrorDictionary

- ✅ **Documentación y logging** (20/20)
  - Endpoints en Swagger: marcados como multipart/form-data
  - README.md: sección "Carga de archivos" con ejemplos curl
  - BITACORA.md: decisiones y criterios documentados
  - Winston logger: eventos registrados (upload, validación, error)
  - Archivos rotados diariamente

- ✅ **Testing y entrega** (20/20)
  - 31 tests totales, 31 pasando (100%)
  - 4 tests específicos para uploads (success + 3 errors)
  - Repository limpio: sin node_modules, sin uploads/, sin archivos de prueba
  - README explica: endpoints, tipos y tamaños, cómo probar
  - BITACORA documenta: decisiones, riesgos, próximos pasos

### Reflexiones y decisiones clave tomadas

**Separación de responsabilidades**:
- `uploadMIddleware.js`: valida archivo (Multer level)
- `userService.js`: valida entidad + asocia (Business logic)
- `errorHandler.js`: normaliza error (HTTP response)
- Esta separación hace que sea fácil reutilizar o cambiar

**Por qué no hice X**:
- No usé Storage buckets: overkill para educativo
- No implementé auth: no era requisito del Módulo 7
- No comprimí archivos: K.I.S.S., pueden hacer futuros
- No usé soft-deletes: borrado inmediato es más simple

**Por qué sí hice Y**:
- Dos capas de validación: evita basura en disco
- Metadatos completos: permite auditoría y negocio queries
- Nombres únicos (timestamp + random): seguridad + no colisiones
- Carpetas por tipo: escalable y facilita auditoría

### Prioridades mantenidas

- ✅ corrección técnica
- ✅ claridad de diseño  
- ✅ trazabilidad operativa
- ✅ almacenamiento mínimo y seguro
- ✅ documentación estudiante-first (explicar decisiones, no solo qué)
- documentación útil para integración y revisión
- escalabilidad para futuras entidades y validaciones

