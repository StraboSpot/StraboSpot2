import {StyleSheet} from 'react-native';

import {
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
    backgroundColor: 'green',
    // justifyContent: 'center',
    // alignContent: 'center',
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
    backgroundColor: '#ccc',
    zIndex: 1,
    // top: 0,
    // right: 0,
    position: 'absolute',
  },
  twelvePointBurst30: {
    width: UPDATE_LABEL_WIDTH,
    height: UPDATE_LABEL_HEIGHT,
    position: 'absolute',
    backgroundColor: '#ccc',
    // top: 0,
    // right: 0,
    transform: [{rotate: '30deg'}],
  },
  twelvePointBurst60: {
    width: UPDATE_LABEL_WIDTH,
    height: UPDATE_LABEL_HEIGHT,
    position: 'absolute',
    backgroundColor: '#ccc',
    // top: 0,
    // right: 0,
    transform: [{rotate: '60deg'}],
  },
});

export default versionCheckStyles;
