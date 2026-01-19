"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

interface Sound {
  id: string;
  name: string;
  category: string;
  soundUrl: string;
}

const animalsData = [
  { name: "أسد", emoji: "🦁" },
  { name: "فيل", emoji: "🐘" },
  { name: "زرافة", emoji: "🦒" },
  { name: "قرد", emoji: "🐵" },
  { name: "أرنب", emoji: "🐰" },
  { name: "قط", emoji: "🐱" },
  { name: "كلب", emoji: "🐶" },
  { name: "بقرة", emoji: "🐄" },
  { name: "خروف", emoji: "🐑" },
  { name: "دب", emoji: "🐻" },
  { name: "باندا", emoji: "🐼" },
  { name: "ثعلب", emoji: "🦊" },
];

const birdsData = [
  { name: "عصفور", emoji: "🐦" },
  { name: "بطة", emoji: "🦆" },
  { name: "ديك", emoji: "🐓" },
  { name: "دجاجة", emoji: "🐔" },
  { name: "بومة", emoji: "🦉" },
  { name: "ببغاء", emoji: "🦜" },
  { name: "بطريق", emoji: "🐧" },
  { name: "حمامة", emoji: "🕊️" },
  { name: "نسر", emoji: "🦅" },
  { name: "طاووس", emoji: "🦚" },
  { name: "فلامنجو", emoji: "🦩" },
  { name: "كناري", emoji: "🐤" },
];

export default function SettingsPage() {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"animals" | "birds">("animals");
  const [inputUrls, setInputUrls] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSounds();
  }, []);

  const fetchSounds = async () => {
    try {
      const response = await fetch("/api/sounds");
      const data = await response.json();
      setSounds(data);
      
      const urls: Record<string, string> = {};
      data.forEach((sound: Sound) => {
        urls[sound.name] = sound.soundUrl;
      });
      setInputUrls(urls);
    } catch (error) {
      console.error("Error fetching sounds:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (name: string, category: string) => {
    const soundUrl = inputUrls[name];
    if (!soundUrl) {
      setMessage({ type: "error", text: "الرجاء إدخال رابط الصوت" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSaving(name);
    try {
      const response = await fetch("/api/sounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, soundUrl }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: `تم حفظ صوت ${name} بنجاح!` });
        fetchSounds();
      } else {
        setMessage({ type: "error", text: "حدث خطأ أثناء الحفظ" });
      }
    } catch (error) {
      console.error("Error saving sound:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء الحفظ" });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (name: string) => {
    const sound = sounds.find(s => s.name === name);
    if (!sound) return;

    try {
      const response = await fetch(`/api/sounds?id=${sound.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: `تم حذف صوت ${name}` });
        setInputUrls(prev => {
          const updated = { ...prev };
          delete updated[name];
          return updated;
        });
        fetchSounds();
      }
    } catch (error) {
      console.error("Error deleting sound:", error);
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const testSound = (url: string, name: string) => {
    if (!url) return;
    
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    
    const audio = new Audio(url);
    audio.volume = 0.5;
    setCurrentAudio(audio);
    setPlayingSound(name);
    
    audio.onended = () => {
      setPlayingSound(null);
      setCurrentAudio(null);
    };
    
    audio.onerror = () => {
      setPlayingSound(null);
      setCurrentAudio(null);
    };
    
    audio.play().catch(() => {
      setPlayingSound(null);
      setCurrentAudio(null);
    });
  };

  const stopSound = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setPlayingSound(null);
    }
  };

  const currentData = activeTab === "animals" ? animalsData : birdsData;

  return (
    <div
      className="min-h-screen font-sans overflow-hidden relative"
      dir="rtl"
      style={{
        background: "linear-gradient(180deg, #87CEEB 0%, #98FB98 50%, #FFE4B5 100%)",
      }}
    >
      <header className="relative z-10 p-4 md:p-6 flex justify-between items-center">
        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400"
        >
          ⚙️ إعدادات الأصوات
        </motion.h1>

        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-gradient-to-r from-pink-400 to-rose-400 rounded-full px-6 py-3 text-white text-xl font-bold shadow-lg border-4 border-white flex items-center gap-3"
          >
            <span className="text-2xl">🏠</span>
            <span>الرئيسية</span>
          </motion.button>
        </Link>
      </header>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-xl border-4 border-white font-bold text-xl ${
              message.type === "success" ? "bg-green-400 text-white" : "bg-red-400 text-white"
            }`}
          >
            {message.type === "success" ? "✅" : "❌"} {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 container mx-auto px-4 pb-20">
        <div className="flex justify-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("animals")}
            className={`rounded-full px-8 py-4 text-xl font-bold shadow-lg border-4 transition-all ${
              activeTab === "animals"
                ? "bg-orange-400 text-white border-white"
                : "bg-white text-orange-400 border-orange-200"
            }`}
          >
            🦁 الحيوانات
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("birds")}
            className={`rounded-full px-8 py-4 text-xl font-bold shadow-lg border-4 transition-all ${
              activeTab === "birds"
                ? "bg-blue-400 text-white border-white"
                : "bg-white text-blue-400 border-blue-200"
            }`}
          >
            🐦 الطيور
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-6xl"
            >
              ⏳
            </motion.div>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {currentData.map((item, index) => {
              const hasSound = sounds.some(s => s.name === item.name);
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/90 rounded-2xl p-6 shadow-xl border-4 border-white"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl">{item.emoji}</span>
                    <div>
                      <h3 className="text-2xl font-black text-gray-800">{item.name}</h3>
                      {hasSound && (
                        <span className="text-sm text-green-500 font-bold">✅ تم الحفظ</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="url"
                      placeholder="أدخل رابط الصوت (URL)"
                      value={inputUrls[item.name] || ""}
                      onChange={(e) =>
                        setInputUrls((prev) => ({ ...prev, [item.name]: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-lg focus:border-purple-400 focus:outline-none"
                      dir="ltr"
                    />

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSave(item.name, activeTab === "animals" ? "animal" : "bird")}
                        disabled={saving === item.name}
                        className="flex-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl py-3 font-bold shadow-lg disabled:opacity-50"
                      >
                        {saving === item.name ? "⏳ جاري الحفظ..." : "💾 حفظ"}
                      </motion.button>

                      {inputUrls[item.name] && (
                        playingSound === item.name ? (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={stopSound}
                            className="bg-red-500 text-white rounded-xl px-4 py-3 font-bold shadow-lg"
                          >
                            ⏹️
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => testSound(inputUrls[item.name], item.name)}
                            className="bg-blue-400 text-white rounded-xl px-4 py-3 font-bold shadow-lg"
                          >
                            🔊
                          </motion.button>
                        )
                      )}

                      {hasSound && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(item.name)}
                          className="bg-red-400 text-white rounded-xl px-4 py-3 font-bold shadow-lg"
                        >
                          🗑️
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
