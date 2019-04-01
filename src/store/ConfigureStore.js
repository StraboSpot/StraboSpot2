import {createStore, compose, combineReducers} from "redux";
import homeReducer from './reducers/ReducersIndex';

const rootReducer = combineReducers({
  home: homeReducer
});

let composeEnhancers = compose;

if(__DEV__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

const configureStore = () => {
  return createStore(rootReducer, composeEnhancers())
};

export default configureStore;
