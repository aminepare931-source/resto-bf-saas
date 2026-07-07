# Configuration de l'authentification - Resto BF

Ce guide explique comment configurer les méthodes d'authentification Google et téléphone dans Supabase.

## 📋 Prérequis

- Un projet Supabase actif
- Accès au dashboard Supabase
- Un compte Google Cloud Console (pour Google OAuth)

## 🔐 Configuration de l'authentification par Google

### 1. Créer des identifiants Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez votre projet existant
3. Allez dans **APIs & Services** > **Credentials**
4. Cliquez sur **Create Credentials** > **OAuth client ID**
5. Sélectionnez **Web application**
6. Ajoutez les URIs de redirection autorisées :
   - `https://votre-projet.supabase.co/auth/v1/callback`
   - `http://localhost:8080/auth/callback` (pour le développement)
   - `http://localhost:8081/auth/callback` (pour le développement)
7. Téléchargez les identifiants (client ID et client secret)

### 2. Configurer Supabase

1. Allez dans votre dashboard Supabase
2. Naviguez vers **Authentication** > **Providers**
3. Trouvez **Google** et activez-le
4. Collez le **Client ID** et **Client secret** depuis Google Cloud Console
5. Sauvegardez les modifications

### 3. Configurer les URLs de redirection

Dans Supabase, allez dans **Authentication** > **URL Configuration** et ajoutez :
- **Site URL**: `http://localhost:8080` (développement) ou votre URL de production
- **Redirect URLs**: 
  - `http://localhost:8080/auth/callback`
  - `http://localhost:8081/auth/callback`
  - `https://votre-domaine.com/auth/callback`

## 📘 Configuration de l'authentification par Facebook

### 1. Créer une application Facebook

1. Allez sur [Meta for Developers](https://developers.facebook.com/)
2. Créez une nouvelle application ou sélectionnez votre application existante
3. Dans le tableau de bord, cliquez sur **Add Product** > **Facebook Login**
4. Sélectionnez **Web** comme plateforme

### 2. Configurer OAuth dans Facebook

1. Dans **Facebook Login** > **Settings**
2. Ajoutez les URIs de redirection autorisées :
   - `http://localhost:8080/auth/callback` (développement)
   - `http://localhost:8081/auth/callback` (développement)
   - `https://votre-domaine.com/auth/callback` (production)
3. Sauvegardez les modifications

### 3. Récupérer les identifiants

1. Dans **Settings** > **Basic**
2. Copiez :
   - **App ID** (Client ID)
   - **App Secret** (Client Secret)

### 4. Configurer Supabase

1. Allez dans votre dashboard Supabase
2. Naviguez vers **Authentication** > **Providers**
3. Trouvez **Facebook** et activez-le
4. Collez l'**App ID** et l'**App Secret** depuis Facebook
5. Sauvegardez les modifications

### 5. Configurer les URLs de redirection dans Supabase

Dans Supabase, allez dans **Authentication** > **URL Configuration** et ajoutez :
- **Site URL**: `http://localhost:8080` (développement) ou votre URL de production
- **Redirect URLs**: 
  - `http://localhost:8080/auth/callback`
  - `http://localhost:8081/auth/callback`
  - `https://votre-domaine.com/auth/callback`

## 🧪 Tester l'authentification

### Test de la connexion Google

1. Démarrez votre application : `npm run dev`
2. Allez sur `http://localhost:8080/auth/connexion` (ou 8081)
3. Cliquez sur **"Continuer avec Google"**
4. Connectez-vous avec votre compte Google
5. Vous devriez être redirigé vers `/dashboard`

### Test de la connexion Facebook

1. Démarrez votre application : `npm run dev`
2. Allez sur `http://localhost:8080/auth/connexion` (ou 8081)
3. Cliquez sur **"Continuer avec Facebook"**
4. Connectez-vous avec votre compte Facebook
5. Vous devriez être redirigé vers `/dashboard`

## ⚠️ Notes importantes

### Pour le développement local

- Utilisez `http://localhost:8080` ou `http://localhost:8081` comme URL de redirection
- Assurez-vous que ces URLs sont autorisées dans Supabase

### Pour la production

1. Remplacez toutes les occurrences de `localhost:5173` par votre domaine de production
2. Ajoutez vos URLs de production dans Supabase (Authentication > URL Configuration)
3. Configurez les URLs de redirection OAuth Google avec votre domaine

### Sécurité

- Ne commitez jamais vos clés secrètes (client secret, tokens)
- Utilisez des variables d'environnement pour les clés sensibles
- En production, utilisez HTTPS obligatoirement

## 🔧 Dépannage

### Erreur "Invalid OAuth redirect URI"

Vérifiez que l'URI de redirection est exactement la même dans :
- Google Cloud Console
- Supabase (Authentication > URL Configuration)

### Erreur "Facebook provider not enabled"

Activez le provider Facebook dans Supabase > Authentication > Providers

### Erreur "Invalid OAuth redirect URI"

Vérifiez que l'URI de redirection est exactement la même dans :
- Meta for Developers (Facebook Login Settings)
- Supabase (Authentication > URL Configuration)

### La connexion Facebook ne fonctionne pas

- Vérifiez que votre application Facebook est en mode **Live** (pas Development)
- Vérifiez que l'App ID et l'App Secret sont corrects dans Supabase
- Vérifiez que les URLs de redirection sont autorisées

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Twilio pour Supabase](https://supabase.com/docs/guides/auth/phone-login/twilio)
- [Format E.164](https://en.wikipedia.org/wiki/E.164)

## ✅ Checklist de configuration

- [ ] Créer les identifiants Google OAuth
- [ ] Configurer Google provider dans Supabase
- [ ] Activer Facebook provider dans Supabase
- [ ] Créer et configurer l'application Facebook
- [ ] Ajouter les URLs de redirection dans Supabase
- [ ] Tester la connexion Google
- [ ] Tester la connexion Facebook
- [ ] Configurer pour la production (HTTPS, domaines)
