import {StyleSheet} from 'react-native';
import * as themes from '../../../themes/ColorThemes';

const styles = StyleSheet.create({
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
  measurementDetailSwitchesContainer: {
    height: 50
  },
  measurementDetailSwitches: {
    height: 40,
    borderRadius: 10,
    borderColor: themes.BLUE
  },
  measurementsOverviewContainer: {
    flex: 1,
    width: 500,
    padding: 10
  }
});

export default styles;
