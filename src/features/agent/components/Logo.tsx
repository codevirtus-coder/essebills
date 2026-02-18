import React from "react";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span className="text-[#7a5ac5] text-[2rem] leading-none font-black italic tracking-tight">
        EseBills
      </span>
      <span className="h-[3px] w-[76px] rounded-full bg-[#9fe23d]" />
    </div>
  );
};

export default Logo;

