import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Shield, User } from "lucide-react";

interface Message {
  sender: "user" | "curator";
  text: string;
}

interface AICuratorChatProps {
  siteName: string;
  yearBuilt: string;
}

export function AICuratorChat({ siteName, yearBuilt }: AICuratorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "curator",
      text: `Welcome, traveler. I am the resident guardian of ${siteName || "this magnificent heritage platform"}. I have studied its architecture and sacred grounds for decades, with records tracing back near ${yearBuilt || "antiquity"}. Ask me anything about its secrets, construction challenges, or hidden lore.`,
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal;
    setInputVal("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      // Query the server route (we can do a simple post to a curated answer helper or use direct answers)
      const res = await fetch("/api/virtual-heritage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName: `${siteName} Question: ${userText}` }),
      });

      if (!res.ok) throw new Error("Connection failed");
      const data = await res.json();

      // Formulate a beautiful curator-oriented paragraph response
      // Either use the generated response, or a highly structured summary text
      const curatorParagraph = data.narrative || `I have consulted the historic archives regarding your query about ${siteName}. It represents a unique architectural marvel, featuring detailed artisan construction techniques and rich spiritual backgrounds that travelers from all centuries admire. Let me know if there are specific sections you wish to explore deeper!`;

      setMessages((prev) => [...prev, { sender: "curator", text: curatorParagraph }]);
    } catch (err) {
      // Prompt high-quality automated local curator feedback in case model is offline
      setTimeout(() => {
        let responseFallback = "";
        const query = userText.toLowerCase();

        if (query.includes("who") || query.includes("create") || query.includes("built")) {
          responseFallback = `The master artisans and engineers of that age dedicated immense resources to erecting ${siteName}. Thousands of dedicated builders collaborated to sculpt this masterpiece under strict celestial alignments.`;
        } else if (query.includes("why") || query.includes("reason") || query.includes("purpose")) {
          responseFallback = `It was raised primarily to encapsulate the high ideals, spiritual values, or loving memories of its era, serving as a physical manifestation of timeless grace.`;
        } else if (query.includes("secret") || query.includes("hidden") || query.includes("tomb")) {
          responseFallback = `Legend says there are hidden chambers beneath the foundational plinths. Structural studies confirm ancient subterranean acoustic grids exist to disperse resonance!`;
        } else {
          responseFallback = `Ah, a profound question. Regarding '${userText}' at ${siteName}, our ancient texts tell us that every marble panel and decorative column was designed to evoke a feeling of awe, reminding travelers of humanity's endless creative heights.`;
        }

        setMessages((prev) => [...prev, { sender: "curator", text: responseFallback }]);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-outline-variant/20 p-5 flex flex-col h-[350px] shadow-[0px_4px_20px_rgba(15,76,129,0.03)]">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
        <div className="p-1.5 bg-surface-container text-[#006a61] rounded-lg">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#00355f] font-bold">HERITAGE GUARDIAN</h4>
          <p className="text-[10px] text-[#42474f] font-medium font-display">Ask authentic secrets of {siteName}</p>
        </div>
      </div>

      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-3 select-text scrollbar-thin">
        {messages.map((m, idx) => (
          <div
            key={`msg-${idx}`}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg flex-shrink-0 ${
                m.sender === "user" ? "bg-slate-100 text-slate-700" : "bg-[#eff4ff] text-[#00355f]"
              }`}
            >
              {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-[#00355f] text-slate-100 rounded-tr-none"
                  : "bg-[#eff4ff] text-[#0b1c30] rounded-tl-none font-medium"
              }`}
            >
              <p>{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-1.5 text-[10px] text-[#006a61] font-mono italic animate-pulse pl-2_">
            <Sparkles className="w-3.5 h-3.5 text-[#006a61]" />
            <span>Curator is inspecting old parchment rolls...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Inquire about ${siteName || "monument"}...`}
          className="flex-1 bg-slate-50 border border-outline-variant/30 text-xs rounded-xl px-3 focus:outline-none focus:ring-1 focus:ring-[#00355f] focus:border-[#00355f] py-2"
        />
        <button
          type="submit"
          className="bg-[#00355f] hover:bg-[#0f4c81] text-white rounded-xl px-4 py-2 flex items-center justify-center transition-all shadow-sm cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
