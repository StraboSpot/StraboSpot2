import {StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const notebookHeaderStyles = StyleSheet.create({
  headerImage: {
    height: 50,
    width: 50,
  },
  headerSpotName: {
    fontSize: themes.SPOT_NAME_SIZE,
    fontWeight: 'bold',
    paddingBottom: 0,
    paddingLeft: 0,
    paddingTop: 0,
  },
  headerSpotNameAndCoordsContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 5,
  },
  threeDotMenu: {
    width: 50,
  },
});

export default notebookHeaderStyles;

