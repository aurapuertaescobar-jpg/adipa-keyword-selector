# Guía de Implementación de Integraciones Reales

Este documento describe cómo reemplazar los datos mock con integraciones reales a Semrush MCP y Claude API.

## 1. Integración Semrush MCP

### Ubicación
`lib/semrush.ts`

### Actual (Mock)
```typescript
export async function fetchSerpResults(keyword: string, country: string) {
  // Retorna datos mock
  const mockKey = `${country}|${keyword.split(" ")[0]}`;
  return MOCK_SERP_DATA[mockKey];
}
```

### A Implementar (Real)
```typescript
export async function fetchSerpResults(keyword: string, country: string) {
  // Llamar a Semrush MCP
  const database = countryToDatabase(country);
  
  // 1. Usar el MCP disponible en el sistema
  const results = await callSemrushMCP({
    toolkit: "organic_research", // o el que corresponda
    keyword: keyword,
    database: database,
    display_limit: 3,
  });
  
  // 2. Transformar resultados al formato esperado
  return results.map((r) => ({
    position: r.position,
    url: r.url,
    title: r.title,
    description: r.description,
  }));
}
```

### Mapeo de Países
```typescript
{
  "Chile": "cl",
  "México": "mx",
  "Colombia": "co",
  "Argentina": "ar"
}
```

### Nota Importante
El MCP de Semrush está disponible en este entorno. Consulta la documentación del MCP para los parámetros exactos y formatos de respuesta.

---

## 2. Integración Claude API

### Ubicación
`lib/claude.ts`

### Actual (Mock)
```typescript
export async function classifyUrl(url: string, contentPreview?: string) {
  // Retorna clasificaciones mock basadas en patrones de URL
  const urlLower = url.toLowerCase();
  for (const [pattern, classification] of Object.entries(MOCK_CLASSIFICATIONS)) {
    if (pattern.split("|").some((p) => urlLower.includes(p))) {
      return classification;
    }
  }
}
```

### A Implementar (Real)
```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function classifyUrl(url: string, contentPreview?: string) {
  const response = await anthropic.messages.create({
    model: "claude-opus-5", // O el modelo que prefieras
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Analiza la siguiente URL y su contenido para determinar si es informativa o comercial.

URL: ${url}

Contenido preview (primeros 1000 caracteres):
${contentPreview?.substring(0, 1000) || "No disponible"}

Debes responder EXACTAMENTE en este formato JSON (sin markdown):
{
  "classification": "Informativo" o "Comercial",
  "observation": "Una observación detallada en español sobre el tipo de contenido, estructura, autoridad, etc.",
  "confidence": número entre 0 y 1
}

Criterios:
- INFORMATIVO: Contenido educativo, blog posts, tutoriales, noticias, guías. Sin intención de venta directa.
- COMERCIAL: Páginas de producto, tiendas online, landing pages de venta, e-commerce. Con CTA clara de compra.

Responde solo con el JSON, sin explicaciones adicionales.`,
      },
    ],
  });

  // Extraer el JSON de la respuesta
  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const result = JSON.parse(content.text);
  return {
    classification: result.classification,
    observation: result.observation,
    confidence: result.confidence,
  };
}
```

### Variables de Entorno
```env
ANTHROPIC_API_KEY=sk-ant-... # Tu API key de Anthropic
```

### Modelos Recomendados
- `claude-opus-5` - Máxima calidad (más caro, más lento)
- `claude-sonnet-5` - Balance (recomendado)
- `claude-haiku-4.5-20251001` - Más rápido (menos preciso)

---

## 3. Integración Web Scraping (Opcional)

Para obtener contenido real de las URLs (actualmente mock), puedes usar:

### Opción A: Cheerio (server-side)
```bash
npm install cheerio axios
```

```typescript
import axios from "axios";
import * as cheerio from "cheerio";

export async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(response.data);
    
    // Extraer texto del body
    return $.text().substring(0, 5000); // Limitar a 5000 caracteres
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}
```

### Opción B: OpenAI web search (via Claude)
```typescript
// Claude puede leer URLs directamente si les pasas el contenido
// Esta es la mejor opción para no tener que parsear HTML
```

### Opción C: Puppeteer (para JS-heavy sites)
```bash
npm install puppeteer
```
(Más lento pero maneja sitios dinámicos)

---

## 4. Checklist de Implementación

- [ ] Instalar dependencias necesarias (`@anthropic-ai/sdk`, `cheerio`, etc.)
- [ ] Obtener API keys:
  - [ ] ANTHROPIC_API_KEY de https://console.anthropic.com
  - [ ] SEMRUSH_API_KEY (si es necesaria)
- [ ] Actualizar `lib/semrush.ts` con llamadas reales
- [ ] Actualizar `lib/claude.ts` con llamadas reales
- [ ] Configurar `.env.local` con las claves
- [ ] Testear con una keyword de prueba
- [ ] Monitorear tiempos de respuesta y costos
- [ ] Implementar retry logic en caso de fallos
- [ ] Implementar rate limiting si es necesario

---

## 5. Consideraciones de Producción

### Caching
Para evitar llamadas repetidas a las APIs:
```typescript
// Implementar cache en Redis o Upstash
const cachedResult = await redis.get(`classify:${url}`);
if (cachedResult) return JSON.parse(cachedResult);
```

### Rate Limiting
```typescript
// Implementar rate limiting por IP o usuario
const rateLimiter = new RateLimiter({
  points: 10, // 10 análisis
  duration: 60, // por minuto
});

await rateLimiter.consume(userIP);
```

### Error Handling
```typescript
try {
  const result = await classifyUrl(url);
  return result;
} catch (error) {
  if (error instanceof TimeoutError) {
    // Retornar clasificación por defecto
    return { classification: "Informativo", confidence: 0.5 };
  }
  throw error;
}
```

### Monitoreo
- Registrar todas las llamadas a APIs
- Monitorear tiempo de respuesta
- Alertar si fallan más del 5% de requests
- Trackear costos mensuales de API

---

## 6. Costos Estimados (Mensual)

### Semrush MCP
- Depende del plan que uses
- Típicamente: $100-$500/mes

### Claude API
- Aproximadamente $0.03 por 1000 tokens de entrada
- Si clasificas 100 URLs por día: ~$1-3/mes (muy bajo)

### Total Estimado
- **Bajo volumen**: $100-200/mes
- **Medio volumen**: $200-500/mes
- **Alto volumen**: $500-1000+/mes

---

## 7. Testing

### Test Local
```bash
# 1. Actualizar lib/semrush.ts y lib/claude.ts
# 2. Asegurarse que .env.local tiene las keys
# 3. npm run dev
# 4. En la UI, cargar una keyword de prueba
# 5. Verificar que obtiene resultados reales
```

### Test Automatizado
```typescript
// test/api.test.ts
import { classifyUrl } from "@/lib/claude";

test("classifyUrl returns correct classification", async () => {
  const result = await classifyUrl("https://amazon.com/product");
  expect(result.classification).toBe("Comercial");
});
```

---

## 8. Fallback Strategy

Si las APIs fallan, la herramienta debe:
1. Intentar reconectar 2-3 veces
2. Si persiste el error, usar un modelo fallback
3. Loguear todos los errores para revisión
4. Mostrar al usuario que el análisis es "incompleto"

```typescript
async function classifyUrlWithFallback(url: string) {
  try {
    return await classifyUrl(url);
  } catch (error) {
    console.error("Classification failed, using fallback", error);
    return {
      classification: "Informativo", // Fallback seguro
      observation: "Análisis no disponible temporalmente",
      confidence: 0,
    };
  }
}
```

---

## Contacto y Preguntas

Para preguntas sobre la implementación, contacta al equipo técnico de ADIPA.
