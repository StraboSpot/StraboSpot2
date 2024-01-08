import React, {useEffect} from 'react';

import {useDispatch} from 'react-redux';

import RockPage from './RockPage';
import {setSelectedAttributes} from '../spots/spots.slice';

const RockFaultPage = ({page}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('UE RockFaultPage [props.page]', page);
    return () => dispatch(setSelectedAttributes([]));
  }, [page]);

  return (
    <RockPage page={page}/>
  );
};

export default RockFaultPage;
