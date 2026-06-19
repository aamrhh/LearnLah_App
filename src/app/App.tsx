import { useState, useEffect, useRef } from "react";
import {
  Send, Bot, MessageSquare, Zap, TrendingUp,
  ArrowLeft, Mic, Play, Volume2, Keyboard, BookOpen,
  Check, X, Square,
} from "lucide-react";

type ChallengeId = "word-builder" | "speaking" | "listening" | "speed-typing";

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = "chatbot" | "chat" | "challenge" | "progress";

interface Contact {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  lastMessageEN: string;
  time: string;
  streak: number;
  streakActive: boolean;
  unread?: number;
}

interface ChatMessage {
  id: string;
  text: string;
  translation: string;
  sent: boolean;
  time: string;
}

interface BotMessage {
  id: string;
  text: string;
  isBot: boolean;
}

interface Friend {
  id: string;
  name: string;
  flag: string;
  country: string;
  streak: number;
  online: boolean;
}

// ── Data ───────────────────────────────────────────────────────────────────

const CONTACTS: Contact[] = [
  { id: "1", name: "Hidayat Nordin", initials: "HN", lastMessage: "Haha betul tu bro!", lastMessageEN: "Haha that's true bro!", time: "09:41", streak: 14, streakActive: true, unread: 2 },
  { id: "2", name: "Jungkook", initials: "JK", lastMessage: "Jumpa esok ya!", lastMessageEN: "See you tomorrow!", time: "09:12", streak: 7, streakActive: true, unread: 1 },
  { id: "3", name: "Ryul", initials: "RY", lastMessage: "Terima kasih banyak-banyak.", lastMessageEN: "Thank you very much.", time: "Yesterday", streak: 3, streakActive: true },
  { id: "4", name: "Buzz Lightyear", initials: "BL", lastMessage: "Saya tidak faham soalan ini.", lastMessageEN: "I don't understand this question.", time: "Monday", streak: 22, streakActive: true },
  { id: "5", name: "Syamina", initials: "SY", lastMessage: "Sampai jumpa!", lastMessageEN: "Goodbye!", time: "Sunday", streak: 5, streakActive: false },
  { id: "6", name: "Firzanah", initials: "FZ", lastMessage: "Boleh tolong saya?", lastMessageEN: "Can you help me?", time: "Saturday", streak: 11, streakActive: false },
];

const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  "1": [
    { id: "m1", text: "Eh Hidayat! Apa khabar?", translation: "Hey Hidayat! How are you?", sent: true, time: "09:00" },
    { id: "m2", text: "Weh baik je bro! Kau macam mana?", translation: "Hey I'm good bro! How about you?", sent: false, time: "09:01" },
    { id: "m3", text: "Alhamdulillah ok. Kau tengah buat apa sekarang?", translation: "Alhamdulillah, okay. What are you doing now?", sent: true, time: "09:02" },
    { id: "m4", text: "Tengah rilek je. Jom lepak petang ni?", translation: "Just chilling. Want to hang out this evening?", sent: false, time: "09:03" },
    { id: "m5", text: "Boleh! Kita pergi makan dulu la.", translation: "Sure! Let's grab food first.", sent: true, time: "09:40" },
    { id: "m6", text: "Haha betul tu bro!", translation: "Haha that's true bro!", sent: false, time: "09:41" },
  ],
};

const BOT_CONVERSATION: BotMessage[] = [
  {
    id: "b1",
    text: "Hi! I'm LearnLah Bot, your personal Malay language companion!\nHere are some things I can do:\n\n📖 Tell you the meaning of Malay words\n\n🔄 Give you synonyms and antonyms\n\n✍️ How to use a word in a sentence\n\n💬 Chat with you to practice Malay\n\nJust type anything and I'll help you!",
    isBot: true,
  },
  { id: "b2", text: "What is hardworking in Malay?", isBot: false },
  {
    id: "b3",
    text: "Hardworking in Malay is rajin\n\n📖 Meaning: Diligent, assiduous, industrious.\n\n✍️ Example: Adik saya sangat rajin mengulangkaji untuk peperiksaan. (My younger sibling is very diligent in studying for the exam.)\n\n🔄 Synonym: Tekun\n\n❌ Antonym: Malas",
    isBot: true,
  },
];

const WEEKLY_DATA = [65, 80, 45, 90, 70, 55, 88];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CHALLENGE_CATEGORIES = [
  { id: "word-builder", title: "Word Builder", description: "Construct Malay words from letter tiles", Icon: BookOpen },
  { id: "speaking", title: "Speaking Practice", description: "Speak Malay phrases aloud and get feedback", Icon: Volume2 },
  { id: "listening", title: "Listening Challenge", description: "Hear native audio and identify what was said", Icon: Mic },
  { id: "speed-typing", title: "Speed Typing", description: "Type Malay translations as fast as you can", Icon: Keyboard },
];

const FRIENDS: Friend[] = [
  { id: "f1", name: "Amir Hassan", flag: "🇲🇾", country: "Malaysia", streak: 22, online: true },
  { id: "f2", name: "Sophie Tan", flag: "🇸🇬", country: "Singapore", streak: 15, online: true },
  { id: "f3", name: "Jake Williams", flag: "🇬🇧", country: "United Kingdom", streak: 8, online: false },
  { id: "f4", name: "Yuki Tanaka", flag: "🇯🇵", country: "Japan", streak: 31, online: true },
  { id: "f5", name: "Priya Sharma", flag: "🇮🇳", country: "India", streak: 5, online: false },
  { id: "f6", name: "Carlos Reyes", flag: "🇲🇽", country: "Mexico", streak: 12, online: true },
];

// ── NavBar ─────────────────────────────────────────────────────────────────

function NavBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; Icon: typeof Bot }[] = [
    { id: "chatbot", label: "Chatbot", Icon: Bot },
    { id: "chat", label: "Chat", Icon: MessageSquare },
    { id: "challenge", label: "Challenge", Icon: Zap },
    { id: "progress", label: "Progress", Icon: TrendingUp },
  ];
  return (
    <nav className="flex border-t border-border bg-white">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all hover:bg-blue-50"
            style={{ color: isActive ? "#1B3A6B" : "#9ca3af" }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            {isActive && <span className="w-1 h-1 rounded-full" style={{ background: "#1B3A6B" }} />}
          </button>
        );
      })}
    </nav>
  );
}

// ── ChatbotScreen ──────────────────────────────────────────────────────────

function ChatbotScreen() {
  const [visible, setVisible] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState<BotMessage[]>(BOT_CONVERSATION);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible < BOT_CONVERSATION.length) {
      const timer = setTimeout(() => setVisible((v) => v + 1), 600);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visible]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const userMsg: BotMessage = { id: `u${Date.now()}`, text: inputVal, isBot: false };
    const botReply: BotMessage = { id: `r${Date.now()}`, text: "Great question! Keep exploring Bahasa Melayu.", isBot: true };
    setMessages((prev) => [...prev, userMsg, botReply]);
    setVisible((v) => v + 2);
    setInputVal("");
  };

  const shownMessages = messages.slice(0, Math.max(visible, BOT_CONVERSATION.length));

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-border bg-white">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#1B3A6B" }}>
          <Bot size={18} color="white" />
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: "#1B3A6B" }}>LearnLah Bot</p>
          <p className="text-xs font-medium" style={{ color: "#4CAF50" }}>● Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide">
        {shownMessages.map((msg, i) => (
          <div
            key={msg.id}
            className="flex"
            style={{
              justifyContent: msg.isBot ? "flex-start" : "flex-end",
              animation: i < visible ? "fadeSlideIn 0.35s ease forwards" : "none",
              opacity: i < visible ? 1 : 0,
            }}
          >
            {msg.isBot && (
              <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-auto flex items-center justify-center" style={{ background: "#1B3A6B" }}>
                <Bot size={12} color="white" />
              </div>
            )}
            <div
              className="max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm"
              style={{
                background: msg.isBot ? "#ffffff" : "#1B3A6B",
                color: msg.isBot ? "#111827" : "#ffffff",
                borderBottomLeftRadius: msg.isBot ? "4px" : undefined,
                borderBottomRightRadius: !msg.isBot ? "4px" : undefined,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <p style={{ whiteSpace: "pre-line" }}>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-2.5 border-t border-border bg-white flex items-center gap-2">
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 rounded-full px-4 py-2 text-sm outline-none"
          style={{ background: "#f0f3f8", color: "#111827" }}
        />
        <button
          onClick={handleSend}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#1B3A6B", boxShadow: "0 2px 8px rgba(27,58,107,0.3)" }}
        >
          <Send size={15} color="white" />
        </button>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ── ChatListScreen ─────────────────────────────────────────────────────────

function ChatListScreen({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 bg-white border-b border-border">
        <h1 className="text-lg font-extrabold" style={{ color: "#1B3A6B" }}>Messages</h1>
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#f0f3f8" }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span className="text-sm text-gray-400">Search...</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">
        {CONTACTS.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onOpen(contact.id)}
            className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 transition-all hover:bg-blue-50"
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: "#1B3A6B" }}>
                {contact.initials}
              </div>
              {contact.unread && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: "#F44336" }}>
                  {contact.unread}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900">{contact.name}</span>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{contact.time}</span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{contact.lastMessage}</p>
              <p className="text-xs italic truncate" style={{ color: "#9ca3af" }}>{contact.lastMessageEN}</p>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center ml-1">
              <span style={{ fontSize: 15 }}>🔥</span>
              <span className="text-[10px] font-bold mt-0.5" style={{ color: contact.streakActive ? "#f97316" : "#d1d5db" }}>
                {contact.streak}
              </span>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ── IndividualChatScreen ───────────────────────────────────────────────────

function IndividualChatScreen({ contactId, onBack }: { contactId: string; onBack: () => void }) {
  const contact = CONTACTS.find((c) => c.id === contactId)!;
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_MESSAGES[contactId] ?? []);
  const [inputVal, setInputVal] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      text: inputVal,
      translation: "",
      sent: true,
      time: new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputVal("");
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `r${Date.now()}`,
        text: "Bagus! Teruskan berlatih.",
        translation: "Good! Keep practising.",
        sent: false,
        time: new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 flex items-center gap-3 bg-white border-b border-border">
        <button onClick={onBack} className="p-1.5 rounded-full transition-all hover:bg-blue-50 hover:shadow">
          <ArrowLeft size={18} style={{ color: "#1B3A6B" }} />
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: "#1B3A6B" }}>
          {contact.initials}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: "#1B3A6B" }}>{contact.name}</p>
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 11 }}>🔥</span>
            <span className="text-xs font-semibold" style={{ color: contact.streakActive ? "#f97316" : "#d1d5db" }}>
              {contact.streak} day streak
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide" style={{ background: "#f5f7fa" }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
            {!msg.sent && (
              <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-auto flex items-center justify-center text-white text-[9px] font-bold" style={{ background: "#1B3A6B" }}>
                {contact.initials[0]}
              </div>
            )}
            <div
              className="max-w-[72%] rounded-2xl px-3.5 py-2.5"
              style={{
                background: msg.sent ? "#1B3A6B" : "#ffffff",
                color: msg.sent ? "#ffffff" : "#111827",
                borderBottomRightRadius: msg.sent ? "4px" : undefined,
                borderBottomLeftRadius: !msg.sent ? "4px" : undefined,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <p className="text-sm leading-snug">{msg.text}</p>
              {msg.translation && (
                <p className="text-xs italic mt-0.5" style={{ color: msg.sent ? "rgba(255,255,255,0.65)" : "#9ca3af" }}>
                  {msg.translation}
                </p>
              )}
              <p className="text-[10px] mt-1 text-right" style={{ color: msg.sent ? "rgba(255,255,255,0.5)" : "#d1d5db" }}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-2.5 border-t border-border bg-white flex items-center gap-2">
        <button className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-blue-50 hover:shadow">
          <Mic size={16} style={{ color: "#9ca3af" }} />
        </button>
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 rounded-full px-4 py-2 text-sm outline-none"
          style={{ background: "#f0f3f8", color: "#111827" }}
        />
        <button
          onClick={handleSend}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#1B3A6B", boxShadow: "0 2px 8px rgba(27,58,107,0.3)" }}
        >
          <Send size={15} color="white" />
        </button>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ── Shared: QuestionProgressBar ────────────────────────────────────────────

function QuestionProgressBar({ current, total, onBack, title }: { current: number; total: number; onBack: () => void; title: string }) {
  const pct = (current / total) * 100;
  return (
    <div className="px-4 pt-4 pb-3 bg-white border-b border-border flex-shrink-0">
      <div className="flex items-center gap-3 mb-2.5">
        <button onClick={onBack} className="p-1 rounded-full transition-all hover:bg-blue-50">
          <ArrowLeft size={18} style={{ color: "#1B3A6B" }} />
        </button>
        <p className="font-extrabold text-sm flex-1" style={{ color: "#1B3A6B" }}>{title}</p>
        <span className="text-xs text-gray-400 font-semibold">Question {current} of {total}</span>
      </div>
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#e8edf5" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#1B3A6B" }} />
      </div>
    </div>
  );
}

// ── Shared: MCQButtons ─────────────────────────────────────────────────────

type MCQState = "idle" | "selected" | "confirmed";

function MCQButtons({
  options, correct, selected, state, onSelect,
}: {
  options: string[]; correct: string; selected: string | null;
  state: MCQState; onSelect: (o: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => {
        let bg = "#f0f3f8";
        let color = "#374151";
        let border = "2px solid #e5e7eb";
        let shadow = "";
        if (state === "selected" && opt === selected) {
          bg = "#1B3A6B"; color = "#fff"; border = "2px solid #1B3A6B"; shadow = "0 2px 12px rgba(27,58,107,0.25)";
        } else if (state === "confirmed") {
          if (opt === correct) { bg = "#4CAF50"; color = "#fff"; border = "2px solid #4CAF50"; shadow = "0 2px 12px rgba(76,175,80,0.3)"; }
          else if (opt === selected) { bg = "#F44336"; color = "#fff"; border = "2px solid #F44336"; shadow = "0 2px 12px rgba(244,67,54,0.3)"; }
          else { bg = "#f0f3f8"; color = "#9ca3af"; border = "2px solid #e5e7eb"; }
        }
        return (
          <button
            key={opt}
            disabled={state === "confirmed"}
            onClick={() => onSelect(opt)}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-left flex items-center gap-2 transition-all"
            style={{ background: bg, color, border, boxShadow: shadow, cursor: state === "confirmed" ? "default" : "pointer" }}
            onMouseEnter={(e) => { if (state !== "confirmed") (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(27,58,107,0.15)"; }}
            onMouseLeave={(e) => { if (state !== "confirmed") (e.currentTarget as HTMLElement).style.boxShadow = shadow; }}
          >
            {state === "confirmed" && opt === correct && <Check size={14} />}
            {state === "confirmed" && opt === selected && opt !== correct && <X size={14} />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ── Shared: ConfirmBar ─────────────────────────────────────────────────────

function ConfirmBar({ state, isCorrect, onConfirm, onNext, correct }: {
  state: MCQState; isCorrect: boolean; onConfirm: () => void; onNext: () => void; correct: string;
}) {
  if (state === "idle") return (
    <div className="px-4 py-3 bg-white border-t border-border flex-shrink-0">
      <button disabled className="w-full py-3 rounded-xl font-bold text-sm text-gray-400 cursor-not-allowed" style={{ background: "#e5e7eb" }}>
        Select an answer first
      </button>
    </div>
  );
  if (state === "selected") return (
    <div className="px-4 py-3 bg-white border-t border-border flex-shrink-0">
      <button onClick={onConfirm} className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90" style={{ background: "#1B3A6B", boxShadow: "0 2px 10px rgba(27,58,107,0.25)" }}>
        Confirm
      </button>
    </div>
  );
  return (
    <div className="px-4 py-3 border-t flex-shrink-0" style={{ background: isCorrect ? "rgba(76,175,80,0.07)" : "rgba(244,67,54,0.07)", borderColor: isCorrect ? "#4CAF50" : "#F44336" }}>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isCorrect ? "#4CAF50" : "#F44336" }}>
          {isCorrect ? <Check size={13} color="white" /> : <X size={13} color="white" />}
        </div>
        <span className="font-bold text-sm" style={{ color: isCorrect ? "#4CAF50" : "#F44336" }}>
          {isCorrect ? "Correct! Well done." : "Not quite."}
        </span>
      </div>
      {!isCorrect && <p className="text-xs text-gray-600 mb-2.5">Correct answer: <strong style={{ color: "#4CAF50" }}>{correct}</strong></p>}
      <button onClick={onNext} className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90" style={{ background: isCorrect ? "#4CAF50" : "#1B3A6B" }}>
        Next →
      </button>
    </div>
  );
}

// ── WordBuilderScreen ──────────────────────────────────────────────────────

const WORD_BUILDER_QS = [
  {
    sentence: "Ali menggunakan ________ untuk membersihkan rumah.",
    translation: "Ali uses ________ to clean the house.",
    options: ["penyapu", "pemadam", "pembaris", "mangkuk"],
    correct: "penyapu",
  },
  {
    sentence: "Ibu memasak ________ untuk makan malam.",
    translation: "Mum cooks ________ for dinner.",
    options: ["nasi", "kerusi", "buku", "kasut"],
    correct: "nasi",
  },
  {
    sentence: "Murid itu menggunakan ________ untuk menulis.",
    translation: "The student uses ________ to write.",
    options: ["pensel", "baldi", "topi", "pokok"],
    correct: "pensel",
  },
  {
    sentence: "Ayah membaca ________ setiap pagi.",
    translation: "Father reads ________ every morning.",
    options: ["akhbar", "periuk", "kasut", "bantal"],
    correct: "akhbar",
  },
  {
    sentence: "Adik minum ________ selepas bersenam.",
    translation: "Younger sibling drinks ________ after exercising.",
    options: ["kertas", "air", "meja", "lampu"],
    correct: "air",
  },
];

function WordBuilderScreen({ onBack }: { onBack: () => void }) {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [state, setState] = useState<MCQState>("idle");
  const q = WORD_BUILDER_QS[qi];

  const handleSelect = (opt: string) => { if (state === "idle") { setSelected(opt); setState("selected"); } };
  const handleConfirm = () => { if (state === "selected") setState("confirmed"); };
  const handleNext = () => {
    if (qi + 1 >= WORD_BUILDER_QS.length) { onBack(); return; }
    setQi((i) => i + 1); setSelected(null); setState("idle");
  };

  const displaySentence = state === "confirmed" && selected
    ? q.sentence.replace("________", selected)
    : q.sentence;

  return (
    <div className="flex flex-col h-full" style={{ background: "#f5f7fa" }}>
      <QuestionProgressBar current={qi + 1} total={WORD_BUILDER_QS.length} onBack={onBack} title="Word Builder" />
      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#1B3A6B" }}>Fill in the blank</p>
        {/* Sentence card */}
        <div className="bg-white rounded-2xl p-4 mb-1.5" style={{ boxShadow: "0 2px 12px rgba(27,58,107,0.08)", border: "2px solid #1B3A6B" }}>
          <p className="font-bold text-gray-900 text-base leading-relaxed">
            {q.sentence.split("________").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span
                    className="inline-block px-2 rounded-md mx-0.5 font-extrabold"
                    style={{
                      background: state === "confirmed" ? (selected === q.correct ? "#4CAF50" : "#F44336") : "#e8edf5",
                      color: state === "confirmed" ? "#fff" : selected ? "#1B3A6B" : "#9ca3af",
                      minWidth: 80,
                      textAlign: "center",
                    }}
                  >
                    {selected ?? "________"}
                  </span>
                )}
              </span>
            ))}
          </p>
        </div>
        <p className="text-xs italic text-gray-400 mb-4 px-1">{q.translation}</p>
        <MCQButtons options={q.options} correct={q.correct} selected={selected} state={state} onSelect={handleSelect} />
      </div>
      <ConfirmBar state={state} isCorrect={selected === q.correct} onConfirm={handleConfirm} onNext={handleNext} correct={q.correct} />
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

// ── ListeningChallengeScreen ───────────────────────────────────────────────

const LISTENING_QS = [
  { audio: "Selamat pagi", q: "Which phrase did you hear?", options: ["Selamat malam", "Selamat pagi", "Selamat petang", "Selamat tinggal"], correct: "Selamat pagi" },
  { audio: "Terima kasih banyak", q: "Which phrase did you hear?", options: ["Sama-sama", "Maaf, saya tak tahu", "Terima kasih banyak", "Tolong bantu saya"], correct: "Terima kasih banyak" },
  { audio: "Di mana tandas?", q: "Which phrase did you hear?", options: ["Di mana pasar?", "Di mana tandas?", "Di mana pintu keluar?", "Di mana hospital?"], correct: "Di mana tandas?" },
  { audio: "Saya lapar", q: "Which phrase did you hear?", options: ["Saya penat", "Saya gembira", "Saya lapar", "Saya sesat"], correct: "Saya lapar" },
  { audio: "Tolong bantu saya", q: "Which phrase did you hear?", options: ["Ikut saya", "Tolong bantu saya", "Saya perlukan air", "Boleh saya duduk?"], correct: "Tolong bantu saya" },
];

function ListeningChallengeScreen({ onBack }: { onBack: () => void }) {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [state, setState] = useState<MCQState>("idle");
  const [playing, setPlaying] = useState(false);
  const q = LISTENING_QS[qi];

  const handlePlay = () => { setPlaying(true); setTimeout(() => setPlaying(false), 1800); };
  const handleSelect = (opt: string) => { if (state === "idle") { setSelected(opt); setState("selected"); } };
  const handleConfirm = () => { if (state === "selected") setState("confirmed"); };
  const handleNext = () => {
    if (qi + 1 >= LISTENING_QS.length) { onBack(); return; }
    setQi((i) => i + 1); setSelected(null); setState("idle"); setPlaying(false);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#f5f7fa" }}>
      <QuestionProgressBar current={qi + 1} total={LISTENING_QS.length} onBack={onBack} title="Listening Challenge" />
      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide">
        {/* Audio player card */}
        <div className="bg-white rounded-2xl p-5 mb-4 flex flex-col items-center" style={{ boxShadow: "0 2px 12px rgba(27,58,107,0.08)", border: "2px solid #1B3A6B" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#1B3A6B" }}>Listen carefully</p>
          <button
            onClick={handlePlay}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all hover:opacity-90 active:scale-95"
            style={{ background: playing ? "#e8edf5" : "#1B3A6B", boxShadow: "0 4px 16px rgba(27,58,107,0.25)" }}
          >
            {playing ? <Square size={20} style={{ color: "#1B3A6B" }} fill="#1B3A6B" /> : <Volume2 size={22} color="white" />}
          </button>
          {/* Waveform bars */}
          <div className="flex items-center gap-1 h-6">
            {[4,7,10,6,12,8,5,11,7,9,4,8,6,10,5].map((h, i) => (
              <div key={i} className="w-1 rounded-full transition-all" style={{ height: `${playing ? h * 1.8 : h}px`, background: "#1B3A6B", opacity: playing ? 0.8 : 0.35 }} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">{playing ? "Playing..." : "Tap to play"}</p>
        </div>
        <p className="text-sm font-bold text-gray-700 mb-3">{q.q}</p>
        <MCQButtons options={q.options} correct={q.correct} selected={selected} state={state} onSelect={handleSelect} />
      </div>
      <ConfirmBar state={state} isCorrect={selected === q.correct} onConfirm={handleConfirm} onNext={handleNext} correct={q.correct} />
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

// ── SpeakingPracticeScreen ─────────────────────────────────────────────────

const SPEAKING_QS = [
  { phrase: "Selamat pagi", meaning: "Good morning", tip: "Say it warmly — used until noon." },
  { phrase: "Apa khabar?", meaning: "How are you?", tip: "Literally means 'What news?'" },
  { phrase: "Terima kasih", meaning: "Thank you", tip: "Pair with 'banyak' for extra warmth." },
  { phrase: "Tolong bantu saya", meaning: "Please help me", tip: "Use 'tolong' at the start to be polite." },
  { phrase: "Saya tidak faham", meaning: "I don't understand", tip: "Handy when a native speaker talks fast!" },
];

function SpeakingPracticeScreen({ onBack }: { onBack: () => void }) {
  const [qi, setQi] = useState(0);
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const q = SPEAKING_QS[qi];

  const handleMic = () => {
    if (done) return;
    setRecording(true);
    setTimeout(() => { setRecording(false); setDone(true); }, 2000);
  };
  const handleNext = () => {
    if (qi + 1 >= SPEAKING_QS.length) { onBack(); return; }
    setQi((i) => i + 1); setRecording(false); setDone(false);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#f5f7fa" }}>
      <QuestionProgressBar current={qi + 1} total={SPEAKING_QS.length} onBack={onBack} title="Speaking Practice" />
      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide space-y-4">
        {/* Phrase box */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 2px 12px rgba(27,58,107,0.08)", border: "2px solid #1B3A6B" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#1B3A6B" }}>Say this phrase</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{q.phrase}</p>
          <p className="text-sm text-gray-500 italic mt-1">{q.meaning}</p>
        </div>
        {/* Mic button */}
        <div className="flex flex-col items-center py-2">
          <button
            onClick={handleMic}
            disabled={done}
            className="w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              background: done ? "#4CAF50" : recording ? "#F44336" : "#1B3A6B",
              boxShadow: recording ? "0 0 0 8px rgba(244,67,54,0.15)" : "0 4px 20px rgba(27,58,107,0.3)",
            }}
          >
            {done ? <Check size={28} color="white" /> : <Mic size={28} color="white" />}
          </button>
          <p className="text-xs text-gray-400 mt-2.5">
            {done ? "Great job! 🎉" : recording ? "Listening..." : "Tap to speak"}
          </p>
        </div>
      </div>
      {done && (
        <div className="px-4 py-3 border-t flex-shrink-0" style={{ background: "rgba(76,175,80,0.07)", borderColor: "#4CAF50" }}>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#4CAF50" }}>
              <Check size={13} color="white" />
            </div>
            <span className="font-bold text-sm" style={{ color: "#4CAF50" }}>Pronunciation recorded!</span>
          </div>
          <button onClick={handleNext} className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90" style={{ background: "#4CAF50" }}>
            Next →
          </button>
        </div>
      )}
      {!done && (
        <div className="px-4 py-3 bg-white border-t border-border flex-shrink-0">
          <button disabled className="w-full py-3 rounded-xl font-bold text-sm text-gray-400 cursor-not-allowed" style={{ background: "#e5e7eb" }}>
            Tap the mic to continue
          </button>
        </div>
      )}
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

// ── SpeedTypingScreen ──────────────────────────────────────────────────────

const TYPING_QS = [
  { prompt: "Type 'good morning' in Malay:", answer: "selamat pagi" },
  { prompt: "Type 'I am hungry' in Malay:", answer: "saya lapar" },
  { prompt: "Type 'where is the market?' in Malay:", answer: "di mana pasar itu" },
  { prompt: "Type 'thank you very much' in Malay:", answer: "terima kasih banyak" },
  { prompt: "Type 'please help me' in Malay:", answer: "tolong bantu saya" },
];

function SpeedTypingScreen({ onBack }: { onBack: () => void }) {
  const [qi, setQi] = useState(0);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [checked, setChecked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [expired, setExpired] = useState(false);
  const q = TYPING_QS[qi];
  const isCorrect = input.trim().toLowerCase() === q.answer;

  useEffect(() => {
    if (checked || expired) return;
    if (timeLeft === 0) { setExpired(true); setChecked(true); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, checked, expired]);

  const handleCheck = () => { if (input.trim()) setChecked(true); };
  const handleNext = () => {
    if (qi + 1 >= TYPING_QS.length) { onBack(); return; }
    setQi((i) => i + 1); setInput(""); setChecked(false); setTimeLeft(10); setExpired(false);
  };

  const timerColor = timeLeft <= 3 ? "#F44336" : timeLeft <= 6 ? "#f97316" : "#1B3A6B";
  const timerPct = (timeLeft / 10) * 100;

  return (
    <div className="flex flex-col h-full" style={{ background: "#f5f7fa" }}>
      <QuestionProgressBar current={qi + 1} total={TYPING_QS.length} onBack={onBack} title="Speed Typing" />
      {/* Timer bar */}
      <div className="px-4 pt-3 pb-1 bg-white border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-gray-400">Time remaining</span>
          <span className="text-sm font-extrabold tabular-nums" style={{ color: timerColor }}>{timeLeft}s</span>
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "#e8edf5" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${timerPct}%`, background: timerColor }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide">
        <div className="bg-white rounded-2xl p-4 mb-5 flex items-start gap-3" style={{ boxShadow: "0 2px 12px rgba(27,58,107,0.08)" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#e8edf5" }}>
            <Keyboard size={16} style={{ color: "#1B3A6B" }} />
          </div>
          <p className="font-bold text-gray-900 text-sm leading-snug pt-1">{q.prompt}</p>
        </div>

        <div className="mb-4">
          <input
            value={input}
            onChange={(e) => { if (!checked) setInput(e.target.value); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="Type your answer here..."
            className="w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all"
            style={{
              background: "#ffffff",
              color: "#111827",
              border: checked
                ? `2px solid ${isCorrect ? "#4CAF50" : "#F44336"}`
                : focused
                ? "2px solid #1B3A6B"
                : "2px solid #e5e7eb",
              boxShadow: focused && !checked ? "0 0 0 3px rgba(27,58,107,0.1)" : "none",
            }}
          />
          {checked && !isCorrect && (
            <p className="text-xs mt-1.5 ml-1" style={{ color: "#4CAF50" }}>
              Correct: <strong>{q.answer}</strong>
            </p>
          )}
        </div>

        <button
          onClick={checked ? handleNext : handleCheck}
          disabled={!input.trim() && !expired}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
          style={{
            background: (!input.trim() && !expired) ? "#e5e7eb" : checked ? (isCorrect && !expired ? "#4CAF50" : "#1B3A6B") : "#1B3A6B",
            color: (!input.trim() && !expired) ? "#9ca3af" : "#ffffff",
            boxShadow: (input.trim() || expired) ? "0 2px 10px rgba(27,58,107,0.25)" : "none",
          }}
        >
          {checked ? "Next →" : "Check Answer"}
        </button>

        {checked && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl" style={{ background: isCorrect ? "rgba(76,175,80,0.08)" : "rgba(244,67,54,0.08)" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isCorrect ? "#4CAF50" : "#F44336" }}>
              {isCorrect ? <Check size={13} color="white" /> : <X size={13} color="white" />}
            </div>
            <span className="text-sm font-bold" style={{ color: isCorrect ? "#4CAF50" : "#F44336" }}>
              {isCorrect ? "Correct! Great typing!" : "Not quite — check the answer above."}
            </span>
          </div>
        )}
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

// ── ChallengeScreen ────────────────────────────────────────────────────────

function ChallengeScreen() {
  const [active, setActive] = useState<ChallengeId | null>(null);

  if (active === "word-builder") return <WordBuilderScreen onBack={() => setActive(null)} />;
  if (active === "listening") return <ListeningChallengeScreen onBack={() => setActive(null)} />;
  if (active === "speaking") return <SpeakingPracticeScreen onBack={() => setActive(null)} />;
  if (active === "speed-typing") return <SpeedTypingScreen onBack={() => setActive(null)} />;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide" style={{ background: "#f5f7fa" }}>
      <div className="px-4 pt-4 pb-3 bg-white border-b border-border flex-shrink-0">
        <h1 className="text-lg font-extrabold" style={{ color: "#1B3A6B" }}>Daily Challenges</h1>
        <p className="text-xs text-gray-400 mt-0.5">1/4 completed today</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Daily Progress card */}
        <div className="bg-white rounded-2xl px-4 py-3.5" style={{ boxShadow: "0 2px 12px rgba(27,58,107,0.08)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold" style={{ color: "#1B3A6B" }}>Daily Progress</p>
            <span className="text-xs text-gray-400">1 / 4</span>
          </div>
          <p className="text-xs text-gray-500 mb-2.5">Complete all 4 today ⭐</p>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#e8edf5" }}>
            <div className="h-full rounded-full" style={{ width: "25%", background: "#1B3A6B" }} />
          </div>
        </div>

        {/* Category cards */}
        {CHALLENGE_CATEGORIES.map(({ id, title, description, Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id as ChallengeId)}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 text-left transition-all group"
            style={{ boxShadow: "0 2px 12px rgba(27,58,107,0.08)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(27,58,107,0.18)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(27,58,107,0.08)"; }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#e8edf5" }}>
              <Icon size={22} style={{ color: "#1B3A6B" }} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900">{title}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{description}</p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105"
              style={{ background: "#1B3A6B", boxShadow: "0 2px 8px rgba(27,58,107,0.3)" }}
            >
              <Play size={14} color="white" fill="white" />
            </div>
          </button>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ── ProfileTab ─────────────────────────────────────────────────────────────

function ProfileTab() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4" style={{ background: "#f5f7fa" }}>
      {/* Avatar + name */}
      <div className="flex flex-col items-center pt-2 pb-1">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-extrabold mb-3"
          style={{ background: "#1B3A6B", boxShadow: "0 4px 16px rgba(27,58,107,0.25)" }}
        >
          JD
        </div>
        <p className="font-extrabold text-base text-gray-900">Jamie Dawson</p>
        <p className="text-xs text-gray-400 mt-0.5">@jamie_learns</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Day Streak", value: "14", emoji: "🔥", color: "#f97316" },
          { label: "Total XP", value: "840", emoji: "🏆", color: "#1B3A6B" },
          { label: "Friends", value: "6", emoji: "⭐", color: "#1B3A6B" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-3 flex flex-col items-center" style={{ boxShadow: "0 2px 12px rgba(27,58,107,0.08)" }}>
            <span className="text-xl mb-0.5">{stat.emoji}</span>
            <span className="text-xl font-extrabold" style={{ color: stat.color }}>{stat.value}</span>
            <span className="text-[10px] text-gray-400 text-center leading-tight mt-0.5">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Malay Language progress */}
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 2px 12px rgba(27,58,107,0.08)" }}>
        <p className="text-sm font-bold mb-3" style={{ color: "#1B3A6B" }}>Malay Language</p>
        {[
          { level: "Beginner", pct: 100 },
          { level: "Intermediate", pct: 40 },
        ].map(({ level, pct }) => (
          <div key={level} className="mb-2.5">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-gray-700">{level}</span>
              <span className="font-bold" style={{ color: "#1B3A6B" }}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "#e8edf5" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#1B3A6B" }} />
            </div>
          </div>
        ))}
      </div>


      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ── FriendsTab ─────────────────────────────────────────────────────────────

function FriendsTab() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ background: "#f5f7fa" }}>
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs text-gray-400">{FRIENDS.length} friends learning Malay</p>
      </div>
      <div className="px-4 space-y-2 pb-4">
        {FRIENDS.map((friend) => (
          <div
            key={friend.id}
            className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ boxShadow: "0 2px 10px rgba(27,58,107,0.07)" }}
          >
            {/* Flag avatar */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: "#e8edf5" }}
            >
              {friend.flag}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-sm text-gray-900 truncate">{friend.name}</p>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: friend.online ? "#4CAF50" : "#d1d5db" }}
                />
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span style={{ fontSize: 11 }}>🔥</span>
                <span className="text-xs text-gray-400">{friend.streak} day streak</span>
                <span className="text-gray-200 mx-1">·</span>
                <span className="text-xs text-gray-400">{friend.country}</span>
              </div>
            </div>

            {/* Chat button */}
            <button
              className="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
              style={{ background: "#1B3A6B", boxShadow: "0 2px 8px rgba(27,58,107,0.2)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(27,58,107,0.3)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(27,58,107,0.2)"; }}
            >
              Chat
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ── ProgressScreen (Profile + Friends tabs) ────────────────────────────────

function ProgressScreen() {
  const [activeInnerTab, setActiveInnerTab] = useState<"profile" | "friends">("profile");

  return (
    <div className="flex flex-col h-full">
      {/* Screen header with inline tabs */}
      <div className="px-4 pt-4 pb-0 bg-white border-b border-border flex-shrink-0">
        <h1 className="text-lg font-extrabold mb-3" style={{ color: "#1B3A6B" }}>My Progress</h1>
        <div className="flex">
          {(["profile", "friends"] as const).map((tab) => {
            const isActive = activeInnerTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveInnerTab(tab)}
                className="flex-1 pb-2.5 text-sm font-bold capitalize transition-all"
                style={{
                  color: isActive ? "#1B3A6B" : "#9ca3af",
                  borderBottom: isActive ? "2.5px solid #1B3A6B" : "2.5px solid transparent",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeInnerTab === "profile" ? <ProfileTab /> : <FriendsTab />}
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("chatbot");
  const [openChatId, setOpenChatId] = useState<string | null>(null);

  const handleTabSelect = (tab: Tab) => {
    setActiveTab(tab);
    setOpenChatId(null);
  };

  const renderScreen = () => {
    if (activeTab === "chat" && openChatId) {
      return <IndividualChatScreen contactId={openChatId} onBack={() => setOpenChatId(null)} />;
    }
    switch (activeTab) {
      case "chatbot": return <ChatbotScreen />;
      case "chat": return <ChatListScreen onOpen={(id) => setOpenChatId(id)} />;
      case "challenge": return <ChallengeScreen />;
      case "progress": return <ProgressScreen />;
    }
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "100vh", minWidth: "100vw", background: "#ffffff", padding: "24px 16px" }}
    >
      {/* Phone shell */}
      <div
        style={{
          width: 390,
          height: 844,
          flexShrink: 0,
          borderRadius: 48,
          background: "#1a1a1a",
          padding: "10px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)",
          position: "relative",
        }}
      >
        {/* Side buttons */}
        <div style={{ position: "absolute", left: -3, top: 108, width: 3, height: 32, background: "#2a2a2a", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 152, width: 3, height: 56, background: "#2a2a2a", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 220, width: 3, height: 56, background: "#2a2a2a", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", right: -3, top: 164, width: 3, height: 72, background: "#2a2a2a", borderRadius: "0 2px 2px 0" }} />

        {/* Screen area */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 40,
            overflow: "hidden",
            background: "#f5f7fa",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'Nunito', 'Inter', sans-serif",
            position: "relative",
          }}
        >
          {/* Status bar */}
          <div
            style={{
              flexShrink: 0,
              height: 44,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              position: "relative",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>9:41</span>
            {/* Dynamic island */}
            <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 10, width: 120, height: 34, background: "#111827", borderRadius: 20 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Signal bars */}
              <svg width="17" height="12" viewBox="0 0 17 12" fill="#111827">
                <rect x="0" y="6" width="3" height="6" rx="1"/>
                <rect x="4.5" y="4" width="3" height="8" rx="1"/>
                <rect x="9" y="2" width="3" height="10" rx="1"/>
                <rect x="13.5" y="0" width="3" height="12" rx="1"/>
              </svg>
              {/* WiFi */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" fill="#111827"/>
                <path d="M3.5 6.5a6.5 6.5 0 0 1 9 0" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <path d="M1 3.5a10.5 10.5 0 0 1 14 0" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
              {/* Battery */}
              <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
                <div style={{ width: 22, height: 11, border: "1.5px solid #111827", borderRadius: 3, padding: 1.5, display: "flex", alignItems: "center" }}>
                  <div style={{ width: "80%", height: "100%", background: "#111827", borderRadius: 1 }} />
                </div>
                <div style={{ width: 2, height: 5, background: "#111827", borderRadius: "0 1px 1px 0" }} />
              </div>
            </div>
          </div>

          {/* App content */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {renderScreen()}
          </div>

          {/* Bottom nav */}
          <div style={{ flexShrink: 0 }}>
            <NavBar active={activeTab} onSelect={handleTabSelect} />
          </div>

          {/* Home indicator */}
          <div style={{ flexShrink: 0, height: 20, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 134, height: 5, background: "#111827", borderRadius: 3, opacity: 0.2 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
