'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useApp();

  const emailParam = searchParams.get('email') || '';
  const roleParam = searchParams.get('role') || 'customer';
  const devCodeParam = searchParams.get('devCode') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState(devCodeParam || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (devCodeParam) setCode(devCodeParam);
  }, [emailParam, devCodeParam]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!email.trim() || !code.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your email and the 6-digit verification code.' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        setStatusMessage({ type: 'success', text: 'Email verified successfully! Redirecting...' });
        setTimeout(() => {
          if (data.user.role === 'driver') {
            router.push('/driver/dashboard');
          } else if (data.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/account/dashboard');
          }
        }, 800);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Invalid verification code.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Connection failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setIsResending(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'A fresh verification code has been dispatched.' });
        setResendCooldown(60);
        if (data.devCode) setCode(data.devCode);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to resend code.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to resend code. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xl space-y-6">
        
        {/* Header Icon */}
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-100 text-black mx-auto rounded-2xl flex items-center justify-center shadow-inner mb-3">
            <Mail className="w-7 h-7 text-amber-700" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3 py-1 rounded">
            Security Check
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-2">
            Confirm Your Email
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            We sent a 6-digit confirmation code to{' '}
            <strong className="text-gray-800 font-semibold">{email || 'your email'}</strong>.
          </p>
        </div>

        {/* Development Helper Badge */}
        {devCodeParam && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
            <div>
              <span className="font-bold block">💡 Local Simulation Code:</span>
              <span className="font-mono text-sm tracking-widest font-black text-black">{devCodeParam}</span>
            </div>
            <button
              type="button"
              onClick={() => setCode(devCodeParam)}
              className="text-[11px] font-bold bg-ots-yellow text-black px-2.5 py-1 rounded-lg hover:bg-yellow-400"
            >
              Fill Code
            </button>
          </div>
        )}

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
              statusMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ots-yellow focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 582914"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[8px] font-mono font-bold text-xl px-3.5 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ots-yellow focus:border-ots-yellow"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-ots-yellow text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Verify & Activate Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend Action */}
        <div className="pt-2 text-center text-xs text-gray-500">
          <span>Didn't receive the code? </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="font-bold text-black underline hover:text-amber-600 disabled:opacity-40"
          >
            {isResending ? (
              'Sending...'
            ) : resendCooldown > 0 ? (
              `Resend code in ${resendCooldown}s`
            ) : (
              'Resend Code'
            )}
          </button>
        </div>

        <div className="text-center pt-2 border-t border-gray-100">
          <Link href="/account/login" className="text-xs text-gray-500 hover:text-black">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-ots-yellow" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
