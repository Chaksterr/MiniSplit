# 🗄️ Modèle Relationnel de la Base de Données - MiniSplit

Ce document présente le schéma relationnel complet de la base de données PostgreSQL utilisée par l'application MiniSplit.

---

## 📊 Schéma Relationnel Complet

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BASE DE DONNÉES: minisplit_db                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       user           │
├──────────────────────┤
│ 🔑 id (PK)           │ INTEGER AUTO_INCREMENT
│ 📛 name              │ VARCHAR(255) NOT NULL
│ 📧 email (UK)        │ VARCHAR(255) NOT NULL UNIQUE
│ 🔒 password          │ VARCHAR(255) NOT NULL (bcrypt hash)
└──────────────────────┘
          │
          │ 1
          │
          ├─────────────────────────────────────┐
          │                                      │
          │ N                                    │ 1
┌──────────────────────┐                        │
│   group_member       │                        │
├──────────────────────┤                        │
│ 🔑 id (PK)           │ INTEGER AUTO_INCREMENT │
│ 🔗 userId (FK)       │ → user.id             │
│ 🔗 groupId (FK)      │ → group.id            │
│ 👤 role              │ VARCHAR(50) DEFAULT 'member'
└──────────────────────┘                        │
          │                                      │
          │ N                                    │
          │                                      │
          │ 1                                    │
┌──────────────────────┐                        │
│       group          │◄───────────────────────┘
├──────────────────────┤
│ 🔑 id (PK)           │ INTEGER AUTO_INCREMENT
│ 📛 name (UK)         │ VARCHAR(255) NOT NULL UNIQUE
│ 📝 description       │ TEXT NULLABLE
└──────────────────────┘
          │
          │ 1
          │
          ├─────────────────────────────────────┬─────────────────────┐
          │                                      │                     │
          │ N                                    │ N                   │ N
┌──────────────────────┐              ┌──────────────────────┐ ┌──────────────────────┐
│      expense         │              │     category         │ │    settlement        │
├──────────────────────┤              ├──────────────────────┤ ├──────────────────────┤
│ 🔑 id (PK)           │ INTEGER      │ 🔑 id (PK)           │ │ 🔑 id (PK)           │
│ 📛 title             │ VARCHAR(255) │ 📛 name              │ │ 💰 amount            │ DECIMAL(10,3)
│ 💰 amount            │ DECIMAL(10,3)│ 🎨 icon              │ │ 📅 date              │ TIMESTAMP
│ 💱 currency          │ VARCHAR(3)   │ 🎨 color             │ │ 📊 status            │ ENUM
│ 📅 date              │ TIMESTAMP    │ ⭐ isDefault         │ │ 📝 notes             │ TEXT NULLABLE
│ 📊 splitType         │ VARCHAR(50)  │ 📅 createdAt         │ │ 🖼️ proofImage        │ VARCHAR NULLABLE
│ 🔧 splitDetails      │ JSONB        │ 🔗 createdBy (FK)    │ │ 📅 createdAt         │ TIMESTAMP
│ 📝 notes             │ TEXT         │ 🔗 groupId (FK)      │ │ 🔗 fromUserId (FK)   │ → user.id
│ 📅 createdAt         │ TIMESTAMP    └──────────────────────┘ │ 🔗 toUserId (FK)     │ → user.id
│ 🔗 paidBy (FK)       │ → user.id             │                │ 🔗 groupId (FK)      │ → group.id
│ 🔗 groupId (FK)      │ → group.id            │ 1              └──────────────────────┘
│ 🔗 categoryId (FK)   │ → category.id         │                         │
└──────────────────────┘                       │                         │ N
          │                                     │                         │
          │ N                                   │ N                       │ 1
          │                                     │                ┌──────────────────────┐
          │                           ┌─────────┘                │       group          │
          │ N                         │                          └──────────────────────┘
┌──────────────────────┐              │
│ expense_participants │              │
├──────────────────────┤              │
│ 🔗 expense_id (FK)   │ → expense.id │
│ 🔗 user_id (FK)      │ → user.id    │
└──────────────────────┘              │
   PK(expense_id, user_id)            │
          │                            │
          │ N                          │
          │                            │
          │ 1                          │ N
┌──────────────────────┐              │
│       user           │◄─────────────┘
└──────────────────────┘
          │
          │ 1
          │
          │ N
┌──────────────────────┐
│      activity        │
├──────────────────────┤
│ 🔑 id (PK)           │ INTEGER AUTO_INCREMENT
│ 📊 action            │ ENUM(ActivityAction)
│ 🔖 entityType        │ VARCHAR(100) NULLABLE
│ 🔢 entityId          │ INTEGER NULLABLE
│ 🔧 details           │ JSONB NULLABLE
│ 📅 createdAt         │ TIMESTAMP
│ 🔗 userId (FK)       │ → user.id
│ 🔗 groupId (FK)      │ → group.id (NULLABLE)
└──────────────────────┘
          │
          │ N
          │
          │ 1
┌──────────────────────┐
│       group          │
└──────────────────────┘
```

---

## 📋 Description Détaillée des Tables

### 1️⃣ **Table `user`**

Stocke les informations des utilisateurs de l'application.

```sql
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    
    CONSTRAINT user_email_unique UNIQUE (email)
);

-- Index
CREATE INDEX idx_user_email ON "user"(email);
```

| Colonne    | Type         | Contraintes                  | Description                                    |
|------------|--------------|------------------------------|------------------------------------------------|
| `id`       | SERIAL       | PRIMARY KEY                  | Identifiant unique auto-incrémenté            |
| `name`     | VARCHAR(255) | NOT NULL                     | Nom complet de l'utilisateur                  |
| `email`    | VARCHAR(255) | NOT NULL, UNIQUE             | Adresse email (utilisée pour l'authentification)|
| `password` | VARCHAR(255) | NOT NULL                     | Mot de passe hashé avec bcrypt (10 rounds)    |

**Hooks applicatifs** :
- `@BeforeInsert()` : Hash automatique du mot de passe avant insertion

**Sécurité** :
- Le mot de passe est automatiquement exclu des réponses API via `@Exclude()`
- Validation de l'email avec regex côté application
- Longueur minimale du mot de passe : 6 caractères

---

### 2️⃣ **Table `group`**

Représente un groupe de dépenses partagées.

```sql
CREATE TABLE "group" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    
    CONSTRAINT group_name_unique UNIQUE (name)
);

-- Index
CREATE INDEX idx_group_name ON "group"(name);
```

| Colonne       | Type         | Contraintes     | Description                             |
|---------------|--------------|-----------------|-----------------------------------------|
| `id`          | SERIAL       | PRIMARY KEY     | Identifiant unique auto-incrémenté     |
| `name`        | VARCHAR(255) | NOT NULL, UNIQUE| Nom du groupe (unique)                 |
| `description` | TEXT         | NULLABLE        | Description optionnelle du groupe      |

**Contraintes métier** :
- Le nom du groupe doit être unique
- Validation de la non-vacuité du nom côté application

---

### 3️⃣ **Table `group_member`**

Table de liaison Many-to-Many entre `user` et `group`.

```sql
CREATE TABLE "group_member" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    
    CONSTRAINT fk_group_member_user FOREIGN KEY ("userId") 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_member_group FOREIGN KEY ("groupId") 
        REFERENCES "group"(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_group UNIQUE ("userId", "groupId")
);

-- Index
CREATE INDEX idx_group_member_user ON "group_member"("userId");
CREATE INDEX idx_group_member_group ON "group_member"("groupId");
```

| Colonne   | Type        | Contraintes                    | Description                               |
|-----------|-------------|--------------------------------|-------------------------------------------|
| `id`      | SERIAL      | PRIMARY KEY                    | Identifiant unique                       |
| `userId`  | INTEGER     | NOT NULL, FK → user.id         | Référence vers l'utilisateur             |
| `groupId` | INTEGER     | NOT NULL, FK → group.id        | Référence vers le groupe                 |
| `role`    | VARCHAR(50) | DEFAULT 'member'               | Rôle de l'utilisateur dans le groupe     |

**Contraintes** :
- Contrainte d'unicité sur (`userId`, `groupId`) : un utilisateur ne peut être membre d'un groupe qu'une seule fois
- `ON DELETE CASCADE` : Si un user ou un group est supprimé, les appartenances sont supprimées

---

### 4️⃣ **Table `expense`**

Enregistre toutes les dépenses effectuées dans les groupes.

```sql
CREATE TABLE "expense" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10,3) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TND',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "splitType" VARCHAR(50) DEFAULT 'equal',
    "splitDetails" JSONB,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "paidBy" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "categoryId" INTEGER,
    
    CONSTRAINT fk_expense_paidby FOREIGN KEY ("paidBy") 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_group FOREIGN KEY ("groupId") 
        REFERENCES "group"(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_category FOREIGN KEY ("categoryId") 
        REFERENCES "category"(id) ON DELETE SET NULL,
    CONSTRAINT check_amount_positive CHECK (amount > 0)
);

-- Index
CREATE INDEX idx_expense_group ON "expense"("groupId");
CREATE INDEX idx_expense_paidby ON "expense"("paidBy");
CREATE INDEX idx_expense_date ON "expense"(date DESC);
CREATE INDEX idx_expense_category ON "expense"("categoryId");
```

| Colonne        | Type          | Contraintes                    | Description                               |
|----------------|---------------|--------------------------------|-------------------------------------------|
| `id`           | SERIAL        | PRIMARY KEY                    | Identifiant unique                       |
| `title`        | VARCHAR(255)  | NOT NULL                       | Titre/description de la dépense          |
| `amount`       | DECIMAL(10,3) | NOT NULL, CHECK > 0            | Montant de la dépense (3 décimales)      |
| `currency`     | VARCHAR(3)    | DEFAULT 'TND'                  | Code ISO de la devise                    |
| `date`         | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP      | Date de la dépense                       |
| `splitType`    | VARCHAR(50)   | DEFAULT 'equal'                | Type de division (equal, percentage, etc.)|
| `splitDetails` | JSONB         | NULLABLE                       | Détails de division personnalisée        |
| `notes`        | TEXT          | NULLABLE                       | Notes/commentaires                       |
| `createdAt`    | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP      | Date de création de l'enregistrement     |
| `paidBy`       | INTEGER       | NOT NULL, FK → user.id         | Utilisateur qui a payé                   |
| `groupId`      | INTEGER       | NOT NULL, FK → group.id        | Groupe concerné                          |
| `categoryId`   | INTEGER       | NULLABLE, FK → category.id     | Catégorie de la dépense                  |

**Contraintes** :
- `amount` doit être strictement positif
- `ON DELETE CASCADE` : Si l'utilisateur ou le groupe est supprimé, la dépense est supprimée
- `ON DELETE SET NULL` : Si la catégorie est supprimée, le champ `categoryId` devient null

---

### 5️⃣ **Table `expense_participants`**

Table de liaison Many-to-Many entre `expense` et `user` (participants).

```sql
CREATE TABLE "expense_participants" (
    expense_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    
    PRIMARY KEY (expense_id, user_id),
    CONSTRAINT fk_expense_participants_expense FOREIGN KEY (expense_id) 
        REFERENCES "expense"(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_participants_user FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX idx_expense_participants_expense ON "expense_participants"(expense_id);
CREATE INDEX idx_expense_participants_user ON "expense_participants"(user_id);
```

| Colonne      | Type    | Contraintes                    | Description                        |
|--------------|---------|--------------------------------|------------------------------------|
| `expense_id` | INTEGER | NOT NULL, FK → expense.id      | Référence vers la dépense         |
| `user_id`    | INTEGER | NOT NULL, FK → user.id         | Référence vers l'utilisateur      |

**Clé Primaire Composite** : (`expense_id`, `user_id`)

**Contraintes** :
- `ON DELETE CASCADE` : Si la dépense ou l'utilisateur est supprimé, la relation est supprimée

---

### 6️⃣ **Table `category`**

Catégories pour organiser les dépenses.

```sql
CREATE TABLE "category" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(10) DEFAULT '📦',
    color VARCHAR(7) DEFAULT '#6366f1',
    "isDefault" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "groupId" INTEGER,
    
    CONSTRAINT fk_category_createdby FOREIGN KEY ("createdBy") 
        REFERENCES "user"(id) ON DELETE SET NULL,
    CONSTRAINT fk_category_group FOREIGN KEY ("groupId") 
        REFERENCES "group"(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX idx_category_group ON "category"("groupId");
CREATE INDEX idx_category_default ON "category"("isDefault");
CREATE INDEX idx_category_createdby ON "category"("createdBy");
```

| Colonne      | Type         | Contraintes                    | Description                                    |
|--------------|--------------|--------------------------------|------------------------------------------------|
| `id`         | SERIAL       | PRIMARY KEY                    | Identifiant unique                            |
| `name`       | VARCHAR(255) | NOT NULL                       | Nom de la catégorie                           |
| `icon`       | VARCHAR(10)  | DEFAULT '📦'                   | Emoji/icône représentant la catégorie         |
| `color`      | VARCHAR(7)   | DEFAULT '#6366f1'              | Couleur hexadécimale de la catégorie          |
| `isDefault`  | BOOLEAN      | DEFAULT FALSE                  | Catégorie par défaut (non modifiable)         |
| `createdAt`  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP      | Date de création                              |
| `createdBy`  | INTEGER      | NULLABLE, FK → user.id         | Utilisateur créateur                          |
| `groupId`    | INTEGER      | NULLABLE, FK → group.id        | Groupe associé (null = catégorie globale)     |

**Contraintes** :
- Si `isDefault = true`, la catégorie ne peut pas être modifiée ou supprimée (validation applicative)
- Si `groupId = null`, la catégorie est globale (visible par tous)
- `ON DELETE CASCADE` : Si le groupe est supprimé, les catégories spécifiques sont supprimées
- `ON DELETE SET NULL` : Si l'utilisateur est supprimé, `createdBy` devient null

---

### 7️⃣ **Table `settlement`**

Enregistre les remboursements entre utilisateurs.

```sql
CREATE TABLE "settlement" (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,3) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'completed',
    notes TEXT,
    "proofImage" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    
    CONSTRAINT fk_settlement_fromuser FOREIGN KEY ("fromUserId") 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_settlement_touser FOREIGN KEY ("toUserId") 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_settlement_group FOREIGN KEY ("groupId") 
        REFERENCES "group"(id) ON DELETE CASCADE,
    CONSTRAINT check_amount_positive CHECK (amount > 0),
    CONSTRAINT check_different_users CHECK ("fromUserId" != "toUserId")
);

-- Index
CREATE INDEX idx_settlement_fromuser ON "settlement"("fromUserId");
CREATE INDEX idx_settlement_touser ON "settlement"("toUserId");
CREATE INDEX idx_settlement_group ON "settlement"("groupId");
CREATE INDEX idx_settlement_date ON "settlement"(date DESC);
CREATE INDEX idx_settlement_status ON "settlement"(status);
```

| Colonne       | Type          | Contraintes                    | Description                                |
|---------------|---------------|--------------------------------|--------------------------------------------|
| `id`          | SERIAL        | PRIMARY KEY                    | Identifiant unique                        |
| `amount`      | DECIMAL(10,3) | NOT NULL, CHECK > 0            | Montant du remboursement                  |
| `date`        | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP      | Date du remboursement                     |
| `status`      | VARCHAR(20)   | DEFAULT 'completed'            | Statut : pending, completed, cancelled    |
| `notes`       | TEXT          | NULLABLE                       | Notes/commentaires                        |
| `proofImage`  | VARCHAR(500)  | NULLABLE                       | URL de la preuve de paiement              |
| `createdAt`   | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP      | Date de création de l'enregistrement      |
| `fromUserId`  | INTEGER       | NOT NULL, FK → user.id         | Utilisateur qui paie                      |
| `toUserId`    | INTEGER       | NOT NULL, FK → user.id         | Utilisateur qui reçoit                    |
| `groupId`     | INTEGER       | NOT NULL, FK → group.id        | Groupe concerné                           |

**Contraintes** :
- `amount` doit être strictement positif
- `fromUserId` ≠ `toUserId` (un utilisateur ne peut pas se rembourser lui-même)
- `ON DELETE CASCADE` : Si l'utilisateur ou le groupe est supprimé, le remboursement est supprimé

**Valeurs de `status`** :
- `pending` : En attente de confirmation
- `completed` : Remboursement effectué (par défaut)
- `cancelled` : Remboursement annulé

---

### 8️⃣ **Table `activity`**

Journal d'audit de toutes les actions effectuées dans l'application.

```sql
CREATE TABLE "activity" (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    "entityType" VARCHAR(100),
    "entityId" INTEGER,
    details JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER,
    
    CONSTRAINT fk_activity_user FOREIGN KEY ("userId") 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_activity_group FOREIGN KEY ("groupId") 
        REFERENCES "group"(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX idx_activity_user ON "activity"("userId");
CREATE INDEX idx_activity_group ON "activity"("groupId");
CREATE INDEX idx_activity_action ON "activity"(action);
CREATE INDEX idx_activity_created ON "activity"("createdAt" DESC);
CREATE INDEX idx_activity_entity ON "activity"("entityType", "entityId");
```

| Colonne      | Type         | Contraintes                    | Description                                |
|--------------|--------------|--------------------------------|--------------------------------------------|
| `id`         | SERIAL       | PRIMARY KEY                    | Identifiant unique                        |
| `action`     | VARCHAR(50)  | NOT NULL                       | Type d'action (enum ActivityAction)       |
| `entityType` | VARCHAR(100) | NULLABLE                       | Type d'entité concernée                   |
| `entityId`   | INTEGER      | NULLABLE                       | ID de l'entité concernée                  |
| `details`    | JSONB        | NULLABLE                       | Détails supplémentaires en JSON           |
| `createdAt`  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP      | Date et heure de l'action                 |
| `userId`     | INTEGER      | NOT NULL, FK → user.id         | Utilisateur ayant effectué l'action       |
| `groupId`    | INTEGER      | NULLABLE, FK → group.id        | Groupe concerné (si applicable)           |

**Contraintes** :
- Les activités sont en lecture seule (pas de UPDATE/DELETE en production)
- `ON DELETE CASCADE` : Si l'utilisateur ou le groupe est supprimé, les activités sont supprimées

**Valeurs de `action`** (enum `ActivityAction`) :
- `USER_REGISTERED`, `USER_UPDATED`
- `GROUP_CREATED`, `GROUP_UPDATED`, `GROUP_DELETED`
- `MEMBER_JOINED`, `MEMBER_LEFT`
- `EXPENSE_ADDED`, `EXPENSE_UPDATED`, `EXPENSE_DELETED`
- `SETTLEMENT_CREATED`, `SETTLEMENT_UPDATED`
- `CATEGORY_CREATED`, `CATEGORY_UPDATED`, `CATEGORY_DELETED`

---

## 🔐 Contraintes d'Intégrité Référentielle

### Règles de Suppression en Cascade

| Table Source        | Colonne FK      | Table Cible | Action ON DELETE |
|---------------------|-----------------|-------------|------------------|
| `group_member`      | `userId`        | `user`      | CASCADE          |
| `group_member`      | `groupId`       | `group`     | CASCADE          |
| `expense`           | `paidBy`        | `user`      | CASCADE          |
| `expense`           | `groupId`       | `group`     | CASCADE          |
| `expense`           | `categoryId`    | `category`  | SET NULL         |
| `expense_participants` | `expense_id` | `expense`   | CASCADE          |
| `expense_participants` | `user_id`    | `user`      | CASCADE          |
| `category`          | `createdBy`     | `user`      | SET NULL         |
| `category`          | `groupId`       | `group`     | CASCADE          |
| `settlement`        | `fromUserId`    | `user`      | CASCADE          |
| `settlement`        | `toUserId`      | `user`      | CASCADE          |
| `settlement`        | `groupId`       | `group`     | CASCADE          |
| `activity`          | `userId`        | `user`      | CASCADE          |
| `activity`          | `groupId`       | `group`     | CASCADE          |

### Explication des Règles

- **CASCADE** : Supprime automatiquement les enregistrements dépendants
  - Exemple : Si un groupe est supprimé, toutes ses dépenses sont supprimées
  
- **SET NULL** : Met la clé étrangère à NULL
  - Exemple : Si une catégorie est supprimée, les dépenses gardent leurs autres données mais `categoryId` devient null

---

## 📈 Index et Optimisations

### Index Créés

```sql
-- User
CREATE INDEX idx_user_email ON "user"(email);

-- Group
CREATE INDEX idx_group_name ON "group"(name);

-- GroupMember
CREATE INDEX idx_group_member_user ON "group_member"("userId");
CREATE INDEX idx_group_member_group ON "group_member"("groupId");

-- Expense
CREATE INDEX idx_expense_group ON "expense"("groupId");
CREATE INDEX idx_expense_paidby ON "expense"("paidBy");
CREATE INDEX idx_expense_date ON "expense"(date DESC);
CREATE INDEX idx_expense_category ON "expense"("categoryId");

-- ExpenseParticipants
CREATE INDEX idx_expense_participants_expense ON "expense_participants"(expense_id);
CREATE INDEX idx_expense_participants_user ON "expense_participants"(user_id);

-- Category
CREATE INDEX idx_category_group ON "category"("groupId");
CREATE INDEX idx_category_default ON "category"("isDefault");
CREATE INDEX idx_category_createdby ON "category"("createdBy");

-- Settlement
CREATE INDEX idx_settlement_fromuser ON "settlement"("fromUserId");
CREATE INDEX idx_settlement_touser ON "settlement"("toUserId");
CREATE INDEX idx_settlement_group ON "settlement"("groupId");
CREATE INDEX idx_settlement_date ON "settlement"(date DESC);
CREATE INDEX idx_settlement_status ON "settlement"(status);

-- Activity
CREATE INDEX idx_activity_user ON "activity"("userId");
CREATE INDEX idx_activity_group ON "activity"("groupId");
CREATE INDEX idx_activity_action ON "activity"(action);
CREATE INDEX idx_activity_created ON "activity"("createdAt" DESC);
CREATE INDEX idx_activity_entity ON "activity"("entityType", "entityId");
```

### Justification des Index

| Index                        | Justification                                                      |
|------------------------------|--------------------------------------------------------------------|
| `idx_user_email`             | Recherche rapide par email lors de l'authentification             |
| `idx_expense_date`           | Tri des dépenses par date (DESC pour les plus récentes en premier)|
| `idx_activity_created`       | Récupération des activités récentes                               |
| `idx_settlement_status`      | Filtrage des remboursements par statut                            |
| `idx_category_default`       | Récupération rapide des catégories par défaut                     |
| FK indexes                   | Amélioration des performances des jointures                       |

---

## 📊 Types de Données Spéciaux

### DECIMAL(10,3)
Utilisé pour les montants (`amount`).
- **Précision** : 10 chiffres au total
- **Échelle** : 3 chiffres après la virgule
- **Exemples** : 1234567.890, 100.500, 0.001

### JSONB
Utilisé pour `splitDetails` et `details`.
- **Avantages** :
  - Stockage binaire (plus rapide que JSON)
  - Support des index GIN pour recherches complexes
  - Validation automatique du format JSON
- **Exemples** :
  ```json
  // splitDetails
  {
    "type": "percentage",
    "splits": {
      "1": 50,
      "2": 30,
      "3": 20
    }
  }
  
  // details (Activity)
  {
    "amount": 150.50,
    "title": "Restaurant",
    "oldStatus": "pending",
    "newStatus": "completed"
  }
  ```

### TIMESTAMP
Utilisé pour les dates.
- **Format** : `YYYY-MM-DD HH:MM:SS.mmm`
- **Timezone** : UTC recommandé
- **Défaut** : `CURRENT_TIMESTAMP` pour les champs de création

---

## 🔄 Relations et Cardinalités

### Tableau Récapitulatif

| Relation                           | Cardinalité | Table de Liaison    |
|------------------------------------|-------------|---------------------|
| User ↔ Group                       | N:N         | `group_member`      |
| User → Expense (paidBy)            | 1:N         | -                   |
| User ↔ Expense (participants)      | N:N         | `expense_participants` |
| Group → Expense                    | 1:N         | -                   |
| Group → Category                   | 1:N         | -                   |
| User → Category (createdBy)        | 1:N         | -                   |
| Category → Expense                 | 1:N         | -                   |
| Group → Settlement                 | 1:N         | -                   |
| User → Settlement (fromUser)       | 1:N         | -                   |
| User → Settlement (toUser)         | 1:N         | -                   |
| User → Activity                    | 1:N         | -                   |
| Group → Activity                   | 1:N         | -                   |

---

## 🎯 Points Clés pour la Présentation au Jury

### 1. **Normalisation de la Base de Données**
- ✅ Respect de la 3ème forme normale (3NF)
- ✅ Pas de redondance des données
- ✅ Intégrité référentielle stricte

### 2. **Gestion des Relations Complexes**
- ✅ Relations Many-to-Many via tables de liaison
- ✅ Support des relations auto-référencées (User → User dans Settlement)
- ✅ Relations optionnelles bien définies (nullable)

### 3. **Performance et Optimisation**
- ✅ Index sur toutes les clés étrangères
- ✅ Index sur les champs de tri (date DESC)
- ✅ Index sur les champs de filtrage (status, isDefault)
- ✅ Utilisation de JSONB pour données semi-structurées

### 4. **Intégrité et Cohérence**
- ✅ Contraintes CHECK pour valider les données
- ✅ Contraintes UNIQUE pour éviter les doublons
- ✅ Règles de suppression en cascade bien définies
- ✅ Validation métier dans l'application (fromUser ≠ toUser)

### 5. **Audit et Traçabilité**
- ✅ Table `activity` pour tracer toutes les actions
- ✅ Champs `createdAt` sur toutes les tables importantes
- ✅ Stockage de détails contextuels en JSONB

### 6. **Flexibilité et Évolutivité**
- ✅ Système de catégories globales et spécifiques
- ✅ Champ JSONB pour extensions futures sans migration
- ✅ Support de différents types de divisions de dépenses

---

## 📝 Script de Création Complet

```sql
-- =============================================
-- SCRIPT DE CRÉATION DE LA BASE DE DONNÉES
-- Application: MiniSplit
-- SGBD: PostgreSQL 14+
-- =============================================

-- Création de la base de données
CREATE DATABASE minisplit_db;
\c minisplit_db;

-- Extension pour UUID (si nécessaire dans le futur)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE USER
-- =============================================
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE INDEX idx_user_email ON "user"(email);

-- =============================================
-- TABLE GROUP
-- =============================================
CREATE TABLE "group" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE INDEX idx_group_name ON "group"(name);

-- =============================================
-- TABLE GROUP_MEMBER
-- =============================================
CREATE TABLE "group_member" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    
    CONSTRAINT fk_group_member_user FOREIGN KEY ("userId") 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_member_group FOREIGN KEY ("groupId") 
        REFERENCES "group"(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_group UNIQUE ("userId", "groupId")
);

CREATE INDEX idx_group_member_user ON "group_member"("userId");
CREATE INDEX idx_group_member_group ON "group_member"("groupId");

-- =============================================
-- TABLE CATEGORY
-- =============================================
CREATE TABLE "category" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(10) DEFAULT '📦',
    color VARCHAR(7) DEFAULT '#6366f1',
    "isDefault" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "groupId" INTEGER,
    
    CONSTRAINT fk_category_createdby FOREIGN KEY ("createdBy") 
        REFERENCES "user"(id) ON DELETE SET NULL,
    CONSTRAINT fk_category_group FOREIGN KEY ("groupId") 
        REFERENCES "group"(id) ON DELETE CASCADE
);

CREATE INDEX idx_category_group ON "category"("groupId");
CREATE INDEX idx_category_default ON "category"("isDefault");
CREATE INDEX idx_category_createdby ON "category"("createdBy");

-- =============================================
-- TABLE EXPENSE
-- =============================================
CREATE TABLE "expense" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10,3) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TND',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "splitType" VARCHAR(50) DEFAULT 'equal',
    "splitDetails" JSONB,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "paidBy" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "categoryId" INTEGER,
    
    CONSTRAINT fk_expense_paidby FOREIGN KEY ("paidBy") 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_group FOREIGN KEY ("groupId") 
        REFERENCES "group"(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_category FOREIGN KEY ("categoryId") 
        REFERENCES "category"(id) ON DELETE SET NULL,
    CONSTRAINT check_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_expense_group ON "expense"("groupId");
CREATE INDEX idx_expense_paidby ON "expense"("paidBy");
CREATE INDEX idx_expense_date ON "expense"(date DESC);
CREATE INDEX idx_expense_category ON "expense"("categoryId");

-- =============================================
-- TABLE EXPENSE_PARTICIPANTS
-- =============================================
CREATE TABLE "expense_participants" (
    expense_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    
    PRIMARY KEY (expense_id, user_id),
    CONSTRAINT fk_expense_participants_expense FOREIGN KEY (expense_id) 
        REFERENCES "expense"(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_participants_user FOREIGN KEY (user_id) 
        REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX idx_expense_participants_expense ON "expense_participants"(expense_id);
CREATE INDEX idx_expense_participants_user ON "expense_participants"(user_id);

-- =============================================
-- TABLE SETTLEMENT
-- =============================================
CREATE TABLE "settlement" (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,3) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'completed',
    notes TEXT,
    "proofImage" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    
    CONSTRAINT fk_settlement_fromuser FOREIGN KEY ("fromUserId") 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_settlement_touser FOREIGN KEY ("toUserId") 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_settlement_group FOREIGN KEY ("groupId") 
        REFERENCES "group"(id) ON DELETE CASCADE,
    CONSTRAINT check_amount_positive CHECK (amount > 0),
    CONSTRAINT check_different_users CHECK ("fromUserId" != "toUserId")
);

CREATE INDEX idx_settlement_fromuser ON "settlement"("fromUserId");
CREATE INDEX idx_settlement_touser ON "settlement"("toUserId");
CREATE INDEX idx_settlement_group ON "settlement"("groupId");
CREATE INDEX idx_settlement_date ON "settlement"(date DESC);
CREATE INDEX idx_settlement_status ON "settlement"(status);

-- =============================================
-- TABLE ACTIVITY
-- =============================================
CREATE TABLE "activity" (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    "entityType" VARCHAR(100),
    "entityId" INTEGER,
    details JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER,
    
    CONSTRAINT fk_activity_user FOREIGN KEY ("userId") 
        REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_activity_group FOREIGN KEY ("groupId") 
        REFERENCES "group"(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_user ON "activity"("userId");
CREATE INDEX idx_activity_group ON "activity"("groupId");
CREATE INDEX idx_activity_action ON "activity"(action);
CREATE INDEX idx_activity_created ON "activity"("createdAt" DESC);
CREATE INDEX idx_activity_entity ON "activity"("entityType", "entityId");

-- =============================================
-- FIN DU SCRIPT
-- =============================================
```

---

## 📞 Remarques Finales

### Configuration TypeORM

Le fichier `app.module.ts` utilise TypeORM avec `synchronize: true` en développement, ce qui génère automatiquement le schéma à partir des entités.

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true, // ⚠️ À désactiver en production
})
```

**⚠️ Recommandation Production** :
- Désactiver `synchronize: true`
- Utiliser les migrations TypeORM pour les changements de schéma
- Maintenir un script SQL de création initial

---

**Document généré pour la présentation au jury**  
**Version** : 1.0  
**Date** : Décembre 2025
