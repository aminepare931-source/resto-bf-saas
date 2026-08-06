import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Interactive3DButton } from "@/components/landing/Interactive3DButton";
import { UserCheck, KeyRound, ArrowRight, ArrowLeft, ChefHat } from "lucide-react";

export const Route = createFileRoute("/auth/staff-login")({
  component: StaffLoginPage,
});

function StaffLoginPage() {
  const [step, setStep] = useState<"scan" | "pin">("scan");
  const [staffId, setStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first PIN input when step changes to pin
  useEffect(() => {
    if (step === "pin" && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handlePinChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const [searchName, setSearchName] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const name = searchName.trim();
      if (!name) {
        toast.error("Veuillez entrer votre nom");
        return;
      }

      // Find staff by name (case insensitive, partial match) via a secure
      // RPC — une requête directe est bloquée par les policies RLS tant
      // qu'on n'est pas connecté en tant que propriétaire du restaurant.
      const { data: staffList, error } = await (supabase as any).rpc("staff_find_by_name", {
        p_name: name,
      });
      const staff = staffList?.[0] ?? null;

      if (error) {
        console.error("Erreur lors de la recherche:", error);
        toast.error(`Erreur: ${error.message}`);
        return;
      }

      if (!staff) {
        toast.error(`Nom "${name}" non trouvé. Vérifiez auprès de votre gérant.`);
        return;
      }

      if (!staff.is_active) {
        toast.error("Votre compte est désactivé. Contactez votre gérant.");
        return;
      }

      setStaffId(staff.id);
      setStaffName(staff.name);
      setStep("pin");
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async () => {
    const pinCode = pin.join("");
    if (pinCode.length !== 4 || !staffId) return;

    setLoading(true);

    try {
      // Verify PIN via une fonction sécurisée (le PIN n'est jamais exposé
      // au client, il est comparé côté serveur uniquement)
      const { data: staffList, error } = await (supabase as any).rpc("staff_verify_pin", {
        p_staff_id: staffId,
        p_pin: pinCode,
      });
      const staff = staffList?.[0] ?? null;

      if (error || !staff) {
        toast.error("Code PIN incorrect");
        setPin(["", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      // Store staff info in session
      sessionStorage.setItem("staff_id", staff.id);
      sessionStorage.setItem("staff_name", staff.name);
      sessionStorage.setItem("staff_role", staff.role);
      if (staff.restaurant_id) {
        sessionStorage.setItem("staff_restaurant_id", staff.restaurant_id);
      }

      toast.success(`Bienvenue ${staff.name} !`);

      // Redirect based on role
      if (staff.role === "cuisinier") {
        window.location.href = "/dashboard/cuisine";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("scan");
    setStaffId(null);
    setStaffName("");
    setPin(["", "", "", ""]);
  };

  if (step === "pin") {
    return (
      <AuthShell
        title={`Bonjour ${staffName}`}
        subtitle="Entrez votre PIN à 4 chiffres pour accéder à la cuisine/service"
      >
        <div className="flex flex-col gap-5">
          <div className="flex justify-center gap-3 my-2">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-16 rounded-2xl bg-[#0a0a0f] border-2 border-[#d4a853]/40 text-center text-3xl font-black text-[#f0d48a] focus:border-[#f0d48a] focus:ring-4 focus:ring-[#d4a853]/25 outline-none shadow-lg transition-all"
              />
            ))}
          </div>

          <Interactive3DButton
            onClick={handlePinSubmit}
            disabled={loading || pin.join("").length !== 4}
            variant="primary"
            size="lg"
            icon={<ArrowRight className="w-4 h-4" />}
            className="w-full shadow-[0_0_25px_rgba(212,168,83,0.35)]"
          >
            {loading ? "Vérification..." : "Accéder à ma session"}
          </Interactive3DButton>

          <button
            onClick={resetForm}
            className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Changer d'utilisateur
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Espace Staff & Cuisine"
      subtitle="Connectez-vous pour voir les commandes en direct"
    >
      <form onSubmit={handleScan} className="flex flex-col gap-4">
        <div>
          <label className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Votre prénom ou identifiant staff
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d4a853]">
              <ChefHat className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Ex: Moussa, Kader, Mariam..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-[#d4a853]/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#f0d48a] focus:ring-2 focus:ring-[#d4a853]/20 outline-none transition-all"
            />
          </div>
        </div>

        <Interactive3DButton
          type="submit"
          disabled={loading || !searchName.trim()}
          variant="primary"
          size="lg"
          icon={<ArrowRight className="w-4 h-4" />}
          className="w-full mt-2 shadow-[0_0_25px_rgba(212,168,83,0.35)]"
        >
          {loading ? "Recherche en cours..." : "Continuer vers la saisie PIN"}
        </Interactive3DButton>
      </form>

      <div className="mt-6 p-4 rounded-2xl border border-[#d4a853]/30 bg-[#d4a853]/10 flex items-start gap-3">
        <UserCheck className="w-4 h-4 text-[#f0d48a] shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80 leading-relaxed">
          <strong className="text-[#f0d48a]">Info Staff :</strong> Demandez votre nom d'affichage et
          votre code PIN à 4 chiffres à votre gérant de restaurant.
        </p>
      </div>
    </AuthShell>
  );
}
