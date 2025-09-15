import { forwardRef } from "react";

// Icon type definition for better type safety
type IconName = "search" | "back" | "warning" | "info" | "sun" | "moon" | "lock" | "loading";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

// Icon definitions with common SVG attributes
const iconDefinitions: Record<IconName, { viewBox: string; fill?: string; stroke?: string; children: React.ReactNode }> = {
  search: {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    children: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  },
  back: {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    children: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  },
  warning: {
    viewBox: "0 0 20 20",
    fill: "currentColor",
    children: <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  },
  info: {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    children: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  },
  sun: {
    viewBox: "0 0 20 20",
    fill: "currentColor",
    children: <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
  },
  moon: {
    viewBox: "0 0 20 20",
    fill: "currentColor",
    children: <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  },
  lock: {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    children: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  },
  loading: {
    viewBox: "0 0 24 24",
    fill: "none",
    children: (
      <>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </>
    )
  }
};

const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 16, className = "" }, ref) => {
    const icon = iconDefinitions[name];
    
    if (!icon) return null;

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={icon.viewBox}
        fill={icon.fill}
        stroke={icon.stroke}
        className={className}
      >
        {icon.children}
      </svg>
    );
  }
);

Icon.displayName = "Icon";

export default Icon;
