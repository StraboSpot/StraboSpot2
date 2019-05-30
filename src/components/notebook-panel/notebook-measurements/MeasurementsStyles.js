import {StyleSheet} from 'react-native';
import * as themes from '../../../themes/ColorThemes';

const styles = StyleSheet.create({
  compassContainer: {
    flex: 6,
    backgroundColor: 'white',
    //position: 'absolute',
    //top: 50
    width: '100%',
    // height: 200,
    // marginBottom: 25
  },
  backButton: {
    marginTop: 10,
    alignItems: 'flex-start'
  },
  measurementsListItem: {
    flex: 1,
    flexDirection: 'row',
  },
  textBubble: {
    borderRadius: 10,
    borderWidth: 3,
    padding: 4,
    margin: 4
  },
  mainText: {
    borderColor: 'darkgray',
    backgroundColor: 'darkgray',
  },
  propertyText: {
    borderColor: 'white',
    backgroundColor: 'white'
  },
  horizontalLine: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    width: '100%'
  },
  measurementDetailContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: 10
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 10
  },
  measurementDetailSwitchesContainer: {
    backgroundColor: themes.WHITE,
    height: 50
  },
  measurementDetailSwitches: {
    height: 40,
    borderRadius: 10,
    borderColor: themes.BLUE
  },
  modalTop: {
    zIndex: 100,
    width: '100%',
    flex: 1,
    backgroundColor: themes.COMPASS_MODAL,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20
  },
  modalBottom: {
    flex: 1,
    // backgroundColor: themes.COMPASS_MODAL,
    width: '100%',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20
  },
  modalContainer: {
    // flex: 1,
    // position: 'absolute',
    // bottom: 75,
    // left: 150,
    // width: 400,
    // height: 400,
    // backgroundColor: 'transparent',
    flex: 1,
    width: '100%',
    height: 300,
    borderBottomLeftRadius: 30,
    borderTopLeftRadius: 30,
    backgroundColor: themes.LIGHTGREY,
    position: 'absolute', //Here is the trick
    right: 10,
    zIndex: 1,
  },
});

export default styles;
