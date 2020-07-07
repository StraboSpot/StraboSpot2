import React, {useState} from 'react';
import {FlatList, ScrollView, Text, TextInput, View} from 'react-native';

// Packages
import {ListItem} from 'react-native-elements';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {tagTypes} from './tags.constants';
import {useDispatch, useSelector} from 'react-redux';
import Concept from './tag/Concept';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import {toTitleCase} from '../../shared/Helpers';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {getDimensions, isEmpty} from '../../shared/Helpers';

// Styles
import tagStyles from './tags.styles';
import commonStyles from '../../shared/common.styles';

// Hooks
import useTagHooks from '../tags/useTags';
import useSpotsHook from '../spots/useSpots';

const TagDetail = () => {
  const [useTags] = useTagHooks();
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
        <View style={tagStyles.sectionContainer}>
          <View>
            <ListItem
              title={'Name'}
              titleStyle={commonStyles.listItemTitle}
              rightElement={
                <TextInput
                  defaultValue={!isEmpty(selectedTag) && selectedTag.name}
                  onChangeText={(text) => setTagName(text)}
                  onBlur={() => useTags.save(selectedTag.id, tagName)}
                  style={tagStyles.listText}
                />
              }
              bottomDivider={true}
            />
            <ListItem
              title={'Type'}
              titleStyle={commonStyles.listItemTitle}
              rightElement={
                <Text style={tagStyles.listText}>{titleCase}</Text>
              }
            />
          </View>
        </View>
        <View>
          {renderTypeFields(selectedTag.type)}
        </View>
        <View style={tagStyles.sectionContainer}>
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
      <View style={[tagStyles.sectionContainer, {maxHeight: height * .40}]}>
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
