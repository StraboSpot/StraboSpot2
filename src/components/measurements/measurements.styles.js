import {StyleSheet} from 'react-native';
import * as themes from '../../themes/ColorThemes';

const styles = StyleSheet.create({
  measurementsRenderListContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    borderBottomColor: themes.MEDIUMGREY,
    borderBottomWidth: .5
  },
  measurementsSectionDividerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: themes.LIGHTGREY,
    paddingTop: 45
  },
  measurementsSectionDividerButtonContainer: {
    // height: 35,
    justifyContent: 'space-between',
  },
  measurementsListItem: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
    alignItems: 'center'
  },
  mainText: {
    color: 'black',
    fontSize: 18
  },
  propertyText: {
    paddingLeft: 20,
    fontSize: 18,
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
