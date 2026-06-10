# 🧭 ODYSSEY | AI-Powered Intelligent Travel Platform

**ODYSSEY** is an elite, world-class travel companion that leverages the power of Google Gemini AI to provide travelers with bespoke itineraries, immersive heritage tours, and real-time safety analytics. Whether you're exploring the bamboo forests of Kyoto or the ruins of Rome, Odyssey ensures your journey is inspired, safe, and culturally enriched.

---

## ✨ Key Features

### 🗺️ AI Travel Planner
*   **Bespoke Itineraries:** Generate multi-day travel plans tailored to your destination, budget, and travel style (Foodie, Cultural, Adventure, or Relaxed).
*   **Geospatial Plotting:** All activities are automatically plotted on an interactive map with real-world coordinates.
*   **Offline Fallback:** Robust procedural generators provide high-quality simulated data if the AI API is unreachable.

### 🏛️ Virtual Heritage Explorer
*   **Immersive Narratives:** Deep sensory descriptions of global landmarks, from the Taj Mahal to Machu Picchu.
*   **Guardian AI Chat:** An interactive "Heritage Guardian" chat system to answer specific questions about historical sites and secret lore.
*   **Architectural Spotlights:** Detailed breakdowns of structural masterpieces and astronomical alignments.

### 🛡️ Safety & Scam Advisor
*   **Risk Vector Mapping:** Real-time heatmaps identifying "Caution Areas" vs. "Safe Zones."
*   **Scam Encyclopedia:** Stay ahead of local tourist traps with specific descriptions of common scams (e.g., "The Gold Ring Scam" in Paris).
*   **Budget Analysis:** Live estimates for average meal, transport, and accommodation costs.

### ✍️ Traveler Stories & AI Co-Writer
*   **Authentic Journals:** Share your own travel experiences with the community.
*   **AI Blog Assist:** Stuck on a title or description? The AI assistant can draft poetic micro-blogs based on your destination and theme.

### 🏆 Gamification
*   **Souvenir Achievements:** Earn digital badges and "stamps" as you use the platform’s tools—from plotting routes to scanning for safety risks.

---

## 🚀 Tech Stack

### Frontend
*   **React + TypeScript:** For a robust, type-safe UI.
*   **Tailwind CSS:** Modern, utility-first styling with a custom "Odyssey" design system.
*   **Framer Motion:** High-fidelity fluid animations and transitions.
*   **Leaflet.js:** Interactive mapping with custom themes (Satellite, Dark, Voyager).

### Backend
*   **Express.js:** Lightweight and fast Node.js server.
*   **Google Gemini AI:** Integration via `@google/genai` for multi-model AI synthesis.
*   **Vite:** Blazing fast build tool and development server.

---

## 📂 Project Structure

```text
ODYSSEY_AI_Travel_Platform/
├── src/
│   ├── components/       # Reusable React components (Map, Chat, etc.)
│   ├── types/            # TypeScript interface definitions
│   ├── App.tsx           # Main application logic and routing
│   └── index.css         # Tailwind styles and custom theme variables
├── server.ts             # Express server with Gemini AI endpoints
├── vite.config.ts        # Vite configuration for SPA and HMR
├── .env                  # Environment variables (API Keys)
└── package.json          # Project dependencies
```

---

## 🛠️ Installation & Setup

### 1. Prerequisites
*   Node.js (v18 or higher)
*   A **Google Gemini API Key** (Get one at AI Studio)

### 2. Clone the Repository
```bash
git clone https://github.com/bikram73/odyssey-ai-travel.git
cd odyssey-ai-travel
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### 5. Run the Application
To start the full-stack application (Vite + Express):
```bash
npm start
```
*The application will be running at `http://localhost:3000`.*

---

## 🌍 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/generate-itinerary` | `POST` | Generates a structured JSON travel plan. |
| `/api/virtual-heritage` | `POST` | Fetches historical details and sensory narratives. |
| `/api/safety-analysis` | `POST` | Provides safety indices and scam reports. |
| `/api/blog-assistance` | `POST` | Drafts AI-powered travel blog content. |
| `/api/health` | `GET` | Checks API key and server environment status. |

---

## 🛡️ License
This project is licensed under the MIT License.

---

*Developed with ❤️ for global explorers.*

[!AI Powered](https://deepmind.google/technologies/gemini/)
[!Odyssey Mode](#)