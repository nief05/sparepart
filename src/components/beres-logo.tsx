import * as React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  theme?: "dark" | "light" | "auto";
}

/**
 * Beres.in Brand Icon Mark
 * Gear cogwheel on left fused with 'B' and upward arrow cutout
 */
export function BeresIconMark({
  size = 36,
  className = "",
  ...props
}: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Outer Gear Teeth & Letter B Combined Path */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32 10C30 10 28 10.3 26 10.8V17.5C23.6 18.5 21.4 19.9 19.4 21.6L14.2 17.4C11.5 20.3 9.3 23.7 7.7 27.5L13.1 31.6C12.3 34 11.8 36.5 11.6 39.1L5 40.5C4.7 42.6 4.6 44.8 4.6 47C4.6 49.2 4.7 51.4 5 53.5L11.6 54.9C11.8 57.5 12.3 60 13.1 62.4L7.7 66.5C9.3 70.3 11.5 73.7 14.2 76.6L19.4 72.4C21.4 74.1 23.6 75.5 26 76.5V83.2C28 83.7 30 84 32 84V90H46C65.879 90 82 78.807 82 65C82 56.467 76.848 49.034 68.868 45.184C74.52 41.524 78 35.632 78 29C78 18.507 63.673 10 46 10H32ZM32 24H45C54.941 24 63 28.029 63 33C63 37.971 54.941 42 45 42H32V24ZM32 50H46C56.493 50 65 54.477 65 60C65 65.523 56.493 70 46 70H32V50Z"
        fill="currentColor"
      />
      {/* Upward Arrow Cutout inside Lower Stem */}
      <path
        d="M32 90V62L41 71L46 66L32 52L18 66L23 71L32 62V90H32Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * Full Beres.in Brand Logo (Icon Mark + Typography)
 */
export function BeresLogo({
  className = "",
  markSize = 34,
  variant = "default",
}: {
  className?: string;
  markSize?: number;
  variant?: "default" | "white" | "dark";
}) {
  const isWhite = variant === "white";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="shrink-0 text-[#002D62] dark:text-[#00A896]">
        {isWhite ? (
          <div className="text-white">
            <BeresIconMark size={markSize} />
          </div>
        ) : (
          <BeresIconMark size={markSize} />
        )}
      </div>
      <div className="flex items-baseline leading-none font-sans">
        <span
          className={`font-black text-2xl sm:text-[26px] tracking-tight ${
            isWhite ? "text-white" : "text-[#002D62] dark:text-white"
          }`}
        >
          Beres
        </span>
        <span className="font-bold text-2xl sm:text-[26px] text-[#00A896]">
          .in
        </span>
      </div>
    </div>
  );
}
