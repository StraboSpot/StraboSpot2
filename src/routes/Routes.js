import React from 'react';

import {useSelector} from 'react-redux';

import AppStack from './AppStack';
import AuthStack from './AuthStack';

const Routes = () => {
  console.log('Rendering Routes...');
  // console.count('Rendering Routes...');

  const isAuthenticated = useSelector(state => state.user.isAuthenticated);

  console.log('Is user authenticated?', isAuthenticated);

  return isAuthenticated ? <AppStack/> : <AuthStack/>;
};

export default Routes;
