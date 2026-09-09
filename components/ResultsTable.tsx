"use client";

interface URL {
  id: string;
  country: string;
  position: number;
  url: string;
  keywords: string;
  classification: string;
  observation: string;
  alert: boolean;
}

interface Version {
  id: string;
  urls: URL[];
}

interface ResultsTableProps {
  version: Version;
}

export default function ResultsTable({ version }: ResultsTableProps) {
  const sortedUrls = [...version.urls].sort((a, b) => {
    const countryOrder: Record<string, number> = {
      Chile: 0,
      México: 1,
      Colombia: 2,
      Argentina: 3,
    };
    const countryDiff =
      (countryOrder[a.country] || 4) - (countryOrder[b.country] || 4);
    return countryDiff || a.position - b.position;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              País
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              Posición
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              URL
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              Clasificación
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              Observación
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedUrls.map((url, idx) => (
            <tr
              key={url.id}
              className={`border-b border-gray-200 ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="px-4 py-3 font-medium text-gray-900">
                {url.country}
              </td>
              <td className="px-4 py-3 text-gray-600">#{url.position}</td>
              <td className="px-4 py-3">
                <a
                  href={url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 truncate max-w-xs block"
                  title={url.url}
                >
                  {url.url}
                </a>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    url.classification === "Comercial"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {url.classification}
                  {url.alert && " ⚠️"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 max-w-xs">
                <details className="cursor-pointer">
                  <summary className="font-medium text-gray-900 hover:text-blue-600">
                    Ver detalles
                  </summary>
                  <p className="mt-2 text-xs text-gray-600 whitespace-normal">
                    {url.observation}
                  </p>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Leyenda:</strong> Verde = Informativo | Rojo = Comercial | ⚠️
          = Alerta por URL comercial
        </p>
      </div>
    </div>
  );
}
