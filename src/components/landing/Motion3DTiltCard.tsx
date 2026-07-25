import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useRef } from "react";

interface Motion3DTiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  maxRotate?: number;
  scaleOnHover?: number;
  delay?: number;
}

export function Motion3DTiltCard({
  children,
  className = "",
  glowColor = "rgba(212,168,83,0.3)",
  maxRotate = 10,
  scaleOnHover = 1.02,
  delay = 0,
}: Motion3DTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${maxRotate}deg`, `-${maxRotate}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${maxRotate}deg`, `${maxRotate}deg`]);

  // Spotlight effect
  const spotX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const spotY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
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

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30, rotateX: 5 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      whileHover={{
        scale: scaleOnHover,
        translateZ: 15,
      }}
      className={`relative group rounded-xl border border-border bg-[#111118]/90 backdrop-blur-md overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Specular spotlight following cursor */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(300px circle at ${spotX} ${spotY}, ${glowColor}, transparent 80%)`,
        }}
      />

      {/* Golden top border accent line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4a853]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Card Content with 3D Z translation */}
      <div className="relative z-20 h-full" style={{ transform: "translateZ(10px)" }}>
        {children}
      </div>
    </motion.div>
  );
}
