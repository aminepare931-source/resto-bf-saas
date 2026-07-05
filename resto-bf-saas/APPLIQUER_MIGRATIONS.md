# Comment appliquer les migrations SQL sur Supabase

Ce guide vous explique étape par étape comment appliquer les migrations SQL pour ajouter les champs de facturation.

## 📋 Migrations à appliquer

Vous avez 2 fichiers de migration à appliquer :
1. `supabase/migrations/20240701_add_invoice_fields.sql` - Ajoute les champs pour les factures
2. `supabase/migrations/20240701_add_invoice_colors.sql` - Ajoute les couleurs personnalisées

## 🚀 Méthode 1 : Via le Dashboard Supabase (Recommandé)

### Étape 1 : Ouvrir le SQL Editor

1. **Allez sur** [https://app.supabase.com](https://app.supabase.com)
2. **Connectez-vous** à votre compte
3. **Sélectionnez** votre projet Resto BF
4. **Dans le menu gauche**, cliquez sur **SQL Editor**
5. **Cliquez** sur **New query**

### Étape 2 : Appliquer la première migration

1. **Ouvrez** le fichier `supabase/migrations/20240701_add_invoice_fields.sql`
2. **Copiez** tout le contenu :

```sql
-- Add missing fields to invoices table for better billing
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS table_number TEXT,
ADD COLUMN IF NOT EXISTS waiter TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN invoices.payment_method IS 'Payment method used (Espèces, Mobile Money, Carte bancaire, Virement)';
COMMENT ON COLUMN invoices.table_number IS 'Table number for restaurant orders';
COMMENT ON COLUMN invoices.waiter IS 'Waiter/waitress name who served the order';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_restaurant_id ON invoices(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issued_at ON invoices(issued_at);
```

3. **Collez** dans le SQL Editor de Supabase
4. **Cliquez** sur le bouton **Run** (ou appuyez sur Ctrl+Enter)
5. **Vérifiez** le message de succès : "Success. No rows returned"

### Étape 3 : Appliquer la deuxième migration

1. **Cliquez** sur **New query** pour créer une nouvelle requête
2. **Ouvrez** le fichier `supabase/migrations/20240701_add_invoice_colors.sql`
3. **Copiez** tout le contenu :

```sql
-- Add invoice_colors field to restaurants table for customization
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS invoice_colors JSONB DEFAULT '{"primary":"#1a1a1a","secondary":"#d4a853","text":"#1a1a1a","background":"#ffffff"}'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN restaurants.invoice_colors IS 'Custom colors for invoices and receipts (JSON with primary, secondary, text, background)';
```

4. **Collez** dans le SQL Editor
5. **Cliquez** sur **Run**
6. **Vérifiez** le message de succès

## 🔧 Méthode 2 : Via Supabase CLI (Avancé)

Si vous avez installé Supabase CLI :

### Étape 1 : Installer Supabase CLI (si nécessaire)

```bash
# Windows (avec npm)
npm install -g supabase

# Mac (avec Homebrew)
brew install supabase/tap/supabase

# Linux
curl -fsSL https://supabase.com/install.sh | bash
```

### Étape 2 : Se connecter

```bash
cd resto-bf-saas
supabase login
```

### Étape 3 : Lier le projet

```bash
# Récupérez l'ID de votre projet depuis le dashboard Supabase
# Allez dans Settings > General > Project ID
supabase link --project-ref votre-project-id
```

### Étape 4 : Appliquer les migrations

```bash
supabase db push
```

Cela appliquera automatiquement toutes les migrations du dossier `supabase/migrations/`.

## ✅ Vérification

### Vérifier que les migrations ont fonctionné

1. **Allez dans** le dashboard Supabase
2. **Cliquez** sur **Table Editor**
3. **Sélectionnez** la table `invoices`
4. **Vérifiez** que les colonnes suivantes existent :
   - `payment_method` (TEXT)
   - `table_number` (TEXT)
   - `waiter` (TEXT)

5. **Sélectionnez** la table `restaurants`
6. **Vérifiez** que la colonne suivante existe :
   - `invoice_colors` (JSONB)

### Test rapide

Exécutez cette requête SQL pour vérifier :

```sql
-- Vérifier les colonnes de invoices
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invoices' 
AND column_name IN ('payment_method', 'table_number', 'waiter');

-- Vérifier la colonne de restaurants
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name = 'invoice_colors';
```

Vous devriez voir 4 lignes pour invoices et 1 ligne pour restaurants.

## 🐛 Dépannage

### Erreur : "column already exists"

**Normal !** Cela signifie que la colonne existe déjà. La migration utilise `IF NOT EXISTS` pour éviter les erreurs.

### Erreur : "permission denied"

**Solution** : Vérifiez que vous êtes connecté avec un compte qui a les droits d'administration sur la base de données.

### Erreur : "relation does not exist"

**Solution** : La table `invoices` ou `restaurants` n'existe pas. Vérifiez que vous avez bien créé les tables avant d'appliquer les migrations.

### Les migrations ne s'appliquent pas

**Solution** : 
1. Vérifiez que vous êtes dans le bon projet Supabase
2. Vérifiez que vous avez les droits suffisants
3. Essayez la méthode 1 (dashboard) au lieu de la méthode 2 (CLI)

## 📝 Après les migrations

Une fois les migrations appliquées :

1. **Redémarrez** votre application :
   ```bash
   cd resto-bf-saas
   npm run dev
   ```

2. **Testez** la fonctionnalité de facturation :
   - Allez dans `/dashboard/facturation`
   - Créez une facture
   - Téléchargez le PDF
   - Testez la personnalisation des couleurs

3. **Vérifiez** que tout fonctionne correctement

## 🎯 Résumé rapide

**Méthode la plus simple :**
1. Ouvrir https://app.supabase.com
2. Aller dans SQL Editor
3. Copier-coller le contenu de `20240701_add_invoice_fields.sql`
4. Cliquer sur Run
5. Répéter avec `20240701_add_invoice_colors.sql`
6. C'est terminé !

## 📚 Ressources

- [Documentation Supabase SQL Editor](https://supabase.com/docs/guides/database/sql-editor)
- [Documentation Supabase CLI](https://supabase.com/docs/guides/cli)
- [Guide de test](TESTING.md)

## ⚠️ Important

- **Sauvegardez** votre base de données avant d'appliquer des migrations (si vous avez des données importantes)
- **Testez** d'abord en environnement de développement
- **Vérifiez** toujours que les migrations se sont bien appliquées