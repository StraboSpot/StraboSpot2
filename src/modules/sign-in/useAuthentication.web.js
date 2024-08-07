import {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import useServerRequestsHook from '../../services/useServerRequests';
import {login, logout} from '../user/userProfile.slice';

const useAuthentication = () => {
  const dispatch = useDispatch();
  const encodedLogin = useSelector(state => state.user.encoded_login);
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  const isOnline = useSelector(state => state.connections.isOnline.isInternetReachable);

  const useServerRequests = useServerRequestsHook();

  let timeout;

  useEffect(() => {
    console.log('Checking authentication...');
    checkAuthentication();
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isAuthenticated, isOnline]);

  const checkAuthentication = async () => {
    const credentials = atob(encodedLogin);
    const email = credentials.split(':')[0];
    const password = credentials.split(':')[1];
    await authenticateUser(email, password);
    console.log('Passed Authentication Check');
    checkAuthenticationRestartTimer();
  };

  const checkAuthenticationRestartTimer = () => {
    console.log('Restarting Authentication Check Timer...');

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      checkAuthentication();
    }, 10000 * 30);  // 300 Seconds (5 minutes)
  };

  const authenticateUser = async (email, password) => {
    try {
      console.log('Authenticating user...');
      const userAuthResponse = await useServerRequests.authenticateUser(email, password);
      if (userAuthResponse?.valid === 'true') {
        if (!isAuthenticated) dispatch(login());
        console.log('User Authenticated.');
      }
      else throw Error('Incorrect username and/or password');
    }
    catch (err) {
      console.error('Authentication Error. Logging Out\n', err);
      dispatch(logout());
      throw Error;
    }
  };
};

export default useAuthentication;
