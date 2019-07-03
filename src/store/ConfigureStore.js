import {applyMiddleware ,createStore, compose, combineReducers} from "redux";
import {notebookReducer} from "../components/notebook-panel/notebook.reducers";
import {mapReducer} from "../components/maps/maps.reducer";
import {spotReducer} from "../spots/spot.reducers";
import {imageReducer} from "../components/images/image.reducers";
import {formReducer} from "../components/form/form.reducers";
import {homeReducer} from "../views/home/Home.reducer";
import {createLogger} from 'redux-logger';
import {persistStore, persistReducer} from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web and AsyncStorage for react-native

// Redux Persist
const persistConfig = {
  key: 'root',
  storage
};


const loggerMiddleware = createLogger({
  predicate: () => process.env.NODE_ENV === 'development',
});

const rootReducer = combineReducers({
  home: homeReducer,
  spot: spotReducer,
  map: mapReducer,
  notebook: notebookReducer,
  images: imageReducer,
  form: formReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

let composeEnhancers = compose;

if(__DEV__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

export default () => {
  const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(loggerMiddleware)));
  const persistor = persistStore(store);
  // const persistorPurge = persistStore(store).purge(); // Use this to clear persistStore completely
  return {store, persistor}
}
