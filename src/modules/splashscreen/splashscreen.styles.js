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
    paddingTop: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'black',
    textShadowColor: 'white',
    textShadowRadius: 10,
  },
  titleContainer: {
    paddingTop: 20,
    alignItems: 'center',
  },
  versionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionNumber: {
    textAlign: 'right',
    fontSize: 25,
    color: 'black',
    textShadowColor: 'white',
    textShadowRadius: 10, fontFamily: 'ChalkboardSE-Bold',
    // marginBottom: 10,
    marginRight: 10,
  },
  wifiIndicatorContainer: {
    alignItems: 'flex-end',
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default splashscreenStyles;
