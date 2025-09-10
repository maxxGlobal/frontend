import React from "react";

type Props = { className?: string };

export function StethoscopeIcon({ className = "w-24 h-24" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M37.16,5H38a3.32,3.32,0,0,1,3.36,2.93l1.2,4.56A8.75,8.75,0,0,1,42.69,17a9.74,9.74,0,0,1-9.5,7H28.81a9.74,9.74,0,0,1-9.5-7,8.75,8.75,0,0,1,.08-4.49l1.2-4.56A3.32,3.32,0,0,1,24,5h0" />
      <circle cx="8" cy="19" r="3" />
      <line x1="37" y1="4" x2="37" y2="6" />
      <line x1="25" y1="4" x2="25" y2="6" />
      <path d="M8,22V32.5A11.5,11.5,0,0,0,19.5,44h0A11.5,11.5,0,0,0,31,32.5V24" />
    </svg>
  );
}

export function MicroscopIcon({ className = "w-24 h-24" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="34" width="23" height="8" />
      <polyline points="31 38 29 38 29 42 33 42" />
      <polyline points="33 42 42 25 35 14 24.3 14" />
      <polyline points="31 38 38 25 33 18 23 18" />
      <polygon points="20 22 16 20 14 19 20 7 26.36 10.18 20 22" />
      <polyline points="25 9.5 27 6 24 4 21.77 7.88" />
      <polyline points="19 21.5 18 24 14 22 14.97 19.48" />
    </svg>
  );
}

export function PlasterIcon({ className = "w-24 h-24" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="1.99"
        y="16"
        width="44.02"
        height="16.01"
        rx="2.95"
        ry="2.95"
        transform="translate(-9.94 24) rotate(-45)"
      />
      <line x1="24.75" y1="34" x2="14" y2="23.25" />
      <line x1="23.25" y1="14" x2="34" y2="24.75" />
      <line x1="29" y1="24" x2="24" y2="29" />
      <line x1="24" y1="19" x2="19" y2="24" />
    </svg>
  );
}

export function HandsIcon({ className = "w-8 h-8" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="38" y="21" width="6" height="15" />
      <path d="M38,36V20.32c-1.6-3.69-8.46-1.21-13.83-8.53a1.85,1.85,0,0,0-3.34,1.4,14,14,0,0,0,3.23,6.58" />
      <path d="M24,20H6a2,2,0,0,0-2,2H4a2,2,0,0,0,2,2H23" />
      <path d="M23,24H20a2,2,0,0,0-2,2h0a2,2,0,0,0,2,2h3" />
      <path d="M23,28H20a2,2,0,0,0-2,2h0a2,2,0,0,0,2,2h3" />
      <path d="M23,32H20a2,2,0,0,0-2,2h0a2,2,0,0,0,2,2h.93a12.81,12.81,0,0,1,3.46.51A21.41,21.41,0,0,0,38,35" />
      <rect x="9" y="20" width="4" height="4" />
      <polyline points="8 18 11 20 14 18" />
    </svg>
  );
}

export function BrainIcon({ className = "w-8 h-8" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M28.46,4H29A14,14,0,0,1,43,18V30A14,14,0,0,1,29,44h-.5A4.46,4.46,0,0,1,24,39.54V8.46A4.46,4.46,0,0,1,28.46,4Z" />
      <path
        d="M9.46,4H10A14,14,0,0,1,24,18V30A14,14,0,0,1,10,44h-.5A4.46,4.46,0,0,1,5,39.54V8.46A4.46,4.46,0,0,1,9.46,4Z"
        transform="translate(29 48) rotate(180)"
      />
      <polyline points="36.53 6.48 31.61 10.69 34.46 17.1" />
      <path d="M43,17.1s-6.4,7.83-9.25,6.4" />
      <line x1="35.88" y1="27.9" x2="42.77" y2="32.88" />
      <line x1="38.02" y1="30.04" x2="33.75" y2="32.17" />
      <path d="M6.08,15s6.33,2.56,6.33,7.54" />
      <line x1="9.79" y1="17.33" x2="13.12" y2="13.96" />
      <line x1="8.45" y1="38.9" x2="13.12" y2="30.33" />
      <path d="M10.78,34.61s3-1.44,4.47,0" />
      <line x1="17.29" y1="4.17" x2="16.96" y2="8.27" />
      <line x1="20" y1="21.79" x2="24" y2="23.07" />
    </svg>
  );
}

export function HealtyIcon({ className = "w-8 h-8" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="24" cy="24" r="20" />
      <polygon points="38 20 28 20 28 10 20 10 20 20 10 20 10 28 20 28 20 38 28 38 28 28 38 28 38 20" />
    </svg>
  );
}

export function EarIcon({ className = "w-8 h-8" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M28.2,31.23A12.05,12.05,0,0,0,36,20q0-.51,0-1" />
      <path d="M13.75,13.76A11.93,11.93,0,0,0,12,20a2,2,0,0,1-4,0A16,16,0,1,1,30.9,34.42a9.9,9.9,0,0,1-19.8-.33l-.09-2A2,2,0,0,1,12.91,30H13a2,2,0,0,1,2,1.91l.1,2.1A5.93,5.93,0,0,0,21,40" />
      <path d="M36,19A12,12,0,0,0,21.89,8.19" />
      <path d="M18,27.5A2.5,2.5,0,1,0,20.5,25L20,20s-1-5,3-5,5,2,4,6" />
    </svg>
  );
}

export function DrugIcon({ className = "w-8 h-8" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.84,24H4V12.38A7.71,7.71,0,0,1,4.39,10a7.87,7.87,0,0,1,15.29,1.34" />
      <path d="M20,32v4.36A8,8,0,0,1,6.34,42.19,7.79,7.79,0,0,1,4,36.62V24" />
      <path d="M33.36,22,22.22,33.17,14,24.95a6.42,6.42,0,0,1-.61-.7A7.42,7.42,0,0,1,12.56,23a7.86,7.86,0,0,1,7.67-11.42,7.79,7.79,0,0,1,4.92,2.27Z" />
      <path d="M41.57,41.38a7.87,7.87,0,0,1-11.14,0l-8.22-8.22L33.36,22l8.22,8.22A7.88,7.88,0,0,1,41.57,41.38Z" />
    </svg>
  );
}

export function BandageIcon({ className = "w-8 h-8" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 4 19 4 19 23" />
      <path d="M4,4c2.18,12.37.42,33,.08,35.86A3.73,3.73,0,0,0,7.79,44H34.09A9.91,9.91,0,0,0,44,34.09V32.62A2.71,2.71,0,0,0,40.62,30C29.21,32.77,19,29.13,19,23.29" />
      <line x1="4.08" y1="39.86" x2="19.41" y2="25.23" />
      <line x1="12.35" y1="43.82" x2="21" y2="34.12" />
      <line x1="21" y1="28" x2="21" y2="44" />
      <line x1="29" y1="31.14" x2="26.14" y2="44" />
      <line x1="35.43" y1="31.14" x2="32.57" y2="44" />
      <line x1="39.67" y1="30.43" x2="40.53" y2="41.15" />
      <line x1="4.71" y1="9.71" x2="18.29" y2="11.86" />
      <line x1="5.43" y1="16.14" x2="19" y2="18.29" />
      <line x1="5.43" y1="21.86" x2="19" y2="24" />
      <line x1="14" y1="29.71" x2="4.71" y2="31.86" />
    </svg>
  );
}

export function EmergencyIcon({ className = "w-8 h-8" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon
        points="44 19 36.07 19 41.68 13.39 34.61 6.32 
                       29 11.93 29 4 19 4 19 11.93 
                       13.39 6.32 6.32 13.39 11.93 19 
                       4 19 4 29 11.93 29 6.32 34.61 
                       13.39 41.68 19 36.07 19 44 
                       29 44 29 36.07 34.61 41.68 
                       41.68 34.61 36.07 29 44 29 44 19"
      />
    </svg>
  );
}
export function ToothIcon({ className = "w-8 h-8" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15,22.29a7.85,7.85,0,0,1,2.5,2.57c1.54,2.61.73,5,1.25,5.13,1,.28,6.23-8.11,3.44-14.44-.43-1-1.45-3.27-3.44-3.53S15.22,13.68,15,13.95" />
      <path d="M15,22.29a7.85,7.85,0,0,0-2.5,2.57c-1.54,2.61-.73,5-1.25,5.13-1,.28-6.23-8.11-3.44-14.44.43-1,1.45-3.27,3.44-3.53s3.53,1.65,3.75,1.93" />
      <path d="M33,22.29a7.85,7.85,0,0,1,2.5,2.57c1.54,2.61.73,5,1.25,5.13,1,.28,6.23-8.11,3.44-14.44-.43-1-1.45-3.27-3.44-3.53S33.22,13.68,33,13.95" />
      <path d="M33,22.29a7.85,7.85,0,0,0-2.5,2.57c-1.54,2.61-.73,5-1.25,5.13-1,.28-6.23-8.11-3.44-14.44.43-1,1.45-3.27,3.44-3.53s3.53,1.65,3.75,1.93" />
      <polyline points="44 20 44 36 4 36 4 20" />
      <line x1="41" y1="20" x2="44" y2="20" />
      <line x1="4" y1="20" x2="7" y2="20" />
    </svg>
  );
}
export function Drug_Icon({ className = "w-8 h-8" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14,34l8.7,3.07a10.26,10.26,0,0,0,6.89,0l13-4.69a2.09,2.09,0,0,0,1.38-2h0a2.09,2.09,0,0,0-2.7-2L30.43,31.88" />
      <path d="M14,24.14l2.85.41a8.91,8.91,0,0,1,3.92,1.57L24,27.71l5.71.71a1.43,1.43,0,0,1,1.43,1.43h0c0,.79-.64,2.14-1.43,2.14H21" />
      <path d="M33.74,25l-6.25-6.25a4.42,4.42,0,0,1,0-6.25h0a4.42,4.42,0,0,1,6.25,0L37,15.74l3,3A4.42,4.42,0,0,1,40,25h0A4.42,4.42,0,0,1,33.74,25Z" />
      <line x1="30.99" y1="22.04" x2="37.01" y2="16.01" />
      <rect x="4" y="23" width="10" height="14" />
    </svg>
  );
}
export function ChairIcon({ className = "w-8 h-8" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="40" y1="29" x2="32" y2="29" />
      <line x1="23.16" y1="35.28" x2="16.79" y2="28.91" />
      <line x1="18.21" y1="26.09" x2="11.84" y2="19.72" />
      <line x1="9.72" y1="33.16" x2="16.09" y2="26.79" />
      <line x1="18.91" y1="28.21" x2="25.28" y2="21.84" />
      <path d="M16,16V10.57C16,5.51,12.48,4,9.38,4H5L4,5h6V4" />
      <path d="M31.28,22.86c3.76,12.06-7.82,22.94-20,17.86a15.27,15.27,0,0,1-7-7C-.16,23.21,7.44,13.05,17.42,13h.08A14.35,14.35,0,0,1,31.28,22.86Z" />
      <path d="M17.5,38a12,12,0,0,1-4.63-1A11.42,11.42,0,0,1,8,32.19a10.93,10.93,0,0,1,.72-10.44A10.53,10.53,0,0,1,27.46,24,10.6,10.6,0,0,1,26,33.71,10.41,10.41,0,0,1,17.5,38Z" />
      <path d="M16.44,28.57a1.71,1.71,0,0,1-.37-.57,1.63,1.63,0,0,1,0-1,1.56,1.56,0,0,1,1.13-1,1.5,1.5,0,0,1,1.66,2.13,1.51,1.51,0,0,1-1.13.83A1.49,1.49,0,0,1,16.44,28.57Z" />
      <circle cx="40.1" cy="38.85" r="3.9" />
      <line x1="17" y1="13" x2="37" y2="13" />
      <line x1="40" y1="39" x2="40" y2="29" />
      <path d="M17,9H30.81A3.93,3.93,0,0,1,33,9.66l3.37,2.25A3.68,3.68,0,0,1,38,15V29h6" />
    </svg>
  );
}

export const medicalIcons = [
  StethoscopeIcon,
  MicroscopIcon,
  PlasterIcon,
  HandsIcon,
  BrainIcon,
  HealtyIcon,
  EarIcon,
  DrugIcon,
  BandageIcon,
  EmergencyIcon,
  ToothIcon,
  Drug_Icon,
  ChairIcon,
];
