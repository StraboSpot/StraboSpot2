import {StyleSheet} from 'react-native';
import * as themes from '../../../shared/styles.constants';

const notebookHeaderStyles = StyleSheet.create({
  headerContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerImage: {
    resizeMode: 'contain',
    width: 50,
    height: 50,
  },
  headerSpotName: {
    fontSize: themes.SPOT_NAME_SIZE,
    fontWeight: 'bold',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
  headerSpotNameAndCoordsContainer: {
    paddingLeft: 5,
    flex: 1,
    flexDirection: 'column',
  },
  threeDotMenu: {
    width: 25,
    height: 25,
  },
});

export default notebookHeaderStyles;

