// Serper.dev integration for SERP retrieval
// Free API for fetching top 3 URLs from Google for each country

interface SerpResult {
  position: number;
  url: string;
  title?: string;
  description?: string;
}

const MOCK_SERP_DATA: Record<string, SerpResult[]> = {
  "Chile|ejemplo": [
    {
      position: 1,
      url: "https://ejemplo-chile-1.com/articulo",
      title: "Título artículo 1",
      description: "Descripción del resultado",
    },
    {
      position: 2,
      url: "https://ejemplo-chile-2.com/producto",
      title: "Producto Chile",
      description: "Ficha de producto",
    },
    {
      position: 3,
      url: "https://ejemplo-chile-3.com/blog",
      title: "Blog Chile",
      description: "Post del blog",
    },
  ],
  "México|ejemplo": [
    {
      position: 1,
      url: "https://ejemplo-mexico-1.com/guia",
      title: "Guía Mexico",
      description: "Guía completa",
    },
    {
      position: 2,
      url: "https://ejemplo-mexico-2.com/tienda",
      title: "Tienda Mexico",
      description: "Compra online",
    },
    {
      position: 3,
      url: "https://ejemplo-mexico-3.com/info",
      title: "Información",
      description: "Datos útiles",
    },
  ],
  "Colombia|ejemplo": [
    {
      position: 1,
      url: "https://ejemplo-colombia-1.com/tutorial",
      title: "Tutorial Colombia",
      description: "Paso a paso",
    },
    {
      position: 2,
      url: "https://ejemplo-colombia-2.com/ecommerce",
      title: "E-commerce Colombia",
      description: "Comprar aquí",
    },
    {
      position: 3,
      url: "https://ejemplo-colombia-3.com/resena",
      title: "Reseña Colombia",
      description: "Opiniones de usuarios",
    },
  ],
  "Argentina|ejemplo": [
    {
      position: 1,
      url: "https://ejemplo-argentina-1.com/articulo",
      title: "Artículo Argentina",
      description: "Contenido detallado",
    },
    {
      position: 2,
      url: "https://ejemplo-argentina-2.com/tienda",
      title: "Tienda Argentina",
      description: "Venta de productos",
    },
    {
      position: 3,
      url: "https://ejemplo-argentina-3.com/noticias",
      title: "Noticias Argentina",
      description: "Últimas noticias",
    },
  ],
};

export async function fetchSerpResults(
  keyword: string,
  country: string
): Promise<SerpResult[]> {
  try {
    const apiKey = process.env.SERPER_API_KEY;

    // Si no hay API key, usar mock data
    if (!apiKey) {
      console.warn("SERPER_API_KEY no encontrada, usando mock data");
      const mockKey = `${country}|${keyword.split(" ")[0]}`;
      return MOCK_SERP_DATA[mockKey] || MOCK_SERP_DATA["Chile|ejemplo"];
    }

    // Llamar a Serper.dev API
    const gl = countryToGl(country);
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: keyword,
        gl: gl, // country code
        num: 10, // fetch 10 para asegurar tener 3 válidas
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Serper.dev error:", error);
      throw new Error(`Serper.dev API error: ${response.status}`);
    }

    const data = await response.json();

    // Extraer los primeros 3 resultados orgánicos
    const results = (data.organic || [])
      .slice(0, 3)
      .map((result: any, index: number) => ({
        position: index + 1,
        url: result.link,
        title: result.title,
        description: result.snippet,
      }));

    return results;
  } catch (error) {
    console.error("Error fetching SERP results:", error);
    // Fallback a mock si algo falla
    const mockKey = `${country}|${keyword.split(" ")[0]}`;
    return MOCK_SERP_DATA[mockKey] || MOCK_SERP_DATA["Chile|ejemplo"];
  }
}

function countryToGl(country: string): string {
  // Google país codes para Serper.dev
  const map: Record<string, string> = {
    Chile: "cl",
    México: "mx",
    Colombia: "co",
    Argentina: "ar",
  };
  return map[country] || "us";
}

export interface PageMetadata {
  title: string;
  description: string;
  h1Count: number;
  h1s: string[];
  hasMetaKeywords: boolean;
  hasMetaDescription: boolean;
  language: string;
  wordCount: number;
  hasStructuredData: boolean;
  contentPreview: string;
}

export async function fetchUrlContent(url: string): Promise<PageMetadata> {
  try {
    // Intenta hacer fetch real de la URL
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch ${url}, using mock data`);
      return getMockMetadata();
    }

    const html = await response.text();

    // Extraer metadatos
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : "";

    const descMatch = html.match(
      /<meta\s+name="description"\s+content="([^"]*)"/i
    );
    const description = descMatch ? descMatch[1] : "";

    const keywordsMatch = html.match(
      /<meta\s+name="keywords"\s+content="([^"]*)"/i
    );
    const hasMetaKeywords = !!keywordsMatch;
    const hasMetaDescription = !!descMatch;

    // Contar H1s
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h1s = h1Matches.map((h1) =>
      h1.replace(/<h1[^>]*>/, "").replace(/<\/h1>/i, "")
    );

    // Detectar idioma
    const langMatch = html.match(/<html[^>]*lang="([^"]+)"/i);
    const language = langMatch ? langMatch[1] : "en";

    // Contar palabras (aproximado)
    const textContent = html.replace(/<[^>]*>/g, " ");
    const wordCount = textContent.split(/\s+/).filter((w) => w.length > 0)
      .length;

    // Detectar JSON-LD o schema.org
    const hasStructuredData = /schema\.org|json-ld/i.test(html);

    // Preview de contenido (primeros 500 chars sin HTML)
    const contentPreview = textContent.substring(0, 500).trim();

    return {
      title,
      description,
      h1Count: h1s.length,
      h1s,
      hasMetaKeywords,
      hasMetaDescription,
      language,
      wordCount,
      hasStructuredData,
      contentPreview,
    };
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    return getMockMetadata();
  }
}

function getMockMetadata(): PageMetadata {
  return {
    title: "Ejemplo de página",
    description: "Descripción de ejemplo",
    h1Count: 1,
    h1s: ["Título principal"],
    hasMetaKeywords: true,
    hasMetaDescription: true,
    language: "es",
    wordCount: 2500,
    hasStructuredData: false,
    contentPreview: "Contenido de ejemplo para análisis",
  };
}
