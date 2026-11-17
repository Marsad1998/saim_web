'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Car, 
  User, 
  CreditCard, 
  Check, 
  Loader2, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import TransferSidebar from '@/components/booking/funnel/TransferSidebar';
import StepVehicles from '@/components/booking/funnel/StepVehicles';
import StepDetails from '@/components/booking/funnel/StepDetails';
import StepPayment from '@/components/booking/funnel/StepPayment';
import { StoredQuote } from '@/lib/quote-store';

export default function QuoteBookingPage() {
  const params = useParams();
  const router = useRouter();
  const quoteRef = params.quoteRef as string;

  const [quote, setQuote] = useState<StoredQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funnel Step
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Selections
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('saloon');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [passengerDetails, setPassengerDetails] = useState<any>(undefined);

  useEffect(() => {
    async function loadQuote() {
      try {
        setLoading(true);
        const res = await fetch(`/api/quotes/${quoteRef}`);
        const data = await res.json();

        if (data.status && data.quote) {
          setQuote(data.quote);
          if (data.quote.selectedVehicleId) {
            setSelectedVehicleId(data.quote.selectedVehicleId);
          }
          if (data.quote.selectedExtras) {
            setSelectedExtras(data.quote.selectedExtras);
          }
          if (data.quote.passenger) {
            setPassengerDetails(data.quote.passenger);
          }
        } else {
          setError('Could not find or retrieve this quotation. Please start a new quote.');
        }
      } catch (err: any) {
        console.error('Error fetching quote:', err);
        setError('Network error while loading your quotation.');
      } finally {
        setLoading(false);
      }
    }

    if (quoteRef) {
      loadQuote();
    }
  }, [quoteRef]);

  const handleToggleExtra = (extraId: string) => {
    setSelectedExtras((prev) => 
      prev.includes(extraId) ? prev.filter(x => x !== extraId) : [...prev, extraId]
    );
  };

  const handleDetailsSubmit = (details: any) => {
    setPassengerDetails(details);
    setActiveStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-12 h-12 text-ots-yellow animate-spin" />
        <h2 className="text-xl font-bold text-gray-800">Calculating Live Routes &amp; Fares...</h2>
        <p className="text-sm text-gray-500">Retrieving best available fixed rates for reference {quoteRef}</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h2>
        <p className="text-gray-600 text-sm max-w-md mb-6">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-ots-yellow hover:bg-yellow-400 text-black font-bold text-sm rounded-xl transition-colors"
        >
          Return to Booking Form
        </button>
      </div>
    );
  }

  const steps = [
    { num: 1, title: 'Choose Vehicle', icon: Car },
    { num: 2, title: 'Passenger Details', icon: User },
    { num: 3, title: 'Payment & Confirm', icon: CreditCard },
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Stepper Bar */}
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto">
            {steps.map((s) => {
              const Icon = s.icon;
              const isCompleted = activeStep > s.num;
              const isCurrent = activeStep === s.num;

              return (
                <div
                  key={s.num}
                  className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-white border-ots-yellow shadow-md ring-2 ring-ots-yellow/30'
                      : isCompleted
                      ? 'bg-amber-50/50 border-amber-200 text-gray-700'
                      : 'bg-white/60 border-gray-200 text-gray-400'
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isCurrent
                        ? 'bg-ots-yellow text-black'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider leading-tight">
                      Step 0{s.num}
                    </span>
                    <span className={`text-xs sm:text-sm font-bold truncate block ${
                      isCurrent ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      {s.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Funnel Content Layout: Form Left, Sidebar Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main step container */}
          <div className="lg:col-span-8">
            {activeStep === 1 && (
              <StepVehicles
                quote={quote}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={setSelectedVehicleId}
                selectedExtras={selectedExtras}
                onToggleExtra={handleToggleExtra}
                onNext={() => {
                  setActiveStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeStep === 2 && (
              <StepDetails
                quote={quote}
                initialData={passengerDetails || undefined}
                onBack={() => {
                  setActiveStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNext={handleDetailsSubmit}
              />
            )}

            {activeStep === 3 && (
              <StepPayment
                quote={quote}
                selectedVehicleId={selectedVehicleId}
                selectedExtras={selectedExtras}
                passengerDetails={passengerDetails}
                onBack={() => {
                  setActiveStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <TransferSidebar
              quote={quote}
              selectedVehicleId={selectedVehicleId}
              selectedExtras={selectedExtras}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
