import React from 'react';
import {ScrollView, Text, View} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import SectionDivider from '../../shared/ui/SectionDivider';
import {NotebookPages, notebookReducers} from '../notebook-panel/notebook.constants';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';

const Nesting = (props) => {
  const dispatch = useDispatch();
  const notebookPageVisible = useSelector(state => (
    !isEmpty(state.notebook.visibleNotebookPagesStack) && state.notebook.visibleNotebookPagesStack.slice(-1)[0]
  ));

  return (
    <View>
      {notebookPageVisible === NotebookPages.NESTING && (
        <ReturnToOverviewButton
          onPress={() => dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: NotebookPages.OVERVIEW})}
        />
      )}
      {notebookPageVisible === NotebookPages.NESTING && <SectionDivider dividerText='Nesting'/>}
      <ScrollView style={{padding: 10}}>
        <Text>In Development</Text>
      </ScrollView>
    </View>
  );
};

export default Nesting;
