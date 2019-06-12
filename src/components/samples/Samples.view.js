import React from 'react';
import {Text, View} from 'react-native';
import NotebookBackButton from '../../shared/ui/NotebookBackButton';
import {SpotPages} from "../notebook-panel/Notebook.constants";
import * as actionCreators from "../../store/actions";
import {connect} from "react-redux";

const samplesView = (props) => {
  return (
    <React.Fragment>
      <NotebookBackButton
        onPress={() => {
          const pageVisible = props.setPageVisible(SpotPages.OVERVIEW);
          if (pageVisible.page !== SpotPages.SAMPLE) {
            props.showModal('isSamplesModalVisible', false);
          }
        }}
      />
      <Text style={{justifyContent: 'center', alignContent: 'center'}}>SAMPLES PAGE</Text>
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.home.selectedSpot
  }
}

const mapDispatchToProps = {
  setPageVisible: (page) => (actionCreators.setSpotPageVisible(page))
};

export default connect(mapStateToProps, mapDispatchToProps)(samplesView);

