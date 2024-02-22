import React, {useState} from 'react';
import {Switch} from 'react-native';

import {ButtonGroup, ListItem} from 'react-native-elements';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import AddButton from '../../shared/ui/AddButton';
import {PAGE_KEYS} from '../page/page.constants';
import {setSelectedTag, setUseContinuousTagging} from '../project/projects.slice';
import {TagDetailModal, TagsList} from '../tags';

const Tags = ({type}) => {
  console.log('Rendering Tags...');

  const dispatch = useDispatch();
  const tags = useSelector(state => state.project.project?.tags) || [];
  const useContinuousTagging = useSelector(state => state.project.project?.useContinuousTagging);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const addTag = () => {
    dispatch(setSelectedTag({}));
    setIsDetailModalVisible(true);
  };

  const getButtonTitle = () => {
    if (type === PAGE_KEYS.GEOLOGIC_UNITS) return ['Alphabetical', 'Map Extent'];
    return ['Categorized', 'Map Extent'];
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      {!isEmpty(tags) && (
        <ButtonGroup
          selectedIndex={selectedIndex}
          onPress={index => setSelectedIndex(index)}
          buttons={getButtonTitle()}
          containerStyle={{height: 50}}
          buttonStyle={{padding: 5}}
          selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
          textStyle={{fontSize: 12}}
        />
      )}
      <AddButton
        onPress={addTag}
        title={'Create New Tag'}
        type={'outline'}
      />
      <ListItem containerStyle={commonStyles.listItem}>
        <ListItem.Content>
          <ListItem.Title
            style={commonStyles.listItemTitle}>{'Continuous Tagging'}
          </ListItem.Title>
        </ListItem.Content>
        <Switch onValueChange={value => dispatch(setUseContinuousTagging(value))}
                value={useContinuousTagging}/>
      </ListItem>
      <TagsList type={type} selectedIndex={selectedIndex}/>
      <TagDetailModal
        isVisible={isDetailModalVisible}
        closeModal={() => setIsDetailModalVisible(false)}
        type={type}
      />
    </SafeAreaView>
  );
};

export default Tags;
