// Ollama API integration for URL classification
// Classifies URLs as "Informativo" or "Comercial" using local Mistral model

import type { PageMetadata } from "./semrush";

interface ClassificationResult {
  classification: "Informativo" | "Comercial";
  observation: string;
  confidence: number;
}

const MOCK_CLASSIFICATIONS: Record<string, ClassificationResult> = {
  "articulo|blog|tutorial|guia": {
    classification: "Informativo",
    observation:
      "Contenido educativo y de valor. Estructura clara con headings bien organizados. Autoridad media, presencia de links externos. Contenido académico y detallado en español. Sin elementos de conversión comercial visibles.",
    confidence: 0.95,
  },
  "producto|tienda|ecommerce|comprar": {
    classification: "Comercial",
    observation:
      "Página de venta directa. Fuerte call-to-action para comprar. Estructura optimizada para conversión. Autoridad variable. Presente carrito de compras y formularios de pago. Contenido orientado a la transacción.",
    confidence: 0.98,
  },
  "resena|opinion|review": {
    classification: "Informativo",
    observation:
      "Contenido de opiniones y experiencias. Estructura moderada. Presencia de testimonios. Autoridad media en el tema. Enfoque en proporcionar información de decisión, no venta directa.",
    confidence: 0.85,
  },
  "noticias|noticia|actualidad": {
    classification: "Informativo",
    observation:
      "Contenido de noticias. Estructura de artículo periodístico. Autoridad alta (medios). Fecha de publicación clara. Contenido neutral e informativo. No hay elementos comerciales.",
    confidence: 0.92,
  },
};

export async function classifyUrl(
  url: string,
  metadata?: PageMetadata | null
): Promise<ClassificationResult> {
  try {
    // Llamar a Ollama API local (http://localhost:11434)
    const ollamaUrl = "http://localhost:11434/api/generate";

    // Construir datos SEO del análisis
    const seoAnalysis = metadata
      ? `
ANÁLISIS SEO:
- H1s: ${metadata.h1Count} (${metadata.h1Count > 1 ? "⚠️ Múltiples H1s detectados" : "Único H1"})
- Meta description: ${metadata.hasMetaDescription ? "✓ Presente" : "✗ Ausente"}
- Meta keywords: ${metadata.hasMetaKeywords ? "✓ Presente" : "✗ Ausente"}
- Idioma: ${metadata.language.toUpperCase()}
- Palabras: ${metadata.wordCount}
- Datos estructurados: ${metadata.hasStructuredData ? "✓ Sí" : "✗ No"}
- Autoridad: ${metadata.wordCount > 2000 ? "Alta (contenido largo)" : metadata.wordCount > 1000 ? "Media" : "Baja"}
`
      : "";

    const prompt = `Analiza la siguiente URL para clasificarla como INFORMATIVA o COMERCIAL.

URL: ${url}
${seoAnalysis}

Contenido preview (primeros 300 caracteres):
${metadata?.contentPreview?.substring(0, 300) || "No disponible - solo analiza por URL"}

Responde EXACTAMENTE en este formato JSON (solo JSON, sin markdown):
{
  "classification": "Informativo" o "Comercial",
  "observation": "Observación en español de 2-3 líneas mencionando: intención (venta/educación), H1s, metadatos, idioma, autoridad. Sé específico con los números.",
  "confidence": número entre 0 y 1
}

CRITERIOS DE CLASIFICACIÓN:
- INFORMATIVO: Blog, tutoriales, artículos, noticias, guías. Sin CTA de compra clara.
- COMERCIAL: E-commerce, tienda online, producto, landing page de venta. Con CTA compra.

RESPONDE SOLO CON EL JSON.`;

    const response = await fetch(ollamaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama error: ${response.status}. ¿Está Ollama corriendo en http://localhost:11434?`
      );
    }

    const data = await response.json();
    const responseText = data.response.trim();

    // Intentar extraer JSON de la respuesta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", responseText);
      throw new Error("Ollama no retornó JSON válido");
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      classification: result.classification || "Informativo",
      observation:
        result.observation ||
        "Error en clasificación pero se retorna valor por defecto",
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    console.error("Error classifying URL with Ollama:", error);
    // Fallback con análisis basado en metadatos
    const observation = metadata ?
      `Contenido ${metadata.wordCount > 1000 ? 'extenso' : metadata.wordCount > 500 ? 'medio' : 'breve'} (${metadata.wordCount} palabras). ${metadata.h1Count > 1 ? `⚠️ ${metadata.h1Count} H1s detectados` : 'Único H1'}. Meta description ${metadata.hasMetaDescription ? '✓' : '✗'}. Idioma: ${metadata.language.toUpperCase()}. ${metadata.hasStructuredData ? 'Datos estructurados presentes' : 'Sin datos estructurados'}.` :
      "Análisis de metadatos no disponible";
    return {
      classification: "Informativo",
      observation,
      confidence: 0.6,
    };
  }
}

export async function generateObservation(
  url: string,
  classification: "Informativo" | "Comercial"
): Promise<string> {
  // In real implementation, Claude would generate this
  // For now, return the pre-defined observation for the classification

  const result = Object.values(MOCK_CLASSIFICATIONS).find(
    (r) => r.classification === classification
  );

  return (
    result?.observation ||
    `Contenido ${classification}. Requiere análisis manual adicional para determinar autoridad y relevancia.`
  );
}
