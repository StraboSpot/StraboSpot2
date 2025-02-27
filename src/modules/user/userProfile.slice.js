import {createSlice} from '@reduxjs/toolkit';
import {unixToDateTime} from '../../shared/Helpers';

const initialUserState = {
  email: null,
  encoded_login: null,
  image: null,
  isAuthenticated: false,
  mapboxToken: null,
  name: null,
  orcidToken: {
    token: null,
    expiration: null,
  },
  sesar: {
    selectedUserCode: '',
    userCodes: [],
    sesarToken: {
      access: null,
      refresh: null,
      expiration: null,
    },
  },
};

// createSlice combines reducers, actions, and constants
const userProfileSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setUserData(state, action) {
      const {name, email, mapboxToken, orcidToken, encoded_login, image} = action.payload;
      const tokenParsed = JSON.parse(atob(orcidToken.split('.')[1]));
      const expDateTime = unixToDateTime(tokenParsed.exp).toUTCString();
      state.name = name;
      state.email = email;
      state.mapboxToken = mapboxToken;
      state.orcidToken.token = orcidToken;
      state.orcidToken.expiration = expDateTime;
      state.encoded_login = encoded_login;
      state.image = image;
    },
    login(state) {
      state.isAuthenticated = true;
    },
    logout(state) {
      state.isAuthenticated = false;
    },
    resetUserState() {
      return initialUserState;
    },
    setOrcidToken(state, action) {
      const {token, expiration} = action.payload;
      state.orcidToken.token = token;
      state.orcidToken.expiration = expiration;
    },
    setSesarToken(state, action) {
      const {access, refresh, expiration} = action.payload;
      state.sesar.sesarToken.access = access;
      state.sesar.sesarToken.refresh = refresh;
      state.sesar.sesarToken.expiration = expiration;
    },
    setSesarUserCodes(state, action) {
      state.sesar.userCodes = action.payload;
    },
    setSelectedUserCode(state, action) {
      state.sesar.selectedUserCode = action.payload;
    }
  },
});

export const {login, logout, resetUserState, setUserData, setOrcidToken, setSesarToken, setSesarUserCodes, setSelectedUserCode} = userProfileSlice.actions;

export default userProfileSlice.reducer;
