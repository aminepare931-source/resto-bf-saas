import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export type InvoiceLine = { description: string; quantity: number; unit_price: number; discount?: number };

export function generateInvoicePDF(opts: {
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  number: string;
  issuedAt: string;
  items: InvoiceLine[];
  subtotal: number;
  taxRate: number;
  total: number;
  paymentMethod?: string;
  footer?: string;
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(opts.restaurantName || "Restaurant", margin, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  if (opts.restaurantAddress) doc.text(opts.restaurantAddress, margin, 30);
  if (opts.restaurantPhone) doc.text(`Tél: ${opts.restaurantPhone}`, margin, 36);

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(`FACTURE N° ${opts.number}`, pageWidth - margin, 22, { align: "right" });
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(opts.issuedAt).toLocaleDateString("fr-FR")}`, pageWidth - margin, 30, { align: "right" });

  doc.setTextColor(0);
  doc.text("Client:", margin, 52);
  doc.text(opts.customerName, margin, 58);
  if (opts.customerEmail) doc.text(opts.customerEmail, margin, 64);

  autoTable(doc, {
    startY: 74,
    head: [["Description", "Qté", "P.U. (F)", "Remise", "Total (F)"]],
    body: opts.items.map((l) => [
      l.description,
      String(l.quantity),
      l.unit_price.toLocaleString("fr-FR"),
      `${l.discount ?? 0}%`,
      (l.quantity * l.unit_price * (1 - (l.discount ?? 0) / 100)).toLocaleString("fr-FR"),
    ]),
    foot: [
      ["", "", "Sous-total HT", "", `${opts.subtotal.toLocaleString("fr-FR")} F`],
      ...(opts.taxRate
        ? [
            [
              "",
              "",
              `TVA ${opts.taxRate}%`,
              "",
              `${(opts.total - opts.subtotal).toLocaleString("fr-FR")} F`,
            ],
          ]
        : []),
      ["", "", "TOTAL TTC", "", `${opts.total.toLocaleString("fr-FR")} F`],
    ],
    theme: "grid",
    headStyles: { fillColor: [201, 161, 74], textColor: 10, fontStyle: "bold" },
    footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold" },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;
  if (opts.paymentMethod) doc.text(`Mode de paiement: ${opts.paymentMethod}`, margin, finalY);
  if (opts.footer) doc.text(opts.footer, margin, finalY + 6);

  doc.save(`facture-${opts.number}.pdf`);
}
