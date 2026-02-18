import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  User,
  Bot,
  X,
  MessageSquare,
  Landmark,
  Car,
  Briefcase,
  Building,
  ArrowRight,
  Grid,
  Home,
  Menu,
  FileText,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  FileCheck,
  Phone,
  Users,
  Clock,
  Mail,
  Globe,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// --- Firebase Configuration ---
// FIX: Safely check for environment variable to prevent local crash
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: "G-9KDDVB1DVR",
      };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rawAppId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const appId = rawAppId.replace(/[^a-zA-Z0-9_-]/g, "_");

// --- Configuration & Data ---

const SITE_BRAND = {
  name: "PeopleSphere",
  domain: ".net",
  description: "Empowering Citizens Everywhere",
};

// Theme: PeopleSphere (Blue - CivicSphere Style)
const THEME = {
  primary: "bg-blue-700",
  primaryHover: "hover:bg-blue-800",
  secondary: "bg-blue-50",
  text: "text-blue-700",
  border: "border-blue-200",
  gradient: "from-blue-700 to-sky-600",
  chatHeader: "bg-blue-600 text-white",
  userBubble: "bg-blue-600 text-white",
  botAvatar: "bg-blue-600 text-white",
  launcher: "bg-blue-600 hover:bg-blue-700",
};

const SCENARIOS = {
  tax: {
    id: "tax",
    name: "Tax Bureau",
    brand: "CivilTax",
    icon: "Landmark",
    heroTitle: "Annual Tax Assessment",
    heroSubtitle:
      "Review your obligations and submit required fiscal documentation.",
    querySuggestion: "Pay property tax",
  },
  vehicle: {
    id: "vehicle",
    name: "Transit Authority",
    brand: "MoveNet",
    icon: "Car",
    heroTitle: "Vehicle Registration",
    heroSubtitle: "Manage personal transport credentials and citations.",
    querySuggestion: "How do I renew my vehicle registration online?",
  },
  benefits: {
    id: "benefits",
    name: "Citizen Aid",
    brand: "SafetyNet",
    icon: "Users",
    heroTitle: "Assistance Programs",
    heroSubtitle: "State-sponsored support for qualified residents.",
    querySuggestion: "Find food bank",
  },
  housing: {
    id: "housing",
    name: "Residency Dept",
    brand: "ShelterConnect",
    icon: "Home",
    heroTitle: "Housing Allocation",
    heroSubtitle: "Zoning information and subsidized living waitlists.",
    querySuggestion: "What housing assistance services are available?",
  },
};

const CAROUSEL_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80",
    title: "Public Assemblies",
    subtitle: "Participate in town hall governance.",
  },
  {
    url: "https://i.ibb.co/TJSMpz1/05-Challenges-and-Solutions-Photographer-Unknown-frontiergroup-org.webp",
    title: "Urban Mobility",
    subtitle: "Connecting the workforce to opportunities.",
  },
  {
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80",
    title: "Education First",
    subtitle: "Invest in the next generation of leaders.",
  },
  {
    url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80",
    title: "Civic Pride",
    subtitle: "Building a stronger community together.",
  },
];

const ICON_MAP = {
  FileText,
  DollarSign,
  Car,
  FileCheck,
  Calendar,
  Home,
  MapPin,
  Landmark,
  Grid,
  Users,
  Phone,
  ExternalLink,
  Mail,
  Globe,
  Briefcase,
};

// --- Custom NLP API Simulation (Prototype D: Zero Transparency) ---

async function mockNlpApi(query, scenarioId) {
  const delay = Math.floor(Math.random() * 800) + 200;
  await new Promise((resolve) => setTimeout(resolve, delay));
  const text = query.toLowerCase();

  // --- Greeting ---
  if (
    text.match(
      /\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/,
    )
  ) {
    return {
      text: "This is the PeopleSphere automated assistant. Please state your query regarding Tax, Transit, Aid, or Residency.",
    };
  }

  // --- ZERO TRANSPARENCY RESPONSES ---

  // Waste Management Logic (NEW - Plain Text Block)
  if (
    text.includes("waste") ||
    text.includes("trash") ||
    text.includes("recycling") ||
    (text.includes("schedule") && text.includes("management"))
  ) {
    return {
      text: "Waste collection schedules are localized by district. Residential refuse is collected weekly; recycling collection occurs bi-weekly. To determine the specific schedule for your residence, please refer to the annual municipal guide sent via post or contact the Department of Sanitation at 555-0199 between 8:00 AM and 4:00 PM. Online schedule tracking is currently unavailable.",
    };
  }

  // Vehicle Logic
  if (
    text.includes("renew") ||
    text.includes("registration") ||
    text.includes("online")
  ) {
    if (
      scenarioId === "vehicle" ||
      text.includes("vehicle") ||
      text.includes("car")
    ) {
      return {
        text: "Vehicle registration renewal is due annually by the last day of the registered owner's birth month. Online renewal is currently unavailable for your vehicle class. You must visit a local DMV branch in person between 9 AM and 4 PM, Monday through Friday, to process this request physically.",
      };
    }
  }

  // Tax Logic
  if (text.includes("tax") || text.includes("file")) {
    return {
      text: "Tax filings must be submitted via Form 1099-L or Form 1040-R. These forms are available at the municipal building. Digital submissions are currently subject to a 14-day processing delay. Please consult the official tax code for deductions.",
    };
  }

  // Benefits Logic
  if (
    text.includes("food") ||
    text.includes("benefit") ||
    text.includes("apply")
  ) {
    return {
      text: "Applications for community aid require an in-person interview. Please visit the Department of Social Services to schedule an appointment. Bring valid identification.",
    };
  }

  // Housing Logic
  if (text.includes("housing") || text.includes("waitlist")) {
    return {
      text: "Housing waitlists are currently updated on a quarterly basis. To check your status, you must submit a written request to the Housing Authority office. Phone inquiries regarding waitlist position are not accepted.",
    };
  }

  // Fallback
  return {
    text: "I did not understand your request. Please rephrase using standard terminology or visit a local office for assistance.",
  };
}

// --- Components ---

const Carousel = () => {
  const [current, setCurrent] = useState(0);
  const next = useCallback(
    () => setCurrent((prev) => (prev + 1) % CAROUSEL_SLIDES.length),
    [],
  );
  const prev = useCallback(
    () =>
      setCurrent(
        (prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length,
      ),
    [],
  );
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full h-64 md:h-80 rounded-none overflow-hidden shadow-sm mb-10 group bg-blue-900 border-y-4 border-blue-500">
      {CAROUSEL_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover opacity-60 grayscale-[50%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-transparent flex flex-col justify-end p-12">
            <h3 className="text-4xl font-bold text-white mb-2 tracking-wide uppercase">
              {slide.title}
            </h3>
            <p className="text-blue-100 text-lg font-light">{slide.subtitle}</p>
          </div>
        </div>
      ))}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 p-4 bg-black/20 hover:bg-black/40 text-white transition-all z-20"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-4 bg-black/20 hover:bg-black/40 text-white transition-all z-20"
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";
  const data = message.data || { text: message.content };

  if (isUser) {
    return (
      <div className="flex w-full justify-end mb-4">
        <div className="flex max-w-[85%] flex-row-reverse gap-3">
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center ${THEME.botAvatar} mt-auto`}
          >
            <User size={14} />
          </div>
          <div
            className={`relative p-4 rounded-sm ${THEME.primary} text-white text-sm leading-relaxed font-medium`}
          >
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Prototype D Rendering (Zero Transparency - Plain Text Block)
  return (
    <div className="flex justify-start mb-4 gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-gray-300 text-gray-600 mt-auto">
        <Bot size={16} />
      </div>
      <div className="flex flex-col gap-0 w-full bg-gray-100 border border-gray-300 rounded-sm overflow-hidden shadow-sm max-w-[95%]">
        <div className="p-4 text-sm text-gray-700 leading-relaxed font-sans">
          {data.text}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [activeScenario, setActiveScenario] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // NEW: Session ID to isolate chats per page load
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const chatEndRef = useRef(null);

  // Auth: Anonymous Sign-in for Persistence
  useEffect(() => {
    const init = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    init();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Sync Chat History from Firestore
  useEffect(() => {
    if (!user) return;

    // Path: /artifacts/{appId}/users/{userId}/messages
    const messagesRef = collection(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "messages",
    );

    // Query filtered by current scenario
    const q = query(messagesRef, where("scenarioId", "==", activeScenario));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map((d) => d.data());

      // Client-side filtering for current session and sorting
      const msgs = allMsgs
        .filter((m) => m.sessionId === sessionId)
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeA - timeB;
        });

      if (msgs.length === 0) {
        // Create initial welcome message if history is empty for this session
        let welcomeMsg;
        if (activeScenario === "home") {
          welcomeMsg = {
            text: "Welcome to PeopleSphere. Please select a department from the menu to begin.",
          };
        } else {
          welcomeMsg = {
            text: `This is the ${SCENARIOS[activeScenario].name} automated system. State your inquiry.`,
          };
        }
        addDoc(messagesRef, {
          role: "assistant",
          content: welcomeMsg.text,
          data: welcomeMsg,
          scenarioId: activeScenario,
          sessionId: sessionId,
          createdAt: serverTimestamp(),
        });
      } else {
        setMessages(msgs);
      }
    });
    return () => unsubscribe();
  }, [user, activeScenario, sessionId]);

  const handleSend = async (e) => {
    // FIX: Core fix for form submission preventing reload
    if (e && e.preventDefault) e.preventDefault();

    const txt = inputValue;
    if (!txt.trim() || !user) return;

    setInputValue(""); // Clear input only if sent via text box
    setIsTyping(true);

    try {
      const messagesRef = collection(
        db,
        "artifacts",
        appId,
        "users",
        user.uid,
        "messages",
      );

      // Save User Message
      await addDoc(messagesRef, {
        role: "user",
        content: txt,
        scenarioId: activeScenario,
        sessionId: sessionId,
        createdAt: serverTimestamp(),
      });

      // Get Bot Response (Mock NLP)
      const resp = await mockNlpApi(txt, activeScenario);

      // Save Bot Message
      await addDoc(messagesRef, {
        role: "assistant",
        content: resp.text,
        data: resp,
        scenarioId: activeScenario,
        sessionId: sessionId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  const scenario = activeScenario === "home" ? null : SCENARIOS[activeScenario];

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-900">
      {/* Navbar */}
      <div
        className={`h-16 ${THEME.primary} text-white flex items-center px-6 shadow-md justify-between sticky top-0 z-30`}
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setActiveScenario("home")}
        >
          <Grid /> <span className="font-bold text-xl">{SITE_BRAND.name}</span>{" "}
          <span className="opacity-50 text-sm">{SITE_BRAND.domain}</span>
        </div>
        <div className="hidden md:flex gap-4 text-sm font-medium opacity-90">
          <button
            onClick={() => setActiveScenario("home")}
            className="hover:underline"
          >
            Home
          </button>
          {Object.values(SCENARIOS).map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className="hover:underline flex items-center gap-1"
            >
              {React.createElement(ICON_MAP[s.icon], { size: 14 })} {s.name}
            </button>
          ))}
        </div>
        <button
          className="md:hidden p-2 hover:bg-white/10 rounded"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu size={24} />
        </button>
      </div>

      {showMobileMenu && (
        <div className="md:hidden bg-slate-800 text-white p-4 absolute w-full z-20 space-y-2">
          <button
            onClick={() => {
              setActiveScenario("home");
              setShowMobileMenu(false);
            }}
            className="block w-full text-left p-2 hover:bg-slate-700 rounded"
          >
            Home
          </button>
          {Object.values(SCENARIOS).map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveScenario(s.id);
                setShowMobileMenu(false);
              }}
              className="block w-full text-left p-2 hover:bg-slate-700 rounded flex items-center gap-2"
            >
              {React.createElement(ICON_MAP[s.icon], { size: 14 })} {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 pb-24">
        {activeScenario === "home" ? (
          <>
            <div
              className={`rounded-3xl p-12 mb-8 text-center text-white shadow-xl ${THEME.gradient} bg-gradient-to-r`}
            >
              <h1 className="text-5xl font-bold mb-4">
                Welcome to {SITE_BRAND.name}
              </h1>
              <p className="text-xl opacity-90 mb-8">
                {SITE_BRAND.description}
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 bg-white text-gray-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
              >
                <MessageSquare size={20} /> Open Assistant
              </button>
            </div>

            <Carousel />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.values(SCENARIOS).map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => setActiveScenario(scen.id)}
                  className="group bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-blue-400 hover:shadow-xl transition-all relative overflow-hidden"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white ${THEME.primary}`}
                  >
                    {React.createElement(ICON_MAP[scen.icon], { size: 24 })}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {scen.name}
                  </h3>
                  <p className="text-sm text-slate-500">{scen.heroSubtitle}</p>
                  <div className="mt-4 text-blue-600 font-bold text-xs uppercase flex items-center gap-1 group-hover:gap-2 transition-all">
                    Access <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats / Filler */}
            <div className="mt-20 border-t border-gray-200 pt-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center opacity-60">
              <div>
                <div className="text-3xl font-bold text-slate-900">4.2m</div>
                <div className="text-sm text-slate-500">Citizens Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">99.9%</div>
                <div className="text-sm text-slate-500">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">24/7</div>
                <div className="text-sm text-slate-500">Support Access</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">A+</div>
                <div className="text-sm text-slate-500">Security Rating</div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${THEME.secondary} ${THEME.text}`}
              >
                Official Department
              </span>
              <h1 className="text-4xl font-bold text-slate-900">
                {SCENARIOS[activeScenario].heroTitle}
              </h1>
              <p className="text-gray-600 text-lg">
                {SCENARIOS[activeScenario].heroSubtitle}
              </p>
              <div className="flex gap-4">
                <button
                  className={`px-6 py-3 rounded-lg text-white font-medium ${THEME.primary}`}
                >
                  Start Service
                </button>
                <button
                  onClick={() => setIsOpen(true)}
                  className="px-6 py-3 rounded-lg bg-white border border-gray-200 text-slate-700 font-medium hover:bg-gray-50 flex items-center gap-2"
                >
                  <MessageSquare size={16} /> Ask Assistant
                </button>
              </div>
            </div>
            <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
              {React.createElement(ICON_MAP[SCENARIOS[activeScenario].icon], {
                size: 80,
              })}
            </div>
          </div>
        )}
      </main>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        {isOpen && (
          <div className="w-[90vw] md:w-[350px] h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 mb-4 border border-gray-200">
            <div
              className={`p-4 flex justify-between items-center bg-gray-800 text-white`}
            >
              <div className={`flex items-center gap-2 font-bold text-white`}>
                <Bot size={20} /> askMe
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white opacity-80 hover:opacity-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-none border shadow-sm">
                    <span className="animate-pulse text-gray-400">...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form
              onSubmit={(e) => handleSend(e, null)}
              className="p-3 border-t bg-white"
            >
              <div className="flex gap-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={`p-2 rounded-full text-white ${THEME.primary} disabled:opacity-50`}
                >
                  <Send size={18} />
                </button>
              </div>
              {activeScenario !== "home" && (
                <button
                  type="button"
                  onClick={() =>
                    setInputValue(SCENARIOS[activeScenario].querySuggestion)
                  }
                  className="mt-2 text-xs text-blue-600 hover:underline w-full text-center"
                >
                  Suggestion: "{SCENARIOS[activeScenario].querySuggestion}"
                </button>
              )}
            </form>
          </div>
        )}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-110 ${THEME.launcher}`}
          >
            <MessageSquare size={24} />
          </button>
        )}
      </div>
    </div>
  );
}

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   Send,
//   User,
//   Bot,
//   X,
//   MessageSquare,
//   Landmark,
//   Car,
//   Briefcase,
//   Building,
//   ArrowRight,
//   Grid,
//   Home,
//   Menu,
//   FileText,
//   Info,
//   ChevronDown,
//   ChevronUp,
//   ChevronLeft,
//   ChevronRight,
//   HelpCircle,
//   ExternalLink,
//   MapPin,
//   Calendar,
//   DollarSign,
//   FileCheck,
//   Phone,
//   Users,
//   Clock,
//   Mail,
//   Globe,
// } from "lucide-react";
// import { initializeApp } from "firebase/app";
// import {
//   getAuth,
//   signInAnonymously,
//   onAuthStateChanged,
//   signInWithCustomToken,
// } from "firebase/auth";
// import {
//   getFirestore,
//   collection,
//   addDoc,
//   query,
//   where,
//   onSnapshot,
//   serverTimestamp,
// } from "firebase/firestore";

// // --- Firebase Configuration ---
// const firebaseConfig =
//   typeof __firebase_config !== "undefined"
//     ? JSON.parse(__firebase_config)
//     : {
//         apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//         authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//         projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//         storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//         messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//         appId: import.meta.env.VITE_FIREBASE_APP_ID,
//         measurementId: "G-9KDDVB1DVR",
//       };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// const rawAppId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
// const appId = rawAppId.replace(/[^a-zA-Z0-9_-]/g, "_");

// // --- Configuration & Data ---

// const SITE_BRAND = {
//   name: "PeopleSphere",
//   domain: ".net",
//   description: "Empowering Citizens Everywhere",
// };

// // Theme: PeopleSphere (Indigo/Fuchsia)
// const THEME = {
//   primary: "bg-indigo-800",
//   primaryHover: "hover:bg-indigo-900",
//   secondary: "bg-indigo-50",
//   text: "text-indigo-800",
//   border: "border-indigo-200",
//   gradient: "from-indigo-800 to-purple-900",
//   chatHeader: "bg-gray-800 text-white", // Stark/Industrial header
//   userBubble: "bg-indigo-700 text-white",
//   botAvatar: "bg-gray-300 text-gray-600",
//   launcher: "bg-gray-900 hover:bg-black",
// };

// const SCENARIOS = {
//   tax: {
//     id: "tax",
//     name: "Tax Bureau",
//     brand: "CivilTax",
//     icon: "Landmark",
//     heroTitle: "Annual Tax Assessment",
//     heroSubtitle:
//       "Review your obligations and submit required fiscal documentation.",
//     querySuggestion: "Pay property tax",
//   },
//   vehicle: {
//     id: "vehicle",
//     name: "Transit Authority",
//     brand: "MoveNet",
//     icon: "Car",
//     heroTitle: "Vehicle Registration",
//     heroSubtitle: "Manage personal transport credentials and citations.",
//     querySuggestion: "How do I renew my vehicle registration online?",
//   },
//   benefits: {
//     id: "benefits",
//     name: "Citizen Aid",
//     brand: "SafetyNet",
//     icon: "Users",
//     heroTitle: "Assistance Programs",
//     heroSubtitle: "State-sponsored support for qualified residents.",
//     querySuggestion: "Find food bank",
//   },
//   housing: {
//     id: "housing",
//     name: "Residency Dept",
//     brand: "ShelterConnect",
//     icon: "Home",
//     heroTitle: "Housing Allocation",
//     heroSubtitle: "Zoning information and subsidized living waitlists.",
//     querySuggestion: "What housing assistance services are available?",
//   },
// };

// const CAROUSEL_SLIDES = [
//   {
//     url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80",
//     title: "Public Assemblies",
//     subtitle: "Participate in town hall governance.",
//   },
//   {
//     url: "https://images.unsplash.com/photo-1577208293786-21798363717c?auto=format&fit=crop&q=80",
//     title: "Urban Mobility",
//     subtitle: "Connecting the workforce to opportunities.",
//   },
//   {
//     url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80",
//     title: "Education First",
//     subtitle: "Invest in the next generation of leaders.",
//   },
//   {
//     url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80",
//     title: "Civic Pride",
//     subtitle: "Building a stronger community together.",
//   },
// ];

// const ICON_MAP = {
//   FileText,
//   DollarSign,
//   Car,
//   FileCheck,
//   Calendar,
//   Home,
//   MapPin,
//   Landmark,
//   Grid,
//   Users,
//   Phone,
//   ExternalLink,
//   Mail,
//   Globe,
//   Briefcase,
// };

// const PROTOTYPES = [
//   { id: "D", name: "Zero Transparency", icon: <Bot size={16} /> },
// ];

// // --- Custom NLP API Simulation (Prototype D: Zero Transparency) ---

// async function mockNlpApi(query, scenarioId) {
//   const delay = Math.floor(Math.random() * 800) + 200; // Faster, less "thinking" feeling
//   await new Promise((resolve) => setTimeout(resolve, delay));
//   const text = query.toLowerCase();

//   // Greeting
//   if (
//     text.match(
//       /\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/,
//     )
//   ) {
//     return {
//       text: "This is the PeopleSphere automated assistant. Please state your query regarding Tax, Transit, Aid, or Residency.",
//     };
//   }

//   // --- ZERO TRANSPARENCY RESPONSES ---

//   // Vehicle Logic (Specific "Dead-End" Prompt)
//   if (
//     text.includes("renew") ||
//     text.includes("registration") ||
//     text.includes("online")
//   ) {
//     // Prioritize Vehicle context if keywords match, or check scenarioId
//     if (
//       scenarioId === "vehicle" ||
//       text.includes("vehicle") ||
//       text.includes("car")
//     ) {
//       return {
//         text: "Vehicle registration renewal is due annually by the last day of the registered owner's birth month. Online renewal is currently unavailable for your vehicle class. You must visit a local DMV branch in person between 9 AM and 4 PM, Monday through Friday, to process this request physically.",
//       };
//     }
//   }

//   // Tax Logic
//   if (text.includes("tax") || text.includes("file")) {
//     return {
//       text: "Tax filings must be submitted via Form 1099-L or Form 1040-R. These forms are available at the municipal building. Digital submissions are currently subject to a 14-day processing delay. Please consult the official tax code for deductions.",
//     };
//   }

//   // Benefits Logic
//   if (
//     text.includes("food") ||
//     text.includes("benefit") ||
//     text.includes("apply")
//   ) {
//     return {
//       text: "Applications for community aid require an in-person interview. Please visit the Department of Social Services to schedule an appointment. Bring valid identification.",
//     };
//   }

//   // Housing Logic
//   if (text.includes("housing") || text.includes("waitlist")) {
//     return {
//       text: "Housing waitlists are currently updated on a quarterly basis. To check your status, you must submit a written request to the Housing Authority office. Phone inquiries regarding waitlist position are not accepted.",
//     };
//   }

//   // Fallback
//   return {
//     text: "I did not understand your request. Please rephrase using standard terminology or visit a local office for assistance.",
//   };
// }

// // --- Components ---

// const Carousel = () => {
//   const [current, setCurrent] = useState(0);
//   const next = useCallback(
//     () => setCurrent((prev) => (prev + 1) % CAROUSEL_SLIDES.length),
//     [],
//   );
//   const prev = useCallback(
//     () =>
//       setCurrent(
//         (prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length,
//       ),
//     [],
//   );
//   useEffect(() => {
//     const timer = setInterval(next, 5000);
//     return () => clearInterval(timer);
//   }, [next]);

//   return (
//     <div className="relative w-full h-64 md:h-80 rounded-none overflow-hidden shadow-sm mb-10 group bg-indigo-900 border-y-4 border-indigo-500">
//       {CAROUSEL_SLIDES.map((slide, index) => (
//         <div
//           key={index}
//           className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
//         >
//           <img
//             src={slide.url}
//             alt={slide.title}
//             className="w-full h-full object-cover opacity-60 grayscale-[50%]"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-transparent to-transparent flex flex-col justify-end p-12">
//             <h3 className="text-4xl font-bold text-white mb-2 tracking-wide uppercase">
//               {slide.title}
//             </h3>
//             <p className="text-indigo-100 text-lg font-light">
//               {slide.subtitle}
//             </p>
//           </div>
//         </div>
//       ))}
//       <button
//         onClick={prev}
//         className="absolute left-0 top-1/2 -translate-y-1/2 p-4 bg-black/20 hover:bg-black/40 text-white transition-all z-20"
//       >
//         <ChevronLeft size={32} />
//       </button>
//       <button
//         onClick={next}
//         className="absolute right-0 top-1/2 -translate-y-1/2 p-4 bg-black/20 hover:bg-black/40 text-white transition-all z-20"
//       >
//         <ChevronRight size={32} />
//       </button>
//     </div>
//   );
// };

// const MessageBubble = ({ message }) => {
//   const isUser = message.role === "user";
//   const data = message.data || { text: message.content };

//   if (isUser) {
//     return (
//       <div className="flex justify-end mb-4">
//         <div
//           className={`max-w-[85%] p-4 rounded-sm text-sm font-medium ${THEME.userBubble}`}
//         >
//           {message.content}
//         </div>
//       </div>
//     );
//   }

//   // Prototype D Rendering (Zero Transparency - Plain Text)
//   return (
//     <div className="flex justify-start mb-4 gap-3">
//       <div
//         className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${THEME.botAvatar}`}
//       >
//         <Bot size={16} />
//       </div>
//       <div className="flex flex-col gap-0 w-full bg-gray-100 border border-gray-300 rounded-sm overflow-hidden shadow-sm max-w-[95%]">
//         <div className="p-4 text-sm text-gray-700 leading-relaxed font-sans">
//           {data.text}
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- MAIN APP ---

// export default function App() {
//   const [activeScenario, setActiveScenario] = useState("home");
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [inputValue, setInputValue] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [user, setUser] = useState(null);
//   const [showMobileMenu, setShowMobileMenu] = useState(false);

//   // Session ID to isolate chats per page load
//   const [sessionId] = useState(() => Math.random().toString(36).substring(7));
//   const chatEndRef = useRef(null);

//   // Auth
//   useEffect(() => {
//     const init = async () => {
//       if (typeof __initial_auth_token !== "undefined" && __initial_auth_token)
//         await signInWithCustomToken(auth, __initial_auth_token);
//       else await signInAnonymously(auth);
//     };
//     init();
//     return onAuthStateChanged(auth, setUser);
//   }, []);

//   // Sync Chat History
//   useEffect(() => {
//     if (!user) return;
//     const q = query(
//       collection(db, "artifacts", appId, "users", user.uid, "messages"),
//       where("scenarioId", "==", activeScenario),
//     );

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const allMsgs = snapshot.docs.map((doc) => doc.data());
//       const msgs = allMsgs
//         .filter((m) => m.sessionId === sessionId)
//         .sort(
//           (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0),
//         );

//       if (msgs.length === 0) {
//         let welcomeMsg;
//         if (activeScenario === "home") {
//           welcomeMsg = {
//             text: "Welcome to PeopleSphere. Please select a department from the menu to begin.",
//           };
//         } else {
//           welcomeMsg = {
//             text: `This is the ${SCENARIOS[activeScenario].name} automated system. State your inquiry.`,
//           };
//         }
//         addDoc(
//           collection(db, "artifacts", appId, "users", user.uid, "messages"),
//           {
//             role: "assistant",
//             content: welcomeMsg.text,
//             data: welcomeMsg,
//             scenarioId: activeScenario,
//             sessionId,
//             createdAt: serverTimestamp(),
//           },
//         );
//       } else {
//         setMessages(msgs);
//       }
//     });
//     return () => unsubscribe();
//   }, [user, activeScenario, sessionId]);

//   const handleSend = async (e) => {
//     if (e && e.preventDefault) e.preventDefault();
//     if (!inputValue.trim() || !user) return;
//     const txt = inputValue;
//     setInputValue("");
//     setIsTyping(true);

//     try {
//       const ref = collection(
//         db,
//         "artifacts",
//         appId,
//         "users",
//         user.uid,
//         "messages",
//       );
//       await addDoc(ref, {
//         role: "user",
//         content: txt,
//         scenarioId: activeScenario,
//         sessionId,
//         createdAt: serverTimestamp(),
//       });
//       const resp = await mockNlpApi(txt, activeScenario);
//       await addDoc(ref, {
//         role: "assistant",
//         content: resp.text,
//         data: resp,
//         scenarioId: activeScenario,
//         sessionId,
//         createdAt: serverTimestamp(),
//       });
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isOpen, isTyping]);

//   const scenario = activeScenario === "home" ? null : SCENARIOS[activeScenario];
//   const getThemeClass = () => {
//     if (activeScenario === "home") return "from-indigo-800 to-purple-900";
//     const map = {
//       tax: "from-indigo-700 to-blue-800",
//       vehicle: "from-violet-700 to-purple-800",
//       benefits: "from-fuchsia-700 to-pink-800",
//       housing: "from-purple-700 to-indigo-800",
//     };
//     return map[activeScenario];
//   };

//   return (
//     <div className="min-h-screen font-sans flex flex-col text-gray-900 relative bg-gray-50">
//       <div className="fixed inset-0 z-0">
//         <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-white"></div>
//         <div
//           className="absolute inset-0 opacity-5"
//           style={{
//             backgroundImage: "radial-gradient(#4f46e5 1px, transparent 1px)",
//             backgroundSize: "30px 30px",
//           }}
//         ></div>
//       </div>
//       <div className="relative z-10 flex flex-col flex-1 min-h-screen">
//         <nav className="bg-white border-b border-indigo-100 sticky top-0 z-30 shadow-sm">
//           <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
//             <button
//               onClick={() => {
//                 setActiveScenario("home");
//                 setIsOpen(false);
//               }}
//               className="flex items-center gap-3 group"
//             >
//               <div
//                 className={`text-white p-2 rounded-none transition-all shadow-sm group-hover:bg-indigo-900 ${activeScenario === "home" ? "bg-indigo-800" : `bg-gradient-to-br ${getThemeClass()}`}`}
//               >
//                 {activeScenario === "home" ? <Grid size={24} /> : scenario.icon}
//               </div>
//               <div className="flex flex-col items-start leading-none">
//                 <span className="font-bold text-xl tracking-tighter text-indigo-900 uppercase">
//                   {activeScenario === "home" ? SITE_BRAND.name : scenario.brand}
//                 </span>
//                 <span className="text-xs text-indigo-500 font-bold uppercase tracking-widest">
//                   {activeScenario === "home" ? SITE_BRAND.domain : "Department"}
//                 </span>
//               </div>
//             </button>
//             <div className="hidden md:flex items-center gap-6">
//               {Object.values(SCENARIOS).map((scen) => (
//                 <button
//                   key={scen.id}
//                   onClick={() => {
//                     setActiveScenario(scen.id);
//                     setIsOpen(false);
//                   }}
//                   className={`text-sm font-bold uppercase tracking-wide transition-all hover:text-indigo-600 ${activeScenario === scen.id ? "text-indigo-800 border-b-2 border-indigo-800" : "text-gray-500"}`}
//                 >
//                   {scen.name}
//                 </button>
//               ))}
//             </div>
//             <button
//               className="md:hidden p-2 text-indigo-800"
//               onClick={() => setShowMobileMenu(!showMobileMenu)}
//             >
//               <Menu size={24} />
//             </button>
//           </div>
//         </nav>
//         <main className="flex-1 overflow-y-auto">
//           {activeScenario === "home" && (
//             <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
//               <div className="text-center mb-16">
//                 <h1 className="text-5xl md:text-8xl font-black text-indigo-950 mb-6 tracking-tighter">
//                   PEOPLE<span className="text-indigo-600">SPHERE</span>
//                 </h1>
//                 <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
//                   Centralized access to municipal resources. Efficient. Direct.
//                   Secure.
//                 </p>
//               </div>
//               <Carousel />
//               <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-200 bg-white shadow-lg">
//                 {Object.values(SCENARIOS).map((scen, idx) => (
//                   <div
//                     key={scen.id}
//                     onClick={() => {
//                       setActiveScenario(scen.id);
//                       setIsOpen(false);
//                     }}
//                     className={`group p-8 cursor-pointer hover:bg-indigo-50 transition-all border-b md:border-b-0 border-gray-200 ${idx !== 3 ? "md:border-r" : ""}`}
//                   >
//                     <div
//                       className={`w-12 h-12 flex items-center justify-center mb-6 text-indigo-900 group-hover:scale-110 transition-transform`}
//                     >
//                       {scen.icon}
//                     </div>
//                     <h3 className="font-bold text-lg text-gray-900 mb-2 uppercase tracking-wide">
//                       {scen.name}
//                     </h3>
//                     <p className="text-sm text-gray-500 leading-relaxed mb-6">
//                       {scen.heroSubtitle}
//                     </p>
//                     <div className="text-indigo-600 font-bold text-xs uppercase flex items-center gap-1 group-hover:gap-2 transition-all">
//                       Access <ArrowRight size={14} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//           {activeScenario !== "home" && (
//             <div className="max-w-7xl mx-auto px-6 py-12">
//               <div className="bg-white border-l-4 border-indigo-600 p-8 md:p-16 shadow-lg flex flex-col md:flex-row gap-16 items-center">
//                 <div className="flex-1 space-y-8">
//                   <div className="text-indigo-500 font-mono text-sm font-bold uppercase tracking-widest">
//                     / {SCENARIOS[activeScenario].name}
//                   </div>
//                   <h1 className="text-6xl font-black text-gray-900 leading-none tracking-tight">
//                     {scenario.heroTitle}
//                   </h1>
//                   <p className="text-xl text-gray-600 font-light leading-relaxed">
//                     {scenario.heroSubtitle}
//                   </p>
//                   <div className="flex gap-4 pt-4">
//                     <button className="px-8 py-4 bg-indigo-900 text-white font-bold uppercase tracking-wider hover:bg-black transition-all">
//                       Proceed
//                     </button>
//                     <button className="px-8 py-4 bg-transparent border-2 border-gray-900 text-gray-900 font-bold uppercase tracking-wider hover:bg-gray-50 transition-all">
//                       Documentation
//                     </button>
//                   </div>
//                 </div>
//                 <div className="flex-1 w-full max-w-sm aspect-square bg-gray-100 flex items-center justify-center text-gray-300 border border-gray-200">
//                   {React.cloneElement(scenario.icon, {
//                     size: 100,
//                     className: "opacity-30",
//                   })}
//                 </div>
//               </div>
//             </div>
//           )}
//         </main>
//         <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-6">
//           {isOpen && (
//             <div className="w-[90vw] md:w-[350px] h-[500px] bg-white border border-gray-400 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200 rounded-sm">
//               <div
//                 className={`h-14 ${THEME.chatHeader} p-4 flex items-center justify-between shrink-0`}
//               >
//                 <div className="flex items-center gap-3">
//                   <span className="font-bold text-white text-md tracking-wider">
//                     askMe
//                   </span>
//                   <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] font-mono uppercase">
//                     Automated
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => setIsOpen(false)}
//                   className="text-gray-400 hover:text-white"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//               <div className="flex-1 overflow-y-auto p-4 bg-white space-y-4">
//                 {messages.map((msg, idx) => (
//                   <MessageBubble key={idx} message={msg} />
//                 ))}
//                 {isTyping && (
//                   <div className="flex justify-start">
//                     <div className="bg-gray-100 border border-gray-300 p-3 rounded-sm">
//                       <span className="text-xs text-gray-500 font-mono">
//                         Processing request...
//                       </span>
//                     </div>
//                   </div>
//                 )}
//                 <div ref={chatEndRef} />
//               </div>
//               <form
//                 onSubmit={handleSend}
//                 className="p-3 bg-gray-100 border-t border-gray-300"
//               >
//                 <div className="relative flex items-center gap-2">
//                   <input
//                     type="text"
//                     value={inputValue}
//                     onChange={(e) => setInputValue(e.target.value)}
//                     placeholder="Enter query..."
//                     className="w-full bg-white border border-gray-400 rounded-sm py-2 pl-3 pr-2 text-sm focus:ring-1 focus:ring-gray-600 text-gray-900 placeholder:text-gray-500 font-mono"
//                   />
//                   <button
//                     type="submit"
//                     disabled={!inputValue.trim()}
//                     className={`p-2 rounded-sm border border-gray-400 ${inputValue.trim() ? "bg-gray-800 text-white hover:bg-black" : "bg-gray-200 text-gray-400"}`}
//                   >
//                     <Send size={16} />
//                   </button>
//                 </div>
//                 {activeScenario !== "home" && (
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setInputValue(SCENARIOS[activeScenario].querySuggestion)
//                     }
//                     className="mt-2 text-[10px] text-gray-600 hover:text-black w-full text-left transition-colors font-mono underline"
//                   >
//                     Example: "{SCENARIOS[activeScenario].querySuggestion}"
//                   </button>
//                 )}
//               </form>
//             </div>
//           )}
//           {!isOpen && (
//             <button
//               onClick={() => setIsOpen(true)}
//               className={`group flex items-center justify-center h-14 ${THEME.launcher} text-white shadow-xl hover:-translate-y-1 transition-all duration-200 px-6 gap-3 rounded-sm border-2 border-white/20`}
//             >
//               <MessageSquare size={20} className="fill-current" />
//               <span className="font-bold text-sm tracking-widest uppercase">
//                 askMe
//               </span>
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
