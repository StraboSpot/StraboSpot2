import {Dimensions, Platform, StyleSheet} from 'react-native';

// Constants
import * as themes from '../../shared/styles.constants';

const screen = Platform.OS === 'ios' ? 'window' : 'screen';
const dimensions = Dimensions.get(screen);
console.log('DIMENSIONS', dimensions);
const sidePanelStyles = StyleSheet.create({
  sidePanelContainer: {
    // flex: 1,
    // ...Platform.select({
    //   default: {
    //     backgroundColor: 'blue',
    //   },
    //   ios: {
    //     backgroundColor: 'green',
    //     // height: dimensions.height,
    //   },
    // }),
    height: dimensions.height,
    // height: 300,
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
    flexDirection: 'row',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    // justifyContent: 'center',
    height: 70,

  },
  sidePanelButtonContainer: {
    // flex: 1,
    justifyContent: 'center',
    // alignItems: 'flex-start',
  },
  sidePanelBackText: {
    fontSize: themes.SMALL_TEXT_SIZE,
  },
});

export default sidePanelStyles;
