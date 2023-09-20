import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  buttonsContainer: {
    flex: 1,
    position: 'absolute',
    right: 50,
    zIndex: 1,
  },
  imageContainer: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  sliderContainer: {
    // flex: 1,
    alignItems: 'center',
    // margin: 5,
    backgroundColor: 'black',
  },
  navButtonsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    // top: '50%',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  navButtonContainer: {
    shadowColor: 'white',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
    // shadowOffset: 50,
  },
});

export default styles;
