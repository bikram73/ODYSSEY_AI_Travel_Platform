# 🧭 ODYSSEY | AI-Powered Intelligent Travel Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![AI Powered](https://img.shields.io/badge/AI-Gemini%203.5%20Flash-blue)](https://deepmind.google/technologies/gemini/)
<div align="center">
  <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80" width="100%" alt="Odyssey Banner" style="border-radius: 20px; margin-bottom: 20px;"/>
</div>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![AI Powered](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue)](https://deepmind.google/technologies/gemini/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20TS-61dafb)](https://reactjs.org/)

**ODYSSEY** is an elite, world-class travel companion that leverages the power of **Google Gemini 1.5 Flash** to provide travelers with bespoke itineraries, immersive heritage tours, and real-time safety analytics. 

Whether you're exploring the hidden alleys of Lisbon or the ancient ruins of Rome, Odyssey ensures your journey is inspired, safe, and culturally enriched through high-fidelity neural synthesis and interactive mapping.

---

## 📺 Preview
> *Imagine high-resolution screenshots of your Dashboard, AI Planner, and Virtual Heritage Explorer here.*
> ![Odyssey Dashboard Placeholder](https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Key Features

### 🗺️ AI Travel Planner
*   **Bespoke Itineraries:** Generate multi-day travel plans tailored to your destination, budget, and travel style (Foodie, Cultural, Adventure, or Relaxed).
*   **Geospatial Plotting:** All activities are automatically plotted on an interactive map with real-world coordinates.
*   **Intelligent Routing:** Sequential path-finding visualizes your daily journey with distance estimates and transport suggestions.

### 🏛️ Virtual Heritage Explorer
*   **Immersive Narratives:** Deep sensory descriptions of global landmarks, from the Taj Mahal to Machu Picchu.
*   **Heritage Guardian AI:** An interactive chat system that "lives" in the monument, answering questions about construction secrets and hidden lore.
*   **Architectural Spotlights:** Detailed breakdowns of structural masterpieces and astronomical alignments.

### 🛡️ Safety & Scam Advisor
*   **Safety Vector Mapping:** Real-time geospatial heatmaps identifying "Caution Areas" vs. "Safe Zones" based on traveler data.
*   **Scam Encyclopedia:** Stay ahead of local tourist traps with detailed descriptions of common scams (e.g., "The Gold Ring Scam").
*   **Budget Analysis:** Live estimates for average meal, transport, and accommodation costs.

### ✍️ Traveler Chronicles
*   **Authentic Journals:** Share your own travel experiences with a global community.
*   **AI Blog Assist:** Stuck on a title or description? The AI assistant can draft poetic micro-blogs based on your destination and theme.

### 🏆 Explorer Achievement System
*   **Souvenir Achievements:** Earn digital badges and "stamps" as you use the platform’s tools—from plotting routes to scanning for safety risks.
*   **Pilgrim Tracking:** Tracks your virtual visits to world heritage sites.
---

## 🚀 Tech Stack

### Frontend
*   **React + TypeScript:** For a robust, type-safe UI.
*   **Tailwind CSS:** Modern, utility-first styling with a custom "Odyssey" design system.
*   **Framer Motion:** High-fidelity fluid animations and transitions.
*   **Leaflet.js:** Interactive mapping with custom themes (Satellite, Dark, Voyager).

### Backend
*   **Node.js & Express:** Robust backend architecture with custom middleware for serverless environment compatibility.
*   **Google Gemini 1.5 Flash:** Utilizing JSON-schema output modes for structured travel data.
*   **Procedural Fallback Engine:** A deterministic hashing system that generates high-quality simulated travel data when API limits are reached.
*   **Vite:** Blazing fast HMR and optimized production builds.

---

## ⚙️ Advanced Logic: The Fallback Engine
Odyssey is built for resilience. If the Gemini API is unreachable or rate-limited, the system automatically switches to a **Dynamic Procedural Generator**. 

Using a deterministic hashing algorithm based on your destination name, it creates:
- **Geographic Mesh:** Realistic coordinates within the target region.
- **Thematic Consistency:** Itineraries that match your chosen style (Foodie, Cultural, etc.) even while offline.

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
git clone https://github.com/bikram73/ODYSSEY_AI_Travel_Platform.git
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
This project is licensed under the MIT License [![License: MIT](LICENSE)
