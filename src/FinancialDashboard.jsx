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

const FinancialDashboard = () => {
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
          padding: '48px 32px',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <header style={{ marginBottom: '40px' }}>
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
              Color Fashion Dye & Finishing
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
        </div>
      </main>
    </>
  );
};

export default FinancialDashboard;
