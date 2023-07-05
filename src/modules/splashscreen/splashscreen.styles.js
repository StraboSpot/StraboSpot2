import {Dimensions, Platform, StyleSheet} from 'react-native';

const platform = Platform.OS === 'ios' ? 'screen' : 'window';
const windowWidth = Dimensions.get(platform).width;
const windowHeight = Dimensions.get(platform).height;
console.log('width', windowWidth);
console.log('height', windowHeight);
const splashscreenStyles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  contentContainer: {
    position: 'absolute',
    top: 175,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'black',
    textShadowColor: 'white',
    textShadowRadius: 10,
  },
  titleContainer: {
    marginTop: 20,
    paddingBottom: 10,
  },
  wifiIndicatorContainer: {
    alignItems: 'flex-end',
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default splashscreenStyles;
