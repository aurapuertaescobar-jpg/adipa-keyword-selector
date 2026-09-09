"use client";

import { useEffect, useState } from "react";
import KeywordForm from "@/components/KeywordForm";
import KeywordList from "@/components/KeywordList";

export default function Home() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/keywords");
      const data = await response.json();
      setKeywords(data);
    } catch (error) {
      console.error("Error fetching keywords:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          ¿Cómo funciona?
        </h2>
        <p className="text-blue-800">
          1. Ingresa una keyword • 2. La herramienta busca en Google (4 países)
          • 3. Clasifica las URLs como informativas o comerciales • 4. Genera
          un veredicto automático
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <KeywordForm onKeywordAdded={fetchKeywords} />
        </div>

        <div className="lg:col-span-2">
          <KeywordList keywords={keywords} loading={loading} onAnalyzed={fetchKeywords} />
        </div>
      </div>
    </div>
  );
}
