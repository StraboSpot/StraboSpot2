import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'absolute',
    width: '100%',
    zIndex: 1,
    paddingRight: 10,
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
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    padding: 10,
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
