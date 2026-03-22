import React from "react";
import { Link } from "react-router-dom";

interface HeaderActionButtonProps {
  to?: string;
  onClick?: () => void;
  icon?: React.ElementType;
  label: string;
  variant?: "link" | "button";
  className?: string;
}

const HeaderActionButton: React.FC<HeaderActionButtonProps> = ({
  to,
  onClick,
  icon: Icon,
  label,
  variant = "link",
  className = "",
}) => {
  const baseClasses =
    "flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50 transition-colors";

  if (variant === "button") {
    return (
      <Link
        to={to || "#"}
        onClick={onClick}
        className={`flex items-center justify-center w-full bg-[#129B36] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#41614F] transition-colors ${className}`}>
        {label}
      </Link>
    );
  }

  const content = (
    <>
      {Icon ? <Icon className="h-5 w-5" /> : null}
      <span>{label}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={`${baseClasses} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} w-full text-left ${className}`}>
      {content}
    </button>
  );
};

export default HeaderActionButton;
