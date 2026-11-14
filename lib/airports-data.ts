export interface AirportItem {
  id: string;
  name: string;
  iata: string;
  slug: string;
  city: string;
  country: string;
  terminals: string[];
  lat: number;
  lng: number;
  image: string;
  description: string;
  highlights: string[];
  faqs: { question: string; answer: string }[];
}

export const UK_AIRPORTS: AirportItem[] = [
  {
    id: "lhr",
    name: "London Heathrow Airport",
    iata: "LHR",
    slug: "lhr",
    city: "London",
    country: "United Kingdom",
    terminals: ["Terminal 2", "Terminal 3", "Terminal 4", "Terminal 5"],
    lat: 51.4700,
    lng: -0.4543,
    image: "https://cdn.otstaxi.com/airports/london-heathrow-airport-1722614723.png",
    description: "Heathrow Airport is situated just 14 miles (23 km) west of Central London, making it a convenient gateway for both the city and surrounding areas. Located 3 miles from Hounslow, Hayes, and Staines-upon-Thames within the London Borough of Hillingdon (TW6).",
    highlights: [
      "Timely and reliable transfers to and from London Heathrow Airport, ensuring a stress-free travel experience.",
      "Fixed pricing for London Heathrow transfers guarantees a clear, upfront cost with no hidden surcharges.",
      "Complimentary meet and greet service inside the arrivals hall with personalized name board.",
      "Real-time flight arrival tracking to accommodate any early landings or flight delays automatically."
    ],
    faqs: [
      {
        question: "Do you charge extra for debit or credit card payments?",
        answer: "No, we only charge the fixed price as shown on your quotation. No card processing surcharges apply."
      },
      {
        question: "Will anyone else be travelling in the vehicle I book?",
        answer: "No, we only offer 100% private transfers. The vehicle is reserved exclusively for your party."
      },
      {
        question: "Where will I meet my driver?",
        answer: "The driver will meet and greet you inside the airport arrivals hall holding a sign with your name on it."
      },
      {
        question: "What happens if my flight is delayed?",
        answer: "We track your flight number in real-time. Your pickup time will automatically be adjusted to match your actual landing time."
      }
    ]
  },
  {
    id: "lgw",
    name: "London Gatwick Airport",
    iata: "LGW",
    slug: "lgw",
    city: "London / Crawley",
    country: "United Kingdom",
    terminals: ["North Terminal", "South Terminal"],
    lat: 51.1537,
    lng: -0.1821,
    image: "https://cdn.otstaxi.com/airports/london-gatwick-airport-1722614940.png",
    description: "London Gatwick Airport is the UK's second busiest airport, situated 29.5 miles south of Central London near Crawley, West Sussex. OTS Taxi provides reliable, comfortable transfers connecting Gatwick North and South terminals to all London boroughs and UK destinations.",
    highlights: [
      "Direct terminal pick-up and drop-off for North and South Terminals.",
      "Flight tracking included with 45 minutes free waiting time after landing.",
      "Executive and MPV options suitable for luggage-heavy holidaymakers and business executives."
    ],
    faqs: [
      {
        question: "How long does a taxi take from Gatwick to Central London?",
        answer: "Typically 60 to 90 minutes depending on traffic and the destination borough."
      },
      {
        question: "Which terminal will my driver pick me up from?",
        answer: "Your driver will meet you inside the specific arrivals hall (North or South) based on your flight number."
      }
    ]
  },
  {
    id: "stn",
    name: "London Stansted Airport",
    iata: "STN",
    slug: "stn",
    city: "London / Essex",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 51.8860,
    lng: 0.2389,
    image: "https://cdn.otstaxi.com/airports/london-stansted-airport-1722608674.png",
    description: "Stansted Airport is located northeast of London in Essex, serving major European and international routes. Avoid train schedules with our 24/7 direct door-to-door taxi service.",
    highlights: [
      "Fixed prices with Stansted dropoff barrier fees included.",
      "Punctual early-morning and late-night pickups for European discount airline flights."
    ],
    faqs: [
      {
        question: "Are airport barrier drop-off fees included in the price?",
        answer: "Yes, our quoted fares include all mandatory airport terminal access and barrier charges."
      }
    ]
  },
  {
    id: "ltn",
    name: "London Luton Airport",
    iata: "LTN",
    slug: "ltn",
    city: "London / Luton",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 51.8747,
    lng: -0.3683,
    image: "https://cdn.otstaxi.com/airports/london-luton-airport-1722615147.png",
    description: "Located 28 miles north of London, Luton Airport is a key destination for leisure and business travellers. Pre-book your transfer for guaranteed pickup with our licensed chauffeur network.",
    highlights: [
      "Reliable transfers via M1 motorway directly to Central London and the Midlands.",
      "Meet and greet service at the dedicated passenger pick-up zone."
    ],
    faqs: [
      {
        question: "Where does the driver meet passengers at Luton?",
        answer: "At the designated arrivals greeting area inside the terminal building."
      }
    ]
  },
  {
    id: "lcy",
    name: "London City Airport",
    iata: "LCY",
    slug: "lcy",
    city: "London",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 51.5048,
    lng: 0.0495,
    image: "https://cdn.otstaxi.com/airports/london-city-airport-1722959120.png",
    description: "Located in the Royal Docks in Newham, London City Airport is the closest airport to the City of London and Canary Wharf. Ideal for business travelers seeking swift executive transfers.",
    highlights: [
      "Express executive transfers to Canary Wharf, the City, and West End.",
      "Mercedes E-Class and V-Class executive fleet options."
    ],
    faqs: [
      {
        question: "Can I book an executive vehicle for London City Airport?",
        answer: "Yes, our Executive Saloon and Executive MPV options are tailored for corporate and business travel."
      }
    ]
  },
  {
    id: "man",
    name: "Manchester Airport",
    iata: "MAN",
    slug: "man",
    city: "Manchester",
    country: "United Kingdom",
    terminals: ["Terminal 1", "Terminal 2", "Terminal 3"],
    lat: 53.3537,
    lng: -2.2750,
    image: "https://cdn.otstaxi.com/airports/manchester-airport-1722615411.png",
    description: "Manchester Airport is the global gateway for Northern England, located 9 miles south of Manchester city centre. Providing comprehensive coverage across Greater Manchester, Yorkshire, Lancashire, and Cheshire.",
    highlights: [
      "Transfers connecting Terminals 1, 2, and 3 to Manchester city centre, Leeds, Liverpool, and nationwide.",
      "Competitive fixed fares with licensed Northern private hire operators."
    ],
    faqs: [
      {
        question: "Can I book long distance transfers from Manchester Airport?",
        answer: "Yes, we cover any UK destination including Leeds, Sheffield, Liverpool, and the Lake District."
      }
    ]
  },
  {
    id: "bhx",
    name: "Birmingham Airport",
    iata: "BHX",
    slug: "bhx",
    city: "Birmingham",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 52.4539,
    lng: -1.7480,
    image: "https://cdn.otstaxi.com/airports/birmingham-airport-1722615754.png",
    description: "Birmingham Airport serves the West Midlands, located 8 miles east of Birmingham city centre near the NEC and Solihull. OTS Taxi delivers seamless airport journeys across the Midlands.",
    highlights: [
      "Fixed rates for transfers to Birmingham City, Coventry, Leicester, and Warwick.",
      "24/7 availability for domestic and international flights."
    ],
    faqs: [
      {
        question: "Is Meet & Greet available at Birmingham Airport?",
        answer: "Yes, our drivers meet passengers inside the arrivals hall holding a personalized name board."
      }
    ]
  },
  {
    id: "edi",
    name: "Edinburgh Airport",
    iata: "EDI",
    slug: "edi",
    city: "Edinburgh",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 55.9508,
    lng: -3.3615,
    image: "https://cdn.otstaxi.com/airports/edinburgh-airport-1722615594.png",
    description: "Scotland's busiest airport, situated 5.8 miles west of Edinburgh city centre. Enjoy dependable, high-comfort transfers directly to Edinburgh Old Town, New Town, Glasgow, and the Highlands.",
    highlights: [
      "Direct transfers to central Edinburgh hotels, universities, and festival venues.",
      "Large MPV vehicles available for golf clubs, ski equipment, and extra luggage."
    ],
    faqs: [
      {
        question: "Can you accommodate golf bags from Edinburgh Airport?",
        answer: "Yes, our Estate cars and People Carrier / MPVs easily fit golf clubs and large luggage items."
      }
    ]
  },
  {
    id: "gla",
    name: "Glasgow Airport",
    iata: "GLA",
    slug: "gla",
    city: "Glasgow",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 55.8719,
    lng: -4.4331,
    image: "https://cdn.otstaxi.com/airports/glasgow-airport-1722616116.png",
    description: "Located 9 miles west of Glasgow city centre in Paisley, Renfrewshire. Providing prompt transfers to Greater Glasgow, Loch Lomond, and western Scotland.",
    highlights: [
      "Punctual service for international and domestic arrivals.",
      "Fixed prices with 24/7 customer dispatch."
    ],
    faqs: [
      {
        question: "How do I find my driver at Glasgow Airport?",
        answer: "Your driver will be in the arrivals area with your name clearly displayed on a tablet or board."
      }
    ]
  },
  {
    id: "brs",
    name: "Bristol Airport",
    iata: "BRS",
    slug: "brs",
    city: "Bristol",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 51.3827,
    lng: -2.7191,
    image: "https://cdn.otstaxi.com/airports/bristol-airport-1722615943.png",
    description: "Bristol Airport is the commercial airport for South West England and South Wales, located in Lulsgate Bottom, North Somerset.",
    highlights: [
      "Direct transfers to Bristol, Bath, Cardiff, Newport, and Somerset.",
      "Fixed rates avoiding surge pricing."
    ],
    faqs: [
      {
        question: "Do you provide transfers from Bristol Airport to Bath?",
        answer: "Yes, transfers from Bristol Airport to Bath take approximately 45-55 minutes door-to-door."
      }
    ]
  },
  {
    id: "ncl",
    name: "Newcastle International Airport",
    iata: "NCL",
    slug: "ncl",
    city: "Newcastle",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 55.0375,
    lng: -1.6917,
    image: "https://cdn.otstaxi.com/airports/newcastle-international-airport-1727104817.png",
    description: "Serving North East England, Newcastle International Airport is located 6.5 miles northwest of Newcastle upon Tyne city centre.",
    highlights: [
      "Transfers covering Newcastle, Sunderland, Durham, and Northumberland.",
      "Reliable licensed operators with flight monitoring."
    ],
    faqs: [
      {
        question: "Are child seats available for Newcastle transfers?",
        answer: "Yes, you can request infant or child booster seats during step 1 of your booking."
      }
    ]
  },
  {
    id: "bfs",
    name: "Belfast International Airport",
    iata: "BFS",
    slug: "bfs",
    city: "Belfast",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 54.6575,
    lng: -6.2158,
    image: "https://cdn.otstaxi.com/airports/belfast-international-airport-1722616284.png",
    description: "Located 13 miles northwest of Belfast near Aldergrove in County Antrim. Northern Ireland's principal airport for scheduled international flights.",
    highlights: [
      "Direct journeys across Belfast, Lisburn, Derry, and Northern Ireland.",
      "Pre-booked fixed fare with no meter charges."
    ],
    faqs: [
      {
        question: "Is there a night surcharge for late night arrivals?",
        answer: "No, our quoted price is fixed 24 hours a day with zero late-night meter surcharges."
      }
    ]
  },
  {
    id: "bhd",
    name: "George Best Belfast City Airport",
    iata: "BHD",
    slug: "bhd",
    city: "Belfast",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 54.6181,
    lng: -5.8725,
    image: "https://cdn.otstaxi.com/airports/belfast-city-airport-1730742430.png",
    description: "Belfast City Airport is located adjacent to the Port of Belfast, just 3 miles from Belfast city centre.",
    highlights: [
      "Quick 10-15 minute transfer directly to Belfast city centre.",
      "Executive and standard saloon options."
    ],
    faqs: [
      {
        question: "How far is Belfast City Airport from Titanic Belfast?",
        answer: "It is under 3 miles, approximately an 8-minute taxi ride."
      }
    ]
  },
  {
    id: "ext",
    name: "Exeter Airport",
    iata: "EXT",
    slug: "ext",
    city: "Exeter / Devon",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 50.7344,
    lng: -3.4139,
    image: "https://cdn.otstaxi.com/airports/exeter-airport-1744647314.jpg",
    description: "Exeter Airport serves Devon and the South West peninsula, situated in Clyst Honiton in East Devon.",
    highlights: [
      "Transfers across Devon, Torquay, Plymouth, and Cornwall.",
      "Fixed prices with DBS-checked drivers."
    ],
    faqs: [
      {
        question: "Can I book a transfer from Exeter Airport to Torquay?",
        answer: "Yes, transfers from Exeter Airport to the English Riviera take around 35-40 minutes."
      }
    ]
  },
  {
    id: "lpl",
    name: "Liverpool John Lennon Airport",
    iata: "LPL",
    slug: "lpl",
    city: "Liverpool",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 53.3336,
    lng: -2.8497,
    image: "https://cdn.otstaxi.com/airports/liverpool-john-lennon-airport-1738164839.jpg",
    description: "Liverpool John Lennon Airport is located 7.5 miles southeast of Liverpool city centre adjacent to the River Mersey.",
    highlights: [
      "Fast transfers to Liverpool city centre, Anfield, Everton, and Cheshire.",
      "Minibuses and People Carriers for travelling groups."
    ],
    faqs: [
      {
        question: "Can I book an 8-seater taxi for a group trip from Liverpool Airport?",
        answer: "Yes, our 8-Seater Minibus accommodates up to 8 passengers and 8 large bags."
      }
    ]
  },
  {
    id: "ema",
    name: "East Midlands Airport",
    iata: "EMA",
    slug: "ema",
    city: "Derby / Nottingham / Leicester",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 52.8311,
    lng: -1.3281,
    image: "https://cdn.otstaxi.com/airports/east-midlands-airport-1738165838.jpg",
    description: "East Midlands Airport is positioned in Castle Donington, serving Nottingham (14 miles), Derby (14 miles), and Leicester (20 miles).",
    highlights: [
      "Central access to all three East Midlands cities via M1 and A42.",
      "Dependable pre-booked transfers with flight monitoring."
    ],
    faqs: [
      {
        question: "Which cities are closest to East Midlands Airport?",
        answer: "Derby, Nottingham, and Leicester are all within a 20-30 minute drive."
      }
    ]
  },
  {
    id: "lba",
    name: "Leeds Bradford Airport",
    iata: "LBA",
    slug: "lba",
    city: "Leeds / Bradford",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 53.8659,
    lng: -1.6606,
    image: "https://cdn.otstaxi.com/airports/leeds-bradford-airport-1738164030.jpg",
    description: "Situated in Yeadon, Leeds Bradford Airport is the highest commercial airport in the UK, serving West Yorkshire and the Yorkshire Dales.",
    highlights: [
      "Transfers to Leeds, Bradford, Harrogate, York, and Huddersfield.",
      "Experienced local drivers equipped for all seasonal weather."
    ],
    faqs: [
      {
        question: "How long does a transfer take from Leeds Bradford to Harrogate?",
        answer: "Typically 25-30 minutes under normal traffic conditions."
      }
    ]
  },
  {
    id: "sou",
    name: "Southampton Airport",
    iata: "SOU",
    slug: "sou",
    city: "Southampton",
    country: "United Kingdom",
    terminals: ["Main Terminal"],
    lat: 50.9503,
    lng: -1.3568,
    image: "https://cdn.otstaxi.com/airports/southampton-airport-1738165654.jpg",
    description: "Located 4 miles north-northeast of Southampton, ideal for connections to cruise terminals at Southampton Docks and the South Coast.",
    highlights: [
      "Direct transfers between Southampton Airport and Southampton Cruise Terminals.",
      "Large vehicles for cruise passenger luggage."
    ],
    faqs: [
      {
        question: "Do you transfer to Southampton Cruise Port?",
        answer: "Yes, we provide dedicated cruise transfers with large luggage space directly to ship terminals."
      }
    ]
  }
];

export function getAirportBySlug(slug: string): AirportItem | undefined {
  return UK_AIRPORTS.find(
    (a) => a.slug.toLowerCase() === slug.toLowerCase() || a.iata.toLowerCase() === slug.toLowerCase()
  );
}
