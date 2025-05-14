import {useSafeAreaFrame} from 'react-native-safe-area-context';

export const useWindowSize = () => {
  const {height, width} = useSafeAreaFrame();  // Used instead of Dimensions or useWindowDimensions.

  return {height, width};
};
