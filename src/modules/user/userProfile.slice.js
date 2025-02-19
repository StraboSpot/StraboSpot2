import {createSlice} from '@reduxjs/toolkit';

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
  sesarToken: {
    access: null,
    refresh: null,
    expiration: null,
  },
};

// createSlice combines reducers, actions, and constants
const userProfileSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setUserData(state, action) {
      const {name, email, mapboxToken, orcidToken, encoded_login, image} = action.payload;
      state.name = name;
      state.email = email;
      state.mapboxToken = mapboxToken;
      state.orcidToken = orcidToken;
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
      state.sesarToken.access = access;
      state.sesarToken.refresh = refresh;
      state.sesarToken.expiration = expiration;
    },
  },
});

export const {login, logout, resetUserState, setUserData, setOrcidToken, setSesarToken} = userProfileSlice.actions;

export default userProfileSlice.reducer;
