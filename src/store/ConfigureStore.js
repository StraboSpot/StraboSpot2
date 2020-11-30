import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {createLogger} from 'redux-logger';
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import homeSlice from '../modules/home/home.slice';
import mainMenuSlice from '../modules/main-menu-panel/mainMenuPanel.slice';
import mapsSlice from '../modules/maps/maps.slice';
import notebookSlice from '../modules/notebook-panel/notebook.slice';
import projectSlice from '../modules/project/projects.slice';
import spotsSlice from '../modules/spots/spots.slice';
import userSlice from '../modules/user/userProfile.slice';
import {REDUX} from '../shared/app.constants';

// Redux Persist
export const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['notebook', 'home', 'mainMenu'],
};

const homeConfig = {
  key: 'home',
  storage: AsyncStorage,
  blacklist: ['statusMessages', 'imageProgress', 'isOnline', 'loading', 'modalVisible', 'isStatusMessagesModalVisible',
    'isErrorMessagesModalVisible', 'isProjectLoadSelectionModalVisible', 'isOfflineMapModalVisible',
    'isInfoModalVisible', 'isImageModalVisible', 'isAllSpotsPanelVisible', 'isMainMenuPanelVisible',
    'isProjectLoadComplete'],
};

const notebookConfig = {
  key: 'notebook',
  storage: AsyncStorage,
  blacklist: ['visibleNotebookPagesStack', 'isNotebookPanelVisible'],
};

const mainMenuConfig = {
  key: 'mainMenu',
  storage: AsyncStorage,
  blacklist: ['mainMenuPageVisible', 'isSidePanelVisible', 'sidePanelView'],
};

const loggerMiddleware = createLogger({
  predicate: () => process.env.NODE_ENV === 'development',
  collapsed: (getState, action, logEntry) => !logEntry.error,
});

const combinedReducers = combineReducers({
  home: persistReducer(homeConfig, homeSlice),
  notebook: persistReducer(notebookConfig, notebookSlice),
  map: mapsSlice,
  project: projectSlice,
  mainMenu: persistReducer(mainMenuConfig, mainMenuSlice),
  spot: spotsSlice,
  user: userSlice,
});

const rootReducer = (state, action) => {
  if (action.type === REDUX.CLEAR_STORE) {
    state = undefined;
  }
  return combinedReducers(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const defalutMiddlewareOptions = {
  serializableCheck: {
    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  },
};

const store = configureStore({
  reducer: persistedReducer,
  middleware: [...getDefaultMiddleware(defalutMiddlewareOptions), loggerMiddleware],
});

export default store;
