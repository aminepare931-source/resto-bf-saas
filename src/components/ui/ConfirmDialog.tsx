import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

/**
 * Boîte de dialogue de confirmation réutilisable
 * Remplace les confirm() natifs par une UI stylée
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: {
      icon: "text-destructive",
      button:
        "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/15",
    },
    warning: {
      icon: "text-amber-deep",
      button: "bg-amber-tint text-amber-deep border-amber-brand/30 hover:bg-amber-brand/20",
    },
    info: {
      icon: "text-gold",
      button: "bg-accent text-accent-foreground border-gold/30 hover:bg-gold/15",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="text-center">
        <div
          className={`w-12 h-12 rounded-full ${styles.icon} bg-current/10 flex items-center justify-center mx-auto mb-4`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-input text-sm font-semibold hover:bg-surface-warm transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-2 disabled:opacity-50 ${styles.button}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Suppression...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
