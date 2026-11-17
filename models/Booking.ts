import { dbQuery } from "@/lib/db";
import { calculateQuote } from "@/lib/pricing-engine";
import { VehicleModel } from "./Vehicle";

export interface IBooking {
  quote_ref: string;
  user_id?: string | null;
  from_location: string;
  to_location: string;
  from_location_type: number;
  to_location_type: number;
  from_lat?: number | null;
  from_lng?: number | null;
  to_lat?: number | null;
  to_lng?: number | null;
  pickup_date: string;
  pickup_time: string;
  book_return: boolean;
  return_date?: string | null;
  return_time?: string | null;
  passengers: number;
  suitcases: number;
  distance_miles: number;
  estimated_time_mins: number;
  waypoints: string[];
  selected_vehicle_id: string;
  selected_extras: string[];
  passenger_name?: string | null;
  passenger_email?: string | null;
  passenger_phone?: string | null;
  flight_number?: string | null;
  terminal?: string | null;
  pickup_buffer_mins?: number;
  special_notes?: string | null;
  pricing_details?: any;
  total_price: number;
  currency: string;
  payment_status: "unpaid" | "completed" | "cancelled" | "refunded";
  payment_method?: string | null;
  stripe_payment_id?: string | null;
  driver_id?: string | null;
  booking_status: "quoted" | "confirmed" | "assigned" | "in_progress" | "completed" | "cancelled";
  created_at?: string;
  updated_at?: string;
}

export interface CreateBookingInput {
  fromLocation: string;
  toLocation: string;
  fromLocationType?: number;
  toLocationType?: number;
  fromCoords?: { lat: number; lng: number };
  toCoords?: { lat: number; lng: number };
  pickupDate?: string;
  pickUpDate?: string;
  pickupTime?: string;
  pickUpTime?: string;
  passengers: number;
  suitcases?: number;
  bookReturn?: boolean;
  returnDate?: string;
  returnTime?: string;
  waypoints?: string[];
  userId?: string;
  distanceMiles?: number;
  estimatedTimeMins?: number;
}

export interface UpdateBookingInput {
  selectedVehicleId?: string;
  selectedExtras?: string[];
  passengerName?: string;
  passengerEmail?: string;
  passengerPhone?: string;
  flightNumber?: string;
  terminal?: string;
  pickupBufferMinutes?: number;
  specialNotes?: string;
  currency?: string;
  totalPrice?: number;
}

export class BookingModel {
  /**
   * Helper to format a database row to IBooking object
   */
  private static formatRow(row: any): IBooking {
    let waypoints: string[] = [];
    let selectedExtras: string[] = [];
    let pricingDetails: any = null;

    try { waypoints = JSON.parse(row.waypoints || "[]"); } catch {}
    try { selectedExtras = JSON.parse(row.selected_extras || "[]"); } catch {}
    try { pricingDetails = JSON.parse(row.pricing_details || "{}"); } catch {}

    return {
      quote_ref: row.quote_ref,
      user_id: row.user_id || null,
      from_location: row.from_location,
      to_location: row.to_location,
      from_location_type: row.from_location_type,
      to_location_type: row.to_location_type,
      from_lat: row.from_lat ? Number(row.from_lat) : null,
      from_lng: row.from_lng ? Number(row.from_lng) : null,
      to_lat: row.to_lat ? Number(row.to_lat) : null,
      to_lng: row.to_lng ? Number(row.to_lng) : null,
      pickup_date: row.pickup_date,
      pickup_time: row.pickup_time,
      book_return: Boolean(row.book_return),
      return_date: row.return_date || null,
      return_time: row.return_time || null,
      passengers: row.passengers,
      suitcases: row.suitcases,
      distance_miles: Number(row.distance_miles),
      estimated_time_mins: row.estimated_time_mins,
      waypoints,
      selected_vehicle_id: row.selected_vehicle_id || "saloon",
      selected_extras: selectedExtras,
      passenger_name: row.passenger_name || null,
      passenger_email: row.passenger_email || null,
      passenger_phone: row.passenger_phone || null,
      flight_number: row.flight_number || null,
      terminal: row.terminal || null,
      pickup_buffer_mins: row.pickup_buffer_mins || 45,
      special_notes: row.special_notes || null,
      pricing_details: pricingDetails,
      total_price: Number(row.total_price),
      currency: row.currency || "GBP",
      payment_status: row.payment_status || "unpaid",
      payment_method: row.payment_method || null,
      stripe_payment_id: row.stripe_payment_id || null,
      driver_id: row.driver_id || null,
      booking_status: row.booking_status || "quoted",
      created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    };
  }

  /**
   * Create a new quote / booking in MySQL
   */
  static async create(input: CreateBookingInput): Promise<IBooking> {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const quoteRef = `OTS-${randomSuffix}`;

    const fleet = await VehicleModel.getAll();

    const pricing = calculateQuote({
      fromLocation: input.fromLocation,
      toLocation: input.toLocation,
      fromCoords: input.fromCoords,
      toCoords: input.toCoords,
      fromLocationType: input.fromLocationType || 1,
      toLocationType: input.toLocationType || 2,
      passengers: input.passengers || 1,
      waypoints: input.waypoints || [],
      bookReturn: input.bookReturn || false,
      distanceMiles: input.distanceMiles,
      estimatedTimeMins: input.estimatedTimeMins,
    }, fleet);

    const selectedVeh = pricing.vehicles.find((v) => v.id === "saloon") || pricing.vehicles[0];
    const initialPrice = selectedVeh ? selectedVeh.totalPrice : 45.0;

    const waypoints = input.waypoints || [];
    const selectedExtras: string[] = [];

    const pickupDate = input.pickupDate || input.pickUpDate || new Date().toISOString().split("T")[0];
    const pickupTime = input.pickupTime || input.pickUpTime || "12:00";
    const bookReturn = Boolean(input.bookReturn);

    try {
      await dbQuery(
        `INSERT INTO bookings (
          quote_ref, user_id, from_location, to_location, from_location_type, to_location_type,
          from_lat, from_lng, to_lat, to_lng, pickup_date, pickup_time,
          book_return, return_date, return_time, passengers, suitcases,
          distance_miles, estimated_time_mins, waypoints, selected_vehicle_id,
          selected_extras, pricing_details, total_price, currency, payment_status, booking_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quoteRef,
          input.userId || null,
          input.fromLocation,
          input.toLocation,
          input.fromLocationType || 1,
          input.toLocationType || 2,
          input.fromCoords?.lat || null,
          input.fromCoords?.lng || null,
          input.toCoords?.lat || null,
          input.toCoords?.lng || null,
          pickupDate,
          pickupTime,
          bookReturn ? 1 : 0,
          input.returnDate || null,
          input.returnTime || null,
          input.passengers || 1,
          input.suitcases || 1,
          pricing.distanceMiles,
          pricing.estimatedTimeMins,
          JSON.stringify(waypoints),
          "saloon",
          JSON.stringify(selectedExtras),
          JSON.stringify(pricing),
          initialPrice,
          "GBP",
          "unpaid",
          "quoted",
        ]
      );
    } catch (error: any) {
      console.error("BookingModel.create MySQL notice:", error.message);
    }

    return {
      quote_ref: quoteRef,
      user_id: input.userId || null,
      from_location: input.fromLocation,
      to_location: input.toLocation,
      from_location_type: input.fromLocationType || 1,
      to_location_type: input.toLocationType || 2,
      from_lat: input.fromCoords?.lat || null,
      from_lng: input.fromCoords?.lng || null,
      to_lat: input.toCoords?.lat || null,
      to_lng: input.toCoords?.lng || null,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      book_return: bookReturn,
      return_date: input.returnDate || null,
      return_time: input.returnTime || null,
      passengers: input.passengers || 1,
      suitcases: input.suitcases || 1,
      distance_miles: pricing.distanceMiles,
      estimated_time_mins: pricing.estimatedTimeMins,
      waypoints,
      selected_vehicle_id: "saloon",
      selected_extras: selectedExtras,
      pricing_details: pricing,
      total_price: initialPrice,
      currency: "GBP",
      payment_status: "unpaid",
      booking_status: "quoted",
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Find booking by its unique Quote Reference (e.g. OTS-123456)
   */
  static async getByRef(quoteRef: string): Promise<IBooking | null> {
    try {
      const rows = await dbQuery<any[]>(
        "SELECT * FROM bookings WHERE quote_ref = ? LIMIT 1",
        [quoteRef]
      );
      if (rows && rows.length > 0) {
        return this.formatRow(rows[0]);
      }
      return null;
    } catch (error: any) {
      console.error("BookingModel.getByRef error:", error.message);
      return null;
    }
  }

  /**
   * Find all bookings associated with a user ID (for customer dashboard)
   */
  static async getByUserId(userId: string): Promise<IBooking[]> {
    try {
      const rows = await dbQuery<any[]>(
        "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
      );
      return rows.map((r) => this.formatRow(r));
    } catch (error: any) {
      console.error("BookingModel.getByUserId error:", error.message);
      return [];
    }
  }

  /**
   * Update booking vehicle, extras, or passenger info
   */
  static async updateDetails(quoteRef: string, updates: UpdateBookingInput): Promise<IBooking | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.selectedVehicleId) {
        fields.push("selected_vehicle_id = ?");
        values.push(updates.selectedVehicleId);
      }
      if (updates.selectedExtras) {
        fields.push("selected_extras = ?");
        values.push(JSON.stringify(updates.selectedExtras));
      }
      if (updates.passengerName) {
        fields.push("passenger_name = ?");
        values.push(updates.passengerName.trim());
      }
      if (updates.passengerEmail) {
        fields.push("passenger_email = ?");
        values.push(updates.passengerEmail.trim().toLowerCase());
      }
      if (updates.passengerPhone) {
        fields.push("passenger_phone = ?");
        values.push(updates.passengerPhone.trim());
      }
      if (updates.flightNumber !== undefined) {
        fields.push("flight_number = ?");
        values.push(updates.flightNumber ? updates.flightNumber.trim() : null);
      }
      if (updates.terminal !== undefined) {
        fields.push("terminal = ?");
        values.push(updates.terminal ? updates.terminal.trim() : null);
      }
      if (updates.pickupBufferMinutes !== undefined) {
        fields.push("pickup_buffer_mins = ?");
        values.push(updates.pickupBufferMinutes);
      }
      if (updates.specialNotes !== undefined) {
        fields.push("special_notes = ?");
        values.push(updates.specialNotes ? updates.specialNotes.trim() : null);
      }
      if (updates.totalPrice !== undefined) {
        fields.push("total_price = ?");
        values.push(updates.totalPrice);
      }
      if (updates.currency) {
        fields.push("currency = ?");
        values.push(updates.currency);
      }

      if (fields.length > 0) {
        values.push(quoteRef);
        await dbQuery(`UPDATE bookings SET ${fields.join(", ")} WHERE quote_ref = ?`, values);
      }

      return await this.getByRef(quoteRef);
    } catch (error: any) {
      console.error("BookingModel.updateDetails error:", error.message);
      return null;
    }
  }

  /**
   * Mark payment as completed and confirm the booking
   */
  static async markPaymentCompleted(
    quoteRef: string,
    details: { paidAmount: number; paymentMethod: string; stripePaymentId?: string }
  ): Promise<boolean> {
    try {
      await dbQuery(
        `UPDATE bookings 
         SET payment_status = 'completed', 
             booking_status = 'confirmed',
             total_price = ?,
             payment_method = ?,
             stripe_payment_id = ?
         WHERE quote_ref = ?`,
        [details.paidAmount, details.paymentMethod, details.stripePaymentId || null, quoteRef]
      );
      return true;
    } catch (error: any) {
      console.error("BookingModel.markPaymentCompleted error:", error.message);
      return false;
    }
  }

  /**
   * Update booking status (e.g. assigned to driver, in_progress, completed, cancelled)
   */
  static async updateStatus(
    quoteRef: string,
    status: IBooking["booking_status"],
    driverId?: string
  ): Promise<boolean> {
    try {
      if (driverId) {
        await dbQuery(
          "UPDATE bookings SET booking_status = ?, driver_id = ? WHERE quote_ref = ?",
          [status, driverId, quoteRef]
        );
      } else {
        await dbQuery(
          "UPDATE bookings SET booking_status = ? WHERE quote_ref = ?",
          [status, quoteRef]
        );
      }
      return true;
    } catch (error: any) {
      console.error("BookingModel.updateStatus error:", error.message);
      return false;
    }
  }

  /**
   * Get all bookings (with optional status filters for Admin)
   */
  static async getAll(filter?: { status?: string; paymentStatus?: string; limit?: number }): Promise<IBooking[]> {
    try {
      const conditions: string[] = [];
      const values: any[] = [];

      if (filter?.status) {
        conditions.push("booking_status = ?");
        values.push(filter.status);
      }
      if (filter?.paymentStatus) {
        conditions.push("payment_status = ?");
        values.push(filter.paymentStatus);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const limit = filter?.limit || 50;

      const rows = await dbQuery<any[]>(
        `SELECT * FROM bookings ${whereClause} ORDER BY created_at DESC LIMIT ${limit}`,
        values
      );

      return rows.map((r) => this.formatRow(r));
    } catch (error: any) {
      console.error("BookingModel.getAll error:", error.message);
      return [];
    }
  }

  /**
   * Get all bookings assigned to a specific driver
   */
  static async getByDriverId(driverId: string): Promise<IBooking[]> {
    try {
      const rows = await dbQuery<any[]>(
        "SELECT * FROM bookings WHERE driver_id = ? ORDER BY pickup_date ASC, pickup_time ASC",
        [driverId]
      );
      return (rows || []).map((r) => this.formatRow(r));
    } catch (error: any) {
      console.error("BookingModel.getByDriverId error:", error.message);
      return [];
    }
  }
}
