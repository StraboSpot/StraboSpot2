# StraboSpot-Mobile

Rewrite for native.

Running for development:

- Create a `env.json` file at project root and add:

      {
       "mapbox_access_token": 'Your Mapbox public access token'
       "Error_reporting_DSN": 'Optional Sentry DNS or other error reporting service'
      }
- Create a `dev-test-logins.js` in project root and add:

      export const USERNAME_TEST = 'your username/email';
      export const PASSWORD_TEST = 'your password';

- Run `npm install`
- Run `npx react-native run-ios` or `npx react-native run-android`
