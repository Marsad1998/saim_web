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
  ratePerMile: number;
  minimumFare: number;
  sampleVehicles: string;
}

/**
 * Quick Car Midlands Ltd - Official 2026 Vehicle Fleet & Mileage Rates
 */
export const VEHICLE_FLEET: VehicleFleetOption[] = [
  {
    id: "saloon",
    name: "Standard Saloon",
    categoryName: "Saloon Car",
    image: "/images/vehicles/standard-saloon.png",
    passengers: 4,
    suitcases: 2,
    handLuggage: 2,
    ratePerMile: 1.50,
    minimumFare: 38.00,
    multiplier: 1.00,
    description: "Ideal for everyday airport transfers, solo travelers, and couples.",
    features: ["Air Conditioning", "Flight Tracking", "45 Mins Free Waiting", "Fixed Price Guarantee"],
    sampleVehicles: "VW Passat, Skoda Octavia, Ford Mondeo",
  },
  {
    id: "estate",
    name: "Estate Car",
    categoryName: "Estate Vehicle",
    image: "/images/vehicles/standard-saloon.png",
    passengers: 4,
    suitcases: 4,
    handLuggage: 3,
    ratePerMile: 1.70,
    minimumFare: 42.00,
    multiplier: 1.13,
    description: "Extended boot capacity for travelers with bulky luggage, skis or strollers.",
    features: ["Extra Luggage Capacity", "Air Conditioning", "Flight Tracking", "Fixed Price Guarantee"],
    sampleVehicles: "Skoda Superb Estate, VW Passat Estate",
  },
  {
    id: "executive-saloon",
    name: "Executive Saloon",
    categoryName: "Executive Chauffeur",
    image: "/images/vehicles/standard-saloon.png",
    passengers: 3,
    suitcases: 2,
    handLuggage: 2,
    ratePerMile: 1.90,
    minimumFare: 48.00,
    multiplier: 1.27,
    description: "Premium luxury comfort for corporate executives and discerning travelers.",
    features: ["Luxury Leather Interior", "Bottled Water & Wi-Fi", "Meet & Greet Included", "Professional Chauffeur"],
    sampleVehicles: "Mercedes-Benz E-Class, BMW 5 Series, Audi A6",
  },
  {
    id: "mpv",
    name: "MPV (5–6 Seater)",
    categoryName: "People Carrier (MPV-5/6)",
    image: "/images/vehicles/standard-saloon.png",
    passengers: 6,
    suitcases: 4,
    handLuggage: 4,
    ratePerMile: 2.05,
    minimumFare: 52.00,
    multiplier: 1.37,
    description: "Designed for small groups and families requiring extra seating room.",
    features: ["Spacious 5-6 Seater", "Air Conditioning", "Child Seats Available", "Fixed Price Guarantee"],
    sampleVehicles: "VW Sharan, Ford Galaxy, Citroen Spacetourer",
  },
  {
    id: "minibus-8",
    name: "Minibus (8–9 Seater)",
    categoryName: "Minibus (8–9 Seater)",
    image: "/images/vehicles/standard-saloon.png",
    passengers: 8,
    suitcases: 8,
    handLuggage: 8,
    ratePerMile: 2.55,
    minimumFare: 65.00,
    multiplier: 1.70,
    description: "Large capacity transport for larger families, corporate groups, and sports tours.",
    features: ["Up to 8-9 Passengers", "Massive Cargo Space", "Dual Climate Control", "Fixed Price Guarantee"],
    sampleVehicles: "Mercedes Vito Tourer, Ford Tourneo Custom, VW Caravelle",
  },
];

/**
 * Official Fixed Airport Transfer Prices From Birmingham (2026 Rate Card)
 */
export interface BirminghamAirportFixedRate {
  airportCode: string;
  airportName: string;
  approxMiles: number;
  prices: Record<string, number>;
}

export const BIRMINGHAM_AIRPORT_FIXED_RATES: Record<string, BirminghamAirportFixedRate> = {
  BHX: {
    airportCode: "BHX",
    airportName: "Birmingham Airport (BHX)",
    approxMiles: 12,
    prices: {
      saloon: 38,
      estate: 42,
      "executive-saloon": 48,
      mpv: 52,
      "minibus-8": 65,
    },
  },
  EMA: {
    airportCode: "EMA",
    airportName: "East Midlands Airport (EMA)",
    approxMiles: 37,
    prices: {
      saloon: 86,
      estate: 96,
      "executive-saloon": 108,
      mpv: 108,
      "minibus-8": 133,
    },
  },
  MAN: {
    airportCode: "MAN",
    airportName: "Manchester Airport (MAN)",
    approxMiles: 91,
    prices: {
      saloon: 148,
      estate: 166,
      "executive-saloon": 186,
      mpv: 186,
      "minibus-8": 229,
    },
  },
  LTN: {
    airportCode: "LTN",
    airportName: "London Luton Airport (LTN)",
    approxMiles: 82,
    prices: {
      saloon: 153,
      estate: 171,
      "executive-saloon": 193,
      mpv: 193,
      "minibus-8": 237,
    },
  },
  LPL: {
    airportCode: "LPL",
    airportName: "Liverpool John Lennon Airport (LPL)",
    approxMiles: 103,
    prices: {
      saloon: 168,
      estate: 188,
      "executive-saloon": 212,
      mpv: 212,
      "minibus-8": 260,
    },
  },
  LHR: {
    airportCode: "LHR",
    airportName: "London Heathrow Airport (LHR)",
    approxMiles: 104,
    prices: {
      saloon: 174,
      estate: 195,
      "executive-saloon": 219,
      mpv: 219,
      "minibus-8": 270,
    },
  },
  BRS: {
    airportCode: "BRS",
    airportName: "Bristol Airport (BRS)",
    approxMiles: 105,
    prices: {
      saloon: 175,
      estate: 196,
      "executive-saloon": 220,
      mpv: 220,
      "minibus-8": 271,
    },
  },
  STN: {
    airportCode: "STN",
    airportName: "London Stansted Airport (STN)",
    approxMiles: 117,
    prices: {
      saloon: 188,
      estate: 211,
      "executive-saloon": 237,
      mpv: 237,
      "minibus-8": 291,
    },
  },
  CWL: {
    airportCode: "CWL",
    airportName: "Cardiff Airport (CWL)",
    approxMiles: 127,
    prices: {
      saloon: 201,
      estate: 225,
      "executive-saloon": 253,
      mpv: 253,
      "minibus-8": 312,
    },
  },
  LBA: {
    airportCode: "LBA",
    airportName: "Leeds Bradford Airport (LBA)",
    approxMiles: 124,
    prices: {
      saloon: 210,
      estate: 235,
      "executive-saloon": 265,
      mpv: 265,
      "minibus-8": 326,
    },
  },
  LGW: {
    airportCode: "LGW",
    airportName: "London Gatwick Airport (LGW)",
    approxMiles: 141,
    prices: {
      saloon: 219,
      estate: 245,
      "executive-saloon": 276,
      mpv: 276,
      "minibus-8": 339,
    },
  },
  NCL: {
    airportCode: "NCL",
    airportName: "Newcastle Airport (NCL)",
    approxMiles: 210,
    prices: {
      saloon: 314,
      estate: 352,
      "executive-saloon": 396,
      mpv: 396,
      "minibus-8": 487,
    },
  },
};

/**
 * Check if a location text or coordinate belongs to the Birmingham area
 */
export function isBirminghamLocation(locName?: string, coords?: { lat: number; lng: number }): boolean {
  if (!locName) return false;
  const clean = locName.toLowerCase();
  if (
    clean.includes("birmingham") ||
    clean.includes("solihull") ||
    clean.includes("sutton coldfield") ||
    clean.includes("west midlands") ||
    clean.includes("edgbaston") ||
    clean.includes("digbeth") ||
    clean.includes("selly oak") ||
    clean.includes("harborne") ||
    clean.includes("aston") ||
    clean.includes("erdington")
  ) {
    return true;
  }
  // Check Birmingham postal codes B1-B98
  if (/\bB\d{1,2}\s*\d?[A-Z]{2}\b/i.test(locName) || /\bB\d{1,2}\b/i.test(locName)) {
    return true;
  }
  // Check coordinate proximity to Birmingham center (lat: 52.4862, lng: -1.8904)
  if (coords && coords.lat && coords.lng) {
    const d = calculateDistanceMiles(coords, { lat: 52.4862, lng: -1.8904 });
    if (d <= 20) return true;
  }
  return false;
}

/**
 * Match an airport code against our fixed rate table
 */
export function matchAirportFixedRoute(locName?: string): string | null {
  if (!locName) return null;
  const clean = locName.toLowerCase();
  if (clean.includes("bhx") || clean.includes("birmingham airport") || clean.includes("birmingham international")) return "BHX";
  if (clean.includes("ema") || clean.includes("east midlands")) return "EMA";
  if (clean.includes("man") || clean.includes("manchester airport")) return "MAN";
  if (clean.includes("ltn") || clean.includes("luton")) return "LTN";
  if (clean.includes("lpl") || clean.includes("liverpool")) return "LPL";
  if (clean.includes("lhr") || clean.includes("heathrow")) return "LHR";
  if (clean.includes("brs") || clean.includes("bristol airport")) return "BRS";
  if (clean.includes("stn") || clean.includes("stansted")) return "STN";
  if (clean.includes("cwl") || clean.includes("cardiff airport")) return "CWL";
  if (clean.includes("lba") || clean.includes("leeds bradford")) return "LBA";
  if (clean.includes("lgw") || clean.includes("gatwick")) return "LGW";
  if (clean.includes("ncl") || clean.includes("newcastle airport")) return "NCL";
  return null;
}

export interface AdditionalOption {
  id: string;
  name: string;
  price: number; // in GBP
  description: string;
}

export const EXTRA_OPTIONS: AdditionalOption[] = [
  { 
    id: "meet_greet", 
    name: "Meet & Greet Service", 
    price: 15.0, 
    description: "Driver waiting inside arrival terminal with personalized name board" 
  },
  { 
    id: "flight_monitoring", 
    name: "Live Flight Monitoring", 
    price: 0.0, 
    description: "Complimentary flight radar monitoring & first 45 minutes free waiting time" 
  },
  { 
    id: "child_seat", 
    name: "Child Safety Seat (0–4 yrs)", 
    price: 10.0, 
    description: "Approved rear/forward facing safety seat (pre-installed)" 
  },
  { 
    id: "booster_seat", 
    name: "Child Booster Seat (4–12 yrs)", 
    price: 5.0, 
    description: "Group 2/3 booster cushion for children" 
  },
  { 
    id: "extra_waiting", 
    name: "Additional 30 mins Waiting Time", 
    price: 12.0, 
    description: "Extra buffer for passport control delays (£6 per 15 minutes)" 
  },
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
  distanceMiles?: number;
  estimatedTimeMins?: number;
}

export function calculateDistanceMiles(
  c1?: { lat: number; lng: number },
  c2?: { lat: number; lng: number }
): number {
  if (!c1 || !c2 || !c1.lat || !c2.lat) {
    return 24.5;
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

export function calculateQuote(params: JourneyCalculationParams, customFleet?: any[]) {
  // 1. Check if route matches Birmingham to/from an airport fixed rate
  const fromIsBham = isBirminghamLocation(params.fromLocation, params.fromCoords);
  const toIsBham = isBirminghamLocation(params.toLocation, params.toCoords);
  const fromAirportCode = matchAirportFixedRoute(params.fromLocation);
  const toAirportCode = matchAirportFixedRoute(params.toLocation);

  let fixedRateMatch: BirminghamAirportFixedRate | null = null;
  if (fromIsBham && toAirportCode && BIRMINGHAM_AIRPORT_FIXED_RATES[toAirportCode]) {
    fixedRateMatch = BIRMINGHAM_AIRPORT_FIXED_RATES[toAirportCode];
  } else if (toIsBham && fromAirportCode && BIRMINGHAM_AIRPORT_FIXED_RATES[fromAirportCode]) {
    fixedRateMatch = BIRMINGHAM_AIRPORT_FIXED_RATES[fromAirportCode];
  }

  const distanceMiles = params.distanceMiles || (fixedRateMatch ? fixedRateMatch.approxMiles : calculateDistanceMiles(params.fromCoords, params.toCoords));
  const estimatedTimeMins = params.estimatedTimeMins || Math.round(distanceMiles * 1.6 + 10);
  const waypointCost = (params.waypoints?.length || 0) * 10.0;

  // 2. Compute pricing for each vehicle category
  const fleetToUse = customFleet && customFleet.length > 0 ? customFleet : VEHICLE_FLEET;

  const vehiclesWithPricing = fleetToUse.map((v) => {
    const vehId = v.id;
    let oneWayPrice = 0;

    if (fixedRateMatch && fixedRateMatch.prices[vehId] !== undefined) {
      oneWayPrice = fixedRateMatch.prices[vehId] + waypointCost;
    } else {
      // Mileage based formula: Rate per mile * distance, with minimum fare floor
      // Minimum fare applies where the calculated mileage fare is lower than the minimum charge.
      const ratePerMile = Number((v as any).ratePerMile || (v.multiplier ? v.multiplier * 1.50 : 1.50));
      const minimumFare = Number((v as any).minimumFare || 38.00);
      const calculatedMileage = Math.round(distanceMiles * ratePerMile * 100) / 100;
      const baseFare = Math.max(minimumFare, calculatedMileage);
      oneWayPrice = Math.round((baseFare + waypointCost) * 100) / 100;
    }

    // Return Trip calculation: 2x one-way with 5% round-trip discount
    let returnTripDiscount = 0;
    let totalPrice = oneWayPrice;

    if (params.bookReturn) {
      const fullRoundTrip = oneWayPrice * 2;
      returnTripDiscount = Math.round(fullRoundTrip * 0.05 * 100) / 100; // 5% OFF
      totalPrice = Math.round((fullRoundTrip - returnTripDiscount) * 100) / 100;
    }

    return {
      ...v,
      oneWayPrice,
      returnTripDiscount,
      totalPrice,
      finalPrice: totalPrice,
      capacity: {
        passengers: v.passengers,
        suitcases: v.suitcases,
        handLuggage: v.handLuggage,
      },
      isAvailable: params.passengers <= v.passengers,
    };
  });

  const saloonVeh = vehiclesWithPricing.find((v) => v.id === "saloon") || vehiclesWithPricing[0];
  const baseOneWayStandard = saloonVeh ? saloonVeh.oneWayPrice : 38.0;

  return {
    distanceMiles,
    estimatedTimeMins,
    baseOneWayStandard,
    isFixedRate: !!fixedRateMatch,
    fixedRouteAirport: fixedRateMatch?.airportName,
    vehicles: vehiclesWithPricing,
  };
}