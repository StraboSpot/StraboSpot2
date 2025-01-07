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
  customEndpointInput: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    fontSize: themes.SMALL_TEXT_SIZE,
    marginLeft: 10,
  },
  customEndpointInputContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 1,
    height: 55,
    marginTop: 10,
    width: '60%',
  },
  customEndpointText: {
    color: themes.WHITE,
    flexWrap: 'wrap',
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
});

export default styles;
