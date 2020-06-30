import React, {useEffect, useState} from 'react';
import {FlatList, Platform, ScrollView, Text, TextInput, View, Dimensions} from 'react-native';
import {ListItem, Input} from 'react-native-elements';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {useDispatch, useSelector} from 'react-redux';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import {toTitleCase} from '../../shared/Helpers';
import SidePanelHeader from '../main-menu-panel/SidePanelHeader';
import {getDimensions, isEmpty} from '../../shared/Helpers';

// Styles
import tagStyles from './Tags.styles';
import commonStyles from '../../shared/common.styles';

// Hooks
import useTagHooks from '../tags/useTags';
import useSpotsHook from '../spots/useSpots';



const TagDetail = (props) => {

  const [useTags] = useTagHooks();
  const [useSpots] = useSpotsHook();

  const dispatch = useDispatch();
  const mainMenuPage = useSelector(state => state.settingsPanel.settingsPageVisible);
  const selectedTag = useSelector(state => state.settingsPanel.tag);

  const [tagName, setTagName] = useState(selectedTag.name)
  const [type, setType] = useState({countries: ['Suck It']})
  const [tagTypes, setTagTypes] = useState(undefined)

  useEffect(() => {
    setTagTypes(useTags.getTagTypes())
  }, []);

  const renderSpots = (spot, i) => {
    const spotData = useSpots.getSpotById(spot)
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
    let str= selectedTag.type;
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
    console.log('HEIGHT', height)
    return (
      <View style={[tagStyles.sectionContainer, {maxHeight: height * .55}]}>
        {selectedTag && selectedTag.spots ?
        <FlatList
          keyExtractor={(item) => item.toString()}
          data={selectedTag.spots}
          renderItem={({item, index}) => renderSpots(item, index)}/> :
        <Text>No Spots</Text>}
      </View>
    )
  };

  return (
    <React.Fragment>
      <SidePanelHeader
        backButton={() => dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false})}
        title={'Tags'}
        headerTitle={!isEmpty(selectedTag) && selectedTag.name}
      />
      <View>
        <View style={{zIndex: 100}}>
        <Divider sectionText={'Tag Info'}/>
        {renderTagInfo()}
        </View>
        <Divider sectionText={'Tagged Spots'}/>
        {renderTaggedSpots()}
      </View>
    </React.Fragment>
  );
};

export default TagDetail;
