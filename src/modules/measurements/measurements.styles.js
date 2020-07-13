import {Platform, StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
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
