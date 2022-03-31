import React, {useEffect} from 'react';

import {useDispatch} from 'react-redux';

import {setSelectedAttributes} from '../spots/spots.slice';
import RockPage from './RockPage';

const RockFaultPage = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('UE RockFaultPage [props.page]', props.page);
    return () => dispatch(setSelectedAttributes([]));
  }, [props.page]);

  return (
    <RockPage {...props}/>
  );
};

export default RockFaultPage;
