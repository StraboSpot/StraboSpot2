# StraboSpot-Mobile
Rewrite for native.

Running for development:

- Create a `Config.js` file in `src/`
- Add

      export const USERNAME_TEST = 'your username/email';
      export const PASSWORD_TEST = 'your password';

- Run `npm install`
- Run `npm run ios` or `npm run android`
- react-native-fs may not link properly. In the event of `RNFSFileTypeRegular` error, run this command: `react-native link react-native-fs`
- netinfo also needs to be linked using this command: `react-native link @react-native-community/netinfo`
