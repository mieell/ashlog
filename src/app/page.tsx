"use client";

import { motion } from "framer-motion";
import {
  Moon,
  Heart,
  Brain,
  Sparkles,
  Shield,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { ThemeToggle } from "@/components/ThemeToggle";

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: any = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn: any = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      {/* ── Navigation ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <Image src="/ashlog.png" alt="AshLog Logo" width={220} height={60} style={{ objectFit: "contain" }} />
          </Link>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#intelligence">Intelligence</a>
            <a href="#privacy">Privacy</a>
            <div style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>
              <ThemeToggle />
            </div>
            <Link href="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div className={styles.heroBadge} variants={fadeInUp}>
            <Sparkles size={14} />
            Women&apos;s Wellness Platform
          </motion.div>

          <motion.h1 className={styles.heroTitle} variants={fadeInUp}>
            Understand Your Cycle.
            <br />
            <span className={styles.heroGradient}>Improve Your Sleep.</span>
            <br />
            Care for Yourself.
          </motion.h1>

          <motion.p className={styles.heroSubtitle} variants={fadeInUp}>
            AshLog combines period tracking, sleep analysis, mood monitoring,
            and wellness insights into one private, beautifully designed
            experience.
          </motion.p>

          <motion.div className={styles.heroCtas} variants={fadeInUp}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              See How It Works
              <ArrowRight size={16} />
            </a>
          </motion.div>
        </motion.div>

        {/* ── Hero Dashboard Preview ── */}
        <motion.div
          className={styles.heroPreview}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <span className={styles.previewDot} />
              <span className={styles.previewDot} />
              <span className={styles.previewDot} />
            </div>
            <div className={styles.previewBody}>
              {/* Cycle Ring */}
              <div className={styles.previewCycleRing}>
                <svg viewBox="0 0 120 120" className={styles.ringsSvg}>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#EDE6FF" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke="#8B7CF6" strokeWidth="8"
                    strokeDasharray="326.7" strokeDashoffset="98"
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className={styles.ringCenter}>
                  <span className={styles.ringDay}>Day 14</span>
                  <span className={styles.ringPhase}>Ovulation</span>
                </div>
              </div>

              {/* Mini Stats */}
              <div className={styles.previewStats}>
                <div className={styles.previewStat}>
                  <Moon size={16} className={styles.statIconPurple} />
                  <div>
                    <span className={styles.miniStatValue}>82</span>
                    <span className={styles.miniStatLabel}>Sleep Score</span>
                  </div>
                </div>
                <div className={styles.previewStat}>
                  <Heart size={16} className={styles.statIconPink} />
                  <div>
                    <span className={styles.miniStatValue}>😊</span>
                    <span className={styles.miniStatLabel}>Mood</span>
                  </div>
                </div>
                <div className={styles.previewStat}>
                  <TrendingUp size={16} className={styles.statIconGreen} />
                  <div>
                    <span className={styles.miniStatValue}>4/5</span>
                    <span className={styles.miniStatLabel}>Energy</span>
                  </div>
                </div>
              </div>

              {/* AI Insight Card */}
              <div className={styles.previewInsight}>
                <Sparkles size={14} className={styles.insightIcon} />
                <p>Your sleep quality improves when bedtime is before 10:30 PM</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Social Proof Bar ── */}
      <section className={styles.socialProof}>
        <div className={styles.proofInner}>
          <div className={styles.proofItem}>
            <Heart size={18} className={styles.proofShield} />
            <span className={styles.proofLabel}>Built with Care</span>
          </div>
          <div className={styles.proofDivider} />
          <div className={styles.proofItem}>
            <Sparkles size={18} className={styles.proofShield} />
            <span className={styles.proofLabel}>Personalized AI Insights</span>
          </div>
          <div className={styles.proofDivider} />
          <div className={styles.proofItem}>
            <Shield size={18} className={styles.proofShield} />
            <span className={styles.proofLabel}>No ads. No data selling. Ever.</span>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section id="features" className={styles.features}>
        <motion.div
          className="container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.div className={styles.sectionHeader} variants={fadeInUp}>
            <h2>Everything You Need, Nothing You Don&apos;t</h2>
            <p>
              Four powerful modules working together to help you understand the
              relationship between your cycle, sleep, mood, and daily habits.
            </p>
          </motion.div>

          <div className={styles.featureGrid}>
            {[
              {
                icon: <Heart size={24} />,
                title: "Cycle Tracking",
                description:
                  "Track cycle length, phase, flow, and symptoms. AshLog learns your patterns over time and predicts your next period.",
                color: "var(--color-accent)",
                bgColor: "var(--color-accent-light)",
              },
              {
                icon: <Moon size={24} />,
                title: "Sleep Analysis",
                description:
                  "Log sleep quality, wake events, and energy levels. See how your hormonal cycle impacts your rest.",
                color: "var(--color-primary)",
                bgColor: "var(--color-primary-lighter)",
              },
              {
                icon: <Brain size={24} />,
                title: "Mood & Wellbeing",
                description:
                  "Track daily mood, stress, and energy. Discover patterns across your cycle phases.",
                color: "var(--color-warning)",
                bgColor: "var(--color-warning-light)",
              },
              {
                icon: <Sparkles size={24} />,
                title: "Cycle + Sleep Intelligence™",
                description:
                  "Our proprietary engine discovers correlations between your hormonal phases and sleep quality.",
                color: "var(--color-success)",
                bgColor: "var(--color-success-light)",
              },
            ].map((feature, i) => (
              <motion.div key={i} className={styles.featureCard} variants={scaleIn}>
                <div
                  className={styles.featureIcon}
                  style={{ backgroundColor: feature.bgColor, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Cycle + Sleep Intelligence Showcase ── */}
      <section id="intelligence" className={styles.intelligence}>
        <motion.div
          className="container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.div className={styles.sectionHeader} variants={fadeInUp}>
            <div className={styles.heroBadge} style={{ margin: "0 auto var(--space-4)" }}>
              <Sparkles size={14} />
              Signature Feature
            </div>
            <h2>Cycle + Sleep Intelligence™</h2>
            <p>
              Discover how your menstrual cycle affects your sleep — with insights
              that get smarter the more you log.
            </p>
          </motion.div>

          <div className={styles.insightCards}>
            {[
              {
                icon: "🌙",
                insight:
                  "You sleep 18% worse during the luteal phase.",
                confidence: 78,
              },
              {
                icon: "💤",
                insight:
                  "Your insomnia symptoms increase two days before menstruation.",
                confidence: 72,
              },
              {
                icon: "✨",
                insight:
                  "Average sleep duration decreases during PMS weeks.",
                confidence: 85,
              },
            ].map((card, i) => (
              <motion.div key={i} className={styles.insightCardLarge} variants={fadeInUp}>
                <span className={styles.insightEmoji}>{card.icon}</span>
                <p className={styles.insightText}>{card.insight}</p>
                <div className={styles.confidenceBar}>
                  <div
                    className={styles.confidenceFill}
                    style={{ width: `${card.confidence}%` }}
                  />
                </div>
                <span className={styles.confidenceLabel}>
                  {card.confidence}% confidence
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Privacy Promise ── */}
      <section id="privacy" className={styles.privacy}>
        <motion.div
          className="container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.div className={styles.privacyCard} variants={fadeInUp}>
            <Shield size={40} className={styles.privacyIcon} />
            <h2>Your Privacy is Sacred</h2>
            <p>
              AshLog is built on a foundation of trust. Your health data is
              encrypted, never sold, and always under your control.
            </p>
            <div className={styles.privacyGrid}>
              {[
                { icon: <Shield size={20} />, text: "End-to-end encrypted" },
                { icon: <Clock size={20} />, text: "Full data export anytime" },
                { icon: <BookOpen size={20} />, text: "Journals never used for AI" },
                { icon: <Heart size={20} />, text: "No ads. No data selling." },
              ].map((item, i) => (
                <div key={i} className={styles.privacyItem}>
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Final CTA ── */}
      <section className={styles.finalCta}>
        <motion.div
          className="container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeInUp}>
            Ready to Understand Your Body?
          </motion.h2>
          <motion.p variants={fadeInUp}>
            Start tracking today — it takes less than a minute.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Get Started Free
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Image src="/ashlog.png" alt="AshLog Logo" width={200} height={56} style={{ objectFit: "contain" }} />
          </div>
          <p className={styles.footerDisclaimer}>
            AshLog provides wellness information for educational purposes only.
            It is not a substitute for professional medical advice, diagnosis, or
            treatment.
          </p>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} AshLog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
