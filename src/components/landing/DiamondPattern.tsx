import * as React from "react";

/**
 * Motif losanges imbriqués (inspiration wax / bogolan) — SVG vectoriel, net à toute taille.
 * `fade` estompe le motif vers les bords pour qu'il se fonde dans le fond.
 */
export function DiamondPattern({
  color = "#c4420f",
  opacity = 0.18,
  tile = 64,
  className,
  style,
  fade,
}: {
  color?: string;
  opacity?: number;
  tile?: number;
  className?: string;
  style?: React.CSSProperties;
  fade?: string; // valeur CSS de mask-image (ex: "linear-gradient(...)")
}) {
  const id = React.useId().replace(/:/g, "");
  const h = tile / 2;
  const mask = fade ? { maskImage: fade, WebkitMaskImage: fade } : {};
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={{ pointerEvents: "none", ...mask, ...style }}
      width="100%"
      height="100%"
    >
      <defs>
        <pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth="2.2" opacity={opacity * 5}>
            <path d={`M${h} 3 L${tile - 3} ${h} L${h} ${tile - 3} L3 ${h} Z`} />
            <path d={`M${h} ${h - 13} L${h + 13} ${h} L${h} ${h + 13} L${h - 13} ${h} Z`} />
          </g>
          <circle cx={h} cy={h} r="3" fill={color} opacity={opacity * 5} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
