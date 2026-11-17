'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, Loader2, AlertCircle, Car, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useApp();

  const [role, setRole] = useState<'customer' | 'driver'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreed) {
      setErrorMessage('Please accept the Terms of Carriage and Privacy Policy');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requiresVerification) {
          // Redirect to 6-digit confirmation code page
          const devParam = data.devCode ? `&devCode=${encodeURIComponent(data.devCode)}` : '';
          router.push(`/account/verify-email?email=${encodeURIComponent(email)}&role=${role}${devParam}`);
          return;
        }

        if (data.user) {
          setUser(data.user);
          if (role === 'driver') {
            router.push('/driver/dashboard');
          } else {
            router.push('/account/dashboard');
          }
        }
      } else {
        setErrorMessage(data.message || data.errorMessage || 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      // Fallback local registration
      setUser({
        id: 'usr_' + Date.now(),
        name,
        email,
        phone,
        role,
      });
      if (role === 'driver') {
        router.push('/driver/dashboard');
      } else {
        router.push('/account/dashboard');
      }
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xl space-y-6">
        
        {/* Role Selector Tabs */}
        <div className="bg-gray-100 p-1.5 rounded-xl grid grid-cols-2 gap-1.5 border border-gray-200">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              role === 'customer'
                ? 'bg-white text-gray-950 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-black" />
            <span>Passenger Account</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              role === 'driver'
                ? 'bg-ots-yellow text-black shadow-sm font-extrabold ring-1 ring-yellow-400'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Driver / Partner</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ots-yellow bg-black px-3 py-1 rounded inline-block">
            {role === 'driver' ? 'Chauffeur Fleet Partner' : 'Passenger Registration'}
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-2.5">
            {role === 'driver' ? 'Register as Chauffeur' : 'Create an Account'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {role === 'driver'
              ? 'Join our airport transfer chauffeur network. Submit basic details now, complete your vehicle profile in the dashboard.'
              : 'Save passenger details, track transfers, and download VAT receipts.'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Continue with Google (Passenger Account) */}
        {role === 'customer' && (
          <div>
            <a
              href="/api/auth/google"
              className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-xl border border-gray-300 shadow-sm transition flex items-center justify-center space-x-3 cursor-pointer group hover:border-gray-400"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="group-hover:text-black">Continue with Google</span>
            </a>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-semibold">Or register with email</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Full Legal Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={role === 'driver' ? 'e.g. David Miller (As on PCO License)' : 'e.g. John Smith'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Mobile Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="+44 7123 456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              />
            </div>
          </div>

          {role === 'driver' && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold block">Chauffeur Next Step:</span>
                After registering, log in to your dashboard to enter your PCO license and vehicle plate before accepting bookings.
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 text-ots-yellow rounded border-gray-300 focus:ring-ots-yellow"
            />
            <label htmlFor="terms" className="text-xs text-gray-600">
              I accept the{' '}
              <Link href="/terms" className="text-black font-semibold underline">
                Terms of Carriage
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-black font-semibold underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-ots-yellow text-black font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{role === 'driver' ? 'Register as Chauffeur Partner' : 'Create Customer Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link href="/account/login" className="text-black font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
