# Electron app

The simplest way is to run `create-vue-app my-app` to generate an Electron app. (If you want a Vue app :D)

Basically, comparing to a normal web app, it:

- Set webpack [target](https://webpack.js.org/configuration/target/#target) to `electron-renderer` to exclude native electron modules
- The dist folder is set to `app/dist`, app folder contains the code for electron main process, and you may distribute the folder using [electron-builder](https://github.com/electron-userland/electron-builder)
- The main process load different `index.html` in different mode:
  - In dev mode, it loads `http://localhost:port/index.html` (for hot reloading)
  - In production mode, where your distributed app runs, it loads `app/dist/index.html`

To develop an Electron with Poi:

```bash
# start the dev server
# you won't need to open url in browser
npm run dev

# open electron app
npm run app

# to distribute
npm run build
# distribute for all platforms: mac/linux/windows
npm run dist
# or separate process
npm run dist:win 
npm run dist:mac
npm run dist:linux
```
