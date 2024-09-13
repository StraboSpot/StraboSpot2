import React from 'react';
import {SectionList, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import UpdateSpotsInMapExtentButton from '../../shared/ui/UpdateSpotsInMapExtentButton';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {PAGE_KEYS} from '../page/page.constants';
import useSpotsHook from '../spots/useSpots';

const SamplesMenuItem = ({openSpotInNotebook, updateSpotsInMapExtent}) => {
  const useSpots = useSpotsHook();

  const sortedView = useSelector(state => state.mainMenu.sortedView);

  const renderNoSamplesText = () => {
    return <ListEmptyText text={'No Samples in Active Datasets'}/>;
  };

  const renderSample = (sample, spot) => {
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={sample.id}
        onPress={() => openSpotInNotebook(spot, PAGE_KEYS.SAMPLES, [sample])}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{sample.sample_id_name || 'Unknown'}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const renderSamplesList = () => {
    let sortedSpotsWithSamples = useSpots.getSpotsWithSamplesSortedReverseChronologically();
    let noSamplesText = 'No active Spots with samples';
    if (sortedView === SORTED_VIEWS.MAP_EXTENT) {
      const spotsInMapExtent = useSpots.getSpotsInMapExtent();
      sortedSpotsWithSamples = spotsInMapExtent.filter(spot => !isEmpty(spot.properties.samples));
      if (isEmpty(sortedSpotsWithSamples)) noSamplesText = 'No active Spots with samples in current map extent';
    }
    else if (sortedView === SORTED_VIEWS.RECENT_VIEWS) {
      const recentlyViewedSpots = useSpots.getRecentSpots();
      sortedSpotsWithSamples = recentlyViewedSpots.filter(spot => !isEmpty(spot.properties.samples));
      if (!isEmpty(sortedSpotsWithSamples)) noSamplesText = 'No recently viewed active Spots with samples';
    }
    let count = 0;
    const dataSectioned = sortedSpotsWithSamples.map((s) => {
      count += s.properties.samples.length;
      return {title: s.properties.name, data: s.properties.samples, spot: s};
    });

    return (
      <View style={{flex: 1}}>
        <SortingButtons/>
        {sortedView === SORTED_VIEWS.MAP_EXTENT && (
          <UpdateSpotsInMapExtentButton
            title={'Update Samples in Map Extent'}
            updateSpotsInMapExtent={updateSpotsInMapExtent}
          />
        )}
        <View style={{flex: 1}}>
          <SectionDivider dividerText={count + (count === 1 ? ' Sample' : ' Samples') + ' in active Spots'}/>
          <SectionList
            keyExtractor={(item, index) => item + index}
            sections={dataSectioned}
            renderSectionHeader={({section}) => renderSectionHeader(section)}
            renderItem={({item, i, section}) => renderSample(item, section.spot)}
            stickySectionHeadersEnabled={true}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={noSamplesText}/>}
          />
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({title, spot}) => {
    return (
      <View style={uiStyles.sectionHeaderBackground}>
        <SectionDividerWithRightButton
          dividerText={title}
          buttonTitle={'View In Spot'}
          onPress={() => openSpotInNotebook(spot, PAGE_KEYS.SAMPLES)}
        />
      </View>
    );
  };

  return (
    <>
      {isEmpty(useSpots.getSpotsWithSamples()) ? renderNoSamplesText() : renderSamplesList()}
    </>
  );
};

export default SamplesMenuItem;
