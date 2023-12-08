import React, {useEffect} from 'react';

import {useDispatch} from 'react-redux';

import RockPage from './RockPage';
import {setSelectedAttributes} from '../spots/spots.slice';

const RockMetamorphicPage = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('UE RockMetamorphicPage [props.page]', props.page);
    return () => dispatch(setSelectedAttributes([]));
  }, [props.page]);

  return (
    <RockPage {...props}/>
  );
};

export default RockMetamorphicPage;
