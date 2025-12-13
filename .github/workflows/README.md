# GitHub Actions - Guide Simple

## 🎯 Ce qui se passe automatiquement

Quand tu push du code dans le dossier `backend/` sur la branche `main` :

1. ✅ GitHub installe Node.js
2. ✅ GitHub installe les dépendances (`npm ci`)
3. ✅ GitHub build le backend (`npm run build`)
4. ✅ GitHub vérifie le code (`npm run lint:check`)

## 📊 Voir les résultats

### Sur GitHub.com

1. Va sur ton repo : https://github.com/Chaksterr/minisplit
2. Clique sur l'onglet **"Actions"**
3. Tu verras la liste des workflows qui tournent

### Statut du workflow

- 🟡 **Jaune** = En cours
- ✅ **Vert** = Succès
- ❌ **Rouge** = Échec

## 🔧 Tester maintenant

```bash
# 1. Commit les workflows
git add .github/
git commit -m "ci: ajout GitHub Actions pour backend"

# 2. Push
git push origin main

# 3. Va voir sur GitHub → Actions
```

## 📝 Fichier de configuration

Le fichier `.github/workflows/backend-ci.yml` contient :

```yaml
name: Backend CI

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install Node.js
      - Install dependencies
      - Build
      - Lint
```

## 🎓 Comprendre le fichier

### `on: push`
Déclenche le workflow quand tu push

### `paths: - 'backend/**'`
Seulement si tu modifies des fichiers dans `backend/`

### `runs-on: ubuntu-latest`
Utilise une machine Ubuntu (gratuit sur GitHub)

### `steps:`
Les étapes à exécuter dans l'ordre

## 🚀 Ajouter plus de tests (optionnel)

Si tu veux ajouter des tests plus tard, modifie le fichier :

```yaml
# Ajouter après "Lint"
- name: Run tests
  working-directory: ./backend
  run: npm run test
```

## 💡 Astuces

### Badge dans le README

Ajoute ce badge dans ton README.md :

```markdown
![Backend CI](https://github.com/Chaksterr/minisplit/workflows/Backend%20CI/badge.svg)
```

### Notifications

GitHub t'envoie un email si le workflow échoue.

### Voir les logs

Clique sur un workflow → Clique sur "test" → Voir les détails de chaque étape

## ❓ Problèmes courants

### Le workflow ne se déclenche pas
- Vérifie que tu as push sur `main`
- Vérifie que tu as modifié des fichiers dans `backend/`

### Le build échoue
- Clique sur le workflow rouge
- Lis les logs pour voir l'erreur
- Corrige localement et re-push

### Erreur de lint
```bash
# Corriger localement
cd backend
npm run lint

# Puis push
git add .
git commit -m "fix: correction lint"
git push
```

## 🎯 C'est tout !

GitHub Actions va maintenant vérifier automatiquement ton code à chaque push. Simple et efficace ! 🚀
