import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  subcontainer: {
    width: '30%',
    height:'100%',
    borderBottomLeftRadius:30,
    borderTopLeftRadius: 30,
    backgroundColor: '#EE5407',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 0, //Here is the trick
    right: 0,
    zIndex: 1,
  },
  textStyle: {
    fontSize: 22,
    color: '#fff'
  },
});

export default styles;
