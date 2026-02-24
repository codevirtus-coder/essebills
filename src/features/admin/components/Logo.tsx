
import React from 'react';
import esebillsLogo from '../../../assets/esebills_logo.png';

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-10", inverted = false }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={esebillsLogo}
        alt="EseBills"
        className={`h-full w-auto object-contain ${inverted ? "brightness-0 invert" : ""}`}
      />
    </div>
  );
};

export default Logo;
