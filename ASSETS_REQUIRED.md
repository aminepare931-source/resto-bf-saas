# ASSETS REQUIS — Resto BF

**Objectif** : Liste complète de tous les assets (images, logos, backgrounds, animations, icônes) nécessaires pour reproduire le projet à 100%.

---

## 📁 STRUCTURE DES ASSETS

```
public/
├── bg-marché.jpg          # Background template Marché
├── bg-moderne.jpg         # Background template Moderne
├── bg-saas.jpg            # Background page SaaS (dashboard)
├── bg-savane.jpg          # Background template Savane
├── bg-soleil.webp         # Background template Soleil
├── manifest.webmanifest   # Manifest PWA
├── restobf-logo.png       # Logo principal Resto BF
├── icons/                 # Icônes PWA
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   └── apple-touch-icon.png
└── premium-bgs/           # Backgrounds templates Premium
    ├── premium-feu-bg.png
    ├── premium-grill-bg.png
    ├── premium-orange-bg.png
    └── premium-pasta-bg.png
```

---

## 🖼️ IMAGES DE FOND (BACKGROUNDS)

### 1. `bg-saas.jpg`
**Utilisation** : Background principal du dashboard et pages authentifiées  
**Format** : JPG  
**Dimensions recommandées** : 1920x1080px minimum  
**Style** : Texture sombre avec motif subtil  
**Couleurs** : Tons sombres (#0a0a0f à #1a1a24)  
**Répétition** : repeat (360px)  
**Blend mode** : overlay  
**Opacity** : 94% (via pseudo-élément ::before)

**Spécifications CSS** :
```css
body {
  background-image: url("/bg-saas.jpg");
  background-repeat: repeat;
  background-size: 360px;
  background-attachment: fixed;
  background-blend-mode: overlay;
}
```

**Génération** : 
- Créer une texture sombre avec motif géométrique subtil
- Couleurs : #0a0a0f, #111118, #1a1a24
- Motif : grille fine ou points espacés
- Format : JPG haute qualité

---

### 2. `bg-marché.jpg`
**Utilisation** : Background template "Marché" (vert/orange)  
**Format** : JPG  
**Dimensions recommandées** : 1920x1080px minimum  
**Style** : Marché africain coloré  
**Couleurs** : Vert foncé (#0d2818), orange (#ed8023)  
**Animation** : drift lent (22s)

**Spécifications CSS** :
```css
.tpl-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(1.08) contrast(1.1);
  transform: scale(1.08);
  animation: tpl-bg-drift 22s ease-in-out infinite alternate;
}
```

**Génération** :
- Photo de marché africain (légumes, épices, couleurs vives)
- Flou léger pour éviter la distraction
- Saturation augmentée de 8%
- Contraste augmenté de 10%

---

### 3. `bg-savane.jpg`
**Utilisation** : Background template "Savane" (ocre/rust)  
**Format** : JPG  
**Dimensions recommandées** : 1920x1080px minimum  
**Style** : Paysage africain, terre cuite  
**Couleurs** : Ocre (#b95036), marron (#7a2e1d)  
**Animation** : drift lent (22s)

**Génération** :
- Photo de savane africaine au coucher du soleil
- Tons chauds : orange, ocre, marron
- Flou léger
- Saturation et contraste augmentés

---

### 4. `bg-moderne.jpg`
**Utilisation** : Background template "Moderne" (bleu/gris)  
**Format** : JPG  
**Dimensions recommandées** : 1920x1080px minimum  
**Style** : Architecture moderne, minimaliste  
**Couleurs** : Bleu foncé (#2c3e50), gris (#1a1a2e)  
**Animation** : drift lent (22s)

**Génération** :
- Photo architecture moderne (bâtiment en béton, verre)
- Tons froids : bleu, gris, noir
- Minimaliste, épuré
- Flou léger

---

### 5. `bg-soleil.webp`
**Utilisation** : Background template "Soleil" (crème/or)  
**Format** : WebP (meilleure compression)  
**Dimensions recommandées** : 1920x1080px minimum  
**Style** : Lumineux, chaleureux, éditorial  
**Couleurs** : Crème (#d4a853), or (#b08800)  
**Animation** : drift lent (22s)

**Génération** :
- Photo lumineuse (restaurant terrasse, lumière du soleil)
- Tons chauds : crème, or, beige
- Haute luminosité
- Format WebP pour optimisation

---

## 🎨 BACKGROUNDS PREMIUM

### 6. `premium-feu-bg.png`
**Utilisation** : Template Premium "Ignis Feu" (braises animées)  
**Format** : PNG (avec transparence si nécessaire)  
**Dimensions recommandées** : 1920x1080px minimum  
**Style** : Feu, braises, grillades  
**Couleurs** : Rouge (#ef4444), orange (#f59e0b), jaune (#fbbf24)  
**Animation** : Particules de feu animées

**Génération** :
- Image de feu/braises en haute qualité
- Effet de chaleur
- Particules animées (CSS)
- Format PNG pour qualité maximale

---

### 7. `premium-grill-bg.png`
**Utilisation** : Template Premium "Luxe Grill"  
**Format** : PNG  
**Dimensions recommandées** : 1920x1080px minimum  
**Style** : Grillade premium, luxe  
**Couleurs** : Noir, or, rouge  
**Animation** : Aucune (statique)

**Génération** :
- Photo de grillade premium
- Ambiance luxe (nuit, lumière tamisée)
- Tons sombres avec accents dorés

---

### 8. `premium-orange-bg.png`
**Utilisation** : Template Premium "Palais Royal"  
**Format** : PNG  
**Dimensions recommandées** : 1920x1080px minimum  
**Style** : Royal, or, luxe  
**Couleurs** : Or (#d4a853), orange, noir  
**Animation** : Aucune (statique)

**Génération** :
- Texture dorée luxueuse
- Motif royal (arabesques, dorures)
- Ambiance palace

---

### 9. `premium-pasta-bg.png`
**Utilisation** : Template Premium "Aurum Nuit"  
**Format** : PNG  
**Dimensions recommandées** : 1920x1080px minimum  
**Style** : Fine dining sombre, élégant  
**Couleurs** : Noir, or, violet  
**Animation** : Aucune (statique)

**Génération** :
- Photo fine dining (assiette élégante, ambiance sombre)
- Tons sombres avec accents dorés
- Ambiance nuit, élégante

---

## 🎯 LOGO

### 10. `restobf-logo.png`
**Utilisation** : Logo principal de l'application  
**Format** : PNG (avec transparence)  
**Dimensions recommandées** : 512x512px minimum  
**Style** : Moderne, épuré  
**Couleurs** : Or (#d4a853) sur fond transparent  
**Taille affichage** : 80x80px (landing), 32x32px (nav)

**Spécifications** :
```tsx
// Landing page
<img src="/restobf-logo.png" alt="RestoBF" className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white object-contain p-2 shadow-gold" />

// Navigation
<img src="/restobf-logo.png" alt="RestoBF" className="h-8 w-auto object-contain rounded" />
```

**Génération** :
- Créer un logo moderne avec initiales "RB" ou "Resto BF"
- Couleur : #d4a853 (or)
- Fond transparent
- Format PNG HD
- Variantes : claire (sur fond sombre) et sombre (sur fond clair)

---

## 📱 ICÔNES PWA

### 11. Icônes dans `/icons/`

**Utilisation** : Manifest PWA, favicon, apple-touch-icon  
**Formats** : PNG  
**Dimensions** :

| Fichier | Dimensions | Usage |
|---------|-----------|-------|
| `icon-72x72.png` | 72x72px | Android Chrome |
| `icon-96x96.png` | 96x96px | Android Chrome |
| `icon-128x128.png` | 128x128px | Chrome Web Store |
| `icon-144x144.png` | 144x144px | IE10 Metro tile |
| `icon-152x152.png` | 152x152px | iOS Touch icon |
| `icon-192x192.png` | 192x192px | Android Chrome |
| `icon-384x384.png` | 384x384px | Android Chrome |
| `icon-512x512.png` | 512x512px | Android Chrome, PWA |
| `apple-touch-icon.png` | 180x180px | iOS Safari |

**Style** :
- Logo Resto BF centré
- Fond : #0a0a0f (noir) ou transparent
- Coins arrondis (iOS)
- Ombre portée légère

**Génération** :
- Utiliser un outil comme https://favicon.io/
- Ou créer manuellement avec Figma/Photoshop
- Exporter en PNG HD

---

## 🎭 ANIMATIONS CSS (DÉJÀ DANS LE CODE)

### 12. Animations intégrées (pas d'assets nécessaires)

Les animations suivantes sont déjà codées en CSS dans `src/styles.css` :

#### `reveal-up`
```css
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
```
**Usage** : Apparition des sections au scroll

#### `float-particle`
```css
@keyframes float-particle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-30px) scale(1.2); opacity: 0.8; }
}
```
**Usage** : Particules flottantes décoratives

#### `grid-drift`
```css
@keyframes grid-drift {
  0% { background-position: 0 0; }
  100% { background-position: 60px 60px; }
}
```
**Usage** : Grille de fond animée

#### `logo-pulse`
```css
@keyframes logo-pulse {
  0%, 100% { filter: drop-shadow(0 4px 12px rgba(212,168,83,0.3)); }
  50% { filter: drop-shadow(0 4px 24px rgba(212,168,83,0.6)); }
}
```
**Usage** : Pulsation du logo

#### `shimmer`
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```
**Usage** : Effet de brillance (loading)

#### `slide-up`
```css
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```
**Usage** : Modale qui slide depuis le bas

#### `tpl-bg-drift`
```css
@keyframes tpl-bg-drift {
  0% { transform: scale(1.08) translate3d(-1.5%,0,0); }
  100% { transform: scale(1.18) translate3d(1.5%,-1.5%,0); }
}
```
**Usage** : Background des templates qui dérive lentement

---

## 🎨 ASSETS GÉNÉRÉS PAR CODE (PAS DE FICHIERS)

### 13. Particules (Particles)
**Composant** : `src/components/landing/Particles.tsx`  
**Type** : Généré dynamiquement en React  
**Couleur** : #d4a853 (or)  
**Taille** : 4x4px  
**Animation** : float-particle (8s)

**Pas d'asset nécessaire** - Les particules sont créées en code.

---

### 14. Grille de fond (Grid Background)
**Classe CSS** : `.grid-bg`  
**Type** : Généré en CSS  
**Couleur** : rgba(212,168,83,0.04)  
**Taille** : 60x60px

**Pas d'asset nécessaire** - La grille est créée en CSS.

```css
.grid-bg {
  background-image:
    linear-gradient(rgba(212,168,83,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212,168,83,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: grid-drift 25s linear infinite;
}
```

---

### 15. Gradients CSS
**Utilisation** : Partout dans l'app  
**Type** : Générés en CSS

#### Gradient Gold
```css
--gradient-gold: linear-gradient(135deg, #d4a853, #f0d48a, #b08800);
```
**Usage** : Boutons, textes, ombres

#### Gradient Dark
```css
--gradient-dark: linear-gradient(180deg, #0a0a0f 0%, #111118 100%);
```
**Usage** : Overlays, backgrounds

---

## 🔤 POLICES (GOOGLE FONTS)

### 16. Polices à charger

**Utilisation** : Templates publics  
**Source** : Google Fonts  
**URL** : https://fonts.googleapis.com/css2?family=...

#### Polices UI
```
Inter (weights: 300, 400, 500, 600, 700, 800, 900)
```

#### Polices Templates
```
Playfair Display (weights: 400, 700, 900, italic)
Cormorant Garamond (weights: 400, 600, 700, italic)
Poppins (weights: 400, 500, 600, 700)
Montserrat (weights: 400, 500, 600, 700)
DM Serif Display (weight: 400)
Bebas Neue (weight: 400)
Archivo Black (weight: 400)
Space Grotesk (weights: 400, 500, 700)
```

**Import dans le code** :
```tsx
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;800;900&family=Bebas+Neue&family=Archivo+Black&family=DM+Serif+Display&family=Space+Grotesk:wght@400;500;700&display=swap" />
```

---

## 📦 ASSETS SUPABASE STORAGE

### 17. Images uploadées par les utilisateurs

Ces images sont stockées dans Supabase Storage et ne font pas partie du code source :

#### `menu_items.image_url`
**Format** : JPG, PNG, WebP  
**Dimensions** : 800x800px recommandé  
**Taille max** : 5MB  
**Bucket** : `restaurant-files`  
**Path** : `{restaurant_id}/menu/{item_id}.jpg`

#### `gallery_images.image_url`
**Format** : JPG, PNG, WebP  
**Dimensions** : 1920x1080px recommandé  
**Taille max** : 5MB  
**Bucket** : `restaurant-files`  
**Path** : `{restaurant_id}/gallery/{image_id}.jpg`

#### `restaurants.logo_url`
**Format** : PNG (avec transparence)  
**Dimensions** : 512x512px minimum  
**Taille max** : 3MB  
**Bucket** : `restaurant-files`  
**Path** : `{restaurant_id}/logo.jpg`

---

## 🎨 ICÔNES LUCIDE REACT

### 18. Icônes utilisées (librairie Lucide React)

**Installation** : `npm install lucide-react`  
**Version** : 0.575.0

**Icônes utilisées dans le projet** :

```
- TrendingUp
- TrendingDown
- DollarSign
- Receipt
- Award
- Clock
- AlertCircle
- BarChart3
- PieChart
- ArrowUpRight
- ArrowDownRight
- UserPlus
- Trash2
- Shield
- ChefHat
- User
- Eye
- EyeOff
- Copy
- Pencil
- Phone
- Calendar
- Send
- Users
- Plus
- Minus
- Search
- Filter
- Download
- Upload
- Image
- Settings
- Home
- Menu
- X
- Check
- ChevronDown
- ChevronUp
- ChevronRight
- ChevronLeft
- MoreVertical
- MoreHorizontal
- Edit
- Delete
- Save
- Cancel
- RefreshCw
- Wifi
- WifiOff
- Printer
- Copy
- ExternalLink
- Link
- Mail
- MessageSquare
- PhoneCall
- Video
- MapPin
- Navigation
- Star
- Heart
- ThumbsUp
- Clock
- CalendarDays
- Timer
- Bell
- BellOff
- Volume2
- VolumeX
- Play
- Pause
- SkipForward
- SkipBack
- Maximize
- Minimize
- RotateCcw
- RotateCw
- ZoomIn
- ZoomOut
- Crop
- Palette
- Brush
- Type
- AlignLeft
- AlignCenter
- AlignRight
- AlignJustify
- List
- ListOrdered
- CheckSquare
- Square
- Circle
- Triangle
- Hexagon
- Octagon
- Pentagon
```

**Utilisation** :
```tsx
import { TrendingUp, DollarSign, Receipt } from "lucide-react";

<TrendingUp className="w-5 h-5 text-gold" />
```

---

## 🎬 ANIMATIONS LOTTIE (OPTIONNEL)

### 19. Animations Lottie (si utilisées)

**Librairie** : `lottie-react`  
**Utilisation** : Loading spinners, animations complexes

**Fichiers nécessaires** (si utilisés) :
```
public/
├── lottie/
│   ├── loading.json
│   ├── success.json
│   ├── error.json
│   └── empty-state.json
```

**Note** : Le projet utilise principalement des animations CSS, pas de Lottie.

---

## 🎵 AUDIO (OPTIONNEL)

### 20. Sons de notification

**Utilisation** : Notification sonore nouvelle commande  
**Format** : MP3  
**Durée** : < 2s  
**Taille** : < 50KB

**Fichier** :
```
public/
└── audio/
    └── notification.mp3
```

**Implémentation** :
```tsx
const audio = new Audio("/audio/notification.mp3");
audio.play();
```

**Note** : Actuellement, le projet utilise l'API Web Audio API pour générer des sons, pas de fichiers audio.

---

## 📊 IMAGES DÉMO (TEMPLATES)

### 21. Images de démonstration

**Utilisation** : Preview des templates dans le dashboard  
**Format** : JPG/PNG  
**Dimensions** : Variables

**Fichiers** (si nécessaire) :
```
public/
└── demo/
    ├── template-classique.jpg
    ├── template-soleil.jpg
    ├── template-savane.jpg
    ├── template-marche.jpg
    ├── template-moderne.jpg
    ├── template-royal.jpg
    ├── template-nuit.jpg
    ├── template-feu.jpg
    └── template-luxe.jpg
```

**Note** : Les templates utilisent des données démo générées en code (`demo-data.ts`), pas d'images statiques.

---

## 🎨 ICÔNES PERSONNALISÉES

### 22. Icônes custom (si nécessaire)

**Format** : SVG ou PNG  
**Dimensions** : 24x24px, 48x48px, 64x64px

**Fichiers** (si nécessaire) :
```
public/
└── icons/
    ├── custom-icon-1.svg
    ├── custom-icon-2.svg
    └── ...
```

**Note** : Le projet utilise Lucide React pour toutes les icônes, pas d'icônes custom.

---

## 📦 ASSETS À GÉNÉRER

### 23. Checklist de génération

#### Backgrounds (5 fichiers)
- [ ] `bg-saas.jpg` - Texture sombre motif grille
- [ ] `bg-marché.jpg` - Marché africain coloré
- [ ] `bg-savane.jpg` - Savane africaine
- [ ] `bg-moderne.jpg` - Architecture moderne
- [ ] `bg-soleil.webp` - Lumineux, chaleureux

#### Premium Backgrounds (4 fichiers)
- [ ] `premium-feu-bg.png` - Feu/braises
- [ ] `premium-grill-bg.png` - Grillade premium
- [ ] `premium-orange-bg.png` - Royal/or
- [ ] `premium-pasta-bg.png` - Fine dining sombre

#### Logo (1 fichier)
- [ ] `restobf-logo.png` - Logo principal (512x512px)

#### Icônes PWA (9 fichiers)
- [ ] `icon-72x72.png`
- [ ] `icon-96x96.png`
- [ ] `icon-128x128.png`
- [ ] `icon-144x144.png`
- [ ] `icon-152x152.png`
- [ ] `icon-192x192.png`
- [ ] `icon-384x384.png`
- [ ] `icon-512x512.png`
- [ ] `apple-touch-icon.png`

**Total** : 19 fichiers d'assets statiques

---

## 🛠️ OUTILS DE GÉNÉRATION

### 24. Recommandations

#### Pour les backgrounds
- **Unsplash** : https://unsplash.com (photos gratuites)
- **Pexels** : https://pexels.com (photos gratuites)
- **Figma** : Créer des textures personnalisées
- **Photoshop** : Édition avancée

#### Pour le logo
- **Figma** : Création vectorielle
- **Adobe Illustrator** : Création vectorielle
- **Canva** : Création rapide
- **Logo Maker** : Générateur automatique

#### Pour les icônes PWA
- **Favicon.io** : https://favicon.io
- **RealFaviconGenerator** : https://realfavicongenerator.net
- **Figma** : Création manuelle

#### Pour l'optimisation
- **TinyPNG** : https://tinypng.com (compression JPG/PNG)
- **Squoosh** : https://squoosh.app (compression WebP)
- **ImageOptim** : Compression Mac

---

## 📏 SPÉCIFICATIONS TECHNIQUES

### 25. Formats et tailles

#### Images de fond
- **Format** : JPG (qualité 85%)
- **Dimensions** : 1920x1080px minimum
- **Taille fichier** : < 500KB
- **Compression** : Sans perte visible

#### Logo
- **Format** : PNG (transparence)
- **Dimensions** : 512x512px minimum
- **Taille fichier** : < 100KB
- **Fond** : Transparent

#### Icônes PWA
- **Format** : PNG
- **Dimensions** : Voir tableau section 11
- **Taille fichier** : < 50KB chacune
- **Fond** : Transparent ou #0a0a0f

#### Premium Backgrounds
- **Format** : PNG (qualité maximale)
- **Dimensions** : 1920x1080px minimum
- **Taille fichier** : < 1MB
- **Fond** : Transparent si nécessaire

---

## 🎨 PALETTE DE COULEURS (RÉFÉRENCE)

### 26. Couleurs à utiliser pour les assets

```css
/* Brand Colors */
--gold: #d4a853;
--gold-light: #f0d48a;
--gold-dark: #b08800;

/* Dark Theme */
--dark: #0a0a0f;
--dark-card: #111118;
--dark-card-hover: #1a1a24;

/* Template Colors */
/* Marché */
--marche-green: #0d2818;
--marche-orange: #ed8023;

/* Savane */
--savane-ocre: #b95036;
--savane-brown: #7a2e1d;

/* Moderne */
--moderne-blue: #2c3e50;
--moderne-gray: #1a1a2e;

/* Soleil */
--soleil-cream: #d4a853;
--soleil-gold: #b08800;

/* Premium */
--premium-red: #ef4444;
--premium-orange: #f59e0b;
--premium-yellow: #fbbf24;
```

---

## ✅ CHECKLIST DE GÉNÉRATION

### Fichiers obligatoires
- [ ] bg-saas.jpg
- [ ] bg-marché.jpg
- [ ] bg-savane.jpg
- [ ] bg-moderne.jpg
- [ ] bg-soleil.webp
- [ ] premium-feu-bg.png
- [ ] premium-grill-bg.png
- [ ] premium-orange-bg.png
- [ ] premium-pasta-bg.png
- [ ] restobf-logo.png
- [ ] icon-72x72.png
- [ ] icon-96x96.png
- [ ] icon-128x128.png
- [ ] icon-144x144.png
- [ ] icon-152x152.png
- [ ] icon-192x192.png
- [ ] icon-384x384.png
- [ ] icon-512x512.png
- [ ] apple-touch-icon.png

**Total** : 19 fichiers

### Vérifications
- [ ] Tous les formats sont corrects (JPG, PNG, WebP)
- [ ] Toutes les dimensions sont respectées
- [ ] Toutes les tailles de fichiers sont optimisées (< 500KB)
- [ ] Toutes les couleurs correspondent au design system
- [ ] Tous les logos ont un fond transparent
- [ ] Toutes les icônes PWA sont générées

---

## 🚀 INTÉGRATION DANS LE PROJET

### 27. Placement des fichiers

1. **Copier tous les assets** dans le dossier `public/`
2. **Vérifier les chemins** dans le code :
   - `/bg-saas.jpg`
   - `/bg-marché.jpg`
   - `/restobf-logo.png`
   - `/icons/icon-512x512.png`
   - `/premium-bgs/premium-feu-bg.png`
3. **Tester le chargement** des images
4. **Vérifier le PWA** manifest et icônes

---

## 📝 NOTES IMPORTANTES

### 28. Points d'attention

1. **Performance** : Optimiser toutes les images (compression sans perte)
2. **Responsive** : Les backgrounds doivent être fluides sur tous les écrans
3. **PWA** : Les icônes PWA sont obligatoires pour l'installation
4. **SEO** : Le logo doit être en PNG HD pour le favicon
5. **Accessibilité** : Ajouter des alt texts sur toutes les images
6. **Cache** : Les assets statiques sont mis en cache par le service worker

---

## 🎯 LIVRABLE FINAL

### Fichiers à fournir
1. **Dossier `public/` complet** avec tous les assets
2. **README des assets** (ce fichier)
3. **Licences** des images (si libres de droits)

### Vérification
- [ ] Toutes les images se chargent correctement
- [ ] Le PWA s'installe correctement
- [ ] Les backgrounds s'affichent sur tous les templates
- [ ] Le logo s'affiche sur toutes les pages
- [ ] Les icônes PWA fonctionnent

---

**Fin du document des assets**