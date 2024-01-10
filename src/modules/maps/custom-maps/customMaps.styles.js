import {StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const styles = StyleSheet.create({
  itemContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  itemSubContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 7,
    paddingLeft: 10,
    paddingTop: 3,
    width: '90%',
  },
  itemSubTextStyle: {
    fontSize: 14,
    marginLeft: 10,
  },
  itemTextStyle: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
    marginLeft: 10,
  },
  mapTypeInfoContainer: {
    alignItems: 'center',
    padding: 10,
  },
  mapTypeInfoText: {
    lineHeight: 20,
    textAlign: 'center',
  },
  requiredMessage: {
    color: themes.RED,
    fontSize: themes.SMALL_TEXT_SIZE,
    margin: 5,
  },
});

export default styles;
