import {StyleSheet} from 'react-native';
import * as themes from '../../../shared/styles.constants';

const notebookHeaderStyles = StyleSheet.create({
  headerContentContainer: {
    flex: 15,
    flexDirection: 'row',
  },
  headerButtons: {
    paddingTop: 20,
  },
  headerCoords: {
    color: themes.PRIMARY_ACCENT_COLOR,
    fontSize: 16,
  },
  headerImage: {
    resizeMode: 'contain',
  },
  headerSpotName: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  headerSpotNameAndCoordsContainer: {
    paddingLeft: 10,
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'column',
  },
  threeDotMenu: {
    width: 25,
    height: 25,
  },
});

export default notebookHeaderStyles;

