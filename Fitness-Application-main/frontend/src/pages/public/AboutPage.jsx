import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext';
import {
  IconZap,
  IconTarget,
  IconTrendingUp,
  IconShield,
  IconHealth,
  IconUtensils,
  IconWorkout,
  IconUser,
} from '../../components/common/Icons';
import '../../styles/AboutPage.css';

/* ── DATA DEFINITIONS ── */

const QUICK_STATS = [
  { value: '50K+', label: 'Active Users' },
  { value: '99.4%', label: 'Caloric Accuracy' },
  { value: '2.8M+', label: 'Workouts Logged' },
  { value: '4.9/5', label: 'Community Rating' },
];

const STORY_POINTS = [
  {
    icon: IconZap,
    title: 'The Fragmented Landscape',
    desc: 'Before MacroPace, fitness enthusiasts had to juggle four separate apps: one for diet, one for workouts, another for body metrics, and a spreadsheet to tie them together.',
    accent: '#38bdf8',
  },
  {
    icon: IconTarget,
    title: 'The Unified Vision',
    desc: 'We created MacroPace with one foundational goal: build an all-in-one health command center where clinical metabolic science meets seamless daily habit tracking.',
    accent: '#818cf8',
  },
  {
    icon: IconTrendingUp,
    title: 'Science-First Growth',
    desc: 'By integrating Mifflin-St Jeor & Katch-McArdle calculations with smart progressive overload algorithms, we empower users with actionable, realistic targets.',
    accent: '#06b6d4',
  },
];

const PILLARS_DATA = {
  biometrics: {
    title: 'Biometric & Metabolic Intelligence',
    desc: 'No generic guesswork. We calculate your exact Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), and Body Mass Index (BMI) using peer-reviewed physiological formulas.',
    features: [
      'Validated Mifflin-St Jeor & Harris-Benedict formulas',
      'Adaptive activity multipliers tailored to lifestyle',
      'Dynamic calorie deficit/surplus optimization',
      'Automated body composition and weight trending',
    ],
    preview: {
      badge: 'METABOLIC ENGINE',
      status: 'Live Biometrics',
      metrics: [
        { label: 'BMR Baseline', val: '1,780 kcal', sub: 'Resting energy' },
        { label: 'TDEE Target', val: '2,450 kcal', sub: 'Moderate activity' },
        { label: 'Calculated Deficit', val: '-400 kcal', sub: 'Fat loss rate' },
        { label: 'Target Daily', val: '2,050 kcal', sub: 'Goal trajectory' },
      ],
    },
  },
  nutrition: {
    title: 'Precision Nutrition & Macro Tracking',
    desc: 'Log food in seconds with comprehensive macro and micronutrient breakdowns. Real-time calorie counters keep you accountable without obsessive complexity.',
    features: [
      'Extensive nutritional food and recipe database',
      'Targeted Protein / Carb / Fat macro distribution',
      'Hydration logging with daily reminder thresholds',
      'Micronutrient and dietary fiber balance analysis',
    ],
    preview: {
      badge: 'MACRO COMPOSER',
      status: 'Target Breakdown',
      metrics: [
        { label: 'Protein Target', val: '160g', sub: '31% Total energy' },
        { label: 'Carbohydrates', val: '205g', sub: '40% Total energy' },
        { label: 'Healthy Fats', val: '65g', sub: '29% Total energy' },
        { label: 'Hydration Target', val: '3.2L', sub: 'Optimal recovery' },
      ],
    },
  },
  training: {
    title: 'Progressive Overload & Workout Logging',
    desc: 'Track every set, repetition, and resistance level. Visualize volume progression over time to break through plateaus and guarantee strength gains.',
    features: [
      'Custom workout split & exercise routine builder',
      'Real-time set, rep, RPE, and weight tracking',
      'Automatic volume and 1RM progression charts',
      'Rest intervals and exercise library guidance',
    ],
    preview: {
      badge: 'STRENGTH DYNAMICS',
      status: 'Volume Analytics',
      metrics: [
        { label: 'Weekly Volume', val: '34,200 kg', sub: '+8.4% vs last week' },
        { label: 'Top Estimated 1RM', val: '140 kg', sub: 'Bench press' },
        { label: 'Consistency Score', val: '96%', sub: '4/4 Sessions completed' },
        { label: 'Recovery Index', val: 'Optimal', sub: 'Ready for high load' },
      ],
    },
  },
};

const VALUES = [
  {
    icon: IconTarget,
    title: 'Evidence-Based Science',
    desc: 'We discard fitness fads in favor of validated exercise physiology and metabolic science for sustainable results.',
  },
  {
    icon: IconShield,
    title: 'Data Privacy & Security',
    desc: 'Your health and biometric data belongs solely to you. We protect it with encrypted standards and zero third-party selling.',
  },
  {
    icon: IconZap,
    title: 'Frictionless Experience',
    desc: 'Fitness software should save time, not waste it. Every feature in MacroPace is engineered for speed and clarity.',
  },
  {
    icon: IconUser,
    title: 'Community Empowerment',
    desc: 'We foster an inclusive culture where beginners and elite athletes alike find tools to exceed their potential.',
  },
];

const TIMELINE = [
  {
    year: '2024',
    title: 'The Concept & Research',
    desc: 'Founded with a clear mission: build an all-in-one health tracker combining metabolic calculations and workout logging.',
  },
  {
    year: '2025',
    title: 'Beta Launch & Algorithm Validation',
    desc: 'Rolled out private beta to over 5,000 athletes and nutritionists, refining calculation models and dashboard UX.',
  },
  {
    year: '2026',
    title: 'MacroPace 2.0 & Global Expansion',
    desc: 'Surpassed 50,000 active users, launching integrated nutrition analytics, gear store, and intelligent progression modules.',
  },
];

const TEAM = [
  {
    name: 'Aarav Patel',
    role: 'Co-Founder & Chief Product Architect',
    initials: 'AP',
    color: '#38bdf8',
    bio: 'Former competitive athlete and software architect obsessed with human performance telemetry and intuitive user experience.',
    badge: 'Product & Systems',
  },
  {
    name: 'Dr. Tanya Sen',
    role: 'Head of Nutrition & Metabolic Science',
    initials: 'TS',
    color: '#818cf8',
    bio: 'PhD in Clinical Nutritional Biochemistry. Leads our scientific algorithm models for TDEE, BMR, and macro balance.',
    badge: 'Clinical Science',
  },
  {
    name: 'Vikram Joshi',
    role: 'Lead Strength & Conditioning Specialist',
    initials: 'VJ',
    color: '#06b6d4',
    bio: 'CSCS certified trainer with 10+ years coaching national-level lifters and designing periodized progressive overload protocols.',
    badge: 'Performance Training',
  },
  {
    name: 'Neha Kapoor',
    role: 'Head of Engineering & Security',
    initials: 'NK',
    color: '#ec4899',
    bio: 'Full-stack engineering veteran ensuring ultra-fast synchronization, zero downtime, and end-to-end user data privacy.',
    badge: 'Engineering & Cloud',
  },
];

/* ── SUBCOMPONENTS ── */

function AboutHero() {
  return (
    <section className="about-hero">
      <div className="about-hero__glow-1" aria-hidden="true" />
      <div className="about-hero__glow-2" aria-hidden="true" />

      <div className="container">
        <div className="about-hero__content">
          <h1>
            Empowering Every Body to <br />
            <em className="text-highlight">Find Its Natural Pace</em>
          </h1>

          <p className="lead">
            We are redefining personal health and physical conditioning through data-driven precision,
            evidence-based nutrition, and intuitive habit architecture.
          </p>

          <div className="about-hero__quick-stats">
            {QUICK_STATS.map(({ value, label }) => (
              <div className="quick-stat-card" key={label}>
                <span className="number">{value}</span>
                <span className="label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OriginStory() {
  return (
    <section className="about-story section">
      <div className="container">
        <div className="about-story__grid">
          <div className="about-story__text">
            <p className="section-label">Our Philosophy</p>
            <h2>
              Born from Frustration.<br />
              <em className="text-highlight">Engineered for Mastery.</em>
            </h2>
            <p>
              Most fitness applications suffer from two extremes: they are either childishly simplistic
              with inaccurate estimates, or so clunky and bloated that logging a single meal feels like filing taxes.
            </p>
            <p>
              MacroPace was founded on a simple conviction: you don&apos;t need gimmicks or extreme diets to transform
              your physique. You need clear metabolic baselines, consistent nutritional tracking, and progressive
              resistance training.
            </p>

            <div className="quote-box">
              &ldquo;We don&apos;t believe in quick fixes. We build intelligent software for people who want
              sustainable, lifelong physical capability.&rdquo;
            </div>
          </div>

          <div className="about-story__visual">
            <div className="story-card-stack">
              {STORY_POINTS.map(({ icon: IconComp, title, desc, accent }) => (
                <div
                  className="story-card"
                  key={title}
                  style={{ '--card-accent': accent }}
                >
                  <div className="story-card__header">
                    <div className="story-card__icon">
                      <IconComp size={20} color={accent} />
                    </div>
                    <h3 className="story-card__title">{title}</h3>
                  </div>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TransformationTriad() {
  const [activeTab, setActiveTab] = useState('biometrics');
  const current = PILLARS_DATA[activeTab];

  return (
    <section className="about-pillars section">
      <div className="container">
        <div className="section-header">
          <p className="section-label">The Architecture</p>
          <h2>
            The Triad of <em className="text-highlight">Transformation</em>
          </h2>
          <p>
            Three foundational pillars interconnected into a single, unified command center.
          </p>
        </div>

        <div className="pillar-tabs-container">
          <div className="pillar-nav">
            <button
              type="button"
              className={`pillar-tab-btn ${activeTab === 'biometrics' ? 'active' : ''}`}
              onClick={() => setActiveTab('biometrics')}
            >
              <IconHealth size={16} /> Assessment &amp; Biometrics
            </button>
            <button
              type="button"
              className={`pillar-tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
              onClick={() => setActiveTab('nutrition')}
            >
              <IconUtensils size={16} /> Precision Nutrition
            </button>
            <button
              type="button"
              className={`pillar-tab-btn ${activeTab === 'training' ? 'active' : ''}`}
              onClick={() => setActiveTab('training')}
            >
              <IconWorkout size={16} /> Progressive Training
            </button>
          </div>

          <div className="pillar-content-card">
            <div className="pillar-content-left">
              <h3>{current.title}</h3>
              <p>{current.desc}</p>

              <ul className="pillar-features-list">
                {current.features.map((feat) => (
                  <li key={feat}>
                    <span className="check-icon">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pillar-interactive-preview">
              <div className="preview-badge-row">
                <span className="badge badge-primary">{current.preview.badge}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-3)' }}>
                  {current.preview.status}
                </span>
              </div>

              <div className="preview-metric-grid">
                {current.preview.metrics.map(({ label, val, sub }) => (
                  <div className="metric-box" key={label}>
                    <div className="metric-label">{label}</div>
                    <div className="metric-val">{val}</div>
                    <div className="metric-sub">{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CoreValues() {
  return (
    <section className="about-values section">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Guiding Principles</p>
          <h2>
            What We <em className="text-highlight">Stand For</em>
          </h2>
          <p>
            Our core values guide every algorithm, user interface, and feature we build.
          </p>
        </div>

        <div className="values-grid">
          {VALUES.map(({ icon: IconComp, title, desc }) => (
            <div className="value-card" key={title}>
              <div className="value-card__icon">
                <IconComp size={24} color="#0284c7" />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneyTimeline() {
  return (
    <section className="about-timeline section">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Our Evolution</p>
          <h2>
            The Journey <em className="text-highlight">So Far</em>
          </h2>
          <p>From initial research hypotheses to an active global fitness ecosystem.</p>
        </div>

        <div className="timeline-track">
          {TIMELINE.map(({ year, title, desc }) => (
            <div className="timeline-item" key={year}>
              <div className="timeline-node" />
              <div className="timeline-card">
                <span className="timeline-year">{year}</span>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeadershipTeam() {
  return (
    <section className="about-team section">
      <div className="container">
        <div className="section-header">
          <p className="section-label">The Team</p>
          <h2>
            Minds Behind <em className="text-highlight">MacroPace</em>
          </h2>
          <p>
            Meet the engineers, nutritional scientists, and performance coaches dedicated to your success.
          </p>
        </div>

        <div className="team-grid">
          {TEAM.map(({ name, role, initials, color, bio, badge }) => (
            <div className="team-card" key={name}>
              <div className="team-avatar" style={{ background: color }}>
                {initials}
              </div>
              <h3>{name}</h3>
              <div className="team-role">{role}</div>
              <p>{bio}</p>
              <span className="team-badge">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutCTA() {
  const { openModal } = useAuthModal();

  return (
    <section className="about-cta">
      <div className="container">
        <div className="about-cta__box">
          <h2>
            Ready to Take Control of <br />
            <em className="text-highlight">Your Health Journey?</em>
          </h2>
          <p>
            Join 50,000+ athletes, lifters, and everyday achievers optimizing their nutrition and performance today.
          </p>
          <div className="about-cta__actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => openModal('signup')}
            >
              Start for Free Today
            </button>
            <Link to="/#features" className="btn btn-outline btn-lg">
              Explore All Features
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── MAIN COMPONENT ── */

export default function AboutPage() {
  return (
    <main className="about-page">
      <AboutHero />
      <OriginStory />
      <TransformationTriad />
      <CoreValues />
      <JourneyTimeline />
      <LeadershipTeam />
      <AboutCTA />
    </main>
  );
}
