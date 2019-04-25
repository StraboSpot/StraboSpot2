import React, {useState} from 'react'
import {Text, View} from 'react-native'
import {connect} from 'react-redux';
import styles from "./NotebookPanel.styles";
import NotebookHeader from './NotebookHeader';
import NotebookFooter from './NotebookFooter';
import SpotOverview from '../../spots/SpotOverview';
import ButtonNoBackground from '../../ui/ButtonNoBackround';
import SpotPage from '../../spots/spot-page/SpotPage';
import {SPOTPAGE_VISIBLE} from "../../store/Constants";

const NotebookPanel = props => {

  // const [isSpotPageVisible, setIsSpotPageVisible] = useState(false);
  // console.log(isSpotPageVisible)
  if (props.spotName) {

    const spotsPageOpen = () => {
      props.isSpotPageVisible(true)
    };

    return (
      <View style={styles.container}>
        <NotebookHeader
          spot={props.spotName.props.name}
          spotCoords={props.spotCoords}
          onPress={props.onPress}
          spotPageOpen={() => spotsPageOpen()}
        />
        <View style={styles.subContainer}>
          {props.spotPageVisible ? <SpotPage/> : <SpotOverview/>}
        </View>
        <NotebookFooter/>
      </View>
    )
  }
  else {
    return (
      <View style={[styles.container, {flex: 1, justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{fontSize: 30}}>No Spot Selected</Text>
        <ButtonNoBackground
          style={{ marginTop: 40}}
          textStyle={{color: 'blue'}}
          onPress={props.closeNotebook}>Close Notebook</ButtonNoBackground>
      </View>
    )
  }
};

function mapStateToProps(state) {
  return {
    selectedSpot: state.home.selectedSpot,
    featuresSelected: state.home.featuresSelected,
    spotPageVisible: state.home.isSpotPageVisible
  }
}

const mapDispatchToProps = {
  isSpotPageVisible: (visible) => ({type: SPOTPAGE_VISIBLE, visible: visible})
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookPanel);
