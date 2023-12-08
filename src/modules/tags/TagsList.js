import React from 'react';
import {FlatList, SectionList, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {useTagsHook} from './index';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import uiStyles from '../../shared/ui/ui.styles';
import {SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import {PAGE_KEYS} from '../page/page.constants';
import {setSelectedTag} from '../project/projects.slice';

const TagsList = ({type, selectedIndex}) => {
  console.log('Rendering TagsList...');

  const dispatch = useDispatch();
  const spotsInMapExtent = useSelector(state => state.map.spotsInMapExtent);
  const tags = useSelector(state => state.project.project.tags) || [];
  const useContinuousTagging = useSelector(state => state.project.project.useContinuousTagging);

  const [useTags] = useTagsHook();

  const SECTIONS = type === PAGE_KEYS.GEOLOGIC_UNITS ? [{title: 'Geologic Units', key: 'geologic_unit'}] : [
    {title: 'Concepts', key: 'concept'},
    {title: 'Documentation', key: 'documentation'},
    {title: 'Rosetta', key: 'rosetta'},
    {title: 'Experimental Apparatus', key: 'experimental_apparatus'},
    {title: 'Other', key: 'other'},
    {title: 'No Type Specified', key: undefined},
  ];

  const getTagTitle = (tag) => {
    return tag.name || '';
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
    const title = type === PAGE_KEYS.GEOLOGIC_UNITS ? tagSpotCount
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
    if (type === PAGE_KEYS.GEOLOGIC_UNITS) {
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

  if (isEmpty(tags)) return <ListEmptyText text={'No tags have been added to this project yet'}/>;
  else {
    return (
      <View style={{flex: 1}}>
        {selectedIndex === 0 && renderTagsListByType()}
        {selectedIndex === 1 && renderTagsListByMapExtent()}
        {selectedIndex === 2 && renderTagsListByRecentlyUsed()}
      </View>
    );
  }
};

export default TagsList;
