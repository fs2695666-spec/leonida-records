# Leonida Records

Archivo editorial multilingüe (ES · EN · PT · FR) sobre GTA VI, con redacción propia (**The Leonida Times**) y panel de gestión en `/admin`.

> Proyecto de fans **no oficial**. No está afiliado ni respaldado por Rockstar Games ni Take-Two Interactive. Las imágenes oficiales pertenecen a sus titulares y se usan con crédito y fines informativos.

**Stack:** Next.js 16 (App Router, Server Components, Server Actions, ISR) · Supabase (Postgres + Auth + Storage + RLS) · Vercel. Todo funciona en los planes **gratuitos** de Vercel y Supabase.

---

## Instalación y despliegue en 13 pasos

Necesitas Node.js 20.9 o superior, una cuenta de GitHub, una de Supabase y una de Vercel.

### 1. Instalar dependencias

```bash
unzip leonida-records-v2.zip && cd leonida-records
npm install
```

### 2. Crear el proyecto en Supabase

1. En [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Elige nombre, contraseña de la base de datos y la región más cercana (p. ej. *West EU (Ireland)*).
3. Espera a que termine de crearse (1–2 minutos).

### 3. Ejecutar el esquema

**SQL Editor → New query**, pega el contenido completo de `supabase/schema.sql` y pulsa **Run**.
Crea tablas, funciones, triggers, políticas RLS, el bucket de Storage `media` y sus políticas. Se puede volver a ejecutar sin romper nada.

### 4. Cargar el contenido inicial

Nueva query con `supabase/seed.sql` → **Run**.
Carga 29 fichas, 5 noticias, 9 fuentes, relaciones, cronología y medios (opcional, pero recomendable para empezar).

### 5. Crear tu usuario

**Authentication → Users → Add user → Create new user**: tu email y una contraseña, con **Auto Confirm User** marcado.

### 6. Hacerte administrador

En el **SQL Editor**:

```sql
select public.promote_to_admin('tu-email@ejemplo.com');
```

Debe responder `OK: … is now admin`. Cualquier otra cuenta nueva entra con rol **pending** (sin acceso) hasta que un admin le asigne un rol.

### 7. Crear `.env.local`

```bash
cp .env.example .env.local
```

Rellena, desde **Project Settings → API Keys** / **Data API**:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_…`) o la *anon key* antigua |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` en local |
| `SUPABASE_SECRET_KEY` | *(opcional)* Secret key (`sb_secret_…`), solo para invitar/eliminar usuarios desde el panel |
| `IMAGE_OPTIMIZATION` | `false` (déjalo así en el plan gratuito) |

Comprueba la configuración con:

```bash
npm run check
```

### 8. Arrancar en local

```bash
npm run dev
```

- Web: <http://localhost:3000> (español en la raíz; `/en`, `/pt`, `/fr`).
- Panel: <http://localhost:3000/admin> → entra con el usuario del paso 5.

Sin variables de Supabase la web arranca en **modo demo de solo lectura** con el contenido de `lib/seed-data.js`.

### 9. Subir el código a GitHub

```bash
git init
git add .
git commit -m "Leonida Records v2"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/leonida-records.git
git push -u origin main
```

`.env.local` está en `.gitignore`: **nunca** subas claves.

### 10. Importar en Vercel

[vercel.com/new](https://vercel.com/new) → **Import** el repositorio. Vercel detecta Next.js automáticamente; no cambies los comandos de build.

### 11. Variables de entorno en Vercel

Antes de desplegar, en **Environment Variables** añade las mismas del paso 7 (Production y Preview), con una diferencia:

- `NEXT_PUBLIC_SITE_URL` = la URL pública, sin barra final, p. ej. `https://leonida-records.vercel.app`.

### 12. Desplegar y conectar Auth

1. Pulsa **Deploy**.
2. En Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://leonida-records.vercel.app`
   - **Redirect URLs**: `https://leonida-records.vercel.app/**` y `http://localhost:3000/**`
3. En **Authentication → Emails → Templates**, en **Invite user**, cambia el enlace por:
   ```
   {{ .SiteURL }}/admin/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/admin/set-password
   ```
   y en **Reset Password**:
   ```
   {{ .SiteURL }}/admin/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/admin/set-password
   ```
4. Recomendado: **Authentication → Sign In / Providers → desactiva "Allow new users to sign up"**. Así solo entra quien tú crees o invites.

### 13. Dominio propio

1. Vercel → proyecto → **Settings → Domains → Add** → `leonidarecords.com` (y `www`, que redirija al principal).
2. Crea en tu registrador los registros DNS que indica Vercel (normalmente `A 76.76.21.21` para el dominio raíz y `CNAME cname.vercel-dns.com` para `www`). El HTTPS se activa solo.
3. Cambia `NEXT_PUBLIC_SITE_URL` a `https://leonidarecords.com`.
4. En Supabase, actualiza **Site URL** y añade `https://leonidarecords.com/**` a **Redirect URLs**.
5. Vercel → **Deployments → Redeploy** para aplicar la nueva URL (canónicas, sitemap, Open Graph y emails).

---

## Roles

| Rol | Puede |
|---|---|
| **admin** | Todo: crear, editar, publicar y **eliminar** fichas y noticias; ajustes del sitio; usuarios y roles. |
| **editor** | Crear, editar y publicar fichas, noticias, medios, fuentes, relaciones, categorías y cronología. No elimina fichas, noticias, fuentes, categorías ni eventos, ni toca ajustes o usuarios. |
| **pending** | Puede iniciar sesión, pero no ve nada del panel. Rol por defecto de cualquier cuenta nueva. |

Los permisos se aplican dos veces: en el servidor (cada Server Action comprueba sesión y rol) y en la base de datos (políticas RLS). Aunque alguien llamara a la API directamente con la clave pública, RLS lo bloquea.

---

## Uso del panel

- **Nueva ficha**: *Fichas → Nueva ficha*. Pestañas General, Contenido, Media, Fuentes y datos, Relaciones y Traducciones. Los borradores se autoguardan cada 5 s; *Publicar* la hace visible. `Ctrl/Cmd + S` guarda.
- **Nueva noticia**: *The Leonida Times → Escribir noticia*. Titular, entradilla y cuerpo por idioma; sección, portada, fichas relacionadas y SEO. Una fecha futura la **programa**.
- **Imágenes**: *Media* → arrastra archivos (se suben a Supabase Storage, máx. 15 MB) o pega una URL. Desde cualquier editor, *Biblioteca* abre el selector.
- **Relaciones**: en la pestaña Relaciones de una ficha o en *Relaciones* (p. ej. Jason → es pareja de → Lucia). Aparecen en ambas fichas.
- **Traducciones**: cambia de idioma con las pestañas ES/EN/PT/FR. Un campo vacío muestra el español en la web. *Traducciones → Copiar ES → XX* da un punto de partida.
- **Vista previa**: botón *Vista previa* en cualquier editor (funciona también con borradores).

Los cambios aparecen en la web al momento: cada acción del panel revalida las páginas públicas y el sitemap.

---

## Estructura

```
app/
  [lang]/            Web pública (ES en la raíz, /en /pt /fr), ISR 5 min
  admin/             Panel: login, auth, (console)/…, preview, _actions/ (Server Actions)
  api/search/        Buscador instantáneo
  sitemap.js robots.js manifest.js
components/site/     Componentes públicos
components/admin/    Componentes del panel (tablas, editores, Tiptap, media…)
lib/                 i18n, SEO, clientes Supabase, validación (zod), saneado de texto enriquecido, datos
styles/              base.css, public.css, admin.css
supabase/            schema.sql, seed.sql
proxy.js             Idioma por URL + protección de /admin
```

## Notas

- **Free tier**: la optimización de imágenes de Vercel está desactivada por defecto (`IMAGE_OPTIMIZATION=false`) para no gastar cuota. Supabase gratuito da 1 GB de Storage y 500 MB de base de datos; de sobra para miles de fichas. Los proyectos gratuitos de Supabase se pausan tras 7 días sin actividad: basta con reactivarlo desde el panel.
- **Seguridad**: el texto enriquecido se guarda como JSON y se sanea en el servidor (lista blanca de nodos y URLs); nunca se inyecta HTML. La clave secreta solo se usa en el servidor.
- **Regenerar el seed**: edita `lib/seed-data.js` y ejecuta `npm run seed:generate`.
- **Actualizar desde v8**: el esquema es nuevo e incompatible. Lo más limpio es un proyecto de Supabase nuevo con `schema.sql` + `seed.sql`, que ya incluye todo el contenido de v8 migrado y traducido.
