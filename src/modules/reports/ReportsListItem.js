import React from 'react';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {useTags} from '../tags';

const ReportsListItem = ({
                           doShowTags,
                           isCheckedList,
                           onPress,
                           report,
                         }) => {
  console.log('Rendering ReportsListItem', report.id, '...');
  console.log(report);

  const {addRemoveSpotFromTag, getTagsAtSpot} = useTags();

  const selectedTag = useSelector(state => state.project.selectedTag);

  const renderCheckboxes = () => {
    return (
      <ListItem.CheckBox
        checked={selectedTag.spots && selectedTag.spots.includes(report.id)}
        onPress={() => addRemoveSpotFromTag(report.id, selectedTag)}
      />
    );
  };

  const renderTags = () => {
    const tags = getTagsAtSpot(report.id);
    const tagsString = tags.map(tag => tag.name).sort().join(', ');
    return !isEmpty(tagsString) && <ListItem.Subtitle>{tagsString}</ListItem.Subtitle>;
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      keyExtractor={(item, index) => item?.id || index.toString()}
      onPress={() => onPress(report)}
    >
      <ListItem.Content>
        <ListItem.Title style={commonStyles.listItemTitle}>{report?.subject || 'No Subject'}</ListItem.Title>
        {doShowTags && report && renderTags()}
      </ListItem.Content>
      {isCheckedList ? renderCheckboxes() : report && <ListItem.Chevron/>}
    </ListItem>
  );
};

export default ReportsListItem;
