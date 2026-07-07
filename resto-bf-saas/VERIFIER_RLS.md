# Guide : Corriger l'erreur "User not allowed"

## 🔴 Problème

L'erreur "User not allowed" apparaît quand vous essayez d'ajouter un membre du staff, même si la table existe.

## ✅ Solution : Vérifier les politiques RLS dans Supabase

### Étape 1 : Allez dans Supabase Dashboard

1. Ouvrez votre projet Supabase
2. Menu gauche → **Table Editor**
3. Cliquez sur la table **`staff_members`**

### Étape 2 : Vérifiez que RLS est activé

1. Cliquez sur l'onglet **"Policies"** (en haut)
2. Vous devriez voir 4 politiques :
   - ✅ "Restaurant owners can view their own staff"
   - ✅ "Restaurant owners can insert staff"
   - ✅ "Restaurant owners can update their own staff"
   - ✅ "Restaurant owners can delete their own staff"

**Si les politiques n'existent pas**, exécutez ce SQL dans l'éditeur :

```sql
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Restaurant owners can view their own staff" ON staff_members;
DROP POLICY IF EXISTS "Restaurant owners can insert staff" ON staff_members;
DROP POLICY IF EXISTS "Restaurant owners can update their own staff" ON staff_members;
DROP POLICY IF EXISTS "Restaurant owners can delete their own staff" ON staff_members;

-- Créer les nouvelles politiques
CREATE POLICY "Restaurant owners can view their own staff"
  ON staff_members FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can insert staff"
  ON staff_members FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can update their own staff"
  ON staff_members FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can delete their own staff"
  ON staff_members FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );
```

### Étape 3 : Vérifiez la table restaurants

Assurez-vous que la table `restaurants` a bien la colonne `user_id` :

```sql
-- Vérifier la structure de la table restaurants
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name = 'user_id';
```

Si la colonne n'existe pas, exécutez :

```sql
-- Ajouter la colonne user_id si elle n'existe pas
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON restaurants(user_id);
```

### Étape 4 : Vérifiez que vous êtes bien connecté

1. Déconnectez-vous et reconnectez-vous
2. Assurez-vous que vous êtes connecté avec le compte admin (propriétaire du restaurant)

### Étape 5 : Testez à nouveau

1. Allez dans **Dashboard → Staff**
2. Cliquez sur **"Ajouter"**
3. Remplissez le formulaire
4. Cliquez sur **"Ajouter"**

Ça devrait fonctionner maintenant !

## 🔍 Diagnostic rapide

Si ça ne marche toujours pas, vérifiez dans la console du navigateur (F12) :

1. Ouvrez la console
2. Essayez d'ajouter un membre
3. Regardez l'erreur complète dans la console

L'erreur doit indiquer exactement quelle politique RLS bloque l'accès.

## 📝 Notes importantes

- Les erreurs TypeScript dans VS Code sont normales et disparaîtront après redémarrage
- La table `staff_members` doit exister (vous l'avez confirmé)
- Les politiques RLS doivent être créées (c'est ce qui bloque actuellement)
- Vous devez être connecté en tant que propriétaire du restaurant

## 🎯 Résumé

1. ✅ Table `staff_members` existe
2. ❌ Politiques RLS manquent ou sont incorrectes
3. ✅ Solution : Exécutez le SQL ci-dessus pour créer les politiques
4. ✅ Testez à nouveau