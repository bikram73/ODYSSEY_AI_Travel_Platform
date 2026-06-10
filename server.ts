import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Express app
export const app = express();
const PORT = 3000;

// URL correction middleware for serverless/Vercel proxies
app.use((req, res, next) => {
  let originalPath = "";

  // 1. Check for x-original-url (Vercel-specific original path)
  if (req.headers["x-original-url"] && typeof req.headers["x-original-url"] === "string") {
    originalPath = req.headers["x-original-url"];
  }
  // 2. Check for x-forwarded-url (Generic forwarder proxy header)
  else if (req.headers["x-forwarded-url"] && typeof req.headers["x-forwarded-url"] === "string") {
    originalPath = req.headers["x-forwarded-url"];
  }
  // 3. Check for x-now-route-matches (Vercel routing string, e.g., path=%2Fapi%2Fgenerate-itinerary)
  else if (req.headers["x-now-route-matches"] && typeof req.headers["x-now-route-matches"] === "string") {
    const match = req.headers["x-now-route-matches"].match(/path=([^&]+)/);
    if (match && match[1]) {
      originalPath = decodeURIComponent(match[1]);
    }
  }
  // 4. Check for x-matched-path if it starts with /api but is not the index wrapper script itself
  else if (req.headers["x-matched-path"] && typeof req.headers["x-matched-path"] === "string") {
    const matchedPath = req.headers["x-matched-path"];
    if (matchedPath.startsWith("/api") && !matchedPath.endsWith("/index.ts") && !matchedPath.endsWith("/index.js") && !matchedPath.endsWith("/index")) {
      originalPath = matchedPath;
    }
  }

  if (originalPath) {
    try {
      if (originalPath.startsWith("/")) {
        req.url = originalPath;
      } else {
        const parsed = new URL(originalPath, "http://localhost");
        req.url = parsed.pathname + parsed.search;
      }
    } catch (e) {
      req.url = originalPath;
    }
  }
  next();
});

// Watertight robust client-body parser middleware for both local and serverless/Vercel proxies
app.use((req, res, next) => {
  // If req.body is already populated by Vercel environment/helper
  if (req.body !== undefined) {
    if (typeof req.body === "string" && req.body.trim()) {
      try {
        req.body = JSON.parse(req.body);
      } catch (err) {}
    } else if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString("utf-8"));
      } catch (err) {}
    }
    return next();
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy-initialized Gemini client with safety guard
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Please configure it in the Secrets panel in Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory cache to prevent hitting Gemini API quota limits on repetitive queries
const ApiCache: Record<string, any> = {};

// Check if Gemini API behaves correctly
app.get(["/api/health", "/health"], (req, res) => {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  res.json({
    status: "ok",
    hasApiKey: hasKey,
    environmentStatus: hasKey ? "Ready" : "Waiting for API Key (Fallback Mode Active)",
  });
});

/* ==========================================================================
   FALLBACK DATA FOR INSTANT OFFLINE RUNNING / NO API KEY
   ========================================================================== */
const FallbackItineraries: Record<string, any> = {
  "paris": {
    destination: "Paris, France",
    durationDays: 3,
    totalEstimatedBudget: "$600 - $900 USD",
    travelStyle: "Cultural Explorer",
    summary: "A carefully paced weekend exploring the artistic, historical, and culinary masterpieces of the City of Light.",
    dailyitinerary: [
      {
        day: 1,
        title: "Iconic Landmarks & Golden Hour Cruise",
        activities: [
          {
            time: "Morning (09:00)",
            activity: "Ascend the Eiffel Tower for panoramic views.",
            location: "Champ de Mars, 5 Avenue Anatole France",
            cost: "€28",
            tips: "Book the earliest elevator slot online to avoid long queues.",
            lat: 48.8584,
            lng: 2.2945
          },
          {
            time: "Afternoon (13:30)",
            activity: "Stroll along the historic Champs-Élysées up to the Arc de Triomphe.",
            location: "Place Charles de Gaulle, 75008 Paris",
            cost: "Free (€13 to go up Arc)",
            tips: "Use the underground pedestrian tunnel to access the monument safely.",
            lat: 48.8738,
            lng: 2.2950
          },
          {
            time: "Evening (18:30)",
            activity: "Take an hour-long sunset cruise on the Seine River.",
            location: "Bateaux Parisiens, Port de la Bourdonnais",
            cost: "€18",
            tips: "Arrive 20 minutes early to secure an open-air upper-deck bench.",
            lat: 48.8566,
            lng: 2.2980
          }
        ]
      },
      {
        day: 2,
        title: "Artistic Immersion",
        activities: [
          {
            time: "Morning (09:30)",
            activity: "Explore Mona Lisa and classic collections at the Louvre Museum.",
            location: "Rue de Rivoli, 75001 Paris",
            cost: "€22",
            tips: "Enter through the underground Carrousel du Louvre entrance to skip pyramid lines.",
            lat: 48.8606,
            lng: 2.3376
          },
          {
            time: "Afternoon (14:30)",
            activity: "Walk through the beautiful Tuileries Garden and enjoy a warm Parisian crepe.",
            location: "Place de la Concorde, 75001 Paris",
            cost: "€5 (for crepes)",
            tips: "Find one of the classic green metal chairs near the grand octagonal basin.",
            lat: 48.8635,
            lng: 2.3275
          }
        ]
      },
      {
        day: 3,
        title: "Bohemian Montmartre & Sunset Vista",
        activities: [
          {
            time: "Morning (10:00)",
            activity: "Visit the breathtaking Sacré-Cœur Basilica in Montmartre.",
            location: "35 Rue du Chevalier de la Barre",
            cost: "Free (Dome access holds charge)",
            tips: "Take the funicular if you want to skip the 222 steep steps.",
            lat: 48.8867,
            lng: 2.3431
          }
        ]
      }
    ]
  },
  "kyoto": {
    destination: "Kyoto, Japan",
    durationDays: 2,
    totalEstimatedBudget: "¥30,000 - ¥45,000 JPY",
    travelStyle: "Spiritual & Traditional",
    summary: "Immerse yourself in Kyoto's tranquil zen gardens, imperial architecture, and age-old bamboo groves.",
    dailyitinerary: [
      {
        day: 1,
        title: "Bamboo Forests & Zen Temple Paths",
        activities: [
          {
            time: "Morning (07:30)",
            activity: "Walk through Arashiyama Bamboo Grove before the crowds arrive.",
            location: "Arashiyama, Ukyo Ward, Kyoto",
            cost: "Free",
            tips: "Walk clockwise and keep noise low to enjoy the majestic rustling of leaves.",
            lat: 35.0116,
            lng: 135.6774
          },
          {
            time: "Afternoon (12:00)",
            activity: "Explore Tenryu-ji's magnificent 14th-century landscaped landscape query garden.",
            location: "68 Saga Tenryuji Susukinobabacho",
            cost: "¥500",
            tips: "The garden looks sublime reflected off the main mountain background.",
            lat: 35.0158,
            lng: 135.6777
          }
        ]
      },
      {
        day: 2,
        title: "Thousands of Vermilion Torii Gates",
        activities: [
          {
            time: "Morning (08:00)",
            activity: "Hike through Fushimi Inari-taisha's iconic mountain tunnel paths.",
            location: "68 Fukakusa Yabunouchicho, Fushimi Ward",
            cost: "Free",
            tips: "A full loop takes 2 hours. Go halfway to Yotsutsuji intersection for stunning city views.",
            lat: 34.9671,
            lng: 135.7727
          }
        ]
      }
    ]
  }
};

const FallbackHeritage: Record<string, any> = {
  "taj mahal": {
    siteName: "Taj Mahal",
    location: "Agra, Uttar Pradesh, India",
    yearBuilt: "1631 - 1653",
    history: "An ivory-white marble mausoleum commissioned by the Mughal emperor Shah Jahan to house the tomb of his favorite wife, Mumtaz Mahal. It stands on the southern bank of the Yamuna River and represents the jewel of Mughal mastercraft architecture.",
    narrative: "As you step through the imposing grand red sandstone gate, the majestic white marble monument slowly reveals itself, shimmering in the warm Indian air. Moving inside, the noise of Agra decreases. You are surrounded by symmetrical persian-style gardens (Charbagh) divided by tranquil pools reflecting the towering octagonal dome.",
    sections: [
      {
        name: "The Main Dome and Mausoleum",
        description: "Clad entirely in Makrana marble, incorporating incredibly delicate pietra dura floral inlay made of semi-precious stones (such as lapis lazuli and onyx).",
        interactiveDetailsColor: "Pristine Moonlit White"
      },
      {
        name: "Historical Reflection Pools",
        description: "Perfectly placed reflecting channels aligned symmetrically with the paths that bounce the Taj Mahal's visage flawless in calm mornings.",
        interactiveDetailsColor: "Calming Turquoise"
      },
      {
        name: "The Yamuna River Plinth",
        description: "The rear marble platform that overlooks the placid waters of the Yamuna, glowing in unique copper tones during sunset.",
        interactiveDetailsColor: "Sunburnt Copper"
      }
    ],
    trivia: [
      "The materials were carried by over 1,000 elephants from all corners of Asia.",
      "The minarets are designed to tilt slightly outward, protecting the central tomb in case of a severe earthquake.",
      "Varying times of day paint the pristine white marble in pink, golden, and silver hues."
    ]
  },
  "colosseum": {
    siteName: "Rome Colosseum (Amphitheatrum Flavium)",
    location: "Rome, Italy",
    yearBuilt: "70 - 80 AD",
    history: "Built under the Flavian emperors, the Colosseum is the largest ancient amphitheater ever constructed, hosting gladitor battles, mock sea battles, and public spectacles, housing up to 65,000 spectators.",
    narrative: "You stand atop the wooden arena floor reconstructed over the dark, subterranean tunnels (hypogeum). You can imagine the thunderous roars of sixty thousand Romans. High above, the massive tiered stone columns stretch toward the blue Italian sky.",
    sections: [
      {
        name: "The Hypogeum Tunnels",
        description: "The underground maze of columns, trap doors, and animal lifts used to unleash tigers, leopards, and combatants into the arena suddenly.",
        interactiveDetailsColor: "Ruins Basalt Gray"
      },
      {
        name: "The Gladiator Arena Floor",
        description: "Reconstructed wooden deck where spectacular events and dramatic combats were fought.",
        interactiveDetailsColor: "Bleached Arena Sand"
      }
    ],
    trivia: [
      "The Colosseum was clad in marble and possessed a massive retracting awning called the Velarium to shade spectators.",
      "It was built using loot taken from the Jewish Temple after the Great Jewish Revolt."
    ]
  }
};

const FallbackSafety: Record<string, any> = {
  "paris": {
    destination: "Paris, France",
    lat: 48.8566,
    lng: 2.3522,
    overallSafetyRating: "Moderate Caution (Pickpocket High)",
    safetyIndex: 58,
    commonScams: [
      {
        name: "The Gold Ring Scam",
        description: "An actor pretends to find a solid gold ring on the floor next to you, offering it to you, then aggressively demands cash in exchange."
      },
      {
        name: "String-Bracelet Creators",
        description: "Aggressive merchants around Montmartre grab your hand to wrap colored string around your wrist, completing it and demanding €20+."
      }
    ],
    dangerousAreas: [
      {
        name: "Gare du Nord surrounding alleys",
        description: "Stay vigilant after midnight near station exits where pickpocketing and aggressive solicitations are common.",
        lat: 48.8809,
        lng: 2.3553,
        severity: "high"
      },
      {
        name: "Châtelet les Halles metro corridors",
        description: "transit tunnels and crowded stairways are primary targets for pickpocketing syndicates.",
        lat: 48.8619,
        lng: 2.3470,
        severity: "medium"
      }
    ],
    essentialTips: [
      "Never leave your smartphone lying flat on a cafe table outdoors; swipe is highly common.",
      "Politely decline to sign petitions from groups of teenagers with clipboards."
    ],
    averageCosts: {
      meal: "$18 - $30 USD",
      stay: "$120 - $180 USD / night",
      transport: "€2.15 per metro ticket"
    }
  },
  "kyoto": {
    destination: "Kyoto, Japan",
    lat: 35.0116,
    lng: 135.7681,
    overallSafetyRating: "Excellent (Very Safe)",
    safetyIndex: 88,
    commonScams: [
      {
        name: "Overpriced Gion Izakayas",
        description: "A few places in historical districts might have unlisted table charges or English menus containing higher prices than local ones."
      }
    ],
    dangerousAreas: [
      {
        name: "Gion back alleys walkways",
        description: "Zero physical danger, but please respect geisha borders and do not follow or photograph them.",
        lat: 34.9948,
        lng: 135.7849,
        severity: "medium"
      }
    ],
    essentialTips: [
      "Keep cash handy; although modern, many small traditional noodle stalls and train machines only accept physical bills.",
      "Strictly respect 'no photography' signs in Gion private streets to avoid hefty fines."
    ],
    averageCosts: {
      meal: "¥1,000 - ¥2,500 JPY",
      stay: "¥8,000 - ¥15,000 JPY / night",
      transport: "¥230 per bus ride"
    }
  }
};

/* ==========================================================================
   DYNAMIC PROCEDURAL FALLBACK GENERATORS (WHEN GEMINI RATE LIMITS / FAILS)
   ========================================================================== */

function getDynamicItineraryFallback(destination: string, days: number = 3, budget: string = "moderate", travelStyle: string = "balanced"): any {
  const norm = destination.toLowerCase().trim();
  
  // Determine coordinate base from deterministic hash or preset coordinates for top-tier places
  let hash = 0;
  for (let i = 0; i < destination.length; i++) {
    hash = destination.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let baseLat = 35 + (Math.abs(hash) % 15); // Lat between 35 and 50
  let baseLng = 10 + (Math.abs(hash * 3) % 100); // Lng between 10 and 110 (highly safe land-based corridor across Europe and Asia)
  
  if (norm.includes("paris")) {
    baseLat = 48.8566;
    baseLng = 2.3522;
  } else if (norm.includes("rome")) {
    baseLat = 41.8902;
    baseLng = 12.4922;
  } else if (norm.includes("kyoto")) {
    baseLat = 35.0116;
    baseLng = 135.7681;
  } else if (norm.includes("tokyo")) {
    baseLat = 35.6762;
    baseLng = 139.6503;
  } else if (norm.includes("london")) {
    baseLat = 51.5074;
    baseLng = -0.1278;
  } else if (norm.includes("new york") || norm.includes("nyc")) {
    baseLat = 40.7128;
    baseLng = -74.0060;
  } else if (norm.includes("cairo")) {
    baseLat = 30.0444;
    baseLng = 31.2357;
  } else if (norm.includes("sydney")) {
    baseLat = -33.8688;
    baseLng = 151.2093;
  } else if (norm.includes("delhi") || norm.includes("india")) {
    baseLat = 28.6139;
    baseLng = 77.2090;
  } else if (norm.includes("mumbai")) {
    baseLat = 19.0760;
    baseLng = 72.8777;
  } else if (norm.includes("agra") || norm.includes("taj mahal")) {
    baseLat = 27.1751;
    baseLng = 78.0421;
  } else if (norm.includes("jaipur")) {
    baseLat = 26.9124;
    baseLng = 75.7873;
  } else if (norm.includes("bangalore") || norm.includes("bengaluru")) {
    baseLat = 12.9716;
    baseLng = 77.5946;
  } else if (norm.includes("singapore")) {
    baseLat = 1.3521;
    baseLng = 103.8198;
  }

  const finalDays = Math.min(Math.max(days || 3, 1), 7);
  
  const cleanBudget = String(budget).toLowerCase();
  const isBudget = cleanBudget.includes("budget") || cleanBudget.includes("backpacker") || cleanBudget.includes("tight");
  const isLuxury = cleanBudget.includes("luxury") || cleanBudget.includes("premium");

  const totalEstimatedBudget = isLuxury 
    ? "$1,500 - $3,000 USD" 
    : isBudget 
      ? "$150 - $400 USD" 
      : "$500 - $900 USD";
      
  const themeAdjective = ["Majestic", "Enigmatic", "Sublime", "Timeless", "Vibrant", "Radiant"][Math.abs(hash) % 6];
  const summary = `Welcome to '${destination}'. This bespoke procedural guide is specially compiled to lead you through ${destination}'s most ${themeAdjective.toLowerCase()} landmarks, authentic gastronomy, and scenic panoramas under a balanced '${travelStyle}' lens.`;

  const cleanStyle = String(travelStyle).toLowerCase();
  let styleKey: "cultural" | "foodie" | "outdoors" | "relaxed" = "cultural";
  if (cleanStyle.includes("food") || cleanStyle.includes("culinary") || cleanStyle.includes("cafe")) {
    styleKey = "foodie";
  } else if (cleanStyle.includes("outdoor") || cleanStyle.includes("thrill") || cleanStyle.includes("trek") || cleanStyle.includes("nature")) {
    styleKey = "outdoors";
  } else if (cleanStyle.includes("relax") || cleanStyle.includes("chill") || cleanStyle.includes("slow")) {
    styleKey = "relaxed";
  }

  const styleThemes = {
    cultural: [
      {
        title: "Heritage Heartlands & Ancient Portals",
        acts: [
          { name: "Cultural Plaza Walk", dLat: 0.008, dLng: -0.012, time: "Morning (09:00)", act: "Stroll along the historic central arcade, viewing the stunning local architecture and monument squares.", cost: "Free", tip: "Get a fresh coffee at an old traditional corner cafe." },
          { name: "Historic Sanctuary Peak", dLat: -0.015, dLng: 0.018, time: "Afternoon (14:00)", act: "Climb the panoramic local lookout point or historical clocktower overview.", cost: "$8", tip: "Bring a light jacket as the high viewpoints can get windy." },
          { name: "Waterfront Sunset Rest", dLat: 0.022, dLng: -0.005, time: "Evening (18:30)", act: "Walk down the lovely waterfront parade, enjoying the cool twilight ambiance.", cost: "Free", tip: "Look for street musicians nearby for added atmosphere." }
        ]
      },
      {
        title: "Museum Masterpieces & Archives",
        acts: [
          { name: "National Heritage Museum", dLat: -0.012, dLng: -0.022, time: "Morning (09:30)", act: "Admire historic collections of preserved pottery, local dynasty artifacts, and folk arts.", cost: "$12", tip: "Audio guide is highly recommended to understand historical context." },
          { name: "Ancient Sanctuary Library", dLat: 0.005, dLng: 0.025, time: "Afternoon (14:30)", act: "Rest inside a tranquil medieval courtyard garden or browse the preserve archives.", cost: "Free", tip: "Quiet voices are mandatory around the historical parchment halls." },
          { name: "Traditional Folklore Theater", dLat: -0.008, dLng: -0.003, time: "Evening (19:00)", act: "Behold a vibrant traditional performance showing classical mythologies and music.", cost: "$22", tip: "Take photos without flash to respect the acoustic performers." }
        ]
      },
      {
        title: "Sacred Valleys & Legacy Monuments",
        acts: [
          { name: "Cathedral & Sacred Walkway", dLat: 0.015, dLng: -0.018, time: "Morning (10:00)", act: "Inquire about historical architecture and structural symmetry under cathedral domes.", cost: "Free", tip: "Dress modestly covering shoulders and knees out of respect." },
          { name: "Classic Citadel Ruins", dLat: -0.004, dLng: 0.015, time: "Afternoon (14:30)", act: "Clamber along the old stone towers and learn about ancient defense systems.", cost: "$15", tip: "Durable climbing shoes are recommended for uneven cobblestones." },
          { name: "Heritage Craftsman Workshop", dLat: 0.028, dLng: 0.028, time: "Evening (20:30)", act: "Watch Master craftsmen practicing age-old custom metal or woodcarving arts.", cost: "Free", tip: "Supporting local businesses by buying small trinkets is highly appreciated." }
        ]
      }
    ],
    foodie: [
      {
        title: "Gastronomy Roots & Street Markets",
        acts: [
          { name: "Bustling Street Food Passage", dLat: 0.008, dLng: -0.012, time: "Morning (09:00)", act: "Taste traditional signature breakfast buns, handmade regional noodles, and local pastries.", cost: "Free", tip: "Follow the longest lines for the freshest hot food stalls!" },
          { name: "Heritage Roastery & Cafe", dLat: -0.015, dLng: 0.018, time: "Afternoon (14:00)", act: "Sample micro-lot single-origin coffees brewed using customized ancestral techniques.", cost: "$6", tip: "Ask the barista about the regional beans and roast profile." },
          { name: "Vibrant Night Food Bazaar", dLat: 0.022, dLng: -0.005, time: "Evening (18:30)", act: "Walk through illuminated stalls offering regional spiced snacks and sizzling skewers.", cost: "Free", tip: "Carry small local paper bills; cards are rarely accepted at street stands." }
        ]
      },
      {
        title: "Artisanal Bakeries & Spice Markets",
        acts: [
          { name: "Traditional Spice Exchange", dLat: -0.012, dLng: -0.022, time: "Morning (09:30)", act: "Immerse in aromatic mountains of saffron, cinnamon, and customized regional spices.", cost: "Free", tip: "They package spices in sealed travel-safe bags for flight transit." },
          { name: "Ancient Brickwork Bakery", dLat: 0.005, dLng: 0.025, time: "Afternoon (14:30)", act: "Sample freshly baked sourdough breads and heritage pies straight from wood-fired ovens.", cost: "$8", tip: "Arrive before 2:00 PM before the signature pastries sell out!" },
          { name: "Tasting Tour Dinner Bistro", dLat: -0.008, dLng: -0.003, time: "Evening (19:00)", act: "Enjoy a tailored full course dinner showcasing fusion recipes and heritage marinades.", cost: "$28", tip: "The chef customizes dishes based on guests' culinary style and preferences." }
        ]
      },
      {
        title: "Orchard Trails & Rooftop Dining",
        acts: [
          { name: "Local Greenery Orchard", dLat: 0.015, dLng: -0.018, time: "Morning (10:00)", act: "Breathe in sweet aromas of seasonal fruits and taste handpicked berries and juices.", cost: "Free", tip: "Apply natural sunblock before wandering the fields." },
          { name: "Artisanal Cheese & Oils Larder", dLat: -0.004, dLng: 0.015, time: "Afternoon (14:30)", act: "Indulge in organic cheeses paired with aged vinegars and fresh local olives.", cost: "$15", tip: "Ask for the regional botanical honey drizzle on top." },
          { name: "Panoramic Rooftop Culinary Lounge", dLat: 0.028, dLng: 0.028, time: "Evening (20:30)", act: "Celebrate the sunset with panoramic views paired with handcrafted cordials.", cost: "$35", tip: "Reserve the southwest corner table for direct sunset photography." }
        ]
      }
    ],
    outdoors: [
      {
        title: "Wild Wilderness & Peak Trails",
        acts: [
          { name: "National Park Foothills Trail", dLat: 0.008, dLng: -0.012, time: "Morning (08:30)", act: "Hike along dense pine pathways spotting local bird species and lush flora.", cost: "Free", tip: "Take 1.5 liters of drinking water for this moderate grade trail." },
          { name: "Scenic Suspended Canyon Bridge", dLat: -0.015, dLng: 0.018, time: "Afternoon (14:00)", act: "Cross the scenic suspended bridge overlooking canyon streams.", cost: "$5", tip: "Keep your camera strap secured tightly when looking down." },
          { name: "Mountain Ridge Lodge & Fire", dLat: 0.022, dLng: -0.005, time: "Evening (18:30)", act: "Relax at a rustic outdoor center sharing trek stories by the stone firepit.", cost: "Free", tip: "They offer warm botanical herbal teas for weary hikers." }
        ]
      },
      {
        title: "Cascades & Waterfall Trails",
        acts: [
          { name: "Majestic Hidden Waterfalls", dLat: -0.012, dLng: -0.022, time: "Morning (09:00)", act: "Explore the mist-laden trail to a cascading 50m waterfall.", cost: "Free", tip: "Bring a light waterproof shell or raincoat as spray is dense." },
          { name: "Tranquil River Canyon Kayaking", dLat: 0.005, dLng: 0.025, time: "Afternoon (14:00)", act: "Paddle along beautiful limestone gorges with crystalline turquoise water.", cost: "$25", tip: "Dry bags are provided for your phones and keys." },
          { name: "Riverside Forest Campfire", dLat: -0.008, dLng: -0.003, time: "Evening (19:00)", act: "Watch the brilliant stars align over the dense river forest canopy.", cost: "Free", tip: "Check local regulations regarding firewood sourcing." }
        ]
      },
      {
        title: "Cliffsides & Panoramic Escapades",
        acts: [
          { name: "Coastal Cliff High Path", dLat: 0.015, dLng: -0.018, time: "Morning (09:30)", act: "Trek along high ocean pathways watching waves crash on sandstone crags.", cost: "Free", tip: "Stay on the designated gravel path to avoid loose scree." },
          { name: "Secluded Sea Caverns", dLat: -0.004, dLng: 0.015, time: "Afternoon (14:30)", act: "Scramble down into rocky tidepool caves filled with colorful sea life.", cost: "Free", tip: "Only enter caverns during low tide; consult local maps." },
          { name: "Panoramic High Summit Lookout", dLat: 0.028, dLng: 0.028, time: "Evening (18:30)", act: "Witness an infinite sunset horizon from the highest rock bluff.", cost: "Free", tip: "Pack a headlamp for the hike down after complete darkness." }
        ]
      }
    ],
    relaxed: [
      {
        title: "Boutiques & Secluded Gardens",
        acts: [
          { name: "Quiet Botanic Conservatory", dLat: 0.008, dLng: -0.012, time: "Morning (10:00)", act: "Slow-walk under iron-and-glass arches surrounded by tropical ferns.", cost: "Free", tip: "Great benches inside to read a book in warm light." },
          { name: "Secluded Courtyard Bookshop", dLat: -0.015, dLng: 0.018, time: "Afternoon (14:30)", act: "Browse rare local prints, watercolor cards, and regional maps.", cost: "Free", tip: "Grab a pastry and sit by the central stone fountain." },
          { name: "Acoustic Garden Parlor", dLat: 0.022, dLng: -0.005, time: "Evening (18:30)", act: "Unwind with low sitar or acoustic guitar chords played under fairy lights.", cost: "Free", tip: "They serve organic honey chamomile infusions." }
        ]
      },
      {
        title: "Spiritual Havens & Peaceful Lagoons",
        acts: [
          { name: "Tranquil Zen Reflection Pond", dLat: -0.012, dLng: -0.022, time: "Morning (09:30)", act: "Observe koi fish glinting beneath lotus pads in absolute silence.", cost: "Free", tip: "Spend 20 minutes in quiet meditation at the wooden deck." },
          { name: "Mineral Spring Bathhouse", dLat: 0.005, dLng: 0.025, time: "Afternoon (14:00)", act: "Soak in hot natural volcanic elements inside stone thermal pools.", cost: "$20", tip: "Bring your own organic cotton towel to bypass extra hire costs." },
          { name: "Sunset Floating Gondola", dLat: -0.008, dLng: -0.003, time: "Evening (17:30)", act: "Drift down historical canals watching ancient facades turn gold.", cost: "$15", tip: "Highly romantic photo opportunity with zero physical effort." }
        ]
      },
      {
        title: "Cozy Teahouses & Art Sanctuaries",
        acts: [
          { name: "Riverside Bamboo Teahouse", dLat: 0.015, dLng: -0.018, time: "Morning (10:30)", act: "Enjoy a ceremonial tea presentation with fresh matcha and dumplings.", cost: "$12", tip: "Take off your shoes before stepping onto the traditional mats." },
          { name: "Boutique Sculptures Greenhouse", dLat: -0.004, dLng: 0.015, time: "Afternoon (14:30)", act: "Wander through indoor tropical groves with fine clay sculpture installations.", cost: "Free", tip: "The artisan workshops are open to look inside next door." },
          { name: "Seaside Quiet Horizon Deck", dLat: 0.028, dLng: 0.028, time: "Evening (19:00)", act: "Sip custom botanical sodas listening to gentle tide lapping on stones.", cost: "$8", tip: "They have cozy woven blankets for guests as ocean breeze sets in." }
        ]
      }
    ]
  };

  const dayThemes = styleThemes[styleKey];

  const dailyitinerary = [];
  for (let d = 1; d <= finalDays; d++) {
    const themeIdx = (d - 1) % dayThemes.length;
    const currentTheme = dayThemes[themeIdx];
    
    const activities = currentTheme.acts.map((actDef) => {
      let finalCost = actDef.cost;
      let finalTip = actDef.tip;

      if (isBudget) {
        if (actDef.cost !== "Free" && !actDef.cost.includes("Free")) {
          const rawPrice = Number(actDef.cost.replace(/[^0-9]/g, ""));
          finalCost = rawPrice ? `$${Math.ceil(rawPrice * 0.4)}` : "Free";
        }
        finalTip = `Saver Tip: ${actDef.tip}`;
      } else if (isLuxury) {
        if (actDef.cost !== "Free" && !actDef.cost.includes("Free")) {
          const rawPrice = Number(actDef.cost.replace(/[^0-9]/g, ""));
          finalCost = rawPrice ? `$${Math.ceil(rawPrice * 3.5)}` : "$55";
        } else {
          finalCost = "$25 (Premium Entry)";
        }
        finalTip = `VIP Choice: ${actDef.tip}`;
      }

      return {
        time: actDef.time,
        activity: actDef.act,
        location: `${actDef.name}, ${destination}`,
        cost: finalCost,
        tips: finalTip,
        lat: Number((baseLat + actDef.dLat).toFixed(4)),
        lng: Number((baseLng + actDef.dLng).toFixed(4))
      };
    });
    
    dailyitinerary.push({
      day: d,
      title: `${currentTheme.title}`,
      activities
    });
  }

  return {
    destination,
    durationDays: finalDays,
    totalEstimatedBudget,
    travelStyle,
    summary,
    dailyitinerary
  };
}

function getDynamicHeritageFallback(siteName: string): any {
  const norm = siteName.toLowerCase().trim();
  if (norm.includes("taj mahal")) return FallbackHeritage["taj mahal"];
  if (norm.includes("colosseum")) return FallbackHeritage["colosseum"];
  
  let hash = 0;
  for (let i = 0; i < siteName.length; i++) {
    hash = siteName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const century = 10 + (Math.abs(hash) % 9); // Between 10th and 18th century
  const yearBuilt = `${century}42 - ${century}68 AD`;
  const location = ["Andean Highlands", "Mediterranean Basin", "Sacred Valleys", "Imperial Capital Fields", "Desert Oasis Crossroads"][Math.abs(hash) % 5];
  
  return {
    siteName,
    location,
    yearBuilt,
    history: `The historical landmark of ${siteName} stands in the historic region of ${location}. Commissioned during a golden age of craftsmanship and architectural mastery, this structure served as a monumental hub for traditional gatherings, sacred observations, and cultural exchanges, enduring through generations as a monument of human heritage.`,
    narrative: `Walking through the sandstone portals of ${siteName}, the atmosphere shifts instantly. Sunlight beams cascade across weathered pillars, illuminating soft patterns of traditional artwork. The distant echo of steps or rustling wind through chambers creates a deeply meditative sensory walk, immersing you in centuries of historical memory and structural symmetry.`,
    sections: [
      {
        name: "The Grand Portals & Pillars",
        description: "The primary structural entrance, decorated with hand-sculpted intricate designs representing the star alignments and regional folklore.",
        interactiveDetailsColor: "Ancient Ochre Sandstone"
      },
      {
        name: "Imperial Hall & Central Plinth",
        description: "The expansive interior core, designed to echo sounds and focus natural lighting perfectly during the morning hours.",
        interactiveDetailsColor: "Sunlit Terracotta"
      },
      {
        name: "The Sanctum Lookout Chamber",
        description: "An elevated high-contrast chamber featuring strategic viewing balconies over the surrounding landscapes and reflecting channels.",
        interactiveDetailsColor: "Imperial Slate Teal"
      }
    ],
    trivia: [
      `Constructing ${siteName} took an estimated 25 years and employed thousands of master stonemasons working with premium local resources.`,
      "Subtle architectural slants in the support columns double as defensive structures against windstorms and tectonic movements."
    ]
  };
}

function getDynamicSafetyFallback(destination: string): any {
  const norm = destination.toLowerCase().trim();
  if (norm.includes("paris")) return FallbackSafety["paris"];
  if (norm.includes("kyoto")) return FallbackSafety["kyoto"];
  
  let hash = 0;
  for (let i = 0; i < destination.length; i++) {
    hash = destination.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const lat = 30 + (Math.abs(hash) % 20); // Lat between 30 and 50
  const lng = -20 + (Math.abs(hash * 3) % 150); // Lng between -20 and 130
  const safetyIndex = 60 + (Math.abs(hash) % 32); // Between 60 and 92
  let rating = "Highly Safe";
  if (safetyIndex < 70) rating = "Moderate Caution (Pickpockets Active)";
  else if (safetyIndex < 85) rating = "Safe (Exercise Normal Caution)";

  return {
    destination,
    lat,
    lng,
    overallSafetyRating: rating,
    safetyIndex,
    commonScams: [
      {
        name: "The Taxi Meter Drift",
        description: `Unregulated street cabs may claim meters are broken and charge premium flat fees or take circuitous streets around central ${destination}.`
      },
      {
        name: "The Local Teahouse Invitation",
        description: "Outgoing strangers may strike up conversations to invite you to exclusive hidden local bars, leaving you with an astronomical menu charge."
      }
    ],
    dangerousAreas: [
      {
        name: `Railway terminals after 23:00`,
        description: `Dimly lit alleys immediately outside central arrival spots in ${destination} present elevated risk profiles.`,
        lat: lat + 0.012,
        lng: lng - 0.009,
        severity: "high"
      },
      {
        name: "Central night market crowds",
        description: "Congested public transport lanes are prone to transient pocket-picking events under cover.",
        lat: lat - 0.008,
        lng: lng + 0.015,
        severity: "medium"
      }
    ],
    essentialTips: [
      `Regularly reserve your transport rides through official smartphone applications instead of hailing unregistered vehicles.`,
      `Always keep your purse or travel luggage zipped and positioned in front of you while exploring crowded markets.`
    ],
    averageCosts: {
      meal: "$12 - $22 USD",
      stay: "$90 - $160 USD / night",
      transport: "Local public transport tickets average $1.50 - $3.00"
    }
  };
}

function getDynamicBlogFallback(theme: string, destination: string): any {
  let hash = 0;
  const combo = `${theme}-${destination}`;
  for (let i = 0; i < combo.length; i++) {
    hash = combo.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const adjective = ["Hidden Secrets", "Wandering Paths", "Quiet Moments", "Spiritual Walks", "Tasting Journeys"][Math.abs(hash) % 5];
  const title = `The Silent Charm of ${destination}: ${theme || adjective}`;
  
  const paragraphs = [
    `There is a certain gravity about ${destination} that pulls you out of your daily routine and demands your full sensory attention. Whether you are navigating the intricate corridors of its oldest neighborhoods or sipping tea in a quiet botanical corner, this place speaks in a language of weathered stones, golden sunlight prisms, and sweet oceanic air.`,
    `Our journey focused on finding the true, slow-paced heartbeat of the area—far removed from crowded tour buses and generic tourist brochures. We spent hours chatting with local craftsmen, exploring traditional family-owned stalls, and tracing the symmetrical layouts of ancient clocktowers that stand tall as majestic reminders of the passing years.`,
    `To experience ${destination} fully is to embrace the unexpected. Let yourself get lost along the cobblestone paths, order the chef's special lunch without questioning the menu, and pause at sunset to listen to the distant chorus of local music playing in the twilight breeze. You will leave with a permanent badge of memories.`
  ];

  return {
    title,
    content: paragraphs.join("\n\n"),
    tags: [destination, theme || "Wanderlust", "Traditional", "SlowTravel"],
    coverPrompt: `Cinematic sun-drenched street scenery in ${destination} with beautiful traditional architecture, warm light beams, and elegant deep shadows.`
  };
}

/* ==========================================================================
   AI TRAVEL PLANNER ENDPOINT
   ========================================================================== */
app.post(["/api/generate-itinerary", "/generate-itinerary"], async (req, res) => {
  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const destination = body.destination;
  const days = body.days;
  const budget = body.budget;
  const travelStyle = body.travelStyle;

  if (!destination) {
    return res.status(400).json({ error: "Destination is required." });
  }

  const normDest = String(destination).toLowerCase().trim();
  const cacheKey = `itinerary-${normDest}-${days || 3}-${String(budget).toLowerCase().trim()}-${String(travelStyle).toLowerCase().trim()}`;

  if (ApiCache[cacheKey]) {
    console.log(`[Cache Hit] Returning itinerary for '${destination}' from memory cache.`);
    return res.json(ApiCache[cacheKey]);
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      You are an elite, world-class travel planner and localized cultural guide.
      Create a detailed personalized travel itinerary for:
      - Destination: ${destination}
      - Duration: ${days || 3} days
      - Budget category/currency: ${budget || "moderate"}
      - Travel Style: ${travelStyle || "cultural exploration"}

      You MUST output the result strictly as a valid JSON object matching this schema.
      Do not include any wrapping markdown formatting like \`\`\`json outside of standard plain text, or return anything else.

      JSON Structure:
      {
        "destination": "String (Normalized Destination Name)",
        "durationDays": Integer,
        "totalEstimatedBudget": "String (e.g. '$600 - $800 USD')",
        "travelStyle": "String (Matched travel style)",
        "summary": "String (An engaging short overview paragraph of why this itinerary is incredible)",
        "dailyitinerary": [
          {
            "day": Integer,
            "title": "String (Theme name for this day)",
            "activities": [
              {
                "time": "String (e.g. 'Morning (09:00)' or 'Evening')",
                "activity": "String (Highly cultural, specific activity)",
                "location": "String (Real geographical place name or address)",
                "cost": "String (Estimated local cost e.g. '$15' or 'Free')",
                "tips": "String (Insider traveler tip for this location or activity)",
                "lat": Float (Actual real-world Latitude coordinate, e.g. 48.8584 for Eiffel Tower)",
                "lng": Float (Actual real-world Longitude coordinate, e.g. 2.2945 for Eiffel Tower)"
              }
            ]
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            durationDays: { type: Type.INTEGER },
            totalEstimatedBudget: { type: Type.STRING },
            travelStyle: { type: Type.STRING },
            summary: { type: Type.STRING },
            dailyitinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        activity: { type: Type.STRING },
                        location: { type: Type.STRING },
                        cost: { type: Type.STRING },
                        tips: { type: Type.STRING },
                        lat: { type: Type.NUMBER },
                        lng: { type: Type.NUMBER }
                      },
                      required: ["time", "activity", "location", "cost", "tips", "lat", "lng"]
                    }
                  }
                },
                required: ["day", "title", "activities"]
              }
            }
          },
          required: ["destination", "durationDays", "totalEstimatedBudget", "travelStyle", "summary", "dailyitinerary"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    ApiCache[cacheKey] = parsedData;
    return res.json(parsedData);

  } catch (error: any) {
    const errorMsg = error?.message || String(error || "Unknown Gemini API error");
    console.error(`[Itinerary Plan Error]:`, errorMsg);
    const simulatedResponse = getDynamicItineraryFallback(destination, Number(days), String(budget), String(travelStyle));
    return res.json({
      ...simulatedResponse,
      _isFallback: true,
      _errorMsg: errorMsg
    });
  }
});

/* ==========================================================================
   VIRTUAL HERITAGE EXPLORER ENDPOINT
   ========================================================================== */
app.post(["/api/virtual-heritage", "/virtual-heritage"], async (req, res) => {
  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const siteName = body.siteName;

  if (!siteName) {
    return res.status(400).json({ error: "Site name is required." });
  }

  const normSite = String(siteName).toLowerCase().trim();
  const cacheKey = `heritage-${normSite}`;

  if (ApiCache[cacheKey]) {
    console.log(`[Cache Hit] Returning heritage details for '${siteName}' from memory cache.`);
    return res.json(ApiCache[cacheKey]);
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      You are a brilliant virtual tourist guide and highly-educated historical curator.
      Provide an immersive, extremely detailed virtual heritage tour guide of: '${siteName}'.

      Describe the historic details, a deep sensory narrative, and detailed sections matching this exact JSON schema:
      - Site Name
      - Location
      - Year Built
      - History
      - Deep Sensory Narrative (What does it feel and sound like walking around the site?)
      - Key structural sections to highlight
      - A few fascinating trivia points

      JSON Structure:
      {
        "siteName": "String",
        "location": "String",
        "yearBuilt": "String",
        "history": "String",
        "narrative": "String (Multi-sensory walkaround narrative)",
        "sections": [
          {
            "name": "String",
            "description": "String (Fascinating specific description)",
            "interactiveDetailsColor": "String (A beautiful visual color label describing this landmark area vibe, e.g. 'Royal Velvet Crimson')"
          }
        ],
        "trivia": ["String (Fascinating historical trivia piece 1)", "String (Fascinating historical trivia piece 2)"]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            siteName: { type: Type.STRING },
            location: { type: Type.STRING },
            yearBuilt: { type: Type.STRING },
            history: { type: Type.STRING },
            narrative: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  interactiveDetailsColor: { type: Type.STRING }
                },
                required: ["name", "description"]
              }
            },
            trivia: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["siteName", "location", "yearBuilt", "history", "narrative", "sections", "trivia"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    ApiCache[cacheKey] = parsedData;
    return res.json(parsedData);

  } catch (error: any) {
    const errorMsg = error?.message || String(error || "Unknown Gemini API error");
    console.error(`[Heritage Tour Error]:`, errorMsg);
    const simulatedResponse = getDynamicHeritageFallback(siteName);
    return res.json({
      ...simulatedResponse,
      _isFallback: true,
      _errorMsg: errorMsg
    });
  }
});

/* ==========================================================================
   DESTINATION SAFETY & BUDGET ANALYSIS
   ========================================================================== */
app.post(["/api/safety-analysis", "/safety-analysis"], async (req, res) => {
  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const destination = body.destination;

  if (!destination) {
    return res.status(400).json({ error: "Destination is required." });
  }

  const normDest = String(destination).toLowerCase().trim();
  const cacheKey = `safety-${normDest}`;

  if (ApiCache[cacheKey]) {
    console.log(`[Cache Hit] Returning safety analysis for '${destination}' from memory cache.`);
    return res.json(ApiCache[cacheKey]);
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      You are an expert travel safety analyst and local risk advisor.
      Analyze the destination: '${destination}'.
      Provide safety ratings, indices, dangerous areas (if any), standard travel scams to avoid, cost averages, and robust travel advice.
      Estimate the latitude and longitude of the destination and each identified dangerous hazard area precisely.
      Output strictly as a valid JSON object matching the schema below.

      JSON Structure:
      {
        "destination": "String",
        "lat": LatNumber,
        "lng": LngNumber,
        "overallSafetyRating": "String (e.g. 'Very Safe', 'Exercise Normal Caution', 'High Alert')",
        "safetyIndex": Integer (0 to 100 where 100 is perfectly safe),
        "commonScams": [
          {
            "name": "String (The scam name)",
            "description": "String (How it works and how to avoid it)"
          }
        ],
        "dangerousAreas": [
          {
            "name": "String (Area name)",
            "description": "String (Risk description and advice)",
            "lat": Number (estimated local coordinate),
            "lng": Number (estimated local coordinate),
            "severity": "String ('high' or 'medium')"
          }
        ],
        "essentialTips": ["String (Tip 1)", "String (Tip 2)"],
        "averageCosts": {
          "meal": "String (e.g. '$12 - $18')",
          "stay": "String (e.g. '$80 / night')",
          "transport": "String (e.g. '$2.50 ticket')"
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
            overallSafetyRating: { type: Type.STRING },
            safetyIndex: { type: Type.INTEGER },
            commonScams: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "description"]
              }
            },
            dangerousAreas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  severity: { type: Type.STRING }
                },
                required: ["name", "description", "lat", "lng", "severity"]
              }
            },
            essentialTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            averageCosts: {
              type: Type.OBJECT,
              properties: {
                meal: { type: Type.STRING },
                stay: { type: Type.STRING },
                transport: { type: Type.STRING }
              },
              required: ["meal", "stay", "transport"]
            }
          },
          required: ["destination", "lat", "lng", "overallSafetyRating", "safetyIndex", "commonScams", "dangerousAreas", "essentialTips", "averageCosts"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    ApiCache[cacheKey] = parsedData;
    return res.json(parsedData);

  } catch (error: any) {
    const errorMsg = error?.message || String(error || "Unknown Gemini API error");
    console.error(`[Safety Analysis Error]:`, errorMsg);
    const simulatedResponse = getDynamicSafetyFallback(destination);
    return res.json({
      ...simulatedResponse,
      _isFallback: true,
      _errorMsg: errorMsg
    });
  }
});

/* ==========================================================================
   BLOG ASSISTANCE / CONTENT CREATOR ENDPOINT
   ========================================================================== */
app.post(["/api/blog-assistance", "/blog-assistance"], async (req, res) => {
  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const theme = body.theme;
  const destination = body.destination;

  const normDest = String(destination || "anywhere").toLowerCase().trim();
  const normTheme = String(theme || "hiddengems").toLowerCase().trim();
  const cacheKey = `blog-${normDest}-${normTheme}`;

  if (ApiCache[cacheKey]) {
    console.log(`[Cache Hit] Returning microblog draft for '${destination}' - '${theme}' from memory cache.`);
    return res.json(ApiCache[cacheKey]);
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      You are an award-winning travel blogger and master copywriter.
      Generate a stunning micro-blog post based on:
      - Theme: ${theme || "Hidden Gems or Street Food"}
      - Destination: ${destination || "anywhere interesting"}

      Output strictly as a valid JSON object matching the schema below.
      Write the content in high-quality descriptive travel writing style.

      JSON Structure:
      {
        "title": "String (Catchy, poetic blog title)",
        "content": "String (Extremely engaging 3-paragraph travel story or review containing rich descriptions)",
        "tags": ["String (Tag 1)", "String (Tag 2)"],
        "coverPrompt": "String (A high-quality text-to-image prompt to generate a beautiful background overlay)"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            coverPrompt: { type: Type.STRING }
          },
          required: ["title", "content", "tags", "coverPrompt"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    ApiCache[cacheKey] = parsedData;
    return res.json(parsedData);

  } catch (error: any) {
    const errorMsg = error?.message || String(error || "Unknown Gemini API error");
    console.error(`[Blog Assist Error]:`, errorMsg);
    const simulatedResponse = getDynamicBlogFallback(String(theme), String(destination));
    return res.json({
      ...simulatedResponse,
      _isFallback: true,
      _errorMsg: errorMsg
    });
  }
});

/* ==========================================================================
   VITE & STATIC ASSET HOSTING FOR SPA
   ========================================================================== */
async function setupViteProduction() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ODYSSEY SERVER] Running perfectly at http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  setupViteProduction();
}
