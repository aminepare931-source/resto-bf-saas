import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, pin } = await req.json();

    console.log("📧 Edge Function appelée avec:", { email, pin });

    if (!email || !pin) {
      console.error("❌ Email ou PIN manquant");
      return new Response(
        JSON.stringify({ error: "Email et PIN requis" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Configuration email - essayer Resend d'abord, sinon utiliser un service SMTP
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const fromEmail = Deno.env.get("FROM_EMAIL") || "restobf@localhost.com";

    console.log("📧 Configuration email:", {
      hasResend: !!resendApiKey,
      hasSMTP: !!(smtpHost && smtpUser && smtpPass)
    });

    // Essayer Resend si configuré
    if (resendApiKey) {
      console.log("📧 Envoi via Resend...");
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: `Resto BF <${fromEmail}>`,
            to: [email],
            subject: "🔐 Votre code de sécurité - Resto BF",
            html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code de sécurité - Resto BF</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #0a0a0f; color: #e8e6e3; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a24; border-radius: 20px; padding: 40px; border: 1px solid rgba(212,168,83,0.2);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #d4a853, #b08800); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; font-weight: bold; color: #0a0a0f;">
        R
      </div>
      <h1 style="color: #d4a853; margin-top: 20px; font-size: 28px;">Resto BF</h1>
    </div>
    
    <div style="background-color: rgba(212,168,83,0.1); border: 2px solid rgba(212,168,83,0.3); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
      <p style="margin: 0 0 15px 0; color: #e8e6e3; font-size: 16px;">Votre code de sécurité</p>
      <div style="font-size: 48px; font-weight: bold; color: #d4a853; letter-spacing: 8px; font-family: 'Courier New', monospace;">
        ${pin}
      </div>
      <p style="margin: 15px 0 0 0; color: #a0a0a0; font-size: 14px;">Valide pendant 10 minutes</p>
    </div>
    
    <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6;">
      Vous avez demandé l'accès à l'administration de Resto BF. Entrez ce code à 6 chiffres pour continuer.
    </p>
    
    <p style="color: #a0a0a0; font-size: 14px; margin-top: 20px;">
      Si vous n'avez pas demandé ce code, ignorez cet email.
    </p>
    
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="color: #606060; font-size: 12px;">
        © 2024 Resto BF - Le SaaS pour les restaurateurs du Burkina Faso
      </p>
    </div>
  </div>
</body>
</html>`,
          }),
        });

        console.log("📧 Réponse Resend status:", emailResponse.status);
        
        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error("❌ Erreur Resend:", emailResponse.status, errorText);
          throw new Error(`Resend erreur ${emailResponse.status}: ${errorText}`);
        }

        const responseData = await emailResponse.json();
        console.log("✅ Email envoyé via Resend:", responseData);

        return new Response(
          JSON.stringify({ success: true, message: "Email envoyé avec succès", method: "resend", data: responseData }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (resendError) {
        console.error("❌ Erreur Resend, essai SMTP...", resendError);
        // Continuer vers SMTP si Resend échoue
      }
    }

    // Essayer SMTP si configuré
    if (smtpHost && smtpUser && smtpPass) {
      console.log("📧 Envoi via SMTP...");
      try {
        // Utiliser un service SMTP (Gmail, Outlook, etc.)
        const smtpUrl = `smtp://${encodeURIComponent(smtpUser)}:${encodeURIComponent(smtpPass)}@${smtpHost}:${smtpPort || 587}`;
        
        // Note: Deno ne supporte pas SMTP nativement, il faudrait utiliser une librairie
        // Pour l'instant, on retourne une erreur
        console.error("❌ SMTP non implémenté dans Deno");
        throw new Error("SMTP non disponible");
      } catch (smtpError) {
        console.error("❌ Erreur SMTP:", smtpError);
        // Continuer vers le fallback
      }
    }

    // Si aucun service email n'est disponible, retourner une erreur
    console.error("❌ Aucun service email configuré");
    return new Response(
      JSON.stringify({ 
        error: "Aucun service email configuré",
        help: "Configurez RESEND_API_KEY dans les secrets Supabase, ou utilisez un service SMTP"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Erreur serveur:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erreur serveur",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});