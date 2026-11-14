'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Reset Your Password
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Enter the email address associated with your account and we will send you a reset link.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Check Your Inbox</h3>
            <p className="text-xs text-gray-600">
              We have dispatched password reset instructions to <strong>{email}</strong>.
            </p>
            <div className="pt-3">
              <Link
                href="/account/login"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-900 hover:text-amber-600"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Account Email
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-sm rounded-xl shadow transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/account/login"
                className="inline-flex items-center space-x-1 text-xs text-gray-500 hover:text-black font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
