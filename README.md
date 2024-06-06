# MBTiles to Asar

MBTiles-to-Asar GUI is a user interface designed to convert MBTiles files into a Mapeo-compatible ASAR format, along with a corresponding style.json file. This tool simplifies the conversion process, making it easy for users to prepare their map data for use with Mapeo applications.

MBTiles-to-Asar GUI uses [mbtiles-to-asar](https://github.com/digidem/mbtiles-to-asar), [Electron](https://electron.atom.io/), [React](https://facebook.github.io/react/), [React Router](https://github.com/reactjs/react-router), [Webpack](https://webpack.js.org/) and [React Fast Refresh](https://www.npmjs.com/package/react-refresh).
## Download

Download the latest release from our [releases page](https://github.com/digidem/mbtiles-asar-gui/releases).

## Running

Clone the repo and install dependencies:
```
git clone https://github.com/digidem/mbtiles-to-asar-gui.git
cd mbtiles-asar-gui
npm install
npm start
```

## Packaging

To package apps for the local platform:

```bash
npm run package
```

The packaged app will be inside the `release` directory.

To package apps with options:

```bash
npm run package -- --[option]
# Example: npm run package -- --mac
```

### Debugging Production Builds

You can debug your production build with devtools by simply setting the `DEBUG_PROD` env variable

```bash
npx cross-env DEBUG_PROD=true npm run package
```
