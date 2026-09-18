"use client";

import "./GlitchText.css";

interface GlitchTextProps {
  children: string;
  /** Multiplier for animation speed — higher values slow the glitch. Default: 0.5 */
  speed?: number;
  /** Toggle the coloured red/cyan text shadows. Default: true */
  enableShadows?: boolean;
  /** Activate glitch only on hover. Default: false */
  enableOnHover?: boolean;
  /** Extra Tailwind / CSS classes on the wrapper */
  className?: string;
}

const GlitchText = ({
  children,
  speed = 0.5,
  enableShadows = true,
  enableOnHover = false,
  className = "",
}: GlitchTextProps) => {
  const inlineStyles = {
    "--after-duration": `${speed * 3}s`,
    "--before-duration": `${speed * 2}s`,
    "--after-shadow": enableShadows ? "-5px 0 red" : "none",
    "--before-shadow": enableShadows ? "5px 0 cyan" : "none",
  } as React.CSSProperties;

  const hoverClass = enableOnHover ? "enable-on-hover" : "";

  return (
    <div
      className={`glitch ${hoverClass} ${className}`.trim()}
      style={inlineStyles}
      data-text={children}
    >
      {children}
    </div>
  );
};

export default GlitchText;
