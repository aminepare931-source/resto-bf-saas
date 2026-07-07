import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { useStaffRole } from "@/hooks/use-staff-role";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { toast } from "sonner";
import { Send, Users, User } from "lucide-react";
import type { ChatMessage, StaffRole } from "@/types";
import { STAFF_ROLE_LABEL } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/chat")({
  component: ChatPage,
});

const ROLE_COLORS: Record<StaffRole, string> = {
  admin: "text-gold",
  cuisinier: "text-blue-400",
  serveur: "text-emerald-400",
  manager: "text-purple-400",
};

function ChatPage() {
  const { restaurant: r } = useMyRestaurant();
  const { staff } = useStaffRole();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const senderName = staff?.name || "Moi";

  // Charger les messages
  useEffect(() => {
    if (!r) return;
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("chat_messages" as never)
        .select("*")
        .eq("restaurant_id", r.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (!cancelled) {
        if (error) {
          console.error("Error loading messages:", error);
        } else {
          setMessages((data || []) as unknown as ChatMessage[]);
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [r?.id]);

  // Abonnement temps réel
  useRealtimeSubscription<ChatMessage>({
    table: "chat_messages",
    restaurantId: r?.id || "",
    enabled: !!r,
    onInsert: (msg) => {
      setMessages((prev) => [...prev, msg]);
    },
    onUpdate: (updated) => {
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    },
    onDelete: (old) => {
      setMessages((prev) => prev.filter((m) => m.id !== old.id));
    },
  });

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = async () => {
    if (!r || !newMessage.trim() || sending) return;

    const message = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const { error } = await supabase.from("chat_messages" as never).insert({
        restaurant_id: r.id,
        sender_name: senderName,
        sender_role: staff?.role || "serveur",
        message,
        read: false,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi");
      setNewMessage(message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!r) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Communication</p>
        <h1 className="text-3xl font-black">Chat interne</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Communiquez avec l'équipe en temps réel
        </p>
      </div>

      {/* Zone de messages */}
      <div className="rounded-2xl border border-white/8 bg-dark-card overflow-hidden">
        {/* En-tête */}
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Users className="w-5 h-5 text-gold" />
          <span className="font-semibold text-sm">Équipe</span>
          <span className="text-xs text-muted-foreground">· En ligne</span>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Chargement des messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun message</p>
                <p className="text-xs mt-1">Commencez la conversation !</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_name === senderName;
              const roleColor = ROLE_COLORS[msg.sender_role as StaffRole] || "text-muted-foreground";

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>

                  {/* Message */}
                  <div className={`flex-1 ${isMe ? "text-right" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${roleColor}`}>
                        {msg.sender_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                        isMe
                          ? "bg-gold/20 text-gold rounded-tr-sm"
                          : "bg-white/5 text-foreground rounded-tl-sm"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez un message..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-gold/50 transition-colors"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="px-4 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Appuyez sur Entrée pour envoyer
          </p>
        </div>
      </div>
    </div>
  );
}