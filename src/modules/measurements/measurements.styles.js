import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  measurementsSectionDividerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  measurementsSectionDividerButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: -10,
  },
  measurementsSectionDividerButtonText: {
    color: themes.PRIMARY_ACCENT_COLOR,
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
  measurementsContentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  measurementDetailSwitches: {
    height: 40,
    borderRadius: 10,
    borderColor: themes.PRIMARY_ACCENT_COLOR,
  },
  basicText: {
    paddingLeft: 10,
    fontSize: themes.SMALL_TEXT_SIZE,
    color: themes.PRIMARY_TEXT_COLOR,
  },
});

export default styles;
