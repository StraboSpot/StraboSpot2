import React from 'react';
import {Text, View} from 'react-native';

import {useSelector} from 'react-redux';

import ReturnToOverviewButton from './ui/ReturnToOverviewButton';
import {isEmpty} from '../../shared/Helpers';

const PlaceholderPage = () => {
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
