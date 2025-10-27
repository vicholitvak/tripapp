# 🚀 Setup Rápido - Primer Admin

Guía de 5 minutos para configurar tu primer usuario administrador.

---

## ⚡ Método Rápido (Firebase Console)

### 1️⃣ Crear tu cuenta de usuario

1. Abre la app en desarrollo: `npm run dev`
2. Ve a: http://localhost:3000
3. Click en "Sign In" (esquina superior derecha)
4. Click en "Sign Up" o "Crear Cuenta"
5. Completa:
   - Email: `admin@santurist.com` (o el que prefieras)
   - Password: (mínimo 6 caracteres)
6. **Importante**: Copia tu User ID (UID) que aparecerá en consola o en Firebase

### 2️⃣ Obtener tu User ID (UID)

**Opción A: Desde la consola del navegador**
```javascript
// Abre DevTools (F12) > Console
// Ejecuta:
console.log(localStorage.getItem('userId'));
// o
import { auth } from '@/lib/firebase';
console.log(auth.currentUser?.uid);
```

**Opción B: Desde Firebase Console**
1. Ve a: https://console.firebase.google.com/
2. Selecciona proyecto: **TripApp (tripapp-8e9dc)**
3. Menu lateral > **Authentication**
4. Busca tu email en la lista
5. Copia el **User UID**

### 3️⃣ Crear el documento de admin en Firestore

1. En Firebase Console, ve a: **Firestore Database**
2. Click en **+ Start collection** (si no existe `users`)
   - Collection ID: `users`
   - Click "Next"
3. Document ID: **Pega tu User UID aquí**
4. Agregar campos:
   ```
   Field: role
   Type: string
   Value: admin

   Field: email
   Type: string
   Value: admin@santurist.com (o tu email)

   Field: createdAt
   Type: timestamp
   Value: [Click en "Set to current time"]
   ```
5. Click **Save**

### 4️⃣ Verificar acceso

1. **Recargar la página** de tu app (F5)
2. Deberías ver en consola:
   ```javascript
   console.log(localStorage.getItem('userRole'));
   // "admin"
   ```
3. **Probar acceso a rutas admin**:
   - http://localhost:3000/admin/mock-providers ✅
   - http://localhost:3000/admin/invitations ✅
   - http://localhost:3000/admin/approvals ✅

Si ves las páginas (no "Acceso Denegado"), ¡estás listo! 🎉

---

## 🔧 Solución de Problemas Rápidos

### ❌ Sigo viendo "Acceso Denegado"

1. **Cerrar sesión y volver a entrar**:
   - Click en tu perfil > Sign Out
   - Volver a Sign In con el mismo email

2. **Limpiar localStorage**:
   ```javascript
   // En consola del navegador
   localStorage.clear();
   location.reload();
   ```
   Luego vuelve a iniciar sesión

3. **Verificar en Firestore**:
   - Ve a Firebase Console > Firestore
   - Busca: `users/{tu-user-id}`
   - Debe tener: `role: "admin"`

4. **Verificar reglas de Firestore**:
   ```bash
   # Desplegar reglas de seguridad
   firebase deploy --only firestore:rules
   ```

### ❌ No puedo crear el documento en Firestore

**Error**: "Missing or insufficient permissions"

**Solución**: Las reglas de Firestore están activas y no permiten escritura directa.

**Método alternativo - Script temporal**:

1. Crea: `app/frontend/src/scripts/makeAdmin.ts`
   ```typescript
   import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
   import { db, auth } from '@/lib/firebase';

   export async function makeAdmin() {
     const user = auth.currentUser;
     if (!user) {
       console.error('❌ No hay usuario autenticado');
       return;
     }

     try {
       await setDoc(doc(db, 'users', user.uid), {
         role: 'admin',
         email: user.email,
         displayName: user.displayName || '',
         createdAt: serverTimestamp(),
       });
       console.log('✅ Usuario configurado como admin');
       console.log('🔄 Recarga la página para aplicar cambios');
     } catch (error) {
       console.error('❌ Error:', error);
     }
   }
   ```

2. Importa en alguna página (ej: `app/frontend/src/app/page.tsx`):
   ```typescript
   import { makeAdmin } from '@/scripts/makeAdmin';

   // Dentro de un useEffect o botón temporal:
   useEffect(() => {
     // makeAdmin(); // Descomentar para ejecutar
   }, []);
   ```

3. Ejecuta la función, luego recarga la página

---

## 📋 Checklist de Verificación

- [ ] Creé mi cuenta de usuario en la app
- [ ] Obtuve mi User ID (UID)
- [ ] Creé el documento en Firestore con role: "admin"
- [ ] Recargué la página
- [ ] `localStorage.getItem('userRole')` retorna "admin"
- [ ] Puedo acceder a `/admin/mock-providers`
- [ ] Puedo acceder a `/admin/invitations`
- [ ] Puedo acceder a `/admin/approvals`

Si todos los checks están ✅, ¡estás listo para usar el sistema de admin!

---

## 🎯 Próximos Pasos

Ahora que eres admin:

1. **Lee la guía completa**: `ADMIN_GUIDE.md`
2. **Crea tu primer mock provider**: `/admin/mock-providers`
3. **Genera tu primera invitación**: `/admin/invitations`
4. **Prueba el flujo completo**: Invitar a un proveedor de prueba

---

## 📞 Ayuda

- **Guía completa**: Ver `ADMIN_GUIDE.md`
- **Seguridad**: Ver `SECURITY_QUICKSTART.md`
- **Código fuente**: `app/frontend/src/app/admin/`

---

**¡Bienvenido al sistema de administración de Santurist!** 🎉
