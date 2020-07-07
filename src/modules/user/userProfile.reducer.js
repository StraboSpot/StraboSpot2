import {redux} from '../../shared/app.constants';
import * as UserInfo from './user.constants';

const initialState = {};

export const userReducer = (state = initialState, action) => {

  switch (action.type) {
    case UserInfo.USER_DATA:
      return {
        ...state,
        name: action.userData.name,
        email: action.userData.email,
        mapboxToken: action.userData.mapboxToken,
        password: action.userData.password,
      };

    case UserInfo.ENCODED_LOGIN:
      return {
        ...state,
        encoded_login: action.value,
      };
    case UserInfo.USER_IMAGE:
      return {
        ...state,
        image: action.userImage,
      };
    case redux.CLEAR_STORE:
      console.log('Clearing User Profile...');
      return initialState;
  }
  return state;
};
