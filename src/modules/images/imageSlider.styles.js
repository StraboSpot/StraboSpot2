import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 10,
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  navButtonsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-between',
    padding: 10,
    position: 'absolute',
    width: '100%',
  },
});

export default styles;
