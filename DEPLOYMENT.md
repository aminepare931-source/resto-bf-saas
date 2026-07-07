# Guide de déploiement - Resto BF

Ce guide explique comment déployer votre application Resto BF pour que les QR codes soient accessibles depuis n'importe quel appareil.

## 🚀 Pourquoi déployer ?

Lorsque vous développez en local (`localhost:5173`), votre site n'est accessible que depuis votre ordinateur. Les QR codes générés pointeront vers `localhost`, ce qui provoque une erreur "Forbidden" ou "Site inaccessible" lorsqu'on les scanne avec un téléphone.

**Solution** : Déployez votre site sur un hébergeur pour le rendre accessible publiquement.

## 📦 Options de déploiement

### Option 1 : Vercel (Recommandé - Gratuit)

Vercel est la plateforme recommandée pour les projets SvelteKit/Vite.

#### Étapes :

1. **Préparer votre projet**
   ```bash
   # Installer Vercel CLI
   npm i -g vercel
   ```

2. **Déployer**
   ```bash
   cd resto-bf-saas
   vercel
   ```

3. **Suivre les instructions**
   - Confirmez le projet
   - Acceptez les paramètres par défaut
   - Vercel détectera automatiquement Vite

4. **Récupérer l'URL**
   - Vercel vous donnera une URL du type : `https://resto-bf-saas.vercel.app`
   - Cette URL est votre site public !

5. **Configurer les variables d'environnement**
   - Allez sur [vercel.com](https://vercel.com)
   - Sélectionnez votre projet
   - Allez dans **Settings** > **Environment Variables**
   - Ajoutez vos variables Supabase :
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
     - `VITE_SUPABASE_PROJECT_ID`

6. **Redéployer**
   ```bash
   vercel --prod
   ```

### Option 2 : Netlify (Gratuit)

Netlify est une autre excellente option.

#### Étapes :

1. **Préparer le build**
   ```bash
   cd resto-bf-saas
   npm run build
   ```

2. **Installer Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

3. **Déployer**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Configurer les variables d'environnement**
   - Allez sur [netlify.com](https://netlify.com)
   - Sélectionnez votre site
   - Allez dans **Site settings** > **Environment variables**
   - Ajoutez vos variables Supabase

### Option 3 : Cloudflare Pages (Gratuit)

Cloudflare Pages offre un CDN mondial performant.

#### Étapes :

1. **Préparer le build**
   ```bash
   cd resto-bf-saas
   npm run build
   ```

2. **Installer Wrangler**
   ```bash
   npm i -g wrangler
   ```

3. **Déployer**
   ```bash
   wrangler pages project create resto-bf
   wrangler pages deploy dist --project-name=resto-bf
   ```

4. **Configurer les variables d'environnement**
   ```bash
   wrangler pages secret put VITE_SUPABASE_URL
   wrangler pages secret put VITE_SUPABASE_PUBLISHABLE_KEY
   wrangler pages secret put VITE_SUPABASE_PROJECT_ID
   ```

### Option 4 : Hébergement traditionnel (OVH, Hostinger, etc.)

Si vous avez un hébergement web classique :

1. **Build local**
   ```bash
   cd resto-bf-saas
   npm run build
   ```

2. **Uploader le dossier `dist`**
   - Utilisez FTP (FileZilla) ou le gestionnaire de fichiers de votre hébergeur
   - Uploadez tout le contenu du dossier `dist` vers `public_html` ou `www`

3. **Configurer le fichier `.htaccess`** (pour Apache)
   Créez un fichier `.htaccess` dans `public_html` :
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

4. **Configurer les variables d'environnement**
   - Créez un fichier `.env.production` à la racine de votre hébergement
   - Ou modifiez le fichier `vite.config.ts` pour utiliser des variables système

## ⚙️ Configuration après déploiement

### 1. Mettre à jour Supabase

Une fois votre site déployé (ex: `https://resto-bf.vercel.app`), mettez à jour Supabase :

1. Allez dans **Authentication** > **URL Configuration**
2. **Site URL** : `https://resto-bf.vercel.app`
3. **Redirect URLs** :
   - `https://resto-bf.vercel.app/auth/callback`
   - `https://resto-bf.vercel.app/**`

### 2. Configurer Google OAuth

Dans [Google Cloud Console](https://console.cloud.google.com/) :

1. Allez dans **APIs & Services** > **Credentials**
2. Modifiez votre OAuth 2.0 Client ID
3. Ajoutez l'URI de redirection autorisée :
   - `https://resto-bf.vercel.app/auth/callback`
4. Sauvegardez

### 3. Configurer Facebook OAuth

Dans [Meta for Developers](https://developers.facebook.com/) :

1. Allez dans **Facebook Login** > **Settings**
2. Ajoutez l'URI de redirection autorisée :
   - `https://resto-bf.vercel.app/auth/callback`
3. Sauvegardez

### 4. Tester les QR codes

1. Connectez-vous au dashboard
2. Allez dans **QR Code**
3. Générez un QR code
4. Scannez-le avec votre téléphone
5. ✅ Cela devrait fonctionner maintenant !

## 🔧 Configuration avancée

### Domaine personnalisé

Au lieu d'utiliser l'URL par défaut de l'hébergeur, vous pouvez utiliser votre propre domaine :

**Exemple avec Vercel :**
1. Allez dans **Settings** > **Domains**
2. Ajoutez votre domaine (ex: `resto-bf.com`)
3. Configurez les DNS chez votre registrar

**Exemple avec Netlify :**
1. Allez dans **Domain management** > **Add custom domain**
2. Suivez les instructions DNS

### URL personnalisée par restaurant

Dans le dashboard, chaque restaurant peut avoir sa propre URL :

1. Allez dans **Paramètres** du restaurant
2. Définissez une **URL publique personnalisée**
3. Le QR code utilisera cette URL

## 🧪 Tester en local avant déploiement

### Utiliser ngrok (tunnel temporaire)

Pour tester avec un téléphone sans déployer :

1. **Installer ngrok**
   ```bash
   # Télécharger sur https://ngrok.com/download
   # Ou avec npm
   npm install -g ngrok
   ```

2. **Démarrer votre app**
   ```bash
   cd resto-bf-saas
   npm run dev
   ```

3. **Créer un tunnel**
   ```bash
   ngrok http 5173
   ```

4. **Utiliser l'URL publique**
   - ngrok vous donnera une URL du type : `https://abc123.ngrok.io`
   - Accédez à `https://abc123.ngrok.app/auth/connexion`
   - Générez un QR code
   - Scannez-le avec votre téléphone
   - ✅ Cela fonctionne !

**Note** : ngrok est gratuit pour un usage limité. Pour un usage intensif, utilisez la version payante ou déployez sur un hébergeur.

## 📊 Comparaison des hébergeurs

| Hébergeur | Gratuit | Performance | Facilité | Recommandé pour |
|-----------|---------|-------------|----------|-----------------|
| Vercel | ✅ Oui | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Production |
| Netlify | ✅ Oui | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Production |
| Cloudflare Pages | ✅ Oui | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Production |
| OVH/Hostinger | ❌ Payant | ⭐⭐⭐ | ⭐⭐ | Débutants |

## ✅ Checklist de déploiement

- [ ] Choisir un hébergeur (Vercel recommandé)
- [ ] Build du projet (`npm run build`)
- [ ] Déployer l'application
- [ ] Configurer les variables d'environnement Supabase
- [ ] Mettre à jour les URLs de redirection dans Supabase
- [ ] Mettre à jour Google OAuth avec l'URL de production
- [ ] Mettre à jour Facebook OAuth avec l'URL de production
- [ ] Tester la connexion Google
- [ ] Tester la connexion Facebook
- [ ] Tester la génération de QR codes
- [ ] Scanner un QR code avec un téléphone
- [ ] Vérifier que le site public fonctionne

## 🐛 Dépannage

### Erreur 404 après déploiement

**Problème** : Les routes SvelteKit ne fonctionnent pas

**Solution** : Vérifiez que votre hébergeur est configuré pour le SPA (Single Page Application) avec fallback vers `index.html`.

### Variables d'environnement manquantes

**Problème** : Erreur Supabase après déploiement

**Solution** : Vérifiez que toutes les variables `VITE_*` sont configurées dans votre hébergeur.

### QR code toujours en localhost

**Problème** : Le QR code pointe vers localhost

**Solution** : 
1. Vérifiez que `VITE_PUBLIC_SITE_URL` n'est pas défini en local
2. Vérifiez que `public_site_url` dans la base de données est vide ou correct
3. Redéployez après modification

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Netlify](https://docs.netlify.com/)
- [Documentation Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Guide de déploiement SvelteKit](https://kit.svelte.dev/docs/adapter-auto)

## 🎯 Prochaines étapes

1. **Déployer** votre application
2. **Configurer** les URLs dans Supabase
3. **Tester** les QR codes avec un vrai téléphone
4. **Partager** vos QR codes avec vos clients !

Une fois déployé, vos QR codes seront accessibles depuis n'importe où dans le monde.