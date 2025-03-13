import {Dimensions, StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const IGSNModalStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',

    maxHeight: Dimensions.get('window').height,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 400,
  },
  sesarAuthText: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 50,
    textAlign: 'left',
  },
  sesarImage: {
    borderWidth: 2,
    height: 100,
    width: 300,
  },
  sesarImageContainer: {
    backgroundColor: 'rgb(164, 200, 209)',
  },
  uploadContentDescription: {
    fontSize: themes.MEDIUM_TEXT_SIZE,
    margin: 30,
    textAlign: 'center',
  },
  headerText: {
    fontSize: themes.MEDIUM_TEXT_SIZE,
    fontWeight: 'bold',
    margin: 10,
  },
  uploadContentText: {
    padding: 5,
    fontWeight: 'bold',
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
  fieldValueText: {
    fontWeight: '500',
  }
});

export default IGSNModalStyles;
