import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    backdrop: 'rgba(10,22,40,0.3)',
  },
  radius: { card: '20px', pill: '999px', nav: '12px' },
  spacing: { gridSize: '48px', sidebarWidth: '260px', headerHeight: '88px' },
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
    const startValue = 0;
    startRef.current = 0;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      setDisplay(startValue + (target - startValue) * eased);
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

const Icon = ({ name, size = 18, color = 'currentColor' }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (name) {
    case 'overview':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case 'monthly':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M3 9h18M8 2v4M16 2v4" />
        </svg>
      );
    case 'expense':
      return (
        <svg {...common}>
          <path d="M3 7h18M3 12h18M3 17h12" />
          <circle cx="19" cy="17" r="2" />
        </svg>
      );
    case 'cogs':
      return (
        <svg {...common}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.3 7L12 12l8.7-5M12 22V12" />
        </svg>
      );
    case 'utilities':
      return (
        <svg {...common}>
          <path d="M13 2L4.5 13.5H11L10 22l9-12h-6.5L13 2z" />
        </svg>
      );
    case 'payroll':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="4" />
          <path d="M3 21v-1a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v1" />
          <path d="M17 11h4M19 9v4" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    default:
      return null;
  }
};

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'monthly-report', label: 'Monthly Report', icon: 'monthly' },
  { id: 'expense-detail', label: 'Expense Detail', icon: 'expense' },
  { id: 'cogs-details', label: 'COGS Details', icon: 'cogs' },
  { id: 'utilities', label: 'Utilities', icon: 'utilities' },
  { id: 'payroll', label: 'Payroll', icon: 'payroll' },
];

const FOOTER_STATS = [
  { label: 'Revenue', value: '$13.28M', color: design.colors.teal },
  { label: 'Net Margin', value: '3.9%', color: design.colors.coral },
  { label: 'Gross Margin', value: '27.2%', color: design.colors.mint },
];

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${design.colors.teal} 0%, ${design.colors.midTeal} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: design.font.family,
        fontWeight: design.font.weights.extrabold,
        fontSize: '18px',
        letterSpacing: '-0.02em',
        boxShadow: '0 4px 12px rgba(13,79,79,0.2)',
      }}
    >
      CF
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
      <span
        style={{
          fontFamily: design.font.family,
          fontWeight: design.font.weights.bold,
          fontSize: '15px',
          color: design.colors.darkText,
        }}
      >
        Color Fashion
      </span>
      <span
        style={{
          fontFamily: design.font.family,
          fontWeight: design.font.weights.medium,
          fontSize: '13px',
          color: design.colors.mutedText,
        }}
      >
        Dye & Finishing
      </span>
    </div>
  </div>
);

const Sidebar = ({ open, onClose, activeId, onNavigate }) => {
  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: design.colors.backdrop,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 260ms ease',
          zIndex: 40,
        }}
      />
      <aside
        aria-hidden={!open}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: design.spacing.sidebarWidth,
          backgroundColor: '#fff',
          boxShadow: '4px 0 24px rgba(13,79,79,0.08)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Logo />
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: design.colors.mutedText,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Badge color={design.colors.teal}>FY 2025</Badge>
        </div>

        <div
          style={{
            fontFamily: design.font.family,
            fontWeight: design.font.weights.semibold,
            fontSize: '11px',
            letterSpacing: '0.14em',
            color: design.colors.mutedText,
            textTransform: 'uppercase',
            marginBottom: '10px',
            paddingLeft: '4px',
          }}
        >
          Sections
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {SECTIONS.map((s) => {
            const isActive = activeId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onNavigate(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: design.radius.nav,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? design.colors.teal : 'transparent',
                  color: isActive ? '#fff' : design.colors.darkText,
                  fontFamily: design.font.family,
                  fontWeight: isActive ? design.font.weights.semibold : design.font.weights.medium,
                  fontSize: '14px',
                  textAlign: 'left',
                  transition: 'background-color 180ms ease, color 180ms ease',
                }}
              >
                <Icon name={s.icon} size={18} color={isActive ? '#fff' : design.colors.midTeal} />
                {s.label}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: `1px solid ${design.colors.cardBorder}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {FOOTER_STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: design.font.family,
              }}
            >
              <span style={{ fontSize: '12px', color: design.colors.mutedText, fontWeight: design.font.weights.medium }}>
                {stat.label}
              </span>
              <span style={{ fontSize: '14px', color: stat.color, fontWeight: design.font.weights.bold }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

const HamburgerButton = ({ open, onClick }) => (
  <button
    onClick={onClick}
    aria-label={open ? 'Close sidebar' : 'Open sidebar'}
    style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      backgroundColor: design.colors.teal,
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      boxShadow: '0 6px 16px rgba(13,79,79,0.25)',
      transition: 'transform 200ms ease, background-color 200ms ease',
    }}
  >
    <Icon name={open ? 'close' : 'menu'} size={20} color="#fff" />
  </button>
);

const HeaderBar = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '24px',
      padding: '20px 24px',
      marginBottom: '32px',
      backgroundColor: design.colors.cardBg,
      borderRadius: design.radius.card,
      border: `1px solid ${design.colors.cardBorder}`,
      boxShadow: design.colors.cardShadow,
      flexWrap: 'wrap',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      <h1
        style={{
          margin: 0,
          fontFamily: design.font.family,
          fontWeight: design.font.weights.extrabold,
          fontSize: '26px',
          letterSpacing: '-0.02em',
        }}
      >
        <span style={{ color: design.colors.teal }}>Color Fashion </span>
        <span style={{ color: design.colors.coral }}>Dye & Finishing</span>
      </h1>
      <Badge color={design.colors.teal} variant="solid">
        FY 2025
      </Badge>
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        borderRadius: design.radius.pill,
        backgroundColor: `${design.colors.mint}14`,
        border: `1px solid ${design.colors.mint}33`,
      }}
    >
      <span
        style={{
          fontFamily: design.font.family,
          fontWeight: design.font.weights.medium,
          fontSize: '12px',
          color: design.colors.mutedText,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Revenue
      </span>
      <span
        style={{
          fontFamily: design.font.family,
          fontWeight: design.font.weights.extrabold,
          fontSize: '20px',
          color: design.colors.teal,
          letterSpacing: '-0.01em',
        }}
      >
        $13.28M
      </span>
    </div>
  </div>
);

const Section = ({ id, children }) => (
  <section
    id={id}
    style={{
      scrollMarginTop: design.spacing.headerHeight,
      marginBottom: '48px',
      minHeight: '320px',
    }}
  >
    {children}
  </section>
);

const FinancialDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  const handleNavigate = useCallback((id) => {
    const node = document.getElementById(id);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveId(id);
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const nodes = SECTIONS
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const contentPadding = useMemo(
    () => ({ padding: '88px 32px 64px', maxWidth: '1280px', margin: '0 auto' }),
    []
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
      />
      <main
        style={{
          minHeight: '100vh',
          ...pageBackground,
          fontFamily: design.font.family,
          color: design.colors.darkText,
          position: 'relative',
        }}
      >
        <HamburgerButton open={sidebarOpen} onClick={toggleSidebar} />
        <Sidebar
          open={sidebarOpen}
          onClose={closeSidebar}
          activeId={activeId}
          onNavigate={handleNavigate}
        />

        <div style={contentPadding}>
          <HeaderBar />

          {SECTIONS.map((s) => (
            <Section key={s.id} id={s.id} />
          ))}
        </div>
      </main>
    </>
  );
};

export default FinancialDashboard;
