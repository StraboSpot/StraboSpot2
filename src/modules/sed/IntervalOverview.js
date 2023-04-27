import React from 'react';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import useSedHook from './useSed';

const IntervalOverview = (props) => {
  const dispatch = useDispatch();
  const character = useSelector(state => state.spot.selectedSpot.properties.sed?.character) || '';
  const interval = useSelector(state => state.spot.selectedSpot.properties.sed?.interval) || {};

  const useSed = useSedHook();

  return (
    <React.Fragment>
      <ListItem
        containerStyle={commonStyles.listItem}
        onPress={() => dispatch(setNotebookPageVisible(props.page.key))}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>
            {useSed.getIntervalTitle(character, interval)}
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
    </React.Fragment>
  );
};

export default IntervalOverview;
