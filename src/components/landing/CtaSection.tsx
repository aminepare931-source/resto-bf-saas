import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Store } from "lucide-react";
import { DiamondPattern } from "./DiamondPattern";

const WHATSAPP = "https://wa.me/22655300868";

export function CtaSection() {
  return (
    <section
      id="contact"
      className="px-4 sm:px-6 pt-6 pb-14 sm:pb-20"
      style={{ background: "#fdf9ef", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div
        className="relative overflow-hidden max-w-4xl mx-auto rounded-[26px] text-center text-white px-6 sm:px-14 pt-9 pb-10 sm:py-14"
        style={{
          background: "linear-gradient(135deg, #b53a14 0%, #cf5320 45%, #e8892f 100%)",
          boxShadow: "0 30px 60px -30px rgba(181,58,20,.65)",
        }}
      >
        <DiamondPattern
          color="#ffffff"
          opacity={0.07}
          tile={52}
          className="absolute top-0 right-0 w-[130px] h-[110px] sm:w-[220px] sm:h-[190px]"
          fade="radial-gradient(circle at 100% 0%, #000 20%, transparent 75%)"
        />
        <DiamondPattern
          color="#ffffff"
          opacity={0.07}
          tile={52}
          className="absolute bottom-0 left-0 w-[130px] h-[170px] sm:w-[240px] sm:h-[240px]"
          fade="radial-gradient(circle at 0% 100%, #000 20%, transparent 75%)"
        />

        <div className="relative">
          <div
            className="w-14 h-14 mx-auto rounded-2xl grid place-items-center"
            style={{
              background: "rgba(255,255,255,.18)",
              border: "1px solid rgba(255,255,255,.3)",
            }}
          >
            <Store className="w-7 h-7" strokeWidth={1.8} />
          </div>

          <h2 className="mt-5 text-[1.85rem] sm:text-4xl lg:text-[2.6rem] font-extrabold leading-tight">
            Prêt à propulser votre restaurant
            <br />
            <span style={{ color: "#ffd98f" }}>au Burkina Faso ?</span>
          </h2>

          <p className="mt-4 text-[15px] sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed">
            Rejoignez plus de 50 restaurateurs satisfaits. Lancez votre menu digital et commencez à
            recevoir vos commandes WhatsApp en 5 minutes.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3.5 justify-center max-w-[560px] sm:max-w-none mx-auto">
            <Link
              to="/auth/inscription"
              className="inline-flex items-center justify-center gap-2.5 h-[54px] sm:px-9 rounded-2xl bg-white text-[15.5px] font-semibold transition-transform hover:-translate-y-0.5"
              style={{ color: "#2b130b", boxShadow: "0 12px 24px -12px rgba(0,0,0,.35)" }}
            >
              Créer ma page gratuitement
              <ArrowRight className="w-[18px] h-[18px]" />
            </Link>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 h-[54px] sm:px-9 rounded-2xl text-[15.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #0d775b, #1b9e77)",
                boxShadow: "0 12px 24px -12px rgba(0,0,0,.4)",
              }}
            >
              <MessageCircle className="w-5 h-5" />
              Nous écrire sur WhatsApp
              <ArrowRight className="w-[18px] h-[18px]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
