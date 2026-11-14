import { calculateQuote, JourneyCalculationParams } from "./pricing-engine";

export interface StoredQuote {
  quoteRef: string;
  createdAt: string;
  fromLocation: string;
  toLocation: string;
  fromLocationType: number;
  toLocationType: number;
  fromCoords?: { lat: number; lng: number };
  toCoords?: { lat: number; lng: number };
  passengers: number;
  suitcases: number;
  pickUpDate: string;
  pickUpTime: string;
  bookReturn: boolean;
  returnDate?: string;
  returnTime?: string;
  waypoints: string[];
  distanceMiles: number;
  estimatedTimeMins: number;
  selectedVehicleId?: string;
  selectedExtras: string[];
  pricing: ReturnType<typeof calculateQuote>;
  
  // Passenger details (Step 2)
  passenger?: {
    fullName: string;
    email: string;
    phone: string;
    flightNumber?: string;
    terminal?: string;
    pickupBufferMinutes?: number;
    specialNotes?: string;
  };

  // Payment status (Step 3)
  paymentStatus: "unpaid" | "completed" | "cancelled";
  paidAmount?: number;
  currency: string;
  paymentMethod?: string;
}

// In-memory store (persists during server runtime; production can plug MySQL via Prisma)
const globalQuotes = globalThis as unknown as { __quotesMap?: Map<string, StoredQuote> };
if (!globalQuotes.__quotesMap) {
  globalQuotes.__quotesMap = new Map<string, StoredQuote>();
}

export const quoteStore = {
  create(params: {
    fromLocation: string;
    toLocation: string;
    fromLocationType?: number;
    toLocationType?: number;
    fromCoords?: { lat: number; lng: number };
    toCoords?: { lat: number; lng: number };
    passengers: number;
    suitcases?: number;
    pickUpDate: string;
    pickUpTime: string;
    bookReturn: boolean;
    returnDate?: string;
    returnTime?: string;
    waypoints?: string[];
  }): StoredQuote {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const quoteRef = `OTS-${randomSuffix}`;

    const pricing = calculateQuote({
      fromLocation: params.fromLocation,
      toLocation: params.toLocation,
      fromCoords: params.fromCoords,
      toCoords: params.toCoords,
      fromLocationType: params.fromLocationType || 1,
      toLocationType: params.toLocationType || 2,
      passengers: params.passengers || 1,
      waypoints: params.waypoints || [],
      bookReturn: params.bookReturn || false,
    });

    const quote: StoredQuote = {
      quoteRef,
      createdAt: new Date().toISOString(),
      fromLocation: params.fromLocation,
      toLocation: params.toLocation,
      fromLocationType: params.fromLocationType || 1,
      toLocationType: params.toLocationType || 2,
      fromCoords: params.fromCoords,
      toCoords: params.toCoords,
      passengers: params.passengers || 1,
      suitcases: params.suitcases || 1,
      pickUpDate: params.pickUpDate,
      pickUpTime: params.pickUpTime,
      bookReturn: params.bookReturn,
      returnDate: params.returnDate,
      returnTime: params.returnTime,
      waypoints: params.waypoints || [],
      distanceMiles: pricing.distanceMiles,
      estimatedTimeMins: pricing.estimatedTimeMins,
      selectedVehicleId: "saloon", // default selection
      selectedExtras: [],
      pricing,
      paymentStatus: "unpaid",
      currency: "GBP",
    };

    globalQuotes.__quotesMap.set(quoteRef, quote);
    return quote;
  },

  get(quoteRef: string): StoredQuote | undefined {
    return globalQuotes.__quotesMap.get(quoteRef);
  },

  update(quoteRef: string, updates: Partial<StoredQuote>): StoredQuote | undefined {
    const current = globalQuotes.__quotesMap.get(quoteRef);
    if (!current) return undefined;

    const updated = { ...current, ...updates };
    globalQuotes.__quotesMap.set(quoteRef, updated);
    return updated;
  },
};
