# Configuración de Supabase

## Pasos para conectar el proyecto a Supabase

### 1. Crear las tablas en Supabase

Ve a tu proyecto de Supabase (https://gafppeuwivrxpizulexf.supabase.co) y ejecuta el SQL que está en:
- `supabase/migrations/001_create_tables.sql`

O ejecuta el SQL directamente en el SQL Editor de Supabase.

### 2. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```
VITE_SUPABASE_URL=https://gafppeuwivrxpizulexf.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

Para obtener tu `VITE_SUPABASE_ANON_KEY`:
1. Ve a tu proyecto en Supabase
2. Ve a Settings > API
3. Copia la "anon public" key

### 3. Reiniciar el servidor de desarrollo

Después de crear el archivo `.env`, reinicia el servidor:

```bash
npm run dev
```

## Estructura de las tablas

- **collections**: Almacena las colecciones de productos
- **products**: Almacena los productos del catálogo
- **site_config**: Almacena la configuración del sitio (una sola fila)

## Notas

- El código tiene un fallback a localStorage si Supabase no está disponible
- Las políticas RLS están configuradas para permitir lectura y escritura pública (puedes ajustarlas según tus necesidades de seguridad)

