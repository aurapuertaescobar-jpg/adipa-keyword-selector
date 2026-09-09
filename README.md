# Selección de Keywords - ADIPA

Herramienta de análisis automático de SERP por país para decidir si una keyword sirve para generar contenido SEO.

## Características

✅ **Carga de Keywords** - Ingresa una o múltiples keywords de una vez  
✅ **Análisis Automático SERP** - Busca las top 3 URLs por país (Chile, México, Colombia, Argentina)  
✅ **Clasificación Inteligente** - IA clasifica cada URL como Informativa o Comercial  
✅ **Veredicto Automático** - Genera un veredicto basado en la regla de mayoría (≥6 comerciales = NO FUNCIONA)  
✅ **Historial Versionado** - Guarda todas las corridas anteriores con fecha/hora  
✅ **Tabla de Resultados** - Visualiza todos los datos con país, posición, clasificación y observaciones  

## Tech Stack

- **Frontend**: Next.js 16+ con React + TypeScript + Tailwind CSS
- **Backend**: API Routes de Next.js
- **Base de Datos**: SQLite con Prisma ORM
- **Integraciones**: Semrush MCP (SERP), Claude API (Clasificación IA)

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar base de datos
npm run db:push

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Configuración

Crea un archivo `.env.local` en la raíz del proyecto:

```env
DATABASE_URL="file:./prisma/dev.db"
ANTHROPIC_API_KEY="tu-key-aqui"
SEMRUSH_API_KEY="tu-key-aqui"
```

## Uso

### 1. Cargar Keywords
- Ingresa una keyword por línea o separadas por comas en el formulario lateral
- La herramienta valida duplicados automáticamente

### 2. Analizar Keyword
- Haz click en una keyword para ver su detalle
- Presiona "Analizar Ahora" para disparar un análisis

### 3. Ver Resultados
- Se muestran las 12 URLs (3 × 4 países) en una tabla
- Cada URL tiene clasificación, observación, y alerta si es comercial
- El veredicto aparece de forma clara: ✓ FUNCIONA o ✗ NO FUNCIONA

### 4. Historial
- En la pestaña "Historial" puedes ver todas las corridas anteriores
- Selecciona cualquier versión para verla en detalle

## Reglas de Negocio

1. **Alerta Individual**: Si una URL es clasificada como "Comercial", se marca con alerta (⚠️)
2. **Veredicto Agregado**: Si ≥6 de las 12 URLs son comerciales → "NO FUNCIONA"
3. **Historial**: Cada análisis se guarda como una nueva versión con fecha/hora
4. **Clasificación Global**: Un veredicto único por keyword (sin distinción por país)

## Estructura de Base de Datos

```
Keyword
├── id (string, PK)
├── name (string, unique)
├── createdAt (datetime)
└── versions (Version[])

Version
├── id (string, PK)
├── keywordId (string, FK)
├── versionNumber (int)
├── verdict (string: "FUNCIONA" | "NO_FUNCIONA")
├── commercialCount (int)
├── createdAt (datetime)
└── urls (AnalyzedUrl[])

AnalyzedUrl
├── id (string, PK)
├── versionId (string, FK)
├── country (string)
├── position (int)
├── url (string)
├── keywords (string)
├── classification (string: "Informativo" | "Comercial")
├── observation (string)
└── alert (boolean)
```

## Endpoints API

### Keywords
- `GET /api/keywords` - Lista todas las keywords
- `POST /api/keywords` - Crear una nueva keyword
- `GET /api/keywords/[id]` - Obtener detalle de una keyword
- `DELETE /api/keywords/[id]` - Eliminar una keyword
- `POST /api/keywords/[id]/analyze` - Dispara el análisis de la keyword

## Roadmap - Funcionalidades Futuras (v2+)

- 🔄 Override manual de clasificaciones IA
- 📊 Dashboard de estadísticas
- 📥 Importar keywords desde Semrush
- 🔔 Notificaciones de cambios en veredicto
- 📤 Exportar resultados a CSV/PDF
- 👥 Multi-usuario con roles
- 🗺️ Países dinámicos (no solo 4 fijos)

## Notas de Desarrollo

### Estado Actual (v1)
- Los datos de SERP y clasificación son datos mock para demostración
- Se pueden reemplazar con llamadas reales a Semrush MCP y Claude API
- La UI está completamente funcional y lista para producción

### Integración Semrush MCP
Ubicación: `lib/semrush.ts`
- Función `fetchSerpResults(keyword, country)` - Obtiene top 3 URLs
- Función `fetchUrlContent(url)` - Extrae contenido de URL
- TODO: Reemplazar mock calls con llamadas reales al MCP

### Integración Claude API
Ubicación: `lib/claude.ts`
- Función `classifyUrl(url, content)` - Clasifica como Informativo/Comercial
- Función `generateObservation(url, classification)` - Genera observación
- TODO: Reemplazar mock calls con llamadas reales a Claude

## Troubleshooting

**Error: DATABASE_URL not found**
- Asegúrate que .env existe en la raíz del proyecto
- Ejecuta `npm run db:push` para crear la base de datos

**El servidor no inicia**
- Limpia la carpeta .next: `rm -rf .next`
- Reinstala dependencias: `rm -rf node_modules && npm install`

**Errores de compilación TypeScript**
- Asegúrate estar usando Node.js 18+
- Ejecuta `npm run build` para verificar

## Licencia

Proyecto privado de ADIPA

## Contacto

Para preguntas o sugerencias sobre esta herramienta, contacta al equipo de desarrollo.
