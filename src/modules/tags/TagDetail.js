import React, {useState} from 'react';
import {FlatList, ScrollView, Text, TextInput, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {toTitleCase,getDimensions, isEmpty} from '../../shared/Helpers';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import useSpotsHook from '../spots/useSpots';
import {Concept, tagsStyles, tagTypes, useTagsHook} from '../tags';

const TagDetail = () => {
  const [useTags] = useTagsHook();
  const [useSpots] = useSpotsHook();

  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.tags.selectedTag);

  const [tagName, setTagName] = useState(selectedTag && selectedTag.name ? selectedTag.name : 'Undefined');

  const renderSpots = (spot, i) => {
    const spotData = useSpots.getSpotById(spot);
    if (!isEmpty(spotData)) {
      return (
        <ListItem
          title={spotData.properties.name}
          bottomDivider={i < selectedTag.spots.length - 1}
        />
      );
    }
  };

  const renderTagInfo = () => {
    let str = selectedTag.type;
    str = str.split('_').join(' ');
    const titleCase = toTitleCase(str);
    return (
      <View>
        <View style={tagsStyles.sectionContainer}>
          <View>
            <ListItem
              title={'Name'}
              titleStyle={commonStyles.listItemTitle}
              rightElement={
                <TextInput
                  defaultValue={!isEmpty(selectedTag) && selectedTag.name}
                  onChangeText={(text) => setTagName(text)}
                  onBlur={() => useTags.save(selectedTag.id, tagName)}
                  style={tagsStyles.listText}
                />
              }
              bottomDivider={true}
            />
            <ListItem
              title={'Type'}
              titleStyle={commonStyles.listItemTitle}
              rightElement={
                <Text style={tagsStyles.listText}>{titleCase}</Text>
              }
            />
          </View>
        </View>
        <View>
          {renderTypeFields(selectedTag.type)}
        </View>
        <View style={tagsStyles.sectionContainer}>
          <TextInput
            multiline={true}
            placeholder={'No Notes'}
            numberOfLines={5}
            style={{minHeight: 50, maxHeight: 100}}
            defaultValue={selectedTag && selectedTag.notes}
          />
        </View>
      </View>
    );
  };

  const renderTaggedSpots = () => {
    const height = getDimensions().height;
    return (
      <View style={[tagsStyles.sectionContainer, {maxHeight: height * 0.40}]}>
        <ScrollView>
          {selectedTag && selectedTag.spots ?
            selectedTag.spots.map((spotId, index) => {
              return <View key={spotId}>{renderSpots(spotId, index)}</View>;
            }) : <Text>No Spots</Text>}
        </ScrollView>
      </View>
    );
  };

  const renderTypeFields = () => {
    switch (selectedTag.type) {
      case tagTypes.CONCEPT:
        return <Concept/>;
      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      <SidePanelHeader
        backButton={() => dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false})}
        title={'Tags'}
        headerTitle={!isEmpty(selectedTag) && selectedTag.name}
      />
      <View style={{flex: 5, paddingTop: 10}}>
        <FlatList
          ListHeaderComponent={
            <View>
              <View>
                <Divider sectionText={'Tag Info'}/>
                {selectedTag && renderTagInfo()}
              </View>
              <View>
                <Divider sectionText={'Tagged Spots'}/>
                {selectedTag && renderTaggedSpots()}
              </View>
            </View>}
        />
      </View>
    </React.Fragment>
  );
};

export default TagDetail;
