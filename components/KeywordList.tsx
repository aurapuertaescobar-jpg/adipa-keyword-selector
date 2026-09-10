"use client";

import { useState } from "react";
import KeywordDetail from "@/components/KeywordDetail";

interface Keyword {
  id: string;
  name: string;
  versions: any[];
  createdAt: string;
}

interface KeywordListProps {
  keywords: Keyword[];
  loading: boolean;
  onAnalyzed: () => void;
}

export default function KeywordList({
  keywords,
  loading,
  onAnalyzed,
}: KeywordListProps) {
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(
    null
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
        Cargando keywords...
      </div>
    );
  }

  if (keywords.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
        No hay keywords cargadas aún. ¡Comienza añadiendo una!
      </div>
    );
  }

  const selectedKeyword = selectedKeywordId
    ? keywords.find((k) => k.id === selectedKeywordId)
    : null;

  if (selectedKeyword) {
    return (
      <KeywordDetail
        keyword={selectedKeyword}
        onBack={() => setSelectedKeywordId(null)}
        onAnalyzed={onAnalyzed}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Keywords Cargadas ({keywords.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {keywords.map((keyword) => {
          const latestVersion = keyword.versions && Array.isArray(keyword.versions) && keyword.versions.length > 0 ? keyword.versions[0] : null;
          const verdict = latestVersion
            ? latestVersion.verdict === "FUNCIONA"
              ? "✓ Sirve"
              : "✗ No funciona"
            : "Pendiente";
          const verdictColor =
            latestVersion && latestVersion.verdict === "FUNCIONA"
              ? "text-green-700"
              : latestVersion && latestVersion.verdict === "NO_FUNCIONA"
                ? "text-red-700"
                : "text-gray-700";

          return (
            <div
              key={keyword.id}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
              onClick={() => setSelectedKeywordId(keyword.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {keyword.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Versiones: {keyword.versions && Array.isArray(keyword.versions) ? keyword.versions.length : 0}
                  </p>
                </div>
                <div className={`font-semibold text-sm ${verdictColor}`}>
                  {verdict}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
