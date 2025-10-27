# 🚨 CONFIGURACIÓN DE SEGURIDAD URGENTE

## ⚡ PASOS INMEDIATOS (15 minutos)

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login a Firebase
```bash
firebase login
```

### 3. Inicializar proyecto
```bash
firebase use hometaste-tlpog
```

### 4. Desplegar reglas de seguridad
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only firestore:indexes
```

### 5. Verificar en Firebase Console

Ve a [Firebase Console](https://console.firebase.google.com/project/hometaste-tlpog/firestore/rules)

Deberías ver las reglas activas. Si NO están, tu base de datos está DESPROTEGIDA.

### 6. Crear usuario admin

1. Ve a Firestore Database
2. Colección: `users`
3. Busca tu documento de usuario (tu UID)
4. Agrega campo: `role` = `"admin"`

### 7. Hacer repositorio privado (Opcional pero recomendado)

En GitHub:
- Settings → General → Danger Zone
- Change visibility → **Private**

## 🔧 PRÓXIMOS PASOS (cuando puedas)

### Mover MercadoPago Access Token al backend

**Problema actual:** `NEXT_PUBLIC_MP_ACCESS_TOKEN` está expuesta.

**Solución:** Ver `SECURITY.md` sección 4 para crear API route protegida.

### Configurar Rate Limiting

**Previene:** Ataques DDoS, scraping, abuso de API

**Implementar:** Ver `SECURITY.md` sección 5

## ❓ FAQ

**P: ¿Las Firebase API Keys pueden estar públicas?**
R: Sí, están diseñadas para eso, pero DEBES tener Security Rules configuradas.

**P: ¿Cómo sé si mis reglas funcionan?**
R: Intenta leer/escribir desde la consola sin autenticar. Debería fallar.

**P: ¿Y si alguien copia mi código?**
R:
- Con las reglas configuradas, no pueden acceder a TUS datos
- Pueden copiar el código pero no tu base de datos
- Considera hacer el repo privado

**P: ¿Está seguro mi código ahora?**
R: Con las reglas desplegadas: **SÍ** (80% seguro)
R: Sin las reglas: **NO** (completamente vulnerable)

## 📞 ¿Problemas?

Si algo falla:
1. Revisa que Firebase CLI esté autenticado: `firebase login`
2. Verifica el proyecto correcto: `firebase use`
3. Lee los errores del deploy detenidamente
4. Consulta `SECURITY.md` para más detalles

---

**Tiempo estimado total:** 15-20 minutos
**Prioridad:** 🔴 CRÍTICA
