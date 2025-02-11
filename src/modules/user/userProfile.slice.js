import {createSlice} from '@reduxjs/toolkit';

const initialUserState = {
  email: null,
  encoded_login: null,
  image: null,
  isAuthenticated: false,
  mapboxToken: null,
  name: null,
  orcidToken: null,
  sesarToken: null,
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
      state.orcidToken = action.payload;
    },
    setSesarToken(state, action) {
      state.sesarToken = action.payload;
    },
  },
});

export const {login, logout, resetUserState, setUserData, setOrcidToken, setSesarToken} = userProfileSlice.actions;

export default userProfileSlice.reducer;
