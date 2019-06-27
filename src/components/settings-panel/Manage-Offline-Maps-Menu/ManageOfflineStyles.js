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
    paddingLeft: 7,
    paddingRight: 5
  },
  textStyle: {
    fontSize: 14,
    color: '#407ad9',
  },
  headingText: {
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 20
  },
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
    paddingBottom: 3,
    paddingLeft: 10
  },
  itemSubContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 3,
    paddingBottom: 7,
    paddingLeft: 20
  },
  itemTextStyle: {
    fontSize: 18,
    marginLeft: 15,
  },
  itemSubTextStyle: {
    fontSize: 14,
    marginLeft: 15,
  },
  buttonPadding: {
    paddingLeft: 10
  },
  switch: {
    flex: 1,
    alignItems: 'flex-end'
  }
});

export default styles;
