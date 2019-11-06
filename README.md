# StraboSpot-Mobile
Rewrite for native.

Running for development:

- Create a `.env` file at the root
- Add

      USERNAME_TEST = 'your username/email'
      PASSWORD_TEST = 'your password'

- Run `npm install`
- Run `npm run ios` or `npm run android`
- react-native-fs may not link properly. In the event of `RNFSFileTypeRegular` error, run this command: `react-native link react-native-fs`
- netinfo also needs to be linked using this command: `react-native link @react-native-community/netinfo`
