import React, { useState, useEffect } from "react";
import { 
  Compass, 
  MapPin, 
  ShieldCheck, 
  BookOpen, 
  PenTool, 
  User, 
  UserCheck, 
  Sparkles, 
  Calendar, 
  AlertTriangle, 
  DollarSign, 
  Map, 
  ChevronRight, 
  Heart, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Search,
  BookMarked,
  LayoutGrid,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Itinerary, HeritageTour, SafetyAnalysis, BlogPost } from "./types";
import { InteractiveMap } from "./components/InteractiveMap";
import { LeafletMap } from "./components/LeafletMap";
import { AICuratorChat } from "./components/AICuratorChat";

/* ==========================================================================
   INITIAL PRESET DATA
   ========================================================================== */
const INITIAL_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Chasing Quietude in Kyoto's Bamboo Foothills",
    author: "Elena Rostova",
    date: "May 28, 2026",
    content: "There is a silent music that plays only when the morning wind brushes through the green stalks of Arashiyama. Walking here at 6:00 AM, before the first trains rumble from Kyoto Station, you are wrapped in a cool damp fog. I passed an elder monk swept-cleaning mossy stairs at a side temple, and for a brief five minutes, the entire noisy modern world dissolved entirely.",
    tags: ["Kyoto", "Bamboo", "Zen", "SlowTravel"],
    imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    likes: 42
  },
  {
    id: "blog-2",
    title: "The Golden Roman Dusk from Aventine Hill",
    author: "Marc Dupond",
    date: "May 25, 2026",
    content: "While crowds queue under the brutal midday sun at the Colosseum, the real soul of Rome hides on Aventine Hill just before twilight. Climbed past the Orange Garden where local kids were playing classical guitar. Looking through the famous Knights of Malta keyhole, Saint Peter's Basilica stands framed in perfect green concentricity, painted in rich, molten gold.",
    tags: ["Rome", "Aventine", "GoldenHour", "Secrets"],
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
    likes: 31
  }
];

// Aesthetic mock itinerary loaded by default on app boot
const DEFAULT_ITINERARY: Itinerary = {
  destination: "Rome, Italy",
  durationDays: 3,
  totalEstimatedBudget: "$450 - $700 USD",
  travelStyle: "Cultural Heritage Loop",
  summary: "A thrilling timeline pacing classic ruins, secret hilltop panoramas, and high-fidelity local culinary adventures.",
  dailyitinerary: [
    {
      day: 1,
      title: "Gladiators & Imperial Footsteps",
      activities: [
        {
          time: "Morning (09:00)",
          activity: "Wander the Roman Colosseum interior plinths.",
          location: "Piazza del Colosseo, 1, 00184 Rome",
          cost: "€22",
          tips: "Pre-book timed tickets to enter the arena level directly without queueing.",
          lat: 41.8902,
          lng: 12.4922
        },
        {
          time: "Afternoon (14:00)",
          activity: "Stroll the ancient paving stones of the Roman Forum.",
          location: "Via della Salara Vecchia, 5/6, 00186 Rome",
          cost: "Included in ticket",
          tips: "Climb up to Palatine Hill to get the best bird's-eye valley view.",
          lat: 41.8925,
          lng: 12.4853
        }
      ]
    },
    {
      day: 2,
      title: "Baroque Fountains & Artisan Trastevere",
      activities: [
        {
          time: "Morning (10:00)",
          activity: "Toss a lucky coin in the magnificent Trevi Fountain.",
          location: "Piazza di Trevi, 00187 Rome",
          cost: "Free",
          tips: "Go early to admire the marble carvings clearly without tourist shoulders.",
          lat: 41.9009,
          lng: 12.4833
        },
        {
          time: "Evening (18:30)",
          activity: "Enjoy traditional pasta inside cozy Trastevere alleys.",
          location: "Piazza di Santa Maria in Trastevere",
          cost: "€25",
          tips: "Sip local house red and order authentic Cacio e Pepe.",
          lat: 41.8893,
          lng: 12.4699
        }
      ]
    }
  ]
};

// Initial Heritage Site Mock for fallback
const DEFAULT_HERITAGE: HeritageTour = {
  siteName: "Machu Picchu",
  location: "Cusco Region, Peru",
  yearBuilt: "1450 AD",
  history: "An impressive 15th-century Inca citadel built at 2,430 meters above sea level. It was constructed for the Inca Emperor Pachacuti but abandoned during the Spanish Conquest, remaining hidden from the global stage until 1911.",
  narrative: "You ascend through misty forest trails before the clouds suddenly part. The iconic peak of Huayna Picchu stands majestic behind neatly terraced stone squares, agricultural stairs, and meticulously fitted mortarless walls reflecting high architectural wizardry.",
  sections: [
    {
      name: "The Temple of the Three Windows",
      description: "An impressive granite masonry structure facing east over the main courtyard, letting in morning light reflecting Peru's cosmos beliefs.",
      interactiveDetailsColor: "Earthy Highland Granite"
    }
  ],
  trivia: [
    "No mortar was used; stones are cut so precisely that not even a knife is capable of sliding through.",
    "The site acts as an ancient astronomical clock aligns seamlessly with solstice sunbeams."
  ]
};

// Curated list of popular destinations utilized by Carousel & Destination Discovery
const CAROUSEL_DESTINATIONS = [
  { 
    id: "dest-kyoto",
    name: "Kyoto", 
    country: "Japan", 
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80", 
    theme: "Zen Temples & Bamboo Foothills", 
    desc: "Wander peaceful mossy gardens, centuries-old shrines, and misty bamboo avenues.", 
    rating: "4.9", 
    region: "Asia",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 35.0116,
    lng: 135.7681
  },
  { 
    id: "dest-rome",
    name: "Rome", 
    country: "Italy", 
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80", 
    theme: "Imperial Antiquities Loop", 
    desc: "Admire magnificent baroque fountains, classical arches, and Trastevere tavernas.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 41.9028,
    lng: 12.4964
  },
  { 
    id: "dest-santorini",
    name: "Santorini", 
    country: "Greece", 
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80", 
    theme: "Coastal Caldera Domes", 
    desc: "Climb crisp white cliff villages framed by dazzling sapphire Aegean currents.", 
    rating: "4.7", 
    region: "Europe",
    budget: "Luxury",
    style: "Coastal Retreat",
    lat: 36.3932,
    lng: 25.4615
  },
  { 
    id: "dest-alp",
    name: "Swiss Alps", 
    country: "Switzerland", 
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80", 
    theme: "Glacier Summit Ridges", 
    desc: "Trek severe snowcapped massifs, dramatic pine crevasses, and crystal lakes.", 
    rating: "4.9", 
    region: "Europe",
    budget: "Luxury",
    style: "Adventure/Active",
    lat: 46.5584,
    lng: 8.5358
  },
  { 
    id: "dest-machu",
    name: "Machu Picchu", 
    country: "Peru", 
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=80", 
    theme: "High Andean Incan Citadel", 
    desc: "Explore stunning mortarless stone temples balanced in deep mountain clouds.", 
    rating: "4.9", 
    region: "Americas",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: -13.1631,
    lng: -72.5450
  },
  { 
    id: "dest-cairo",
    name: "Cairo", 
    country: "Egypt", 
    image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80", 
    theme: "Desert Pyramids Grid", 
    desc: "Adore monolithic engineering heights, solar barges, and gold antiquities.", 
    rating: "4.6", 
    region: "Africa",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 30.0444,
    lng: 31.2357
  },
  { 
    id: "dest-sydney",
    name: "Sydney", 
    country: "Australia", 
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80", 
    theme: "Harbour Operatic Hub", 
    desc: "Catch panoramic ferry routes and dine along spectacular urban bays.", 
    rating: "4.7", 
    region: "Asia",
    budget: "Moderate",
    style: "Coastal Retreat",
    lat: -33.8688,
    lng: 151.2093
  },
  { 
    id: "dest-cape",
    name: "Cape Town", 
    country: "South Africa", 
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80", 
    theme: "Coastal Range Peak walks", 
    desc: "Savor stellar botanical forests where massive cliffs fall into crashing seas.", 
    rating: "4.8", 
    region: "Africa",
    budget: "Budget",
    style: "Adventure/Active",
    lat: -33.9249,
    lng: 18.4241
  },
  { 
    id: "dest-tokyo",
    name: "Tokyo", 
    country: "Japan", 
    image: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80", 
    theme: "Cyberpunk Neon Hubs & Gardens", 
    desc: "Explore historic shrines nested among grand skyscrapers and glowing alleys.", 
    rating: "4.9", 
    region: "Asia",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 35.6762,
    lng: 139.6503
  },
  { 
    id: "dest-london",
    name: "London", 
    country: "United Kingdom", 
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80", 
    theme: "Victorian Gothic & Global Arts", 
    desc: "Tour crown jewel vaults, royal botanical glasshouses, and historic theatrical stages.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Luxury",
    style: "Cultural Explorer",
    lat: 51.5074,
    lng: -0.1278
  },
  { 
    id: "dest-paris",
    name: "Paris", 
    country: "France", 
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80", 
    theme: "Haussmann Avenues & Beaux-Arts", 
    desc: "Stroll scenic riverbanks, neoclassical masterwork halls, and sweet corner bistros.", 
    rating: "4.9", 
    region: "Europe",
    budget: "Luxury",
    style: "Cultural Explorer",
    lat: 48.8566,
    lng: 2.3522
  },
  { 
    id: "dest-nyc",
    name: "New York", 
    country: "United States", 
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80", 
    theme: "Art Deco Skyscrapers & Broadway", 
    desc: "Immerse in soaring landmarks, lush central lawns, and vibrant industrial designs.", 
    rating: "4.8", 
    region: "Americas",
    budget: "Luxury",
    style: "Cultural Explorer",
    lat: 40.7128,
    lng: -74.0060
  },
  { 
    id: "dest-rio",
    name: "Rio de Janeiro", 
    country: "Brazil", 
    image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=600&q=80", 
    theme: "Tijuca Peaks & Copacabana Bay", 
    desc: "Trek dramatic granite monoliths looking over dynamic white sand beach lagoons.", 
    rating: "4.7", 
    region: "Americas",
    budget: "Moderate",
    style: "Coastal Retreat",
    lat: -22.9068,
    lng: -43.1729
  },
  { 
    id: "dest-marrakesh",
    name: "Marrakesh", 
    country: "Morocco", 
    image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80", 
    theme: "Moorish Bastions & Souk Markets", 
    desc: "Wander vibrant orange plaster corridors, ancient palaces, and mosaic courtyards.", 
    rating: "4.8", 
    region: "Africa",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 31.6295,
    lng: -7.9811
  },
  { 
    id: "dest-seoul",
    name: "Seoul", 
    country: "South Korea", 
    image: "https://images.unsplash.com/photo-1517154421773-0529f291451e?auto=format&fit=crop&w=600&q=80", 
    theme: "Joseon Dynasty Palaces & Hi-Tech", 
    desc: "Pass through majestic ceremonial gates and modern glass towers with neon signage.", 
    rating: "4.8", 
    region: "Asia",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 37.5665,
    lng: 126.9780
  },
  { 
    id: "dest-singapore",
    name: "Singapore", 
    country: "Singapore", 
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80", 
    theme: "Botanical Supertrees & Marina Bay", 
    desc: "Explore breathtaking tropical glass domes, bio-domes, and luxury harbor paths.", 
    rating: "4.9", 
    region: "Asia",
    budget: "Luxury",
    style: "Coastal Retreat",
    lat: 1.3521,
    lng: 103.8198
  },
  { 
    id: "dest-bangkok",
    name: "Bangkok", 
    country: "Thailand", 
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80", 
    theme: "Gilded Temple Spires & River Canals", 
    desc: "Discover glorious palace courtyards, gold reclining shrines, and street marketplaces.", 
    rating: "4.6", 
    region: "Asia",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 13.7563,
    lng: 100.5018
  },
  { 
    id: "dest-barcelona",
    name: "Barcelona", 
    country: "Spain", 
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efedd?auto=format&fit=crop&w=600&q=80", 
    theme: "Organic Modernisme & Gothic Alleys", 
    desc: "Follow eccentric organic cathedrals, seaside walkways, and sunny tapas squares.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Moderate",
    style: "Coastal Retreat",
    lat: 41.3851,
    lng: 2.1734
  },
  { 
    id: "dest-amsterdam",
    name: "Amsterdam", 
    country: "Netherlands", 
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80", 
    theme: "Renaissance Gables & Water Channels", 
    desc: "Ride bicycles past narrow brick townhouses, flower markets, and cozy bridges.", 
    rating: "4.7", 
    region: "Europe",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 52.3676,
    lng: 4.9041
  },
  { 
    id: "dest-dubai",
    name: "Dubai", 
    country: "United Arab Emirates", 
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80", 
    theme: "Parametric Architecture & Dunes", 
    desc: "Marvel at the world's tallest needle towers matching golden desert sands.", 
    rating: "4.8", 
    region: "Asia",
    budget: "Luxury",
    style: "Coastal Retreat",
    lat: 25.2048,
    lng: 55.2708
  },
  { 
    id: "dest-bali",
    name: "Bali", 
    country: "Indonesia", 
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80", 
    theme: "Volcanic Cliffs & Emerald Terraces", 
    desc: "Find serene sea temple shrines, lush palm valleys, and surfing shorelines.", 
    rating: "4.7", 
    region: "Asia",
    budget: "Budget",
    style: "Coastal Retreat",
    lat: -8.4095,
    lng: 115.1889
  },
  { 
    id: "dest-venice",
    name: "Venice", 
    country: "Italy", 
    image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=600&q=80", 
    theme: "Byzantine Gothic Waterways", 
    desc: "Glide past intricate marble facades, historic stone bridges, and hidden lagoons.", 
    rating: "4.9", 
    region: "Europe",
    budget: "Luxury",
    style: "Cultural Explorer",
    lat: 45.4408,
    lng: 12.3155
  },
  { 
    id: "dest-petra",
    name: "Petra", 
    country: "Jordan", 
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80", 
    theme: "Nabataean Rock-Cut Mausoleums", 
    desc: "Walk through deep sandstone gorges to view giant columns carved from pink bedrock.", 
    rating: "4.9", 
    region: "Asia",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 30.3285,
    lng: 35.4444
  },
  { 
    id: "dest-cusco",
    name: "Cusco", 
    country: "Peru", 
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80", 
    theme: "Inca Stonemasonry & Baroque Arches", 
    desc: "Discover cobblestone high alleys featuring colonial timber balcony structures.", 
    rating: "4.8", 
    region: "Americas",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: -13.5319,
    lng: -71.9592
  },
  { 
    id: "dest-agra",
    name: "Agra", 
    country: "India", 
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80", 
    theme: "Mughal White Marble & Pietra Dura", 
    desc: "Gaze upon the magnificent symmetrical dome honoring heritage imperial love.", 
    rating: "4.9", 
    region: "Asia",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 27.1751,
    lng: 78.0421
  },
  { 
    id: "dest-serengeti",
    name: "Serengeti National Park", 
    country: "Tanzania", 
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80", 
    theme: "Acacia Savanna Horizons", 
    desc: "Witness millions of wild fauna crossing dramatic rivers and golden open plains.", 
    rating: "4.9", 
    region: "Africa",
    budget: "Luxury",
    style: "Adventure/Active",
    lat: -2.1540,
    lng: 34.6857
  },
  { 
    id: "dest-grandcanyon",
    name: "Grand Canyon", 
    country: "United States", 
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=600&q=80", 
    theme: "Colorado Plateau Stratified Escarpments", 
    desc: "Stand on deep rust-red cliffs plummeting to roaring river waters far below.", 
    rating: "4.8", 
    region: "Americas",
    budget: "Moderate",
    style: "Adventure/Active",
    lat: 36.0544,
    lng: -112.1401
  },
  { 
    id: "dest-prague",
    name: "Prague", 
    country: "Czech Republic", 
    image: "https://images.unsplash.com/photo-1541384912274-1f7be04bf132?auto=format&fit=crop&w=600&q=80", 
    theme: "Gothic Spires & Baroque Bridges", 
    desc: "Cross medieval cobblestone arches framed by dynamic stone-sculptured saints.", 
    rating: "4.7", 
    region: "Europe",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 50.0755,
    lng: 14.4378
  },
  { 
    id: "dest-lisbon",
    name: "Lisbon", 
    country: "Portugal", 
    image: "https://images.unsplash.com/photo-1509840144524-f675f6c87f2e?auto=format&fit=crop&w=600&q=80", 
    theme: "Azulejo Tiles & Pastel Ensembles", 
    desc: "Climb steep seaside hills on winding yellow trams past beautiful ceramic murals.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Budget",
    style: "Coastal Retreat",
    lat: 38.7223,
    lng: -9.1393
  },
  { 
    id: "dest-reykjavik",
    name: "Reykjavik", 
    country: "Iceland", 
    image: "https://images.unsplash.com/photo-1504829857797-ddff28127792?auto=format&fit=crop&w=600&q=80", 
    theme: "Tectonic Basalt & Thermal Valleys", 
    desc: "Breathe fresh sea steam, dramatic black sands, and active geyser fountains.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Luxury",
    style: "Adventure/Active",
    lat: 64.1466,
    lng: -21.9426
  },
  { 
    id: "dest-vicfalls",
    name: "Victoria Falls", 
    country: "Zimbabwe", 
    image: "https://images.unsplash.com/photo-1433832597046-4f10e10ac764?auto=format&fit=crop&w=600&q=80", 
    theme: "The Smoke that Thunders Spray", 
    desc: "Exult in the world's largest falling sheet of roaring white waters.", 
    rating: "4.9", 
    region: "Africa",
    budget: "Moderate",
    style: "Adventure/Active",
    lat: -17.9243,
    lng: 25.8560
  },
  { 
    id: "dest-queenstown",
    name: "Queenstown", 
    country: "New Zealand", 
    image: "https://images.unsplash.com/photo-1589871190101-1970f3770de3?auto=format&fit=crop&w=600&q=80", 
    theme: "Glacial Ranges & Alpine Fjord Streams", 
    desc: "Engage in thrilling jetboat loops and alpine hikes across immense mountains.", 
    rating: "4.9", 
    region: "Asia",
    budget: "Luxury",
    style: "Adventure/Active",
    lat: -45.0312,
    lng: 168.6626
  },
  { 
    id: "dest-vancouver",
    name: "Vancouver", 
    country: "Canada", 
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80", 
    theme: "Pacific Rainforest & Glass Lines", 
    desc: "Stagger between coastal timber trails and slick modern tower avenues.", 
    rating: "4.7", 
    region: "Americas",
    budget: "Moderate",
    style: "Adventure/Active",
    lat: 49.2827,
    lng: -123.1207
  },
  { 
    id: "dest-hanoi",
    name: "Hanoi", 
    country: "Vietnam", 
    image: "https://images.unsplash.com/photo-1509060464153-44667396260f?auto=format&fit=crop&w=600&q=80", 
    theme: "French Balconies & Jade Lakes", 
    desc: "Sip traditional egg coffee in tree-lined alleyways overlooking serene waters.", 
    rating: "4.7", 
    region: "Asia",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 21.0285,
    lng: 105.8542
  },
  { 
    id: "dest-istanbul",
    name: "Istanbul", 
    country: "Turkey", 
    image: "https://images.unsplash.com/photo-1527838832700-50592524df7e?auto=format&fit=crop&w=600&q=80", 
    theme: "Byzantine Cupolas & Bosphorus Ferries", 
    desc: "Navigate historic imperial vaults where eastern domes meet western channels.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 41.0082,
    lng: 28.9784
  },
  { 
    id: "dest-berlin",
    name: "Berlin", 
    country: "Germany", 
    image: "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=600&q=80", 
    theme: "Industrial Concrete & Avant-Garde", 
    desc: "Tour historic border wall murals, underground club spaces, and massive parks.", 
    rating: "4.6", 
    region: "Europe",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 52.5200,
    lng: 13.4050
  },
  { 
    id: "dest-munich",
    name: "Munich", 
    country: "Germany", 
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80", 
    theme: "Neo-Gothic Town Hall & Hallen", 
    desc: "Listen to the famous Glockenspiel and celebrate legendary alpine beer cultures.", 
    rating: "4.7", 
    region: "Europe",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 48.1351,
    lng: 11.5820
  },
  { 
    id: "dest-athens",
    name: "Athens", 
    country: "Greece", 
    image: "https://images.unsplash.com/photo-1505533321630-975218a5f66f?auto=format&fit=crop&w=600&q=80", 
    theme: "Classical Doric Pillars & Plaka", 
    desc: "Climb marble temple platforms and dine on historic pedestrian hillsides.", 
    rating: "4.7", 
    region: "Europe",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 37.9838,
    lng: 23.7275
  },
  { 
    id: "dest-beijing",
    name: "Beijing", 
    country: "China", 
    image: "https://images.unsplash.com/photo-1547984609-4a74b3ad8844?auto=format&fit=crop&w=600&q=80", 
    theme: "Imperial Glazed Roofs & Courtyards", 
    desc: "Explore massive ancient fortresses and traditional courtyard alley structures.", 
    rating: "4.8", 
    region: "Asia",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 39.9042,
    lng: 116.4074
  },
  { 
    id: "dest-kathmandu",
    name: "Kathmandu", 
    country: "Nepal", 
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80", 
    theme: "Wood Carved Pagodas & Himalayan Passes", 
    desc: "Follow winding brick lanes packed with historic stone shrines and mountain climbers.", 
    rating: "4.7", 
    region: "Asia",
    budget: "Budget",
    style: "Adventure/Active",
    lat: 27.7172,
    lng: 85.3240
  },
  { 
    id: "dest-oahu",
    name: "Oahu", 
    country: "United States", 
    image: "https://images.unsplash.com/photo-1505852679233-d9fd70f4322a?auto=format&fit=crop&w=600&q=80", 
    theme: "Pacific Reef Lagoons & Volcanic Arcs", 
    desc: "Catch huge ocean swells and walk green mountain ridges below deep blue skies.", 
    rating: "4.9", 
    region: "Americas",
    budget: "Luxury",
    style: "Coastal Retreat",
    lat: 21.4389,
    lng: -158.0001
  },
  { 
    id: "dest-buenosaires",
    name: "Buenos Aires", 
    country: "Argentina", 
    image: "https://images.unsplash.com/photo-1589909202802-8f4aadceec54?auto=format&fit=crop&w=600&q=80", 
    theme: "Belle Époque Plazas & Tango Parlors", 
    desc: "Savor stellar steakhouses and stroll colored tin facades in La Boca.", 
    rating: "4.8", 
    region: "Americas",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: -34.6037,
    lng: -58.3816
  },
  { 
    id: "dest-cartagena",
    name: "Cartagena", 
    country: "Colombia", 
    image: "https://images.unsplash.com/photo-1567015577660-f655ae4ba2ee?auto=format&fit=crop&w=600&q=80", 
    theme: "Seventeenth-Century Bastions & Bougainvillea", 
    desc: "Admire beautiful golden bastions, sunset sea walks, and brightly hued villas.", 
    rating: "4.8", 
    region: "Americas",
    budget: "Moderate",
    style: "Coastal Retreat",
    lat: 10.3910,
    lng: -75.4794
  },
  { 
    id: "dest-kilimanjaro",
    name: "Mount Kilimanjaro", 
    country: "Tanzania", 
    image: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=600&q=80", 
    theme: "Glacier Cap Equatorial Peak", 
    desc: "Trek through lush cloud forests to the highest volcanic summit in Africa.", 
    rating: "4.9", 
    region: "Africa",
    budget: "Luxury",
    style: "Adventure/Active",
    lat: -3.0674,
    lng: 37.3556
  },
  { 
    id: "dest-kruger",
    name: "Kruger National Park", 
    country: "South Africa", 
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80", 
    theme: "Lowveld Safari Tracks", 
    desc: "Track leopards, wild elephants, and rhinos along scenic river scrub paths.", 
    rating: "4.8", 
    region: "Africa",
    budget: "Moderate",
    style: "Adventure/Active",
    lat: -23.9884,
    lng: 31.5547
  },
  { 
    id: "dest-zanzibar",
    name: "Zanzibar", 
    country: "Tanzania", 
    image: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=600&q=80", 
    theme: "Omani Swahili Stone Port", 
    desc: "Relax on flawless white sands and wander coral-brick palace lanes.", 
    rating: "4.8", 
    region: "Africa",
    budget: "Moderate",
    style: "Coastal Retreat",
    lat: -6.1659,
    lng: 39.1990
  },
  { 
    id: "dest-casablanca",
    name: "Casablanca", 
    country: "Morocco", 
    image: "https://images.unsplash.com/photo-1559589689-577aabd1db4f?auto=format&fit=crop&w=600&q=80", 
    theme: "Art Deco Ensembles & Sea Minarets", 
    desc: "Visit monumental seaside mosque towers and beautiful modernist arches.", 
    rating: "4.6", 
    region: "Africa",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 33.5731,
    lng: -7.5898
  },
  { 
    id: "dest-luxor",
    name: "Luxor", 
    country: "Egypt", 
    image: "https://images.unsplash.com/photo-1568326344543-7efcee85bc23?auto=format&fit=crop&w=600&q=80", 
    theme: "Valley of the Kings Hypostyle Halls", 
    desc: "Walk beneath towering giant stone columns and admire deep pharaoh crypts.", 
    rating: "4.9", 
    region: "Africa",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 25.6872,
    lng: 32.6396
  },
  { 
    id: "dest-nairobi",
    name: "Nairobi", 
    country: "Kenya", 
    image: "https://images.unsplash.com/photo-1489440543227-a15fa35344e7?auto=format&fit=crop&w=600&q=80", 
    theme: "Highland Savanna & Tech Hubs", 
    desc: "Spot herds roaming freely in front of a modern city horizon line.", 
    rating: "4.7", 
    region: "Africa",
    budget: "Budget",
    style: "Adventure/Active",
    lat: -1.2921,
    lng: 36.8219
  },
  { 
    id: "dest-mauritius",
    name: "Mauritius", 
    country: "Mauritius", 
    image: "https://images.unsplash.com/photo-1589979482847-18c2dbab3308?auto=format&fit=crop&w=600&q=80", 
    theme: "Oceanic Coral Barriers & Basalt Peaks", 
    desc: "Bathe in warm green lagoons and hike peaks wrapped in thick jungle canopy.", 
    rating: "4.8", 
    region: "Africa",
    budget: "Luxury",
    style: "Coastal Retreat",
    lat: -20.3484,
    lng: 57.5522
  },
  { 
    id: "dest-seychelles",
    name: "Seychelles", 
    country: "Seychelles", 
    image: "https://images.unsplash.com/photo-1589979482847-18c2dbab3308?auto=format&fit=crop&w=600&q=80", 
    theme: "Sculpted Granite Cliffs & Sands", 
    desc: "Bask on legendary beaches featuring giant weathered obsidian boulders.", 
    rating: "4.9", 
    region: "Africa",
    budget: "Luxury",
    style: "Coastal Retreat",
    lat: -4.6796,
    lng: 55.4920
  },
  { 
    id: "dest-madagascar",
    name: "Madagascar", 
    country: "Madagascar", 
    image: "https://images.unsplash.com/photo-1537162998323-3d3675e0e87c?auto=format&fit=crop&w=600&q=80", 
    theme: "Giant Baobab Avenues & Shallows", 
    desc: "Behold monumental ancient trees and spot rare endemic lemur species.", 
    rating: "4.7", 
    region: "Africa",
    budget: "Moderate",
    style: "Adventure/Active",
    lat: -18.7669,
    lng: 46.8691
  },
  { 
    id: "dest-dahab",
    name: "Dahab", 
    country: "Egypt", 
    image: "https://images.unsplash.com/photo-1623194095759-83c748259fde?auto=format&fit=crop&w=600&q=80", 
    theme: "Sinai Desert Reef & Blue Hole Clefts", 
    desc: "Dive spectacular deep marine drop-offs where high desert meets turquoise sea.", 
    rating: "4.8", 
    region: "Africa",
    budget: "Budget",
    style: "Coastal Retreat",
    lat: 28.5024,
    lng: 34.5161
  },
  { 
    id: "dest-alexand",
    name: "Alexandria", 
    country: "Egypt", 
    image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=600&q=80", 
    theme: "Ptolemaic Coast & Roman Ampitheaters", 
    desc: "Explore scenic Mediterranean castle bays and majestic sub-aquatic ruins.", 
    rating: "4.6", 
    region: "Africa",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 31.2001,
    lng: 29.9187
  },
  { 
    id: "dest-carthage",
    name: "Carthage", 
    country: "Tunisia", 
    image: "https://images.unsplash.com/photo-1580256082443-8401312330a1?auto=format&fit=crop&w=600&q=80", 
    theme: "Punic Antiquities & Blue Villas", 
    desc: "Walk Roman thermal bath foundations and enjoy scenic white-and-blue alleys.", 
    rating: "4.7", 
    region: "Africa",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 36.8583,
    lng: 10.3313
  },
  { 
    id: "dest-lalibela",
    name: "Lalibela", 
    country: "Ethiopia", 
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80", 
    theme: "Monolithic Rock-Cut Basilicas", 
    desc: "Observe subterranean cruciform temples carved directly from dry red tufa rock.", 
    rating: "4.8", 
    region: "Africa",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 12.0319,
    lng: 39.0412
  },
  { 
    id: "dest-joburg",
    name: "Johannesburg", 
    country: "South Africa", 
    image: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=600&q=80", 
    theme: "Apartheid Historic Halls & Urban Art", 
    desc: "Stroll vibrant districts packed with graffiti, craft hubs, and cultural galleries.", 
    rating: "4.6", 
    region: "Africa",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: -26.2041,
    lng: 28.0473
  },
  { 
    id: "dest-chefchaouen",
    name: "Chefchaouen", 
    country: "Morocco", 
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80", 
    theme: "Rif Mountain Indigo Plasters", 
    desc: "Capture striking azure pathways, narrow staircases, and Spanish mosques.", 
    rating: "4.8", 
    region: "Africa",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 35.1688,
    lng: -5.2636
  },
  { 
    id: "dest-masaimara",
    name: "Masai Mara", 
    country: "Kenya", 
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80", 
    theme: "Savanna Mara River crossings", 
    desc: "Spot lions, wildebeests, and vibrant birds on a classic East African safari.", 
    rating: "4.9", 
    region: "Africa",
    budget: "Luxury",
    style: "Adventure/Active",
    lat: -1.5271,
    lng: 35.1919
  },
  { 
    id: "dest-essaouira",
    name: "Essaouira", 
    country: "Morocco", 
    image: "https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=600&q=80", 
    theme: "Wind-Swept Stone Bastions & Bays", 
    desc: "Walk along majestic fortified sea parapets and watch colorful fishing boats.", 
    rating: "4.7", 
    region: "Africa",
    budget: "Budget",
    style: "Coastal Retreat",
    lat: 31.5125,
    lng: -9.7700
  },
  { 
    id: "dest-giza",
    name: "Giza", 
    country: "Egypt", 
    image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80", 
    theme: "Great Sphinx & Limestone Pyramids", 
    desc: "Walk through colossal desert monuments dating back over four millennia.", 
    rating: "4.8", 
    region: "Africa",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 29.9765,
    lng: 31.1313
  },
  { 
    id: "dest-kilifi",
    name: "Kilifi", 
    country: "Kenya", 
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80", 
    theme: "Indian Ocean Wild Mangroves", 
    desc: "Paddleboard through tropical estuaries and unwind on soft sand coves.", 
    rating: "4.7", 
    region: "Africa",
    budget: "Moderate",
    style: "Coastal Retreat",
    lat: -3.6307,
    lng: 39.8499
  },
  { 
    id: "dest-windhoek",
    name: "Windhoek", 
    country: "Namibia", 
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=600&q=80", 
    theme: "Germanic spires & Kalahari Gateways", 
    desc: "Tour pastel peak mansions and start epic safaris toward Namib wind dunes.", 
    rating: "4.6", 
    region: "Africa",
    budget: "Moderate",
    style: "Adventure/Active",
    lat: -22.5609,
    lng: 17.0658
  },
  { 
    id: "dest-reunion",
    name: "Reunion Island", 
    country: "France", 
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=600&q=80", 
    theme: "Volcanic Calderas & Rainforest Chasms", 
    desc: "Hike deep, jade tropical valleys that drop into crashing Indian Ocean waves.", 
    rating: "4.8", 
    region: "Africa",
    budget: "Luxury",
    style: "Adventure/Active",
    lat: -21.1151,
    lng: 55.5364
  },
  { 
    id: "dest-dakhla",
    name: "Dakhla", 
    country: "Morocco", 
    image: "https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=600&q=80", 
    theme: "Sahara Sand Dunes Meets Atlantic", 
    desc: "Surf under constant winds where desert mountains slope into turquoise lagoons.", 
    rating: "4.8", 
    region: "Africa",
    budget: "Moderate",
    style: "Coastal Retreat",
    lat: 23.6848,
    lng: -15.9579
  },
  { 
    id: "dest-osaka",
    name: "Osaka", 
    country: "Japan", 
    image: "https://images.unsplash.com/photo-1590253457194-e8aa6d3f2ec4?auto=format&fit=crop&w=600&q=80", 
    theme: "Dotonbori Neon & Culinary Grids", 
    desc: "Indulge in delicious local food stalls under flashing giant mechanical crabs.", 
    rating: "4.8", 
    region: "Asia",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 34.6937,
    lng: 135.5023
  },
  { 
    id: "dest-mumbai",
    name: "Mumbai", 
    country: "India", 
    image: "https://images.unsplash.com/photo-1562151624-9132e01df82f?auto=format&fit=crop&w=600&q=80", 
    theme: "Victorian Gothic Forts & Arabian Shore", 
    desc: "Admire magnificent seaside stonemason arch landmarks and busy terminal halls.", 
    rating: "4.7", 
    region: "Asia",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 19.0760,
    lng: 72.8777
  },
  { 
    id: "dest-goa",
    name: "Goa", 
    country: "India", 
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80", 
    theme: "Portuguese Villas & Golden Shallows", 
    desc: "Stroll beautiful pastel chapels, palm plantations, and peaceful coastal coves.", 
    rating: "4.7", 
    region: "Asia",
    budget: "Budget",
    style: "Coastal Retreat",
    lat: 15.2993,
    lng: 74.1240
  },
  { 
    id: "dest-shanghai",
    name: "Shanghai", 
    country: "China", 
    image: "https://images.unsplash.com/photo-1538330621152-4786a5b7a1d1?auto=format&fit=crop&w=600&q=80", 
    theme: "Art Deco Bund & Pudong Neon", 
    desc: "Stroll the historic riverside walk looking across to immense soaring neon spheres.", 
    rating: "4.8", 
    region: "Asia",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 31.2304,
    lng: 121.4737
  },
  { 
    id: "dest-hongkong",
    name: "Hong Kong", 
    country: "China", 
    image: "https://images.unsplash.com/photo-1506970845246-18f21d533b20?auto=format&fit=crop&w=600&q=80", 
    theme: "Victoria Peak Skyrails & Harbor Bays", 
    desc: "Hop on the legendary green star ferries past towering skyscraper cliffs.", 
    rating: "4.9", 
    region: "Asia",
    budget: "Luxury",
    style: "Coastal Retreat",
    lat: 22.3193,
    lng: 114.1694
  },
  { 
    id: "dest-taipei",
    name: "Taipei", 
    country: "Taiwan", 
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80", 
    theme: "Taoist Shrines & Night Markets", 
    desc: "Sample delicious steamy dumplings below beautiful red paper lanterns.", 
    rating: "4.8", 
    region: "Asia",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 25.0330,
    lng: 121.5654
  },
  { 
    id: "dest-kl",
    name: "Kuala Lumpur", 
    country: "Malaysia", 
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc1f40d8?auto=format&fit=crop&w=600&q=80", 
    theme: "Neo-Futurist Twin Spires & Batu Caves", 
    desc: "Climb huge rainbow staircases into gargantuan limestone temple cave chambers.", 
    rating: "4.7", 
    region: "Asia",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 3.1390,
    lng: 101.6869
  },
  { 
    id: "dest-maldives",
    name: "Maldives", 
    country: "Maldives", 
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80", 
    theme: "Overwater Bungalows & Reef Cays", 
    desc: "Relax in overwater cabins above incredibly clear, glowing turquoise shallows.", 
    rating: "4.9", 
    region: "Asia",
    budget: "Luxury",
    style: "Coastal Retreat",
    lat: 3.2028,
    lng: 73.2207
  },
  { 
    id: "dest-phuket",
    name: "Phuket", 
    country: "Thailand", 
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80", 
    theme: "Karst Rock Lagoons & Palm Sands", 
    desc: "Sail past sharp limestone pillars emerging from the blue Andaman Sea.", 
    rating: "4.7", 
    region: "Asia",
    budget: "Budget",
    style: "Coastal Retreat",
    lat: 7.8804,
    lng: 98.3922
  },
  { 
    id: "dest-chiangmai",
    name: "Chiang Mai", 
    country: "Thailand", 
    image: "https://images.unsplash.com/photo-1598977123418-45f04b016823?auto=format&fit=crop&w=600&q=80", 
    theme: "Teak Temples & Cloud Forests", 
    desc: "Discover beautiful hand-carved mountainside monasteries and elephant reserves.", 
    rating: "4.8", 
    region: "Asia",
    budget: "Budget",
    style: "Adventure/Active",
    lat: 18.7883,
    lng: 98.9853
  },
  { 
    id: "dest-siemreap",
    name: "Siem Reap", 
    country: "Cambodia", 
    image: "https://images.unsplash.com/photo-1561053720-76cd73ff22c3?auto=format&fit=crop&w=600&q=80", 
    theme: "Khmer Stone Towers & Roots", 
    desc: "Wander vast ruined temple corridors where giant tree roots overlap stone faces.", 
    rating: "4.9", 
    region: "Asia",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 13.3633,
    lng: 103.8564
  },
  { 
    id: "dest-manila",
    name: "Manila", 
    country: "Philippines", 
    image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=600&q=80", 
    theme: "Intramuros Spanish Bastions", 
    desc: "Inspect majestic brick churches and beautiful stone fortresses inside a busy capital.", 
    rating: "4.6", 
    region: "Asia",
    budget: "Budget",
    style: "Coastal Retreat",
    lat: 14.5995,
    lng: 120.9842
  },
  { 
    id: "dest-jaipur",
    name: "Jaipur", 
    country: "India", 
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80", 
    theme: "Rajput Pink Lattice Windows", 
    desc: "Inspect majestic wind palaces carved of honeyed pink sandstone.", 
    rating: "4.8", 
    region: "Asia",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 26.9124,
    lng: 75.7873
  },
  { 
    id: "dest-delhi",
    name: "Delhi", 
    country: "India", 
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80", 
    theme: "Mughal Minarets & Red Fort Sandstone", 
    desc: "Navigate grand gate memorials, ancient victory towers, and lively markets.", 
    rating: "4.8", 
    region: "Asia",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 28.6139,
    lng: 77.2090
  },
  { 
    id: "dest-lhasa",
    name: "Lhasa", 
    country: "Tibet", 
    image: "https://images.unsplash.com/photo-1524316041303-3ca64f6b2b73?auto=format&fit=crop&w=600&q=80", 
    theme: "Potala White Fortress & Spires", 
    desc: "Marvel at towering mountainside palace structures under deep blue skies.", 
    rating: "4.9", 
    region: "Asia",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 29.6524,
    lng: 91.1172
  },
  { 
    id: "dest-sf",
    name: "San Francisco", 
    country: "United States", 
    image: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=600&q=80", 
    theme: "Artistic Cables & Golden Gate Span", 
    desc: "Ride historic wooden cable cars over epic coastal foggy straits.", 
    rating: "4.8", 
    region: "Americas",
    budget: "Luxury",
    style: "Coastal Retreat",
    lat: 37.7749,
    lng: -122.4194
  },
  { 
    id: "dest-la",
    name: "Los Angeles", 
    country: "United States", 
    image: "https://images.unsplash.com/photo-1580655653885-65763b2597ad?auto=format&fit=crop&w=600&q=80", 
    theme: "Pacific Promenade & Hollywood Hills", 
    desc: "Ride past towering palms along sweeping beaches and iconic modern slopes.", 
    rating: "4.7", 
    region: "Americas",
    budget: "Luxury",
    style: "Coastal Retreat",
    lat: 34.0522,
    lng: -118.2437
  },
  { 
    id: "dest-chicago",
    name: "Chicago", 
    country: "United States", 
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80", 
    theme: "Parametric Steel Clouds & Skyscrapers", 
    desc: "Admire legendary modernist steel arches along breathtaking Michigan channel views.", 
    rating: "4.7", 
    region: "Americas",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 41.8781,
    lng: -87.6298
  },
  { 
    id: "dest-miami",
    name: "Miami", 
    country: "United States", 
    image: "https://images.unsplash.com/photo-1514214246283-d442a4e2e9cd?auto=format&fit=crop&w=600&q=80", 
    theme: "Neon Pastel Art Deco & Palms", 
    desc: "Stroll scenic beach paths edged by retro marine-style architectures.", 
    rating: "4.7", 
    region: "Americas",
    budget: "Moderate",
    style: "Coastal Retreat",
    lat: 25.7617,
    lng: -80.1918
  },
  { 
    id: "dest-toronto",
    name: "Toronto", 
    country: "Canada", 
    image: "https://images.unsplash.com/photo-1507992781348-3102450a5ada?auto=format&fit=crop&w=600&q=80", 
    theme: "Modernist Needle & Harbor Parks", 
    desc: "Explore dynamic lakefront gardens, museums, and high tower viewpoints.", 
    rating: "4.7", 
    region: "Americas",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 43.6532,
    lng: -79.3832
  },
  { 
    id: "dest-montreal",
    name: "Montreal", 
    country: "Canada", 
    image: "https://images.unsplash.com/photo-1519112232436-9923c6192a53?auto=format&fit=crop&w=600&q=80", 
    theme: "French Cobblestones & Copper Spires", 
    desc: "Wander historic old ports, neoclassical basilicas, and leafy park climbs.", 
    rating: "4.7", 
    region: "Americas",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 45.5017,
    lng: -73.5673
  },
  { 
    id: "dest-oaxaca",
    name: "Oaxaca", 
    country: "Mexico", 
    image: "https://images.unsplash.com/photo-1465256410760-104859096821?auto=format&fit=crop&w=600&q=80", 
    theme: "Zapotec Ruins & Colored Courtyards", 
    desc: "Wander ancient mountaintop temple grids and taste world-class culinary crafts.", 
    rating: "4.8", 
    region: "Americas",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 17.0732,
    lng: -96.7266
  },
  { 
    id: "dest-cancun",
    name: "Cancun", 
    country: "Mexico", 
    image: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=600&q=80", 
    theme: "Mayan Reef Pyramids & Turquoise Waves", 
    desc: "Discover beautiful ancient seaside lookouts and glowing coral lagoons.", 
    rating: "4.7", 
    region: "Americas",
    budget: "Moderate",
    style: "Coastal Retreat",
    lat: 21.1619,
    lng: -86.8515
  },
  { 
    id: "dest-havana",
    name: "Havana", 
    country: "Cuba", 
    image: "https://images.unsplash.com/photo-1569074187119-c87815b476da?auto=format&fit=crop&w=600&q=80", 
    theme: "Moorish Baroque & Colored Plasters", 
    desc: "Ride retro convertibles past peeling pastel facades and sea bastions.", 
    rating: "4.7", 
    region: "Americas",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 23.1136,
    lng: -82.3666
  },
  { 
    id: "dest-galapagos",
    name: "Galapagos Islands", 
    country: "Ecuador", 
    image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=600&q=80", 
    theme: "Volcanic Calderas & Exotic Wildlife", 
    desc: "Snorkel alongside sea lions, ancient giant tortoises, and blue-footed birds.", 
    rating: "4.9", 
    region: "Americas",
    budget: "Luxury",
    style: "Adventure/Active",
    lat: -0.9538,
    lng: -90.9656
  },
  { 
    id: "dest-patagonia",
    name: "Patagonia", 
    country: "Argentina", 
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=600&q=80", 
    theme: "Steep Granite Pillars & Glacier Walls", 
    desc: "Hike alpine lakes nestled below immense, jagged wind-swept stone ridges.", 
    rating: "4.9", 
    region: "Americas",
    budget: "Luxury",
    style: "Adventure/Active",
    lat: -50.2974,
    lng: -72.6391
  },
  { 
    id: "dest-banff",
    name: "Banff", 
    country: "Canada", 
    image: "https://images.unsplash.com/photo-1483168527879-c66136b56105?auto=format&fit=crop&w=600&q=80", 
    theme: "Rocky Mountain Emerald Pools", 
    desc: "Canoe on glowing glacier basins encircled by sheer evergreen slopes.", 
    rating: "4.9", 
    region: "Americas",
    budget: "Luxury",
    style: "Adventure/Active",
    lat: 51.1784,
    lng: -115.5708
  },
  { 
    id: "dest-costarica",
    name: "Costa Rica", 
    country: "Costa Rica", 
    image: "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=600&q=80", 
    theme: "Mist Canopy Jungle & Volcanic Gorges", 
    desc: "Traverse high suspension bridges in forests populated by sloths and toucans.", 
    rating: "4.8", 
    region: "Americas",
    budget: "Moderate",
    style: "Adventure/Active",
    lat: 9.7489,
    lng: -83.7534
  },
  { 
    id: "dest-quebec",
    name: "Quebec City", 
    country: "Canada", 
    image: "https://images.unsplash.com/photo-1524022410191-1ca213bf9ece?auto=format&fit=crop&w=600&q=80", 
    theme: "Seventeenth-Century Bastions & Castle Spires", 
    desc: "Walk stone ramparts and pass gorgeous historic gabled boutiques.", 
    rating: "4.8", 
    region: "Americas",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 46.8139,
    lng: -71.2082
  },
  { 
    id: "dest-florence",
    name: "Florence", 
    country: "Italy", 
    image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=600&q=80", 
    theme: "Brunelleschi Terracotta & Renaissance Panels", 
    desc: "Gaze upon grand duomo cupolas and masterpiece galleries along the Arno River.", 
    rating: "4.9", 
    region: "Europe",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 43.7696,
    lng: 11.2558
  },
  { 
    id: "dest-dublin",
    name: "Dublin", 
    country: "Ireland", 
    image: "https://images.unsplash.com/photo-1549918830-11ec22b64f2a?auto=format&fit=crop&w=600&q=80", 
    theme: "Georgian Porticos & Vintage Libraries", 
    desc: "Tour brick universities, majestic arched book vaults, and traditional pubs.", 
    rating: "4.7", 
    region: "Europe",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 53.3498,
    lng: -6.2603
  },
  { 
    id: "dest-edinburgh",
    name: "Edinburgh", 
    country: "United Kingdom", 
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=600&q=80", 
    theme: "Volcanic Crags & Medieval Castle Steeps", 
    desc: "Traverse high stone volcanic spurs, historic royal miles, and cozy inns.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 55.9533,
    lng: -3.1883
  },
  { 
    id: "dest-madrid",
    name: "Madrid", 
    country: "Spain", 
    image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=600&q=80", 
    theme: "Bourbon Palace Vistas & Prado", 
    desc: "Walk grand central plazas, baroque palaces, and world-class canvas archives.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 40.4168,
    lng: -3.7038
  },
  { 
    id: "dest-vienna",
    name: "Vienna", 
    country: "Austria", 
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80", 
    theme: "Habsburg Baroque Palaces & Concertos", 
    desc: "Admire magnificent imperial residences and legendary music hall complexes.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 48.2082,
    lng: 16.3738
  },
  { 
    id: "dest-budapest",
    name: "Budapest", 
    country: "Hungary", 
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80", 
    theme: "Neo-Gothic Parliament & Bath Domes", 
    desc: "Soak in steam vaults looking over massive golden river castles.", 
    rating: "4.7", 
    region: "Europe",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 47.4979,
    lng: 19.0402
  },
  { 
    id: "dest-dubrovnik",
    name: "Dubrovnik", 
    country: "Croatia", 
    image: "https://images.unsplash.com/photo-1555992336-03a23c7b20eb?auto=format&fit=crop&w=600&q=80", 
    theme: "Gothic-Renaissance Shore Ramparts", 
    desc: "Walk stone barricades looking out across clean, shining blue sea expanses.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Moderate",
    style: "Coastal Retreat",
    lat: 42.6507,
    lng: 18.0944
  },
  { 
    id: "dest-geneva",
    name: "Geneva", 
    country: "Switzerland", 
    image: "https://images.unsplash.com/photo-1532054013054-d8aa4a8f96e2?auto=format&fit=crop&w=600&q=80", 
    theme: "Alpine Lakefront & Clockwork Hubs", 
    desc: "Stroll beautiful lakeside parks with massive mountain peaks in the distance.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Luxury",
    style: "Cultural Explorer",
    lat: 46.2044,
    lng: 6.1432
  },
  { 
    id: "dest-copenhagen",
    name: "Copenhagen", 
    country: "Denmark", 
    image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=600&q=80", 
    theme: "Nyhavn Pastel Towns & Water Loops", 
    desc: "Paddleboard through clean channels edged by beautiful antique wooden ships.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Luxury",
    style: "Coastal Retreat",
    lat: 55.6761,
    lng: 12.5683
  },
  { 
    id: "dest-stockholm",
    name: "Stockholm", 
    country: "Sweden", 
    image: "https://images.unsplash.com/photo-1509840144524-f675f6c87f2e?auto=format&fit=crop&w=600&q=80", 
    theme: "Gamla Stan Ochre Gables", 
    desc: "Traverse narrow cobble lanes lined with medieval orange and gold palaces.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Luxury",
    style: "Coastal Retreat",
    lat: 59.3293,
    lng: 18.0686
  },
  { 
    id: "dest-oslo",
    name: "Oslo", 
    country: "Norway", 
    image: "https://images.unsplash.com/photo-1510137600163-2729bc695ac1?auto=format&fit=crop&w=600&q=80", 
    theme: "Fjord-Facing Operas & Nordic Lines", 
    desc: "Tour striking glass architecture, Viking ship vaults, and harbor parks.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Luxury",
    style: "Adventure/Active",
    lat: 59.9139,
    lng: 10.7522
  },
  { 
    id: "dest-brussels",
    name: "Brussels", 
    country: "Belgium", 
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80", 
    theme: "Baroque Guildhouses & Art Nouveau", 
    desc: "Gaze upon spectacular gold leaf plaza halls and enjoy gourmet sweet waffles.", 
    rating: "4.7", 
    region: "Europe",
    budget: "Moderate",
    style: "Cultural Explorer",
    lat: 50.8503,
    lng: 4.3517
  },
  { 
    id: "dest-nice",
    name: "Nice", 
    country: "France", 
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80", 
    theme: "Promenade Des Anglais & Ochre Alleys", 
    desc: "Walk along sweeping azure shores backed by mountain cliffs and palms.", 
    rating: "4.8", 
    region: "Europe",
    budget: "Moderate",
    style: "Coastal Retreat",
    lat: 43.7102,
    lng: 7.2620
  },
  { 
    id: "dest-krakow",
    name: "Krakow", 
    country: "Poland", 
    image: "https://images.unsplash.com/photo-1580879008933-289b48b7fe8a?auto=format&fit=crop&w=600&q=80", 
    theme: "Renaissance Castles & Wood Altars", 
    desc: "Observe immense medieval stone market halls and historic castle fortresses.", 
    rating: "4.7", 
    region: "Europe",
    budget: "Budget",
    style: "Cultural Explorer",
    lat: 50.0647,
    lng: 19.9450
  }
];

// Curated list of tourist attractions and landmarks for destination exploration
const CITY_ATTRACTIONS: Record<string, { name: string; lat: number; lng: number; desc: string; }[]> = {
  "Kyoto": [
    { name: "Kinkaku-ji (Golden Pavilion)", lat: 35.0394, lng: 135.7292, desc: "A magnificent Zen temple completely covered in pure gold leaf." },
    { name: "Fushimi Inari-taisha", lat: 34.9671, lng: 135.7727, desc: "An iconic path framed by over 10,000 brilliant red torii gates." },
    { name: "Kiyomizu-dera Temple", lat: 34.9949, lng: 135.7850, desc: "Centuries-old wooden temple pavilion with a scenic hillside veranda." }
  ],
  "Rome": [
    { name: "Colosseum", lat: 41.8902, lng: 12.4922, desc: "The legendary stone amphitheater of Imperial Rome." },
    { name: "Trevi Fountain", lat: 41.9009, lng: 12.4833, desc: "Stunning baroque masterwork with cascading blue mineral waters." },
    { name: "Pantheon", lat: 41.8986, lng: 12.4769, desc: "State monument boasting the world's largest unreinforced concrete dome." }
  ],
  "Santorini": [
    { name: "Oia Castle Lookout", lat: 36.4632, lng: 25.3740, desc: "Unmatched high point overlooking sapphire caldera domes." },
    { name: "Red Beach Cliffs", lat: 36.3481, lng: 25.3949, desc: "Dramatic iron-red sea cliffs framed by clear turquoise tides." }
  ],
  "Swiss Alps": [
    { name: "Zermatt Valley Trail", lat: 46.0207, lng: 7.7491, desc: "Pine forests and glacier pathways below the mighty Matterhorn peak." },
    { name: "Lauterbrunnen Falls", lat: 46.5935, lng: 7.9090, desc: "Secluded alpine valley featuring 72 crashing water cascades." }
  ],
  "Machu Picchu": [
    { name: "Temple of the Sun", lat: -13.1643, lng: -72.5441, desc: "Semicircular elite masonry work aligning with solstice sun rays." },
    { name: "The Intihuatana Stone", lat: -13.1633, lng: -72.5458, desc: "Sacred astronomic monolith crafted directly from Andean peak bedrock." }
  ],
  "Cairo": [
    { name: "Great Pyramid of Giza", lat: 29.9792, lng: 31.1342, desc: "Ancient wonder of stone blocks constructed for Pharaoh Khufu." },
    { name: "The Great Sphinx", lat: 29.9753, lng: 31.1376, desc: "Monolithic limestone statue depicting a mythical couchant lion with a pharaoh's face." },
    { name: "Khan el-Khalili Bazaar", lat: 30.0478, lng: 31.2625, desc: "Vibrant medieval souk alive with spices, lamps, and metalwork artisans." }
  ],
  "Sydney": [
    { name: "Sydney Opera House", lat: -33.8568, lng: 151.2153, desc: "Modern architectural masterwork with dramatic concrete sails." },
    { name: "Sydney Harbour Bridge", lat: -33.8523, lng: 151.2108, desc: "Scenic steel arch structure providing panoramic bay walkways." }
  ],
  "Cape Town": [
    { name: "Table Mountain Cableway", lat: -33.9614, lng: 18.4032, desc: "Climb deep clouds to views over Atlantic bays." },
    { name: "Boulders Penguins Beach", lat: -34.1971, lng: 18.4611, desc: "National reserve boasting colonies of small nesting African jackass penguins." }
  ],
  "Delhi": [
    { name: "India Gate", lat: 28.6129, lng: 77.2295, desc: "Sovereign stone memorial arch commemorating fallen historical soldiers." },
    { name: "Red Fort", lat: 28.6562, lng: 77.2410, desc: "Magnificent red sandstone imperial citadel built by Shah Jahan." },
    { name: "Qutub Minar", lat: 28.5244, lng: 77.1855, desc: "Ancient 73-meter brick victory tower and historical complex." },
    { name: "Lotus Temple", lat: 28.5535, lng: 77.2588, desc: "Aesthetic petal-shaped Baha'i temple of universal silence and prayer." }
  ]
};

export default function App() {
  // Navigation tabs: 'dashboard' | 'explorer' | 'planner' | 'heritage' | 'safety' | 'blogs'
  const [activeTab, setActiveTab] = useState<"dashboard" | "explorer" | "planner" | "heritage" | "safety" | "blogs">("dashboard");
  
  // Popular Carousel Index
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Destination Explorer Search & Filter States
  const [expSearch, setExpSearch] = useState("");
  const [expRegion, setExpRegion] = useState("All");
  const [expBudget, setExpBudget] = useState("All");
  const [expStyle, setExpStyle] = useState("All");
  const [selectedExplorerDest, setSelectedExplorerDest] = useState<string | null>(null);

  // Persistent State (localstorage fallbacks)
  const [savedTrips, setSavedTrips] = useState<Itinerary[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);

  // Loaded Application States
  const [plannerDestination, setPlannerDestination] = useState("");
  const [plannerDays, setPlannerDays] = useState(3);
  const [plannerBudget, setPlannerBudget] = useState("Moderate / Balanced");
  const [plannerStyle, setPlannerStyle] = useState("Cultural Explorer");
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(DEFAULT_ITINERARY);
  const [plannerLoading, setPlannerLoading] = useState(false);

  // Heritage State
  const [heritageQuery, setHeritageQuery] = useState("");
  const [currentHeritage, setCurrentHeritage] = useState<HeritageTour | null>(DEFAULT_HERITAGE);
  const [heritageLoading, setHeritageLoading] = useState(false);

  // Safety State
  const [safetySearch, setSafetySearch] = useState("Paris, France");
  const [currentSafety, setCurrentSafety] = useState<SafetyAnalysis | null>(null);
  const [safetyLoading, setSafetyLoading] = useState(false);

  // Blog creation state (available to Registered Traveler)
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDest, setBlogDest] = useState("");
  const [blogTheme, setBlogTheme] = useState("Hidden Gems");
  const [blogContent, setBlogContent] = useState("");
  const [blogAssisting, setBlogAssisting] = useState(false);

  // AI Prediction error reporting state
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Initialize and load persistent saved trips
  useEffect(() => {
    try {
      const stored = localStorage.getItem("odyssey_saved_trips");
      if (stored) {
        setSavedTrips(JSON.parse(stored));
      }
    } catch (_) {}
  }, []);

  // Save trips to local storage
  const handleSaveTrip = () => {
    if (!currentItinerary) return;
    const newTrip = {
      ...currentItinerary,
      id: `trip-${Date.now()}`
    };
    const updated = [...savedTrips, newTrip];
    setSavedTrips(updated);
    try {
      localStorage.setItem("odyssey_saved_trips", JSON.stringify(updated));
    } catch (_) {}
  };

  const handleDeleteTrip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTrips.filter(t => t.id !== id);
    setSavedTrips(updated);
    try {
      localStorage.setItem("odyssey_saved_trips", JSON.stringify(updated));
    } catch (_) {}
  };

  /* ==========================================================================
   FORM REQUEST HANDLERS
   ========================================================================== */
  const triggerItineraryGeneration = async (dest: string, daysVal: number, budgetVal: string, styleVal: string) => {
    if (!dest || !dest.trim()) return;
    setPlannerLoading(true);
    setPredictionError(null);

    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: dest,
          days: daysVal,
          budget: budgetVal,
          travelStyle: styleVal
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to reach API server.`);
      const data = await res.json();
      if (data._isFallback) {
        setPredictionError(`AI Destination Planner fallback active for "${dest}": ${data._errorMsg}`);
      }
      setCurrentItinerary(data);
    } catch (err: any) {
      console.error(err);
      setPredictionError(err?.message || String(err));
    } finally {
      setPlannerLoading(false);
    }
  };

  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerItineraryGeneration(plannerDestination, plannerDays, plannerBudget, plannerStyle);
  };

  const handleFetchHeritage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heritageQuery.trim()) return;
    setHeritageLoading(true);
    setPredictionError(null);

    try {
      const res = await fetch("/api/virtual-heritage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName: heritageQuery })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to reach Virtual Heritage server.`);
      const data = await res.json();
      if (data._isFallback) {
        setPredictionError(`Virtual Heritage Explorer fallback active for "${heritageQuery}": ${data._errorMsg}`);
      }
      setCurrentHeritage(data);
    } catch (err: any) {
      console.error(err);
      setPredictionError(err?.message || String(err));
    } finally {
      setHeritageLoading(false);
    }
  };

  const handleFetchSafety = async (e?: React.FormEvent, searchName?: string) => {
    if (e) e.preventDefault();
    const queryTerm = searchName || safetySearch;
    if (!queryTerm.trim()) return;
    setSafetyLoading(true);
    setPredictionError(null);

    try {
      const res = await fetch("/api/safety-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: queryTerm })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to reach Safety Analytics server.`);
      const data = await res.json();
      if (data._isFallback) {
        setPredictionError(`Safety & Scam Advisor fallback active for "${queryTerm}": ${data._errorMsg}`);
      }
      setCurrentSafety(data);
    } catch (err: any) {
      console.error(err);
      // Don't show prediction error for the default initial boot key load
      if (searchName !== "Paris, France" || (err?.message && !err.message.includes("404"))) {
        setPredictionError(err?.message || String(err));
      }
    } finally {
      setSafetyLoading(false);
    }
  };

  // Run initial safety analysis for Paris on boot
  useEffect(() => {
    handleFetchSafety(undefined, "Paris, France");
  }, []);

  const handleAIBlogAssist = async () => {
    if (!blogDest) return;
    setBlogAssisting(true);
    setPredictionError(null);

    try {
      const res = await fetch("/api/blog-assistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: blogTheme, destination: blogDest })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to reach AI Content Generation server.`);
      const data = await res.json();
      if (data._isFallback) {
        setPredictionError(`AI Content Generation fallback active for "${blogDest}": ${data._errorMsg}`);
      }
      setBlogTitle(data.title || `Postcards from ${blogDest}`);
      setBlogContent(data.content || "");
    } catch (err: any) {
      console.error(err);
      setPredictionError(err?.message || String(err));
    } finally {
      setBlogAssisting(false);
    }
  };

  const handlePublishBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogContent) return;

    const newPost: BlogPost = {
      id: `blog-${Date.now()}`,
      title: blogTitle,
      author: "Authentic Explorer (You)",
      date: "Today",
      content: blogContent,
      tags: [blogDest || "Wanderlust", blogTheme || "Adventures"],
      imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
      likes: 1
    };

    setBlogs([newPost, ...blogs]);
    setBlogTitle("");
    setBlogContent("");
    setBlogDest("");
  };

  const handlePresetClick = (dest: string, style: string) => {
    setPlannerDestination(dest);
    setPlannerStyle(style);
    setActiveTab("planner");
    triggerItineraryGeneration(dest, plannerDays, plannerBudget, style);
  };

  const handleHeritageSpotlightClick = async (site: string) => {
    setHeritageQuery(site);
    setActiveTab("heritage");
    setHeritageLoading(true);
    try {
      const res = await fetch("/api/virtual-heritage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName: site })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentHeritage(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHeritageLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col selection:bg-secondary-fixed selection:text-primary">
      
      {/* GLOBAL SYSTEM BAR / BRAND LINE */}
      <header className="sticky top-0 z-50 bg-white/75 backdrop-blur-xl border-b border-white/20 shadow-[0px_4px_20px_rgba(15,76,129,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <span className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[#00355f] cursor-pointer" onClick={() => setActiveTab("dashboard")}>
              ODYSSEY
            </span>
            <div className="hidden lg:flex items-center gap-1 bg-secondary-container/10 px-2.5 py-1 rounded-full border border-secondary/15">
              <span className="material-symbols-outlined text-[12px] text-[#006a61] font-bold">★</span>
              <span className="text-[10px] font-mono font-bold text-[#006a61] uppercase tracking-wider">AI Intelligent Tourism Suite</span>
            </div>
          </div>

          {/* SECURE ONLINE CONNECTIVITY BADGE */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-500/10 shadow-3xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">All-Access Unlocked</span>
            </div>
          </div>

        </div>
      </header>

      {/* SUB-HEADER TABS INDEX */}
      <nav className="bg-white/40 border-b border-outline-variant/20 shadow-xs sticky top-[61px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-2.5 overflow-x-auto no-scrollbar justify-start md:justify-center">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                activeTab === "dashboard"
                  ? "bg-[#00355f] text-white font-bold shadow-md ring-2 ring-[#00355f]/15"
                  : "bg-white text-[#42474f] border border-outline-variant/20 hover:border-[#00355f]/40 hover:bg-slate-50/50"
              }`}
              id="tab-dashboard-btn"
            >
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <span>Home Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("explorer")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                activeTab === "explorer"
                  ? "bg-[#00355f] text-white font-bold shadow-md ring-2 ring-[#00355f]/15"
                  : "bg-white text-[#42474f] border border-outline-variant/20 hover:border-[#00355f]/40 hover:bg-slate-50/50"
              }`}
              id="tab-explorer-btn"
            >
              <Compass className="w-4 h-4 text-sky-450" />
              <span>Destination Discovery</span>
            </button>

            <button
              onClick={() => setActiveTab("planner")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                activeTab === "planner"
                  ? "bg-[#00355f] text-white font-bold shadow-md ring-2 ring-[#00355f]/15"
                  : "bg-white text-[#42474f] border border-outline-variant/20 hover:border-[#00355f]/40 hover:bg-slate-50/50"
              }`}
              id="tab-planner-btn"
            >
              <Map className="w-4 h-4 text-amber-500" />
              <span>AI Travel Planner</span>
            </button>

            <button
              onClick={() => setActiveTab("heritage")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                activeTab === "heritage"
                  ? "bg-[#00355f] text-white font-bold shadow-md ring-2 ring-[#00355f]/15"
                  : "bg-white text-[#42474f] border border-outline-variant/20 hover:border-[#00355f]/40 hover:bg-slate-50/50"
              }`}
              id="tab-heritage-btn"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Virtual Heritage</span>
            </button>

            <button
              onClick={() => setActiveTab("safety")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                activeTab === "safety"
                  ? "bg-[#00355f] text-white font-bold shadow-md ring-2 ring-[#00355f]/15"
                  : "bg-white text-[#42474f] border border-outline-variant/20 hover:border-[#00355f]/40 hover:bg-slate-50/50"
              }`}
              id="tab-safety-btn"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Safety & Scam Advisor</span>
            </button>

            <button
              onClick={() => setActiveTab("blogs")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                activeTab === "blogs"
                  ? "bg-[#00355f] text-white font-bold shadow-md ring-2 ring-[#00355f]/15"
                  : "bg-white text-[#42474f] border border-outline-variant/20 hover:border-[#00355f]/40 hover:bg-slate-50/50"
              }`}
              id="tab-blogs-btn"
            >
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span>Traveler Stories</span>
            </button>

          </div>
        </div>
      </nav>

      {/* CORE DISPLAY WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Suppress predictionError banner for seamless experience as requested. Log to console instead. */}
        {predictionError && (() => {
          console.warn("Prediction Fallback Details:", predictionError);
          return null;
        })()}
        
        {/* CORE EXPLORER DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in text-[#0b1c30]">
            
            {/* Scenic Hero Banner */}
            <div 
              style={{ 
                backgroundImage: "linear-gradient(135deg, rgba(210, 228, 255, 0.94), rgba(248, 249, 255, 0.97)), url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
              className="relative rounded-3xl border border-white/40 p-6 md:p-10 overflow-hidden shadow-sm shadow-[#0f4c81]/5"
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00355f_1.2px,transparent_1.2px)] [background-size:20px_20px] pointer-events-none"></div>
              <div className="absolute -right-24 -top-24 w-80 h-80 bg-[#6af5e5]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#0f4c81]/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 max-w-3xl space-y-4">
                <span className="bg-secondary-container/20 border border-secondary/15 px-3 py-1 rounded-full text-secondary font-mono text-[10px] tracking-widest font-bold uppercase inline-flex items-center gap-1.5 shadow-3xs">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>The World, Refined by Intelligence</span>
                </span>
                
                <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-[#00355f] leading-none">
                  Wander Custom Orbits,<br/>With Absolute Safety.
                </h1>
                <p className="text-xs md:text-sm text-[#42474f] leading-relaxed max-w-2xl font-medium">
                  Odyssey connects multi-model AI synthesis, high-fidelity virtual antiquities, real-time localized scam alerts, and certified traveler chronicles.
                </p>

                {/* Instant Action Presets Row */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 mr-1.5">Quick Orbits:</span>
                  <button
                    onClick={() => handlePresetClick("Kyoto, Japan", "Cultural Explorer")}
                    className="text-[11px] bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 rounded-xl border border-slate-200/60 shadow-3xs cursor-pointer transition-all flex items-center gap-1 hover:border-[#00355f]/30"
                  >
                    <span>🏮</span>
                    <span>Kyoto Temple Walk</span>
                  </button>
                  <button
                    onClick={() => handlePresetClick("Rome, Italy", "Cultural Explorer")}
                    className="text-[11px] bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 rounded-xl border border-slate-200/60 shadow-3xs cursor-pointer transition-all flex items-center gap-1 hover:border-[#00355f]/30"
                  >
                    <span>🏛️</span>
                    <span>Imperial Rome Ruins</span>
                  </button>
                  <button
                    onClick={() => handlePresetClick("Barcelona, Spain", "Foodie Culinary Path")}
                    className="text-[11px] bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 rounded-xl border border-slate-200/60 shadow-3xs cursor-pointer transition-all flex items-center gap-1 hover:border-[#00355f]/30"
                  >
                    <span>🥘</span>
                    <span>Sizzling Tapas Path</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Core Bento Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              
              {/* Stat Card 1: Planners */}
              <div 
                onClick={() => setActiveTab("planner")}
                className="bg-white border border-outline-variant/10 hover:border-[#00355f]/20 p-5 rounded-3xl shadow-[0px_4px_20px_rgba(15,76,129,0.03)] hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                    <Map className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[9px] font-mono text-[#727780] font-bold uppercase tracking-wider">PLANNER</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold font-mono text-[#00355f] leading-none">
                    {savedTrips.length} Saved
                  </div>
                  <h3 className="text-xs font-bold text-[#0b1c30]">Itinerary Archives</h3>
                  <p className="text-[10px] text-[#727780] font-medium leading-tight">Plot bespoke local travel grids instantly.</p>
                </div>
              </div>

              {/* Stat Card 2: Heritage */}
              <div 
                onClick={() => setActiveTab("heritage")}
                className="bg-white border border-outline-variant/10 hover:border-[#00355f]/20 p-5 rounded-3xl shadow-[0px_4px_20px_rgba(15,76,129,0.03)] hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-surface-container-low text-[#006a61] flex items-center justify-center transition-transform group-hover:scale-105">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[9px] font-mono text-[#727780] font-bold uppercase tracking-wider">HERITAGE</span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#006a61] truncate tracking-tight py-0.5 leading-none">
                    {currentHeritage ? currentHeritage.siteName : "Petra, Jordan"}
                  </div>
                  <h3 className="text-xs font-bold text-[#0b1c30]">Virtual Antiquities</h3>
                  <p className="text-[10px] text-[#727780] font-medium leading-tight">Walk through reconstructed sanctuaries.</p>
                </div>
              </div>

              {/* Stat Card 3: Safety */}
              <div 
                onClick={() => setActiveTab("safety")}
                className="bg-white border border-outline-variant/10 hover:border-[#00355f]/20 p-5 rounded-3xl shadow-[0px_4px_20px_rgba(15,76,129,0.03)] hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#006a61]/10 text-[#006a61] flex items-center justify-center transition-transform group-hover:scale-105">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[9px] font-mono text-[#727780] font-bold uppercase tracking-wider">SECURITY</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold font-mono text-[#00355f] leading-none">
                    {currentSafety ? `${currentSafety.safetyIndex}/100` : "9.8 Score"}
                  </div>
                  <h3 className="text-xs font-bold text-[#0b1c30]">Scam Advisor active</h3>
                  <p className="text-[10px] text-[#727780] font-medium leading-tight">Live risk maps & traveler warnings.</p>
                </div>
              </div>

            </div>

            {/* Curated Popular Destinations Carousel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#0f4c81]/15 pb-3">
                <span className="text-xs font-mono font-bold text-[#727780] uppercase tracking-widest flex items-center gap-1.5">
                  <Compass className="w-4.5 h-4.5 text-[#0f4c81]" />
                  <span>Popular Destinations Neural Carousel</span>
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))}
                    disabled={carouselIndex === 0}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-xs font-bold shadow-3xs cursor-pointer hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    ←
                  </button>
                  <button 
                    onClick={() => setCarouselIndex(prev => Math.min(CAROUSEL_DESTINATIONS.length - 3, prev + 1))}
                    disabled={carouselIndex >= CAROUSEL_DESTINATIONS.length - 3}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-xs font-bold shadow-3xs cursor-pointer hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300">
                {CAROUSEL_DESTINATIONS.slice(carouselIndex, carouselIndex + 3).map((dest) => (
                  <div 
                    key={dest.id}
                    className="bg-white rounded-3xl border border-outline-variant/10 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-40 bg-slate-100 relative overflow-hidden">
                        <img 
                          src={dest.image} 
                          alt={dest.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent"></div>
                        <div className="absolute top-3 right-3 bg-white/92 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-slate-800 flex items-center gap-1 shadow-3xs">
                          <span className="text-amber-500 font-bold">★</span>
                          <span>{dest.rating}</span>
                        </div>
                        <div className="absolute bottom-3 left-3 text-white">
                          <span className="text-[10px] font-mono text-slate-200 uppercase tracking-wider block font-bold">{dest.country}</span>
                          <h4 className="text-base font-extrabold font-display leading-tight">{dest.name}</h4>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <span className="text-[9px] bg-sky-50 text-sky-800 font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono inline-block">
                          {dest.theme}
                        </span>
                        <p className="text-[11px] text-[#42474f] font-medium leading-relaxed">
                          {dest.desc}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-1 flex items-center justify-between border-t border-slate-50 gap-2">
                      <button 
                        onClick={() => handlePresetClick(`${dest.name}, ${dest.country}`, dest.style)}
                        className="flex-1 bg-[#00355f] text-white font-bold text-[10px] py-1.5 rounded-lg hover:bg-[#002b4d] active:scale-98 transition-all cursor-pointer"
                      >
                        Plan Itinerary
                      </button>
                      <button 
                        onClick={() => {
                          setSafetySearch(`${dest.name}, ${dest.country}`);
                          setActiveTab("safety");
                        }}
                        className="flex-1 bg-teal-50 text-teal-800 border border-teal-100 font-bold text-[10px] py-1.5 rounded-lg hover:bg-teal-100 active:scale-98 transition-all cursor-pointer"
                      >
                        Scam Security
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Heritage Spotlights Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
                <span className="text-xs font-mono font-bold text-[#727780] uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-[#006a61]" />
                  <span>Interactive Heritage Spotlights</span>
                </span>
                <span className="text-[10px] text-[#727780] font-medium">Click to initiate physical pilgrimage</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Taj Mahal",
                    loc: "Agra, India",
                    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80",
                    history: "Pristine white marble mausoleum built under Emperor Shah Jahan. Incorporates delicate floral pietra dura inlay."
                  },
                  {
                    name: "Colosseum",
                    loc: "Rome, Italy",
                    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
                    history: "Largest ancient amphitheater built of Flavian concrete, hosting gladitor battles and public drama."
                  },
                  {
                    name: "Machu Picchu",
                    loc: "Cusco, Peru",
                    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=80",
                    history: "Inca dry-stone citadel placed in Peru's mountain ridge representing extreme mortarless masonry."
                  }
                ].map((spot) => (
                  <div
                    key={spot.name}
                    onClick={() => handleHeritageSpotlightClick(spot.name)}
                    className="bg-white rounded-3xl border border-outline-variant/10 overflow-hidden shadow-[0px_4px_20px_rgba(15,76,129,0.03)] hover:shadow-md hover:border-[#00355f]/20 cursor-pointer group transition-all"
                  >
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                      <img
                        src={spot.image}
                        alt={spot.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-[#006a61] text-white text-[9px] font-mono rounded-full px-2.5 py-0.5 shadow-sm font-semibold tracking-wide">
                        94% MATCH
                      </div>
                      <div className="absolute bottom-3 left-3 text-white">
                        <h4 className="text-sm font-bold font-display">{spot.name}</h4>
                        <span className="text-[10px] font-mono text-[#d2e4ff] flex items-center gap-0.5">
                          📍 {spot.loc}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-[11px] text-[#42474f] leading-normal font-medium line-clamp-2">
                        {spot.history}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#00355f] uppercase group-hover:underline pt-1">
                        <span>Begin Virtual Tour</span>
                        <ChevronRight className="w-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gamification Board: Souvenir Badge Checklist */}
            <div className="bg-white rounded-3xl border border-outline-variant/15 p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Award className="w-5 h-5 text-[#00355f]" />
                <h3 className="text-sm font-extrabold font-display text-[#00355f] uppercase tracking-wider">
                  Odyssey Souvenir Achievements
                </h3>
              </div>
              <p className="text-xs text-[#42474f] leading-normal font-medium">
                Interact with the neural intelligence suite tools to explore, discover safety scores, save custom coordinates, and earn permanent digital stamps.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                {[
                  {
                    title: "Bespoke Architect",
                    desc: "Saved an itinerary from the AI travel planner.",
                    unlocked: savedTrips.length > 0,
                    icon: "🧭"
                  },
                  {
                    title: "Antiquity Pilgrim",
                    desc: "Initiated a walkaround inside the Virtual Heritage guide.",
                    unlocked: currentHeritage !== null && currentHeritage.siteName !== "Machu Picchu",
                    icon: "✨"
                  },
                  {
                    title: "Scam-Proof Scout",
                    desc: "Conducted a risk analysis and safety vector scan.",
                    unlocked: currentSafety !== null,
                    icon: "🛡️"
                  },
                  {
                    title: "Bard of Alfama",
                    desc: "Published an authentic story block in the community feed.",
                    unlocked: blogs.length > 2,
                    icon: "✍️"
                  }
                ].map((badge) => (
                  <div
                    key={badge.title}
                    className={`p-4 rounded-xl border flex gap-3 transition-colors ${
                      badge.unlocked
                        ? "bg-[#eff4ff] border-[#00355f]/15"
                        : "bg-slate-50/50 border-slate-200/60 opacity-60"
                    }`}
                  >
                    <div className="text-2xl pt-0.5 select-none">{badge.unlocked ? badge.icon : "🔒"}</div>
                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold leading-normal ${badge.unlocked ? "text-[#00355f]" : "text-[#727780]"}`}>
                        {badge.title}
                      </h4>
                      <p className="text-[10px] text-[#42474f] font-medium leading-relaxed mt-0.5">
                        {badge.desc}
                      </p>
                      <span className="inline-block mt-2 font-mono text-[8px] uppercase tracking-wider font-bold">
                        {badge.unlocked ? "✅ Unlocked" : "❌ Locked"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 1: AI TRAVEL PLANNER */}
        {activeTab === "planner" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Immersive Map Hero Visualizer - Placed prominently at the top */}
            {currentItinerary && currentItinerary.dailyitinerary && currentItinerary.dailyitinerary[0]?.activities ? (
              <div className="w-full">
                <InteractiveMap 
                  activities={currentItinerary.dailyitinerary.flatMap(d => d.activities || [])} 
                  destinationName={currentItinerary.destination}
                />
              </div>
            ) : (
              <div className="bg-[#0b1c30] rounded-3xl p-12 text-center border border-slate-800 text-slate-400">
                <Compass className="w-16 h-16 text-[#006a61] mx-auto mb-4 animate-spin-slow" />
                <h3 className="text-lg font-bold font-display text-slate-100">Satellite Map Ready</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Plot a destination on the left control panel to trigger live geographical telemetry tracking.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Config section */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white rounded-2xl border border-orange-900/10 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Compass className="w-5 h-5 text-brand-sienna" />
                  <h2 className="text-base font-bold font-display text-slate-900">Custom Architectural Itinerary</h2>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Type any destination globally. Our neural assistant crafts optimized daily coordinates, travel styles, and cost guidelines.
                </p>

                <form onSubmit={handleGenerateItinerary} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-mono tracking-wide uppercase text-slate-500 mb-1.5">Where to go?</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={plannerDestination}
                        onChange={(e) => setPlannerDestination(e.target.value)}
                        placeholder="e.g. Kyoto, Rome, Cairo, Sydney..."
                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-sienna focus:bg-white focus:border-brand-sienna transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono tracking-wide uppercase text-slate-500 mb-1.5">Days Duration</label>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        value={plannerDays}
                        onChange={(e) => setPlannerDays(Number(e.target.value))}
                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-sienna font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono tracking-wide uppercase text-slate-500 mb-1.5">Budget Class</label>
                      <select
                        value={plannerBudget}
                        onChange={(e) => setPlannerBudget(e.target.value)}
                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 text-xs rounded-xl px-2 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-sienna font-medium"
                      >
                        <option value="Backpacker / Budget">Tight Budget</option>
                        <option value="Moderate / Balanced">Moderate</option>
                        <option value="Premium / Luxury">Luxury Choice</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono tracking-wide uppercase text-slate-500 mb-1.5">Wanderlust Vibe</label>
                    <select
                      value={plannerStyle}
                      onChange={(e) => setPlannerStyle(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-sienna font-medium"
                    >
                      <option value="Cultural Explorer">Museums & Heritage</option>
                      <option value="Foodie Culinary Path">Food stalls & Local cafes</option>
                      <option value="Thrill & Outdoors">Nature & Trekking</option>
                      <option value="Relaxed Chill">Slow paces & Architecture</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={plannerLoading}
                    className="w-full bg-brand-sienna hover:bg-orange-850 text-white font-medium py-3 rounded-xl text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {plannerLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Structuring Maps and Paths...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Plot My AI Journey</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Saved Itineraries Section */}
              <div className="bg-white rounded-2xl border border-orange-900/10 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-1.5">
                  <BookMarked className="w-4.5 h-4.5 text-brand-sienna" />
                  <h3 className="text-sm font-bold font-display text-slate-900 uppercase tracking-wide">Saved Itineraries</h3>
                </div>

                <div className="space-y-2">
                  {savedTrips.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No itineraries saved yet. Click "Save this Route" on any generated plan.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
                      {savedTrips.map((trip) => (
                        <div
                          key={trip.id}
                          onClick={() => setCurrentItinerary(trip)}
                          className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-all group"
                        >
                          <div className="min-w-0">
                            <h5 className="text-xs font-semibold text-slate-800 truncate">{trip.destination}</h5>
                            <p className="text-[9px] text-slate-400 font-mono">
                              {trip.durationDays} days • {trip.travelStyle}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                            <button
                              onClick={(e) => handleDeleteTrip(trip.id!, e)}
                              className="p-1 hover:text-red-500 text-slate-300 rounded"
                              title="Delete Trip"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Display Board Section */}
            <div className="lg:col-span-8 space-y-6">
              
              {currentItinerary ? (
                <div className="space-y-6">
                  
                  {/* Header summary details card */}
                  <div className="bg-white rounded-2xl border border-orange-900/10 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded font-semibold uppercase">
                          {currentItinerary.travelStyle || "Bespoke Path"}
                        </span>
                        <h3 className="text-2xl font-bold font-display text-slate-900 mt-1">{currentItinerary.destination}</h3>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="block text-[10px] text-slate-400 font-mono uppercase font-semibold">TICKET BUDGET</span>
                          <span className="text-sm font-bold text-slate-800 font-mono">{currentItinerary.totalEstimatedBudget || "Various"}</span>
                        </div>
                        <button
                          onClick={handleSaveTrip}
                          className="bg-brand-sienna hover:bg-orange-850 text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Save this Route</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed italic border-l-3 border-brand-sienna pl-4 mb-6">
                      "{currentItinerary.summary}"
                    </p>

                    {/* Day by Day expansion panel */}
                    <div className="space-y-6">
                      {currentItinerary.dailyitinerary.map((day) => (
                        <div key={`day-${day.day}`} className="border border-slate-100 rounded-xl p-4 bg-brand-sand/30">
                          <div className="flex items-center gap-2 mb-3.5 border-b border-slate-200/50 pb-2">
                            <span className="w-7 h-7 rounded-lg bg-brand-sienna/10 text-brand-sienna flex items-center justify-center font-bold text-xs font-mono">
                              D{day.day}
                            </span>
                            <h4 className="text-sm font-bold font-display text-slate-800">{day.title}</h4>
                          </div>

                          <div className="space-y-4">
                            {day.activities.map((act, actIdx) => (
                              <div key={`act-${actIdx}`} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="w-5 h-5 rounded-full bg-brand-sienna/10 text-brand-sienna flex items-center justify-center font-mono text-[10px] font-bold">
                                    {actIdx + 1}
                                  </div>
                                  {actIdx !== day.activities.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-slate-200/60 my-1"></div>
                                  )}
                                </div>

                                <div className="flex-1 bg-white p-3 rounded-lg border border-slate-100 shadow-3xs">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-[10px] text-slate-400 font-mono font-medium">{act.time}</span>
                                    <span className="text-[10px] text-brand-sienna font-mono font-semibold">{act.cost || "Free"}</span>
                                  </div>
                                  <h5 className="text-xs font-bold text-slate-800">{act.activity}</h5>
                                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">📍 {act.location}</p>
                                  {act.tips && (
                                    <div className="mt-2 text-[10px] bg-slate-50 text-slate-600 rounded p-2 border-l border-slate-300">
                                      <span className="font-semibold text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">Insider Guide</span>
                                      {act.tips}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 text-center p-12">
                  <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-spin-slow" />
                  <h3 className="text-lg font-bold font-display text-slate-700">Explore the Map</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                    Set your custom coordinates, budgets, and styles in the builder form to conjure an elegant travel plan matrix.
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>
        )}

        {/* TAB 2: VIRTUAL HERITAGE GUIDE */}
        {activeTab === "heritage" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Discovery portal query */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white rounded-2xl border border-orange-900/10 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-5 h-5 text-brand-sienna animate-pulse" />
                  <h2 className="text-base font-bold font-display text-slate-900">Virtual Heritage Discovery</h2>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Step backward in time. Search key architectural marvels, sanctuaries, or historic wonders around the world.
                </p>

                <form onSubmit={handleFetchHeritage} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-mono tracking-wide uppercase text-slate-500 mb-1.5">Monument or Sanctuary</label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={heritageQuery}
                        onChange={(e) => setHeritageQuery(e.target.value)}
                        placeholder="e.g. Taj Mahal, Colosseum, Angkor Wat..."
                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-sienna focus:bg-white focus:border-brand-sienna transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={heritageLoading}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white font-medium py-3 rounded-xl text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {heritageLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Restoring ancient scroll records...</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-4 h-4 text-brand-terracotta" />
                        <span>Initiate Digital Pilgrimage</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Quick select suggestions */}
                <div className="pt-2">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-semibold">FAMOUS SITES</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Taj Mahal", "Rome Colosseum", "Giza Pyramids", "Petra Jordan"].map((spot) => (
                      <button
                        key={spot}
                        type="button"
                        onClick={() => {
                          setHeritageQuery(spot);
                          // Trigger autofetch simulation
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md font-medium"
                      >
                        {spot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat curator connection card */}
              {currentHeritage && (
                <AICuratorChat siteName={currentHeritage.siteName} yearBuilt={currentHeritage.yearBuilt} />
              )}

            </div>

            {/* Immersive Walkthrough display board */}
            <div className="lg:col-span-8 space-y-6">
              
              {currentHeritage ? (
                <div className="bg-white rounded-2xl border border-orange-900/10 overflow-hidden shadow-sm">
                  
                  {/* Atmospheric overlay visual block */}
                  <div className="relative bg-amber-950 p-8 text-white text-left overflow-hidden min-h-[180px] flex flex-col justify-end">
                    {/* Organic warm lights backdrop */}
                    <div className="absolute inset-0 bg-linear-to-tr from-orange-950 via-amber-950 to-slate-950 opacity-90 z-0"></div>
                    <div className="absolute inset-0 opacity-12 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                    
                    <div className="relative z-10 space-y-2">
                      <span className="inline-block bg-brand-terracotta/40 border border-brand-terracotta/50 font-mono text-[9px] uppercase px-2 py-0.5 rounded font-bold tracking-widest text-orange-200">
                        VIRTUAL SANCTUARY • EST. {currentHeritage.yearBuilt || "Antiquity"}
                      </span>
                      <h2 className="text-3xl font-extrabold font-display leading-none tracking-tight">{currentHeritage.siteName}</h2>
                      <p className="text-xs text-orange-200/80 font-medium flex items-center gap-1">📍 {currentHeritage.location}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    
                    {/* History Brief */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest">Chronicle & Heritage Significance</h3>
                      <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
                        {currentHeritage.history}
                      </p>
                    </div>

                    {/* Sensory Journey Walkthrough */}
                    <div className="bg-amber-50/50 border border-amber-900/10 p-5 rounded-xl space-y-3">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-sienna font-bold flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        <span>Immersive Sensory Walkthrough</span>
                      </h4>
                      <p className="text-xs md:text-sm text-amber-950/80 leading-relaxed font-serif tracking-wide italic">
                        "{currentHeritage.narrative}"
                      </p>
                    </div>

                    {/* Structural Sections Panel */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest">Architectural Spotlights</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentHeritage.sections && currentHeritage.sections.map((sec, idx) => (
                          <div key={`section-${idx}`} className="border border-slate-100 p-4 rounded-xl bg-slate-50 flex flex-col justify-between">
                            <div>
                              <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-sienna"></span>
                                {sec.name}
                              </h5>
                              <p className="text-[11px] text-slate-500 leading-relaxed mt-1.5">
                                {sec.description}
                              </p>
                            </div>
                            {sec.interactiveDetailsColor && (
                              <div className="mt-3 pt-2 border-t border-slate-200/50 flex justify-between items-center text-[9px] font-mono">
                                <span className="text-slate-400">Atmospheric Vibe:</span>
                                <span className="text-brand-sienna font-semibold uppercase">{sec.interactiveDetailsColor}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trivia bullet board */}
                    <div className="pt-4 border-t border-slate-100 space-y-3.5">
                      <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest">Astronomical & Structural Trivia</h3>
                      <ul className="space-y-2.5">
                        {currentHeritage.trivia && currentHeritage.trivia.map((triv, idx) => (
                          <li key={`trivia-${idx}`} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed font-medium">
                            <span className="text-brand-sienna font-bold font-mono">0{idx + 1}.</span>
                            <span>{triv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 text-center p-12">
                  <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-lg font-bold font-display text-slate-100">Activate Pilgrim Core</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Select or search a sacred temple or monumental plinth on the portal sidebar to begin high-fidelity ambient virtual tours.
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 3: SAFETY & COST ANALYSIS */}
        {activeTab === "safety" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input and Safety summary */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white rounded-2xl border border-orange-900/10 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-5 h-5 text-brand-sienna" />
                  <h2 className="text-base font-bold font-display text-slate-900">Safety & Budget Advisor</h2>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Enter any global travel destination to review immediate risk profiles, tourist scams, and real-time average living costs.
                </p>

                <form onSubmit={(e) => handleFetchSafety(e)} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-mono tracking-wide uppercase text-slate-500 mb-1.5">Target Destination</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={safetySearch}
                        onChange={(e) => setSafetySearch(e.target.value)}
                        placeholder="e.g. Barcelona, Rome, Tokyo..."
                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-sienna focus:bg-white focus:border-brand-sienna transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={safetyLoading}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white font-medium py-3 rounded-xl text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {safetyLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Compiling local risk data...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Perform Safety Scan</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Short informative prompt regarding local safety ratings */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-normal">
                  🔒 Safety parameters are evaluated dynamically by querying historic safety trends alongside reported traveler incidents.
                </div>
              </div>

            </div>

            {/* Safety Dashboard display board */}
            <div className="lg:col-span-8 space-y-6">
              
              {currentSafety ? (
                <div className="bg-white rounded-2xl border border-orange-900/10 p-6 shadow-sm space-y-6">
                  
                  {/* Header safety index display */}
                  <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] bg-brand-sienna text-white font-mono px-2 py-0.5 rounded font-semibold uppercase">
                        LOCAL RISK BRIEFING
                      </span>
                      <h3 className="text-xl font-bold font-display mt-1">{currentSafety.destination}</h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left md:text-right">
                        <span className="block text-[9px] text-slate-400 font-mono uppercase font-semibold">ADVISORY STATUS</span>
                        <span className="text-sm font-semibold text-brand-amber">{currentSafety.overallSafetyRating || "Moderate Rating"}</span>
                      </div>

                      {/* Score circle */}
                      <div className="relative w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex flex-col justify-center items-center">
                        <span className="text-xs font-mono font-semibold text-slate-400 leading-none">INDEX</span>
                        <span className="text-base font-extrabold font-mono text-emerald-400 leading-none mt-1">{currentSafety.safetyIndex || 60}</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Safety Heatmap */}
                  {(() => {
                    const centerLat = currentSafety.lat || 48.8566;
                    const centerLng = currentSafety.lng || 2.3522;

                    const heatMarkers = [
                      {
                        lat: centerLat,
                        lng: centerLng,
                        title: `${currentSafety.destination} center`,
                        popupContent: `🎯 <b>${currentSafety.destination}</b><br/>Safety rating Index: <b>${currentSafety.safetyIndex}/100</b>`,
                        color: "#16a34a"
                      },
                      ...(currentSafety.dangerousAreas || []).map((area: any) => {
                        const areaLat = typeof area === "object" ? area.lat : (centerLat + (Math.random() - 0.5) * 0.025);
                        const areaLng = typeof area === "object" ? area.lng : (centerLng + (Math.random() - 0.5) * 0.025);
                        const isHigh = typeof area === "object" ? area.severity === "high" : true;
                        
                        return {
                          lat: areaLat,
                          lng: areaLng,
                          title: typeof area === "object" ? area.name : String(area),
                          popupContent: typeof area === "object" ? area.description : `Reported local safety concern in ${currentSafety.destination}.`,
                          safetyLevel: isHigh ? ("risky" as const) : ("moderate" as const),
                          scamsCount: isHigh ? 4 : 2,
                          color: isHigh ? "#ef4444" : "#f59e0b"
                        };
                      })
                    ];

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-widest">
                          <span>🌐 LIVE GEOLOCATION HEATMAPPING</span>
                          <span className="text-rose-500 font-bold animate-pulse">● RADAR VECTOR POWERED</span>
                        </div>
                        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 h-[240px] md:h-[280px] relative shadow-inner">
                          <LeafletMap
                            markers={heatMarkers}
                            center={[centerLat, centerLng]}
                            zoom={12}
                            theme="dark"
                            heightClass="h-full"
                            showSafetyHeatCircles={true}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Scams List */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle className="w-4.5 h-4.5 text-brand-terracotta" />
                      <span>Avoid Local Scams & Thefts</span>
                    </h4>

                    <div className="divide-y divide-slate-100">
                      {currentSafety.commonScams && currentSafety.commonScams.map((scam, idx) => (
                        <div key={`scam-${idx}`} className="py-3 flex gap-2.5 items-start">
                          <span className="text-slate-400 font-mono text-xs font-bold pt-0.5">0{idx + 1}.</span>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800">{scam.name}</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">{scam.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warning Areas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="border border-slate-100 p-4 rounded-xl bg-orange-50/40 space-y-2">
                      <h4 className="text-[10px] font-mono font-semibold text-brand-sienna uppercase tracking-wider">Caution Areas</h4>
                      <ul className="space-y-1.5 list-disc list-inside text-[11px] text-orange-950 font-medium">
                        {currentSafety.dangerousAreas && currentSafety.dangerousAreas.map((area, idx) => (
                          <li key={`area-${idx}`} className="leading-relaxed">
                            {typeof area === "object" ? (
                              <span>
                                <strong className="text-orange-950 font-bold">{area.name}: </strong>
                                <span className="opacity-90">{area.description}</span>
                              </span>
                            ) : (
                              area
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border border-slate-100 p-4 rounded-xl bg-emerald-50/30 space-y-2">
                      <h4 className="text-[10px] font-mono font-semibold text-emerald-800 uppercase tracking-wider">Insider Security Rules</h4>
                      <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-600 font-medium">
                        {currentSafety.essentialTips && currentSafety.essentialTips.map((tip, idx) => (
                          <li key={`tip-${idx}`} className="leading-relaxed">{tip}</li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Budget analysis numbers */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <DollarSign className="w-4.5 h-4.5 text-emerald-600" />
                      <span>Average Tourist Budgets</span>
                    </h4>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="block text-[9px] text-slate-400 font-mono uppercase font-semibold">AVERAGE DINNER</span>
                        <span className="text-xs font-bold text-slate-800 font-mono mt-1 block">{currentSafety.averageCosts?.meal || "$16"}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="block text-[9px] text-slate-400 font-mono uppercase font-semibold">EST. BOARDING</span>
                        <span className="text-xs font-bold text-slate-800 font-mono mt-1 block">{currentSafety.averageCosts?.stay || "$100/N"}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="block text-[9px] text-slate-400 font-mono uppercase font-semibold">BUS & METRO</span>
                        <span className="text-xs font-bold text-slate-800 font-mono mt-1 block">{currentSafety.averageCosts?.transport || "$2.50"}</span>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 text-center p-12">
                  <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold font-display text-slate-700">Safety Central</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                    Initiate a risk vector scan on the left sidebar to prepare against local tourism traps.
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 4: BLOGS & AI CONTENT GENERATION */}
        {activeTab === "blogs" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Create Story Block */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white rounded-2xl border border-orange-900/10 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <PenTool className="w-5 h-5 text-brand-sienna" />
                  <h2 className="text-base font-bold font-display text-slate-900">Blogger's Lounge</h2>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Write and publish your authentic travel journals, or harness the AI Blog Co-writer draft assistance engine.
                </p>

                <form onSubmit={handlePublishBlog} className="space-y-4">
                  
                  {/* Destination name input */}
                  <div>
                    <label className="block text-[11px] font-mono tracking-wide uppercase text-slate-500 mb-1.5">Focus Location</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={blogDest}
                        onChange={(e) => setBlogDest(e.target.value)}
                        placeholder="e.g. Lisbon, Bali, Venice..."
                        className="flex-1 bg-slate-50 text-slate-900 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-sienna font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAIBlogAssist}
                        disabled={blogAssisting || !blogDest}
                        className="bg-brand-sienna text-white font-medium px-4 text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-850"
                      >
                        {blogAssisting ? "..." : "AI Assist"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono tracking-wide uppercase text-slate-500 mb-1.5">Article Vibe</label>
                    <select
                      value={blogTheme}
                      onChange={(e) => setBlogTheme(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 border border-slate-200 text-xs rounded-xl px-2 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-sienna font-medium"
                    >
                      <option value="Hidden Gems">Hidden Secrets</option>
                      <option value="Local Street Food">Culinary Journeys</option>
                      <option value="Backpacker Adventures">Backpacker Diary</option>
                      <option value="Quiet Spiritual Walks">Zen Escapes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono tracking-wide uppercase text-slate-500 mb-1.5">Blog Title</label>
                    <input
                      type="text"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder="Poetic title..."
                      className="w-full bg-slate-50 text-slate-900 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-sienna font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono tracking-wide uppercase text-slate-500 mb-1.5">Blog Content body</label>
                    <textarea
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      rows={5}
                      placeholder="Reflecting on narrow alleys at midnight..."
                      className="w-full bg-slate-50 text-slate-900 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-sienna font-medium resize-none leading-relaxed"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white font-medium py-3 rounded-xl text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-brand-terracotta" />
                    <span>Publish Traveler Journal</span>
                  </button>
                </form>

              </div>

            </div>

            {/* Travel Stories Feed column */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="flex items-center justify-between border-b border-orange-900/10 pb-3 mb-2">
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest">Global Dispatch Feed</span>
                <span className="text-[10px] text-slate-500 font-medium">({blogs.length} Active Articles)</span>
              </div>

              <div className="space-y-6">
                {blogs.map((post) => (
                  <article key={post.id} className="bg-white rounded-2xl border border-orange-900/10 overflow-hidden shadow-sm flex flex-col md:flex-row h-auto md:h-64">
                    
                    {/* Cover Photo */}
                    <div className="w-full md:w-56 bg-slate-100 flex-shrink-0 relative overflow-hidden h-44 md:h-full">
                      <img
                        src={post.imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs text-[9px] text-white font-mono rounded px-2 py-0.5 font-bold uppercase tracking-wide">
                        📍 {post.tags[0] || "Global"}
                      </div>
                    </div>

                    {/* Blog details */}
                    <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
                      <div>
                        
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mb-2">
                          <span>By {post.author}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-brand-terracotta" />
                            {post.date}
                          </span>
                        </div>

                        <h3 className="text-base font-bold font-display text-slate-900 leading-tight tracking-tight mb-2">
                          {post.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 font-normal">
                          {post.content}
                        </p>

                      </div>

                      {/* Tags and reactions toolbar */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-3 select-none">
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map((tag, tIdx) => (
                            <span key={`tag-${tIdx}`} className="text-[9px] bg-slate-100 text-slate-500 font-mono font-medium px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            // Local reaction incrementor
                            const updated = blogs.map(b => b.id === post.id ? { ...b, likes: b.likes + 1 } : b);
                            setBlogs(updated);
                          }}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 transition-all font-mono font-semibold"
                        >
                          <Heart className="w-4 h-4 fill-transparent transition-all hover:scale-110" />
                          <span>{post.likes} likes</span>
                        </button>
                      </div>

                    </div>

                  </article>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* TAB: DESTINATION DISCOVERY (EXPLORER) */}
        {activeTab === "explorer" && (
          <div className="space-y-6 animate-fade-in text-[#0b1c30]">
            {/* Explorer Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
              <div>
                <h2 className="text-2xl font-extrabold font-display text-[#00355f] flex items-center gap-2">
                  <Compass className="w-6 h-6 text-[#0f4c81]" />
                  <span>Destination Explorer & Filter Hub</span>
                </h2>
                <p className="text-xs text-[#42474f] font-medium mt-1">
                  Browse custom geographic coordinates, filter by regional parameters, and trigger remote AI planners instant.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setExpSearch("");
                    setExpRegion("All");
                    setExpBudget("All");
                    setExpStyle("All");
                  }}
                  className="px-4 py-2 text-xs font-bold text-[#00355f] bg-white border border-slate-200 hover:border-[#00355f]/30 rounded-xl shadow-3xs cursor-pointer transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            </div>

            {/* Main Discovery Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              
              {/* Left sidebar: Filter Parameters */}
              <div className="bg-white rounded-3xl border border-outline-variant/10 p-5 md:p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xs font-extrabold font-mono text-[#00355f] uppercase tracking-wider mb-3">
                    Search Coordinates
                  </h3>
                  <div className="relative">
                    <input
                      type="text"
                      value={expSearch}
                      onChange={(e) => setExpSearch(e.target.value)}
                      placeholder="e.g. Kyoto, Rome..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-[#00355f]/40"
                    />
                    <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold font-mono text-[#00355f] uppercase tracking-wider">
                    Geographic Region
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Asia", "Europe", "Americas", "Africa"].map((region) => (
                      <button
                        key={region}
                        onClick={() => setExpRegion(region)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          expRegion === region
                            ? "bg-[#00355f] border-[#00355f] text-white shadow-3xs"
                            : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold font-mono text-[#00355f] uppercase tracking-wider">
                    Budget Level
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Budget", "Moderate", "Luxury"].map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setExpBudget(tier)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          expBudget === tier
                            ? "bg-[#0b1c30] border-[#0b1c30] text-white shadow-3xs"
                            : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold font-mono text-[#00355f] uppercase tracking-wider">
                    Travel Sensation Style
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {["All", "Cultural Explorer", "Adventure/Active", "Coastal Retreat"].map((style) => (
                      <button
                        key={style}
                        onClick={() => setExpStyle(style)}
                        className={`text-left text-[11px] font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                          expStyle === style
                            ? "bg-teal-800 border-teal-800 text-white shadow-3xs"
                            : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100/40">
                  <span className="text-[10px] font-mono font-bold text-sky-800 uppercase tracking-widest block mb-1">
                    System Note
                  </span>
                  <p className="text-[10px] text-sky-900/80 leading-normal font-medium">
                    Plotted coordinates carry cached physical itineraries inside the memory cache for instantaneous response.
                  </p>
                </div>
              </div>

              {/* Right side: Destinations Grid */}
              <div className="lg:col-span-3 space-y-6">
                {(() => {
                  const filtered = CAROUSEL_DESTINATIONS.filter(d => {
                    const matchesSearch = d.name.toLowerCase().includes(expSearch.toLowerCase()) || 
                                          d.country.toLowerCase().includes(expSearch.toLowerCase()) || 
                                          d.desc.toLowerCase().includes(expSearch.toLowerCase());
                    const matchesRegion = expRegion === "All" || d.region === expRegion;
                    const matchesBudget = expBudget === "All" || d.budget === expBudget;
                    const matchesStyle = expStyle === "All" || d.style === expStyle;
                    return matchesSearch && matchesRegion && matchesBudget && matchesStyle;
                  });

                  // Support custom search fallback coordinates mapping for arbitrary places so map is ALWAYS visible
                  let activePlaces = [...filtered];
                  if (activePlaces.length === 0 && expSearch.trim() !== "") {
                    let hash = 0;
                    const cleanSearch = expSearch.trim();
                    for (let i = 0; i < cleanSearch.length; i++) {
                      hash = cleanSearch.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const baseLat = 30 + (Math.abs(hash) % 20);
                    const baseLng = -20 + (Math.abs(hash * 3) % 150);
                    
                    activePlaces.push({
                      id: `custom-explorer-${cleanSearch.toLowerCase().replace(/\s+/g, '-')}`,
                      name: cleanSearch.charAt(0).toUpperCase() + cleanSearch.slice(1),
                      country: "Geographical Discovery",
                      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
                      theme: "Dynamic Coordinate Mesh",
                      desc: `A coordinate-plotted landmark profile dynamically geolocated for '${cleanSearch}'. View local attractions, start an itinerary plan, or run safety scans in real time!`,
                      rating: "5.0",
                      region: "Global Coordinates",
                      budget: expBudget !== "All" ? expBudget : "Moderate",
                      style: expStyle !== "All" ? expStyle : "Cultural Explorer",
                      lat: Number(baseLat.toFixed(4)),
                      lng: Number(baseLng.toFixed(4))
                    });
                  }

                  // 1. Build attraction-centered markers if a city is drilled into or searched
                  const isDrilled = selectedExplorerDest !== null;
                  let mapMarkers = [];
                  let mapCenter: [number, number] | undefined = undefined;
                  let mapZoom: number | undefined = undefined;

                  if (isDrilled) {
                    let attractions = CITY_ATTRACTIONS[selectedExplorerDest!];
                    if (!attractions) {
                      // Generate dynamic attraction locations procedurally for this other place!
                      let hash = 0;
                      for (let i = 0; i < selectedExplorerDest!.length; i++) {
                        hash = selectedExplorerDest!.charCodeAt(i) + ((hash << 5) - hash);
                      }
                      const baseLat = 30 + (Math.abs(hash) % 20);
                      const baseLng = -20 + (Math.abs(hash * 3) % 150);

                      attractions = [
                        { name: "Cultural Landmark Plaza", lat: baseLat + 0.004, lng: baseLng - 0.005, desc: `The breathtaking structural centerpiece of ${selectedExplorerDest}, demonstrating rich traditional motifs.` },
                        { name: "Traditional Street Market", lat: baseLat - 0.003, lng: baseLng + 0.004, desc: `A sensory bazaar featuring popular regional delicacies, handmade souvenirs, and local music.` },
                        { name: "Scenic Greenery Lookout", lat: baseLat + 0.006, lng: baseLng + 0.006, desc: `A tranquil public oasis offering stunning panoramic horizons over ${selectedExplorerDest}.` }
                      ];
                    }

                    mapMarkers = attractions.map((att) => ({
                      lat: att.lat,
                      lng: att.lng,
                      title: att.name,
                      popupContent: `<div style="font-family: inherit;"><span style="font-weight: 700; color: #0d9488;">📌 ${att.name}</span><br/><span style="font-size: 11px; color:#475569; display:block; margin-top:4px;">${att.desc}</span></div>`,
                      color: "#14b8a6" // lovely teal attraction points
                    }));

                    if (attractions.length > 0) {
                      mapCenter = [attractions[0].lat, attractions[0].lng] as [number, number];
                      mapZoom = 13;
                    }
                  } else {
                    // Global/Filtered view of top cities
                    mapMarkers = activePlaces.map((dest) => {
                      const container = document.createElement("div");
                      container.style.fontFamily = "system-ui, sans-serif";
                      container.innerHTML = `
                        <div style="min-width: 195px; max-width: 270px; padding: 4px;">
                          <h4 style="font-size: 13px; font-weight: 800; color: #00355f; margin: 0 0 2px 0;">${dest.name}, ${dest.country}</h4>
                          <span style="font-size: 9px; font-weight: bold; background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 6px;">★ ${dest.rating} Rating</span>
                          <p style="font-size: 10.5px; color: #334155; margin: 0 0 8px 0; line-height: 1.4;">${dest.desc}</p>
                          <div style="font-size: 9.5px; font-weight: bold; color: #006a61; margin-bottom: 8px;">Theme: ${dest.theme}</div>
                          <div style="display: flex; gap: 4px; border-top: 1px solid #f1f5f9; padding-top: 8px;">
                            <button id="pop-plan-${dest.id}" style="flex: 1; border: none; font-weight: bold; font-family: inherit; background: #00355f; color: white; border-radius: 5px; padding: 4.5px 6px; font-size: 9.5px; cursor: pointer;">Build Plan</button>
                            <button id="pop-safe-${dest.id}" style="flex: 1; border: 1px solid #0d9488; font-weight: bold; font-family: inherit; background: #effefb; color: #0f766e; border-radius: 5px; padding: 4.5px 6px; font-size: 9.5px; cursor: pointer;">Safety Scan</button>
                          </div>
                          <button id="pop-drill-${dest.id}" style="width: 100%; border: 1px dashed #64748b; font-weight: bold; font-family: inherit; background: transparent; color: #475569; border-radius: 5px; padding: 4.5px 6px; font-size: 9px; cursor: pointer; margin-top: 6px;">
                            🔍 View Local Landmark Pins
                          </button>
                        </div>
                      `;

                      // Attach handlers with slight delay when Leaflet finishes drawing its DOM
                      setTimeout(() => {
                        container.querySelector(`#pop-plan-${dest.id}`)?.addEventListener("click", () => {
                          handlePresetClick(`${dest.name}, ${dest.country}`, dest.style);
                        });
                        container.querySelector(`#pop-safe-${dest.id}`)?.addEventListener("click", () => {
                          setSafetySearch(`${dest.name}, ${dest.country}`);
                          setActiveTab("safety");
                          handleFetchSafety(undefined, `${dest.name}, ${dest.country}`);
                        });
                        container.querySelector(`#pop-drill-${dest.id}`)?.addEventListener("click", () => {
                          setSelectedExplorerDest(dest.name);
                        });
                      }, 100);

                      return {
                        lat: dest.lat,
                        lng: dest.lng,
                        title: dest.name,
                        popupContent: container,
                        color: "#00355f"
                      };
                    });
                  }

                  if (activePlaces.length === 0) {
                    return (
                      <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 shadow-3xs">
                        <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-bounce" />
                        <h4 className="text-sm font-extrabold font-display text-slate-700 font-bold">No Custom Coordinates Matched</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-medium">
                          Try relaxing your regional selections, reset your budget limits, or clear your query criteria.
                        </p>
                        <button
                          onClick={() => {
                            setExpSearch("");
                            setExpRegion("All");
                            setExpBudget("All");
                            setExpStyle("All");
                          }}
                          className="mt-4 px-4 py-2 text-xs bg-[#00355f] text-white rounded-xl font-bold hover:bg-[#002b4d]"
                        >
                          Clear Discovery Constraints
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {/* Live Leaflet Discovery Map */}
                      <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-md relative h-[380px] md:h-[440px]">
                        <LeafletMap
                          markers={mapMarkers}
                          center={mapCenter}
                          zoom={mapZoom}
                          theme="muted"
                          heightClass="h-full"
                        />

                        {/* Floated state indicator overlay */}
                        <div className="absolute top-3 left-3 z-[400] bg-[#0b1c30]/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-800/80 max-w-[280px]">
                          {isDrilled ? (
                            <div className="space-y-1.5 text-left">
                              <span className="text-[9px] font-mono text-teal-400 font-extrabold uppercase tracking-widest block font-bold">DRILLDOWN LANDMARKS MAP</span>
                              <h5 className="text-xs font-bold text-slate-100">{selectedExplorerDest} Attractions</h5>
                              <button
                                onClick={() => setSelectedExplorerDest(null)}
                                className="px-2.5 py-1 text-[9.5px] bg-slate-800 text-slate-200 rounded-md border border-slate-700 hover:bg-slate-700 transition cursor-pointer font-bold block"
                              >
                                ← Back to Global View
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1 text-left">
                              <span className="text-[9px] font-mono text-[#6af5e5] font-extrabold uppercase tracking-widest block font-bold">LIVE SPATIAL GRID</span>
                              <h5 className="text-[11px] font-medium text-slate-300">
                                Plotting <span className="text-teal-400 font-bold">{filtered.length}</span> destinations in scope
                              </h5>
                              <p className="text-[9px] text-slate-400 leading-snug">Click on a marker to trigger instant travel plans or inspect cultural attraction landmarks!</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card layout of destinations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filtered.map((dest) => (
                          <div 
                            key={dest.id}
                            className="bg-white rounded-3xl border border-outline-variant/10 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                          >
                            <div>
                              <div className="h-44 bg-slate-100 relative overflow-hidden">
                                <img 
                                  src={dest.image} 
                                  alt={dest.name} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent"></div>
                                <div className="absolute top-3 right-3 bg-[#0b1c30]/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-3xs font-mono">
                                  <span>★</span>
                                  <span>{dest.rating}</span>
                                </div>
                                <div className="absolute bottom-3 left-3 text-white">
                                  <span className="text-[10px] font-mono text-slate-200 uppercase tracking-widest font-bold block">{dest.country}</span>
                                  <h3 className="text-base font-extrabold font-display tracking-tight leading-none mt-0.5">{dest.name}</h3>
                                </div>
                              </div>

                              <div className="p-4 space-y-3">
                                <div className="flex flex-wrap gap-1">
                                  <span className="bg-[#eff4ff] text-[#00355f] text-[9px] font-bold px-2 py-0.5 rounded-md font-mono uppercase tracking-wider">{dest.region}</span>
                                  <span className="bg-[#effefb] text-teal-800 text-[9px] font-bold px-2 py-0.5 rounded-md font-mono uppercase tracking-wider">{dest.budget}</span>
                                  <span className="bg-orange-50 text-orange-900 text-[9px] font-bold px-2 py-0.5 rounded-md font-mono uppercase tracking-wider">{dest.style}</span>
                                </div>
                                <p className="text-xs text-[#42474f] leading-relaxed font-medium">
                                  {dest.desc}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 pt-1 flex items-center justify-between border-t border-slate-50 gap-2">
                              <button 
                                onClick={() => handlePresetClick(`${dest.name}, ${dest.country}`, dest.style)}
                                className="flex-1 bg-[#00355f] text-white font-bold text-xs py-2 rounded-xl hover:bg-[#002b4d] active:scale-98 transition-all cursor-pointer shadow-3xs"
                              >
                                AI Planner
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedExplorerDest(dest.name);
                                }}
                                className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs py-2 rounded-xl active:scale-98 transition-all cursor-pointer shadow-3xs text-center border border-teal-100"
                              >
                                Attractions
                              </button>
                              <button 
                                onClick={() => {
                                  setSafetySearch(`${dest.name}, ${dest.country}`);
                                  setActiveTab("safety");
                                  handleFetchSafety(undefined, `${dest.name}, ${dest.country}`);
                                }}
                                className="flex-1 bg-slate-50 text-slate-700 font-bold text-xs py-2 rounded-xl hover:bg-slate-100 active:scale-98 transition-all cursor-pointer border border-slate-200"
                              >
                                Safety Scan
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        )}



      </main>

      {/* FOOTER BAR */}
      <footer className="bg-slate-950 text-slate-500 py-8 border-t border-slate-900 text-center select-none font-mono text-[10px]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-400 uppercase tracking-widest font-bold">ODYSSEY TRAVELLER SYSTEMS</p>
          <p className="mt-4 text-slate-600">&copy; {new Date().getFullYear()} Odyssey. All digital rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
