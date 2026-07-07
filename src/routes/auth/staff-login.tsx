import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

      // Find staff by name (case insensitive, partial match)
      const { data: staff, error } = await (supabase as any)
        .from("staff_members")
        .select("id, name, role, is_active")
        .ilike("name", `%${name}%`)
        .maybeSingle();

      if (error) {
        console.error("Erreur lors de la recherche:", error);
        toast.error(`Erreur: ${error.message}`);
        return;
      }

      if (!staff) {
        toast.error(`Nom "${name}" non trouvé. Vérifiez l'orthographe ou demandez à l'administrateur de vous ajouter.`);
        return;
      }

      if (!staff.is_active) {
        toast.error("Votre compte est désactivé. Contactez l'administrateur.");
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
      // Verify PIN
      const { data: staff, error } = await (supabase as any)
        .from("staff_members")
        .select("id, name, role")
        .eq("id", staffId)
        .eq("pin", pinCode)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !staff) {
        toast.error("PIN incorrect");
        setPin(["", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      // Store staff info in session
      sessionStorage.setItem("staff_id", staff.id);
      sessionStorage.setItem("staff_name", staff.name);
      sessionStorage.setItem("staff_role", staff.role);

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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gold/20 text-gold flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h1 className="text-2xl font-black mb-1">Bonjour {staffName} !</h1>
            <p className="text-sm text-muted-foreground">
              Entrez votre code PIN pour continuer
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-16 rounded-xl bg-white/[0.04] border border-white/10 text-center text-2xl font-black focus:border-gold focus:outline-none"
              />
            ))}
          </div>

          <button
            onClick={handlePinSubmit}
            disabled={loading || pin.join("").length !== 4}
            className="w-full px-5 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm disabled:opacity-50"
          >
            {loading ? "Vérification..." : "Se connecter"}
          </button>

          <button
            onClick={resetForm}
            className="w-full mt-3 px-5 py-2.5 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gold/20 text-gold flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👨‍🍳</span>
          </div>
          <h1 className="text-2xl font-black mb-1">Espace Staff</h1>
          <p className="text-sm text-muted-foreground">
            Entrez votre nom pour vous connecter
          </p>
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
              Votre nom
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
              placeholder="Ex: Jean, Kader, Fatima..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !searchName.trim()}
            className="w-full px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm disabled:opacity-50"
          >
            {loading ? "Recherche..." : "Continuer"}
          </button>
        </form>

        <div className="mt-6 p-4 rounded-xl border border-gold/30 bg-gold/5">
          <p className="text-xs text-muted-foreground">
            <strong className="text-gold">Nouveau ?</strong> Demandez votre nom d'utilisateur et PIN à l'administrateur.
          </p>
        </div>
      </div>
    </div>
  );
}