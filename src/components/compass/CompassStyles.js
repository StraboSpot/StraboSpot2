import {StyleSheet} from 'react-native';
import * as themes from '../../themes/ColorThemes';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 0
  },
  compassContainer: {
    alignItems: 'center',
    flex: 70,
    justifyContent: 'center',
    // paddingTop: 70
  },
  renderCompassContainer: {
    flex: 70,
    backgroundColor: themes.COMPASS_MODAL
  },
  compassRowContainer: {
    alignItems: 'center'
  },
  gridContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    height: 300,
    flexDirection: 'column'
  },
  itemContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 15
  },
  itemTextStyle: {
    fontSize: 14,
    marginLeft: 10,
  },
  measurementsContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  measurementsRowContainer: {
    flexDirection: 'column'
  },
  switchContainer: {
    flex: 1,
    alignItems: 'flex-end'
  },
  switch: {
    justifyContent: 'flex-end'
  },
  strikeAndDipLine: {
    zIndex: 10,
    height: 120,
    position: 'absolute',
    top: 39.5,
    // justifyContent: 'center',
    // alignItems: 'center',
    resizeMode: 'contain',
    // transform: [{rotate: '90deg'}]
  },
  toggleButtonsContainer: {
    backgroundColor: 'transparent',
    padding: 0
  },
  toggleButtonsRowContainer: {
    flex:25,
    flexDirection: 'column',
    paddingTop: 25
  },
  trendLine: {
    height: 100,
    position: 'absolute',
    top: 50,
    // justifyContent: 'center',
    // alignItems: 'center',
    resizeMode: 'contain',
    // transform: [{rotate: '90deg'}]
  }
});

export default styles;
