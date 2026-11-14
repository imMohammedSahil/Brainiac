import React, { useState, useRef, useCallback } from 'react';

/**
 * ColorFillCard - JavaScript + Tailwind CSS Variant
 * For React Bits & Tailwind CSS setups.
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

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      tabIndex={0}
      role={trigger === 'click' ? 'button' : 'region'}
      aria-pressed={trigger === 'click' ? isFilled : undefined}
      className={`relative overflow-hidden box-border rounded-[18px] p-7 cursor-pointer outline-none select-none isolate transition-all duration-500 ${className}`}
      style={{
        backgroundColor: baseColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isFilled ? fillBorderColor : borderColor,
        transform: isFilled ? `translateY(${lift}px)` : 'translateY(0)',
        boxShadow: isFilled && glow ? `0 16px 40px -10px ${glowColor}, 0 0 24px -4px ${glowColor}` : 'none',
        ...style,
      }}
      {...restProps}
    >
      {/* Radial flood overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] will-change-[clip-path]"
        style={{
          background: fillColor,
          clipPath: isFilled
            ? `circle(142% at ${currentOriginStr})`
            : `circle(0% at ${currentOriginStr})`,
          transition: `clip-path ${duration}ms ${easing}`,
        }}
        aria-hidden="true"
      />

      {/* Card Content */}
      <div
        className="relative z-[2] flex flex-col"
        style={{
          color: isFilled ? fillTextColor : textColor,
          transition: `color ${duration}ms ${easing}`,
        }}
      >
        {icon && (
          <div
            className="mb-3.5 inline-flex items-center text-xl"
            style={{
              color: isFilled ? fillTextColor : textColor,
              transition: `color ${duration}ms ${easing}`,
            }}
          >
            {icon}
          </div>
        )}
        {title && (
          <h3
            className="m-0 mb-2.5 font-bold text-base leading-snug tracking-tight"
            style={{
              color: isFilled ? fillTextColor : textColor,
              transition: `color ${duration}ms ${easing}`,
            }}
          >
            {title}
          </h3>
        )}
        {description && (
          <p
            className="m-0 text-[13.5px] leading-relaxed"
            style={{
              color: isFilled ? fillSecondaryTextColor : secondaryTextColor,
              transition: `color ${duration}ms ${easing}`,
            }}
          >
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

