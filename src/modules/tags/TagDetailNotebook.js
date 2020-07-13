import React from 'react';
import {Text, View} from 'react-native';

import {useDispatch} from 'react-redux';

import {homeReducers} from '../home/home.constants';
import {NotebookPages, notebookReducers} from '../notebook-panel/notebook.constants';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {TagDetail, useTagsHook} from '../tags';


const TagDetailNotebook = () => {
  const [useTags] = useTagsHook();
  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <ReturnToOverviewButton
        onPress={() => {
          dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: NotebookPages.OVERVIEW});
          dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: null});
        }}
      />
      <TagDetail
        openSpot={(spot) => useTags.openSpotInNotebook(spot)}
      />
    </React.Fragment>
  );
};

export default TagDetailNotebook;
