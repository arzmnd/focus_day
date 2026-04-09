# Focus Day — Guía de Deployment

## Arquitectura

```
Usuario → Vercel (Next.js) → Supabase (PostgreSQL + Auth)
```

- **Frontend**: Next.js 14 (App Router) deployado en Vercel
- **Backend**: Supabase (PostgreSQL + Row Level Security)
- **Auth**: Google OAuth via Supabase Auth
- **Costo**: $0 en ambos free tiers

---

## Paso 1 · Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta (o inicia sesión con GitHub).
2. Click **"New Project"**.
3. Nombre: `focusday`, contraseña de DB: genera una segura y guárdala.
4. Región: **South America (São Paulo)** (más cercana a México).
5. Espera ~2 minutos a que se provisione.

---

## Paso 2 · Ejecutar el schema de la base de datos

1. En el dashboard de Supabase, ve a **SQL Editor** (barra lateral izquierda).
2. Click **"New Query"**.
3. Pega **todo** el contenido de `supabase/schema.sql`.
4. Click **"Run"** (Ctrl+Enter).
5. Deberías ver "Success. No rows returned" — esto es correcto.

Verifica en **Table Editor** que existen 3 tablas: `tasks`, `completions`, `user_settings`.

---

## Paso 3 · Configurar Google OAuth

### 3a. Crear credenciales en Google Cloud Console

1. Ve a [console.cloud.google.com](https://console.cloud.google.com).
2. Crea un proyecto nuevo (o usa uno existente).
3. Ve a **APIs & Services → Credentials**.
4. Click **"Create Credentials" → "OAuth client ID"**.
5. Si te pide configurar la pantalla de consentimiento:
   - User type: **External**
   - App name: `Focus Day`
   - Support email: tu email
   - Authorized domains: `supabase.co`
   - Guarda y regresa a Credentials.
6. Application type: **Web application**.
7. Name: `Focus Day`
8. Authorized redirect URIs — agrega:
   ```
   https://<TU-PROJECT-REF>.supabase.co/auth/v1/callback
   ```
   (Encuentra tu project ref en Supabase → Settings → General)
9. Click **"Create"** y copia el **Client ID** y **Client Secret**.

### 3b. Activar Google en Supabase

1. En Supabase, ve a **Authentication → Providers**.
2. Encuentra **Google** y actívalo.
3. Pega el **Client ID** y **Client Secret** de Google.
4. Guarda.

---

## Paso 4 · Subir el código a GitHub

1. Crea un repo nuevo en GitHub (ej: `focusday`).
2. Sube todos los archivos del proyecto:

```bash
cd focusday
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/focusday.git
git push -u origin main
```

---

## Paso 5 · Deploy en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Click **"Add New" → "Project"**.
3. Importa el repo `focusday`.
4. En **Environment Variables**, agrega las siguientes:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<TU-REF>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(copia de Supabase → Settings → API → anon/public)* |
| `NEXT_PUBLIC_SITE_URL` | `https://focusday.vercel.app` *(o tu dominio custom)* |

5. Click **"Deploy"**.
6. Espera ~1 minuto. Vercel te dará una URL tipo `focusday-xyz.vercel.app`.

---

## Paso 6 · Actualizar redirect URLs

Ahora que tienes la URL de Vercel, actualiza dos lugares:

### 6a. Supabase
1. Ve a **Authentication → URL Configuration**.
2. En **Site URL**, pon tu URL de Vercel: `https://focusday-xyz.vercel.app`
3. En **Redirect URLs**, agrega: `https://focusday-xyz.vercel.app/auth/callback`

### 6b. Google Cloud Console
1. Ve a **APIs & Services → Credentials → tu OAuth client**.
2. En **Authorized redirect URIs**, verifica que siga:
   `https://<TU-REF>.supabase.co/auth/v1/callback`
3. En **Authorized JavaScript origins**, agrega:
   `https://focusday-xyz.vercel.app`

---

## Paso 7 · Probar

1. Abre tu URL de Vercel.
2. Deberías ver la pantalla de login con el botón "Continuar con Google".
3. Inicia sesión con tu cuenta de Google.
4. Crea una tarea para verificar que se guarda.
5. Abre en otro navegador/dispositivo, inicia sesión → deberías ver la misma tarea.

---

## Dominio custom (opcional)

1. En Vercel → tu proyecto → **Settings → Domains**.
2. Agrega tu dominio (ej: `focusday.tudominio.com`).
3. Actualiza los DNS según las instrucciones de Vercel.
4. Actualiza las URLs en Supabase y Google Console con el nuevo dominio.

---

## Estructura de archivos

```
focusday/
├── package.json
├── next.config.mjs
├── jsconfig.json
├── .env.local.example          ← copia a .env.local con tus keys
├── supabase/
│   └── schema.sql              ← ejecutar en Supabase SQL Editor
└── src/
    ├── lib/
    │   └── supabase.js         ← cliente Supabase
    ├── app/
    │   ├── globals.css
    │   ├── layout.js
    │   ├── page.js
    │   └── auth/
    │       └── callback/
    │           └── route.js    ← maneja redirect de Google OAuth
    └── components/
        ├── AuthGate.jsx        ← login + session management
        └── FocusDay.jsx        ← toda la app (800+ líneas)
```

---

## Troubleshooting

**"Invalid login credentials"**
→ Verifica que el Client ID y Secret de Google estén correctos en Supabase.

**Redirect loop después de login**
→ Revisa que la URL en Supabase → Auth → URL Configuration → Site URL coincida exactamente con tu URL de Vercel (con https, sin trailing slash).

**Las tareas no se guardan**
→ Verifica en Supabase → Table Editor → tasks que los RLS policies estén activos. También revisa la consola del browser para errores.

**Error de CORS**
→ Asegúrate de que `NEXT_PUBLIC_SUPABASE_URL` no tenga trailing slash.
