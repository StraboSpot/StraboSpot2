import {createSlice} from '@reduxjs/toolkit';

const initialUserState = {
  email: null,
  encoded_login: null,
  image: null,
  isAuthenticated: false,
  mapboxToken: null,
  name: null,
  sesar: {
    selectedUserCode: null,
    userCodes: [],
    sesarToken: {
      access: '',
      refresh: '',
    },
  },
};

// createSlice combines reducers, actions, and constants
const userProfileSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setUserData(state, action) {
      const {name, email, mapboxToken, encoded_login, image} = action.payload;
      state.name = name;
      state.email = email;
      state.mapboxToken = mapboxToken;
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
    setSesarToken(state, action) {
      const {access, refresh} = action.payload;
      state.sesar.sesarToken.access = access;
      state.sesar.sesarToken.refresh = refresh;
    },
    setSesarUserCodes(state, action) {
      state.sesar.userCodes = action.payload;
    },
    setSelectedUserCode(state, action) {
      state.sesar.selectedUserCode = action.payload;
    },
    updatedKey(state, action) {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  login,
  logout,
  resetUserState,
  setUserData,
  setOrcidToken,
  setSesarToken,
  setSesarUserCodes,
  setSelectedUserCode,
  updatedKey,
} = userProfileSlice.actions;

export default userProfileSlice.reducer;
