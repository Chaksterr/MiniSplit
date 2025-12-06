# ⚙️ Guide de Configuration - MiniSplit Backend

Ce document détaille toutes les configurations du projet MiniSplit Backend.

---

## 📦 Dépendances du Projet

### Dependencies de Production

```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/config": "^4.0.2",
  "@nestjs/core": "^11.0.1",
  "@nestjs/platform-express": "^11.0.1",
  "@nestjs/typeorm": "^11.0.0",
  "bcrypt": "^6.0.0",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.14.3",
  "dotenv": "^17.2.3",
  "pg": "^8.16.3",
  "reflect-metadata": "^0.2.2",
  "rxjs": "^7.8.1",
  "typeorm": "^0.3.27"
}
```

#### Descriptions Détaillées

| Package                          | Version  | Description                                                                 |
|----------------------------------|----------|-----------------------------------------------------------------------------|
| **@nestjs/common**               | 11.0.1   | Décorateurs et utilitaires communs de NestJS                              |
| **@nestjs/config**               | 4.0.2    | Module de configuration pour gérer les variables d'environnement          |
| **@nestjs/core**                 | 11.0.1   | Noyau du framework NestJS                                                 |
| **@nestjs/platform-express**     | 11.0.1   | Adaptateur Express pour NestJS (serveur HTTP)                             |
| **@nestjs/typeorm**              | 11.0.0   | Intégration TypeORM pour NestJS                                           |
| **bcrypt**                       | 6.0.0    | Librairie de hachage de mots de passe (salt + hash)                       |
| **class-transformer**            | 0.5.1    | Transformation d'objets plain JavaScript en instances de classes          |
| **class-validator**              | 0.14.3   | Validation déclarative avec décorateurs                                   |
| **dotenv**                       | 17.2.3   | Chargement de variables d'environnement depuis un fichier .env            |
| **pg**                           | 8.16.3   | Client PostgreSQL pour Node.js                                            |
| **reflect-metadata**             | 0.2.2    | Polyfill pour les métadonnées (requis par TypeScript decorators)         |
| **rxjs**                         | 7.8.1    | Programmation réactive avec Observables (requis par NestJS)              |
| **typeorm**                      | 0.3.27   | ORM (Object-Relational Mapping) pour TypeScript et JavaScript            |

---

### DevDependencies

```json
{
  "@eslint/eslintrc": "^3.2.0",
  "@eslint/js": "^9.18.0",
  "@nestjs/cli": "^11.0.0",
  "@nestjs/schematics": "^11.0.0",
  "@nestjs/testing": "^11.0.1",
  "@types/bcrypt": "^6.0.0",
  "@types/express": "^5.0.0",
  "@types/jest": "^30.0.0",
  "@types/node": "^22.10.7",
  "@types/passport-jwt": "^4.0.1",
  "@types/supertest": "^6.0.2",
  "eslint-config-prettier": "^10.0.1",
  "eslint-plugin-prettier": "^5.2.2",
  "globals": "^16.0.0",
  "jest": "^30.0.0",
  "source-map-support": "^0.5.21",
  "supertest": "^7.0.0",
  "ts-jest": "^29.2.5",
  "ts-loader": "^9.5.2",
  "ts-node": "^10.9.2",
  "tsconfig-paths": "^4.2.0",
  "typescript": "^5.7.3",
  "typescript-eslint": "^8.20.0"
}
```

#### Descriptions Détaillées

| Package                      | Version  | Description                                                          |
|------------------------------|----------|----------------------------------------------------------------------|
| **@nestjs/cli**              | 11.0.0   | CLI pour générer des modules, controllers, services, etc.           |
| **@nestjs/schematics**       | 11.0.0   | Schémas pour la génération de code avec NestJS CLI                  |
| **@nestjs/testing**          | 11.0.1   | Utilitaires pour tester les modules NestJS                          |
| **@types/bcrypt**            | 6.0.0    | Définitions TypeScript pour bcrypt                                  |
| **@types/express**           | 5.0.0    | Définitions TypeScript pour Express                                 |
| **@types/jest**              | 30.0.0   | Définitions TypeScript pour Jest                                    |
| **@types/node**              | 22.10.7  | Définitions TypeScript pour Node.js                                 |
| **@types/supertest**         | 6.0.2    | Définitions TypeScript pour Supertest                               |
| **eslint-config-prettier**   | 10.0.1   | Configuration ESLint compatible avec Prettier                       |
| **eslint-plugin-prettier**   | 5.2.2    | Plugin ESLint pour intégrer Prettier                                |
| **jest**                     | 30.0.0   | Framework de tests JavaScript                                       |
| **supertest**                | 7.0.0    | Librairie pour tester les endpoints HTTP                            |
| **ts-jest**                  | 29.2.5   | Preset Jest pour TypeScript                                         |
| **ts-loader**                | 9.5.2    | Loader Webpack pour TypeScript                                      |
| **ts-node**                  | 10.9.2   | Exécution de TypeScript directement sans compilation               |
| **typescript**               | 5.7.3    | Superset typé de JavaScript                                         |
| **typescript-eslint**        | 8.20.0   | Parser et plugin ESLint pour TypeScript                             |

---

## 🔧 Configurations TypeScript

### `tsconfig.json` (Configuration Principale)

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "esModuleInterop": true
  }
}
```

#### Options Expliquées

| Option                             | Valeur      | Description                                                              |
|------------------------------------|-------------|--------------------------------------------------------------------------|
| **module**                         | commonjs    | Système de modules Node.js (require/module.exports)                     |
| **declaration**                    | true        | Génère les fichiers .d.ts pour les définitions de types                 |
| **removeComments**                 | true        | Supprime les commentaires du code compilé                                |
| **emitDecoratorMetadata**          | true        | Émet les métadonnées pour les décorateurs (requis par NestJS)          |
| **experimentalDecorators**         | true        | Active le support des décorateurs TypeScript                            |
| **allowSyntheticDefaultImports**   | true        | Permet les imports par défaut depuis des modules sans export default    |
| **target**                         | ES2021      | Version ECMAScript cible de la compilation                               |
| **sourceMap**                      | true        | Génère les source maps pour le débogage                                  |
| **outDir**                         | ./dist      | Dossier de sortie des fichiers compilés                                 |
| **baseUrl**                        | ./          | Racine pour la résolution des imports absolus                            |
| **incremental**                    | true        | Compilation incrémentale pour accélérer les rebuilds                     |
| **skipLibCheck**                   | true        | Ignore la vérification des types dans les fichiers .d.ts                 |
| **strictNullChecks**               | false       | N'impose pas la gestion explicite de null/undefined                      |
| **noImplicitAny**                  | false       | Permet les types implicites any                                          |
| **esModuleInterop**                | true        | Interopérabilité entre CommonJS et ES Modules                            |

---

### `tsconfig.build.json` (Configuration de Build)

```json
{
  "extends": "./tsconfig.json",
  "exclude": [
    "node_modules",
    "test",
    "dist",
    "**/*spec.ts"
  ]
}
```

#### Explication

- **extends** : Hérite de la configuration de `tsconfig.json`
- **exclude** : Exclut les dossiers/fichiers non nécessaires au build de production
  - `node_modules` : Dépendances externes
  - `test` : Tests end-to-end
  - `dist` : Dossier de sortie
  - `**/*spec.ts` : Fichiers de tests unitaires

---

## 🏗️ Configuration NestJS CLI

### `nest-cli.json`

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

#### Options Expliquées

| Option                          | Valeur              | Description                                                    |
|---------------------------------|---------------------|----------------------------------------------------------------|
| **$schema**                     | JSON Schema URL     | Schéma pour l'autocomplétion dans les IDE                     |
| **collection**                  | @nestjs/schematics  | Collection de schémas pour la génération de code              |
| **sourceRoot**                  | src                 | Dossier racine des sources                                    |
| **compilerOptions.deleteOutDir**| true                | Supprime le dossier de sortie avant chaque build              |

### Commandes de Génération

```bash
# Générer un module
nest generate module users

# Générer un controller
nest generate controller users

# Générer un service
nest generate service users

# Générer un module complet (module + controller + service)
nest generate resource users
```

---

## 🧪 Configuration Jest

### Configuration dans `package.json`

```json
{
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

#### Options Expliquées

| Option                  | Valeur               | Description                                              |
|-------------------------|----------------------|----------------------------------------------------------|
| **moduleFileExtensions**| js, json, ts         | Extensions de fichiers reconnues par Jest               |
| **rootDir**             | src                  | Dossier racine pour les tests                            |
| **testRegex**           | .*\\.spec\\.ts$      | Pattern pour identifier les fichiers de tests           |
| **transform**           | ts-jest              | Transformateur pour compiler TypeScript                  |
| **collectCoverageFrom** | **/*.(t|j)s          | Fichiers à inclure dans le rapport de couverture         |
| **coverageDirectory**   | ../coverage          | Dossier de sortie pour le rapport de couverture          |
| **testEnvironment**     | node                 | Environnement d'exécution des tests (node vs jsdom)      |

---

### Configuration E2E : `test/jest-e2e.json`

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

---

## 🌍 Variables d'Environnement

### Fichier `.env` (Exemple)

```env
# Configuration de la base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_NAME=minisplit_db

# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration JWT (si implémenté dans le futur)
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
```

### Variables Expliquées

| Variable        | Type    | Description                                           | Exemple             |
|-----------------|---------|-------------------------------------------------------|---------------------|
| **DB_HOST**     | string  | Adresse du serveur PostgreSQL                        | localhost           |
| **DB_PORT**     | number  | Port du serveur PostgreSQL                           | 5432                |
| **DB_USERNAME** | string  | Nom d'utilisateur PostgreSQL                         | postgres            |
| **DB_PASSWORD** | string  | Mot de passe PostgreSQL                              | mySecurePass123     |
| **DB_NAME**     | string  | Nom de la base de données                            | minisplit_db        |
| **PORT**        | number  | Port sur lequel l'application écoute                 | 3000                |
| **NODE_ENV**    | string  | Environnement d'exécution (development/production)   | development         |

### Chargement dans `app.module.ts`

```typescript
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Disponible dans tous les modules
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ⚠️ Désactiver en production
    }),
  ],
})
export class AppModule {}
```

---

## 🚀 Scripts NPM

### Scripts de Développement

```bash
# Démarrer en mode développement (rechargement automatique)
npm run start:dev

# Démarrer en mode debug (port 9229)
npm run start:debug
```

**Détails** :
- `start:dev` : Utilise `nest start --watch` pour surveiller les changements
- `start:debug` : Ajoute `--debug` pour permettre l'attachement d'un debugger

---

### Scripts de Production

```bash
# Compiler le projet
npm run build

# Lancer la version compilée
npm run start:prod
```

**Détails** :
- `build` : Compile TypeScript vers JavaScript dans le dossier `dist/`
- `start:prod` : Lance le fichier compilé `dist/main.js` avec Node.js

---

### Scripts de Tests

```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Rapport de couverture
npm run test:cov

# Tests end-to-end
npm run test:e2e

# Tests en mode debug
npm run test:debug
```

---

### Scripts de Qualité de Code

```bash
# Formater le code avec Prettier
npm run format

# Linter avec ESLint
npm run lint
```

**Configuration Prettier** (implicite) :
- Formatage automatique de tous les fichiers `src/**/*.ts` et `test/**/*.ts`

**Configuration ESLint** :
- Vérifie et corrige automatiquement les problèmes de style et de qualité

---

## 🔐 Configuration de Sécurité

### Hachage des Mots de Passe

**Fichier** : `src/user/user.entity.ts`

```typescript
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
```

**Paramètres** :
- **Salt Rounds** : 10 (équilibre entre sécurité et performance)
- **Algorithme** : bcrypt (résistant aux attaques par force brute)

---

### Validation Globale

**Fichier** : `src/main.ts`

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,                    // Supprime les propriétés non définies dans le DTO
  forbidNonWhitelisted: false,        // N'empêche pas les propriétés supplémentaires
  transform: true,                    // Transforme automatiquement les types
  transformOptions: {
    enableImplicitConversion: true,   // Conversion implicite (string → number)
  },
}));
```

---

### Sérialisation

**Fichier** : `src/main.ts`

```typescript
import { ClassSerializerInterceptor } from '@nestjs/common';

app.useGlobalInterceptors(
  new ClassSerializerInterceptor(app.get(Reflector))
);
```

**Effet** : Les champs marqués `@Exclude()` sont automatiquement omis des réponses API.

**Exemple** : Le champ `password` dans `User` n'est jamais exposé.

---

## 📊 Configuration TypeORM

### Options Principales

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
})
```

| Option         | Valeur                              | Description                                                    |
|----------------|-------------------------------------|----------------------------------------------------------------|
| **type**       | postgres                            | Type de base de données                                       |
| **host**       | process.env.DB_HOST                 | Adresse du serveur                                            |
| **port**       | parseInt(process.env.DB_PORT!)      | Port du serveur                                               |
| **username**   | process.env.DB_USERNAME             | Nom d'utilisateur                                             |
| **password**   | process.env.DB_PASSWORD             | Mot de passe                                                  |
| **database**   | process.env.DB_NAME                 | Nom de la base de données                                     |
| **entities**   | [__dirname + '/**/*.entity{.ts,.js}']| Pattern pour charger automatiquement toutes les entités       |
| **synchronize**| true                                | ⚠️ Synchronise automatiquement le schéma (désactiver en prod)|

---

### ⚠️ Recommandations Production

```typescript
TypeOrmModule.forRoot({
  // ... autres options
  synchronize: false,           // Désactiver en production
  logging: ['error', 'warn'],   // Logs des erreurs uniquement
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,          // Exécuter les migrations au démarrage
})
```

---

## 🎯 Checklist de Configuration

### Développement
- ✅ Variables d'environnement dans `.env`
- ✅ `synchronize: true` pour auto-génération du schéma
- ✅ Logs détaillés activés
- ✅ Mode watch activé (`npm run start:dev`)

### Production
- ✅ Variables d'environnement sécurisées (secrets manager)
- ✅ `synchronize: false` + migrations
- ✅ Logs minimaux (erreurs uniquement)
- ✅ Code compilé et optimisé
- ✅ HTTPS configuré via reverse proxy
- ✅ CORS configuré si nécessaire
- ✅ Rate limiting activé
- ✅ Monitoring et alertes en place

---

## 📞 Ressources Supplémentaires

- [Documentation NestJS](https://docs.nestjs.com/)
- [Documentation TypeORM](https://typeorm.io/)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Documentation TypeScript](https://www.typescriptlang.org/docs/)
- [Documentation Jest](https://jestjs.io/docs/getting-started)

---

**Document généré pour la présentation au jury**  
**Version** : 1.0  
**Date** : Décembre 2025
