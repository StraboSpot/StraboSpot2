import {StyleSheet} from 'react-native';
import * as themes from '../../../shared/styles.constants';

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  button: {
    flexDirection: 'row',
    marginRight: 0,
    // backgroundColor: 'orange'
    // paddingLeft: 7,
    // paddingRight: 5
  },
  // textStyle: {
  //   fontSize: 22,
  //   color: '#407ad9',
  // },
  // headingText: {
  //   // alignItems: 'center',
  //   fontWeight: 'bold',
  //   fontSize: 25,
  //   // marginLeft: 20
  // },
  icons: {
    height: 50,
    width: 40,
  },
  itemContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 15,
  },
  itemTextStyle: {
    fontSize: 20,
    marginLeft: 15,
  },
  switch: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

export default styles;
