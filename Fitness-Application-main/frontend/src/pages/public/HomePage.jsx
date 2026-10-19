import { useEffect, useRef, useState } from 'react';
import { useAuthModal } from '../../context/AuthModalContext';
import {
  IconHealth,
  IconUtensils,
  IconWorkout,
  IconBarChart,
  IconShield,
  IconTarget,
  IconUser,
  IconTrendingUp,
} from '../../components/common/Icons';
import '../../styles/HomePage.css';
import heroImg from '../../assets/hero.jpg';

/* DATA */

const NAV_STATS = [
  { value: '50K+', label: 'Active Users' },
  { value: '2M+', label: 'Meals Logged' },
  { value: '800K+', label: 'Workouts' },
  { value: '98%', label: 'Satisfaction' },
];

const FEATURES = [
  {
    icon: IconHealth,
    title: 'Health Assessment',
    desc: 'Calculate BMI, BMR & TDEE with scientifically validated formulas and personalized calorie targets.',
    tag: 'Health Science',
    color: '#38bdf8',
  },
  {
    icon: IconUtensils,
    title: 'Diet Tracking',
    desc: 'Log every meal with our comprehensive food database. Track macros, calories & water across all meal types.',
    tag: 'Nutrition',
    color: '#f97316',
  },
  {
    icon: IconWorkout,
    title: 'Workout Logging',
    desc: 'Access an exercise library, log sets, reps & weight, and monitor your full workout history.',
    tag: 'Fitness',
    color: '#7c3aed',
  },
  {
    icon: IconBarChart,
    title: 'Progress Analytics',
    desc: 'Visualize your journey with interactive charts — weight trends, calorie history & workout frequency.',
    tag: 'Analytics',
    color: '#3b82f6',
  },
  {
    icon: IconTarget,
    title: 'Goal Tracking',
    desc: 'Set personalized targets for body recomposition, muscle building, or athletic endurance.',
    tag: 'Targets',
    color: '#ec4899',
  },
  {
    icon: IconShield,
    title: 'Secure & Private',
    desc: 'JWT auth, bcrypt hashing, and role-based access keep your health data completely private.',
    tag: 'Security',
    color: '#06b6d4',
  },
];

const STEPS = [
  { num: '01', icon: IconUser, title: 'Create Account', desc: 'Sign up in seconds. Your data stays private and encrypted.' },
  { num: '02', icon: IconTarget, title: 'Set Your Goals', desc: 'Enter your stats. We calculate your personalized calorie target.' },
  { num: '03', icon: IconTrendingUp, title: 'Track Daily', desc: 'Log meals and workouts. Watch your dashboard fill with insights.' },
  { num: '04', icon: IconShield, title: 'Achieve Results', desc: 'Use analytics to stay on track and hit your health goals.' },
];


/* HOOKS */

function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const numeric = parseInt(target.replace(/[^0-9]/g, ''), 10);
        const suffix = target.replace(/[0-9.]/g, '');
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(`${Math.floor(numeric * ease)}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* SMALL REUSABLE COMPONENTS */

function SectionLabel({ children }) {
  return <p className="section-label">{children}</p>;
}

function StatCounter({ value, label }) {
  const { count, ref } = useCountUp(value);
  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-value">{count || '0'}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* Hero */
function HeroSection() {
  const { openModal } = useAuthModal();

  return (
    <section className="hp-hero" id="home">
      <div
        className="hp-hero__bg"
        style={{ backgroundImage: `url(${heroImg})` }}
        aria-hidden="true"
      />
      <div className="hp-hero__overlay" aria-hidden="true" />
      <div className="container">
        <div className="hp-hero__inner">
          <div className="hp-hero__copy">
            <h1>
              Your Complete<br />
              <em>Health &amp; Fitness</em><br />
              Command Center
            </h1>

            <p className="hp-hero__sub">
              Track nutrition, crush workouts, understand your body metrics and
              achieve your goals — all in one clean platform built for real results.
            </p>

            <div className="hp-hero__cta">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => openModal('signup')}
              >
                Start for Free
              </button>
              <a
                href="#how-it-works"
                className="btn btn-outline btn-lg"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                See how it works
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint — CSS dumbbell */}
      <div className="hp-hero__scroll" aria-hidden="true">
        <svg
          className="hp-hero__dumbbell"
          width="44" height="22"
          viewBox="0 0 44 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          {/* Left outer plate */}
          <rect x="0" y="3" width="6" height="16" rx="2" fill="currentColor" opacity="0.9" />
          {/* Left inner plate */}
          <rect x="7" y="6" width="4" height="10" rx="1.5" fill="currentColor" opacity="0.7" />
          {/* Bar */}
          <rect x="12" y="10" width="20" height="2.5" rx="1.25" fill="currentColor" opacity="0.5" />
          {/* Right inner plate */}
          <rect x="33" y="6" width="4" height="10" rx="1.5" fill="currentColor" opacity="0.7" />
          {/* Right outer plate */}
          <rect x="38" y="3" width="6" height="16" rx="2" fill="currentColor" opacity="0.9" />
        </svg>
        <span className="hp-hero__scroll-line" />
      </div>
    </section>
  );
}

/* Stats Bar */

function StatsBar() {
  return (
    <section className="hp-stats">
      <div className="container hp-stats__grid">
        {NAV_STATS.map(({ value, label }) => (
          <StatCounter key={label} value={value} label={label} />
        ))}
      </div>
    </section>
  );
}

/* ── Features ── */
function FeaturesSection() {
  return (
    <section className="hp-features section" id="features">
      <div className="container">
        <div className="hp-section-header">
          <SectionLabel>Everything You Need</SectionLabel>
          <h2>Built for Serious<br /><em className="text-gradient">Health Transformation</em></h2>
          <p>Six powerful modules working together — giving you the full picture of your health.</p>
        </div>

        <div className="hp-features__grid">
          {FEATURES.map(({ icon: IconComp, title, desc, tag, color }) => (
            <article
              className="hp-feature-card"
              key={title}
              style={{ '--card-accent': color }}
            >
              <div className="hp-feature-card__icon" style={{ background: `${color}18`, color }}>
                <IconComp size={24} color={color} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="hp-feature-card__tag" style={{ color }}>→ {tag}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ── */
function HowItWorksSection() {
  return (
    <section className="hp-steps section" id="how-it-works">
      <div className="container">
        <div className="hp-section-header">
          <SectionLabel>Your Journey</SectionLabel>
          <h2>Get Started in<br /><em className="text-gradient">4 Simple Steps</em></h2>
          <p>From zero to a fully personalized health dashboard in minutes.</p>
        </div>

        <div className="hp-steps__grid">
          {STEPS.map(({ num, icon: IconComp, title, desc }) => (
            <article className="hp-step-card" key={num}>
              <div className="hp-step-card__num">{num}</div>
              <div className="hp-step-card__icon">
                <IconComp size={24} color="#0284c7" />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
          
/* PAGE ROOT */
export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorksSection />
    </main>
  );
}
