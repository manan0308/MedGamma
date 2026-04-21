import React from 'react';

// Ultra-minimal line-icon set. 1.25 stroke for the clinical feel.
const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function Icon({ name, size = 16, className, style }) {
  const props = { ...base, width: size, height: size, className, style };
  switch (name) {
    case 'upload':
      return (
        <svg {...props}>
          <path d="M8 2v8" />
          <path d="M4.5 5.5L8 2l3.5 3.5" />
          <path d="M2.5 11.5v1A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5v-1" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...props}>
          <path d="M8 3v10M3 8h10" />
        </svg>
      );
    case 'x':
      return (
        <svg {...props}>
          <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...props}>
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg {...props}>
          <path d="M13 8H3M7 4L3 8l4 4" />
        </svg>
      );
    case 'play':
      return (
        <svg {...props}>
          <path d="M4.5 3.5v9l8-4.5-8-4.5z" />
        </svg>
      );
    case 'eye':
      return (
        <svg {...props}>
          <path d="M1.5 8S3.5 3.5 8 3.5 14.5 8 14.5 8 12.5 12.5 8 12.5 1.5 8 1.5 8z" />
          <circle cx="8" cy="8" r="2" />
        </svg>
      );
    case 'eye-off':
      return (
        <svg {...props}>
          <path d="M2 2l12 12" />
          <path d="M3.5 6C2.5 7 1.5 8 1.5 8S3.5 12.5 8 12.5a7 7 0 0 0 3-.7" />
          <path d="M6.5 4A7.5 7.5 0 0 1 8 3.5c4.5 0 6.5 4.5 6.5 4.5a13 13 0 0 1-1.8 2.3" />
        </svg>
      );
    case 'layers':
      return (
        <svg {...props}>
          <path d="M8 2l6 3.5L8 9 2 5.5 8 2z" />
          <path d="M2 10.5L8 14l6-3.5" />
        </svg>
      );
    case 'history':
      return (
        <svg {...props}>
          <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9L2.5 5.7" />
          <path d="M2.5 2.5v3.2h3.2" />
          <path d="M8 5v3l2 1.2" />
        </svg>
      );
    case 'compare':
      return (
        <svg {...props}>
          <rect x="2" y="3" width="5" height="10" rx="1" />
          <rect x="9" y="3" width="5" height="10" rx="1" />
        </svg>
      );
    case 'download':
      return (
        <svg {...props}>
          <path d="M8 2v8" />
          <path d="M4.5 7.5L8 11l3.5-3.5" />
          <path d="M2.5 13h11" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="2" />
          <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.8 3.8l1 1M11.2 11.2l1 1M3.8 12.2l1-1M11.2 4.8l1-1" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...props}>
          <path d="M8 2l1.2 3.5L13 6.5l-3 2 1 4L8 10l-3 2.5 1-4-3-2 3.8-1L8 2z" />
        </svg>
      );
    case 'file':
      return (
        <svg {...props}>
          <path d="M4 2h5l3 3v9H4V2z" />
          <path d="M9 2v3h3" />
        </svg>
      );
    case 'image':
      return (
        <svg {...props}>
          <rect x="2" y="3" width="12" height="10" rx="1" />
          <circle cx="6" cy="7" r="1" />
          <path d="M2.5 12l3.5-3 3 2.5 2-1.5 2.5 2" />
        </svg>
      );
    case 'info':
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="6" />
          <path d="M8 7v4M8 5.2v.3" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...props}>
          <path d="M8 2l6.5 11h-13L8 2z" />
          <path d="M8 6.5v3.2M8 11.5v.3" />
        </svg>
      );
    case 'check':
      return (
        <svg {...props}>
          <path d="M3 8.5L6.5 12 13 4.5" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="2.5" />
          <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.8 3.8l1 1M11.2 11.2l1 1M3.8 12.2l1-1M11.2 4.8l1-1" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...props}>
          <path d="M13 9.5A5 5 0 1 1 6.5 3a4 4 0 0 0 6.5 6.5z" />
        </svg>
      );
    case 'drag':
      return (
        <svg {...props}>
          <circle cx="6" cy="4" r=".6" />
          <circle cx="10" cy="4" r=".6" />
          <circle cx="6" cy="8" r=".6" />
          <circle cx="10" cy="8" r=".6" />
          <circle cx="6" cy="12" r=".6" />
          <circle cx="10" cy="12" r=".6" />
        </svg>
      );
    case 'logo':
      return (
        <svg viewBox="0 0 16 16" width={size} height={size} fill="none" className={className} style={style}>
          <rect x="1.5" y="1.5" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="1.25" />
          <path d="M5 11V5l3 4 3-4v6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default Icon;
