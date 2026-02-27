import React from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../router/paths";
import Logo from "../../../components/ui/Logo";

interface BillerLogoProps {
  className?: string;
  inverted?: boolean;
}

const BillerLogo: React.FC<BillerLogoProps> = ({
  className = "h-10",
  inverted = false,
}) => {
  return (
    <Link to={ROUTE_PATHS.home} aria-label="Go to home page" className={`flex items-center ${className}`}>
      <Logo className={className} inverted={inverted} />
    </Link>
  );
};

export default BillerLogo;
