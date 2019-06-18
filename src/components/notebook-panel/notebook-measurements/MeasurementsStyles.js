import {StyleSheet} from 'react-native';
import * as themes from '../../../themes/ColorThemes';

const styles = StyleSheet.create({
  measurementsSectionDividerContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: themes.LIGHTGREY
  },
  measurementsSectionDividerButtonContainer: {
    height: 30,
    justifyContent: 'center'
  },
  measurementsListItem: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
    borderBottomColor: themes.MEDIUMGREY,
    borderBottomWidth: .5,
    alignItems: 'center'
  },
  mainText: {
    color: 'black',
    fontSize: 25
  },
  propertyText: {
    paddingLeft: 20,
    fontSize: 25,
    color: themes.MEDIUMGREY,
  },
  horizontalLine: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    width: '100%'
  },
  measurementDetailContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
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
