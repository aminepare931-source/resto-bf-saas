# Guide de test - Resto BF

Ce guide vous aide à tester les fonctionnalités de facturation et les templates de facture.

## 🧪 Tests à effectuer

### 1. Appliquer les migrations SQL

Avant de tester, assurez-vous d'appliquer les migrations dans Supabase :

```bash
# Option 1: Via le dashboard Supabase
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans "SQL Editor"
4. Copiez-collez le contenu de :
   - supabase/migrations/20240701_add_invoice_fields.sql
   - supabase/migrations/20240701_add_invoice_colors.sql
5. Cliquez sur "Run"

# Option 2: Via Supabase CLI (si installé)
cd resto-bf-saas
supabase db push
```

### 2. Tester la génération de factures

#### Test 1 : Facture Standard (Plan Standard)

1. **Démarrez l'application**
   ```bash
   cd resto-bf-saas
   npm run dev
   ```

2. **Connectez-vous** avec un compte Standard

3. **Allez dans** `/dashboard/facturation`

4. **Vérifiez** :
   - [ ] Le message "Premium uniquement" s'affiche (car Standard n'a pas accès)
   - [ ] Le design est professionnel avec en-tête doré
   - [ ] Les couleurs correspondent au template Standard

#### Test 2 : Facture Premium (Plan Premium)

1. **Connectez-vous** avec un compte Premium

2. **Allez dans** `/dashboard/facturation`

3. **Vérifiez** :
   - [ ] La page s'affiche complètement
   - [ ] Le bouton "Personnaliser" est visible
   - [ ] Le bouton "Nouvelle facture" est visible

4. **Créez une facture** :
   - [ ] Cliquez sur "+ Nouvelle facture"
   - [ ] Remplissez les informations client
   - [ ] Ajoutez des lignes de articles
   - [ ] Définissez la TVA
   - [ ] Cliquez sur "Créer la facture"

5. **Téléchargez le PDF** :
   - [ ] Cliquez sur "PDF"
   - [ ] Vérifiez que le fichier se télécharge
   - [ ] Ouvrez le PDF et vérifiez :
     - [ ] Le logo du restaurant apparaît (si configuré)
     - [ ] Les couleurs sont correctes (noir et or par défaut)
     - [ ] Toutes les informations sont présentes
     - [ ] Le total est correct

6. **Téléchargez le reçu** :
   - [ ] Cliquez sur "Reçu"
   - [ ] Vérifiez que le fichier se télécharge
   - [ ] Ouvrez le PDF et vérifiez le format

#### Test 3 : Personnalisation des couleurs (Premium uniquement)

1. **Allez dans** `/dashboard/facturation`

2. **Cliquez sur** "🎨 Personnaliser"

3. **Testez les préréglages** :
   - [ ] "Élégant Noir & Or" - Applique les couleurs par défaut
   - [ ] "Bleu Professionnel" - Change en bleu
   - [ ] "Vert Nature" - Change en vert
   - [ ] "Rouge Dynamique" - Change en rouge
   - [ ] "Violet Premium" - Change en violet
   - [ ] "Orange Énergique" - Change en orange

4. **Testez les couleurs personnalisées** :
   - [ ] Changez la couleur principale
   - [ ] Changez la couleur secondaire
   - [ ] Changez la couleur du texte
   - [ ] Changez la couleur de fond
   - [ ] Vérifiez l'aperçu en temps réel

5. **Sauvegardez** :
   - [ ] Cliquez sur "Enregistrer les couleurs"
   - [ ] Vérifiez le message de succès
   - [ ] Générez une nouvelle facture
   - [ ] Vérifiez que les nouvelles couleurs sont appliquées

### 3. Tester les différents plans

#### Plan Gratuit
- [ ] Accès à la facturation refusé
- [ ] Message "Premium uniquement" affiché
- [ ] Design du message est attrayant

#### Plan Standard
- [ ] Accès à la facturation autorisé
- [ ] Template Standard appliqué
- [ ] Pas de bouton "Personnaliser"
- [ ] Factures fonctionnelles

#### Plan Premium
- [ ] Accès à la facturation autorisé
- [ ] Template Premium appliqué
- [ ] Bouton "Personnaliser" visible
- [ ] Personnalisation fonctionnelle
- [ ] Logo apparaît dans les factures

### 4. Tester les champs de facture

#### Champs obligatoires
- [ ] Nom du client (requis)
- [ ] Description des articles (requis)
- [ ] Quantité (requise)
- [ ] Prix unitaire (requis)

#### Champs optionnels
- [ ] Email client
- [ ] Téléphone client
- [ ] Adresse client
- [ ] N° de table
- [ ] Serveur/Serveuse
- [ ] Mode de paiement
- [ ] Date d'échéance
- [ ] Notes

#### Calculs automatiques
- [ ] Sous-total calculé correctement
- [ ] TVA calculée correctement
- [ ] Total calculé correctement
- [ ] Mise à jour en temps réel

### 5. Tester la gestion des factures

#### Liste des factures
- [ ] Affichage de la liste
- [ ] Tri par date (plus récent en premier)
- [ ] Affichage du numéro, client, date, total, statut
- [ ] Actions disponibles (PDF, Reçu, Supprimer)

#### Changement de statut
- [ ] Passer de "Impayé" à "Payé"
- [ ] Passer de "Impayé" à "Annulé"
- [ ] Le statut se met à jour dans la liste

#### Suppression
- [ ] Confirmation avant suppression
- [ ] Facture supprimée de la liste
- [ ] Message de succès

### 6. Tester les templates PDF

#### Template Standard
- [ ] En-tête avec couleur dorée
- [ ] Informations restaurant
- [ ] Informations client
- [ ] Tableau des articles
- [ ] Totaux (sous-total, TVA, total)
- [ ] Notes

#### Template Premium
- [ ] Logo du restaurant (si configuré)
- [ ] Couleurs personnalisées
- [ ] Design avancé avec bordures
- [ ] Informations supplémentaires (table, serveur, paiement)
- [ ] Pied de page personnalisé
- [ ] Qualité d'impression optimale

### 7. Tests de compatibilité

#### Navigateurs
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (si disponible)

#### Appareils
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### 8. Tests de performance

- [ ] Chargement initial < 2 secondes
- [ ] Génération PDF < 3 secondes
- [ ] Sauvegarde des couleurs < 1 seconde
- [ ] Pas de lag dans l'interface

## 🐛 Bugs connus à vérifier

### Critiques
- [ ] Les factures se génèrent correctement
- [ ] Les couleurs s'appliquent correctement
- [ ] Le logo s'affiche dans les PDF
- [ ] Les calculs sont exacts

### Mineurs
- [ ] Pas d'erreurs dans la console
- [ ] Pas de warnings ESLint
- [ ] Pas de warnings TypeScript
- [ ] Linting passe sans erreur

## ✅ Checklist de validation

### Avant de déployer
- [ ] Tous les tests passent
- [ ] Les migrations SQL sont appliquées
- [ ] Les variables d'environnement sont configurées
- [ ] Le build fonctionne (`npm run build`)
- [ ] Pas d'erreurs de linting
- [ ] Pas d'erreurs TypeScript
- [ ] Les PDFs sont lisibles et bien formatés
- [ ] Les couleurs s'appliquent correctement
- [ ] Le logo s'affiche (si configuré)

### Après déploiement
- [ ] Tester en production
- [ ] Vérifier les URLs de redirection
- [ ] Tester avec un vrai téléphone (pour QR codes)
- [ ] Vérifier les performances en production

## 📊 Résultats attendus

### Template Standard
- Facture simple et professionnelle
- En-tête doré (#d4a853)
- Tableau rayé
- Pied de page avec totaux

### Template Premium
- Facture personnalisable
- Logo en haut à gauche
- Couleurs configurables
- Design élégant avec bordures
- Informations supplémentaires
- Pied de page personnalisé

### Personnalisation
- 6 thèmes prédéfinis
- 4 couleurs personnalisables
- Aperçu en temps réel
- Sauvegarde automatique
- Application immédiate

## 🎯 Prochaines étapes après les tests

1. **Corriger les bugs** trouvés
2. **Améliorer** l'expérience utilisateur
3. **Ajouter** de nouveaux templates
4. **Optimiser** les performances
5. **Déployer** en production

## 📝 Notes de test

Ajoutez vos observations ici :

```
Date: 01/07/2026
Testeur: [Nom]
Résultat: [Succès/Échec]
Bugs trouvés: [Liste]
Notes: [Commentaires]
```

## 🔍 Debugging

### Problème : Les couleurs ne s'appliquent pas
**Solution** : Vérifiez que la migration `20240701_add_invoice_colors.sql` a été appliquée.

### Problème : Le logo n'apparaît pas
**Solution** : Vérifiez que `logo_url` est défini dans le profil du restaurant.

### Problème : Erreur de génération PDF
**Solution** : Vérifiez la console pour les erreurs détaillées. Assurez-vous que jsPDF et jspdf-autotable sont installés.

### Problème : Migration SQL échoue
**Solution** : Vérifiez les permissions de la base de données. Assurez-vous d'être connecté en tant que superuser.