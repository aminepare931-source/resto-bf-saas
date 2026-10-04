import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

interface Interactive3DButtonProps {
  children: React.ReactNode;
  to?: string;
  href?: string;
  search?: Record<string, unknown>;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "gold-glow";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function Interactive3DButton({
  children,
  to,
  href,
  search,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  icon,
  type = "button",
  disabled = false,
}: Interactive3DButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // 3D Tilt motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  // Spotlight position inside button
  const spotX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const spotY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;

    const newRipple = { id: Date.now(), x: xPos, y: yPos };
    setRipples((prev) => [...prev.slice(-3), newRipple]);

    if (onClick) onClick();
  };

  // Variant styling — thème clair Sahelian
  const variantStyles = {
    primary:
      "bg-gradient-to-b from-[#c85a32] to-[#9f3c16] text-white font-bold shadow-[0_10px_25px_rgba(159,60,22,0.28)] border border-[#9f3c16]/60",
    "gold-glow":
      "bg-gradient-to-b from-[#1b8354] to-[#13633f] text-white font-bold shadow-[0_10px_30px_rgba(19,99,63,0.3)] border border-[#13633f]/60",
    secondary:
      "bg-card text-foreground border border-border shadow-card hover:border-terracotta/50 hover:bg-accent",
    outline:
      "bg-transparent text-foreground border border-border hover:border-terracotta/50 hover:bg-terracotta-tint",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-xs rounded-lg gap-1.5",
    md: "px-6 py-3 text-sm rounded-xl gap-2",
    lg: "px-8 py-4 text-base rounded-xl gap-2.5",
  };

  const combinedClass = `
    relative inline-flex items-center justify-center overflow-hidden transition-colors cursor-pointer select-none
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}
    ${className}
  `.trim();

  const content = (
    <>
      {/* Dynamic 3D specular highlight / spotlight glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(120px circle at ${spotX} ${spotY}, rgba(255,255,255,0.35), transparent 80%)`,
        }}
      />

      {/* Ripple effects on click */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute rounded-full bg-white/40 pointer-events-none"
          style={{
            left: r.x - 10,
            top: r.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
        {children}
        {icon && (
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
            {icon}
          </span>
        )}
      </span>
    </>
  );

  const motionProps = {
    ref: buttonRef as any,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
    style: {
      rotateX,
      rotateY,
      transformStyle: "preserve-3d" as const,
    },
    whileHover: {
      scale: 1.04,
      translateZ: 20,
    },
    whileTap: {
      scale: 0.96,
      translateZ: 0,
    },
    transition: { type: "spring", stiffness: 400, damping: 20 },
    className: `group ${combinedClass}`,
  };

  if (to) {
    return (
      <motion.div {...(motionProps as any)}>
        <Link to={to} search={search} className="w-full h-full flex items-center justify-center">
          {content}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        {...(motionProps as any)}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} disabled={disabled} {...(motionProps as any)}>
      {content}
    </motion.button>
  );
}
