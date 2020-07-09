import React, {useState} from 'react';
import {FlatList, ScrollView, Text, TextInput, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {toTitleCase, getDimensions, isEmpty} from '../../shared/Helpers';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import useSpotsHook from '../spots/useSpots';
import {TagDetailModal, tagsStyles, useTagsHook} from '../tags';

const TagDetail = () => {
  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const [isDetailModalVisibile, setIsDetailModalVisible] = useState(false);
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();

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
              title={'Name:'}
              containerStyle={tagsStyles.listContainer}
              titleStyle={commonStyles.listItemTitle}
              subtitle={selectedTag.name}
              subtitleStyle={tagsStyles.listText}
              bottomDivider
            />
            <ListItem
              title={'Type:'}
              containerStyle={tagsStyles.listContainer}
              titleStyle={commonStyles.listItemTitle}
              bottomDivider
              subtitle={useTags.getLabel(selectedTag.type)}
              subtitleStyle={tagsStyles.listText}
            />
            {renderTypeFields()}
            <ListItem
              title={'Notes:'}
              containerStyle={tagsStyles.listContainer}
              titleStyle={commonStyles.listItemTitle}
              subtitle={
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

  const renderTypeFields = () => {
    if (selectedTag.type) {
      let field;
      if (selectedTag.type === 'concept') field = 'concept_type';
      else if (selectedTag.type === 'documentation') field = 'documentation_type';
      else if (selectedTag.type === 'other') field = 'other';
      if (field && !isEmpty(selectedTag[field])) {
        return <ListItem
          titleStyle={{...commonStyles.listItemTitle}}
          title={useTags.getLabel(field) + ':'}
          containerStyle={tagsStyles.listContainer}
          bottomDivider
          subtitle={useTags.getLabel(selectedTag[field])}
          subtitleStyle={tagsStyles.listText}
        />;
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
                    onPress={() => setIsDetailModalVisible(true)}/>
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
                      view: settingPanelReducers.SET_SIDE_PANEL_VIEW.TAG_ADD_REMOVE_SPOTS,
                    })}/>
                </View>
                {selectedTag.spots && !isEmpty(selectedTag.spots) ? renderTaggedSpots() :
                  <View style={commonStyles.noContentContainer}>
                    <Text style={commonStyles.noValueText}>Contains no spots</Text>
                  </View>}
              </View>
            </View>}
        />
      </View>
      <TagDetailModal
        isVisible={isDetailModalVisibile}
        closeModal={() => setIsDetailModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default TagDetail;
