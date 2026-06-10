export interface Activity {
  time: string;
  activity: string;
  location: string;
  cost: string;
  tips: string;
  lat: number;
  lng: number;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Itinerary {
  id?: string;
  destination: string;
  durationDays: number;
  totalEstimatedBudget: string;
  travelStyle: string;
  summary: string;
  dailyitinerary: DayPlan[];
}

export interface HeritageSection {
  name: string;
  description: string;
  interactiveDetailsColor?: string;
}

export interface HeritageTour {
  siteName: string;
  location: string;
  yearBuilt: string;
  history: string;
  narrative: string;
  sections: HeritageSection[];
  trivia: string[];
}

export interface ScamInfo {
  name: string;
  description: string;
}

export interface SafetyAnalysis {
  destination: string;
  overallSafetyRating: string;
  safetyIndex: number;
  commonScams: ScamInfo[];
  dangerousAreas: string[];
  essentialTips: string[];
  averageCosts: {
    meal: string;
    stay: string;
    transport: string;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  tags: string[];
  coverPrompt?: string;
  imageUrl?: string;
  likes: number;
}
