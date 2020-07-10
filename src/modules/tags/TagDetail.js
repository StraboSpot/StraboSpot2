import React, {useState} from 'react';
import {FlatList, ScrollView, Text, TextInput, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {toTitleCase, getDimensions, isEmpty} from '../../shared/Helpers';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import useMapsHook from '../maps/useMaps';
import {NotebookPages, notebookReducers} from '../notebook-panel/notebook.constants';
import useSpotsHook from '../spots/useSpots';
import {TagDetailModal, tagsStyles, useTagsHook} from '../tags';

const TagDetail = (props) => {
  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const [isDetailModalVisibile, setIsDetailModalVisible] = useState(false);
  const [useMaps] = useMapsHook();
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();

  const openSpotInNotebook = (spot) => {
    useMaps.setSelectedSpot(spot);
    props.openNotebookPanel(NotebookPages.OVERVIEW);
    dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: NotebookPages.OVERVIEW});
    dispatch({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: true});
  };

  /*const renderSpotListItem1 = (spot, i) => {
    const spotData = useSpots.getSpotById(spot);
    if (!isEmpty(spotData)) {
      return (
        <ListItem
          title={spotData.properties.name}
          bottomDivider={i < selectedTag.spots.length - 1}
        />
      );
    }
  };*/

  const renderSpotListItem = (spotId) => {
    const spot = useSpots.getSpotById(spotId);
    if (!isEmpty(spot)) {
      return <ListItem
        title={spot.properties.name}
        onPress={() => openSpotInNotebook(spot)}
        bottomDivider
      />;
    }
  };

  const renderTagInfo = () => {
    let type = selectedTag.type ? useTags.getLabel(selectedTag.type) : undefined;
    if (selectedTag.type === 'other' && selectedTag.other_type) type = selectedTag.other_type;
    const subtypeFields = ['other_concept_type', 'other_documentation_type', 'concept_type', 'documentation_type'];
    const subTypeField = subtypeFields.find(subtype => selectedTag[subtype]);
    const subType = subTypeField ? useTags.getLabel(selectedTag[subTypeField]) : undefined;
    const rockUnitFields = ['unit_label_abbreviation', 'map_unit_name', 'member_name', 'rock_type'];
    let rockUnitString = rockUnitFields.reduce((acc, field) => {
      if (selectedTag[field]) return acc + (!isEmpty(acc) ? ' - ' : '') + selectedTag[field];
      else return acc;
    }, []);
    const notes = selectedTag.notes ? selectedTag.notes : undefined;
    return (
      <View style={tagsStyles.sectionContainer}>
        {type && <Text>Type: {type}{subType && ' - ' + subType.toUpperCase()}</Text>}
        {rockUnitString && <Text>{rockUnitString}</Text>}
        {notes && <Text>Notes: {notes}</Text>}
      </View>
    );
  };

  /* const renderTagInfo1 = () => {
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
   };*/

  const renderTaggedSpots = () => {
    return (
      <View style={{...commonStyles.buttonContainer, flex: 1}}>
        {selectedTag && selectedTag.spots ?
          <FlatList
            keyExtractor={(item) => item.toString()}
            data={selectedTag.spots}
            renderItem={({item}) => renderSpotListItem(item)}
          />
          : <Text>No Spots</Text>}
      </View>
    );
  };

  /*  const renderTaggedSpots1 = () => {
   const height = getDimensions().height;
   return (
   <View style={[tagsStyles.sectionContainer, {maxHeight: height * 0.40}]}>
   <ScrollView>
   {selectedTag && selectedTag.spots ?
   selectedTag.spots.map((spotId, index) => {
   return <View key={spotId}>{renderSpotListItem(spotId, index)}</View>;
   }) : <Text>No Spots</Text>}
   </ScrollView>
   </View>
   );
   };*/

 /* const renderTypeFields = () => {
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
  };*/

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
