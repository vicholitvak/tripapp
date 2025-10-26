# 🎯 Comandos de Sesión - Santurist

## Comando Principal para Iniciar Sesión

```bash
./scripts/start-session.sh 1
```

Este es el comando que debes ejecutar cuando comiences una sesión de desarrollo. Te mostrará:
- Estado del proyecto (rama, cambios pendientes, build)
- Progreso de cada fase
- Commits recientes
- Opciones de tareas disponibles
- Contexto automático para la sesión

---

## Opciones de Tareas Disponibles

### 1️⃣ Fase 4: Provider Dashboard (PRÓXIMO OBJETIVO)
```bash
./scripts/start-session.sh 1
# o cualquiera de estos alias:
./scripts/start-session.sh provider
./scripts/start-session.sh dashboard
./scripts/start-session.sh provider-dashboard
```

**Estado:** 0% Completado - Listo para comenzar
**Tiempo Estimado:** 8-12 horas
**Qué incluye:**
- `/provider/dashboard` - Página de resumen
- `/provider/listings` - Gestión de productos
- `/provider/orders` - Gestión de órdenes
- `/provider/earnings` - Seguimiento de ingresos
- `/provider/reviews` - Visualización de reseñas

---

### 2️⃣ Prueba & Debug Marketplace
```bash
./scripts/start-session.sh 2
# o:
./scripts/start-session.sh marketplace
./scripts/start-session.sh test
./scripts/start-session.sh testing
```

**Estado:** 100% Completado
**Qué hace:** Prueba funcionalidad del marketplace, carga datos mock, verifica características

---

### 3️⃣ Arreglar Errores de Build
```bash
./scripts/start-session.sh 3
# o:
./scripts/start-session.sh build
./scripts/start-session.sh fix
./scripts/start-session.sh errors
```

**Qué hace:** Resuelve errores TypeScript, arregla linting, asegura build limpio

---

### 4️⃣ Actualizar Documentación
```bash
./scripts/start-session.sh 4
# o:
./scripts/start-session.sh docs
./scripts/start-session.sh documentation
./scripts/start-session.sh update
```

**Qué hace:** Actualiza docs de progreso, diagramas de arquitectura, guías

---

### 5️⃣ Revisión de Código & Optimización
```bash
./scripts/start-session.sh 5
# o:
./scripts/start-session.sh review
./scripts/start-session.sh code
./scripts/start-session.sh optimize
```

**Qué hace:** Revisa código existente, optimiza rendimiento, refactoriza si es necesario

---

### 6️⃣ Tarea Personalizada
```bash
./scripts/start-session.sh "Tu tarea personalizada"
```

**Qué hace:** Comienza una tarea con el nombre que especifiques

---

## Modo Interactivo

Si ejecutas el script sin parámetros:

```bash
./scripts/start-session.sh
```

Te mostrará un menú interactivo para seleccionar la opción (1-6).

---

## ¿Qué Hace El Script?

Cuando ejecutas el comando, el script:

1. ✅ Verifica tu rama git actual
2. ✅ Muestra el estado del proyecto
3. ✅ Chequea si tienes cambios sin commitear
4. ✅ Muestra los últimos commits
5. ✅ Lista qué fases están completadas
6. ✅ Verifica el estado del build
7. ✅ Crea archivo de contexto de sesión
8. ✅ Muestra comandos útiles para desarrollo

---

## Archivos de Documentación Disponibles

Mientras desarrollas, puedes consultar:

- **STATUS_BOARD.md** - Resumen rápido del progreso
- **ARCHITECTURE.md** - Detalles completos de la arquitectura
- **PROGRESS.md** - Historial de progreso
- **.development/progress-tracking.json** - Datos en formato JSON
- **MARKETPLACE_SEED_GUIDE.md** - Cómo cargar datos mock
- **GITHUB_PROJECTS_SETUP.md** - Configuración de GitHub Projects

---

## Estado Actual del Proyecto

```
████████████████████░░░░░░░░░░░░░░░░  60% COMPLETO

✅ COMPLETADAS:
   • Fase 1: Integración Moai (100%)
   • Fase 2: Onboarding de Proveedores (100%)
   • Fase 3: Marketplace Unificado (100%)

🔄 EN PROGRESO:
   • Navegación & Datos Mock (100%)

⏳ PRÓXIMAS:
   • Fase 4: Provider Dashboard (0%)
   • Fase 5: Características Avanzadas (0%)
```

---

## Flujo de Trabajo Típico

```bash
# 1. Inicia sesión con el estado del proyecto
./scripts/start-session.sh 1

# 2. Inicia el servidor de desarrollo
cd app/frontend && npm run dev

# 3. Abre http://localhost:3000

# 4. Realiza tus cambios en el código

# 5. Cuando termines, commit:
git add .
git commit -m "Tu mensaje descriptivo"

# 6. Al siguiente día, vuelve a ejecutar:
./scripts/start-session.sh 1
```

---

## Información de Contexto de Sesión

El script crea un archivo `.development/.current-session.json` que guarda:
- Qué tarea seleccionaste
- Cuándo comenzó tu sesión
- Tu rama actual
- Porcentaje de progreso del proyecto
- Cambios sin commitear

Esto te ayuda a mantener contexto entre sesiones.

---

## Próximas Prioridades

**RECOMENDADO - Comienza con esto:**
```bash
./scripts/start-session.sh 1  # Provider Dashboard
```

**Después de eso:**
1. Handler de Webhooks de Pago (2-3 horas)
2. Notificaciones por Email (3-4 horas)
3. Integración Firebase Storage (4-6 horas)
4. Sistema de Reseñas y Ratings (4-5 horas)

---

## Servicios Backend Disponibles

Todos estos servicios están listos para usar:

- ✅ **MarketplaceService** - CRUD de listados, búsqueda, filtros
- ✅ **OrderService** - Gestión de órdenes
- ✅ **EarningsService** - Seguimiento de ingresos
- ✅ **PaymentService** - Integración Mercado Pago
- ✅ **UnifiedCartService** - Carrito multi-proveedor
- ✅ **DeliveryService** - Integración Moai
- ✅ **InvitationService** - Códigos QR de invitación
- ✅ **ProviderService** - Gestión de proveedores

---

## Resumen Ultra-Rápido

```bash
# Para comenzar a trabajar en Provider Dashboard:
./scripts/start-session.sh 1

# Eso es todo. El script hace el resto.
```

¡Listo para codificar! 🚀
