'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error capturado:", error);
  }, [error]);

  return (
    <div className="p-8 text-center bg-red-50 rounded-lg">
      <h2 className="text-xl font-semibold text-red-800">Error de conexión</h2>
      <p className="text-gray-600 mb-4">No se pudieron cargar los datos.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-red-600 text-white rounded-md"
      >
        Reintentar
      </button>
    </div>
  );
}