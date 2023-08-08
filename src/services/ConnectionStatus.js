import {useEffect} from 'react';

import {useNetInfo} from '@react-native-community/netinfo';
import {useDispatch} from 'react-redux';

import {setOnlineStatus} from '../modules/home/home.slice';

const ConnectionStatus = () => {
  console.log('Rendering ConnectionStatus...');

  const netInfo = useNetInfo();
  const dispatch = useDispatch();

  // NetInfo.configure(
  //   reachabilityUrl: 'https://clients3.google.com/generate_204',
  //   reachabilityTest: async (response) => {
  //     // console.log('Response Status', response.status);
  //     return response.status === 204;
  //   },
  //   reachabilityLongTimeout: 5 * 1000, // 60s
  //   reachabilityShortTimeout: 5 * 1000, // 5s
  //   reachabilityRequestTimeout: 15 * 1000, // 15s
  // });

  useEffect(() => {
    console.log('UE ConnectionStatus []');
    if (netInfo.isInternetReachable !== null && netInfo.isConnected !== null) {
      dispatch(setOnlineStatus(netInfo));
    }
  }, [netInfo]);
};

export default ConnectionStatus;
