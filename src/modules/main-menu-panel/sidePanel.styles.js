import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const sidePanelStyles = StyleSheet.create({
  infoInputText: {
    fontSize: 16,
    padding: 15,
  },
  textInputNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: themes.MEDIUMGREY,
    borderWidth: .5,
    borderRadius: 10,
    backgroundColor: 'white',
    // paddingBottom: 10,
    margin: 10,
    // paddingTop: 10,
  },
  textInputNameLabel: {
    flex: 1,
    paddingLeft: 5,
  },
  projectDescriptionListContainer: {
    borderColor: themes.PRIMARY_ITEM_TEXT_COLOR,
    backgroundColor: 'white',
    paddingLeft: 5,
    paddingBottom: 10,
    paddingTop: 10,
  },
  sectionContainer: {
    flex: 1,
    paddingTop: 20,
  },
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
  sidePanelHeaderContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    alignItems: 'flex-start',
  },
});

export default sidePanelStyles;
