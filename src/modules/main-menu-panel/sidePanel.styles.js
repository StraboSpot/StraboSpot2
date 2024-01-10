import {StyleSheet} from 'react-native';

// Constants
import * as themes from '../../shared/styles.constants';

const sidePanelStyles = StyleSheet.create({
  sidePanelContainer: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderLeftWidth: 1,
    height: '100%',
    left: -300,
    position: 'absolute',
    right: 0,
    width: 300,
    zIndex: 0,
  },
  sidePanelHeaderContainer: {
    alignItems: 'flex-start',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
});

export default sidePanelStyles;
