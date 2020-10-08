import AsyncStorage from '@react-native-community/async-storage';
import {applyMiddleware, createStore, compose, combineReducers} from 'redux';
import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import {createLogger} from 'redux-logger';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import {homeReducer} from '../modules/home/home.reducer';
import {mainMenuPanelReducer} from '../modules/main-menu-panel/mainMenuPanel.reducer';
import {mapReducer} from '../modules/maps/maps.reducer';
import {notebookReducer} from '../modules/notebook-panel/notebook.reducers';
import {projectsReducer} from '../modules/project/projects.reducer';
import {spotReducer} from '../modules/spots/spot.reducers';
import {userReducer} from '../modules/user/userProfile.reducer';

// Redux Persist
export const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['notebook'],
};

const notebookConfig = {
  key: 'notebook',
  storage: AsyncStorage,
  blacklist: ['visibleNotebookPagesStack', 'isNotebookPanelVisible'],
};

const loggerMiddleware = createLogger({
  predicate: () => process.env.NODE_ENV === 'development',
  collapsed: (getState, action, logEntry) => !logEntry.error,
});

const middleware = process.env.NODE_ENV !== 'production'
  ? [require('redux-immutable-state-invariant').default(), loggerMiddleware]
  : [];

const rootReducer = combineReducers({
  home: homeReducer,
  notebook: persistReducer(notebookConfig, notebookReducer),
  map: mapReducer,
  project: projectsReducer,
  mainMenu: mainMenuPanelReducer,
  spot: spotReducer,
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const defalutMiddlewareOptions = {
  serializableCheck: {
    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  },
};

const store = configureStore({
  reducer: persistedReducer,
  middleware: [...getDefaultMiddleware(defalutMiddlewareOptions), ...middleware],
});

export default store;
