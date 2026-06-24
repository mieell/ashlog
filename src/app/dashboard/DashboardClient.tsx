"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay } from "date-fns";
import {
  Moon,
  Heart,
  Brain,
  Sparkles,
  Calendar,
  Plus,
  Droplets,
  Activity,
  BookOpen,
  ChevronRight,
  MessageCircle,
  X,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

// ── Log Form Components ──
import PeriodLogForm from "@/components/logging/PeriodLogForm";
import SymptomLogForm from "@/components/logging/SymptomLogForm";
import SleepLogForm from "@/components/logging/SleepLogForm";
import MoodLogForm from "@/components/logging/MoodLogForm";
import JournalForm from "@/components/logging/JournalForm";
import AshChat from "@/components/ash/AshChat";
import { ThemeToggle } from "@/components/ThemeToggle";
import CalendarWidget from "@/components/dashboard/CalendarWidget";

type LogType = "period" | "symptoms" | "sleep" | "mood" | "journal" | null;

// Empty states fallback for UI
const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  calm: "😌",
  anxious: "😰",
  irritable: "😤",
  sad: "😢",
  energized: "⚡",
  tired: "😴",
  overwhelmed: "😵",
};

interface DashboardProps {
  user: any;
  lastPeriod: any;
  lastSleep: any;
  lastMood: any;
  insights: any[];
  periodLogs: any[];
  daysSincePeriod: number | null;
}

export default function DashboardClient({
  user,
  lastPeriod,
  lastSleep,
  lastMood,
  insights,
  periodLogs = [],
  daysSincePeriod,
}: DashboardProps) {
  const [activeLog, setActiveLog] = useState<LogType>(null);
  const [showAsh, setShowAsh] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [localPeriodLogs, setLocalPeriodLogs] = useState<any[]>(periodLogs);
  const router = useRouter();

  useEffect(() => {
    setLocalPeriodLogs(periodLogs);
  }, [periodLogs]);

  // Find the most recent period log that occurred ON OR BEFORE the selected date
  const relevantPeriodLog = localPeriodLogs?.find(
    (log) => new Date(log.date).getTime() <= selectedDate.getTime()
  );

  const existingPeriodLogForDate = localPeriodLogs?.find(
    (log) => isSameDay(new Date(log.date), selectedDate)
  );

  const activeDaysSincePeriod = relevantPeriodLog
    ? Math.floor((selectedDate.getTime() - new Date(relevantPeriodLog.date).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : null;

  function handleLogSave(type: string, data?: any) {
    if (type === "Period" && data) {
      setLocalPeriodLogs((prev) => [data, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    setActiveLog(null);
    setToastMessage(`${type} logged successfully ✓`);
    setTimeout(() => setToastMessage(null), 3000);
    router.refresh();
  }

  // Flo-style: toggle a period day on/off directly from the calendar
  const handleTogglePeriodDay = useCallback(async (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const existing = localPeriodLogs.find((log) => {
      const logDate = new Date(log.date);
      return isSameDay(logDate, date);
    });

    if (existing) {
      // Remove the period day (optimistic)
      setLocalPeriodLogs((prev) => prev.filter((l) => l.id !== existing.id));
      setToastMessage(`Period removed for ${format(date, "MMM d")}`);
      setTimeout(() => setToastMessage(null), 2500);
      try {
        await fetch(`/api/period?id=${existing.id}`, { method: "DELETE" });
        router.refresh();
      } catch {
        // Rollback on failure
        setLocalPeriodLogs((prev) => [...prev, existing].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setToastMessage("Failed to remove — try again");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } else {
      // Add the period day (optimistic)
      const tempLog = { id: `temp-${dateKey}`, date: date.toISOString(), flow: "medium", clotting: false };
      setLocalPeriodLogs((prev) => [...prev, tempLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setToastMessage(`Period marked for ${format(date, "MMM d")} 🩸`);
      setTimeout(() => setToastMessage(null), 2500);
      try {
        const res = await fetch("/api/period", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: date.toISOString(), flow: "medium" }),
        });
        if (res.ok) {
          const saved = await res.json();
          // Replace temp with real
          setLocalPeriodLogs((prev) =>
            prev.map((l) => (l.id === tempLog.id ? saved : l))
          );
        }
        router.refresh();
      } catch {
        setLocalPeriodLogs((prev) => prev.filter((l) => l.id !== tempLog.id));
        setToastMessage("Failed to log — try again");
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  }, [localPeriodLogs, router]);

  return (
    <div className={styles.dashboard}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <div style={{ width: 240, height: 65, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Image src="/ashlog.png" alt="AshLog Logo" width={400} height={400} style={{ objectFit: "contain", maxWidth: "none" }} priority />
            </div>
          </Link>
          <div className={styles.headerRight}>
            <div style={{ marginRight: "0.5rem" }}>
              <ThemeToggle />
            </div>
            <Link href="/settings" className={styles.ashButton} style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", marginRight: "0.5rem" }} title="Settings">
              <span className={styles.srOnly} style={{ display: "none" }}>Settings</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </Link>
            <button
              className={styles.ashButton}
              onClick={() => setShowAsh(!showAsh)}
              title="Chat with Ash"
            >
              <MessageCircle size={18} />
              <span>Ash</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className={styles.main}>
        {/* ── Greeting ── */}
        <motion.div
          className={styles.greeting}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Good morning ☀️</h1>
          <p className={styles.greetingDate}>
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <CalendarWidget 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
            periodLogs={localPeriodLogs}
            onTogglePeriodDay={handleTogglePeriodDay}
          />
        </motion.section>

        {/* ── Cycle Hero (Flo-style) ── */}
        <motion.section
          className={styles.cycleHeroSection}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className={styles.cycleHeroRingContainer}>
            {activeDaysSincePeriod !== null ? (
              <>
                <svg viewBox="0 0 200 200" className={styles.cycleHeroSvg}>
                  <circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-border-light)" strokeWidth="12" />
                  <circle
                    cx="100" cy="100" r="90"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="12"
                    strokeDasharray="565.48"
                    strokeDashoffset={565.48 * (1 - Math.min(activeDaysSincePeriod / 28, 1))}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    className={styles.cycleHeroProgress}
                  />
                </svg>
                <div className={styles.cycleHeroCenter}>
                  <span className={styles.cycleHeroDayLabel}>Day</span>
                  <span className={styles.cycleHeroDayNum}>{activeDaysSincePeriod}</span>
                  <div className={styles.cycleHeroPhaseBadge}>
                    {activeDaysSincePeriod > 14 ? "Luteal Phase" : "Follicular Phase"}
                  </div>
                </div>
              </>
            ) : (
              <>
                <svg viewBox="0 0 200 200" className={styles.cycleHeroSvg}>
                  <circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-border-light)" strokeWidth="12" strokeDasharray="10 10" />
                </svg>
                <div className={styles.cycleHeroCenter}>
                  <button 
                    className={styles.logPeriodBtn}
                    onClick={() => setActiveLog("period")}
                  >
                    <Droplets size={24} />
                    <span>{existingPeriodLogForDate ? "Edit Period" : "Log Period"}</span>
                  </button>
                  <span className={styles.emptyCycleLabel}>To get predictions</span>
                </div>
              </>
            )}
          </div>
        </motion.section>

        {/* ── Today's Summary ── */}
        <motion.section
          className={styles.summaryGrid}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Sleep Card */}
          <div className={`${styles.summaryCard} ${styles.sleepCard}`}>
            <div className={styles.cardHeader}>
              <Moon size={16} />
              <span>Sleep</span>
            </div>
            {lastSleep ? (
              <>
                <div className={styles.sleepScoreContainer}>
                  <svg viewBox="0 0 100 100" className={styles.sleepScoreSvg}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border-light)" strokeWidth="6" />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="6"
                      strokeDasharray="263.9"
                      strokeDashoffset={263.9 * (1 - (lastSleep.quality * 20) / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      className={styles.sleepProgress}
                    />
                  </svg>
                  <div className={styles.sleepCenter}>
                    <span className={styles.sleepScoreNum}>{lastSleep.quality * 20}</span>
                    <span className={styles.sleepScoreLabel}>Score</span>
                  </div>
                </div>
                <p className={styles.sleepDuration}>Logged today</p>
              </>
            ) : (
              <div className={styles.emptyCardContent}>
                <Moon size={24} color="var(--color-text-muted)" />
                <p>No sleep data</p>
              </div>
            )}
          </div>

          {/* Mood Card */}
          <div className={`${styles.summaryCard} ${styles.moodCard}`}>
            <div className={styles.cardHeader}>
              <Heart size={16} />
              <span>Mood</span>
            </div>
            {lastMood ? (
              <>
                <div className={styles.moodEmoji}>{MOOD_EMOJIS[lastMood.mood] || "😊"}</div>
                <p className={styles.moodLabel}>{lastMood.mood.charAt(0).toUpperCase() + lastMood.mood.slice(1)}</p>
                <div className={styles.energyBar}>
                  <span className={styles.energyLabel}>Energy</span>
                  <div className={styles.energyTrack}>
                    <div className={styles.energyFill} style={{ width: `${(lastMood.energy || 4) * 20}%` }} />
                  </div>
                  <span className={styles.energyValue}>{lastMood.energy || 4}/5</span>
                </div>
              </>
            ) : (
              <div className={styles.emptyCardContent}>
                <Heart size={24} color="var(--color-text-muted)" />
                <p>How are you feeling?</p>
              </div>
            )}
          </div>

          {/* Quick Insight Card */}
          <div className={`${styles.summaryCard} ${styles.insightCard}`}>
            <div className={styles.cardHeader}>
              <Sparkles size={16} />
              <span>Insight</span>
            </div>
            {insights && insights.length > 0 ? (
              <>
                <p className={styles.insightText}>
                  {insights[0].description}
                </p>
                <div className={styles.insightMeta}>
                  <TrendingUp size={12} />
                  {insights[0].title}
                </div>
              </>
            ) : (
              <div className={styles.emptyCardContent}>
                <p className={styles.insightText} style={{ color: "var(--color-text-muted)" }}>
                  Log more data to receive personalized insights.
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* ── Upcoming Section ── */}
        <motion.section
          className={styles.upcoming}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className={styles.sectionTitle}>Upcoming</h2>
          <div className={styles.upcomingCards}>
            <div className={styles.upcomingItem}>
              <div className={styles.upcomingIcon} style={{ background: "var(--color-danger-light)", color: "var(--color-danger-dark)" }}>
                <Droplets size={18} />
              </div>
              {activeDaysSincePeriod !== null ? (
                <>
                  <div className={styles.upcomingInfo}>
                    <span className={styles.upcomingLabel}>Next Period</span>
                    <span className={styles.upcomingValue}>{Math.max(28 - activeDaysSincePeriod, 0)} days away</span>
                  </div>
                  <ChevronRight size={16} className={styles.upcomingChevron} />
                </>
              ) : (
                <div className={styles.upcomingInfo}>
                  <span className={styles.upcomingLabel}>Next Period</span>
                  <span className={styles.upcomingValue} style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>Requires data</span>
                </div>
              )}
            </div>
            <div className={styles.upcomingItem}>
              <div className={styles.upcomingIcon} style={{ background: "var(--color-accent-light)", color: "var(--color-accent-deep)" }}>
                <Heart size={18} />
              </div>
              {activeDaysSincePeriod !== null ? (
                <>
                  <div className={styles.upcomingInfo}>
                    <span className={styles.upcomingLabel}>Ovulation Window</span>
                    <span className={styles.upcomingValue}>In {Math.max(14 - activeDaysSincePeriod, 0)} days</span>
                  </div>
                  <ChevronRight size={16} className={styles.upcomingChevron} />
                </>
              ) : (
                <div className={styles.upcomingInfo}>
                  <span className={styles.upcomingLabel}>Ovulation Window</span>
                  <span className={styles.upcomingValue} style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>Requires data</span>
                </div>
              )}
            </div>
            <div className={styles.upcomingItem}>
              <div className={styles.upcomingIcon} style={{ background: "var(--color-primary-lighter)", color: "var(--color-primary-dark)" }}>
                <Moon size={18} />
              </div>
              <div className={styles.upcomingInfo}>
                <span className={styles.upcomingLabel}>Sleep Goal</span>
                <div className={styles.goalBar}>
                  <div className={styles.goalFill} style={{ width: "70%" }} />
                </div>
              </div>
              <span className={styles.goalText}>5/7 nights</span>
            </div>
          </div>
        </motion.section>

        {/* ── AI Insights ── */}
        <motion.section
          className={styles.insightsSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className={styles.sectionTitle}>
            <Sparkles size={18} />
            Wellness Insights
          </h2>
          <div className={styles.insightsList}>
            {insights && insights.length > 0 ? (
              insights.map((insight: any) => (
                <div key={insight.id} className={styles.insightRow}>
                  <span className={styles.insightRowEmoji}>
                    {insight.type === "cycle_sleep" ? "🌙" : "📊"}
                  </span>
                  <div>
                    <p className={styles.insightRowText}>{insight.description}</p>
                    <span className={styles.insightRowMeta}>
                      {insight.title} · {insight.confidence ? `${Math.round(insight.confidence * 100)}% confidence` : "Insight"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.insightRow}>
                <span className={styles.insightRowEmoji}>📊</span>
                <div>
                  <p className={styles.insightRowText} style={{ color: "var(--color-text-muted)" }}>
                    We don't have enough data to generate personalized wellness insights yet. 
                    Keep logging your daily symptoms and sleep to unlock intelligence!
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* ── Quick Actions ── */}
        <motion.section
          className={styles.quickActions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className={styles.sectionTitle}>Quick Log</h2>
          <div className={styles.actionGrid}>
            <button
              className={styles.actionButton}
              onClick={() => setActiveLog("period")}
            >
              <div className={styles.actionIcon} style={{ background: "var(--color-danger-light)", color: "var(--color-danger-dark)" }}>
                <Droplets size={20} />
              </div>
              <span>Period</span>
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setActiveLog("symptoms")}
            >
              <div className={styles.actionIcon} style={{ background: "var(--color-warning-light)", color: "var(--color-warning-dark)" }}>
                <Activity size={20} />
              </div>
              <span>Symptoms</span>
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setActiveLog("sleep")}
            >
              <div className={styles.actionIcon} style={{ background: "var(--color-primary-lighter)", color: "var(--color-primary-dark)" }}>
                <Moon size={20} />
              </div>
              <span>Sleep</span>
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setActiveLog("mood")}
            >
              <div className={styles.actionIcon} style={{ background: "var(--color-accent-light)", color: "var(--color-accent-deep)" }}>
                <Brain size={20} />
              </div>
              <span>Mood</span>
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setActiveLog("journal")}
            >
              <div className={styles.actionIcon} style={{ background: "var(--color-success-light)", color: "var(--color-success-dark)" }}>
                <BookOpen size={20} />
              </div>
              <span>Journal</span>
            </button>
          </div>
        </motion.section>

        {/* ── Safety Disclaimer ── */}
        <div className="disclaimer" style={{ maxWidth: 600, margin: "var(--space-8) auto 0" }}>
          AshLog provides wellness information for educational purposes only. It is
          not a substitute for professional medical advice, diagnosis, or treatment.
        </div>
      </main>

      {/* ── Log Modals ── */}
      <AnimatePresence>
        {activeLog && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveLog(null);
            }}
          >
            <motion.div
              className="modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="modal-handle" />
              <div className="modal-header">
                <h3 className="modal-title">
                  {activeLog === "period" && "Log Period"}
                  {activeLog === "symptoms" && "Log Symptoms"}
                  {activeLog === "sleep" && "Log Sleep"}
                  {activeLog === "mood" && "Log Mood"}
                  {activeLog === "journal" && "Journal Entry"}
                </h3>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => setActiveLog(null)}
                >
                  <X size={18} />
                </button>
              </div>

              {activeLog === "period" && (
                <PeriodLogForm 
                  selectedDate={selectedDate} 
                  existingLog={existingPeriodLogForDate}
                  onDelete={() => handleTogglePeriodDay(selectedDate)}
                  onSave={(data) => handleLogSave(existingPeriodLogForDate ? "Period updated" : "Period", data)} 
                  onSkip={() => setActiveLog(null)} 
                />
              )}
              {activeLog === "symptoms" && (
                <SymptomLogForm selectedDate={selectedDate} onSave={() => handleLogSave("Symptoms")} onSkip={() => setActiveLog(null)} />
              )}
              {activeLog === "sleep" && (
                <SleepLogForm selectedDate={selectedDate} onSave={() => handleLogSave("Sleep")} onSkip={() => setActiveLog(null)} />
              )}
              {activeLog === "mood" && (
                <MoodLogForm selectedDate={selectedDate} onSave={() => handleLogSave("Mood")} onSkip={() => setActiveLog(null)} />
              )}
              {activeLog === "journal" && (
                <JournalForm selectedDate={selectedDate} onSave={() => handleLogSave("Journal entry")} onSkip={() => setActiveLog(null)} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ash Chat ── */}
      <AnimatePresence>
        {showAsh && <AshChat onClose={() => setShowAsh(false)} />}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
