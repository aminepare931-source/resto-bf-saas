# Mettre RestoBF en marche — checklist (≈ 20 min)

Branche : `super-admin` (à fusionner dans `main` après les étapes 1 à 3).

## 1. Base de données (Supabase → SQL Editor)
1. Exécuter **dans l'ordre** (copier / coller dans le SQL Editor, **Run**) :
   1. `supabase/migrations/20260810000000_super_admin_full_control.sql`
   2. `supabase/migrations/20260810000001_features_media_reviews.sql` (colonne vidéo en galerie + réponses aux avis)
   Le script peut être rejoué sans risque. Il fait :
   - droits complets du super admin sur toutes les tables ;
   - fonctions `admin_list_users`, `admin_set_super_admin`, `admin_delete_user` ;
   - **protection de la facturation** : un client ne peut plus changer son `plan` / abonnement lui-même ;
   - **inscription = toujours essai 14 jours** (avant : le forfait venait d'un champ modifiable par le client) ;
   - expiration automatique : un essai/abonnement dépassé coupe le site public ;
   - colonne `slug` sur `plan_features` (les réglages « Fonctionnalités » s'enregistrent enfin).
2. Vérifier : `select count(*) from plan_features where slug is not null;` → doit renvoyer ~73.
3. Vérifier que ton compte est bien super admin :
   `select * from user_roles where role = 'super_admin';`
   (sinon : se connecter puis lancer `select claim_super_admin();`).

## 2. Variables d'environnement (hébergeur)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_PROJECT_ID=...
```
Ne jamais mettre `SUPABASE_SERVICE_ROLE_KEY` côté navigateur (pas de préfixe `VITE_`).

## 3. Supabase → Authentication
- **SMTP personnalisé** (Settings → Auth → SMTP) : l'envoi par défaut est limité à quelques e-mails par heure,
  les inscriptions (confirmation e-mail activée) seraient bloquées dès les premiers clients.
- URL du site (Site URL) + URL de redirection = ton domaine final.
- Supprimer la fonction `send-2fa-email` dans Edge Functions si elle est déployée (elle n'existe plus dans le code).
- Activer la MFA (TOTP) sur ton compte super admin.

## 4. Déploiement
`npm run build` fonctionne (vérifié). Fusionner `super-admin` dans `main` : l'hébergeur redéploie automatiquement.

## 5. Premier test (5 min)
1. S'inscrire avec un compte test → un restaurant en **essai** est créé.
2. `/super-admin` → onglet **Restaurants** : modifier, suspendre, réactiver.
3. Suspendre le restaurant test → son site public affiche « Site temporairement indisponible ».
4. **Fonctionnalités** : décocher « Réservations avancées » pour Standard → le bouton Réserver disparaît sur un site Standard.
5. **Données** : modérer un avis, un plat, une photo ; **Comptes** : liste des utilisateurs.

## Activer un client payant
Super admin → Abonnements → choisir le forfait → « Activer » (1 mois). À la fin, le site se coupe tout seul.

## Fonctionnalités par forfait (important)
Onglet **Fonctionnalités** du super admin : chaque ligne a un statut.
- **Appliquée** : cocher / décocher change vraiment ce que voient les clients (menu, galerie, vidéos, avis, QR, stats, exports, rapports, templates, branding…).
- **Non reliée / À développer / Service manuel** : case grisée, car elle n'aurait aucun effet.
Le tableau de bord verrouille les pages non incluses dans le forfait (cadenas dans le menu) et le site public masque les sections non incluses.
