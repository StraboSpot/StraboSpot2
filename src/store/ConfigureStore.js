import {applyMiddleware, createStore, compose, combineReducers} from 'redux';
import {notebookReducer} from '../components/notebook-panel/notebook.reducers';
import {mapReducer} from '../components/maps/maps.reducer';
import {spotReducer} from '../spots/spot.reducers';
import {imageReducer} from '../components/images/image.reducers';
import {homeReducer} from '../views/home/Home.reducer';
import {userReducer} from '../services/user/UserProfile.reducer';
import {projectsReducer} from '../project/Projects.reducer';
import {settingsPanelReducer} from '../components/settings-panel/settingsPanel.reducer';
import {createLogger} from 'redux-logger';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';

// Redux Persist
export const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const loggerMiddleware = createLogger({
  predicate: () => process.env.NODE_ENV === 'development',
});

const appReducer = combineReducers({
  home: homeReducer,
  spot: spotReducer,
  map: mapReducer,
  notebook: notebookReducer,
  settingsPanel: settingsPanelReducer,
  images: imageReducer,
  user: userReducer,
  project: projectsReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'USER_LOGOUT') {
    AsyncStorage.removeItem('root');
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

let composeEnhancers = compose;

if (__DEV__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

export default () => {
  const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(loggerMiddleware)));
  const persistor = persistStore(store);
  // const persistorPurge = persistStore(store).purge(); // Use this to clear persistStore completely
  return {store, persistor};
};
