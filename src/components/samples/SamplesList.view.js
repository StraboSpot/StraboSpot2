import React, {useState, useEffect} from 'react';
import {Alert, FlatList, ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {spotReducers} from '../../spots/Spot.constants';
import {homeReducers} from '../../views/home/Home.constants';
import SortingButtons from '../settings-panel/Sorting';
import {NotebookPages, notebookReducers} from '../notebook-panel/Notebook.constants';
import {settingPanelReducers, SortedViews} from '../settings-panel/settingsPanel.constants';
import {Button, ListItem} from 'react-native-elements';
import {isEmpty} from '../../shared/Helpers';
// import sampleStyles from './samples.style';
import attributesStyles from '../../components/settings-panel/settingsPanelSectionStyles/Attributes.styles';
import imageStyles from '../images/images.styles';

const SamplesList = (props) => {
  const [sortedList, setSortedList] = useState(props.spots);
  const [refresh, setRefresh] = useState(false);
  // const {selectedSpot} = props;
  const {spots, sortedListView, selectedSpot} = props;

  useEffect(() => {
    console.log('Render in Samples List');
    return function cleanUp() {
      props.setSortedListView(SortedViews.CHRONOLOGICAL);
      props.setSelectedButtonIndex(0);
    };
  }, []);

  useEffect(() => {
    setSortedList(spots);
    setRefresh(!refresh);
    console.log('Render recent view in SamplesList!');
  }, [selectedSpot, spots, sortedList, sortedListView]);

  const renderName = (item) => {
    return (
      <View style={attributesStyles.listContainer}>
        <View style={attributesStyles.listHeading}>
          <Text style={attributesStyles.headingText}>
            {item.properties.name}
          </Text>
          <Button
            titleStyle={{fontSize: 16}}
            title={'View In Spot'}
            type={'clear'}
            onPress={() => props.getSpotData(item.properties.id, NotebookPages.SAMPLE)}
          />
        </View>
        <FlatList
          keyExtractor={(sample) => sample.id.toString()}
          data={item.properties.samples}
          renderItem={({item}) => renderSample(item)}
        />
      </View>
    );
  };

  const renderRecentView = (spotID) => {
    const spot = props.spots.find(spot => {
      return spot.properties.id === spotID;
    });
    if (spot.properties.samples && !isEmpty(spot.properties.samples)) {
      return (
        <View style={attributesStyles.listContainer}>
          <View style={attributesStyles.listHeading}>
            <Text style={attributesStyles.headingText}>
              {spot.properties.name}
            </Text>
            <Button
              titleStyle={{fontSize: 16}}
              title={'View In Spot'}
              type={'clear'}
              onPress={() => props.getSpotData(spot.properties.id, NotebookPages.SAMPLE)}
            />
          </View>
          <FlatList
            data={spot.properties.samples === undefined ? null : spot.properties.samples}
            keyExtractor={(sample) => sample.id}
            // numColumns={3}
            renderItem={({item}) => renderSample(item)}
          />
        </View>
      );
    }
  };

  const renderSample = (item) => {
    // console.log('ITEM', item)
    return (
      <ListItem
        key={item.id}
        title={item.sample_id_name ? item.sample_id_name :
          <Text style={{color: 'grey'}}>Sample id: {item.id}</Text>}
        chevron={true}
        onPress={() => Alert.alert('Will go to Sample Detail', `${item.id}`)}
      />
    );
  };

  let sortedView = null;
  const filteredList = sortedList.filter(spot => {
    return !isEmpty(spot.properties.samples);
  });
  if (!isEmpty(filteredList)) {
    if (props.sortedListView === SortedViews.CHRONOLOGICAL) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={filteredList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (props.sortedListView === SortedViews.MAP_EXTENT) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={filteredList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (props.sortedListView === SortedViews.RECENT_VIEWS) {
      sortedView = <FlatList
        keyExtractor={(item) => item.toString()}
        extraData={refresh}
        data={props.recentViews}
        // inverted={true}
        renderItem={({item}) => renderRecentView(item)}/>;
    }
    else {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={props.spots}
        renderItem={({item}) => renderName(item)}/>;
    }

    return (
      <React.Fragment>
        <SortingButtons/>
        <ScrollView>
          <View>
            {sortedView}
          </View>
        </ScrollView>
      </React.Fragment>
    );
  }
  else {
    return (
      <View style={attributesStyles.textContainer}>
        <Text style={attributesStyles.text}>No Samples Found</Text>
      </View>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    spots: state.spot.features,
    recentViews: state.spot.recentViews,
    sortedListView: state.settingsPanel.sortedView,
    selectedButtonIndex: state.settingsPanel.selectedButtonIndex,
    selectedImage: state.spot.selectedAttributes[0],
    selectedSpot: state.spot.selectedSpot,
  };
};

const mapDispatchToProps = {
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setSortedListView: (view) => ({type: settingPanelReducers.SET_SORTED_VIEW, view: view}),
  setSelectedButtonIndex: (index) => ({type: settingPanelReducers.SET_SELECTED_BUTTON_INDEX, index: index}),
};

export default connect(mapStateToProps, mapDispatchToProps)(SamplesList);
