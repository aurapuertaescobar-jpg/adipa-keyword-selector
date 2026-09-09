"use client";

import { useState } from "react";
import ResultsTable from "@/components/ResultsTable";
import VerdictCard from "@/components/VerdictCard";

interface Version {
  id: string;
  versionNumber: number;
  verdict: string;
  commercialCount: number;
  urls: any[];
  createdAt: string;
}

interface VersionHistoryProps {
  versions: Version[];
}

export default function VersionHistory({ versions }: VersionHistoryProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    versions[0]?.id || null
  );

  const selectedVersion = versions.find((v) => v.id === selectedVersionId);

  if (versions.length === 0) {
    return (
      <div className="text-center text-gray-600 py-8">
        No hay versiones analizadas aún
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 mb-3">Selecciona una versión</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {versions.map((version) => (
            <button
              key={version.id}
              onClick={() => setSelectedVersionId(version.id)}
              className={`p-3 rounded-lg border-2 text-left transition ${
                selectedVersionId === version.id
                  ? "bg-blue-50 border-blue-400"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-semibold text-gray-900">
                V{version.versionNumber}
              </p>
              <p className="text-xs text-gray-600">
                {new Date(version.createdAt).toLocaleString("es-ES")}
              </p>
              <p
                className={`text-xs font-medium mt-1 ${
                  version.verdict === "FUNCIONA"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {version.verdict === "FUNCIONA" ? "✓ Sirve" : "✗ No funciona"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {selectedVersion && (
        <div className="space-y-6">
          <VerdictCard version={selectedVersion} />
          <ResultsTable version={selectedVersion} />
        </div>
      )}
    </div>
  );
}
