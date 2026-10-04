import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { useStaffRole } from "@/hooks/use-staff-role";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { toast } from "sonner";
import {
  Send,
  ChefHat,
  Utensils,
  Pin,
  Search,
  Sparkles,
  CheckCircle2,
  Volume2,
  VolumeX,
  MessageSquare,
  ShieldAlert,
  CreditCard,
  RefreshCw,
  Flame,
  ThumbsUp,
  Heart,
  AlertTriangle,
  Hash,
  Crown,
  ChevronDown,
  Megaphone,
  Fish,
  Receipt,
  Zap,
  Smartphone,
  Banknote,
  Beer,
  Clock,
  LifeBuoy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ChatMessage, StaffRole } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/chat")({
  component: ChatPage,
});

type ChannelId = "general" | "cuisine" | "service" | "caisse" | "urgences";

interface ChannelInfo {
  id: ChannelId;
  name: string;
  icon: LucideIcon;
  badge: string;
  desc: string;
}

const CHANNELS: ChannelInfo[] = [
  {
    id: "general",
    name: "Général",
    icon: MessageSquare,
    badge: "Équipe",
    desc: "Discussion globale de l'établissement",
  },
  {
    id: "cuisine",
    name: "Cuisine & KDS",
    icon: ChefHat,
    badge: "Chef",
    desc: "Suivi des plats, cuissons et ruptures",
  },
  {
    id: "service",
    name: "Service Salle",
    icon: Utensils,
    badge: "Serveurs",
    desc: "Coordination des tables et additions",
  },
  {
    id: "caisse",
    name: "Caisse & Ventes",
    icon: CreditCard,
    badge: "Caisse",
    desc: "Règlements, Mobile Money et reçus",
  },
  {
    id: "urgences",
    name: "Urgences",
    icon: ShieldAlert,
    badge: "Prio 1",
    desc: "Alerte stock, retards et litiges clients",
  },
];

// Couleurs d'avatar par rôle (le nom réel vient de la base de données)
const ROLE_AVATAR_BG: Record<string, string> = {
  admin: "bg-amber-tint text-amber-deep border-amber-brand/40",
  cuisinier: "bg-terracotta-tint text-terracotta-deep border-terracotta/40",
  serveur: "bg-emerald-tint text-emerald-deep border-emerald/40",
  manager: "bg-charcoal/5 text-charcoal border-charcoal/20",
};
const ROLE_TITLE: Record<string, string> = {
  admin: "Administrateur",
  cuisinier: "Cuisinier",
  serveur: "Serveur",
  manager: "Manager",
};

const REACTIONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "thumbsup", label: "Pouce levé", Icon: ThumbsUp },
  { key: "fire", label: "Au feu", Icon: Flame },
  { key: "check", label: "Validé", Icon: CheckCircle2 },
  { key: "heart", label: "Coeur", Icon: Heart },
];
const REACTION_MAP: Record<string, LucideIcon> = Object.fromEntries(
  REACTIONS.map((r) => [r.key, r.Icon] as [string, LucideIcon]),
);

const QUICK_PINGS: Record<ChannelId, { label: string; text: string; icon: LucideIcon }[]> = {
  general: [
    {
      label: "Briefing",
      text: "Briefing d'équipe à 18h30 avant le grand service du soir !",
      icon: Megaphone,
    },
    {
      label: "Bravo",
      text: "Excellent travail de toute l'équipe sur le service de ce midi !",
      icon: ThumbsUp,
    },
    { label: "VIP", text: "Groupe VIP de 10 personnes réservé pour 20h00.", icon: Crown },
  ],
  cuisine: [
    {
      label: "CMD Prête",
      text: "Commande #108 (Poulet Bicyclette) prête au passe !",
      icon: Flame,
    },
    {
      label: "Capitaine",
      text: "Stock de Capitaine grillé au feu de bois réapprovisionné.",
      icon: Fish,
    },
    { label: "Rupture", text: "Rupture temporaire sur les frites d'alloco.", icon: AlertTriangle },
  ],
  service: [
    { label: "Addition", text: "Addition demandée Table N° 4 (Orange Money).", icon: Receipt },
    {
      label: "Table N°2",
      text: "Client Table N° 2 demande de l'eau fraîche et des verres.",
      icon: Zap,
    },
    {
      label: "Nettoyée",
      text: "Table N° 5 nettoyée, libre et prête pour le prochain client.",
      icon: CheckCircle2,
    },
  ],
  caisse: [
    {
      label: "OM Reçu",
      text: "Paiement Orange Money de 14.500 FCFA validé pour CMD-107.",
      icon: CreditCard,
    },
    { label: "Moov Reçu", text: "Paiement Moov Money de 8.500 FCFA confirmé.", icon: Smartphone },
    { label: "Espèces", text: "Encaissement espèces effectué Table N° 3.", icon: Banknote },
  ],
  urgences: [
    {
      label: "Alerte Stock",
      text: "Urgence : plus de bière Brakina 65cl fraîche en réserve !",
      icon: Beer,
    },
    { label: "Retard", text: "Retard de 15 min sur la commande de la Table N° 1.", icon: Clock },
    {
      label: "Assistance",
      text: "Besoin d'aide renforcée en salle au niveau de la terrasse !",
      icon: LifeBuoy,
    },
  ],
};



export function ChatPage() {
  const { restaurant: r } = useMyRestaurant();
  const { staff } = useStaffRole();
  const [activeChannel, setActiveChannel] = useState<ChannelId>("general");
  const [messages, setMessages] = useState<
    (ChatMessage & { channel?: ChannelId; reactions?: Record<string, number> })[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Profils réels du restaurant (vous + votre staff enregistré dans Personnel)
  type Profile = { role: StaffRole; name: string; avatarBg: string; title: string };
  const [profiles, setProfiles] = useState<Profile[]>([
    { role: "admin", name: "Vous", avatarBg: ROLE_AVATAR_BG.admin, title: "Administrateur" },
  ]);

  useEffect(() => {
    if (!r) return;
    (async () => {
      const { data } = await supabase
        .from("staff_members")
        .select("name, role")
        .eq("restaurant_id", r.id)
        .eq("is_active", true);

      const ownerProfile: Profile = {
        role: "admin",
        name: r.name ? `Vous (${r.name})` : "Vous",
        avatarBg: ROLE_AVATAR_BG.admin,
        title: "Administrateur",
      };

      const staffProfiles: Profile[] = (data || []).map((s: any) => ({
        role: (s.role as StaffRole) || "serveur",
        name: s.name,
        avatarBg: ROLE_AVATAR_BG[s.role] || ROLE_AVATAR_BG.serveur,
        title: ROLE_TITLE[s.role] || "Staff",
      }));

      setProfiles([ownerProfile, ...staffProfiles]);
    })();
  }, [r?.id]);

  // Active staff profile selection
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);
  const activeProfile = profiles[activeProfileIndex] || profiles[0];

  // Pinned Notice Board
  const [noticeBoard, setNoticeBoard] = useState(
    "Aucune note épinglée pour le moment. Cliquez sur « Éditer la note » pour en ajouter une pour votre équipe.",
  );
  const [editingNotice, setEditingNotice] = useState(false);
  const [noticeDraft, setNoticeDraft] = useState(noticeBoard);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Web Audio chime generator
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // AudioContext blocked by autoplay policy
    }
  };

  // Load messages from Supabase or LocalStorage
  useEffect(() => {
    let cancelled = false;
    const localKey = `restobf_chat_${r?.id || "demo"}`;

    (async () => {
      let fetchedMsgs: any[] = [];
      if (r?.id) {
        try {
          const staffId =
            typeof window !== "undefined" ? sessionStorage.getItem("staff_id") : null;

          if (staffId) {
            // Session staff (pas de compte Supabase) → fonction sécurisée
            const { data, error } = await (supabase as any).rpc("staff_read_chat", {
              p_staff_id: staffId,
              p_restaurant_id: r.id,
            });
            if (!error && data && data.length > 0) fetchedMsgs = data;
          } else {
            // Propriétaire connecté avec son vrai compte
            const { data, error } = await supabase
              .from("chat_messages" as never)
              .select("*")
              .eq("restaurant_id", r.id)
              .order("created_at", { ascending: true })
              .limit(100);
            if (!error && data && data.length > 0) fetchedMsgs = data;
          }
        } catch (err) {
          console.warn("Error fetching Supabase chat:", err);
        }
      }

      if (!cancelled) {
        if (fetchedMsgs.length > 0) {
          setMessages(fetchedMsgs);
        } else {
          // Check local storage (messages réellement envoyés depuis cet appareil)
          const stored = localStorage.getItem(localKey);
          if (stored) {
            try {
              setMessages(JSON.parse(stored));
            } catch {
              setMessages([]);
            }
          } else {
            setMessages([]);
          }
        }
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [r?.id]);

  // Persist local state backup
  useEffect(() => {
    const localKey = `restobf_chat_${r?.id || "demo"}`;
    if (messages.length > 0) {
      localStorage.setItem(localKey, JSON.stringify(messages));
    }
  }, [messages, r?.id]);

  // Supabase Realtime Subscription
  useRealtimeSubscription<ChatMessage>({
    table: "chat_messages",
    restaurantId: r?.id || "",
    enabled: !!r?.id,
    onInsert: (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        playChime();
        return [...prev, msg];
      });
    },
    onUpdate: (updated) => {
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    },
    onDelete: (old) => {
      setMessages((prev) => prev.filter((m) => m.id !== old.id));
    },
  });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeChannel]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || newMessage).trim();
    if (!text || sending) return;

    if (!textToSend) setNewMessage("");
    setSending(true);

    const newMsgObj: ChatMessage & { channel?: ChannelId; reactions?: Record<string, number> } = {
      id: `msg-${Date.now()}`,
      restaurant_id: r?.id || "demo",
      sender_name: activeProfile.name,
      sender_role: activeProfile.role,
      message: text,
      read: false,
      created_at: new Date().toISOString(),
      channel: activeChannel,
      reactions: {},
    };

    // Optimistic UI insert
    setMessages((prev) => [...prev, newMsgObj]);
    playChime();

    // Supabase insert attempt
    if (r?.id) {
      try {
        const staffId =
          typeof window !== "undefined" ? sessionStorage.getItem("staff_id") : null;

        if (staffId) {
          await (supabase as any).rpc("staff_send_chat", {
            p_staff_id: staffId,
            p_restaurant_id: r.id,
            p_message: text,
            p_sender_name: activeProfile.name,
            p_sender_role: activeProfile.role,
          });
        } else {
          await supabase.from("chat_messages" as never).insert({
            restaurant_id: r.id,
            sender_name: activeProfile.name,
            sender_role: activeProfile.role,
            message: text,
            read: false,
          });
        }
      } catch (err) {
        console.warn("Supabase insert silent failover to local:", err);
      }
    }

    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddReaction = (msgId: string, key: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const reactions = { ...(m.reactions || {}) };
        reactions[key] = (reactions[key] || 0) + 1;
        return { ...m, reactions };
      }),
    );
    toast.success("Réaction ajoutée");
  };

  const handleSaveNotice = () => {
    setNoticeBoard(noticeDraft);
    setEditingNotice(false);
    toast.success("Note de service mise à jour !");
  };

  // Filter messages by channel & search query
  const channelMessages = useMemo(() => {
    return messages.filter((m) => {
      const matchChannel = (m.channel || "general") === activeChannel;
      if (!searchQuery.trim()) return matchChannel;
      const q = searchQuery.toLowerCase();
      const matchText =
        m.message.toLowerCase().includes(q) || m.sender_name.toLowerCase().includes(q);
      return matchChannel && matchText;
    });
  }, [messages, activeChannel, searchQuery]);

  // Unread badge simulation per channel
  const unreadPerChannel = useMemo(() => {
    const counts: Record<ChannelId, number> = {
      general: 0,
      cuisine: 0,
      service: 0,
      caisse: 0,
      urgences: 0,
    };
    messages.forEach((m) => {
      const ch = (m.channel || "general") as ChannelId;
      if (ch !== activeChannel) {
        counts[ch] = (counts[ch] || 0) + 1;
      }
    });
    return counts;
  }, [messages, activeChannel]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 overflow-x-hidden">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 rounded-3xl border border-terracotta/30 bg-gradient-to-r from-terracotta-tint via-card to-card shadow-sm">
        <div className="space-y-1 min-w-0">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-tint border border-terracotta/30 text-xs font-bold text-terracotta-deep">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>Messagerie Équipe Temps Réel</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-foreground truncate">
            Chat Interne —{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta via-amber-brand to-terracotta-deep">
              {r?.name || "Votre Restaurant"}
            </span>
          </h1>

          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="hidden sm:inline">Communication Cuisine, Salle, Caisse & Direction</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-emerald-deep font-bold inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              Direct Connecté
            </span>
          </p>
        </div>

        {/* Top Control Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              soundEnabled
                ? "border-emerald/40 bg-emerald-tint text-emerald-deep"
                : "border-border bg-surface-warm text-muted-foreground hover:text-foreground"
            }`}
            title={soundEnabled ? "Sons activés" : "Sons désactivés"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "Sons On" : "Sons Mute"}</span>
          </button>
        </div>
      </div>

      {/* STAFF PROFILE SWITCHER (SIMULATE WHO IS SENDING) */}
      <div className="p-3 sm:p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 min-w-0">
            <Crown className="w-3.5 h-3.5 text-terracotta shrink-0" />
            <span className="truncate">Vous émettez en tant que :</span>
          </span>
          <span className="hidden sm:inline text-[11px] text-terracotta-deep italic shrink-0">
            Cliquez pour basculer de rôle
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {profiles.map((prof, idx) => {
            const isActive = activeProfileIndex === idx;
            return (
              <button
                key={prof.name}
                onClick={() => setActiveProfileIndex(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 min-w-0 ${
                  isActive
                    ? "border-terracotta bg-terracotta-tint text-foreground shadow-sm scale-[1.02]"
                    : "border-border bg-surface-warm text-muted-foreground hover:border-terracotta/40"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center font-black text-xs shrink-0 ${prof.avatarBg}`}
                >
                  {prof.name[0]}
                </div>
                <div className="min-w-0">
                  <strong className="block text-xs truncate font-bold text-foreground">
                    {prof.name}
                  </strong>
                  <span className="text-[10px] text-muted-foreground truncate block">
                    {prof.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PINNED NOTICE BOARD */}
      <div className="p-4 rounded-2xl border border-amber-brand/40 bg-gradient-to-r from-amber-tint via-card to-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-tint border border-amber-brand/40 text-amber-deep flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Pin className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            {editingNotice ? (
              <div className="space-y-2">
                <textarea
                  value={noticeDraft}
                  onChange={(e) => setNoticeDraft(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-card border border-border text-xs text-foreground focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/20 focus:outline-none transition-all"
                  rows={2}
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setEditingNotice(false)}
                    className="px-3 py-1 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-surface-warm transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveNotice}
                    className="px-3 py-1 rounded-lg bg-terracotta text-white hover:bg-terracotta-deep transition-colors text-xs font-bold"
                  >
                    Enregistrer Note
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-foreground font-medium leading-relaxed italic">
                {noticeBoard}
              </p>
            )}
          </div>
        </div>

        {!editingNotice && (
          <button
            onClick={() => {
              setNoticeDraft(noticeBoard);
              setEditingNotice(true);
            }}
            className="text-[11px] text-terracotta-deep hover:underline shrink-0 font-bold self-end sm:self-center"
          >
            Éditer la note
          </button>
        )}
      </div>

      {/* MAIN CHAT APPLICATION LAYOUT (CHANNELS SIDEBAR + MESSAGE CONTAINER) */}
      <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 items-start min-w-0">
        {/* LEFT COLUMN: CHANNELS NAVIGATION (4 COLS) — après le chat sur mobile */}
        <div className="order-2 lg:order-1 lg:col-span-4 space-y-3 min-w-0 w-full">
          {/* Mobile: chips horizontales compactes */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              const isActive = activeChannel === ch.id;
              const unread = unreadPerChannel[ch.id];
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`shrink-0 px-3 py-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "border-terracotta/60 bg-terracotta-tint text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{ch.name}</span>
                  {unread > 0 && !isActive && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald text-white text-[9px] font-bold">
                      +{unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop: liste complète avec description */}
          <div className="hidden lg:block p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-terracotta" />
                <span>Canaux de Discussion</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-surface-warm text-muted-foreground font-bold">
                5 Salles
              </span>
            </div>

            <div className="space-y-1">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const isActive = activeChannel === ch.id;
                const unread = unreadPerChannel[ch.id];

                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isActive
                        ? "border-terracotta/60 bg-terracotta-tint text-foreground shadow-sm"
                        : "border-transparent hover:bg-surface-warm text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-2 rounded-lg ${isActive ? "bg-terracotta text-white" : "bg-surface-warm text-muted-foreground"}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <strong className="block text-xs font-extrabold text-foreground truncate">
                          {ch.name}
                        </strong>
                        <span className="text-[10px] text-muted-foreground truncate block">
                          {ch.desc}
                        </span>
                      </div>
                    </div>

                    {unread > 0 && !isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald text-white text-[10px] font-bold">
                        +{unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUICK PINGS / MACROS BOX — repliable sur mobile */}
          <details className="lg:hidden group rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <summary className="p-3.5 cursor-pointer list-none flex items-center justify-between text-xs font-extrabold text-terracotta-deep uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                <span>Réponses rapides</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-3.5 pb-3.5 flex flex-col gap-1.5">
              {QUICK_PINGS[activeChannel]?.map((ping) => {
                const PingIcon = ping.icon;
                return (
                  <button
                    key={ping.label}
                    onClick={() => handleSendMessage(ping.text)}
                    className="p-2.5 rounded-xl border border-border bg-surface-warm hover:border-terracotta/50 transition-colors text-left flex items-center gap-2 text-xs text-foreground cursor-pointer"
                  >
                    <PingIcon className="w-4 h-4 text-terracotta shrink-0" />
                    <div className="min-w-0 flex-1">
                      <strong className="block font-bold text-[11px] text-terracotta-deep">
                        {ping.label}
                      </strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </details>

          {/* Desktop: liste toujours visible */}
          <div className="hidden lg:block p-4 rounded-2xl border border-border bg-card shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-terracotta-deep uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              <span>Envoi Rapide (Pings 1-Clic)</span>
            </h4>

            <div className="flex flex-col gap-1.5">
              {QUICK_PINGS[activeChannel]?.map((ping) => {
                const PingIcon = ping.icon;
                return (
                  <button
                    key={ping.label}
                    onClick={() => handleSendMessage(ping.text)}
                    className="p-2.5 rounded-xl border border-border bg-surface-warm hover:border-terracotta/50 hover:bg-terracotta-tint transition-colors text-left flex items-center gap-2 text-xs text-foreground cursor-pointer group"
                  >
                    <PingIcon className="w-4 h-4 text-terracotta group-hover:scale-110 transition-transform shrink-0" />
                    <div className="min-w-0 flex-1">
                      <strong className="block font-bold text-[11px] text-terracotta-deep">
                        {ping.label}
                      </strong>
                      <span className="text-[10px] text-muted-foreground truncate block">
                        {ping.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT CONVERSATION VIEW (8 COLS) — en premier sur mobile */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-4 min-w-0 w-full">
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-[75vh] max-h-[560px] lg:h-[620px] lg:max-h-none">
            {/* CHAT HEADER */}
            <div className="p-3 sm:p-4 border-b border-border bg-surface-warm flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-terracotta-tint border border-terracotta/40 text-terracotta-deep flex items-center justify-center font-bold shrink-0">
                  #
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider truncate">
                    {CHANNELS.find((c) => c.id === activeChannel)?.name}
                  </h3>
                  <p className="hidden sm:block text-[11px] text-muted-foreground truncate">
                    {CHANNELS.find((c) => c.id === activeChannel)?.desc}
                  </p>
                </div>
              </div>

              {/* SEARCH IN CHAT */}
              <div className="relative w-24 sm:w-48 shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-2.5 sm:left-3 top-2.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 rounded-xl bg-card border border-border text-[11px] sm:text-xs text-foreground placeholder:text-muted-foreground focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* MESSAGES LIST AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-warm">
              {loading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2 text-terracotta" />
                  Chargement des discussions...
                </div>
              ) : channelMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-center p-6">
                  <div className="space-y-2">
                    <MessageSquare className="w-10 h-10 mx-auto opacity-40 text-terracotta" />
                    <p className="text-sm font-bold text-foreground">Aucun message dans ce canal</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Soyez le premier à envoyer une information ou cliquez sur les pings rapides
                      ci-contre.
                    </p>
                  </div>
                </div>
              ) : (
                channelMessages.map((msg) => {
                  const isMe = msg.sender_name === activeProfile.name;
                  const roleObj =
                    profiles.find((p) => p.role === msg.sender_role) || profiles[0];

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${roleObj.avatarBg}`}
                      >
                        {msg.sender_name[0]}
                      </div>

                      {/* Bubble */}
                      <div className={`space-y-1 ${isMe ? "text-right" : ""}`}>
                        <div className="flex items-center gap-2 flex-wrap text-[11px]">
                          <span className="font-extrabold text-foreground">{msg.sender_name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-charcoal/5 text-[9px] text-muted-foreground font-semibold">
                            {msg.sender_role}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md relative group ${
                            isMe
                              ? "bg-terracotta text-white font-medium rounded-tr-none"
                              : "bg-card border border-border text-foreground rounded-tl-none"
                          }`}
                        >
                          {msg.message}

                          {/* Quick Reactions bar hover */}
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-card border border-border p-1 rounded-full shadow-lg z-20 ${isMe ? "-left-24" : "-right-24"}`}
                          >
                            {REACTIONS.map(({ key, Icon }) => (
                              <button
                                key={key}
                                onClick={() => handleAddReaction(msg.id, key)}
                                className="p-1 text-muted-foreground hover:text-terracotta hover:scale-110 transition-transform"
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Display existing reactions */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div
                            className={`flex items-center gap-1 pt-1 ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            {Object.entries(msg.reactions).map(([key, cnt]) => {
                              const Icon = REACTION_MAP[key];
                              if (!Icon) return null;
                              return (
                                <span
                                  key={key}
                                  className="px-2 py-0.5 rounded-full bg-card border border-border text-[10px] text-foreground flex items-center gap-1"
                                >
                                  <Icon className="w-3 h-3 text-terracotta" />
                                  <span className="font-bold">{cnt}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT INPUT FOOTER */}
            <div className="p-3 sm:p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Écrire un message..."
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-surface-warm border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/20 transition-all"
                  disabled={sending}
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 sm:px-5 py-3 rounded-xl bg-terracotta text-white hover:bg-terracotta-deep font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-colors shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Envoyer</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                <span>Appuyez sur Entrée pour envoyer</span>
                <span>Canal actif : #{activeChannel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
