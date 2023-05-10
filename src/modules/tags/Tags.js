import React, {useState} from 'react';
import {FlatList, SectionList, Switch, View} from 'react-native';

import {ButtonGroup, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import AddButton from '../../shared/ui/AddButton';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import uiStyles from '../../shared/ui/ui.styles';
import {SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import {PAGE_KEYS} from '../page/page.constants';
import {setSelectedTag, setUseContinuousTagging} from '../project/projects.slice';
import {TagDetailModal, useTagsHook} from '../tags';

const Tags = (props) => {
  const [useTags] = useTagsHook();
  const dispatch = useDispatch();
  const tags = useSelector(state => state.project.project.tags) || [];
  const spotsInMapExtent = useSelector(state => state.map.spotsInMapExtent);
  const useContinuousTagging = useSelector(state => state.project.project.useContinuousTagging);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const SECTIONS = props.type === PAGE_KEYS.GEOLOGIC_UNITS ? [{title: 'Geologic Units', key: 'geologic_unit'}] : [
    {title: 'Concepts', key: 'concept'},
    {title: 'Documentation', key: 'documentation'},
    {title: 'Rosetta', key: 'rosetta'},
    {title: 'Experimental Apparatus', key: 'experimental_apparatus'},
    {title: 'Other', key: 'other'},
    {title: 'No Type Specified', key: undefined},
  ];

  const addTag = () => {
    dispatch(setSelectedTag({}));
    setIsDetailModalVisible(true);
  };

  const getTagTitle = (tag) => {
    return tag.name || '';
  };

  const getButtonTitle = () => {
    if (props.type === PAGE_KEYS.GEOLOGIC_UNITS) return ['Alphabetical', 'Map Extent'];
    return ['Categorized', 'Map Extent'];
  };

  const renderSectionHeader = (title) => {
    return (
      <View style={uiStyles.sectionHeaderBackground}>
        <SectionDivider dividerText={title}/>
      </View>
    );
  };

  const renderTag = (tag) => {
    const tagSpotCount = useTags.getTagSpotsCount(tag);
    const tagFeatureCount = useTags.getTagFeaturesCount(tag);
    const title = props.type === PAGE_KEYS.GEOLOGIC_UNITS ? tagSpotCount
      : '(' + tagSpotCount + ') (' + tagFeatureCount + ')';
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        onPress={() => {
          dispatch(setSidePanelVisible({view: SIDE_PANEL_VIEWS.TAG_DETAIL, bool: true}));
          dispatch(setSelectedTag(tag));
        }}
      >
        {useContinuousTagging && (
          <ListItem.CheckBox
            checked={tag.continuousTagging}
            onPress={() => useTags.toggleContinuousTagging(tag)}
          />
        )}
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{getTagTitle(tag)}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Content right>
          <ListItem.Title>{title}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const renderTagsListByMapExtent = () => {
    let tagsInMapExtent;
    const spotIds = spotsInMapExtent.map(spot => spot.properties.id);
    if (props.type === PAGE_KEYS.GEOLOGIC_UNITS) {
      tagsInMapExtent = tags.filter((tag) => {
        return tag.spots && !isEmpty(
          tag.spots.find(spotId => spotIds.includes(spotId))) && tag.type === PAGE_KEYS.GEOLOGIC_UNITS;
      });
    }
    else {
      tagsInMapExtent = tags.filter((tag) => {
        return tag.spots && !isEmpty(tag.spots.find(spotId => spotIds.includes(spotId)))
          && tag.type !== 'geologic_unit';
      });
    }
    console.log('tagsInMapExtent', tagsInMapExtent);

    return (
      <FlatList
        keyExtractor={item => item.id.toString()}
        data={tagsInMapExtent}
        renderItem={({item}) => renderTag(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No Spots with tags in current map extent'}/>}
      />
    );
  };

  const renderTagsListByRecentlyUsed = () => {
    return <ListEmptyText text={'This has not been implemented yet'}/>;
  };

  const renderTagsListByType = () => {
    const dataSectioned = Object.values(SECTIONS).reduce((acc, {title, key}) => {
      const data = tags?.filter(d => d.type === key) || [];
      const dataSorted = data.slice().sort((a, b) => getTagTitle(a).localeCompare(getTagTitle(b)));
      return [...acc, {title: title, data: dataSorted}];
    }, []);

    return (
      <SectionList
        keyExtractor={(item, index) => item + index}
        sections={dataSectioned}
        renderSectionHeader={({section: {title}}) => renderSectionHeader(title)}
        renderItem={({item}) => renderTag(item)}
        renderSectionFooter={({section: {data, title}}) => {
          return data.length === 0 && <ListEmptyText text={'No ' + title + ' Tags'}/>;
        }}
        stickySectionHeadersEnabled={true}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    );
  };

  return (
    <View style={{flex: 1}}>
      {!isEmpty(tags) && (
        <ButtonGroup
          selectedIndex={selectedIndex}
          onPress={index => setSelectedIndex(index)}
          buttons={getButtonTitle()}
          containerStyle={{height: 50}}
          buttonStyle={{padding: 5}}
          selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
          textStyle={{fontSize: 12}}
        />
      )}
      <AddButton
        onPress={addTag}
        title={'Create New Tag'}
        type={'outline'}
      />
      <ListItem containerStyle={commonStyles.listItem}>
        <ListItem.Content>
          <ListItem.Title
            style={commonStyles.listItemTitle}>{'Continuous Tagging'}
          </ListItem.Title>
        </ListItem.Content>
        <Switch onValueChange={value => dispatch(setUseContinuousTagging(value))}
                value={useContinuousTagging}/>
      </ListItem>
      {!isEmpty(tags) && (
        <View style={{flex: 1}}>
          {selectedIndex === 0 && renderTagsListByType()}
          {selectedIndex === 1 && renderTagsListByMapExtent()}
          {selectedIndex === 2 && renderTagsListByRecentlyUsed()}
        </View>
      )}
      {isEmpty(tags) && <ListEmptyText text={'No tags have been added to this project yet'}/>}
      <TagDetailModal
        isVisible={isDetailModalVisible}
        closeModal={() => setIsDetailModalVisible(false)}
        type={props.type}
      />
    </View>
  );
};

export default Tags;
