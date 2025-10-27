# 🔒 Guía de Seguridad - Santurist

## ⚠️ ADVERTENCIAS CRÍTICAS

### 1. NO COMMITEAR SECRETOS AL REPOSITORIO

**NUNCA** subas estos archivos a Git:
- `.env`
- `.env.local`
- `.env.production`
- `firebase-key.json`
- Cualquier archivo con credenciales

✅ **Verificar antes de cada commit:**
```bash
git status
# Asegúrate que NO aparezcan archivos sensibles
```

### 2. VARIABLES DE ENTORNO PÚBLICAS vs PRIVADAS

#### Variables PÚBLICAS (incluidas en el bundle del cliente):
- `NEXT_PUBLIC_FIREBASE_API_KEY` - ✅ OK exponer
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - ✅ OK exponer
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - ✅ OK exponer
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - ✅ OK exponer
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - ✅ OK exponer
- `NEXT_PUBLIC_FIREBASE_APP_ID` - ✅ OK exponer

**Nota:** Estas keys de Firebase están diseñadas para ser públicas, pero DEBES configurar Firebase Security Rules para proteger los datos.

#### Variables PRIVADAS (solo en servidor/backend):
- `NEXT_PUBLIC_MP_ACCESS_TOKEN` - ❌ **PELIGRO:** Está con NEXT_PUBLIC pero NO debería
- `FIREBASE_PRIVATE_KEY` - ✅ Solo backend
- `FIREBASE_CLIENT_EMAIL` - ✅ Solo backend
- Cualquier API key de terceros

### 3. CONFIGURAR FIREBASE SECURITY RULES

**CRÍTICO:** Sin estas reglas, cualquiera puede leer/escribir tu base de datos.

#### Paso 1: Subir reglas a Firebase

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar proyecto (si no lo hiciste)
firebase init

# Subir las reglas
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

#### Paso 2: Verificar en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: `hometaste-tlpog`
3. Firestore Database → Rules
4. Verifica que las reglas estén activas

#### Paso 3: Crear usuario admin

```javascript
// En Firebase Console → Firestore → users → [tu userId]
{
  "role": "admin",
  "email": "tu@email.com",
  "name": "Tu Nombre"
}
```

### 4. MERCADOPAGO - MOVER ACCESS TOKEN AL BACKEND

**VULNERABILIDAD ACTUAL:** El `NEXT_PUBLIC_MP_ACCESS_TOKEN` está expuesto al cliente.

#### Solución: Crear API Route protegida

**Crear:** `app/frontend/src/app/api/payments/create-preference/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN; // Sin NEXT_PUBLIC_

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar autenticación del usuario aquí
    // TODO: Verificar Firebase Auth token

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating preference' }, { status: 500 });
  }
}
```

Luego actualizar `paymentService.ts` para llamar a esta API en vez de MercadoPago directamente.

### 5. PROTEGER CÓDIGO FUENTE

#### Opciones para proteger la app:

1. **Obfuscación del código:**
   ```bash
   npm install --save-dev javascript-obfuscator
   ```

2. **Hacer el repositorio privado en GitHub:**
   - Settings → General → Danger Zone → Change visibility → Private

3. **Usar Vercel con variables de entorno:**
   - Las variables en Vercel están protegidas
   - Nunca las subas al código

4. **Implementar rate limiting:**
   ```typescript
   // middleware.ts
   import { NextResponse } from 'next/server';
   import type { NextRequest } from 'next/server';

   const rateLimitMap = new Map();

   export function middleware(request: NextRequest) {
     const ip = request.ip ?? '127.0.0.1';
     const limit = 100; // requests
     const windowMs = 60 * 1000; // 1 minuto

     if (!rateLimitMap.has(ip)) {
       rateLimitMap.set(ip, { count: 0, resetTime: Date.now() + windowMs });
     }

     const ipData = rateLimitMap.get(ip);

     if (Date.now() > ipData.resetTime) {
       ipData.count = 0;
       ipData.resetTime = Date.now() + windowMs;
     }

     if (ipData.count > limit) {
       return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
     }

     ipData.count++;
     return NextResponse.next();
   }
   ```

### 6. VARIABLES DE ENTORNO EN PRODUCCIÓN

#### En Vercel:

1. Project Settings → Environment Variables
2. Agregar TODAS las variables (sin el prefijo NEXT_PUBLIC para las privadas)
3. Marcar cuáles son secretas

#### Variables requeridas:

**Frontend (Públicas):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Backend (Privadas - agregar API routes):**
- `MP_ACCESS_TOKEN` (sin NEXT_PUBLIC)
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PROJECT_ID`

### 7. AUDITORÍA DE SEGURIDAD

Ejecutar regularmente:

```bash
# Buscar secretos accidentalmente commiteados
git log --all --full-history -- "*\.env*"

# Buscar API keys en el código
grep -r "AIzaSy" app/frontend/src/
grep -r "sk_" app/frontend/src/
grep -r "pk_" app/frontend/src/

# Verificar dependencias vulnerables
npm audit
npm audit fix
```

### 8. CHECKLIST ANTES DE PRODUCCIÓN

- [ ] Firebase Security Rules desplegadas
- [ ] Firestore Rules probadas
- [ ] Storage Rules probadas
- [ ] Repositorio GitHub en privado (opcional)
- [ ] Variables de entorno configuradas en Vercel
- [ ] Access Token de MercadoPago movido a API route privada
- [ ] Rate limiting implementado
- [ ] `npm audit` sin vulnerabilidades críticas
- [ ] `.env*` files en `.gitignore`
- [ ] Verificar que no hay API keys en el código
- [ ] CORS configurado correctamente
- [ ] HTTPS forzado (Vercel lo hace automáticamente)

### 9. MONITOREO

Configurar alertas para:

1. **Firebase:** Uso inusual de base de datos
2. **Vercel:** Errores 500, uso de ancho de banda
3. **MercadoPago:** Transacciones sospechosas

### 10. CONTACTO EN CASO DE BREACH

Si detectas una vulnerabilidad:

1. NO la publiques públicamente
2. Desactiva servicios comprometidos inmediatamente
3. Rota todas las API keys
4. Revisa logs de Firebase/Vercel
5. Notifica a usuarios afectados si aplica

## 🛡️ Buenas Prácticas Continuas

1. **Nunca** logguear información sensible
2. **Siempre** validar input del usuario (XSS, SQL injection)
3. **Usar** HTTPS en todo momento
4. **Actualizar** dependencias regularmente
5. **Revisar** permisos de Firebase cada mes
6. **Implementar** autenticación multifactor
7. **Hacer** backups regulares de Firestore

---

**Última actualización:** 2025-10-26

¿Dudas de seguridad? Consulta:
- [Firebase Security Checklist](https://firebase.google.com/docs/rules/basics)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
