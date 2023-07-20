import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  input: {
    width: 350,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: '500',
    height: 40,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    margin: 10,
    color: 'black',
    padding: 8,
    borderRadius: 15,
  },
  signInContainer: {
    alignItems: 'center',
    // flex: 1,
  },
  version: {
    textAlign: 'center',
    fontSize: 32,
    fontFamily: 'ChalkboardSE-Bold',
  },
  buttonContainer: {
    margin: 10,
  },
  buttonsContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    borderRadius: 15,
    paddingRight: 20,
    paddingLeft: 20,
  },
  customEndpointContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
  },
  customEndpointText: {
    color: themes.WHITE,
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    marginEnd: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  verifyButtonContainer: {
    paddingLeft: 10,
  },
  verifyButtonStyle: {
    borderRadius: 15,
    // paddingRight: 20,
    // paddingLeft: 20,
  },
  verifyContainer: {
    flexDirection: 'row',
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'red',
  },
  verifyProtocolInputContainer: {
    backgroundColor: 'white',
    width: 70,
    height: 45,
    borderTopStartRadius: 15,
    borderBottomStartRadius: 15,
  },
  // verifyProtocolInput: {},
  // verifySubdirectoryInput: {},
  verifyInput: {
    fontSize: themes.SMALL_TEXT_SIZE,
    borderBottomColor: 'transparent',
  },
  verifySchemeInputContainer: {
    backgroundColor: 'white',
    width: 125,
    height: 45,
    marginRight: 3,
    marginLeft: 3,
    alignItems: 'center',
  },
  verifySubdirectoryInputContainer: {
    backgroundColor: 'white',
    width: 60,
    height: 45,
    borderTopEndRadius: 15,
    borderBottomEndRadius: 15,
  },

});

export default styles;
