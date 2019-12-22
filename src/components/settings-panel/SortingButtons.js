import React from 'react';
import {connect} from 'react-redux';

import * as SharedUI from '../../shared/ui';
import {settingPanelReducers} from '../../components/settings-panel/settingsPanel.constants';
import {SortedViews} from './settingsPanel.constants';

const SortingButtons = (props) => {
  const updateIndex = (selectedButtonIndex) => {
    props.setSelectedButtonIndex(selectedButtonIndex);
    switch (selectedButtonIndex) {
      case 0:
        console.log('Chronological Selected', props.spots);
        props.setSortedListView(SortedViews.CHRONOLOGICAL);
        break;
      case 1:
        console.log('Map Extent Selected');
        props.setSortedListView(SortedViews.MAP_EXTENT);
        break;
      case 2:
        console.log('Recent Selected');
        props.setSortedListView(SortedViews.RECENT_VIEWS);
        break;
    }
  };

  return (
    <React.Fragment>
      <SharedUI.ButtonGroup
        selectedIndex={props.selectedButtonIndex}
        buttons={['     Reverse\nChronological', 'Map Extent', 'Recent\n Views']}
        containerStyle={{height: 50}}
        buttonStyle={{padding: 5}}
        textStyle={{fontSize: 12}}
        onPress={(selected) => updateIndex(selected)}
      />
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    spots: state.spot.spots,
    selectedButtonIndex: state.settingsPanel.selectedButtonIndex,
    selectedSpot: state.spot.selectedSpot,
  };
};

const mapDispatchToProps = {
  setSortedListView: (view) => ({type: settingPanelReducers.SET_SORTED_VIEW, view: view}),
  setSelectedButtonIndex: (index) => ({type: settingPanelReducers.SET_SELECTED_BUTTON_INDEX, index: index}),
};

export default connect(mapStateToProps, mapDispatchToProps)(SortingButtons);
