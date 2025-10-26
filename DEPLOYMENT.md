# 🚀 Guía de Deployment - TripApp

Esta guía te ayudará a deployar TripApp en Vercel para compartirla con usuarios de prueba.

## 📋 Prerequisitos

1. **Cuenta de Vercel** (gratuita)
   - Crear en: https://vercel.com/signup
   - Conectar con tu cuenta de GitHub

2. **Proyecto de Firebase** configurado
   - Console: https://console.firebase.google.com/
   - Necesitarás las credenciales de configuración

## 🔧 Pasos para Deployment

### 1. Configurar Variables de Entorno en Vercel

Antes de hacer el deploy, configura las variables de entorno:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las siguientes variables (obtén los valores de Firebase Console):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_BACKEND_URL (usa la URL de tu backend en producción)
```

**¿Dónde obtener las credenciales de Firebase?**
- Firebase Console → Project Settings → General
- Sección "Your apps" → SDK setup and configuration

### 2. Deploy desde GitHub

**Opción A: Deploy Automático (Recomendado)**

1. Push tu código a GitHub
2. Ve a https://vercel.com/new
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es Next.js
5. Configura:
   - **Framework Preset**: Next.js
   - **Root Directory**: `app/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Click en "Deploy"

**Opción B: Vercel CLI**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde el directorio app/frontend
cd app/frontend

# Login
vercel login

# Deploy
vercel

# Para producción
vercel --prod
```

### 3. Configuración Post-Deploy

**Configurar dominio de Firebase Auth:**

Después del primer deploy, necesitas agregar el dominio de Vercel a Firebase:

1. Firebase Console → Authentication → Settings
2. "Authorized domains" → Add domain
3. Agrega tu dominio de Vercel (ej: `tu-app.vercel.app`)

### 4. Verificar el Deployment

Una vez desplegado:
- ✅ Verifica que la app cargue
- ✅ Prueba el login con Firebase
- ✅ Revisa la consola del navegador por errores

## 🔄 Updates Automáticos

Con el setup de Vercel + GitHub:
- Cada push a `main` → deploy automático a producción
- Cada push a otras branches → preview deployment

## 📝 Variables de Entorno Locales

Para desarrollo local, crea un archivo `.env.local` en `app/frontend/`:

```bash
# Copia el ejemplo
cp .env.example .env.local

# Edita con tus valores reales
nano .env.local
```

## ⚠️ Importante - Backend

Actualmente, `NEXT_PUBLIC_BACKEND_URL` apunta a `localhost:5000`.

**Cuando despliegues el backend:**
1. Deploya tu backend (puede ser en Vercel, Railway, Render, etc.)
2. Actualiza la variable `NEXT_PUBLIC_BACKEND_URL` en Vercel con la URL real
3. Redeploy automático se activará

## 🐛 Troubleshooting

### Error: "Missing environment variables"
→ Verifica que todas las variables estén configuradas en Vercel Settings

### Error: "Firebase: Error (auth/unauthorized-domain)"
→ Agrega el dominio de Vercel a Firebase Authorized Domains

### Build falla en Vercel
→ Verifica que el build funcione localmente: `npm run build`
→ Revisa los logs en el dashboard de Vercel

## 📞 Compartir con Usuarios

Una vez deployado exitosamente:

1. **URL de producción**: `https://tu-app.vercel.app`
2. **Comparte el link** con tus usuarios de prueba
3. **Monitor**: Usa Vercel Analytics para ver el uso

### Preview Deployments

Vercel crea una URL única por cada branch/commit:
- Útil para probar features antes de producción
- Formato: `https://tu-app-git-branch-user.vercel.app`

## 🎯 Próximos Pasos

- [ ] Deploy del backend para MercadoPago
- [ ] Configurar dominio personalizado (opcional)
- [ ] Activar Vercel Analytics
- [ ] Configurar alertas de errores (Sentry, etc.)

---

**¿Necesitas ayuda?**
- Docs de Vercel: https://vercel.com/docs
- Docs de Next.js Deploy: https://nextjs.org/docs/deployment
