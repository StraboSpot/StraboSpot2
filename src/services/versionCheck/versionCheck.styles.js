import {StyleSheet} from 'react-native';

import {GOLD, PRIMARY_HEADER_TEXT_SIZE, UPDATE_LABEL_HEIGHT, UPDATE_LABEL_WIDTH} from '../../shared/styles.constants';

const versionCheckStyles = StyleSheet.create({
  container: {
    shadowColor: 'black',
    shadowOffset: {width: 5, height: 5},
    shadowOpacity: 0.75,
    shadowRadius: 3,
    zIndex: 1,
  },
  text: {
    marginTop: 5,
    textAlign: 'center',
  },
  textContainer: {
    padding: 7,
  },
  title: {
    fontSize: PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  twelvePointBurst30: {
    backgroundColor: GOLD,
    height: UPDATE_LABEL_HEIGHT,
    position: 'absolute',
    transform: [{rotate: '30deg'}],
    width: UPDATE_LABEL_WIDTH,
  },
  twelvePointBurst60: {
    backgroundColor: GOLD,
    height: UPDATE_LABEL_HEIGHT,
    position: 'absolute',
    transform: [{rotate: '60deg'}],
    width: UPDATE_LABEL_WIDTH,
  },
  twelvePointBurstContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  twelvePointBurstMain: {
    backgroundColor: GOLD,
    height: UPDATE_LABEL_HEIGHT,
    position: 'absolute',
    width: UPDATE_LABEL_WIDTH,
    zIndex: 1,
  },
  versionText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default versionCheckStyles;
