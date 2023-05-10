import {StyleSheet} from 'react-native';

// Constants
import * as themes from '../../shared/styles.constants';

const sidePanelStyles = StyleSheet.create({
  sidePanelContainer: {
    height: '100%',
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderLeftWidth: 1,
    width: 300,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
  },
  sidePanelContainerPhones: {
    height: '100%',
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderLeftWidth: 1,
    width: 300,
    position: 'absolute',
    left: -300,
    right: 0,
    zIndex: 0,
  },
  sidePanelHeaderContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    height: 70,
  },
  sidePanelButtonContainer: {
    alignSelf: 'flex-start'
  },
  sidePanelBackText: {
    fontSize: themes.SMALL_TEXT_SIZE
  }
});

export default sidePanelStyles;
