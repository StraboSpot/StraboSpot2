import React, {useEffect} from 'react';

import {useDispatch} from 'react-redux';

import {setSelectedAttributes} from '../spots/spots.slice';
import RockPage from './RockPage';

const RockFaultPage = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    return () => dispatch(setSelectedAttributes([]));
  }, [props.page]);

  return (
    <RockPage {...props}/>
  );
};

export default RockFaultPage;
