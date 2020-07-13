import React from 'react';
import {FlatList, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import {useSpotsHook} from '../spots';
import {useTagsHook} from '../tags';

const TagDetail = (props) => {
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();
  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);

  const renderSpotListItem = (spotId) => {
    const spot = useSpots.getSpotById(spotId);
    if (!isEmpty(spot)) {
      return <ListItem
        title={spot.properties.name}
        onPress={() => {
          props.openNotebookPanel();
          useTags.openSpotInNotebook(spot);
        }}
        chevron
        bottomDivider
      />;
    }
  };

  const renderTaggedSpots = () => {
    return (
      <View>
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
      <FlatList
        ListHeaderComponent={
          <View>
            <View>
              <View style={commonStyles.dividerWithButton}>
                <Divider sectionText={'Tag Info'}/>
                <Button
                  title={'view/edit'}
                  type={'clear'}
                  titleStyle={commonStyles.standardButtonText}
                  onPress={props.setIsDetailModalVisible}/>
              </View>
              {selectedTag && useTags.renderTagInfo()}
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
    </React.Fragment>
  );
};

export default TagDetail;
