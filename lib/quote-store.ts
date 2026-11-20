import { BookingModel, IBooking } from "@/models/Booking";

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
  pricing: any;
  passenger?: {
    fullName: string;
    email: string;
    phone: string;
    flightNumber?: string;
    terminal?: string;
    pickupBufferMinutes?: number;
    specialNotes?: string;
  };
  paymentStatus: "unpaid" | "completed" | "cancelled" | "refunded";
  paidAmount?: number;
  currency: string;
  paymentMethod?: string;
  driver_id?: string;
  assignedDriver?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    licenseNumber?: string;
    vehicleModel?: string;
    vehiclePlate?: string;
    vehicleYear?: string;
    vehicleCategory?: string;
  };
}

function mapBookingToStoredQuote(b: IBooking): StoredQuote {
  return {
    quoteRef: b.quote_ref,
    createdAt: b.created_at || new Date().toISOString(),
    fromLocation: b.from_location,
    toLocation: b.to_location,
    fromLocationType: b.from_location_type,
    toLocationType: b.to_location_type,
    fromCoords: b.from_lat && b.from_lng ? { lat: b.from_lat, lng: b.from_lng } : undefined,
    toCoords: b.to_lat && b.to_lng ? { lat: b.to_lat, lng: b.to_lng } : undefined,
    passengers: b.passengers,
    suitcases: b.suitcases,
    pickUpDate: b.pickup_date,
    pickUpTime: b.pickup_time,
    bookReturn: b.book_return,
    returnDate: b.return_date || undefined,
    returnTime: b.return_time || undefined,
    waypoints: b.waypoints || [],
    distanceMiles: b.distance_miles,
    estimatedTimeMins: b.estimated_time_mins,
    selectedVehicleId: b.selected_vehicle_id,
    selectedExtras: b.selected_extras || [],
    pricing: b.pricing_details,
    passenger: b.passenger_name
      ? {
          fullName: b.passenger_name,
          email: b.passenger_email || "",
          phone: b.passenger_phone || "",
          flightNumber: b.flight_number || undefined,
          terminal: b.terminal || undefined,
          pickupBufferMinutes: b.pickup_buffer_mins,
          specialNotes: b.special_notes || undefined,
        }
      : undefined,
    paymentStatus: b.payment_status,
    paidAmount: b.total_price,
    currency: b.currency,
    paymentMethod: b.payment_method || undefined,
    driver_id: b.driver_id || undefined,
    assignedDriver: (b as any).assignedDriver,
  };
}

// In-memory fallback cache
const globalQuotes = globalThis as unknown as { __quotesMap?: Map<string, StoredQuote> };
if (!globalQuotes.__quotesMap) {
  globalQuotes.__quotesMap = new Map<string, StoredQuote>();
}

export const quoteStore = {
  async create(params: {
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
    distanceMiles?: number;
    estimatedTimeMins?: number;
    currency?: string;
  }): Promise<StoredQuote> {
    const booking = await BookingModel.create(params);
    const quote = mapBookingToStoredQuote(booking);
    globalQuotes.__quotesMap.set(quote.quoteRef, quote);
    return quote;
  },

  async get(quoteRef: string): Promise<StoredQuote | undefined> {
    const cached = globalQuotes.__quotesMap.get(quoteRef);
    if (cached) return cached;

    const booking = await BookingModel.getByRef(quoteRef);
    if (booking) {
      const quote = mapBookingToStoredQuote(booking);
      globalQuotes.__quotesMap.set(quoteRef, quote);
      return quote;
    }

    return undefined;
  },

  async listByUserOrEmail(userId?: string, email?: string): Promise<StoredQuote[]> {
    const list: StoredQuote[] = [];
    if (!globalQuotes.__quotesMap) return list;
    const cleanEmail = email?.toLowerCase();
    const quotes = Array.from(globalQuotes.__quotesMap.values());
    for (const quote of quotes) {
      if (cleanEmail && quote.passenger?.email?.toLowerCase() === cleanEmail) {
        list.push(quote);
      }
    }
    return list;
  },

  async listAll(): Promise<StoredQuote[]> {
    if (!globalQuotes.__quotesMap) return [];
    return Array.from(globalQuotes.__quotesMap.values());
  },

  async update(quoteRef: string, updates: Partial<StoredQuote>): Promise<StoredQuote | undefined> {
    const current = await this.get(quoteRef);
    if (!current) return undefined;

    // Delegate updates to BookingModel
    if (updates.paymentStatus === "completed" && updates.paidAmount) {
      await BookingModel.markPaymentCompleted(quoteRef, {
        paidAmount: updates.paidAmount,
        paymentMethod: updates.paymentMethod || "stripe",
        currency: updates.currency,
      });
    }

    await BookingModel.updateDetails(quoteRef, {
      selectedVehicleId: updates.selectedVehicleId,
      selectedExtras: updates.selectedExtras,
      passengerName: updates.passenger?.fullName,
      passengerEmail: updates.passenger?.email,
      passengerPhone: updates.passenger?.phone,
      flightNumber: updates.passenger?.flightNumber,
      terminal: updates.passenger?.terminal,
      pickupBufferMinutes: updates.passenger?.pickupBufferMinutes,
      specialNotes: updates.passenger?.specialNotes,
      currency: updates.currency,
      totalPrice: updates.paidAmount,
    });

    const updated = { ...current, ...updates };
    globalQuotes.__quotesMap.set(quoteRef, updated);
    return updated;
  },
};
