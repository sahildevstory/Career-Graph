"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Array<{ id: string; name: string; label: string[] }>>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.data || []);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSelectResult = (id: string, label: string[]) => {
    const type = label[0]?.toLowerCase() || "skill";
    const path = type === "role" ? `/roles/${id}` : `/${type}s/${id}`;
    router.push(path);
    setQuery("");
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div className="relative w-full md:w-64">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
        <input
          type="text"
          placeholder="Search skills, roles..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleSelectResult(result.id, result.label)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">{result.name}</div>
                      <div className="text-xs text-slate-500">{result.label.join(", ")}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="px-4 py-3 text-sm text-slate-500">No results found</div>
          ) : null}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
