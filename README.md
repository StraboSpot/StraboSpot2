# StraboSpot2

StraboSpot is an application to collect geologic data in a field setting, and is designed to be used by geologists, geology students, and others. The application allows the collection of geologic data using a variety of base maps - including maps, cross-sections, sketches, and images prepared by other users - referenced to their location on the Earth. StraboSpot utilizes a controlled vocabulary developed over years of discussion in the professional geologic community. The application uses nested spots (areas of observation) for spatial grouping of data and tags for conceptual grouping of data. The application currently focuses on Structural Geology and Tectonics data, but is expanding to include Petrology and Sedimentary Geology data.

The development of StraboSpot was sponsored by the United States National Science Foundation. It provides the ability to put field data into a transparent and open framework, allowing effective cyberinfrastructure development within the Earth Sciences. The data imported into StraboSpot is directly stored in a database that is designed to accommodate the digital data reporting requirements of National Science Foundation grants and allows retrieval by researchers. More explanation of StraboSpot and a desktop version with expanded tools are at https://strabospot.org.

StraboSpot uses a Neo4j graph database to give persistence to observations, photographs, or any other images imported by the user. The system compiles the complex relationships between observations (including temporal information, such as cross-cutting relations) and provide flexible options for access, editing, and sharing of field data.

The application will work on mobile devices with or without connection to Wi-Fi or Cellular networks. In offline mode, StraboSpot can store both Mapbox (https://www.mapbox.com) and Map Warper (http://mapwarper.net) to provide base maps for data collection. When an Internet connection is available, users both can upload collected information and backup their data on their iPad or iPhone.

This is a [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

## Step 1: Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

- Create a `env.json` file at project root and add:

      {
       "mapbox_access_token": 'Your Mapbox public access token'
       "Error_reporting_DSN": 'Optional Sentry DNS or other error reporting service'
      }

- Create a `dev-test-logins.js` in project root and add:

      export const USERNAME_TEST = 'your username/email';
      export const PASSWORD_TEST = 'your password';

Android
- Create `gradle.properties` in `android/.gradle` and add (without the quotes):

      MAPBOX_DOWNLOADS_TOKEN='MAPBOX_DOWNLOADS_SECRET_TOKEN'

## Step 2: Install Packages

Run `npm install`

## Step 3: Run Natively

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. 

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Run in Web

```bash
# using npm
npm run web
```

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
