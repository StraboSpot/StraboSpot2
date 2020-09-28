import React from 'react';
import {Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {NotebookPages, notebookReducers} from './notebook.constants';

const PlaceholderPage = (props) => {
  const dispatch = useDispatch();

  const notebookPageVisible = useSelector(state => (
    !isEmpty(state.notebook.visibleNotebookPagesStack) && state.notebook.visibleNotebookPagesStack.slice(-1)[0]
  ));

  return (
    <View>
      <ReturnToOverviewButton
        onPress={() => dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: NotebookPages.OVERVIEW})}
      />
      <Text style={{paddingLeft: 20}}>Placeholder Page for {notebookPageVisible}</Text>
    </View>
  );
};

export default PlaceholderPage;
