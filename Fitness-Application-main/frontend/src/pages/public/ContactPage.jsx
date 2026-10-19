import { useState } from 'react';
import {
  IconBuilding,
  IconCheck,
  IconShield,
} from '../../components/common/Icons';
import '../../styles/ContactPage.css';

/* ── STATIC DATA ── */

const FAQS = [
  {
    q: 'How does MacroPace calculate my calorie and macro targets?',
    a: 'We implement clinically validated algorithms (including Mifflin-St Jeor and Katch-McArdle) paired with your real-time body metrics, activity level, and specific physique goals (fat loss, recomp, or lean mass building).',
  },
  {
    q: 'Can I sync my workout data with wearable devices?',
    a: 'Yes! MacroPace seamlessly integrates with standard fitness tracking exports and enables rapid manual set-and-rep logging with automated progressive overload calculations.',
  },
  {
    q: 'What is the return policy for the MacroPace Store items?',
    a: 'All physical gear and supplements ordered through the MacroPace Store include a 30-day satisfaction guarantee and hassle-free returns on unopened items.',
  },
  {
    q: 'Is my biometric and nutritional data stored securely?',
    a: 'Absolutely. We enforce bank-grade JWT authentication, bcrypt password hashing, and encrypted database records. We never sell your personal or biometric data to third parties.',
  },
  {
    q: 'How do I request a corporate partnership or gym integration?',
    a: 'Select "Partnership & Enterprise" in the department dropdown of our contact form, or email partners@macropace.com with your organization details.',
  },
];

const HUBS = [
  { city: 'San Francisco (HQ)', address: '500 Howard Street, Suite 400, San Francisco, CA' },
  { city: 'London Innovation Lab', address: '25 Bank Street, Canary Wharf, London, UK' },
  { city: 'Bengaluru Tech Hub', address: 'Indiranagar 100ft Road, Bengaluru, India' },
];

/* ── COMPONENT ── */

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'General Support',
    priority: 'Normal',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      department: 'General Support',
      priority: 'Normal',
      message: '',
    });
    setSubmitted(false);
  };

  return (
    <main className="contact-page">
      <div className="contact-light-orb-1" aria-hidden="true" />
      <div className="contact-light-orb-2" aria-hidden="true" />

      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <h1>
            Let&apos;s Connect &amp; <br />
            <span className="text-highlight">Elevate Your Performance</span>
          </h1>

          <p className="lead">
            Have questions about our nutrition calculations, workout intelligence,
            store orders, or partnership opportunities? Our dedicated team is here to assist.
          </p>
        </div>
      </section>

      {/* Form + Side Info */}
      <section className="contact-main-section">
        <div className="container">
          <div className="contact-main-grid">
            {/* Form Column */}
            <div className="contact-form-card">
              <h2>Send Us a Message</h2>
              <p className="form-subtitle">
                Fill out the details below and we will get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="form-success-card">
                  <div className="success-icon">
                    <IconCheck size={28} color="#059669" />
                  </div>
                  <h3>Message Dispatched Successfully!</h3>
                  <p>
                    Thank you, <strong>{formData.name}</strong>. Our support team has received your
                    inquiry ({formData.department} · {formData.priority} priority) and will respond
                    to <strong>{formData.email}</strong> promptly.
                  </p>
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={handleReset}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="contact-name">Full Name *</label>
                      <input
                        id="contact-name"
                        type="text"
                        className="form-input"
                        placeholder="Alex Morgan"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-email">Email Address *</label>
                      <input
                        id="contact-email"
                        type="email"
                        className="form-input"
                        placeholder="alex@example.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="contact-dept">Department / Subject</label>
                      <select
                        id="contact-dept"
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="General Support">General Support &amp; Feedback</option>
                        <option value="Diet & Macros">Diet &amp; Nutrition Calculations</option>
                        <option value="Workout Planner">Workout &amp; Exercise Logging</option>
                        <option value="Store & Orders">Store Orders &amp; Delivery</option>
                        <option value="Partnership & Enterprise">Partnership &amp; Enterprise</option>
                        <option value="Security & Data">Privacy &amp; Data Security</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Priority Level</label>
                      <div className="priority-options">
                        {['Normal', 'High', 'Urgent'].map((lvl) => (
                          <button
                            type="button"
                            key={lvl}
                            className={`priority-btn ${formData.priority === lvl ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, priority: lvl })}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message">Message *</label>
                    <textarea
                      id="contact-message"
                      className="form-textarea"
                      placeholder="How can we assist you with your fitness journey or account?"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Transmitting Message...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Side Info Column */}
            <div className="contact-side-column">
              <div className="support-promise-card">
                <h3>
                  <IconShield size={18} color="#0284c7" />
                  <span>Our Support Promise</span>
                </h3>
                <ul className="promise-list">
                  <li>
                    <span className="bullet">✓</span>
                    <span><strong>100% Human Expertise:</strong> No endless bot loops for complex inquiries.</span>
                  </li>
                  <li>
                    <span className="bullet">✓</span>
                    <span><strong>Scientist-Reviewed Answers:</strong> Metabolic questions verified by sports science.</span>
                  </li>
                  <li>
                    <span className="bullet">✓</span>
                    <span><strong>Strict Privacy:</strong> Inquiry logs and email communications are strictly confidential.</span>
                  </li>
                </ul>
              </div>

              <div className="global-hubs-card">
                <h3>
                  <IconBuilding size={18} color="#0284c7" />
                  <span>Global Innovation Hubs</span>
                </h3>
                {HUBS.map(({ city, address }) => (
                  <div className="hub-item" key={city}>
                    <div className="hub-city">{city}</div>
                    <div className="hub-address">{address}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="contact-faq-section">
        <div className="container">
          <div className="faq-header">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions about MacroPace.</p>
          </div>

          <div className="faq-list">
            {FAQS.map(({ q, a }, index) => {
              const isOpen = openFaq === index;
              return (
                <div className={`faq-item ${isOpen ? 'open' : ''}`} key={q}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{q}</span>
                    <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
