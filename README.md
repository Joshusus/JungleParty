# JungleParty

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### 1: Run Express:
Express manages the gamestate & handles any requests to view or mutate it.

- Compile and run:
```sh
node server.js
```
---

### 2: Run VueJS site:
VueJs server handles the website page loading etc.

- Compile and Hot-Reload for Development

```sh
npm run dev
```
- Compile and Minify for Production

```sh
npm run build
```
- Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
