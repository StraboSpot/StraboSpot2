import React, {useState, useRef} from 'react';
import {View} from 'react-native';

// Packages
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

// Components
import NonAutoFormDropdown from '../../../shared/NonAutoFormDropdown';

// Utilities
import {tagsReducers} from '../../tags';
import {toTitleCase} from '../../../shared/Helpers';

// Styles
import tagStyles from '../tags.styles';
import styles from '../../form/form.styles';

const Concept = () => {

  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.tags.selectedTag);
  const projectTags = useSelector(state => state.project.project.tags);

  const initial = () => {
    let str = selectedTag.concept_type;
    str = str.split('_').join(' ');
    return toTitleCase(str);
  };

  const [selectedItems, setSelectedItems] = useState(initial());

  const saveSelection = (conceptType) => {
    const tag = projectTags.find(tag => {
      return tag.id === selectedTag.id;
    });
    console.log('TAG', tag);
    // tag.concept_type = type;
    // console.log(tag)
    dispatch({type: tagsReducers.UPDATE_TAG, field: 'concept_type', value: conceptType[0]});
    // setSelectedItems(items)
  };

  return (
    <View style={tagStyles.sectionContainer}>
      <ListItem
        title={'Type'}
        containerStyle={{padding: 0, paddingTop: 10}}
        titleStyle={styles.fieldLabel}
        subtitle={
          <View style={{paddingLeft: 10}}>
            <NonAutoFormDropdown
              onSelectedItemsChange={(type) => saveSelection(type)}
              selectedItems={initial()}
              searchInputPlaceholderText={selectedItems ? selectedItems[0] : 'Select'}
              selectText={selectedTag.concept_type ? initial() : 'Select'}
            />
          </View>
        }
      />
    </View>
  );
};

export default Concept;
