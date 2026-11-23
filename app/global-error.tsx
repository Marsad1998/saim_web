'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError =
    error?.name === 'ChunkLoadError' ||
    /Loading chunk .* failed/i.test(error?.message || '');

  useEffect(() => {
    if (isChunkError) {
      window.location.reload();
    }
  }, [isChunkError]);

  return (
    <html lang="en">
      <body className="bg-gray-50 flex items-center justify-center min-h-screen p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isChunkError ? 'Application Update Available' : 'Application Error'}
          </h2>
          <p className="text-sm text-gray-600">
            {isChunkError
              ? 'New scripts have been deployed. Click below to reload the latest version.'
              : 'We encountered an unexpected error. Please refresh the page to reload.'}
          </p>
          <button
            onClick={() => {
              if (isChunkError) {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-all shadow-sm"
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}
