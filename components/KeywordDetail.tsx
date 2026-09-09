"use client";

import { useEffect, useState } from "react";
import ResultsTable from "@/components/ResultsTable";
import VerdictCard from "@/components/VerdictCard";
import VersionHistory from "@/components/VersionHistory";

interface Keyword {
  id: string;
  name: string;
  versions: any[];
}

interface KeywordDetailProps {
  keyword: Keyword;
  onBack: () => void;
  onAnalyzed: () => void;
}

export default function KeywordDetail({
  keyword,
  onBack,
  onAnalyzed,
}: KeywordDetailProps) {
  const [fullKeyword, setFullKeyword] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"results" | "history">(
    "results"
  );

  useEffect(() => {
    const fetchKeywordDetail = async () => {
      try {
        const response = await fetch(`/api/keywords/${keyword.id}`);
        const data = await response.json();
        setFullKeyword(data);
      } catch (error) {
        console.error("Error fetching keyword detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKeywordDetail();
  }, [keyword.id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(`/api/keywords/${keyword.id}/analyze`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Analysis error response:", errorData);
        alert(`Error: ${errorData.error || "Error en el análisis"}`);
        setAnalyzing(false);
        return;
      }

      const data = await response.json();
      console.log("Analysis completed:", data);

      setFullKeyword((prev: any) => ({
        ...prev,
        versions: [data, ...(prev.versions || [])],
      }));
      onAnalyzed();
    } catch (error) {
      console.error("Error analyzing keyword:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
        Cargando...
      </div>
    );
  }

  if (!fullKeyword) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-red-600">
        Error al cargar keyword
      </div>
    );
  }

  const latestVersion = fullKeyword?.versions?.[0];

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Volver a lista
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {fullKeyword?.name || "Cargando..."}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {fullKeyword?.versions?.length || 0} versión(es) analizada(s)
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-md transition"
          >
            {analyzing ? "Analizando..." : "Analizar Ahora"}
          </button>
        </div>

        {!latestVersion && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            Esta keyword aún no ha sido analizada. Haz click en "Analizar Ahora" para comenzar.
          </div>
        )}

        {latestVersion && <VerdictCard version={latestVersion} />}
      </div>

      {latestVersion && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("results")}
                className={`px-6 py-3 font-medium border-b-2 transition ${
                  activeTab === "results"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Resultados
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-3 font-medium border-b-2 transition ${
                  activeTab === "history"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Historial ({fullKeyword.versions.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "results" && (
              <ResultsTable version={latestVersion} />
            )}
            {activeTab === "history" && (
              <VersionHistory versions={fullKeyword.versions} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
