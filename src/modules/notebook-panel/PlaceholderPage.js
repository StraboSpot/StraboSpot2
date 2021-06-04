import React from 'react';
import {Text, View} from 'react-native';

import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';

const PlaceholderPage = (props) => {
  const notebookPageVisible = useSelector(state => (
    !isEmpty(state.notebook.visibleNotebookPagesStack) && state.notebook.visibleNotebookPagesStack.slice(-1)[0]
  ));

  return (
    <View>
      <ReturnToOverviewButton/>
      <Text style={{paddingLeft: 20}}>Placeholder Page for {notebookPageVisible}</Text>
    </View>
  );
};

export default PlaceholderPage;
