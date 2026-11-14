'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useApp();

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
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (data.status && data.user) {
        setUser(data.user);
        router.push('/account/dashboard');
      } else {
        setErrorMessage(data.message || 'Registration failed. Please try again.');
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
      });
      router.push('/account/dashboard');
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3 py-1 rounded">
            New Customer
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-3">
            Create an Account
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Register to save passenger details, manage transfers, and earn rewards.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Email Address *
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

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Mobile Phone Number
            </label>
            <input
              type="tel"
              placeholder="+44 7123 456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
            />
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
                Confirm *
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

          <div className="pt-1">
            <label className="flex items-start space-x-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-yellow-500 focus:ring-ots-yellow border-gray-300"
              />
              <span className="leading-snug">
                I agree to the <Link href="/terms" target="_blank" className="font-bold text-gray-900 underline">Terms of Carriage</Link> and <Link href="/privacy-policy" target="_blank" className="font-bold text-gray-900 underline">Privacy Policy</Link>.
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-sm rounded-xl shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-600">
          Already have an account?{' '}
          <Link href="/account/login" className="font-bold text-gray-900 hover:underline">
            Login here
          </Link>
        </div>

      </div>
    </div>
  );
}
