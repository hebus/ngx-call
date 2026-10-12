---
name: release
description: Release the ngx-call library — bump version, build, publish to npm (multi-account + 2FA/OTP aware), tag, push, and create a GitHub Release. Trigger when the user asks to "release", "publish ngx-call", "cut a release", "bump and publish", "ship a new version", or similar.
---

# Release ngx-call

Automatise la sortie d'une version de la librairie **ngx-call** : (version via Changesets) → build → publish npm → commit → tag → push → GitHub Release. Suivre les étapes **dans l'ordre**. L'ordre est conçu pour qu'aucun commit/tag ne soit créé tant que `npm publish` n'a pas réussi.

## Le package publié
- Source de la lib : `projects/ngx-call/` (sa `package.json` porte la version publiée — **pas** la `package.json` racine, qui reste `0.0.0`).
- Build : `npx ng build ngx-call` → sortie dans `dist/ngx-call/` (c'est CE dossier qu'on publie).

## Arguments attendus (à demander si absents)
1. **Compte npm** : le nom du compte (voir « Authentification » ci-dessous). Demander lequel — ne jamais deviner.

---

## Authentification npm (multi-comptes) — IMPÉRATIF

Le skill **ne stocke aucun credential**. Mécanique de bascule par fichier `.npmrc` dédié :

- Convention : un fichier par compte, ex. `~/.npmrc-<account-a>`, `~/.npmrc-<account-b>`, contenant `//registry.npmjs.org/:_authToken=…`.
- Toutes les commandes npm de publication utilisent `--userconfig <fichier>` pour pointer le bon compte.
- Si l'utilisateur n'a pas de fichier dédié et veut utiliser le `~/.npmrc` par défaut (compte courant), on peut omettre `--userconfig` — mais on **confirme toujours l'identité** (voir garde-fou).

**Garde-fou identité (bloquant, avant tout publish)** :
```bash
npm whoami --userconfig <fichier-du-compte>   # ou sans --userconfig pour le compte par défaut
```
Afficher le compte résolu et **demander confirmation explicite** que c'est bien le bon publisher. Si `npm whoami` échoue (pas authentifié) → s'arrêter et demander à l'utilisateur de configurer le token / faire `! npm login --userconfig <fichier>`. Ne jamais auto-login.

## 2FA / OTP — IMPÉRATIF

ngx-call est publié avec 2FA (auth-and-publish). Donc **au moment du publish** :
- Demander à l'utilisateur son **code OTP courant** (6 chiffres de son app d'authentification).
- Lancer le publish immédiatement avec `--otp=<code>` (le code est valable assez longtemps).
- Si le publish échoue pour OTP invalide/expiré (`EOTP`) → redemander un nouveau code et réessayer.
- Secours : proposer à l'utilisateur de lancer lui-même `! npm publish ./dist/ngx-call --userconfig <fichier> --otp=<code>` (npm gère alors l'invite OTP nativement).

---

## Étapes

### 1. Pré-vol (tout doit passer, sinon stop)
```bash
git rev-parse --abbrev-ref HEAD          # doit être "main"
git status --porcelain                    # doit être VIDE (arbre propre)
git fetch origin
git rev-list --left-right --count origin/main...HEAD   # doit être "0\t0" (à jour, pas de divergence)
```
Puis le **garde-fou identité npm** (section Authentification) + confirmation du compte.

### 2. Déterminer la version (gérée par Changesets)
Le bump n'est **plus** fait à la main : la PR « chore: version packages » (générée par la CI `Release PR`) doit être **déjà mergée** sur `main`. Vérifier :
```bash
ls .changeset/*.md | grep -v README   # doit être VIDE (changesets consommés)
```
S'il reste des changesets → s'arrêter : demander de merger d'abord la PR « version packages » (voir `CONTRIBUTING.md`).
Lire la version dans `projects/ngx-call/package.json` (= cible). Nommer la cible `X.Y.Z` et le tag `vX.Y.Z`. Vérifier que `vX.Y.Z` n'existe pas déjà (`git tag -l vX.Y.Z` vide, et `npm view ngx-call@X.Y.Z` introuvable).

### 3. (supprimé — la version est déjà bumpée par la PR Changesets)

### 4. Build de la lib
```bash
npx ng build ngx-call
```
Vérifier la version embarquée :
```bash
node -e "console.log(require('./dist/ngx-call/package.json').version)"   # doit afficher X.Y.Z
```

### 5. Publish npm (avec OTP) — point de non-retour
Demander l'OTP, puis :
```bash
npm publish ./dist/ngx-call --userconfig <fichier-du-compte> --otp=<code> --access public
```
> `--access public` est sans effet sur un package non-scopé mais explicite l'intention.

**Si échec** (OTP, droits, réseau) : ne RIEN tagger. Réessayer (nouvel OTP).
puis s'arrêter en expliquant.

### 6. Vérifier la publication
```bash
npm view ngx-call version dist-tags.latest    # doit refléter X.Y.Z
```

### 7. Commit + tag + push (seulement après publish OK)
```bash
git tag -a vX.Y.Z -m "ngx-call vX.Y.Z"
git push origin vX.Y.Z
```
> Aucun commit : le bump + `CHANGELOG.md` sont déjà sur `main` via la PR Changesets. Le tag se pose sur ce commit.

### 8. GitHub Release
```bash
gh release create vX.Y.Z --repo hebus/ngx-call --title "vX.Y.Z" --notes-file <extrait de projects/ngx-call/CHANGELOG.md pour X.Y.Z>
```
(Si on veut des notes éditoriales plutôt qu'auto-générées, rédiger `--notes "…"` à la place.)

### 9. Rapport final
Donner à l'utilisateur :
- Version publiée + `dist-tag` latest (depuis `npm view`).
- Lien npm : https://www.npmjs.com/package/ngx-call
- Lien Release : https://github.com/hebus/ngx-call/releases/tag/vX.Y.Z
- Rappel démo : https://hebus.github.io/ngx-call/

## Garde-fous récapitulatifs
- ❌ Jamais tagger avant un publish réussi.
- ❌ Jamais éditer `version` à la main (Changesets).
- ❌ Jamais publier sans avoir confirmé `npm whoami` (bon compte).
- ❌ Jamais stocker token/OTP ; l'OTP est demandé à chaque release.
- ✅ Arbre propre + branche `main` à jour avant de commencer.
