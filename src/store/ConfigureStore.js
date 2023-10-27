import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {createLogger} from 'redux-logger';
import {FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE} from 'redux-persist';

import compassSlice from '../modules/compass/compass.slice';
import homeSlice from '../modules/home/home.slice';
import mainMenuSlice from '../modules/main-menu-panel/mainMenuPanel.slice';
import mapsSlice from '../modules/maps/maps.slice';
import offlineMapsSlice from '../modules/maps/offline-maps/offlineMaps.slice';
import notebookSlice from '../modules/notebook-panel/notebook.slice';
import projectSlice from '../modules/project/projects.slice';
import spotsSlice from '../modules/spots/spots.slice';
import userSlice from '../modules/user/userProfile.slice';
import {REDUX} from '../shared/app.constants';
import listenerMiddleware from './listenerMiddleware';

// Redux Persist
export const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['compass', 'notebook', 'home', 'mainMenu', 'map', 'spot'],
  timeout: null,
};

const compassConfig = {
  key: 'compass',
  storage: AsyncStorage,
  blacklist: ['measurements'],
  timeout: null,
};

const homeConfig = {
  key: 'home',
  storage: AsyncStorage,
  blacklist: ['statusMessages', 'imageProgress', 'isOnline', 'loading', 'modalValues', 'modalVisible',
    'isStatusMessagesModalVisible', 'isErrorMessagesModalVisible', 'isProjectLoadSelectionModalVisible',
    'isOfflineMapModalVisible', 'isInfoModalVisible', 'isImageModalVisible', 'isMainMenuPanelVisible',
    'isProjectLoadComplete', 'isProgressModalVisible'],
  timeout: null,
};

const notebookConfig = {
  key: 'notebook',
  storage: AsyncStorage,
  blacklist: ['visibleNotebookPagesStack', 'isNotebookPanelVisible'],
  timeout: null,
};

const mainMenuConfig = {
  key: 'mainMenu',
  storage: AsyncStorage,
  blacklist: ['mainMenuPageVisible', 'isSidePanelVisible', 'sidePanelView'],
  timeout: null,
};

const mapConfig = {
  key: 'map',
  storage: AsyncStorage,
  timeout: null,
  blacklist: ['selectedCustomMapToEdit', 'vertexStartCoords', 'vertexEndCoords', 'freehandFeatureCoords'],
};

const projectConfig = {
  key: 'project',
  storage: AsyncStorage,
  blacklist: ['project', 'datasets'],
  timeout: null,
};

const spotsConfig = {
  key: 'spot',
  storage: AsyncStorage,
  blacklist: ['selectedAttributes'],
  timeout: null,
};

const loggerMiddleware = createLogger({
  predicate: () => process.env.NODE_ENV === 'development',
  collapsed: (getState, action, logEntry) => !logEntry.error,
});

const combinedReducers = combineReducers({
  compass: persistReducer(compassConfig, compassSlice),
  home: persistReducer(homeConfig, homeSlice),
  notebook: persistReducer(notebookConfig, notebookSlice),
  map: persistReducer(mapConfig, mapsSlice),
  project: persistReducer(projectConfig, projectSlice),
  mainMenu: persistReducer(mainMenuConfig, mainMenuSlice),
  offlineMap: offlineMapsSlice,
  spot: persistReducer(spotsConfig, spotsSlice),
  user: userSlice,
});

const rootReducer = (state, action) => {
  if (action.type === REDUX.CLEAR_STORE) {
    state = {
      compass: undefined,
      home: {
        ...state.home,
        isOnline: state.home.isOnline,
      },
      notebook: undefined,
      map: undefined,
      project: {
        ...state.project,
        project: {},
        datasets: {},
        databaseEndpoint: state.project.databaseEndpoint,
      },
      offlineMap: state.offlineMap,
      spot: undefined,
      user: undefined,
    };
  }

  return combinedReducers(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const defaultMiddlewareOptions = {
  immutableCheck: false,
  serializableCheck: {
    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    warnAfter: 60,
  },
};

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => __DEV__
    ? getDefaultMiddleware(defaultMiddlewareOptions)
      .concat(loggerMiddleware, listenerMiddleware.middleware)
    : getDefaultMiddleware(defaultMiddlewareOptions).concat(listenerMiddleware.middleware),
});

export default store;
