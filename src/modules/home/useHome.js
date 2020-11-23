import {useDispatch} from 'react-redux';

import {setLoadingStatus} from './home.slice';

const useHome = () => {
  const dispatch = useDispatch();

  const toggleLoading = bool => {
    dispatch(setLoadingStatus({view: 'home', bool: bool}));
  };

  return [{
    toggleLoading: toggleLoading,
  }];
};

export default useHome;
