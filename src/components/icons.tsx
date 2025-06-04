
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100" 
      fill="currentColor" 
      stroke="none"
      {...props}
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="45" /> {/* fill is currentColor (#89aead) */}

      {/* Wave shape - white */}
      <path
        d="M10 70 C 25 58, 35 62, 50 66 C 65 70, 75 65, 90 72 L90 85 C75 75, 65 80, 50 76 C35 72, 25 78, 10 82 Z"
        fill="white"
      />

      {/* Play Button (Triangle) - white */}
      <polygon points="42,35 62,50 42,65" fill="white" />
    </svg>
  );
}

// You can add more custom SVG icons here as needed.
// For example:
// export function MyCustomIcon(props: SVGProps<SVGSVGElement>) { ... }
