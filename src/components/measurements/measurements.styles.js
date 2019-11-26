import {Platform, StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  measurementsRenderListContainer: {
    flexDirection: 'row',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    justifyContent: 'space-between',
    borderBottomColor: themes.LIST_BORDER_COLOR,
    borderBottomWidth: 0.5,
  },
  measurementsSectionDividerContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 20,
    paddingBottom: 9,
  },
  measurementsSectionDividerWithButtonsContainer: {
    // flex: 1,
    flexDirection: 'row',
    paddingTop: 20,
  },
  measurementsSectionDividerTextContainer: {
    justifyContent: 'center',
  },
  measurementsSectionDividerButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 10,
  },
  measurementsSectionDividerButtonText: {
    color: themes.PRIMARY_ACCENT_COLOR,
    fontSize: Platform.OS === 'ios' ? 11 : 15,
  },
  measurementsListItem: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
  },
  mainText: {
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  mainTextInverse: {
    color: themes.SECONDARY_BACKGROUND_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  propertyText: {
    paddingLeft: 20,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  propertyTextInverse: {
    paddingLeft: 20,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.PRIMARY_BACKGROUND_COLOR,
  },
  measurementsContentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  measurementDetailSwitchesContainer: {
    height: 50,
  },
  measurementDetailSwitches: {
    height: 40,
    borderRadius: 10,
    borderColor: themes.PRIMARY_ACCENT_COLOR,
  },
  measurementsOverviewContainer: {
    flex: 1,
    width: 500,
    padding: 10,
  },
  basicText: {
    paddingLeft: 10,
    fontSize: themes.SMALL_TEXT_SIZE,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
});

export default styles;
