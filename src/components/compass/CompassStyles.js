import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  buttonContainer: {
    paddingTop: 15,
    paddingBottom: 10
  },
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
    backgroundColor: themes.MODAL
  },
  compassRowContainer: {
    alignItems: 'center'
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
    height: 170,
    position: 'absolute',
    top: 50,
    resizeMode: 'contain',
  },
  toggleButtonsContainer: {
    backgroundColor: 'transparent',
    padding: 10
  },
  toggleButtonsRowContainer: {
    flex: 25,
    flexDirection: 'column',
    paddingTop: 25
  },
  trendLine: {
    height: 150,
    position: 'absolute',
    top: 60,
    resizeMode: 'contain',
  }
});

export default styles;
