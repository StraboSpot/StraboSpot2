import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  buttonContainer: {
    margin: 10,
  },
  buttonStyle: {
    borderRadius: 15,
    height: 48,
    paddingLeft: 20,
    paddingRight: 20,

  },
  buttonsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 20,
  },
  customEndpointContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customEndpointText: {
    color: themes.WHITE,
    fontSize: themes.MEDIUM_TEXT_SIZE,
    fontWeight: 'bold',
    marginEnd: 30,
    textAlign: 'center',
  },
  errorText: {
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
  input: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderRadius: 15,
    color: 'black',
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: '500',
    height: 48,
    margin: 10,
    padding: 8,
    width: 350,
  },
  signInContainer: {
    alignItems: 'center',
  },
  verifyButtonContainer: {
    paddingLeft: 10,
  },
  verifyContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: 300,
  },
  verifyEndpointIconText: {
    color: 'white',
  },
  verifyInput: {
    borderBottomColor: 'transparent',
    fontSize: themes.SMALL_TEXT_SIZE,
  },
  verifyProtocolInputContainer: {
    backgroundColor: 'white',
    borderBottomStartRadius: 15,
    borderTopStartRadius: 15,
    height: 45,
    width: 70,
  },
  verifySchemeInputContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    height: 45,
    marginLeft: 3,
    marginRight: 3,
    width: 125,
  },
  verifySubdirectoryInputContainer: {
    backgroundColor: 'white',
    borderBottomEndRadius: 15,
    borderTopEndRadius: 15,
    height: 45,
    width: 60,
  },
  version: {
    fontFamily: 'ChalkboardSE-Bold',
    fontSize: 32,
    textAlign: 'center',
  },

});

export default styles;
