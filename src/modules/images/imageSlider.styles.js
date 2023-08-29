import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    right: 0,
    left: 50,
    top: 0,
    zIndex: 1,
    bottom: 20,
    // backgroundColor: 'green',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  imageContainer: {
    flex: 1,
    // padding: 15,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // margin: 30,
    // width: '75%',
    backgroundColor: 'white',
    borderWidth: 15,
  },
});

export default styles;
