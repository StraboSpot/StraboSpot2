import React from 'react';

import {ButtonGroup} from 'react-native-elements';
import {connect, useDispatch, useSelector} from 'react-redux';

import {PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import {SORTED_VIEWS} from './mainMenu.constants';
import {setSelectedButtonIndex, setSortedView} from './mainMenuPanel.slice';

const SortingButtons = (props) => {
  const dispatch = useDispatch();
  const selectedButtonIndex = useSelector(state => state.mainMenu.selectedButtonIndex);

  const updateIndex = (buttonIndex) => {
    dispatch(setSelectedButtonIndex({index: buttonIndex}));
    switch (buttonIndex) {
      case 0:
        console.log('Chronological Selected', props.spots);
        dispatch(setSortedView({view: SORTED_VIEWS.CHRONOLOGICAL}));
        break;
      case 1:
        console.log('Map Extent Selected');
        dispatch(setSortedView({view: SORTED_VIEWS.MAP_EXTENT}));
        break;
      case 2:
        console.log('Recent Selected');
        dispatch(setSortedView({view: SORTED_VIEWS.RECENT_VIEWS}));
        break;
    }
  };

  return (
    <React.Fragment>
      <ButtonGroup
        selectedIndex={selectedButtonIndex}
        buttons={['Reverse\nChronological', 'Map Extent', 'Recent\n Views']}
        containerStyle={{height: 50}}
        buttonStyle={{padding: 5}}
        selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
        textStyle={{fontSize: 12}}
        onPress={(selected) => updateIndex(selected)}
      />
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    spots: state.spot.spots,
    selectedSpot: state.spot.selectedSpot,
  };
};


export default connect(mapStateToProps)(SortingButtons);
