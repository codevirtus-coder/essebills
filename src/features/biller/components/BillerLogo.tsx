import React from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../router/paths";

interface BillerLogoProps {
  className?: string;
  inverted?: boolean;
}

const BillerLogo: React.FC<BillerLogoProps> = ({
  className = "h-10",
  inverted = false,
}) => {
  const primaryColor = inverted ? "#ffffff" : "#7e56c2";
  const accentColor = "#a3e635";

  return (
    <Link to={ROUTE_PATHS.home} aria-label="Go to home page" className={`flex flex-col items-start ${className}`}>
      <svg
        viewBox="0 0 120 45"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto overflow-visible"
      >
        <text
          x="0"
          y="28"
          fill={primaryColor}
          className="italic font-extrabold select-none"
          style={{ font: "italic 800 26px Manrope, sans-serif" }}
        >
          EseBills
        </text>
        <path
          d="M28 36.5C45 34.5 85 34.5 112 34.5"
          stroke={accentColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          className="drop-shadow-sm"
        />
      </svg>
    </Link>
  );
};

export default BillerLogo;
