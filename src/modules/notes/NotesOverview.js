import React from 'react';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {truncateText} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';

const SpotNotesOverview = ({page}) => {

  const dispatch = useDispatch();
  const savedNote = useSelector(state => state.spot.selectedSpot.properties.notes);

  return (
    <>
      {savedNote ? (
          <ListItem
            containerStyle={commonStyles.listItem}
            onPress={() => dispatch(setNotebookPageVisible(page.key))}
          >
            <ListItem.Content style={{maxHeight: 300}}>
              <ListItem.Title style={commonStyles.listItemTitle}>{truncateText(savedNote, 300)}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )
        : <ListEmptyText text={'No Notes'}/>}
    </>
  );
};

export default SpotNotesOverview;
