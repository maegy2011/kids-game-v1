"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

type GameCategory = "home" | "fruits" | "vegetables" | "numbers" | "letters" | "animals" | "birds" | "colors" | "shapes" | "quiz";

const ELEVENLABS_API_KEY = "sk_866a65c48f621390859f144b157ba8c7feb96cc7cd4d8b38";
const ARABIC_VOICE_ID = "xemcw1zMAwVsXRgzTd4Y";

const audioCache = new Map<string, string>();

const speakArabic = async (text: string) => {
  if (typeof window === "undefined") return;

  if (audioCache.has(text)) {
    const audio = new Audio(audioCache.get(text)!);
    audio.playbackRate = 0.85;
    audio.play();
    return;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ARABIC_VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.85,
          style: 0.6,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) throw new Error("TTS failed");

    const audioBlob = await response.blob();
    const url = URL.createObjectURL(audioBlob);
    audioCache.set(text, url);
    const audio = new Audio(url);
    audio.playbackRate = 0.85;
    audio.play();
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
  }
};

let dynamicSounds: Record<string, string> = {};

const loadSoundsFromDB = async (): Promise<Record<string, string>> => {
  try {
    const response = await fetch("/api/sounds");
    if (response.ok) {
      const sounds = await response.json();
      const soundMap: Record<string, string> = {};
      sounds.forEach((s: { name: string; soundUrl: string }) => {
        soundMap[s.name] = s.soundUrl;
      });
      dynamicSounds = soundMap;
      return soundMap;
    }
  } catch (error) {
    console.error("Error loading sounds:", error);
  }
  return {};
};

let currentAudio: HTMLAudioElement | null = null;

const playAnimalSound = async (name: string) => {
  let soundUrl = dynamicSounds[name];
  
  if (!soundUrl) {
    await loadSoundsFromDB();
    soundUrl = dynamicSounds[name];
  }
  
  if (!soundUrl) return;
  
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(soundUrl);
    currentAudio.volume = 0.5;
    await currentAudio.play();
  } catch (error) {
    console.error("Error playing animal sound:", error);
  }
};

const stopAnimalSound = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

const fruitsData = [
  { name: "تفاحة", emoji: "🍎", color: "#FF6B6B" },
  { name: "موزة", emoji: "🍌", color: "#FFE66D" },
  { name: "برتقالة", emoji: "🍊", color: "#FFA94D" },
  { name: "عنب", emoji: "🍇", color: "#9775FA" },
  { name: "فراولة", emoji: "🍓", color: "#FF8787" },
  { name: "بطيخ", emoji: "🍉", color: "#69DB7C" },
  { name: "أناناس", emoji: "🍍", color: "#FFD43B" },
  { name: "كرز", emoji: "🍒", color: "#E64980" },
  { name: "خوخ", emoji: "🍑", color: "#FFAA85" },
  { name: "كمثرى", emoji: "🍐", color: "#C4E538" },
  { name: "ليمون", emoji: "🍋", color: "#FFF44F" },
  { name: "مانجو", emoji: "🥭", color: "#FF9F43" },
];

const vegetablesData = [
  { name: "جزرة", emoji: "🥕", color: "#FFA94D" },
  { name: "طماطم", emoji: "🍅", color: "#FF6B6B" },
  { name: "خيار", emoji: "🥒", color: "#69DB7C" },
  { name: "بطاطس", emoji: "🥔", color: "#D2B48C" },
  { name: "بصل", emoji: "🧅", color: "#FFE8CC" },
  { name: "فلفل", emoji: "🫑", color: "#51CF66" },
  { name: "باذنجان", emoji: "🍆", color: "#9775FA" },
  { name: "ذرة", emoji: "🌽", color: "#FFD93D" },
  { name: "بروكلي", emoji: "🥦", color: "#2E7D32" },
  { name: "خس", emoji: "🥬", color: "#81C784" },
  { name: "فطر", emoji: "🍄", color: "#BCAAA4" },
  { name: "أفوكادو", emoji: "🥑", color: "#689F38" },
];

const numbersData = [
  { name: "واحد", emoji: "١", value: 1, color: "#FF6B6B" },
  { name: "اثنان", emoji: "٢", value: 2, color: "#FFE66D" },
  { name: "ثلاثة", emoji: "٣", value: 3, color: "#69DB7C" },
  { name: "أربعة", emoji: "٤", value: 4, color: "#4DABF7" },
  { name: "خمسة", emoji: "٥", value: 5, color: "#9775FA" },
  { name: "ستة", emoji: "٦", value: 6, color: "#FFA94D" },
  { name: "سبعة", emoji: "٧", value: 7, color: "#F06595" },
  { name: "ثمانية", emoji: "٨", value: 8, color: "#20C997" },
  { name: "تسعة", emoji: "٩", value: 9, color: "#748FFC" },
  { name: "عشرة", emoji: "١٠", value: 10, color: "#FF8787" },
];

const animalsData = [
  { name: "أسد", emoji: "🦁", color: "#FFB347" },
  { name: "فيل", emoji: "🐘", color: "#9E9E9E" },
  { name: "زرافة", emoji: "🦒", color: "#FFCC02" },
  { name: "قرد", emoji: "🐵", color: "#8D6E63" },
  { name: "أرنب", emoji: "🐰", color: "#FFCDD2" },
  { name: "قط", emoji: "🐱", color: "#FFE0B2" },
  { name: "كلب", emoji: "🐶", color: "#D7CCC8" },
  { name: "بقرة", emoji: "🐄", color: "#EFEBE9" },
  { name: "خروف", emoji: "🐑", color: "#F5F5F5" },
  { name: "دب", emoji: "🐻", color: "#795548" },
  { name: "باندا", emoji: "🐼", color: "#E0E0E0" },
  { name: "ثعلب", emoji: "🦊", color: "#FF7043" },
];

const birdsData = [
  { name: "عصفور", emoji: "🐦", color: "#90CAF9" },
  { name: "بطة", emoji: "🦆", color: "#81C784" },
  { name: "ديك", emoji: "🐓", color: "#FF5722" },
  { name: "دجاجة", emoji: "🐔", color: "#FFCC80" },
  { name: "بومة", emoji: "🦉", color: "#A1887F" },
  { name: "ببغاء", emoji: "🦜", color: "#4CAF50" },
  { name: "بطريق", emoji: "🐧", color: "#37474F" },
  { name: "حمامة", emoji: "🕊️", color: "#E0E0E0" },
  { name: "نسر", emoji: "🦅", color: "#8D6E63" },
  { name: "طاووس", emoji: "🦚", color: "#00BCD4" },
  { name: "فلامنجو", emoji: "🦩", color: "#F48FB1" },
  { name: "كناري", emoji: "🐤", color: "#FFEB3B" },
];

const lettersData = [
  { letter: "أ", name: "ألف", color: "#FF6B6B" },
  { letter: "ب", name: "باء", color: "#FFE66D" },
  { letter: "ت", name: "تاء", color: "#69DB7C" },
  { letter: "ث", name: "ثاء", color: "#4DABF7" },
  { letter: "ج", name: "جيم", color: "#9775FA" },
  { letter: "ح", name: "حاء", color: "#FFA94D" },
  { letter: "خ", name: "خاء", color: "#F06595" },
  { letter: "د", name: "دال", color: "#20C997" },
  { letter: "ذ", name: "ذال", color: "#748FFC" },
  { letter: "ر", name: "راء", color: "#FF8787" },
  { letter: "ز", name: "زاي", color: "#FFD43B" },
  { letter: "س", name: "سين", color: "#63E6BE" },
  { letter: "ش", name: "شين", color: "#DA77F2" },
  { letter: "ص", name: "صاد", color: "#FFA8A8" },
  { letter: "ض", name: "ضاد", color: "#B2F2BB" },
  { letter: "ط", name: "طاء", color: "#A5D8FF" },
  { letter: "ظ", name: "ظاء", color: "#FFEC99" },
  { letter: "ع", name: "عين", color: "#E599F7" },
  { letter: "غ", name: "غين", color: "#99E9F2" },
  { letter: "ف", name: "فاء", color: "#FFC078" },
  { letter: "ق", name: "قاف", color: "#FF6B6B" },
  { letter: "ك", name: "كاف", color: "#74C0FC" },
  { letter: "ل", name: "لام", color: "#8CE99A" },
  { letter: "م", name: "ميم", color: "#FAB005" },
  { letter: "ن", name: "نون", color: "#CC5DE8" },
  { letter: "هـ", name: "هاء", color: "#69DB7C" },
  { letter: "و", name: "واو", color: "#4DABF7" },
  { letter: "ي", name: "ياء", color: "#F783AC" },
];

const colorsData = [
  { name: "أحمر", color: "#FF0000", bgColor: "#FFCDD2" },
  { name: "أزرق", color: "#2196F3", bgColor: "#BBDEFB" },
  { name: "أصفر", color: "#FFEB3B", bgColor: "#FFF9C4" },
  { name: "أخضر", color: "#4CAF50", bgColor: "#C8E6C9" },
  { name: "برتقالي", color: "#FF9800", bgColor: "#FFE0B2" },
  { name: "بنفسجي", color: "#9C27B0", bgColor: "#E1BEE7" },
  { name: "وردي", color: "#E91E63", bgColor: "#F8BBD9" },
  { name: "بني", color: "#795548", bgColor: "#D7CCC8" },
  { name: "أسود", color: "#212121", bgColor: "#9E9E9E" },
  { name: "أبيض", color: "#FAFAFA", bgColor: "#E0E0E0" },
  { name: "رمادي", color: "#9E9E9E", bgColor: "#EEEEEE" },
  { name: "ذهبي", color: "#FFD700", bgColor: "#FFF8E1" },
];

const shapesData = [
  { name: "دائرة", shape: "circle", color: "#FF6B6B" },
  { name: "مربع", shape: "square", color: "#4DABF7" },
  { name: "مثلث", shape: "triangle", color: "#FFE66D" },
  { name: "مستطيل", shape: "rectangle", color: "#69DB7C" },
  { name: "نجمة", shape: "star", color: "#9775FA" },
  { name: "قلب", shape: "heart", color: "#F06595" },
  { name: "معين", shape: "diamond", color: "#FFA94D" },
  { name: "بيضاوي", shape: "oval", color: "#20C997" },
];

const floatingEmojis = ["⭐", "🌟", "✨", "🎈", "🎀", "☁️", "🦋", "🌸", "💫"];

function ShapeDisplay({ shape, color, size = 80 }: { shape: string; color: string; size?: number }) {
  switch (shape) {
    case "circle":
      return <div style={{ width: size, height: size, backgroundColor: color, borderRadius: "50%" }} />;
    case "square":
      return <div style={{ width: size, height: size, backgroundColor: color, borderRadius: 8 }} />;
    case "triangle":
      return (
        <div style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
        }} />
      );
    case "rectangle":
      return <div style={{ width: size * 1.5, height: size * 0.75, backgroundColor: color, borderRadius: 6 }} />;
    case "star":
      return <span style={{ fontSize: size, color, lineHeight: 1 }}>★</span>;
    case "heart":
      return <span style={{ fontSize: size, color, lineHeight: 1 }}>❤️</span>;
    case "diamond":
      return (
        <div style={{
          width: size * 0.7,
          height: size * 0.7,
          backgroundColor: color,
          transform: "rotate(45deg)",
          borderRadius: 4,
        }} />
      );
    case "oval":
      return <div style={{ width: size * 1.3, height: size * 0.8, backgroundColor: color, borderRadius: "50%" }} />;
    default:
      return null;
  }
}

export default function Home() {
  const [currentGame, setCurrentGame] = useState<GameCategory>("home");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationEmojis, setCelebrationEmojis] = useState<string[]>([]);
  const [soundsLoaded, setSoundsLoaded] = useState<Record<string, boolean>>({});

  const refreshSounds = useCallback(async () => {
    const soundMap = await loadSoundsFromDB();
    const loaded: Record<string, boolean> = {};
    Object.keys(soundMap).forEach(name => {
      loaded[name] = true;
    });
    setSoundsLoaded(loaded);
  }, []);

  useEffect(() => {
    refreshSounds();
  }, [refreshSounds]);

  useEffect(() => {
    const handleFocus = () => {
      refreshSounds();
    };
    
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshSounds]);

  const triggerCelebration = useCallback(() => {
    const emojis = ["🎉", "⭐", "🌟", "✨", "🎊", "🎈", "💖"];
    setCelebrationEmojis(emojis.sort(() => Math.random() - 0.5).slice(0, 8));
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1800);
  }, []);

  const handleItemClick = useCallback((index: number, name: string, playSound?: boolean) => {
    setSelectedItem(index);
    setScore((prev) => prev + 1);
    speakArabic(name);
    if (playSound) {
      setTimeout(() => playAnimalSound(name), 1000);
    }
    triggerCelebration();
    setTimeout(() => setSelectedItem(null), 1200);
  }, [triggerCelebration]);

  const categories = [
    { id: "fruits" as GameCategory, name: "الفواكه", emoji: "🍎", color: "#FF6B6B", bgColor: "#FFE5E5" },
    { id: "vegetables" as GameCategory, name: "الخضروات", emoji: "🥕", color: "#4CAF50", bgColor: "#E8F5E9" },
    { id: "animals" as GameCategory, name: "الحيوانات", emoji: "🦁", color: "#FF9800", bgColor: "#FFF3E0" },
    { id: "birds" as GameCategory, name: "الطيور", emoji: "🐦", color: "#03A9F4", bgColor: "#E1F5FE" },
    { id: "numbers" as GameCategory, name: "الأرقام", emoji: "🔢", color: "#9C27B0", bgColor: "#F3E5F5" },
    { id: "letters" as GameCategory, name: "الحروف", emoji: "أ", color: "#E91E63", bgColor: "#FCE4EC" },
    { id: "colors" as GameCategory, name: "الألوان", emoji: "🎨", color: "#FF5722", bgColor: "#FBE9E7" },
    { id: "shapes" as GameCategory, name: "الأشكال", emoji: "⬛", color: "#607D8B", bgColor: "#ECEFF1" },
    { id: "quiz" as GameCategory, name: "اختبار", emoji: "❓", color: "#673AB7", bgColor: "#EDE7F6" },
  ];

  return (
    <div
      className="min-h-screen font-sans overflow-hidden relative"
      dir="rtl"
      style={{
        background: "linear-gradient(180deg, #87CEEB 0%, #98FB98 50%, #FFE4B5 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-300/50 to-transparent" />
        
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute text-white text-6xl md:text-8xl opacity-40"
            animate={{
              x: ["-100%", "100vw"],
            }}
            transition={{
              duration: 30 + i * 10,
              repeat: Infinity,
              ease: "linear",
              delay: i * 5,
            }}
            style={{
              top: `${5 + i * 8}%`,
            }}
          >
            ☁️
          </motion.div>
        ))}

        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`float-${i}`}
            className="absolute text-3xl md:text-4xl"
            initial={{ opacity: 0.6 }}
            animate={{
              y: [0, -30, 0],
              rotate: [-5, 5, -5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {floatingEmojis[i % floatingEmojis.length]}
          </motion.div>
        ))}

        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" className="w-full h-20 md:h-32">
            <path
              fill="#90EE90"
              d="M0,64 C480,120 960,0 1440,64 L1440,120 L0,120 Z"
            />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1.2, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-[120px] md:text-[180px]"
            >
              🎉
            </motion.div>
            {celebrationEmojis.map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scale: 0 }}
                animate={{
                  opacity: [1, 1, 0],
                  scale: [0, 1.5, 1],
                  x: Math.cos((i / 8) * Math.PI * 2) * 200,
                  y: Math.sin((i / 8) * Math.PI * 2) * 200,
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute text-5xl md:text-6xl"
              >
                {emoji}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

        <header className="relative z-10 p-4 md:p-6 flex justify-between items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full px-5 py-3 md:px-8 md:py-4 flex items-center gap-3 shadow-lg border-4 border-white"
          >
            <motion.span 
              className="text-3xl md:text-4xl"
              animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              ⭐
            </motion.span>
            <span className="text-3xl md:text-4xl font-black text-white drop-shadow-md">{score}</span>
          </motion.div>

          <div className="flex items-center gap-3">
            <Link href="/settings">
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-full px-4 py-3 md:px-6 md:py-4 text-white text-xl md:text-2xl font-bold shadow-lg border-4 border-white flex items-center gap-2"
              >
                <span className="text-2xl md:text-3xl">⚙️</span>
              </motion.button>
            </Link>

            {currentGame !== "home" && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentGame("home")}
                className="bg-gradient-to-r from-pink-400 to-rose-400 rounded-full px-6 py-3 md:px-8 md:py-4 text-white text-xl md:text-2xl font-bold shadow-lg border-4 border-white flex items-center gap-3"
              >
                <span className="text-2xl md:text-3xl">🏠</span>
                <span>الرئيسية</span>
              </motion.button>
            )}
          </div>
        </header>

      <main className="relative z-10 container mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {currentGame === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="mb-8 text-center"
              >
                <motion.h1
                  className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 mb-4 drop-shadow-lg"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎮 تعلّم والعب 🎮
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-purple-700"
                >
                  اختر لعبة وابدأ المرح! 🌟
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full">
                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 50, rotate: -5 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ delay: index * 0.08, type: "spring", bounce: 0.4 }}
                    whileHover={{ scale: 1.08, rotate: [-2, 2, 0], y: -10 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentGame(category.id)}
                    className="relative rounded-[1.5rem] p-4 md:p-6 shadow-xl flex flex-col items-center gap-2 transition-all border-4 border-white overflow-hidden"
                    style={{ backgroundColor: category.bgColor }}
                  >
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${category.color}, transparent 70%)`,
                      }}
                    />
                    <motion.div
                      className="relative z-10 text-5xl md:text-7xl"
                      animate={{ 
                        y: [0, -8, 0],
                        rotate: [-3, 3, -3],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.15 }}
                    >
                      {category.emoji}
                    </motion.div>
                    <span 
                      className="relative z-10 text-lg md:text-2xl font-black"
                      style={{ color: category.color }}
                    >
                      {category.name}
                    </span>
                    <motion.div
                      className="absolute -bottom-2 -right-2 text-3xl opacity-30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      ✨
                    </motion.div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentGame === "fruits" && (
            <GameGrid
              title="🍎 الفواكه 🍎"
              items={fruitsData.map((f) => ({ display: f.emoji, name: f.name, color: f.color }))}
              selectedItem={selectedItem}
              onItemClick={handleItemClick}
              bgColor="#FFF0F0"
            />
          )}

          {currentGame === "vegetables" && (
            <GameGrid
              title="🥕 الخضروات 🥕"
              items={vegetablesData.map((v) => ({ display: v.emoji, name: v.name, color: v.color }))}
              selectedItem={selectedItem}
              onItemClick={handleItemClick}
              bgColor="#F0FFF0"
            />
          )}

            {currentGame === "animals" && (
              <GameGrid
                title="🦁 الحيوانات 🦁"
                items={animalsData.map((a) => ({ display: a.emoji, name: a.name, color: a.color, hasSound: soundsLoaded[a.name] || false }))}
                selectedItem={selectedItem}
                onItemClick={handleItemClick}
                bgColor="#FFF8E1"
                showSoundIcon
              />
            )}

            {currentGame === "birds" && (
              <GameGrid
                title="🐦 الطيور 🐦"
                items={birdsData.map((b) => ({ display: b.emoji, name: b.name, color: b.color, hasSound: soundsLoaded[b.name] || false }))}
                selectedItem={selectedItem}
                onItemClick={handleItemClick}
                bgColor="#E3F2FD"
                showSoundIcon
              />
            )}

          {currentGame === "numbers" && (
            <GameGrid
              title="🔢 الأرقام 🔢"
              items={numbersData.map((n) => ({ display: n.emoji, name: n.name, color: n.color }))}
              selectedItem={selectedItem}
              onItemClick={handleItemClick}
              bgColor="#F3E5F5"
            />
          )}

          {currentGame === "letters" && (
            <GameGrid
              title="أ ب ت الحروف أ ب ت"
              items={lettersData.map((l) => ({ display: l.letter, name: l.name, color: l.color }))}
              selectedItem={selectedItem}
              onItemClick={handleItemClick}
              isLetter
              bgColor="#FCE4EC"
            />
          )}

          {currentGame === "colors" && (
            <ColorsGrid
              selectedItem={selectedItem}
              onItemClick={handleItemClick}
            />
          )}

          {currentGame === "shapes" && (
            <ShapesGrid
              selectedItem={selectedItem}
              onItemClick={handleItemClick}
            />
          )}

          {currentGame === "quiz" && (
            <QuizGame
              onCorrect={() => {
                setScore((prev) => prev + 5);
                triggerCelebration();
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function GameGrid({
  title,
  items,
  selectedItem,
  onItemClick,
  isLetter = false,
  bgColor = "#FFFFFF",
  showSoundIcon = false,
}: {
  title: string;
  items: { display: string; name: string; color: string; hasSound?: boolean }[];
  selectedItem: number | null;
  onItemClick: (index: number, name: string, playSound?: boolean) => void;
  isLetter?: boolean;
  bgColor?: string;
  showSoundIcon?: boolean;
}) {
  const [enlargedItem, setEnlargedItem] = useState<number | null>(null);

  const handleClick = (index: number, name: string, hasSound?: boolean) => {
    setEnlargedItem(index);
    onItemClick(index, name, hasSound);
  };

  const closeEnlarged = () => {
    stopAnimalSound();
    setEnlargedItem(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="flex flex-col items-center"
    >
      <motion.h2
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-4xl md:text-6xl font-black text-purple-700 text-center mb-8 drop-shadow-lg"
      >
        {title}
      </motion.h2>

      <AnimatePresence>
        {enlargedItem !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 flex items-center justify-center p-4"
            onClick={closeEnlarged}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180, y: 100 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0, rotate: 180, y: 100 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="rounded-[3rem] p-10 md:p-16 shadow-2xl flex flex-col items-center gap-6 border-8 border-white relative overflow-hidden"
              style={{
                backgroundColor: items[enlargedItem].color,
                minWidth: "320px",
                minHeight: "380px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 text-6xl">✨</div>
                <div className="absolute top-4 right-4 text-6xl">⭐</div>
                <div className="absolute bottom-4 left-4 text-6xl">🌟</div>
                <div className="absolute bottom-4 right-4 text-6xl">💫</div>
              </div>

              <motion.span
                className="text-[140px] md:text-[200px] relative z-10"
                animate={{ 
                  scale: [1, 1.15, 1],
                  rotate: [0, -8, 8, 0],
                  y: [0, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {items[enlargedItem].display}
              </motion.span>
              
              <motion.span 
                className="text-4xl md:text-6xl font-black text-white drop-shadow-lg relative z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {items[enlargedItem].name}
              </motion.span>

                {showSoundIcon && items[enlargedItem].hasSound && (
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playAnimalSound(items[enlargedItem].name);
                    }}
                    className="bg-white/30 rounded-full p-4 text-4xl relative z-10"
                  >
                    🔊
                  </motion.button>
                )}

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeEnlarged}
                className="mt-4 bg-white rounded-full px-10 py-4 text-2xl font-black shadow-lg border-4 relative z-10"
                style={{ color: items[enlargedItem].color, borderColor: items[enlargedItem].color }}
              >
                إغلاق ❌
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={`grid ${isLetter ? "grid-cols-4 md:grid-cols-7" : "grid-cols-3 md:grid-cols-4"} gap-4 md:gap-6 max-w-5xl w-full p-6 rounded-[2rem] shadow-xl border-4 border-white/50`}
        style={{ backgroundColor: bgColor }}
      >
        {items.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.05, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.15, rotate: [-3, 3, 0], y: -8 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(index, item.name, item.hasSound)}
            className={`relative rounded-[1.5rem] ${isLetter ? "p-4 md:p-5" : "p-5 md:p-6"} shadow-lg flex flex-col items-center gap-2 transition-all border-4 border-white overflow-hidden`}
            style={{
              backgroundColor: item.color,
              boxShadow: selectedItem === index 
                ? `0 0 0 6px white, 0 0 40px ${item.color}` 
                : `0 8px 20px ${item.color}40`,
            }}
          >
            <motion.span
              className={`${isLetter ? "text-5xl md:text-6xl" : "text-5xl md:text-7xl"}`}
              animate={selectedItem === index 
                ? { scale: [1, 1.4, 1], rotate: [0, 360] } 
                : { y: [0, -3, 0] }}
              transition={selectedItem === index 
                ? { duration: 0.6 } 
                : { duration: 2, repeat: Infinity, delay: index * 0.1 }}
            >
              {item.display}
            </motion.span>
            <span className={`${isLetter ? "text-sm md:text-lg" : "text-base md:text-xl"} font-black text-white drop-shadow-md`}>
              {item.name}
            </span>
            
            {showSoundIcon && item.hasSound && (
              <div className="absolute top-1 left-1 text-lg bg-white/50 rounded-full p-1">
                🔊
              </div>
            )}
            
            {selectedItem === index && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-2 -right-2 text-3xl bg-white rounded-full p-1 shadow-lg"
              >
                ✅
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ColorsGrid({
  selectedItem,
  onItemClick,
}: {
  selectedItem: number | null;
  onItemClick: (index: number, name: string) => void;
}) {
  const [enlargedItem, setEnlargedItem] = useState<number | null>(null);

  const handleClick = (index: number, name: string) => {
    setEnlargedItem(index);
    onItemClick(index, name);
  };

  const closeEnlarged = () => {
    setEnlargedItem(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="flex flex-col items-center"
    >
      <motion.h2
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-4xl md:text-6xl font-black text-purple-700 text-center mb-8 drop-shadow-lg"
      >
        🎨 الألوان 🎨
      </motion.h2>

      <AnimatePresence>
        {enlargedItem !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 flex items-center justify-center p-4"
            onClick={closeEnlarged}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180, y: 100 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0, rotate: 180, y: 100 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="rounded-[3rem] p-10 md:p-16 shadow-2xl flex flex-col items-center gap-6 border-8 border-white relative overflow-hidden"
              style={{
                backgroundColor: colorsData[enlargedItem].bgColor,
                minWidth: "320px",
                minHeight: "380px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="w-40 h-40 md:w-60 md:h-60 rounded-full border-8 border-white shadow-2xl relative z-10"
                style={{ backgroundColor: colorsData[enlargedItem].color }}
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <motion.span 
                className="text-4xl md:text-6xl font-black drop-shadow-lg relative z-10"
                style={{ color: colorsData[enlargedItem].color === "#FAFAFA" ? "#333" : colorsData[enlargedItem].color }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {colorsData[enlargedItem].name}
              </motion.span>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeEnlarged}
                className="mt-4 bg-white rounded-full px-10 py-4 text-2xl font-black shadow-lg border-4 relative z-10"
                style={{ 
                  color: colorsData[enlargedItem].color === "#FAFAFA" ? "#333" : colorsData[enlargedItem].color, 
                  borderColor: colorsData[enlargedItem].color 
                }}
              >
                إغلاق ❌
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl w-full p-6 rounded-[2rem] shadow-xl border-4 border-white/50"
        style={{ backgroundColor: "#FFF5F5" }}
      >
        {colorsData.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.05, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.15, rotate: [-3, 3, 0], y: -8 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(index, item.name)}
            className="relative rounded-[1.5rem] p-5 md:p-6 shadow-lg flex flex-col items-center gap-3 transition-all border-4 border-white overflow-hidden"
            style={{
              backgroundColor: item.bgColor,
              boxShadow: selectedItem === index 
                ? `0 0 0 6px white, 0 0 40px ${item.color}` 
                : `0 8px 20px ${item.color}40`,
            }}
          >
            <motion.div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-lg"
              style={{ backgroundColor: item.color }}
              animate={selectedItem === index 
                ? { scale: [1, 1.4, 1] } 
                : { scale: [1, 1.05, 1] }}
              transition={selectedItem === index 
                ? { duration: 0.6 } 
                : { duration: 2, repeat: Infinity, delay: index * 0.1 }}
            />
            <span 
              className="text-base md:text-xl font-black drop-shadow-md"
              style={{ color: item.color === "#FAFAFA" ? "#333" : item.color }}
            >
              {item.name}
            </span>
            
            {selectedItem === index && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-2 -right-2 text-3xl bg-white rounded-full p-1 shadow-lg"
              >
                ✅
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ShapesGrid({
  selectedItem,
  onItemClick,
}: {
  selectedItem: number | null;
  onItemClick: (index: number, name: string) => void;
}) {
  const [enlargedItem, setEnlargedItem] = useState<number | null>(null);

  const handleClick = (index: number, name: string) => {
    setEnlargedItem(index);
    onItemClick(index, name);
  };

  const closeEnlarged = () => {
    setEnlargedItem(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="flex flex-col items-center"
    >
      <motion.h2
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-4xl md:text-6xl font-black text-purple-700 text-center mb-8 drop-shadow-lg"
      >
        ⬛ الأشكال ⬛
      </motion.h2>

      <AnimatePresence>
        {enlargedItem !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 flex items-center justify-center p-4"
            onClick={closeEnlarged}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180, y: 100 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0, rotate: 180, y: 100 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="rounded-[3rem] p-10 md:p-16 shadow-2xl flex flex-col items-center gap-6 border-8 border-white relative overflow-hidden bg-white"
              style={{
                minWidth: "320px",
                minHeight: "380px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="relative z-10 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ShapeDisplay 
                  shape={shapesData[enlargedItem].shape} 
                  color={shapesData[enlargedItem].color} 
                  size={150} 
                />
              </motion.div>
              
              <motion.span 
                className="text-4xl md:text-6xl font-black drop-shadow-lg relative z-10"
                style={{ color: shapesData[enlargedItem].color }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {shapesData[enlargedItem].name}
              </motion.span>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeEnlarged}
                className="mt-4 bg-gray-100 rounded-full px-10 py-4 text-2xl font-black shadow-lg border-4 relative z-10"
                style={{ color: shapesData[enlargedItem].color, borderColor: shapesData[enlargedItem].color }}
              >
                إغلاق ❌
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl w-full p-6 rounded-[2rem] shadow-xl border-4 border-white/50"
        style={{ backgroundColor: "#F5F5F5" }}
      >
        {shapesData.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.05, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.15, rotate: [-3, 3, 0], y: -8 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(index, item.name)}
            className="relative rounded-[1.5rem] p-6 md:p-8 shadow-lg flex flex-col items-center gap-4 transition-all border-4 border-white overflow-hidden bg-white"
            style={{
              boxShadow: selectedItem === index 
                ? `0 0 0 6px white, 0 0 40px ${item.color}` 
                : `0 8px 20px ${item.color}40`,
            }}
          >
            <motion.div
              className="flex items-center justify-center"
              animate={selectedItem === index 
                ? { scale: [1, 1.4, 1], rotate: [0, 360] } 
                : { scale: [1, 1.05, 1] }}
              transition={selectedItem === index 
                ? { duration: 0.6 } 
                : { duration: 2, repeat: Infinity, delay: index * 0.1 }}
            >
              <ShapeDisplay shape={item.shape} color={item.color} size={60} />
            </motion.div>
            <span 
              className="text-lg md:text-xl font-black"
              style={{ color: item.color }}
            >
              {item.name}
            </span>
            
            {selectedItem === index && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-2 -right-2 text-3xl bg-white rounded-full p-1 shadow-lg"
              >
                ✅
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

type QuizCategory = "fruits" | "vegetables" | "animals" | "birds" | "colors" | "shapes";

function QuizGame({ onCorrect }: { onCorrect: () => void }) {
  const [quizCategory, setQuizCategory] = useState<QuizCategory | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [options, setOptions] = useState<{ display: string; name: string; color: string; isCorrect: boolean }[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<{ display: string; name: string; color: string } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalQuestions] = useState(5);

  const quizCategories = [
    { id: "fruits" as QuizCategory, name: "الفواكه", emoji: "🍎", color: "#FF6B6B" },
    { id: "vegetables" as QuizCategory, name: "الخضروات", emoji: "🥕", color: "#4CAF50" },
    { id: "animals" as QuizCategory, name: "الحيوانات", emoji: "🦁", color: "#FF9800" },
    { id: "birds" as QuizCategory, name: "الطيور", emoji: "🐦", color: "#03A9F4" },
    { id: "colors" as QuizCategory, name: "الألوان", emoji: "🎨", color: "#FF5722" },
    { id: "shapes" as QuizCategory, name: "الأشكال", emoji: "⬛", color: "#607D8B" },
  ];

  const getDataForCategory = (category: QuizCategory) => {
    switch (category) {
      case "fruits":
        return fruitsData.map(f => ({ display: f.emoji, name: f.name, color: f.color }));
      case "vegetables":
        return vegetablesData.map(v => ({ display: v.emoji, name: v.name, color: v.color }));
      case "animals":
        return animalsData.map(a => ({ display: a.emoji, name: a.name, color: a.color }));
      case "birds":
        return birdsData.map(b => ({ display: b.emoji, name: b.name, color: b.color }));
      case "colors":
        return colorsData.map(c => ({ display: "🔵", name: c.name, color: c.color }));
      case "shapes":
        return shapesData.map(s => ({ display: s.shape, name: s.name, color: s.color }));
    }
  };

  const generateQuestion = useCallback((category: QuizCategory) => {
    const data = getDataForCategory(category);
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const correct = shuffled[0];
    const wrongOptions = shuffled.slice(1, 4);
    
    const allOptions = [
      { ...correct, isCorrect: true },
      ...wrongOptions.map(o => ({ ...o, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);

    setCorrectAnswer(correct);
    setOptions(allOptions);
    setAnswered(false);
    setIsCorrect(false);
  }, []);

  useEffect(() => {
    if (quizCategory) {
      generateQuestion(quizCategory);
    }
  }, [quizCategory, currentQuestion, generateQuestion]);

  const handleAnswer = (option: { isCorrect: boolean; name: string }) => {
    if (answered) return;
    setAnswered(true);
    setIsCorrect(option.isCorrect);
    
    if (option.isCorrect) {
      setQuizScore(prev => prev + 1);
      onCorrect();
      speakArabic("أحسنت! إجابة صحيحة!");
    } else {
      speakArabic("حاول مرة أخرى!");
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setQuizCategory(null);
      setCurrentQuestion(0);
      setQuizScore(0);
    }
  };

  if (!quizCategory) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        className="flex flex-col items-center"
      >
        <motion.h2
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-4xl md:text-6xl font-black text-purple-700 text-center mb-8 drop-shadow-lg"
        >
          ❓ اختر نوع الاختبار ❓
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl w-full">
          {quizCategories.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", bounce: 0.4 }}
              whileHover={{ scale: 1.08, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setQuizCategory(cat.id)}
              className="rounded-[2rem] p-6 md:p-8 shadow-xl flex flex-col items-center gap-3 border-4 border-white"
              style={{ backgroundColor: cat.color + "30" }}
            >
              <span className="text-6xl md:text-8xl">{cat.emoji}</span>
              <span className="text-xl md:text-2xl font-black" style={{ color: cat.color }}>
                {cat.name}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="flex flex-col items-center"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-white/80 rounded-full px-6 py-3 shadow-lg">
          <span className="text-2xl font-black text-purple-700">
            السؤال {currentQuestion + 1} / {totalQuestions}
          </span>
        </div>
        <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-full px-6 py-3 shadow-lg">
          <span className="text-2xl font-black text-white">
            النتيجة: {quizScore}
          </span>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-white/90 rounded-[2rem] p-8 md:p-12 shadow-2xl mb-8 text-center border-4 border-purple-200"
      >
        <motion.h3
          className="text-3xl md:text-4xl font-black text-purple-700 mb-6"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          أين {correctAnswer?.name}؟ 🤔
        </motion.h3>

        {quizCategory === "colors" && correctAnswer && (
          <motion.div
            className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto border-4 border-white shadow-xl"
            style={{ backgroundColor: correctAnswer.color }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {quizCategory === "shapes" && correctAnswer && (
          <motion.div
            className="flex justify-center"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ShapeDisplay shape={correctAnswer.display} color={correctAnswer.color} size={100} />
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-2xl w-full">
        {options.map((option, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring", bounce: 0.4 }}
            whileHover={!answered ? { scale: 1.08, y: -5 } : {}}
            whileTap={!answered ? { scale: 0.95 } : {}}
            onClick={() => handleAnswer(option)}
            disabled={answered}
            className={`rounded-[1.5rem] p-6 md:p-8 shadow-xl flex flex-col items-center gap-3 border-4 transition-all ${
              answered
                ? option.isCorrect
                  ? "border-green-500 bg-green-100"
                  : "border-red-300 bg-red-50 opacity-60"
                : "border-white bg-white hover:border-purple-300"
            }`}
          >
            {quizCategory === "colors" ? (
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: option.color }}
              />
            ) : quizCategory === "shapes" ? (
              <ShapeDisplay shape={option.display} color={option.color} size={60} />
            ) : (
              <span className="text-5xl md:text-6xl">{option.display}</span>
            )}
            <span className="text-xl md:text-2xl font-black" style={{ color: option.color }}>
              {option.name}
            </span>

            {answered && option.isCorrect && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl"
              >
                ✅
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <motion.div
            className={`text-4xl md:text-5xl font-black ${isCorrect ? "text-green-500" : "text-red-500"}`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            {isCorrect ? "🎉 أحسنت! 🎉" : "😢 حاول مرة أخرى!"}
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextQuestion}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-10 py-4 text-2xl font-black text-white shadow-xl border-4 border-white"
          >
            {currentQuestion < totalQuestions - 1 ? "السؤال التالي ➡️" : "إنهاء الاختبار 🏁"}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
