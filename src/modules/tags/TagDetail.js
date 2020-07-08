import React, {useState} from 'react';
import {FlatList, ScrollView, Text, TextInput, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
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
              bottomDivider
            />
            <ListItem
              title={'Type'}
              titleStyle={commonStyles.listItemTitle}
              bottomDivider
              rightElement={
                <Text style={tagsStyles.listText}>{titleCase}</Text>
              }
            />
            {renderTypeFields(selectedTag.concept_type)}
            <ListItem
              title={'Notes'}
              titleStyle={commonStyles.listItemTitle}
              rightElement={
                <TextInput
                  multiline={true}
                  placeholder={'No Notes'}
                  editable={false}
                  numberOfLines={5}
                  style={{flex: 2, minHeight: 50, maxHeight: 100}}
                  defaultValue={selectedTag && selectedTag.notes}
                />
              }
            />
          </View>
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

  const renderTypeFields = (type) => {
    if (type) {
      const titleCaseName = type.split('_').join(' ');
      switch (selectedTag.type) {
        case tagTypes.CONCEPT || tagTypes.DOCUMENTATION:
          return <ListItem
            titleStyle={{...commonStyles.listItemTitle, fontSize: 15}}
            title={'Concept Type'}
            bottomDivider
            rightElement={
              <Text style={tagsStyles.listText}>{toTitleCase(titleCaseName)}</Text>
            }
          />;
        default:
          return null;
      }
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
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                  <Divider sectionText={'Tag Info'}/>
                  <Button
                    title={'view/edit'}
                    type={'clear'}
                    titleStyle={commonStyles.standardButtonText}
                    onPress={() => console.log('pressed')}/>
                </View>
                {selectedTag && renderTagInfo()}
              </View>
              <View>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                  <Divider sectionText={'Tagged Spots'}/>
                  <Button
                    title={'add/remove'}
                    type={'clear'}
                    titleStyle={commonStyles.standardButtonText}
                    onPress={() => dispatch({
                      type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE,
                      bool: true,
                      view: settingPanelReducers.SET_SIDE_PANEL_VIEW.TAG_ADD_REMOVE_SPOTS })}/>
                </View>
                {selectedTag && renderTaggedSpots()}
              </View>
            </View>}
        />
      </View>
    </React.Fragment>
  );
};

export default TagDetail;
