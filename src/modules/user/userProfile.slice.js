import {createSlice} from '@reduxjs/toolkit';

const initialUserState = {
  isAuthenticated: false,
  encoded_login: null,
  name: null,
  email: null,
  mapboxToken: null,
  image: null,
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
  },
});

export const {login, logout, resetUserState, setUserData} = userProfileSlice.actions;

export default userProfileSlice.reducer;
