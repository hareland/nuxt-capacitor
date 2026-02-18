// {
//   "appId": "com.yourdoamnin.yourapp",
//   "directories": {
//     "buildResources": "resources"
//   },
//   "files": [
//     "assets/**/*",
//     "build/**/*",
//     "capacitor.config.*",
//     "app/**/*"
//   ],
//   "publish": {
//     "provider": "github"
//   },
//   "nsis": {
//     "allowElevation": true,
//     "oneClick": false,
//     "allowToChangeInstallationDirectory": true
//   },
//   "win": {
//     "target": "nsis",
//     "icon": "assets/appIcon.ico"
//   },
//   "mac": {
//     "category": "your.app.category.type",
//     "target": "dmg"
//   }
// }
// TODO: If electron is being used, it should be possible to set the defaults...
export const upsertElectronBuilderConfig = () => {}
