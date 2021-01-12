import {StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 10,
    marginTop: 10,
  },
  divider: {
    paddingTop: 20,
  },
  textStyle: {
    fontSize: 14,
    color: '#407ad9',
  },
  headingText: {
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 20,
  },
  icons: {
    height: 50,
    width: 40,
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
  sectionsContainer: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
  },
  list: {
    borderColor: themes.PRIMARY_ITEM_TEXT_COLOR,
    paddingLeft: 5,
    paddingBottom: 10,
    paddingTop: 10,
  },
  switch: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

export default styles;
