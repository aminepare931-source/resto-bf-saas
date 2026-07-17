import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";

const Hero3DScene = lazy(() => import("./Hero3DScene"));

/** Empêche un crash de la scène 3D de faire tomber toute la page. */
class Hero3DErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("Hero3D a échoué, repli sur le fond statique.", error);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function canRun3D(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

    // Connexion / data saver — important pour un public mobile-first à connexion limitée
    const conn = (navigator as any).connection;
    if (conn) {
      if (conn.saveData) return false;
      if (typeof conn.effectiveType === "string" && /2g/.test(conn.effectiveType)) return false;
    }

    // RAM / CPU faibles → on évite le WebGL
    const mem = (navigator as any).deviceMemory;
    if (typeof mem === "number" && mem > 0 && mem < 4) return false;
    if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency < 4) return false;

    // Support WebGL
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return false;

    return true;
  } catch {
    return false;
  }
}

function StaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="w-48 h-48 sm:w-64 sm:h-64 rounded-full animate-float-soft"
        style={{
          background: "radial-gradient(circle, rgba(212,168,83,0.35) 0%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}

export function Hero3D() {
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(canRun3D());
  }, []);

  if (!mounted) return <div className="w-full h-full" aria-hidden="true" />;
  if (!enabled) return <StaticFallback />;

  return (
    <Hero3DErrorBoundary fallback={<StaticFallback />}>
      <Suspense fallback={<StaticFallback />}>
        <Hero3DScene />
      </Suspense>
    </Hero3DErrorBoundary>
  );
}
