const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'routes', 'index.tsx');
let c = fs.readFileSync(p, 'utf8');

// 1. Add plan field to each plan object
c = c.replace(
  'cta: "Démarrer mon essai",\n    href: "/auth/inscription" as const,\n    features: [',
  'cta: "Démarrer mon essai",\n    href: "/auth/inscription" as const,\n    plan: "trial" as const,\n    features: ['
);
c = c.replace(
  'cta: "Choisir Standard",\n    href: "/auth/inscription" as const,\n    features: [',
  'cta: "Choisir Standard",\n    href: "/auth/inscription" as const,\n    plan: "standard" as const,\n    features: ['
);
c = c.replace(
  'cta: "Choisir Standard Plus",\n    href: "/auth/inscription" as const,\n    features: [',
  'cta: "Choisir Standard Plus",\n    href: "/auth/inscription" as const,\n    plan: "standard_plus" as const,\n    features: ['
);
c = c.replace(
  'cta: "Passer Premium",\n    href: "/auth/inscription" as const,\n    features: [',
  'cta: "Passer Premium",\n    href: "/auth/inscription" as const,\n    plan: "premium" as const,\n    features: ['
);

// 2. Update Link to pass plan as search param
c = c.replace(
  '<Link\n                    to={p.href}\n                    className',
  '<Link\n                    to={p.href}\n                    search={{ plan: p.plan }}\n                    className'
);

fs.writeFileSync(p, c, 'utf8');
console.log('Done: index.tsx updated');