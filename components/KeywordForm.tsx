"use client";

import { useState } from "react";

interface KeywordFormProps {
  onKeywordAdded: () => void;
}

export default function KeywordForm({ onKeywordAdded }: KeywordFormProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!input.trim()) {
      setError("Ingresa al menos una keyword");
      return;
    }

    const keywords = input
      .split(/[\n,]/)
      .map((k) => k.trim())
      .filter((k) => k);

    if (keywords.length === 0) {
      setError("Ingresa al menos una keyword válida");
      return;
    }

    setLoading(true);

    try {
      for (const keyword of keywords) {
        const response = await fetch("/api/keywords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: keyword }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Error al crear keyword");
          setLoading(false);
          return;
        }
      }

      setSuccess(`${keywords.length} keyword(s) añadida(s) correctamente`);
      setInput("");
      setTimeout(() => setSuccess(""), 3000);
      onKeywordAdded();
    } catch (err) {
      setError("Error al procesar keywords");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Cargar Keywords
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keyword(s)
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ingresa una keyword por línea o separadas por comas"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-2">
            Puedes ingresar una keyword por línea o separarlas por comas
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition"
        >
          {loading ? "Cargando..." : "Cargar Keywords"}
        </button>
      </form>
    </div>
  );
}
