import React from 'react';
import {FlatList, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
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

  const renderSamplesInSpot = (spot) => {
    return (
      <React.Fragment>
        <SectionDividerWithRightButton
          dividerText={spot.properties.name}
          buttonTitle={'View In Spot'}
          onPress={() => props.openSpotInNotebook(spot, NOTEBOOK_PAGES.SAMPLE)}
        />
        <FlatList
          keyExtractor={(sample) => sample.id.toString()}
          data={spot.properties.samples}
          renderItem={({item}) => renderSample(item, spot)}
          ItemSeparatorComponent={FlatListItemSeparator}
        />
      </React.Fragment>
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
    return (
      <View style={{flex: 1}}>
        <SortingButtons/>
        <View style={{flex: 1}}>
          <FlatList
            keyExtractor={(item) => item.properties.id.toString()}
            data={sortedSpotsWithSamples}
            renderItem={({item}) => renderSamplesInSpot(item)}
            ListEmptyComponent={<ListEmptyText text={noSamplesText}/>}
          />
        </View>
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
