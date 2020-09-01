import React from 'react';
import {ScrollView} from 'react-native';

import {ListItem} from 'react-native-elements';
import {connect} from 'react-redux';

import * as themes from '../../shared/styles.constants';
import {spotReducers} from '../spots/spot.constants';
import useSpotsHook from '../spots/useSpots';
import notebookStyles from './notebookPanel.styles';

const AllSpots = (props) => {
  const [useSpots] = useSpotsHook();
  const activeSpotsObj = useSpots.getActiveSpotsObj();

  const pressHandler = (id) => {
    const spot = Object.values(activeSpotsObj).find(selectedSpot => {
      return selectedSpot.properties.id === id;
    });
    console.log('Switch Selected Spot', spot);
    props.onSetSelectedSpot(spot);
  };

  return (
    <React.Fragment>
      <ScrollView>
        {Object.values(activeSpotsObj).map(spot => {
          return (
            <ListItem
              key={spot.properties.id}
              containerStyle={{paddingTop: 5}}
              onPress={() => selectSpot(spot.properties.id)}
            >
              <ListItem.Content style={notebookStyles.allSpotsPanelContents}>
                <ListItem.Title style={{fontSize: 14}}>{spot.properties.name}</ListItem.Title>
                <ListItem.Subtitle
                  style={{fontSize: 12}}>{spot.geometry && spot.geometry.type || 'No Geometry'}
                </ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          );
        })}
      </ScrollView>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = {
  onSetSelectedSpot: (spot) => ({type: spotReducers.SET_SELECTED_SPOT, spot: spot}),
};

export default connect(mapStateToProps, mapDispatchToProps)(AllSpots);
