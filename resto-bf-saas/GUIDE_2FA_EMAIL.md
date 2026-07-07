# Guide : Configuration 2FA par Email avec Supabase Edge Functions

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer l'envoi du code PIN 2FA par email en utilisant Supabase Edge Functions et Resend (service d'email).

## 🚀 Étape 1 : Créer un compte Resend

Resend est un service d'email moderne et fiable, parfait pour les applications.

1. **Inscription**
   - Allez sur [resend.com](https://resend.com)
   - Créez un compte gratuit
   - Le plan gratuit permet d'envoyer 100 emails/jour (suffisant pour commencer)

2. **Vérifier votre domaine**
   - Dans le dashboard Resend, allez dans "Domains"
   - Ajoutez votre domaine (ex: `votre-restaurant.com`)
   - Suivez les instructions pour ajouter les enregistrements DNS
   - Attendez la vérification (quelques minutes)

3. **Récupérer votre clé API**
   - Allez dans "API Keys"
   - Cliquez sur "Create API Key"
   - Donnez un nom (ex: "Resto BF 2FA")
   - Copiez la clé (elle ne sera affichée qu'une seule fois !)

## ⚙️ Étape 2 : Configurer Supabase Edge Functions

### 2.1 Installer Supabase CLI

```bash
# Windows (avec npm)
npm install -g supabase

# Ou avec Homebrew (Mac/Linux)
brew install supabase/tap/supabase
```

### 2.2 Se connecter à Supabase

```bash
supabase login
```

### 2.3 Lier votre projet

```bash
cd resto-bf-saas
supabase link --project-ref votre-project-id
```

Pour trouver votre project ID :
- Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
- Sélectionnez votre projet
- L'ID est dans l'URL : `supabase.com/dashboard/project/_/settings/general`

### 2.4 Configurer les secrets

```bash
# Ajouter la clé API Resend
supabase secrets set RESEND_API_KEY=votre_cle_api_resend_ici
```

### 2.5 Déployer la fonction

```bash
# Déployer la fonction send-2fa-email
supabase functions deploy send-2fa-email
```

### 2.6 Vérifier le déploiement

```bash
# Voir les fonctions déployées
supabase functions list
```

Vous devriez voir `send-2fa-email` dans la liste.

## 🔧 Étape 3 : Mettre à jour le code frontend

Le code dans `super-admin.tsx` est déjà configuré pour appeler la fonction. Vérifiez juste que la ligne suivante est bien présente :

```typescript
const { error } = await supabase.functions.invoke('send-2fa-email', {
  body: { email, pin }
});
```

Cette ligne est déjà dans le code, il suffit de décommenter la partie qui appelle `sendPINByEmail()`.

## 🧪 Étape 4 : Tester la fonction

### Option 1 : Tester depuis Supabase Dashboard

1. Allez dans votre dashboard Supabase
2. Menu "Edge Functions" → "send-2fa-email"
3. Cliquez sur "Test function"
4. Entrez un email de test et un PIN
5. Cliquez sur "Run"

### Option 2 : Tester depuis le frontend

1. Lancez votre application en développement
2. Allez sur `/super-admin`
3. Entrez le mot de passe : `admin-1-2-3`
4. Vérifiez que vous recevez l'email avec le code PIN

## 📧 Étape 5 : Personnaliser l'email

Dans le fichier `supabase/functions/send-2fa-email/index.ts`, modifiez ces lignes :

```typescript
from: "Resto BF <noreply@votre-domaine.com>", // Remplacez par votre email
```

Et personnalisez le contenu HTML selon votre branding :
- Couleurs
- Logo
- Texte
- Design

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais commit les clés API**
   - Les secrets sont stockés dans Supabase, pas dans le code
   - Vérifiez que `.gitignore` contient bien les fichiers sensibles

2. **Rate limiting**
   - Resend limite automatiquement les envois
   - Ajoutez un délai entre les tentatives dans le frontend

3. **PIN à usage unique**
   - Le PIN généré est valable 10 minutes
   - Il est détruit après utilisation

4. **HTTPS obligatoire**
   - Supabase Edge Functions sont automatiquement en HTTPS
   - Jamais d'appel HTTP en production

## 🐛 Dépannage

### Erreur : "RESEND_API_KEY non configuré"

```bash
# Vérifiez que le secret est bien configuré
supabase secrets list

# Si absent, ajoutez-le
supabase secrets set RESEND_API_KEY=votre_cle
```

### Erreur : "Email non envoyé"

1. Vérifiez que votre domaine est bien vérifié dans Resend
2. Vérifiez les logs de la fonction :
   ```bash
   supabase functions logs send-2fa-email
   ```

### Erreur : "Module not found"

Les imports dans la Edge Function utilisent des URLs Deno, c'est normal. Le déploiement fonctionnera correctement.

## 📊 Monitoring

### Voir les logs

```bash
# En temps réel
supabase functions logs send-2fa-email --follow

# Dernières 100 lignes
supabase functions logs send-2fa-email --limit 100
```

### Statistiques Resend

- Dashboard Resend → "Emails"
- Voir le taux de délivrabilité
- Voir les erreurs (bounces, spam, etc.)

## 🚀 Production

### Checklist avant mise en production

- [ ] Domaine vérifié dans Resend
- [ ] Clé API RESEND_API_KEY configurée dans Supabase
- [ ] Fonction déployée et testée
- [ ] Email "from" configuré avec votre domaine
- [ ] Tests d'envoi réussis
- [ ] Monitoring en place

### Coûts

- **Resend** : 100 emails/jour gratuits, puis $20/mois pour 50k emails
- **Supabase Edge Functions** : 500k invocations/mois gratuites, puis $0.25/million

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Exemples d'emails Resend](https://resend.com/templates)

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs Supabase
2. Vérifiez les logs Resend
3. Testez la fonction manuellement depuis le dashboard
4. Vérifiez que le domaine est bien vérifié dans Resend

---

**Note** : Ce système est maintenant prêt pour la production. Le PIN sera bien envoyé par email à chaque tentative de connexion au super-admin !