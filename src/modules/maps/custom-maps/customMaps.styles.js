import {StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const styles = StyleSheet.create({
  itemContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemSubContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 3,
    paddingBottom: 7,
    paddingLeft: 10,
  },
  itemTextStyle: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
    marginLeft: 10,
  },
  itemSubTextStyle: {
    fontSize: 14,
    marginLeft: 10,
  },
});

export default styles;
