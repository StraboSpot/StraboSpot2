import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  measurementsRenderListContainer: {
    flexDirection: 'row',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    justifyContent: 'space-between',
    borderBottomColor: themes.LIST_BORDER_COLOR,
    borderBottomWidth: .5
  },
  measurementsSectionDividerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    alignItems: 'center'
  },
  mainText: {
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE
  },
  propertyText: {
    paddingLeft: 20,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  measurementsContentContainer: {
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
    borderColor: themes.PRIMARY_ACCENT_COLOR
  },
  measurementsOverviewContainer: {
    flex: 1,
    width: 500,
    padding: 10
  }
});

export default styles;
