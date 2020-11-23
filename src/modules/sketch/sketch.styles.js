import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const sketchStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  strokeColorButton: {
    marginHorizontal: 2.5,
    marginVertical: 20,
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  strokeWidthButton: {
    marginHorizontal: 2.5,
    marginVertical: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themes.BLUE,
  },
  functionButton: {
    marginHorizontal: 2.5,
    marginVertical: 20,
    height: 30,
    width: 60,
    backgroundColor: themes.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
});

export default sketchStyles;
