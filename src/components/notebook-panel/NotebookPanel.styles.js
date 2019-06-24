import {StyleSheet} from 'react-native';
import * as themes from '../../themes/ColorThemes';

const notebookStyles = StyleSheet.create({
  panel: {
    flex: 1,
    width: 400,
    height: '100%',
    borderBottomLeftRadius: 30,
    borderTopLeftRadius: 30,
    backgroundColor: themes.LIGHTGREY,
    position: 'absolute', //Here is the trick
    right: 0,
    zIndex: 1,
  },
  headerContainer: {
    borderBottomWidth: 1,
    height: 90,
    padding: 10,
    backgroundColor: themes.LIGHTGREY
  },
  centerContainer: {
    flex: 1,
  },
  footerContainer: {
    height: 60,
    borderTopWidth: 1,
    padding: 10,
    borderBottomLeftRadius: 30,
    backgroundColor: themes.LIGHTGREY
  },
  noSpotContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  collapsibleSectionHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 15,
    paddingLeft: 10,
    paddingRight: 10,
    lineHeight: 30,
    backgroundColor: themes.LIGHTGREY
  },
  collapsibleSectionHeaderText: {
    fontSize: 16,
    lineHeight: 30,
    textTransform: 'uppercase',
    color: themes.DARKGREY
  }
});

export default notebookStyles;
