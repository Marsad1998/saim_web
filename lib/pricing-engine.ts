export interface VehicleFleetOption {
  id: string;
  name: string;
  categoryName: string;
  image: string;
  passengers: number;
  suitcases: number;
  handLuggage: number;
  description: string;
  features: string[];
  multiplier: number;
  sampleVehicles: string;
}

export const VEHICLE_FLEET: VehicleFleetOption[] = [
  {
    id: "saloon",
    name: "Standard Saloon",
    categoryName: "Saloon Car",
    image: "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
    passengers: 4,
    suitcases: 2,
    handLuggage: 2,
    description: "Ideal for everyday airport transfers, solo travelers, and couples.",
    features: ["Air Conditioning", "Flight Tracking", "45 Mins Free Waiting", "Fixed Price"],
    multiplier: 1.0,
    sampleVehicles: "VW Passat, Ford Mondeo, Skoda Octavia"
  },
  {
    id: "estate",
    name: "Estate Car",
    categoryName: "Estate Vehicle",
    image: "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
    passengers: 4,
    suitcases: 4,
    handLuggage: 3,
    description: "Extended boot capacity for travelers with bulky luggage, skis or strollers.",
    features: ["Extra Luggage Capacity", "Air Conditioning", "Flight Tracking", "Fixed Price"],
    multiplier: 1.15,
    sampleVehicles: "Skoda Superb Estate, VW Passat Estate"
  },
  {
    id: "executive-saloon",
    name: "Executive Saloon",
    categoryName: "Executive Chauffeur",
    image: "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
    passengers: 3,
    suitcases: 2,
    handLuggage: 2,
    description: "Premium luxury comfort for corporate executives and discerning travelers.",
    features: ["Luxury Leather Interior", "Bottled Water & Wi-Fi", "Meet & Greet Included", "Professional Chauffeur"],
    multiplier: 1.45,
    sampleVehicles: "Mercedes-Benz E-Class, BMW 5 Series, Audi A6"
  },
  {
    id: "mpv",
    name: "People Carrier / MPV",
    categoryName: "People Carrier (MPV-5/6)",
    image: "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
    passengers: 5,
    suitcases: 4,
    handLuggage: 4,
    description: "Designed for small groups and families requiring extra seating room.",
    features: ["Spacious Seating", "Air Conditioning", "Child Seats Available", "Fixed Price"],
    multiplier: 1.40,
    sampleVehicles: "VW Touran, Ford Galaxy, Citroen Spacetourer"
  },
  {
    id: "minibus-8",
    name: "8-Seater Minibus",
    categoryName: "Minibus (8 Seater)",
    image: "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
    passengers: 8,
    suitcases: 8,
    handLuggage: 8,
    description: "Large capacity transport for larger families, corporate groups, and sports tours.",
    features: ["Up to 8 Passengers", "Massive Cargo Space", "Dual Air Conditioning", "Fixed Price"],
    multiplier: 1.85,
    sampleVehicles: "Mercedes Vito Tourer, Ford Tourneo Custom"
  },
  {
    id: "executive-mpv",
    name: "Executive MPV",
    categoryName: "Luxury Chauffeur MPV",
    image: "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
    passengers: 7,
    suitcases: 7,
    handLuggage: 7,
    description: "The pinnacle of VIP group travel with first-class conference seating.",
    features: ["VIP Leather Seating", "Privacy Glass", "Meet & Greet Included", "Complimentary Refreshments"],
    multiplier: 2.20,
    sampleVehicles: "Mercedes-Benz V-Class"
  }
];

export interface AdditionalOption {
  id: string;
  name: string;
  price: number; // in GBP
  description: string;
}

export const EXTRA_OPTIONS: AdditionalOption[] = [
  { id: "child_seat", name: "Child Safety Seat (0-4 yrs)", price: 10.0, description: "Approved rear/forward facing safety seat" },
  { id: "booster_seat", name: "Child Booster Seat (4-12 yrs)", price: 5.0, description: "Group 2/3 booster cushion" },
  { id: "meet_greet", name: "Meet & Greet in Arrivals Hall", price: 10.0, description: "Driver waiting inside with personalized name board" },
  { id: "extra_waiting", name: "Additional 30 mins Waiting Time", price: 15.0, description: "Extra buffer for passport control delays" }
];

export interface JourneyCalculationParams {
  fromLocation: string;
  toLocation: string;
  fromCoords?: { lat: number; lng: number };
  toCoords?: { lat: number; lng: number };
  fromLocationType?: number; // 1 = Airport, 2 = Address
  toLocationType?: number;
  passengers: number;
  waypoints?: string[];
  bookReturn: boolean;
  selectedVehicleId?: string;
  selectedExtras?: string[];
}

function calculateDistanceMiles(
  c1?: { lat: number; lng: number },
  c2?: { lat: number; lng: number }
): number {
  if (!c1 || !c2 || !c1.lat || !c2.lat) {
    return 24.5; // realistic average London airport transfer distance fallback
  }

  const R = 3958.8; // Earth radius in miles
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const crowMiles = R * c;

  // Real road routing typically 1.25x - 1.30x crow-flight in UK
  return Math.max(5.0, Math.round(crowMiles * 1.28 * 10) / 10);
}

export function calculateQuote(params: JourneyCalculationParams) {
  const distanceMiles = calculateDistanceMiles(params.fromCoords, params.toCoords);
  const estimatedTimeMins = Math.round(distanceMiles * 1.8 + 15); // average UK highway + city drive time

  // Base mileage rate curve
  let mileageCost = 0;
  if (distanceMiles <= 15) {
    mileageCost = distanceMiles * 2.50;
  } else if (distanceMiles <= 50) {
    mileageCost = 15 * 2.50 + (distanceMiles - 15) * 2.10;
  } else {
    mileageCost = 15 * 2.50 + 35 * 2.10 + (distanceMiles - 50) * 1.85;
  }

  const basePickupFee = 28.0;
  const airportBarrierFee = (params.fromLocationType === 1 || params.toLocationType === 1) ? 6.0 : 0.0;
  const waypointCost = (params.waypoints?.length || 0) * 10.0;

  const baseOneWayStandard = Math.round((basePickupFee + mileageCost + airportBarrierFee + waypointCost) * 100) / 100;

  // Calculate pricing for all vehicles
  const vehiclesWithPricing = VEHICLE_FLEET.map((vehicle) => {
    let oneWayPrice = Math.round(baseOneWayStandard * vehicle.multiplier * 100) / 100;
    
    // If Return Trip booked: 2x journey minus 5% discount
    let returnTripDiscount = 0;
    let totalPrice = oneWayPrice;
    
    if (params.bookReturn) {
      const fullRoundTrip = oneWayPrice * 2;
      returnTripDiscount = Math.round(fullRoundTrip * 0.05 * 100) / 100; // 5% OFF
      totalPrice = Math.round((fullRoundTrip - returnTripDiscount) * 100) / 100;
    }

    return {
      ...vehicle,
      oneWayPrice,
      returnTripDiscount,
      totalPrice,
      isAvailable: params.passengers <= vehicle.passengers
    };
  });

  return {
    distanceMiles,
    estimatedTimeMins,
    baseOneWayStandard,
    vehicles: vehiclesWithPricing
  };
}
