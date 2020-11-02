import React, {useState, useEffect} from 'react';
import {Alert, FlatList, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {connect, useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import attributesStyles from '../main-menu-panel/attributes.styles';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setSelectedButtonIndex, setSortedView} from '../main-menu-panel/mainMenuPanel.slice';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';

const SamplesList = (props) => {
  const dispatch = useDispatch();
  const sortedListView = useSelector(state => state.mainMenu.sortedView);
  const [sortedList, setSortedList] = useState(Object.values(props.spots));
  const [filteredList] = useState(sortedList.filter(spot => {
    return !isEmpty(spot.properties.samples);
  }));
  const [refresh, setRefresh] = useState(false);
  const {spots, selectedSpot} = props;

  useEffect(() => {
    console.log('Render in Samples List');
    return function cleanUp() {
      dispatch(setSortedView({view: SORTED_VIEWS.CHRONOLOGICAL}));
      dispatch(setSelectedButtonIndex({index: 0}));
    };
  }, []);

  useEffect(() => {
    setSortedList(Object.values(spots));
    console.log('Render recent view in SamplesList!');
  }, [props.selectedSpot, props.spots, sortedListView]);

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
            onPress={() => props.getSpotData(item.properties.id, NOTEBOOK_PAGES.SAMPLE)}
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
    const spot = props.spots[spotID];
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
              onPress={() => props.getSpotData(spot.properties.id, NOTEBOOK_PAGES.SAMPLE)}
            />
          </View>
          <FlatList
            data={spot.properties.samples === undefined ? null : spot.properties.samples}
            keyExtractor={(sample) => sample.id.toString()}
            renderItem={({item}) => renderSample(item)}
          />
        </View>
      );
    }
  };

  const renderSample = (item) => {
    // console.log('ITEM', item)
    return (
      <ListItem key={item.id} onPress={() => Alert.alert('Will go to Sample Detail', `${item.id}`)}>
        <ListItem.Content>
          <ListItem.Title>{item.sample_id_name}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  let sortedView = null;
  // const filteredList = sortedList.filter(spot => {
  //   console.log(!isEmpty(spot.properties.samples))
  //   return !isEmpty(spot.properties.samples)
  // });
  if (!isEmpty(filteredList)) {
    if (sortedListView === SORTED_VIEWS.CHRONOLOGICAL) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={filteredList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (sortedListView === SORTED_VIEWS.MAP_EXTENT) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={filteredList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (sortedListView === SORTED_VIEWS.RECENT_VIEWS) {
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
        data={Object.values(props.spots)}
        renderItem={({item}) => renderName(item)}/>;
    }

    return (
      <React.Fragment>
        <SortingButtons/>
        {/*<ScrollView>*/}
        <View>
          {sortedView}
        </View>
        {/*</ScrollView>*/}
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
    recentViews: state.spot.recentViews,
    selectedImage: state.spot.selectedAttributes[0],
    selectedSpot: state.spot.selectedSpot,
    spots: state.spot.spots,
  };
};

export default connect(mapStateToProps)(SamplesList);
