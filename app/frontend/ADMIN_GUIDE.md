# 🔐 Guía de Administrador - Santurist

Guía completa para configurar y usar las herramientas administrativas de Santurist.

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Acceso al Panel de Admin](#acceso-al-panel-de-admin)
3. [Gestión de Mock Providers](#gestión-de-mock-providers)
4. [Gestión de Invitaciones](#gestión-de-invitaciones)
5. [Gestión de Aprobaciones](#gestión-de-aprobaciones)
6. [Seed de Datos](#seed-de-datos)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🚀 Configuración Inicial

### Paso 1: Crear un usuario administrador en Firebase

#### Opción A: A través de Firebase Console (Recomendado)

1. **Ir a Firebase Console**
   - Visita [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto: `TripApp (tripapp-8e9dc)`

2. **Ir a Firestore Database**
   - En el menú lateral, selecciona **Firestore Database**
   - Asegúrate de estar en la pestaña **Data**

3. **Crear la colección `users`** (si no existe)
   - Click en **Start collection**
   - Collection ID: `users`
   - Document ID: Usa el UID del usuario de Firebase Auth

4. **Agregar el rol de admin**
   ```
   Collection: users
   Document ID: [UID_DEL_USUARIO]
   Fields:
     - role: "admin"
     - email: "tu@email.com"
     - displayName: "Tu Nombre"
     - createdAt: [Timestamp actual]
   ```

#### Opción B: A través del código (Temporal - Solo desarrollo)

**⚠️ IMPORTANTE**: Este método solo funciona en desarrollo local. **NO usar en producción**.

1. **Modificar temporalmente las reglas de Firestore**

   Edita `firestore.rules` y agrega temporalmente:
   ```javascript
   // TEMPORAL - SOLO PARA DESARROLLO
   match /users/{userId} {
     allow write: if request.auth != null; // Cualquier usuario autenticado puede escribir
     allow read: if request.auth != null;
   }
   ```

2. **Desplegar las reglas temporales**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Crear un usuario en la app**
   - Ve a `/` (página principal)
   - Click en "Sign In"
   - Crea una cuenta nueva con email/password

4. **Agregar el rol de admin mediante código**

   Crea un archivo temporal `app/frontend/src/scripts/makeAdmin.ts`:
   ```typescript
   import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
   import { db } from '@/lib/firebase';

   export async function makeUserAdmin(userId: string, email: string) {
     await setDoc(doc(db, 'users', userId), {
       role: 'admin',
       email: email,
       createdAt: serverTimestamp(),
     });
     console.log('✅ Usuario configurado como admin');
   }

   // Usar en consola del navegador:
   // import { makeUserAdmin } from '@/scripts/makeAdmin';
   // makeUserAdmin('YOUR_USER_ID', 'your@email.com');
   ```

5. **Restaurar las reglas de seguridad**
   ```bash
   git checkout firestore.rules
   firebase deploy --only firestore:rules
   ```

#### Opción C: Script de Firebase Admin SDK (Producción)

Para producción, usa Firebase Admin SDK desde el backend:

```javascript
// backend/scripts/makeAdmin.js
const admin = require('firebase-admin');
admin.initializeApp();

async function makeAdmin(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.firestore().collection('users').doc(user.uid).set({
      role: 'admin',
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`✅ ${email} es ahora administrador`);
  } catch (error) {
    console.error('Error:', error);
  }
}

makeAdmin('admin@santurist.com');
```

---

## 🎯 Acceso al Panel de Admin

### Verificar que eres Admin

1. **Iniciar sesión**
   - Ve a `/signin`
   - Inicia sesión con tu cuenta de administrador

2. **Verificar en la consola del navegador**
   - Abre DevTools (F12)
   - En la consola, ejecuta:
     ```javascript
     // Debe mostrar "admin"
     console.log(localStorage.getItem('userRole'));
     ```

3. **Acceder a páginas de admin**
   - Si tienes el rol correcto, puedes acceder a:
     - `/admin/mock-providers` - Gestión de mocks
     - `/admin/invitations` - Gestión de invitaciones
     - `/admin/approvals` - Aprobar proveedores
     - `/admin/seed-marketplace` - Seed de datos

### Páginas de Admin Disponibles

| Ruta | Descripción |
|------|-------------|
| `/admin/mock-providers` | Gestión de mock providers |
| `/admin/invitations` | Creación y gestión de invitaciones |
| `/admin/approvals` | Aprobación de proveedores pendientes |
| `/admin/seed-marketplace` | Seed de datos de prueba |

---

## 🎭 Gestión de Mock Providers

Los **mock providers** son perfiles pre-configurados que representan proveedores reales antes de que se registren en la plataforma.

### Acceder a la Gestión de Mocks

```
URL: /admin/mock-providers
```

### Dashboard de Estadísticas

Al entrar verás 4 métricas:

- **Total Mocks**: Cantidad total de mocks creados
- **Con Invitación**: Mocks que tienen una invitación vinculada
- **Reclamados**: Mocks que ya fueron reclamados por proveedores reales
- **Pendientes**: Mocks sin invitación todavía

### Crear un Mock Provider

1. **Click en "Crear Nuevo Mock"**
   - Se abrirá un formulario inline

2. **Completar el formulario**:

   **Tipo de Servicio** *
   - Cocinero
   - Guía Turístico
   - Repartidor/Chofer
   - Artesano
   - Taxi/Transfer
   - Servicio
   - Otro

   **Información del Negocio**:
   - Nombre del Negocio *
   - Descripción *
   - Categoría * (ej: "Cocina tradicional atacameña")

   **Información Personal**:
   - Nombre del Proveedor *
   - Teléfono (opcional)
   - Email * (el proveedor debe usar este email para registrarse)
   - Biografía (opcional)

   **Opciones**:
   - ☑️ Destacar este proveedor (aparecerá en secciones destacadas)

3. **Click en "Crear Mock"**
   - El mock aparecerá en la lista con badge "Sin Invitación"

### Generar Invitación desde un Mock

Una vez creado el mock:

1. **Click en el botón "Generar Invitación"** del mock
2. **Ingresar el email del proveedor** cuando se solicite
   - ⚠️ Debe coincidir con el email del mock
3. **Copiar el código generado** (formato: `ATK-2025-NOMBRE-ABC`)
4. **El mock ahora tiene badge "Invitación Pendiente"** (amarillo)

### Editar un Mock

1. **Click en "Editar"** en el mock deseado
2. **Modificar los campos** necesarios
3. **Click en "Guardar Cambios"**

### Eliminar un Mock

1. **Click en "Eliminar"** en el mock deseado
2. **Confirmar la eliminación**

⚠️ **Restricciones**:
- No se puede eliminar un mock con invitación activa
- No se puede eliminar un mock que ya fue reclamado

### Estados de los Mocks

| Badge | Color | Significado |
|-------|-------|-------------|
| Sin Invitación | Gris | Mock creado pero sin invitación aún |
| Invitación Pendiente | Amarillo | Invitación generada, esperando que el proveedor la reclame |
| Reclamado | Verde | El proveedor reclamó el mock exitosamente |

---

## ✉️ Gestión de Invitaciones

### Acceder a Invitaciones

```
URL: /admin/invitations
```

### Modo 1: Nueva Invitación

Crear una invitación desde cero (sin mock).

1. **Asegurarse de estar en modo "Nueva Invitación"**
   - El botón "Nueva Invitación" debe estar resaltado en naranja

2. **Completar el formulario**:
   - Nombre del Proveedor * (ej: Carmen)
   - Nombre del Negocio/Empresa * (ej: Cocina de Doña Carmen)
   - Tipo de Servicio * (desplegable)
   - Categoría Específica * (ej: cocinera tradicional)
   - Email del Proveedor *
   - Mensaje Personalizado (opcional)

3. **Click en "Crear Invitación"**
   - Se generará un código único (ej: `ATK-2025-CARMEN-X3K`)
   - El código aparecerá en una tarjeta verde
   - Se muestra el enlace completo: `https://santurist.vercel.app/invite/ATK-2025-CARMEN-X3K`

4. **Copiar el código** y compartirlo con el proveedor

### Modo 2: Vincular Mock

Crear una invitación vinculada a un mock existente.

1. **Click en "Vincular Mock"**
   - El botón mostrará cantidad de mocks disponibles: "Vincular Mock (3)"

2. **Seleccionar un mock** de la lista
   - Los mocks se muestran en tarjetas con:
     - Nombre del negocio
     - Nombre del proveedor
     - Categoría
     - Badge "Destacado" si aplica

3. **El formulario se auto-rellena** con los datos del mock
   - Puedes ajustar el mensaje personalizado si deseas

4. **Click en "Crear Invitación"**
   - La invitación se vincula automáticamente al mock
   - El mock ahora muestra "Invitación Pendiente"

### Visualizar Invitaciones Recientes

En la parte inferior de la página verás las últimas 5 invitaciones creadas:

- Nombre del negocio y proveedor
- Email del destinatario
- Fecha de creación
- Código de invitación
- Estado actual
- Badge "Vinculado a Mock" si aplica

### Previsualización de Invitación

La página muestra una vista previa de cómo se verá la tarjeta física de invitación:

```
Hola [Nombre],

Queremos que [Negocio] sea parte
de nuestra comunidad.

Reconocemos el valor que aportas a San Pedro de Atacama como
[categoría].

[QR Code]
```

---

## ✅ Gestión de Aprobaciones

### Acceder a Aprobaciones

```
URL: /admin/approvals
```

### Flujo de Aprobación

Cuando un proveedor completa el onboarding:

1. **Ver solicitudes pendientes**
   - Lista de proveedores que completaron su perfil
   - Información del negocio y servicios
   - Fotos y documentación

2. **Revisar la solicitud**
   - Verificar que la información es correcta
   - Verificar fotos de calidad
   - Verificar servicios ofrecidos

3. **Aprobar o Rechazar**

   **Aprobar**:
   - Click en "Aprobar"
   - Agregar notas opcionales
   - El proveedor pasa a estado "active"
   - El proveedor puede empezar a operar

   **Rechazar**:
   - Click en "Rechazar"
   - Agregar razón obligatoria
   - El proveedor pasa a estado "rejected"
   - Se puede contactar al proveedor para mejoras

---

## 🌱 Seed de Datos

### Acceder al Seed

```
URL: /admin/seed-marketplace
```

### ¿Qué hace el Seed?

Carga datos de prueba en la base de datos:
- Proveedores demo
- Productos y servicios
- Tours y experiencias
- Categorías

### Usar el Seed

1. **Click en "Cargar Datos de Prueba"**
2. **Esperar a que termine** (puede tardar unos segundos)
3. **Verificar en el marketplace** que los datos se cargaron

⚠️ **Advertencia**: Usar solo en desarrollo o para demos.

---

## 🔍 Flujo Completo de Ejemplo

### Ejemplo: Invitar a "Doña Carmen" para que ofrezca su cocina atacameña

#### Paso 1: Crear el Mock (Opcional pero recomendado)

1. Ir a `/admin/mock-providers`
2. Click en "Crear Nuevo Mock"
3. Completar:
   ```
   Tipo: Cocinero
   Nombre del Negocio: Cocina de Doña Carmen
   Descripción: Comida tradicional atacameña con recetas familiares de más de 50 años
   Categoría: Cocina tradicional atacameña
   Nombre del Proveedor: Carmen Flores
   Email: carmen.flores@email.com
   Teléfono: +56912345678
   Bio: Cocinera tradicional con 30 años de experiencia en gastronomía atacameña
   ☑️ Destacar este proveedor
   ```
4. Click "Crear Mock"
5. **Copiar el ID del mock** o buscar "Cocina de Doña Carmen" después

#### Paso 2: Generar la Invitación

1. **Opción A: Desde el Mock**
   - En `/admin/mock-providers`
   - Click "Generar Invitación" en el mock de Doña Carmen
   - Ingresar email: `carmen.flores@email.com`
   - Copiar código: `ATK-2025-CARMEN-X3K`

2. **Opción B: Desde Invitaciones**
   - Ir a `/admin/invitations`
   - Click en "Vincular Mock"
   - Seleccionar "Cocina de Doña Carmen"
   - Verificar que el formulario se auto-rellena
   - Agregar mensaje personalizado:
     ```
     Carmen, tu sazón atacameña es única y queremos que más personas
     puedan disfrutar de tus deliciosos platos. ¡Únete a nuestra comunidad!
     ```
   - Click "Crear Invitación"
   - Copiar código generado

#### Paso 3: Compartir la Invitación

1. **Imprimir tarjeta física** con:
   - Código: `ATK-2025-CARMEN-X3K`
   - QR code que apunta a: `https://santurist.vercel.app/invite/ATK-2025-CARMEN-X3K`
   - Mensaje personalizado

2. **O enviar por WhatsApp/Email**:
   ```
   Hola Carmen! 🌟

   Queremos invitarte a formar parte de Santurist.

   Tu código de invitación es: ATK-2025-CARMEN-X3K

   Registrate aquí: https://santurist.vercel.app/invite/ATK-2025-CARMEN-X3K
   ```

#### Paso 4: Doña Carmen Reclama su Invitación

1. Carmen abre el enlace en su celular
2. Ingresa el código: `ATK-2025-CARMEN-X3K`
3. El sistema valida y muestra sus datos pre-cargados:
   ```
   ✅ Código válido!

   Bienvenida Carmen Flores
   Tu negocio: Cocina de Doña Carmen
   Categoría: Cocina tradicional atacameña
   ```
4. Carmen crea su cuenta con el email: `carmen.flores@email.com`
5. El mock se convierte en proveedor real (userId vinculado)
6. Carmen completa el onboarding (si faltan datos)

#### Paso 5: Aprobar el Proveedor

1. Ir a `/admin/approvals`
2. Ver solicitud de "Cocina de Doña Carmen"
3. Revisar:
   - ✅ Información completa
   - ✅ Fotos de calidad
   - ✅ Servicios bien descritos
4. Click "Aprobar"
5. Agregar nota: "Excelente proveedor, gran calidad"
6. **¡Doña Carmen ya está activa en la plataforma!** 🎉

#### Paso 6: Verificar en Marketplace

1. Ir a `/marketplace`
2. Buscar "Doña Carmen" o "Cocina tradicional"
3. Ver su perfil con productos/servicios
4. ✅ Badge "Destacado" si fue marcado como featured

---

## 🛠️ Solución de Problemas

### No puedo acceder a páginas de admin

**Error**: "Acceso Denegado"

**Soluciones**:
1. Verificar que estás autenticado:
   ```javascript
   // En consola del navegador
   console.log(localStorage.getItem('userRole'));
   // Debe mostrar: "admin"
   ```

2. Verificar en Firestore que tu documento existe:
   ```
   Collection: users
   Document: [tu-user-id]
   Field: role = "admin"
   ```

3. Cerrar sesión y volver a iniciar:
   - Click en tu perfil > Sign Out
   - Volver a Sign In

4. Limpiar cache del navegador:
   ```
   F12 > Application > Storage > Clear site data
   ```

### No veo mocks en la lista

**Problema**: La lista de mocks está vacía

**Soluciones**:
1. Asegúrate de haber creado al menos un mock
2. Revisa la consola del navegador (F12) por errores
3. Verifica que Firebase Firestore esté habilitado
4. Verifica las reglas de Firestore (deben permitir lectura a admins)

### El código de invitación no funciona

**Error**: "Código de invitación no encontrado"

**Soluciones**:
1. Verificar que el código está escrito correctamente
2. Verificar en Firestore que la invitación existe:
   ```
   Collection: invitations
   Field: code = "ATK-2025-CARMEN-X3K"
   ```
3. Verificar que la invitación no esté expirada
4. Verificar que no haya sido reclamada ya

### Error al crear mock o invitación

**Error**: "Permission denied" o "Insufficient permissions"

**Soluciones**:
1. Verificar las reglas de Firestore
2. Asegurarte de que las colecciones existen
3. Verificar que el usuario tiene rol "admin"
4. Revisar la consola de Firebase por errores

### La página se queda cargando indefinidamente

**Problema**: Loading spinner no termina

**Soluciones**:
1. Abrir DevTools (F12) y ver errores en consola
2. Verificar conexión a Firebase:
   ```javascript
   // En consola
   import { db } from '@/lib/firebase';
   console.log(db);
   ```
3. Verificar `.env.local` tiene las credenciales correctas
4. Verificar que Firestore está habilitado en Firebase Console
5. Recargar la página con Ctrl+F5 (hard reload)

---

## 📊 Estadísticas y Métricas

### Ver Estadísticas de Mocks

En `/admin/mock-providers`:
- **Total Mocks**: Cuántos mocks existen
- **Con Invitación**: Cuántos tienen invitación vinculada
- **Reclamados**: Cuántos fueron reclamados exitosamente
- **Pendientes**: Cuántos están esperando invitación

### Ver Estadísticas de Invitaciones

En `/admin/invitations` verás las últimas 5 invitaciones con:
- Estado (pending, sent, claimed, expired, cancelled)
- Fecha de creación
- Si está vinculada a un mock

---

## 🔐 Mejores Prácticas

### Seguridad

1. **Nunca compartir credenciales de admin** en público
2. **Usar emails reales** para mocks (verificar con proveedores antes)
3. **No crear mocks falsos** sin intención de invitar al proveedor
4. **Revisar solicitudes cuidadosamente** antes de aprobar
5. **Mantener las reglas de Firestore actualizadas**

### Organización

1. **Usar nombres descriptivos** en mocks
2. **Agregar biografías completas** para mejor experiencia
3. **Marcar como destacados** solo proveedores de alta calidad
4. **Documentar razones** al rechazar proveedores
5. **Mantener estadísticas actualizadas** revisando regularmente

### Comunicación

1. **Personalizar mensajes** de invitación
2. **Explicar el proceso** al proveedor antes de enviar invitación
3. **Hacer seguimiento** después de enviar invitación
4. **Confirmar datos** con el proveedor antes de crear el mock
5. **Avisar al proveedor** cuando sea aprobado

---

## 📞 Soporte

Si tienes problemas o preguntas:

1. **Revisar esta guía** primero
2. **Verificar la consola del navegador** (F12) por errores
3. **Revisar Firebase Console** para logs
4. **Consultar SECURITY.md** para temas de seguridad
5. **Revisar el código fuente** en caso de dudas técnicas

---

## 🚀 Próximos Pasos

Después de dominar las herramientas de admin:

1. **Crear tus primeros mocks** de proveedores reales
2. **Generar invitaciones** y enviarlas
3. **Esperar que los proveedores se registren** (Fase 3)
4. **Aprobar los proveedores** cuando completen el onboarding
5. **¡Ver tu marketplace crecer!** 🎉

---

**Versión**: 1.0.0
**Última actualización**: 2025-01-26
**Autor**: Claude Code

🤖 Generated with [Claude Code](https://claude.com/claude-code)
