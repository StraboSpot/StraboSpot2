import {applyMiddleware ,createStore, compose, combineReducers} from "redux";
import {homeReducer, mapReducer} from './reducers/ReducersIndex';
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
  map: mapReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

let composeEnhancers = compose;

if(__DEV__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

const configureStore = () => {
  return createStore(persistedReducer, composeEnhancers(applyMiddleware(loggerMiddleware)))
};

export default () => {
  const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(loggerMiddleware)));
  const persistor = persistStore(store);
  // const persistorPurge = persistStore(store).purge(); // Use this to clear persistStore completely
  return {store, persistor}
}
