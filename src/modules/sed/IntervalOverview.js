import React from 'react';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useSedHook from './useSed';
import commonStyles from '../../shared/common.styles';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';

const IntervalOverview = ({page}) => {
  const dispatch = useDispatch();
  const character = useSelector(state => state.spot.selectedSpot.properties.sed?.character) || '';
  const interval = useSelector(state => state.spot.selectedSpot.properties.sed?.interval) || {};

  const useSed = useSedHook();

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      onPress={() => dispatch(setNotebookPageVisible(page.key))}
    >
      <ListItem.Content>
        <ListItem.Title style={commonStyles.listItemTitle}>
          {useSed.getIntervalTitle(character, interval)}
        </ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
};

export default IntervalOverview;
