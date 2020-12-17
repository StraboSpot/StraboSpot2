import React from 'react';
import {FlatList, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import attributesStyles from '../main-menu-panel/attributes.styles';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {NOTEBOOK_PAGES, NOTEBOOK_SUBPAGES} from '../notebook-panel/notebook.constants';
import useSpotsHook from '../spots/useSpots';

const SamplesList = (props) => {
  const [useSpots] = useSpotsHook();

  const recentViews = useSelector(state => state.spot.recentViews);
  const sortedView = useSelector(state => state.mainMenu.sortedView);
  const spots = useSelector(state => state.spot.spots);

  const renderSample = (sample, spot) => {
    return (
      <ListItem key={sample.id} onPress={() => props.openSpotInNotebook(spot, NOTEBOOK_SUBPAGES.SAMPLEDETAIL, [sample])}>
        <ListItem.Content>
          <ListItem.Title>{sample.sample_id_name}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const renderSamplesInSpot = (spot) => {
    return (
      <View style={attributesStyles.listContainer}>
        <View style={attributesStyles.listHeading}>
          <Text style={[attributesStyles.headingText]}>
            {spot.properties.name}
          </Text>
          <Button
            titleStyle={{fontSize: 16}}
            title={'View In Spot'}
            type={'clear'}
            onPress={() => props.openSpotInNotebook(spot, NOTEBOOK_PAGES.SAMPLE)}
          />
        </View>
        <FlatList
          keyExtractor={(sample) => sample.id.toString()}
          data={spot.properties.samples}
          renderItem={({item}) => renderSample(item, spot)}
        />
      </View>
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
      <React.Fragment>
        <SortingButtons/>
        <View style={attributesStyles.spotListContainer}>
          {isEmpty(sortedSpotsWithSamples)
            ? <Text style={{padding: 10}}>{noSamplesText}</Text>
            : (
              <FlatList
                keyExtractor={(item) => item.properties.id.toString()}
                data={sortedSpotsWithSamples}
                renderItem={({item}) => renderSamplesInSpot(item)}
              />
            )
          }
        </View>
      </React.Fragment>
    );
  };

  const renderNoSamplesText = () => {
    return (
      <View style={attributesStyles.textContainer}>
        <Text style={attributesStyles.text}>No Samples in Active Datasets</Text>
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
