import AsyncStorage from '@react-native-community/async-storage';
import {applyMiddleware, createStore, compose, combineReducers} from 'redux';
import {createLogger} from 'redux-logger';
import {persistStore, persistReducer} from 'redux-persist';

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

let composeEnhancers = compose;

if (__DEV__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

const store = () => {
  const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(loggerMiddleware)));
  console.log('The State of the Store', store.getState());
  const persistor = persistStore(store);
  // const persistorPurge = persistStore(store).purge(); // Use this to clear persistStore completely
  return {store, persistor};
};

export default store;
