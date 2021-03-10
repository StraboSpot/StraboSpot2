import React from 'react';
import {SectionList, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {NOTEBOOK_PAGES, NOTEBOOK_SUBPAGES} from '../notebook-panel/notebook.constants';
import useSpotsHook from '../spots/useSpots';

const SamplesList = (props) => {
  const [useSpots] = useSpotsHook();

  const recentViews = useSelector(state => state.spot.recentViews);
  const sortedView = useSelector(state => state.mainMenu.sortedView);
  const spots = useSelector(state => state.spot.spots);

  const renderNoSamplesText = () => {
    return <ListEmptyText text={'No Samples in Active Datasets'}/>;
  };

  const renderSample = (sample, spot) => {
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={sample.id}
        onPress={() => props.openSpotInNotebook(spot, NOTEBOOK_SUBPAGES.SAMPLEDETAIL, [sample])}
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
    let noSamplesText = 'No Spots with Samples';
    if (sortedView === SORTED_VIEWS.MAP_EXTENT) {
      sortedSpotsWithSamples = props.spotsInMapExtent.filter(spot => spot.properties.samples);
      if (isEmpty(sortedSpotsWithSamples)) noSamplesText = 'No Spots with samples in current map extent';
    }
    else if (sortedView === SORTED_VIEWS.RECENT_VIEWS) {
      const recentlyViewedSpots = recentViews.map(spotId => spots[spotId]);
      sortedSpotsWithSamples = recentlyViewedSpots.filter(spot => spot.properties.samples);
      if (!isEmpty(sortedSpotsWithSamples)) noSamplesText = 'No recently viewed Spots with samples';
    }
    const dataSectioned = sortedSpotsWithSamples.map(
      s => ({title: s.properties.name, data: s.properties.samples, spot: s}));

    return (
      <View style={{flex: 1}}>
        <SortingButtons/>
        <View style={{flex: 1}}>
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
          onPress={() => props.openSpotInNotebook(spot, NOTEBOOK_PAGES.SAMPLE)}
        />
      </View>
    );
  };

  return (
    <React.Fragment>
      {isEmpty(useSpots.getSpotsWithSamples()) ? renderNoSamplesText() : renderSamplesList()}
    </React.Fragment>
  );
};

export default SamplesList;
