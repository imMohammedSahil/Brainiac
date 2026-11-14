import React, { useState, useRef, useCallback, CSSProperties, ReactNode, MouseEvent } from 'react';
import './ColorFillCard.css';

export type ColorFillOrigin =
  | 'mouse'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-left'
  | 'top-right'
  | 'center';

export type ColorFillTrigger = 'hover' | 'click' | 'manual';

export interface ColorFillCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  title?: string;
  description?: string;
  icon?: ReactNode;
  baseColor?: string;
  fillColor?: string;
  textColor?: string;
  fillTextColor?: string;
  secondaryTextColor?: string;
  fillSecondaryTextColor?: string;
  borderColor?: string;
  fillBorderColor?: string;
  glowColor?: string;
  glow?: boolean;
  duration?: number;
  easing?: string;
  origin?: ColorFillOrigin;
  lift?: number;
  trigger?: ColorFillTrigger;
  isFilled?: boolean;
  onFillChange?: (filled: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export const ColorFillCard: React.FC<ColorFillCardProps> = ({
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
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [internalFilled, setInternalFilled] = useState<boolean>(false);
  const [mouseOrigin, setMouseOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 100 });

  const isFilled = controlledFilled !== undefined ? controlledFilled : internalFilled;

  const resolveOrigin = useCallback(
    (e?: MouseEvent<HTMLDivElement>): string => {
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
    },
    [origin]
  );

  const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    if (origin === 'mouse') resolveOrigin(e);
    if (trigger === 'hover') {
      setInternalFilled(true);
      onFillChange?.(true);
    }
    restProps.onMouseEnter?.(e);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (origin === 'mouse' && !isFilled) {
      resolveOrigin(e);
    }
    restProps.onMouseMove?.(e);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    if (trigger === 'hover') {
      setInternalFilled(false);
      onFillChange?.(false);
    }
    restProps.onMouseLeave?.(e);
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (trigger === 'click') {
      if (origin === 'mouse' && !isFilled) resolveOrigin(e);
      const next = !isFilled;
      setInternalFilled(next);
      onFillChange?.(next);
    }
    restProps.onClick?.(e);
  };

  const currentOriginStr =
    origin === 'mouse' ? `${mouseOrigin.x}% ${mouseOrigin.y}%` : resolveOrigin();

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
  } as CSSProperties;

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
};

export default ColorFillCard;

