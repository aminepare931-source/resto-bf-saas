# Guide : Accéder à l'Interface Cuisinier

## 🔴 Problème : "Not found" sur /auth/staff-login

Cela signifie que le serveur n'a pas été redémarré après la création du fichier.

## ✅ Solution en 3 étapes

### Étape 1 : Vérifier que le fichier existe

Le fichier `staff-login.tsx` doit être dans :
```
resto-bf-saas/src/routes/auth/staff-login.tsx
```

### Étape 2 : Redémarrer le serveur

**IMPORTANT** : Vous devez redémarrer le serveur à chaque fois que vous ajoutez une nouvelle route.

```bash
# 1. Arrêtez le serveur (Ctrl+C dans le terminal)

# 2. Redémarrez
npm run dev
```

### Étape 3 : Accéder à la page

Ouvrez votre navigateur et allez sur :
```
http://localhost:5173/auth/staff-login
```

## 🎯 Workflow complet pour tester

### 1. **En tant qu'admin (propriétaire)**

1. **Connectez-vous** sur `http://localhost:5173/auth/connexion`
2. **Allez dans Staff** : Dashboard → Staff (ou `/dashboard/staff`)
3. **Ajoutez un cuisinier** :
   - Nom : Jean Dupont
   - Email : jean@restaurant.com
   - Rôle : Cuisinier
   - Cliquez sur "Ajouter"

### 2. **En tant que cuisinier (Jean)**

1. **Ouvrez un navigateur privé** (ou demandez à Jean de se connecter)
2. **Allez sur** : `http://localhost:5173/auth/staff-login`
3. **Connectez-vous** :
   - Email : jean@restaurant.com
   - Mot de passe : (celui créé lors de l'invitation)
4. **Vous êtes redirigé vers** : `/dashboard/cuisine`

## 📱 Interface Cuisine

Une fois connecté, le cuisinier voit :

```
┌─────────────────────────────────────┐
│  👨‍🍳 Espace Cuisine                 │
├─────────────────────────────────────┤
│                                     │
│  ⚠️ Alertes Stock (si bas)          │
│                                     │
│  [Commandes] [Stocks]               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📌 EN ATTENTE               │   │
│  │ • Commande #1 - Table 3     │   │
│  │   [Commencer]               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔥 EN PRÉPARATION           │   │
│  │ • Commande #2 - Table 5     │   │
│  │   [Marquer prêt]            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✅ PRÊTES                   │   │
│  │ • Commande #3 - Table 2     │   │
│  │   [Livré]                   │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 🔍 Diagnostic si ça ne marche pas

### Vérification 1 : Le serveur tourne ?

```bash
# Dans le terminal, vous devriez voir :
# ➜  Local: http://localhost:5173/
# ➜  Network: http://192.168.x.x:5173/
```

Si vous ne voyez pas ça, le serveur n'est pas démarré.

### Vérification 2 : Le fichier existe ?

```bash
# Vérifiez que ce fichier existe :
ls resto-bf-saas/src/routes/auth/staff-login.tsx
```

### Vérification 3 : Les migrations sont appliquées ?

Dans Supabase Dashboard → SQL Editor, vérifiez que vous avez exécuté :
- Migration 1 : Champs invoices
- Migration 2 : Table stocks
- Migration 3 : Système de rôles (staff_members)

### Vérification 4 : Les politiques RLS sont créées ?

Dans Supabase Dashboard → Table Editor → staff_members → Policies
Vous devriez voir 4 politiques.

## 🆘 Si ça ne marche toujours pas

1. **Vérifiez la console du navigateur** (F12)
   - Onglet "Console"
   - Cherchez les erreurs en rouge

2. **Vérifiez les logs du serveur**
   - Dans le terminal où tourne `npm run dev`
   - Cherchez les erreurs

3. **Redémarrez complètement**
   ```bash
   # Arrêtez le serveur
   Ctrl+C
   
   # Supprimez le cache
   rm -rf node_modules/.vite
   
   # Redémarrez
   npm run dev
   ```

## 📝 Notes importantes

- **Le serveur doit être redémarré** après chaque modification de fichier
- **Les migrations SQL doivent être appliquées** dans Supabase
- **Les politiques RLS doivent exister** dans Supabase
- **Vous devez être déconnecté/reconnecté** après les modifications

## ✅ Test rapide

1. Redémarrez le serveur : `npm run dev`
2. Allez sur : `http://localhost:5173/auth/staff-login`
3. Vous devriez voir la page de login du staff

Si vous voyez "Not found", c'est que le serveur n'a pas été redémarré.