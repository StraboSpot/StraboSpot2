import React from 'react';

import {useDispatch} from 'react-redux';

import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {setSelectedAttributes} from '../spots/spots.slice';
import SamplesList from './SamplesList';

const SamplesOverview = (props) => {
  const dispatch = useDispatch();

  const onPressed = (item) => {
    dispatch(setSelectedAttributes([item]));
    dispatch(setNotebookPageVisible(props.page.key));
  };

  return (
    <SamplesList
      onPress={onPressed}
      page={props.page}
    />
  );
};

export default SamplesOverview;
