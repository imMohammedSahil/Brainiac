import React, { useState, useRef, useCallback } from 'react';
import './ColorFillCard.css';

/**
 * ColorFillCard - JavaScript + CSS Variant
 * A high-performance, GPU-accelerated card component featuring a smooth radial color flood micro-interaction.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Card content.
 * @param {string} [props.title] - Quick title text.
 * @param {string} [props.description] - Quick description text.
 * @param {string|React.ReactNode} [props.icon] - Quick icon / badge.
 * @param {string} [props.baseColor='#080808'] - Background color before fill.
 * @param {string} [props.fillColor='#ffffff'] - Background color on fill.
 * @param {string} [props.textColor='#ffffff'] - Primary text color before fill.
 * @param {string} [props.fillTextColor='#000000'] - Primary text color after fill.
 * @param {string} [props.secondaryTextColor='#a1a1aa'] - Secondary text color before fill.
 * @param {string} [props.fillSecondaryTextColor='#18181b'] - Secondary text color after fill.
 * @param {string} [props.borderColor='rgba(255, 255, 255, 0.12)'] - Border color before fill.
 * @param {string} [props.fillBorderColor='#ffffff'] - Border color after fill.
 * @param {string} [props.glowColor='rgba(255, 255, 255, 0.22)'] - Box-shadow glow accent.
 * @param {boolean} [props.glow=true] - Whether to show ambient elevation glow on hover.
 * @param {number} [props.duration=1100] - Animation transition duration in ms.
 * @param {string} [props.easing='cubic-bezier(0.16, 1, 0.3, 1)'] - CSS easing curve.
 * @param {'mouse'|'bottom-left'|'bottom-right'|'top-left'|'top-right'|'center'} [props.origin='bottom-left'] - Point where fill blossoms from.
 * @param {number} [props.lift=-4] - Elevation lift in px on hover (0 to disable).
 * @param {'hover'|'click'|'manual'} [props.trigger='hover'] - Trigger mode.
 * @param {boolean} [props.isFilled] - Controlled fill state when trigger='manual'.
 * @param {Function} [props.onFillChange] - Callback invoked when fill state toggles.
 * @param {string} [props.className=''] - Additional custom CSS class names.
 * @param {React.CSSProperties} [props.style={}] - Inline styles.
 */
export default function ColorFillCard({
  children,
  title,
  description,
  icon,
  baseColor = '#080808',
  fillColor = '#ffffff',
  textColor = '#ffffff',
  fillTextColor = '#000000',
  secondaryTextColor = '#a1a1aa',
  fillSecondaryTextColor = '#18181b',
  borderColor = 'rgba(255, 255, 255, 0.12)',
  fillBorderColor = 'transparent',
  glowColor = 'transparent',
  glow = false,
  duration = 2200,
  easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
  origin = 'bottom-left',
  lift = -4,
  trigger = 'hover',
  isFilled: controlledFilled,
  onFillChange,
  className = '',
  style = {},
  ...restProps
}) {
  const cardRef = useRef(null);
  const [internalFilled, setInternalFilled] = useState(false);
  const [mouseOrigin, setMouseOrigin] = useState({ x: 0, y: 100 });

  const isFilled = controlledFilled !== undefined ? controlledFilled : internalFilled;

  // Resolve origin coordinates for radial-clip
  const resolveOrigin = useCallback((e) => {
    if (origin === 'mouse' && cardRef.current && e) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      setMouseOrigin({ x, y });
      return `${x}% ${y}%`;
    }

    switch (origin) {
      case 'bottom-left':
        return '0% 100%';
      case 'bottom-right':
        return '100% 100%';
      case 'top-left':
        return '0% 0%';
      case 'top-right':
        return '100% 0%';
      case 'center':
        return '50% 50%';
      default:
        return '0% 100%';
    }
  }, [origin]);

  const handleMouseEnter = (e) => {
    if (origin === 'mouse') resolveOrigin(e);
    if (trigger === 'hover') {
      setInternalFilled(true);
      onFillChange?.(true);
    }
  };

  const handleMouseMove = (e) => {
    if (origin === 'mouse' && !isFilled) {
      resolveOrigin(e);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setInternalFilled(false);
      onFillChange?.(false);
    }
  };

  const handleClick = (e) => {
    if (trigger === 'click') {
      if (origin === 'mouse' && !isFilled) resolveOrigin(e);
      const next = !isFilled;
      setInternalFilled(next);
      onFillChange?.(next);
    }
    restProps.onClick?.(e);
  };

  const currentOriginStr = origin === 'mouse'
    ? `${mouseOrigin.x}% ${mouseOrigin.y}%`
    : resolveOrigin();

  const cssVariables = {
    '--cfc-base-bg': baseColor,
    '--cfc-fill-bg': fillColor,
    '--cfc-text': textColor,
    '--cfc-text-fill': fillTextColor,
    '--cfc-desc': secondaryTextColor,
    '--cfc-desc-fill': fillSecondaryTextColor,
    '--cfc-border': borderColor,
    '--cfc-border-fill': fillBorderColor,
    '--cfc-glow': glow ? glowColor : 'transparent',
    '--cfc-duration': `${duration}ms`,
    '--cfc-easing': easing,
    '--cfc-origin': currentOriginStr,
    '--cfc-lift': `${lift}px`,
    ...style,
  };

  return (
    <div
      ref={cardRef}
      className={`color-fill-card ${isFilled ? 'is-filled' : ''} ${className}`}
      style={cssVariables}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      tabIndex={0}
      role={trigger === 'click' ? 'button' : 'region'}
      aria-pressed={trigger === 'click' ? isFilled : undefined}
      {...restProps}
    >
      <div className="color-fill-card__content">
        {icon && <div className="color-fill-card__icon">{icon}</div>}
        {title && <h3 className="color-fill-card__title">{title}</h3>}
        {description && <p className="color-fill-card__desc">{description}</p>}
        {children}
      </div>
    </div>
  );
}

