import React, { useEffect, useRef, useState } from 'react';

const design = {
  colors: {
    teal: '#0D4F4F',
    midTeal: '#1A8A8A',
    coral: '#E07B54',
    mint: '#2EC4B6',
    tan: '#D4A574',
    slate: '#94A7B0',
    darkText: '#1A3A4A',
    mutedText: '#5A7A8A',
    background: '#F4F7F9',
    cardBg: '#FFFFFF',
    gridLine: 'rgba(13,79,79,0.03)',
    cardBorder: 'rgba(13,79,79,0.08)',
    cardShadow: '0 2px 8px rgba(13,79,79,0.04)',
  },
  radius: { card: '20px', pill: '999px' },
  spacing: { gridSize: '48px' },
  font: {
    family: "'Outfit', system-ui, -apple-system, sans-serif",
    weights: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
  },
};

const pageBackground = {
  backgroundColor: design.colors.background,
  backgroundImage: `
    linear-gradient(to right, ${design.colors.gridLine} 1px, transparent 1px),
    linear-gradient(to bottom, ${design.colors.gridLine} 1px, transparent 1px)
  `,
  backgroundSize: `${design.spacing.gridSize} ${design.spacing.gridSize}`,
};

const formatCurrency = (value) => {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
};

const formatK = (value) => {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.round(abs / 1000).toLocaleString()}K`;
};

const useInView = (options = { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(entry.target);
      }
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
};

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const AnimatedNumber = ({
  value,
  duration = 1400,
  format = formatCurrency,
  startOnInView = true,
  style,
  className,
}) => {
  const [ref, inView] = useInView();
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (startOnInView && !inView) return;
    const target = Number(value) || 0;
    startRef.current = 0;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      setDisplay(target * easeOutCubic(t));
      if (t < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration, inView, startOnInView]);

  return (
    <span ref={ref} className={className} style={style}>
      {format(display)}
    </span>
  );
};

const Card = ({ children, style, padding = '28px', as: Tag = 'div', ...rest }) => (
  <Tag
    style={{
      backgroundColor: design.colors.cardBg,
      borderRadius: design.radius.card,
      boxShadow: design.colors.cardShadow,
      border: `1px solid ${design.colors.cardBorder}`,
      padding,
      ...style,
    }}
    {...rest}
  >
    {children}
  </Tag>
);

const Badge = ({ children, color = design.colors.midTeal, variant = 'soft', style }) => {
  const isSolid = variant === 'solid';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: design.radius.pill,
        backgroundColor: isSolid ? color : `${color}1A`,
        color: isSolid ? '#FFFFFF' : color,
        fontFamily: design.font.family,
        fontWeight: design.font.weights.semibold,
        fontSize: '12px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        lineHeight: 1.2,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

const SectionHeader = ({ eyebrow, title, description, action, style }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: '24px',
      marginBottom: '24px',
      flexWrap: 'wrap',
      ...style,
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {eyebrow && <Badge color={design.colors.coral}>{eyebrow}</Badge>}
      <h2
        style={{
          margin: 0,
          fontFamily: design.font.family,
          fontWeight: design.font.weights.bold,
          fontSize: '28px',
          color: design.colors.darkText,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            margin: 0,
            fontFamily: design.font.family,
            fontWeight: design.font.weights.regular,
            fontSize: '15px',
            color: design.colors.mutedText,
            maxWidth: '640px',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ─── Payroll data ────────────────────────────────────────────────────────────

const PAYROLL_ITEMS = [
  { name: 'Samuel Hale',   amount: 3_410_000, monthly: 284_000, description: 'Primary production contractor', category: 'COGS' },
  { name: 'Admin Payroll', amount:   845_000, monthly:  70_000, description: 'Office staff',                  category: 'OpEx' },
  { name: 'Workforce',     amount:   532_000, monthly:  44_000, description: 'Hourly production',              category: 'COGS' },
  { name: 'Payroll Other', amount:   178_000, monthly:  15_000, description: 'Overtime bonuses',              category: 'COGS' },
  { name: 'Payroll Taxes', amount:   156_000, monthly:  13_000, description: 'Employer taxes',                category: 'OpEx' },
  { name: 'Contract Labor',amount:   126_000, monthly:  11_000, description: 'Temp workers',                  category: 'OpEx' },
  { name: 'Benefits',      amount:    98_000, monthly:   8_000, description: 'Health & retirement',           category: 'OpEx' },
];

// ─── PayrollBarChart ─────────────────────────────────────────────────────────

const PayrollBarChart = () => {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const maxAmount = PAYROLL_ITEMS[0].amount;

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {PAYROLL_ITEMS.map((item, i) => {
        const pct = (item.amount / maxAmount) * 100;
        const isCOGS = item.category === 'COGS';
        const barGradient = isCOGS
          ? `linear-gradient(90deg, ${design.colors.teal}, ${design.colors.midTeal})`
          : `linear-gradient(90deg, ${design.colors.coral}, #e8956f)`;
        const trackBg = isCOGS
          ? `${design.colors.teal}14`
          : `${design.colors.coral}14`;

        return (
          <div
            key={item.name}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}
          >
            {/* Label column */}
            <div style={{ width: '176px', flexShrink: 0 }}>
              <div style={{
                fontFamily: design.font.family,
                fontWeight: design.font.weights.semibold,
                fontSize: '14px',
                color: design.colors.darkText,
                lineHeight: 1.3,
              }}>
                {item.name}
              </div>
              <div style={{
                fontFamily: design.font.family,
                fontWeight: design.font.weights.regular,
                fontSize: '12px',
                color: design.colors.mutedText,
                marginTop: '2px',
              }}>
                {item.description}
              </div>
            </div>

            {/* Bar track */}
            <div style={{
              flex: 1,
              minWidth: 0,
              height: '30px',
              backgroundColor: trackBg,
              borderRadius: '6px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: inView ? `${pct}%` : '0%',
                height: '100%',
                background: barGradient,
                borderRadius: '6px',
                transition: `width ${0.45 + i * 0.07}s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.05}s`,
              }} />
            </div>

            {/* Amount column */}
            <div style={{ width: '118px', flexShrink: 0, textAlign: 'right' }}>
              <div style={{
                fontFamily: design.font.family,
                fontWeight: design.font.weights.bold,
                fontSize: '14px',
                color: design.colors.darkText,
              }}>
                {formatK(item.amount)}
              </div>
              <div style={{
                fontFamily: design.font.family,
                fontWeight: design.font.weights.regular,
                fontSize: '12px',
                color: design.colors.mutedText,
                marginTop: '2px',
              }}>
                {formatK(item.monthly)}/mo
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── PayrollSection ───────────────────────────────────────────────────────────

const PayrollSection = () => (
  <section
    id="payroll"
    data-section="payroll"
    style={{ scrollMarginTop: '80px', paddingTop: '48px' }}
  >
    <SectionHeader
      eyebrow="Workforce Cost"
      title="Payroll Analysis"
      description="Full-year payroll breakdown across production (COGS) and administrative (OpEx) categories."
    />

    {/* Summary cards */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: '24px',
    }}>
      <Card>
        <Badge color={design.colors.teal}>COGS</Badge>
        <div style={{ marginTop: '16px' }}>
          <AnimatedNumber
            value={4_120_000}
            style={{
              fontFamily: design.font.family,
              fontWeight: design.font.weights.extrabold,
              fontSize: '36px',
              color: design.colors.teal,
              letterSpacing: '-0.02em',
            }}
          />
          <div style={{
            marginTop: '6px',
            fontFamily: design.font.family,
            fontSize: '15px',
            fontWeight: design.font.weights.semibold,
            color: design.colors.darkText,
          }}>
            Production Payroll
          </div>
          <div style={{
            marginTop: '3px',
            fontFamily: design.font.family,
            fontSize: '13px',
            color: design.colors.mutedText,
          }}>
            31.0% of revenue
          </div>
        </div>
      </Card>

      <Card>
        <Badge color={design.colors.coral}>OpEx</Badge>
        <div style={{ marginTop: '16px' }}>
          <AnimatedNumber
            value={1_230_000}
            style={{
              fontFamily: design.font.family,
              fontWeight: design.font.weights.extrabold,
              fontSize: '36px',
              color: design.colors.coral,
              letterSpacing: '-0.02em',
            }}
          />
          <div style={{
            marginTop: '6px',
            fontFamily: design.font.family,
            fontSize: '15px',
            fontWeight: design.font.weights.semibold,
            color: design.colors.darkText,
          }}>
            Admin Payroll
          </div>
          <div style={{
            marginTop: '3px',
            fontFamily: design.font.family,
            fontSize: '13px',
            color: design.colors.mutedText,
          }}>
            9.2% of revenue
          </div>
        </div>
      </Card>
    </div>

    {/* Horizontal bar chart */}
    <Card style={{ marginBottom: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          margin: 0,
          fontFamily: design.font.family,
          fontWeight: design.font.weights.bold,
          fontSize: '18px',
          color: design.colors.darkText,
        }}>
          Payroll by Category
        </h3>
        <p style={{
          margin: '4px 0 0',
          fontFamily: design.font.family,
          fontSize: '13px',
          color: design.colors.mutedText,
        }}>
          Annual totals with monthly averages · sorted by spend
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Production COGS', color: design.colors.teal },
          { label: 'Admin OpEx',      color: design.colors.coral },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: color, flexShrink: 0 }} />
            <span style={{
              fontFamily: design.font.family,
              fontSize: '12px',
              fontWeight: design.font.weights.medium,
              color: design.colors.mutedText,
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Scrollable wrapper ensures chart stays usable on narrow screens */}
      <div className="cf-table-wrap">
        <div style={{ minWidth: '520px' }}>
          <PayrollBarChart />
        </div>
      </div>
    </Card>

    {/* Teal gradient summary banner */}
    <div style={{
      borderRadius: design.radius.card,
      background: `linear-gradient(135deg, ${design.colors.teal} 0%, ${design.colors.midTeal} 60%, #247a7a 100%)`,
      padding: '32px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '24px',
    }}>
      {[
        { value: '$5.35M',  sub: null,              label: 'Total Payroll'    },
        { value: '40.3%',   sub: 'of revenue',      label: 'Headcount Cost'  },
        { value: '~18%',    sub: 'employer overhead',label: 'Burden Rate'     },
      ].map(({ value, sub, label }) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: design.font.family,
            fontWeight: design.font.weights.extrabold,
            fontSize: '32px',
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            {value}
          </div>
          {sub && (
            <div style={{
              fontFamily: design.font.family,
              fontWeight: design.font.weights.regular,
              fontSize: '12px',
              color: 'rgba(255,255,255,0.55)',
              marginTop: '3px',
            }}>
              {sub}
            </div>
          )}
          <div style={{
            fontFamily: design.font.family,
            fontWeight: design.font.weights.medium,
            fontSize: '11px',
            color: 'rgba(255,255,255,0.7)',
            marginTop: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'payroll', label: 'Payroll Analysis' },
];

const Sidebar = ({ activeSection }) => (
  <aside
    className="cf-sidebar"
    style={{
      width: '240px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      backgroundColor: design.colors.cardBg,
      borderRight: `1px solid ${design.colors.cardBorder}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 0',
      overflowY: 'auto',
    }}
  >
    {/* Brand mark */}
    <div style={{ padding: '0 20px 32px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${design.colors.teal}, ${design.colors.midTeal})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '14px',
        boxShadow: '0 4px 12px rgba(13,79,79,0.25)',
      }}>
        <span style={{
          color: '#fff',
          fontSize: '15px',
          fontWeight: 800,
          fontFamily: design.font.family,
          letterSpacing: '-0.02em',
        }}>
          CF
        </span>
      </div>
      <div style={{
        fontFamily: design.font.family,
        fontWeight: design.font.weights.bold,
        fontSize: '14px',
        color: design.colors.darkText,
        lineHeight: 1.3,
      }}>
        Color Fashion
      </div>
      <div style={{
        fontFamily: design.font.family,
        fontWeight: design.font.weights.regular,
        fontSize: '12px',
        color: design.colors.mutedText,
        marginTop: '3px',
      }}>
        FY 2025 Dashboard
      </div>
    </div>

    <div style={{
      padding: '0 20px 8px',
      fontFamily: design.font.family,
      fontWeight: design.font.weights.semibold,
      fontSize: '10px',
      color: design.colors.slate,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    }}>
      Sections
    </div>

    <nav style={{ padding: '0 12px', flex: 1 }}>
      {NAV_ITEMS.map(({ id, label }) => {
        const isActive = activeSection === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: '12px',
              textDecoration: 'none',
              backgroundColor: isActive ? `${design.colors.teal}14` : 'transparent',
              color: isActive ? design.colors.teal : design.colors.mutedText,
              fontFamily: design.font.family,
              fontWeight: isActive ? design.font.weights.semibold : design.font.weights.regular,
              fontSize: '14px',
              borderLeft: isActive ? `3px solid ${design.colors.teal}` : '3px solid transparent',
              marginLeft: '4px',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
          >
            {label}
          </a>
        );
      })}
    </nav>

    <div style={{
      padding: '20px',
      borderTop: `1px solid ${design.colors.cardBorder}`,
    }}>
      <div style={{
        fontFamily: design.font.family,
        fontSize: '11px',
        color: design.colors.slate,
        lineHeight: 1.6,
      }}>
        Q1–Q4 2025<br />
        YTD Actuals
      </div>
    </div>
  </aside>
);

// ─── FinancialDashboard ───────────────────────────────────────────────────────

const FinancialDashboard = () => {
  const [activeSection, setActiveSection] = useState('payroll');

  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]');
    if (!sections.length || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.dataset.section);
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
      />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        /* Horizontal scroll for any tables added to future sections */
        .cf-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .cf-table-wrap table { min-width: 600px; width: 100%; border-collapse: collapse; }
        @media (max-width: 768px) {
          .cf-sidebar { display: none !important; }
          .cf-content  { padding: 24px 20px !important; }
        }
        @media (max-width: 480px) {
          .cf-content { padding: 20px 16px !important; }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          ...pageBackground,
          fontFamily: design.font.family,
          color: design.colors.darkText,
        }}
      >
        <Sidebar activeSection={activeSection} />

        <div
          className="cf-content"
          style={{
            flex: 1,
            padding: '48px',
            minWidth: 0,
            overflowX: 'hidden',
          }}
        >
          <header style={{ marginBottom: '8px' }}>
            <Badge color={design.colors.teal}>FY 2025</Badge>
            <h1
              style={{
                margin: '12px 0 8px',
                fontFamily: design.font.family,
                fontWeight: design.font.weights.extrabold,
                fontSize: '40px',
                letterSpacing: '-0.02em',
                color: design.colors.teal,
              }}
            >
              Color Fashion Dye &amp; Finishing
            </h1>
            <p
              style={{
                margin: 0,
                fontFamily: design.font.family,
                fontWeight: design.font.weights.medium,
                fontSize: '18px',
                color: design.colors.mutedText,
              }}
            >
              FY 2025 Financial Dashboard
            </p>
          </header>

          <PayrollSection />
        </div>
      </div>
    </>
  );
};

export default FinancialDashboard;
