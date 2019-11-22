import * as UserInfo from './User.constants';

const initialState = {
  userData: {},
  // userImage: null
};

export const userReducer = (state = initialState, action) => {

  switch (action.type) {
    case UserInfo.USER_DATA:
      return {
        ...state,
        userData: {
          ...state.userData,
          name: action.userData.name,
          email: action.userData.email,
          mapboxToken: action.userData.mapboxToken,
          password: action.userData.password,
        },
      };
    case UserInfo.USER_DATA_CLEARED:
      return {
        ...state,
        userData: {},
      };
    case UserInfo.ENCODED_LOGIN:
      return {
        ...state,
        userData: {
          encoded_login: action.value,
        },
      };
    case UserInfo.USER_IMAGE:
      return {
        ...state,
        userData: {
          ...state.userData,
          image: action.userImage,
        },
      };
  }
  return state;
};
