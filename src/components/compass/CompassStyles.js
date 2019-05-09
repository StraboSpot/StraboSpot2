import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  itemContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 15
  },
  itemTextStyle: {
    fontSize: 20,
    marginLeft: 15,
  },
  switch: {
    flex: 1,
    alignItems: 'flex-end'
  }
});

export default styles;
