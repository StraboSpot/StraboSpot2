import React, {useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {ButtonGroup, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import AddButton from '../../shared/ui/AddButton';
import SectionDivider from '../../shared/ui/SectionDivider';
import {mainMenuPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {projectReducers} from '../project/project.constants';
import {TagDetailModal, tagsStyles, useTagsHook} from '../tags';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';

const Tags = () => {
  const [useTags] = useTagsHook();
  const dispatch = useDispatch();
  const tags = useSelector(state => state.project.project.tags || []);
  const spotsInMapExtent = useSelector(state => state.map.spotsInMapExtent);

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
    {id: 7, title: 'No Type Specified', content: undefined},
  ];

  const sectionContents = (type) => {
    let filteredTags = {};
    filteredTags = tags.filter(tag => tag.type === type);
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
          containerStyle={commonStyles.listItem}
          onPress={() => {
            dispatch(setSidePanelVisible(
              {view: mainMenuPanelReducers.SET_SIDE_PANEL_VIEW.TAG_DETAIL, bool: true},
            ));
            dispatch({type: projectReducers.SET_SELECTED_TAG, tag: item});
          }
          }
        >
          <ListItem.Content>
            <ListItem.Title>{item.name}</ListItem.Title>
          </ListItem.Content>
          <ListItem.Content right>
            <ListItem.Title>{useTags.renderSpotCount(item)}</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron/>
        </ListItem>
      );
    }
    else return <Text>No Data</Text>;
  };

  const renderTagsListByMapExtent = () => {
    const spotIds = spotsInMapExtent.map(spot => spot.properties.id);
    const tagsInMapExtent = tags.filter(tag => {
      return tag.spots && !isEmpty(tag.spots.find(spotId => spotIds.includes(spotId)));
    });
    console.log('tagsInMapExtent', tagsInMapExtent);

    if (!isEmpty(tagsInMapExtent)) {
      return (
        <FlatList keyExtractor={(item) => item.id.toString()}
                  data={tagsInMapExtent}
                  renderItem={({item}) => renderTag(item)}/>
      );
    }
    else return <Text style={{padding: 10}}>No Spots with tags in current map extent</Text>;
  };

  const renderTagsListByRecentlyUsed = () => {
    return <Text style={{padding: 10}}>This has not been implemented yet</Text>;
  };

  const renderTagsListByType = () => {
    return (
      <FlatList
        keyExtractor={(section) => section.id.toString()}
        data={sections}
        renderItem={({item}) => renderSections(item)}/>
    );
  };

  const renderSections = (section) => {
    if (section.id !== 7 || (section.id === 7 && !isEmpty(tags.filter(tag => tag.type === section.content)))) {
      return (
        <View>
          <SectionDivider dividerText={section.title}/>
          {sectionContents(section.content)}
        </View>
      );
    }
  };

  return (
    <View style={{flex: 1}}>
      {!isEmpty(tags) && (
        <ButtonGroup
          selectedIndex={selectedIndex}
          onPress={(index) => setSelectedIndex(index)}
          buttons={['Categorized', 'Map Extent', 'Recently Used']}
          containerStyle={{height: 50}}
          buttonStyle={{padding: 5}}
          textStyle={{fontSize: 12}}
        />
      )}
      <AddButton
        onPress={addTag}
        title={'Add New Tag'}
      />
      {!isEmpty(tags) && (
        <View style={{flex: 1}}>
          {selectedIndex === 0 && renderTagsListByType()}
          {selectedIndex === 1 && renderTagsListByMapExtent()}
          {selectedIndex === 2 && renderTagsListByRecentlyUsed()}
        </View>
      )}
      {isEmpty(tags) && (
        <Text style={{padding: 10, textAlign: 'center'}}>No tags have been added to this project yet</Text>
      )}
      <TagDetailModal
        isVisible={isDetailModalVisibile}
        closeModal={() => setIsDetailModalVisible(false)}
      />
    </View>
  );
};

export default Tags;
