import {StyleSheet} from 'react-native';
import * as themes from '../../themes/ColorThemes';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 0
  },
  compassContainer: {
    flex: 8,
    backgroundColor: 'white',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    width: '100%',
  },
  compassImageContainer: {
    alignItems: 'center',
    flex: 70,
    justifyContent: 'center',
    paddingBottom: 10
  },
  renderCompassContainer: {
    flex: 60,
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
    // flexDirection: 'row',
  },
  measurementsRowContainer: {
    // flexDirection: 'column'
  },
  sliderContainer: {
    flex: 30,
    alignItems: 'center'
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
    top: 65,
    resizeMode: 'contain',
  },
  toggleButtonsContainer: {
    backgroundColor: 'transparent',
    padding: 0
  },
  toggleButtonsRowContainer: {
    flex: 25,
    flexDirection: 'column',
    paddingTop: 25
  },
  trendLine: {
    height: 100,
    position: 'absolute',
    top: 75,
    resizeMode: 'contain',
  }
});

export default styles;
