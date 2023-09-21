import {StyleSheet} from 'react-native';

import {
  GOLD,
  PRIMARY_HEADER_TEXT_SIZE,
  UPDATE_LABEL_HEIGHT,
  UPDATE_LABEL_WIDTH,
} from '../../shared/styles.constants';

const versionCheckStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 175,
    right: 200,
    zIndex: 1,
    shadowColor: 'black',
    shadowOffset: {width: 5, height: 5},
    shadowOpacity: 0.75,
    shadowRadius: 3,
  },
  title: {
    fontWeight: 'bold',
    fontSize: PRIMARY_HEADER_TEXT_SIZE,
    marginBottom: 5,
    textAlign: 'center',
  },
  textContainer: {
    padding: 7,
  },
  twelvePointBurstContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    marginTop: 5,
  },
  versionText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  twelvePointBurstMain: {
    width: UPDATE_LABEL_WIDTH,
    height: UPDATE_LABEL_HEIGHT,
    backgroundColor: GOLD,
    zIndex: 1,
    position: 'absolute',
  },
  twelvePointBurst30: {
    width: UPDATE_LABEL_WIDTH,
    height: UPDATE_LABEL_HEIGHT,
    position: 'absolute',
    backgroundColor: GOLD,
    transform: [{rotate: '30deg'}],
  },
  twelvePointBurst60: {
    width: UPDATE_LABEL_WIDTH,
    height: UPDATE_LABEL_HEIGHT,
    position: 'absolute',
    backgroundColor: GOLD,
    transform: [{rotate: '60deg'}],
  },
});

export default versionCheckStyles;
