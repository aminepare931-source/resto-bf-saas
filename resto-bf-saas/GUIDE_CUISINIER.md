# Guide pour le Cuisinier - Accès à l'Espace Cuisine

## 📋 Vue d'ensemble

Le cuisinier a un **accès séparé** de l'admin. Il ne voit que la cuisine et ne peut pas accéder aux autres parties du système.

---

## 🚀 Étape 1 : L'admin crée le compte du cuisinier

1. **L'admin se connecte** sur `/auth/connexion` avec son compte habituel

2. **Accéder à la page Staff**
   - Aller dans le menu : **Staff** (icône : 👥)
   - Ou directement : `/dashboard/staff`

3. **Ajouter un nouveau membre**
   - Cliquer sur le bouton **"Ajouter"**
   - Remplir le formulaire :
     - **Nom complet** : Jean Dupont
     - **Email** : jean@restaurant.com
     - **Téléphone** (optionnel) : +226 01 02 03 04
     - **Rôle** : Sélectionner **"Cuisinier"**
   - Cliquer sur **"Ajouter"**

4. **Invitation envoyée**
   - Un email est envoyé à jean@restaurant.com
   - L'invitation contient un lien pour créer un mot de passe

---

## 🔐 Étape 2 : Le cuisinier crée son compte

1. **Ouvrir l'email d'invitation**
   - L'email vient de Supabase
   - Cliquer sur le lien dans l'email

2. **Créer un mot de passe**
   - Entrer un mot de passe sécurisé
   - Confirmer le mot de passe
   - Le compte est créé

---

## 👨‍🍳 Étape 3 : Le cuisinier se connecte

1. **Aller sur la page de login staff**
   - URL : `http://localhost:5173/auth/staff-login`
   - Ou : `https://votre-domaine.com/auth/staff-login`

2. **Se connecter**
   - Email : jean@restaurant.com
   - Mot de passe : (celui créé à l'étape 2)
   - Cliquer sur **"Se connecter"**

3. **Redirection automatique**
   - Après connexion, le cuisinier est automatiquement redirigé vers `/dashboard/cuisine`

---

## 📱 Étape 4 : Utiliser l'espace cuisine

### Interface de la cuisine

L'espace cuisine contient :

**1. Alertes de stock (en haut)**
- Affiche les articles en stock bas (orange) ou critique (rouge)
- Exemple : "Poulet (2 kg) - CRITIQUE"

**2. Onglets**
- **Commandes** : Voir et gérer les commandes
- **Stocks** : Voir et gérer les stocks

### Gestion des commandes

**Les commandes sont classées en 3 sections :**

#### 📌 En attente (jaune/ambre)
- Commandes qui arrivent mais pas encore commencées
- Action : Cliquer sur **"Commencer"** pour passer en préparation

#### 🔥 En préparation (bleu)
- Commandes en cours de préparation
- Action : Cliquer sur **"Marquer prêt"** quand c'est fini

#### ✅ Prêtes (vert)
- Commandes prêtes à être servies
- Action : Cliquer sur **"Livré"** quand le serveur a servi

### Exemple de workflow complet

```
1. Client commande → Commande apparaît dans "En attente"
2. Cuisinier clique "Commencer" → Commande passe dans "En préparation"
3. Cuisinier prépare le plat
4. Cuisinier clique "Marquer prêt" → Commande passe dans "Prêtes"
5. Serveur voit la commande prête et la sert
6. Serveur clique "Livré" → Commande disparaît de la liste
```

### Gestion des stocks

**Dans l'onglet "Stocks" :**
- Voir tous les ingrédients avec leurs quantités
- Bouton **"Utiliser"** : Diminuer la quantité (ex: -1 kg de riz)
- Bouton **"Ajouter"** : Augmenter la quantité (ex: +5 kg de riz)

---

## 🔒 Sécurité

### Ce que le cuisinier PEUT faire :
- ✅ Voir les commandes
- ✅ Mettre à jour le statut des commandes
- ✅ Voir les stocks
- ✅ Modifier les quantités de stocks

### Ce que le cuisinier NE PEUT PAS faire :
- ❌ Accéder aux paramètres du restaurant
- ❌ Voir les statistiques
- ❌ Gérer le personnel
- ❌ Modifier les templates de facturation
- ❌ Accéder à la facturation

---

## 📱 Accès depuis un téléphone

Le cuisinier peut accéder à l'espace cuisine depuis son téléphone :

1. **URL de connexion** : `https://votre-domaine.com/auth/staff-login`
2. **Interface responsive** : S'adapte aux écrans mobiles
3. **Pas besoin d'installer d'app** : Utiliser le navigateur du téléphone

---

## ❓ FAQ

**Q : Le cuisinier a oublié son mot de passe ?**
R : L'admin peut supprimer le membre et le réinviter, ou utiliser "Mot de passe oublié" sur la page de login.

**Q : Comment changer le rôle d'un cuisinier ?**
R : L'admin va dans Staff, clique sur le membre, et change le rôle.

**Q : Le cuisinier peut-il créer des factures ?**
R : Non, c'est réservé à l'admin. Le cuisinier prépare les commandes, l'admin facture.

**Q : Que se passe-t-il si le cuisinier ferme la page ?**
R : Les commandes sont sauvegardées en base de données. Quand il se reconnecte, il voit toutes les commandes en cours.

---

## 🆘 Support

En cas de problème :
1. Vérifier que la migration SQL a été appliquée
2. Vérifier que le cuisinier a bien été ajouté dans Staff
3. Vérifier que l'email d'invitation a été reçu
4. Consulter les logs dans la console du navigateur (F12)