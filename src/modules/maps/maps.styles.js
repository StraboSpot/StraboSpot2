import {StyleSheet} from 'react-native';

const circleRadius = 20;

const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: -1,
  },
  map: {
    flex: 1,
  },
  // --- MapPoint Style ---
  vertexEditPoint: {
    backgroundColor: 'orange',
    borderRadius: circleRadius,
    borderWidth: 2,
    borderColor: 'white',
    height: circleRadius,
    width: circleRadius,
    position: 'absolute',
  },
});

export default mapStyles;
