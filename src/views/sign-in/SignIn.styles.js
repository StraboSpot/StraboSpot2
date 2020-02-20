import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  input: {
    width: 350,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: '500',
    height: 55,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    margin: 10,
    color: 'black',
    padding: 8,
    borderRadius: 14,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  signInContainer: {
    alignItems: 'center',
  },
  titleContainer: {
    paddingBottom: 75,
  },
  title: {
    fontSize: 110,
    fontFamily: 'Arial-BoldMT',
  },
  version: {
    // color: 'black',
    textAlign: 'center',
    fontSize: 32,
    fontFamily: 'ChalkboardSE-Bold',
  },
  buttonStyle: {
    borderRadius: 30,
    paddingRight: 50,
    paddingLeft: 50,
  },
  icon: {
    paddingRight: 15,
  },
});

export default styles;
