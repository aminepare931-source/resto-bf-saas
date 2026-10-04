import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Modal réutilisable avec animation, backdrop flouté et fermeture au clic outside
 */
export function Modal({ open, onClose, title, children, className = "" }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Fermeture avec Echap
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl border border-border bg-card shadow-level3 p-6 animate-modal-in ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-warm hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
