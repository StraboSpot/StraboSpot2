import {useState, useEffect} from 'react';

import NetInfo from '@react-native-community/netinfo';

NetInfo.configure({
  reachabilityUrl: 'https://clients3.google.com/generate_204',
  reachabilityTest: async (response) => {
    console.log('Response Status', response.status);
    return response.status === 204;
  },
  reachabilityLongTimeout: 5 * 1000, // 60s
  reachabilityShortTimeout: 5 * 1000, // 5s
  reachabilityRequestTimeout: 15 * 1000, // 15s
});

let currentNetwork;

NetInfo.fetch().then((state) => {
  currentNetwork = state.isConnected;
});

const CheckConnection = () => {
  const [netInfo, setNetInfo] = useState(currentNetwork);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
      console.log('Is internet reachable?', state.isInternetReachable);
      setNetInfo(state);
    });
    return () => {
      console.log('Network Test unsubscribed');
      unsubscribe();
    };
  });

  return netInfo;
};

export default CheckConnection;
