import React, {useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty, truncateText} from '../../shared/Helpers';
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

  const renderSpotListItem = (spotId) => {
    const spot = useSpots.getSpotById(spotId);
    if (!isEmpty(spot)) {
      return <ListItem
        title={spot.properties.name}
        onPress={() => openSpotInNotebook(spot)}
        chevron
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
      if (selectedTag[field]) return acc + (!isEmpty(acc) ? ' / ' : '') + selectedTag[field];
      else return acc;
    }, []);
    const notes = selectedTag.notes ? truncateText(selectedTag.notes, 100) : undefined;
    return (
      <View style={tagsStyles.sectionContainer}>
        {type && <Text style={tagsStyles.listText}>{type}{subType && ' - ' + subType.toUpperCase()}</Text>}
        {!isEmpty(rockUnitString) && <Text style={tagsStyles.listText}>{rockUnitString}</Text>}
        {notes && <Text style={tagsStyles.listText}>Notes: {notes}</Text>}
      </View>
    );
  };

  const renderTaggedSpots = () => {
    return (
      <View style={commonStyles.buttonContainer}>
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
                <View style={commonStyles.dividerWithButton}>
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
