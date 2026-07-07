import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type InvoiceColors = {
  primary: string;      // Couleur principale (en-tête, bordures)
  secondary: string;    // Couleur secondaire (accents)
  text: string;         // Couleur du texte principal
  background: string;   // Couleur de fond
};

export type InvoiceTemplate = {
  id: string;
  name: string;
  description: string;
  plan: "gratuit" | "standard" | "premium";
  render: (data: InvoiceData, colors: InvoiceColors, logoUrl?: string | null) => InvoiceRenderResult;
};

export type InvoiceData = {
  invoiceNumber: string;
  issuedAt: string;
  dueAt?: string;
  restaurant: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logoUrl?: string | null;
  };
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  paymentMethod?: string;
  tableNumber?: string;
  waiter?: string;
};

export type InvoiceRenderResult = {
  pdf?: (doc: any) => void;
  html?: string;
};

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = hex.match(/\w\w/g);
  return result ? (result.map((hex) => parseInt(hex, 16)) as [number, number, number]) : [0, 0, 0];
};

// Template Standard - Facture simple et professionnelle
export const standardTemplate: InvoiceTemplate = {
  id: "standard",
  name: "Standard",
  description: "Facture simple et professionnelle",
  plan: "standard",
  render: (data, colors) => ({
    pdf: (doc) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      let y = 20;

      // En-tête avec couleur primaire
      doc.setFillColor(colors.primary);
      doc.rect(0, 0, pageWidth, 50, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(data.restaurant.name, margin, 30);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      if (data.restaurant.address) doc.text(data.restaurant.address, margin, 38);
      if (data.restaurant.phone) doc.text(`Tél: ${data.restaurant.phone}`, margin, 44);

      // Numéro de facture et date (côté droit)
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`FACTURE ${data.invoiceNumber}`, pageWidth - margin, 25, { align: "right" });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Date: ${new Date(data.issuedAt).toLocaleDateString("fr-FR")}`, pageWidth - margin, 32, { align: "right" });
      if (data.dueAt) {
        doc.text(`Échéance: ${new Date(data.dueAt).toLocaleDateString("fr-FR")}`, pageWidth - margin, 38, { align: "right" });
      }

      y = 65;

      // Client
      doc.setTextColor(colors.text);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("FACTURÉ À:", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(data.customer.name, margin, y);
      y += 6;
      if (data.customer.email) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(data.customer.email, margin, y);
        y += 5;
      }
      if (data.customer.phone) {
        doc.setFontSize(9);
        doc.text(data.customer.phone, margin, y);
        y += 5;
      }

      y += 10;

      // Tableau des articles
      const tableHead = [["Description", "Qté", "PU", "Total"]];
      const tableBody = data.items.map((item) => [
        item.description,
        item.quantity.toString(),
        `${item.unitPrice.toLocaleString("fr-FR")} F`,
        `${(item.quantity * item.unitPrice).toLocaleString("fr-FR")} F`,
      ]);

      autoTable(doc, {
        startY: y,
        head: tableHead,
        body: tableBody,
        margin: { left: margin, right: margin },
        theme: "striped",
        headStyles: {
          fillColor: hexToRgb(colors.primary),
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        footStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        foot: [
          ["", "", "Sous-total", `${data.subtotal.toLocaleString("fr-FR")} F`],
          ...(data.taxRate > 0
            ? [["", "", `TVA ${data.taxRate}%`, `${data.taxAmount.toLocaleString("fr-FR")} F`]]
            : []),
          ["", "", "TOTAL", `${data.total.toLocaleString("fr-FR")} F`],
        ],
      });

      // Notes et informations supplémentaires
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      if (data.notes || data.paymentMethod || data.tableNumber || data.waiter) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        const details: string[] = [];
        if (data.paymentMethod) details.push(`Mode de paiement: ${data.paymentMethod}`);
        if (data.tableNumber) details.push(`Table: ${data.tableNumber}`);
        if (data.waiter) details.push(`Serveur: ${data.waiter}`);
        if (data.notes) details.push(`Notes: ${data.notes}`);
        
        details.forEach((detail, i) => {
          doc.text(detail, margin, finalY + i * 5);
        });
      }
    },
  }),
};

// Template Premium - Facture personnalisable avec logo et design avancé
export const premiumTemplate: InvoiceTemplate = {
  id: "premium",
  name: "Premium",
  description: "Facture personnalisable avec logo et couleurs",
  plan: "premium",
  render: (data, colors, logoUrl) => ({
    pdf: (doc) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      let y = 15;

      const primaryRgb = hexToRgb(colors.primary);

      // En-tête avec bordure colorée
      doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.setLineWidth(2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      // Logo (si disponible)
      if (logoUrl) {
        try {
          doc.addImage(logoUrl, "PNG", margin, y, 40, 40);
          y += 45;
        } catch (e) {
          // Si l'image ne charge pas, continuer sans logo
        }
      }

      // Nom du restaurant
      doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(data.restaurant.name, margin, y);
      y += 8;

      // Informations du restaurant
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      if (data.restaurant.address) {
        doc.text(data.restaurant.address, margin, y);
        y += 5;
      }
      if (data.restaurant.phone) {
        doc.text(`Tél: ${data.restaurant.phone}`, margin, y);
        y += 5;
      }
      if (data.restaurant.email) {
        doc.text(`Email: ${data.restaurant.email}`, margin, y);
        y += 5;
      }

      y += 5;

      // Ligne de séparation
      doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // Numéro de facture et dates (côté droit)
      doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("FACTURE", pageWidth - margin, y, { align: "right" });
      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text(`N° ${data.invoiceNumber}`, pageWidth - margin, y, { align: "right" });
      y += 6;
      doc.text(`Date: ${new Date(data.issuedAt).toLocaleDateString("fr-FR")}`, pageWidth - margin, y, { align: "right" });
      if (data.dueAt) {
        y += 6;
        doc.text(`Échéance: ${new Date(data.dueAt).toLocaleDateString("fr-FR")}`, pageWidth - margin, y, { align: "right" });
      }

      y += 10;

      // Informations client avec fond coloré
      const bgColor = colors.background === "#ffffff" ? 245 : parseInt(colors.background.replace("#", ""), 16);
      doc.setFillColor(bgColor);
      doc.rect(margin, y, pageWidth - 2 * margin, 30, "F");
      doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.setLineWidth(0.5);
      doc.rect(margin, y, pageWidth - 2 * margin, 30, "S");

      doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("CLIENT", margin + 3, y + 8);
      doc.setTextColor(colors.text);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(data.customer.name, margin + 3, y + 16);
      if (data.customer.email) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(data.customer.email, margin + 3, y + 22);
      }

      y += 40;

      // Tableau des articles
      const tableHead = [["Description", "Qté", "PU", "Total"]];
      const tableBody = data.items.map((item) => [
        item.description,
        item.quantity.toString(),
        `${item.unitPrice.toLocaleString("fr-FR")} F`,
        `${(item.quantity * item.unitPrice).toLocaleString("fr-FR")} F`,
      ]);

      autoTable(doc, {
        startY: y,
        head: tableHead,
        body: tableBody,
        margin: { left: margin, right: margin },
        theme: "grid",
        headStyles: {
          fillColor: primaryRgb,
          textColor: [255, 255, 255] as [number, number, number],
          fontStyle: "bold",
          fontSize: 10,
        },
        bodyStyles: {
          textColor: hexToRgb(colors.text),
          fontSize: 9,
        },
        footStyles: {
          fillColor: primaryRgb,
          textColor: [255, 255, 255] as [number, number, number],
          fontStyle: "bold",
          fontSize: 10,
        },
        foot: [
          ["", "", "Sous-total", `${data.subtotal.toLocaleString("fr-FR")} F`],
          ...(data.taxRate > 0
            ? [["", "", `TVA ${data.taxRate}%`, `${data.taxAmount.toLocaleString("fr-FR")} F`]]
            : []),
          ["", "", "TOTAL", `${data.total.toLocaleString("fr-FR")} F`],
        ],
      });

      // Notes et informations supplémentaires
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      if (data.notes || data.paymentMethod || data.tableNumber || data.waiter) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        const details: string[] = [];
        if (data.paymentMethod) details.push(`Mode de paiement: ${data.paymentMethod}`);
        if (data.tableNumber) details.push(`Table: ${data.tableNumber}`);
        if (data.waiter) details.push(`Serveur: ${data.waiter}`);
        if (data.notes) details.push(`Notes: ${data.notes}`);
        
        details.forEach((detail, i) => {
          doc.text(detail, margin, finalY + i * 5);
        });
      }

      // Pied de page
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Merci de votre visite !", pageWidth / 2, footerY, { align: "center" });
      doc.text(data.restaurant.name, pageWidth / 2, footerY + 5, { align: "center" });
    },
  }),
};

// Template Simple - Minimaliste
export const simpleTemplate: InvoiceTemplate = {
  id: "simple",
  name: "Simple",
  description: "Facture minimaliste",
  plan: "gratuit",
  render: (data, colors) => ({
    pdf: (doc) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      let y = 20;

      // En-tête simple
      doc.setTextColor(0);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(data.restaurant.name, margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      if (data.restaurant.address) doc.text(data.restaurant.address, margin, y);
      if (data.restaurant.phone) doc.text(`Tél: ${data.restaurant.phone}`, margin, y + 5);

      y += 20;

      // Facture
      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`FACTURE N° ${data.invoiceNumber}`, margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Date: ${new Date(data.issuedAt).toLocaleDateString("fr-FR")}`, margin, y);

      y += 15;

      // Client
      doc.setFont("helvetica", "bold");
      doc.text("Client:", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.text(data.customer.name, margin, y);

      y += 15;

      // Tableau simple
      const tableHead = [["Description", "Qté", "PU", "Total"]];
      const tableBody = data.items.map((item) => [
        item.description,
        item.quantity.toString(),
        `${item.unitPrice.toLocaleString("fr-FR")} F`,
        `${(item.quantity * item.unitPrice).toLocaleString("fr-FR")} F`,
      ]);

      autoTable(doc, {
        startY: y,
        head: tableHead,
        body: tableBody,
        margin: { left: margin, right: margin },
        theme: "plain",
        headStyles: {
          fillColor: false,
          textColor: [0, 0, 0],
          fontStyle: "bold",
          fontSize: 9,
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          fontSize: 9,
        },
        foot: [
          ["", "", "TOTAL", `${data.total.toLocaleString("fr-FR")} F`],
        ],
        footStyles: {
          fillColor: false,
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
      });

      // Notes
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      if (data.notes) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Notes: ${data.notes}`, margin, finalY);
      }
    },
  }),
};

// Template de reçu - Format compact pour confirmation de paiement
export const receiptTemplate: InvoiceTemplate = {
  id: "receipt",
  name: "Reçu",
  description: "Reçu de paiement compact",
  plan: "premium",
  render: (data, colors) => ({
    pdf: (doc) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      let y = 20;
      const primaryRgb = hexToRgb(colors.primary);

      // En-tête avec couleur primaire
      doc.setFillColor(colors.primary);
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("REÇU DE PAIEMENT", pageWidth / 2, 25, { align: "center" });

      y = 55;

      // Informations du restaurant (plus compact)
      doc.setTextColor(colors.text);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(data.restaurant.name, margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100);
      if (data.restaurant.address) {
        doc.text(data.restaurant.address, margin, y);
        y += 4;
      }
      if (data.restaurant.phone) {
        doc.text(`Tél: ${data.restaurant.phone}`, margin, y);
        y += 4;
      }

      y += 8;

      // Numéro de reçu et date (côté droit)
      doc.setTextColor(colors.primary);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`N° ${data.invoiceNumber}`, pageWidth - margin, y, { align: "right" });
      y += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Date: ${new Date(data.issuedAt).toLocaleDateString("fr-FR")}`, pageWidth - margin, y, { align: "right" });

      y += 12;

      // Client (format compact)
      doc.setTextColor(colors.text);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Client:", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(data.customer.name, margin, y);
      if (data.customer.phone) {
        y += 4;
        doc.text(data.customer.phone, margin, y);
      }

      y += 12;

      // Tableau des articles (format compact)
      const tableHead = [["Article", "Qté", "Total"]];
      const tableBody = data.items.map((item) => [
        item.description,
        item.quantity.toString(),
        `${(item.quantity * item.unitPrice).toLocaleString("fr-FR")} F`,
      ]);

      autoTable(doc, {
        startY: y,
        head: tableHead,
        body: tableBody,
        margin: { left: margin, right: margin },
        theme: "plain",
        headStyles: {
          fillColor: primaryRgb,
          textColor: [255, 255, 255] as [number, number, number],
          fontStyle: "bold",
          fontSize: 9,
        },
        bodyStyles: {
          textColor: [0, 0, 0] as [number, number, number],
          fontSize: 9,
        },
        foot: [
          ["", "", `TOTAL PAYÉ: ${data.total.toLocaleString("fr-FR")} F`],
        ],
        footStyles: {
          fillColor: primaryRgb,
          textColor: [255, 255, 255] as [number, number, number],
          fontStyle: "bold",
          fontSize: 10,
        },
      });

      // Informations de paiement
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, finalY, pageWidth - margin, finalY);
      
      y = finalY + 8;
      doc.setTextColor(colors.primary);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("✓ PAIEMENT CONFIRMÉ", pageWidth / 2, y, { align: "center" });
      
      y += 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      if (data.paymentMethod) {
        doc.text(`Mode: ${data.paymentMethod}`, margin, y);
        y += 5;
      }
      if (data.tableNumber) {
        doc.text(`Table: ${data.tableNumber}`, margin, y);
        y += 5;
      }
      if (data.waiter) {
        doc.text(`Serveur: ${data.waiter}`, margin, y);
      }

      // Pied de page
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Merci pour votre paiement !", pageWidth / 2, footerY, { align: "center" });
      doc.text(data.restaurant.name, pageWidth / 2, footerY + 5, { align: "center" });
    },
  }),
};

// Couleurs par défaut
export const defaultColors: Record<string, InvoiceColors> = {
  standard: {
    primary: "#d4a853", // Or
    secondary: "#b08800",
    text: "#1a1a1a",
    background: "#ffffff",
  },
  premium: {
    primary: "#1a1a1a", // Noir élégant
    secondary: "#d4a853",
    text: "#1a1a1a",
    background: "#ffffff",
  },
  simple: {
    primary: "#000000",
    secondary: "#666666",
    text: "#000000",
    background: "#ffffff",
  },
};

// Récupérer le template selon le plan
export function getTemplateForPlan(plan: string): InvoiceTemplate {
  if (plan === "premium" || plan === "sur_mesure") {
    return premiumTemplate;
  } else if (plan === "standard" || plan === "standard_plus" || plan === "trial") {
    return standardTemplate;
  }
  return simpleTemplate;
}

// Récupérer le template de reçu
export function getReceiptTemplate(): InvoiceTemplate {
  return receiptTemplate;
}

// Liste des templates disponibles
export const availableTemplates: InvoiceTemplate[] = [
  simpleTemplate,
  standardTemplate,
  premiumTemplate,
  receiptTemplate,
];