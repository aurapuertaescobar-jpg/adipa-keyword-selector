"use client";

interface Version {
  id: string;
  verdict: string;
  commercialCount: number;
  urls: any[];
  createdAt: string;
}

interface VerdictCardProps {
  version: Version;
}

export default function VerdictCard({ version }: VerdictCardProps) {
  const isFunciona = version.verdict === "FUNCIONA";
  const commercialPercentage = Math.round(
    (version.commercialCount / (version.urls?.length || 1)) * 100
  );

  return (
    <div
      className={`rounded-lg p-6 border-2 ${
        isFunciona
          ? "bg-green-50 border-green-300"
          : "bg-red-50 border-red-300"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`text-4xl font-bold ${
            isFunciona ? "text-green-600" : "text-red-600"
          }`}
        >
          {isFunciona ? "✓" : "✗"}
        </div>

        <div className="flex-1">
          <h3
            className={`text-lg font-bold ${
              isFunciona ? "text-green-900" : "text-red-900"
            }`}
          >
            {isFunciona ? "Esta keyword SIRVE" : "Esta keyword NO FUNCIONA"}
          </h3>
          <p
            className={`text-sm mt-2 ${
              isFunciona ? "text-green-700" : "text-red-700"
            }`}
          >
            {version.commercialCount} de {version.urls?.length || 0} URLs son
            comerciales ({commercialPercentage}%)
          </p>
          <p className="text-xs mt-1 text-gray-600">
            Umbral: ≥6 URLs comerciales = NO FUNCIONA
          </p>
        </div>
      </div>

      <div className="mt-4 bg-white bg-opacity-50 rounded p-3 text-xs text-gray-700">
        <p>
          Analizado: {new Date(version.createdAt).toLocaleString("es-ES")}
        </p>
      </div>
    </div>
  );
}
