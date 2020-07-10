import React, {useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {ButtonGroup, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import AddButton from '../../shared/ui/AddButton';
import SectionDivider from '../../shared/ui/SectionDivider';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {projectReducers} from '../project/project.constants';
import {TagDetailModal, tagsStyles, useTagsHook} from '../tags';

const Tags = () => {
  const [useTags] = useTagsHook();
  const dispatch = useDispatch();
  const tags = useSelector(state => state.project.project.tags || []);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDetailModalVisibile, setIsDetailModalVisible] = useState(false);

  const addTag = () => {
    dispatch({type: projectReducers.SET_SELECTED_TAG, tag: {}});
    setIsDetailModalVisible(true);
  };

  const sections = [
    {id: 1, title: 'Geologic Units', content: 'geologic_unit'},
    {id: 2, title: 'Concepts', content: 'concept'},
    {id: 3, title: 'Documentation', content: 'documentation'},
    {id: 4, title: 'Rosetta', content: 'rosetta'},
    {id: 5, title: 'Experimental Apparatus', content: 'experimental_apparatus'},
    {id: 6, title: 'Other', content: 'other'},
  ];

  const sectionContents = (type) => {
    let filteredTags = {};
    if (!isEmpty(tags)) filteredTags = tags.filter(tag => tag.type === type);
    if (isEmpty(filteredTags)) {
      return (
        <View style={{alignContent: 'center', justifyContent: 'center'}}>
          <Text style={commonStyles.noValueText}>No Tags</Text>
        </View>
      );
    }
    return (
      <FlatList keyExtractor={(item) => item.id.toString()}
                data={filteredTags}
                renderItem={({item}) => renderTag(item)}/>
    );
  };

  const renderTag = (item) => {
    if (!isEmpty(item)) {
      return (
        <ListItem
          title={item.name}
          containerStyle={[commonStyles.listItem, {marginTop: 1}]}
          rightTitle={useTags.renderSpotCount(item)}
          rightTitleStyle={tagsStyles.valueInList}
          onPress={() => {
            dispatch({
              type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE,
              view: settingPanelReducers.SET_SIDE_PANEL_VIEW.TAG_DETAIL,
              bool: true,
            });
            dispatch({type: projectReducers.SET_SELECTED_TAG, tag: item});
          }
          }
          chevron
        />
      );
    }
    else return <Text>No Data</Text>;
  };

  const renderTagsList = (sections) => {
    return (
      <FlatList
        keyExtractor={(section) => section.id.toString()}
        data={sections}
        renderItem={({item}) => renderSections(item)}/>
    );
  };

  const renderSections = (section) => {
    return (
      <View>
        <SectionDivider dividerText={section.title}/>
        {sectionContents(section.content)}
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <ButtonGroup
          selectedIndex={selectedIndex}
          onPress={(index) => {
            console.log(index);
            setSelectedIndex(index);
          }}
          buttons={['Categorized', 'Map Extent', 'Recently Used']}
          containerStyle={{height: 50}}
          buttonStyle={{padding: 5}}
          textStyle={{fontSize: 12}}
        />
      </View>
      <AddButton
        onPress={addTag}
        title={'Add New Tag'}
      />
      <View style={{flex: 9}}>
        {tags && renderTagsList(sections)}
      </View>
      <TagDetailModal
        isVisible={isDetailModalVisibile}
        closeModal={() => setIsDetailModalVisible(false)}
      />
    </View>
  );
};

export default Tags;
