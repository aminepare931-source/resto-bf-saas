import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { useStaffRole } from "@/hooks/use-staff-role";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { toast } from "sonner";
import {
  Send,
  Users,
  User,
  ChefHat,
  Utensils,
  Pin,
  Bell,
  Search,
  Sparkles,
  Check,
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
  Smile,
  Hash,
  Crown,
  Share2,
  ChevronDown,
} from "lucide-react";
import type { ChatMessage, StaffRole } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/chat")({
  component: ChatPage,
});

type ChannelId = "general" | "cuisine" | "service" | "caisse" | "urgences";

interface ChannelInfo {
  id: ChannelId;
  name: string;
  icon: any;
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

const STAFF_PROFILES: { role: StaffRole; name: string; avatarBg: string; title: string }[] = [
  {
    role: "admin",
    name: "Mamadou (Gérant)",
    avatarBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    title: "Admin & Direction",
  },
  {
    role: "cuisinier",
    name: "Chef Ousmane",
    avatarBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    title: "Chef Cuisinier",
  },
  {
    role: "serveur",
    name: "Awa (Table N°1-6)",
    avatarBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    title: "Serveuse Senior",
  },
  {
    role: "manager",
    name: "Kader (Barman/Caissier)",
    avatarBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    title: "Manager de Salle",
  },
];

const QUICK_PINGS: Record<ChannelId, { label: string; text: string; icon: string }[]> = {
  general: [
    {
      label: "Briefing",
      text: "📢 Briefing d'équipe à 18h30 avant le grand service du soir !",
      icon: "📢",
    },
    {
      label: "Bravo",
      text: "👏 Excellent travail de toute l'équipe sur le service de ce midi !",
      icon: "👏",
    },
    { label: "VIP", text: "👑 Groupe VIP de 10 personnes réservé pour 20h00.", icon: "👑" },
  ],
  cuisine: [
    {
      label: "CMD Prête",
      text: "🔥 Commande #108 (Poulet Bicyclette) prête au passe !",
      icon: "🔥",
    },
    {
      label: "Capitaine",
      text: "🐟 Stock de Capitaine grillé au feu de bois réapprovisionné.",
      icon: "🐟",
    },
    { label: "Rupture", text: "⚠️ Rupture temporaire sur les frites d'alloco.", icon: "⚠️" },
  ],
  service: [
    { label: "Addition", text: "🧾 Addition demandée Table N° 4 (Orange Money).", icon: "🧾" },
    {
      label: "Table N°2",
      text: "⚡ Client Table N° 2 demande de l'eau fraîche et des verres.",
      icon: "⚡",
    },
    {
      label: "Nettoyée",
      text: "✅ Table N° 5 nettoyée, libre et prête pour le prochain client.",
      icon: "✅",
    },
  ],
  caisse: [
    {
      label: "OM Reçu",
      text: "💳 Paiement Orange Money de 14.500 FCFA validé pour CMD-107.",
      icon: "💳",
    },
    { label: "Moov Reçu", text: "📱 Paiement Moov Money de 8.500 FCFA confirmé.", icon: "📱" },
    { label: "Espèces", text: "💵 Encaissement espèces effectué Table N° 3.", icon: "💵" },
  ],
  urgences: [
    {
      label: "Alerte Stock",
      text: "🧊 Urgence : Plus de bière Brakina 65cl fraîche en réserve !",
      icon: "🧊",
    },
    { label: "Retard", text: "⏱️ Retard de 15 min sur la commande de la Table N° 1.", icon: "⏱️" },
    {
      label: "Assistance",
      text: "🆘 Besoin d'aide renforcée en salle au niveau de la terrasse !",
      icon: "🆘",
    },
  ],
};

const INITIAL_MESSAGES: (ChatMessage & {
  channel?: ChannelId;
  reactions?: Record<string, number>;
})[] = [
  {
    id: "msg-1",
    restaurant_id: "demo",
    sender_name: "Mamadou (Gérant)",
    sender_role: "admin",
    message:
      "Bienvenue sur le chat interne RestoBF ! N'oubliez pas d'utiliser les pings rapides pour fluidifier le service entre la cuisine et les tables.",
    read: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    channel: "general",
    reactions: { "👍": 4, "🔥": 2 },
  },
  {
    id: "msg-2",
    restaurant_id: "demo",
    sender_name: "Chef Ousmane",
    sender_role: "cuisinier",
    message:
      "Le poulet bicyclette flambé est prêt. Pensez à proposer du piment frais maison aux clients.",
    read: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    channel: "cuisine",
    reactions: { "🔥": 3 },
  },
  {
    id: "msg-3",
    restaurant_id: "demo",
    sender_name: "Awa (Table N°1-6)",
    sender_role: "serveur",
    message: "Reçu Chef ! Table N°4 demande si la livraison en zone ZI est partie.",
    read: true,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    channel: "service",
    reactions: { "✅": 2 },
  },
  {
    id: "msg-4",
    restaurant_id: "demo",
    sender_name: "Kader (Barman/Caissier)",
    sender_role: "manager",
    message: "Le paiement Orange Money de la Table N°4 est validé (14.000 FCFA).",
    read: true,
    created_at: new Date(Date.now() - 600000).toISOString(),
    channel: "caisse",
    reactions: { "👍": 1 },
  },
];

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

  // Active staff profile selection
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);
  const activeProfile = STAFF_PROFILES[activeProfileIndex];

  // Pinned Notice Board
  const [noticeBoard, setNoticeBoard] = useState(
    "📌 Note du Chef : Spécial Capitaine du Niger grillé au feu de bois ce soir. Suggestion : proposer avec frites d'alloco et jus de bissap frais.",
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
          const { data, error } = await supabase
            .from("chat_messages" as never)
            .select("*")
            .eq("restaurant_id", r.id)
            .order("created_at", { ascending: true })
            .limit(100);

          if (!error && data && data.length > 0) {
            fetchedMsgs = data;
          }
        } catch (err) {
          console.warn("Error fetching Supabase chat:", err);
        }
      }

      if (!cancelled) {
        if (fetchedMsgs.length > 0) {
          setMessages(fetchedMsgs);
        } else {
          // Check local storage
          const stored = localStorage.getItem(localKey);
          if (stored) {
            try {
              setMessages(JSON.parse(stored));
            } catch {
              setMessages(INITIAL_MESSAGES);
            }
          } else {
            setMessages(INITIAL_MESSAGES);
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
    if (messages.length > 0) {
      const localKey = `restobf_chat_${r?.id || "demo"}`;
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
        await supabase.from("chat_messages" as never).insert({
          restaurant_id: r.id,
          sender_name: activeProfile.name,
          sender_role: activeProfile.role,
          message: text,
          read: false,
        });
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

  const handleAddReaction = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const reactions = { ...(m.reactions || {}) };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...m, reactions };
      }),
    );
    toast.success(`Réaction ${emoji} ajoutée !`);
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
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 rounded-3xl border border-[#d4a853]/30 bg-gradient-to-r from-[#111118] via-[#111118] to-[#1a160d] shadow-2xl">
        <div className="space-y-1 min-w-0">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a853]/15 border border-[#d4a853]/30 text-xs font-bold text-[#f0d48a]">
            <Sparkles className="w-3.5 h-3.5 text-[#d4a853]" />
            <span>Messagerie Équipe Temps Réel</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-foreground truncate">
            Chat Interne —{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a853] via-[#f0d48a] to-[#ffffff]">
              {r?.name || "Votre Restaurant"}
            </span>
          </h1>

          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="hidden sm:inline">Communication Cuisine, Salle, Caisse & Direction</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 bg-[#0a0a0f] text-muted-foreground"
            }`}
            title={soundEnabled ? "Sons activés" : "Sons désactivés"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "Sons On" : "Sons Mute"}</span>
          </button>
        </div>
      </div>

      {/* STAFF PROFILE SWITCHER (SIMULATE WHO IS SENDING) */}
      <div className="p-3 sm:p-4 rounded-2xl border border-white/10 bg-[#111118]/90 backdrop-blur-xl shadow-lg space-y-2">
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 min-w-0">
            <Crown className="w-3.5 h-3.5 text-[#d4a853] shrink-0" />
            <span className="truncate">Vous émettez en tant que :</span>
          </span>
          <span className="hidden sm:inline text-[11px] text-[#f0d48a] italic shrink-0">
            Cliquez pour basculer de rôle
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {STAFF_PROFILES.map((prof, idx) => {
            const isActive = activeProfileIndex === idx;
            return (
              <button
                key={prof.name}
                onClick={() => setActiveProfileIndex(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 min-w-0 ${
                  isActive
                    ? "border-[#d4a853] bg-[#d4a853]/15 text-foreground shadow-lg scale-[1.02]"
                    : "border-white/5 bg-[#0a0a0f] text-muted-foreground hover:border-white/20"
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
      <div className="p-4 rounded-2xl border border-[#d4a853]/40 bg-gradient-to-r from-[#d4a853]/15 via-[#111118] to-[#111118] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#d4a853]/20 border border-[#d4a853]/40 text-[#f0d48a] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Pin className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            {editingNotice ? (
              <div className="space-y-2">
                <textarea
                  value={noticeDraft}
                  onChange={(e) => setNoticeDraft(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0a0a0f] border border-[#d4a853]/50 text-xs text-foreground focus:outline-none"
                  rows={2}
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setEditingNotice(false)}
                    className="px-3 py-1 rounded-lg border border-white/10 text-xs text-muted-foreground"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveNotice}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] text-xs font-black"
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
            className="text-[11px] text-[#f0d48a] hover:underline shrink-0 font-bold self-end sm:self-center"
          >
            Éditer la note
          </button>
        )}
      </div>

      {/* MAIN CHAT APPLICATION LAYOUT (CHANNELS SIDEBAR + MESSAGE CONTAINER) */}
      <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* LEFT COLUMN: CHANNELS NAVIGATION (4 COLS) — après le chat sur mobile */}
        <div className="order-2 lg:order-1 lg:col-span-4 space-y-3">
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
                      ? "border-[#d4a853]/60 bg-[#d4a853]/15 text-foreground"
                      : "border-white/10 text-muted-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{ch.name}</span>
                  {unread > 0 && !isActive && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-[#0a0a0f] text-[9px] font-black">
                      +{unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop: liste complète avec description */}
          <div className="hidden lg:block p-4 rounded-2xl border border-white/10 bg-[#111118]/90 backdrop-blur-2xl shadow-xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#d4a853]" />
                <span>Canaux de Discussion</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-muted-foreground font-bold">
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
                        ? "border-[#d4a853]/60 bg-[#d4a853]/15 text-foreground shadow-md"
                        : "border-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-2 rounded-lg ${isActive ? "bg-[#d4a853] text-[#0a0a0f]" : "bg-white/10 text-muted-foreground"}`}
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
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-[#0a0a0f] text-[10px] font-black animate-bounce">
                        +{unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUICK PINGS / MACROS BOX — repliable sur mobile */}
          <details className="lg:hidden group rounded-2xl border border-white/10 bg-[#111118]/90 backdrop-blur-2xl shadow-xl overflow-hidden">
            <summary className="p-3.5 cursor-pointer list-none flex items-center justify-between text-xs font-extrabold text-[#f0d48a] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#d4a853]" />
                <span>Réponses rapides</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-3.5 pb-3.5 flex flex-col gap-1.5">
              {QUICK_PINGS[activeChannel]?.map((ping) => (
                <button
                  key={ping.label}
                  onClick={() => handleSendMessage(ping.text)}
                  className="p-2.5 rounded-xl border border-white/10 bg-[#0a0a0f] hover:border-[#d4a853]/50 transition-all text-left flex items-center gap-2 text-xs text-foreground cursor-pointer"
                >
                  <span className="text-base">{ping.icon}</span>
                  <div className="min-w-0 flex-1">
                    <strong className="block font-bold text-[11px] text-[#f0d48a]">
                      {ping.label}
                    </strong>
                  </div>
                </button>
              ))}
            </div>
          </details>

          {/* Desktop: liste toujours visible */}
          <div className="hidden lg:block p-4 rounded-2xl border border-white/10 bg-[#111118]/90 backdrop-blur-2xl shadow-xl space-y-3">
            <h4 className="text-xs font-extrabold text-[#f0d48a] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a853]" />
              <span>Envoi Rapide (Pings 1-Clic)</span>
            </h4>

            <div className="flex flex-col gap-1.5">
              {QUICK_PINGS[activeChannel]?.map((ping) => (
                <button
                  key={ping.label}
                  onClick={() => handleSendMessage(ping.text)}
                  className="p-2.5 rounded-xl border border-white/10 bg-[#0a0a0f] hover:border-[#d4a853]/50 hover:bg-[#1a1a24] transition-all text-left flex items-center gap-2 text-xs text-foreground cursor-pointer group"
                >
                  <span className="text-base group-hover:scale-125 transition-transform">
                    {ping.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <strong className="block font-bold text-[11px] text-[#f0d48a]">
                      {ping.label}
                    </strong>
                    <span className="text-[10px] text-muted-foreground truncate block">
                      {ping.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT CONVERSATION VIEW (8 COLS) — en premier sur mobile */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#111118]/90 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col h-[75vh] max-h-[560px] lg:h-[620px] lg:max-h-none">
            {/* CHAT HEADER */}
            <div className="p-3 sm:p-4 border-b border-white/10 bg-[#0a0a0f]/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#d4a853]/20 border border-[#d4a853]/40 text-[#f0d48a] flex items-center justify-center font-bold shrink-0">
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
                  className="w-full pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] sm:text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#d4a853]"
                />
              </div>
            </div>

            {/* MESSAGES LIST AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0a0a0f]/40 to-[#111118]">
              {loading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#d4a853]" />
                  Chargement des discussions...
                </div>
              ) : channelMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-center p-6">
                  <div className="space-y-2">
                    <MessageSquare className="w-10 h-10 mx-auto opacity-40 text-[#d4a853]" />
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
                    STAFF_PROFILES.find((p) => p.role === msg.sender_role) || STAFF_PROFILES[0];

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
                          <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] text-muted-foreground font-semibold">
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
                              ? "bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] font-medium rounded-tr-none"
                              : "bg-[#1a1a24] border border-white/10 text-foreground rounded-tl-none"
                          }`}
                        >
                          {msg.message}

                          {/* Quick Reactions bar hover */}
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-[#0a0a0f] border border-white/20 p-1 rounded-full shadow-xl z-20 ${isMe ? "-left-24" : "-right-24"}`}
                          >
                            {["👍", "🔥", "✅", "❤️"].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleAddReaction(msg.id, emoji)}
                                className="hover:scale-125 transition-transform text-xs p-1"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Display existing reactions */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div
                            className={`flex items-center gap-1 pt-1 ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            {Object.entries(msg.reactions).map(([emoji, cnt]) => (
                              <span
                                key={emoji}
                                className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-foreground flex items-center gap-1"
                              >
                                <span>{emoji}</span>
                                <span className="font-bold">{cnt}</span>
                              </span>
                            ))}
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
            <div className="p-3 sm:p-4 border-t border-white/10 bg-[#0a0a0f]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Écrire un message..."
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-[#d4a853] transition-colors"
                  disabled={sending}
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 sm:px-5 py-3 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] font-black text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:brightness-110 transition-all shrink-0 cursor-pointer"
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
