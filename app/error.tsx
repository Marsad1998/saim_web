'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
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
    // If it's a ChunkLoadError, attempt an automatic refresh once to sync with latest build
    if (isChunkError) {
      const retryKey = 'ots_error_chunk_retry';
      const last = sessionStorage.getItem(retryKey);
      const now = Date.now();
      if (!last || now - parseInt(last, 10) > 10000) {
        sessionStorage.setItem(retryKey, now.toString());
        window.location.reload();
      }
    }
    console.error('Next.js route error caught by App ErrorBoundary:', error);
  }, [error, isChunkError]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {isChunkError ? 'Application Update Available' : 'Something went wrong'}
          </h2>
          <p className="text-sm text-gray-600">
            {isChunkError
              ? 'A newer version of this page is available. Reloading will sync the latest scripts and data.'
              : error?.message || 'An unexpected error occurred while loading this view.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              if (isChunkError) {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
