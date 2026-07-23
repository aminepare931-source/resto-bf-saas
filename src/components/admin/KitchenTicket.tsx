import { useEffect } from "react";
import type { Order } from "@/types";

/**
 * Ticket cuisine imprimable — pensé pour une imprimante thermique
 * (USB ou Bluetooth) déjà installée comme imprimante système sur
 * l'appareil. On s'appuie sur window.print() plutôt que sur un
 * protocole ESC/POS direct : ça marche avec n'importe quelle
 * imprimante reconnue par le système, sans pairing complexe côté web.
 *
 * Astuce classique : au moment de l'impression, tout le reste de la
 * page est masqué et seul le ticket (id="kitchen-ticket-print") est
 * rendu visible, via la feuille de style @media print ci-dessous.
 */
export function KitchenTicket({ order, restaurantName }: { order: Order; restaurantName: string }) {
  useEffect(() => {
    const handleAfterPrint = () => {
      // Le parent retire ticketOrder au prochain rendu ; on force juste
      // un évènement custom pour que dashboard.commandes.tsx puisse nettoyer.
      window.dispatchEvent(new CustomEvent("kitchen-ticket-printed"));
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const date = new Date(order.created_at);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #kitchen-ticket-print, #kitchen-ticket-print * { visibility: visible !important; }
          #kitchen-ticket-print {
            position: absolute; top: 0; left: 0;
            width: 80mm; padding: 4mm;
            font-family: 'Courier New', monospace;
            color: #000; background: #fff;
          }
          @page { size: 80mm auto; margin: 0; }
        }
        @media screen {
          #kitchen-ticket-print { display: none; }
        }
      `}</style>
      <div id="kitchen-ticket-print">
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 16, textTransform: "uppercase" }}>{restaurantName}</div>
          <div style={{ fontSize: 11 }}>Ticket cuisine</div>
        </div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
        <div style={{ fontSize: 12, marginBottom: 4 }}>
          {order.table_number ? `TABLE ${order.table_number}` : "À EMPORTER"}
        </div>
        <div style={{ fontSize: 10, marginBottom: 6 }}>
          {date.toLocaleDateString("fr-FR")} {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          {order.customer_name ? ` · ${order.customer_name}` : ""}
        </div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <tbody>
            {order.items.map((it, i) => (
              <tr key={i}>
                <td style={{ padding: "3px 0", fontWeight: 700, verticalAlign: "top" }}>{it.qty}×</td>
                <td style={{ padding: "3px 0 3px 6px" }}>{it.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {order.notes && (
          <>
            <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
            <div style={{ fontSize: 11, fontStyle: "italic" }}>Note : {order.notes}</div>
          </>
        )}
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
        <div style={{ fontSize: 10, textAlign: "center" }}>Commande #{order.id.slice(0, 8)}</div>
      </div>
    </>
  );
}
