export interface SearchLocationItem {
  location: string;
  code: string;
  locationType: 1 | 2; // 1 = Airport, 2 = Address/City/Postcode
  terminal?: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export const PRESET_LOCATIONS: SearchLocationItem[] = [
  // Airports
  { location: "London Heathrow Airport (LHR)", code: "LHR", locationType: 1, terminal: "All Terminals", lat: 51.4700, lng: -0.4543 },
  { location: "London Heathrow Airport - Terminal 2", code: "LHR", locationType: 1, terminal: "Terminal 2", lat: 51.4696, lng: -0.4504 },
  { location: "London Heathrow Airport - Terminal 3", code: "LHR", locationType: 1, terminal: "Terminal 3", lat: 51.4719, lng: -0.4544 },
  { location: "London Heathrow Airport - Terminal 4", code: "LHR", locationType: 1, terminal: "Terminal 4", lat: 51.4586, lng: -0.4452 },
  { location: "London Heathrow Airport - Terminal 5", code: "LHR", locationType: 1, terminal: "Terminal 5", lat: 51.4723, lng: -0.4880 },
  { location: "London Gatwick Airport (LGW)", code: "LGW", locationType: 1, terminal: "All Terminals", lat: 51.1537, lng: -0.1821 },
  { location: "London Gatwick Airport - North Terminal", code: "LGW", locationType: 1, terminal: "North Terminal", lat: 51.1598, lng: -0.1770 },
  { location: "London Gatwick Airport - South Terminal", code: "LGW", locationType: 1, terminal: "South Terminal", lat: 51.1568, lng: -0.1610 },
  { location: "London Stansted Airport (STN)", code: "STN", locationType: 1, terminal: "Main Terminal", lat: 51.8860, lng: 0.2389 },
  { location: "London Luton Airport (LTN)", code: "LTN", locationType: 1, terminal: "Main Terminal", lat: 51.8747, lng: -0.3683 },
  { location: "London City Airport (LCY)", code: "LCY", locationType: 1, terminal: "Main Terminal", lat: 51.5048, lng: 0.0495 },
  { location: "London Southend Airport (SEN)", code: "SEN", locationType: 1, terminal: "Main Terminal", lat: 51.5714, lng: 0.6956 },
  { location: "Manchester Airport (MAN)", code: "MAN", locationType: 1, terminal: "All Terminals", lat: 53.3537, lng: -2.2750 },
  { location: "Manchester Airport - Terminal 1", code: "MAN", locationType: 1, terminal: "Terminal 1", lat: 53.3618, lng: -2.2730 },
  { location: "Manchester Airport - Terminal 2", code: "MAN", locationType: 1, terminal: "Terminal 2", lat: 53.3644, lng: -2.2724 },
  { location: "Manchester Airport - Terminal 3", code: "MAN", locationType: 1, terminal: "Terminal 3", lat: 53.3571, lng: -2.2758 },
  { location: "Birmingham Airport (BHX)", code: "BHX", locationType: 1, terminal: "Main Terminal", lat: 52.4539, lng: -1.7480 },
  { location: "Edinburgh Airport (EDI)", code: "EDI", locationType: 1, terminal: "Main Terminal", lat: 55.9508, lng: -3.3615 },
  { location: "Glasgow Airport (GLA)", code: "GLA", locationType: 1, terminal: "Main Terminal", lat: 55.8719, lng: -4.4331 },
  { location: "Bristol Airport (BRS)", code: "BRS", locationType: 1, terminal: "Main Terminal", lat: 51.3827, lng: -2.7191 },
  { location: "Newcastle International Airport (NCL)", code: "NCL", locationType: 1, terminal: "Main Terminal", lat: 55.0375, lng: -1.6917 },
  { location: "Liverpool John Lennon Airport (LPL)", code: "LPL", locationType: 1, terminal: "Main Terminal", lat: 53.3336, lng: -2.8497 },
  { location: "East Midlands Airport (EMA)", code: "EMA", locationType: 1, terminal: "Main Terminal", lat: 52.8311, lng: -1.3281 },
  { location: "Leeds Bradford Airport (LBA)", code: "LBA", locationType: 1, terminal: "Main Terminal", lat: 53.8659, lng: -1.6606 },
  { location: "Southampton Airport (SOU)", code: "SOU", locationType: 1, terminal: "Main Terminal", lat: 50.9503, lng: -1.3568 },
  { location: "Belfast International Airport (BFS)", code: "BFS", locationType: 1, terminal: "Main Terminal", lat: 54.6575, lng: -6.2158 },
  { location: "Belfast City Airport (BHD)", code: "BHD", locationType: 1, terminal: "Main Terminal", lat: 54.6181, lng: -5.8725 },
  { location: "Aberdeen Airport (ABZ)", code: "ABZ", locationType: 1, terminal: "Main Terminal", lat: 57.2019, lng: -2.1978 },
  { location: "Cardiff Airport (CWL)", code: "CWL", locationType: 1, terminal: "Main Terminal", lat: 51.3967, lng: -3.3433 },
  { location: "Exeter Airport (EXT)", code: "EXT", locationType: 1, terminal: "Main Terminal", lat: 50.7344, lng: -3.4139 },
  { location: "Norwich Airport (NWI)", code: "NWI", locationType: 1, terminal: "Main Terminal", lat: 52.6758, lng: 1.2828 },

  // UK Cities & Major Landmarks
  { location: "Central London, London, UK", code: "W1A", locationType: 2, lat: 51.5074, lng: -0.1278 },
  { location: "167-169 Great Portland Street, London, W1W 5PF", code: "W1W 5PF", locationType: 2, lat: 51.5204, lng: -0.1441 },
  { location: "Westminster, London, SW1A 1AA", code: "SW1A 1AA", locationType: 2, lat: 51.5014, lng: -0.1419 },
  { location: "Covent Garden, London, WC2E 8HD", code: "WC2E 8HD", locationType: 2, lat: 51.5117, lng: -0.1240 },
  { location: "Canary Wharf, London, E14 5AB", code: "E14 5AB", locationType: 2, lat: 51.5054, lng: -0.0235 },
  { location: "Oxford City Centre, Oxford, OX1 1BY", code: "OX1 1BY", locationType: 2, lat: 51.7520, lng: -1.2577 },
  { location: "Cambridge City Centre, Cambridge, CB2 1TJ", code: "CB2 1TJ", locationType: 2, lat: 52.2053, lng: 0.1218 },
  { location: "Brighton Seafront, Brighton, BN1 2FL", code: "BN1 2FL", locationType: 2, lat: 50.8225, lng: -0.1372 },
  { location: "Bath City Centre, Bath, BA1 1SU", code: "BA1 1SU", locationType: 2, lat: 51.3811, lng: -2.3590 },
  { location: "Southampton Port / Cruise Terminal, SO14 2AQ", code: "SO14 2AQ", locationType: 2, lat: 50.8966, lng: -1.4022 },
  { location: "Dover Ferry Port, Dover, CT17 9TF", code: "CT17 9TF", locationType: 2, lat: 51.1279, lng: 1.3262 },
  { location: "King's Cross St. Pancras Station, London, N1C 4QP", code: "N1C 4QP", locationType: 2, lat: 51.5314, lng: -0.1261 },
  { location: "London Victoria Station, London, SW1V 1JU", code: "SW1V 1JU", locationType: 2, lat: 51.4952, lng: -0.1439 },
  { location: "London Paddington Station, London, W2 1HB", code: "W2 1HB", locationType: 2, lat: 51.5154, lng: -0.1755 },
  { location: "London Waterloo Station, London, SE1 8SW", code: "SE1 8SW", locationType: 2, lat: 51.5032, lng: -0.1123 },
  { location: "Reading Town Centre, Reading, RG1 1EX", code: "RG1 1EX", locationType: 2, lat: 51.4543, lng: -0.9781 },
  { location: "Milton Keynes Centre, MK9 1AU", code: "MK9 1AU", locationType: 2, lat: 52.0406, lng: -0.7594 },
  { location: "Birmingham New Street Station, B2 4QA", code: "B2 4QA", locationType: 2, lat: 52.4777, lng: -1.8988 },
  { location: "Manchester Piccadilly Station, M1 2PB", code: "M1 2PB", locationType: 2, lat: 53.4774, lng: -2.2311 },
  { location: "Edinburgh Waverley Station, EH1 1BB", code: "EH1 1BB", locationType: 2, lat: 55.9520, lng: -3.1890 },
  { location: "Glasgow Central Station, G1 3SL", code: "G1 3SL", locationType: 2, lat: 55.8591, lng: -4.2581 },
  { location: "York City Centre, York, YO1 7DY", code: "YO1 7DY", locationType: 2, lat: 53.9599, lng: -1.0873 },
  { location: "Windsor Castle, Windsor, SL4 1NJ", code: "SL4 1NJ", locationType: 2, lat: 51.4839, lng: -0.6044 }
];

export function searchLocations(query: string): SearchLocationItem[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  return PRESET_LOCATIONS.filter(
    (item) =>
      item.location.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      (item.terminal && item.terminal.toLowerCase().includes(q))
  );
}
