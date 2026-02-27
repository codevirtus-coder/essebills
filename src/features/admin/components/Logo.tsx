
import React from 'react';
import { Link } from 'react-router-dom';
import esebillsLogo from '../../../assets/esebills_logo.png';
import { ROUTE_PATHS } from '../../../router/paths';

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-10", inverted = false }) => {
  return (
    <Link to={ROUTE_PATHS.home} aria-label="Go to home page" className={`flex items-center ${className}`}>
      <img
        src={esebillsLogo}
        alt="EseBills"
        className={`h-full w-auto object-contain ${inverted ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
};

export default Logo;
