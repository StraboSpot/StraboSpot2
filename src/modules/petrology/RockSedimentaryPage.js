import React, {useEffect} from 'react';

import {useDispatch} from 'react-redux';

import {setSelectedAttributes} from '../spots/spots.slice';
import RockPage from './RockPage';

const RockSedimentaryPage = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('UE RockSedimentaryPage [props.page]', props.page);
    return () => dispatch(setSelectedAttributes([]));
  }, [props.page]);

  return (
    <RockPage {...props}/>
  );
};

export default RockSedimentaryPage;
