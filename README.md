# StraboSpot-Mobile
Rewrite for native.

Running for development:

- Create a `Config.js` file at project root
- Add

      export const USERNAME_TEST = 'your username/email';
      export const PASSWORD_TEST = 'your password';

- Run `npm install`
- Run `npx react-native run-ios` or `npx react-native run-android`

#iOS

You will have to create a main.jsbundle by running:
`react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios`
