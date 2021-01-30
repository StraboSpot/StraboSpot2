import {StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 10,
    marginTop: 10,
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  itemSubContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: 10,
  },
  itemTextStyle: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
    marginLeft: 15,
  },
  itemSubTextStyle: {
    fontSize: 14,
  },
});

export default styles;
