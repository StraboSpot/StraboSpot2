import {StyleSheet} from 'react-native';

import ui from '../../../shared/ui/ui.styles';

const buttonStyles = StyleSheet.create({
  backButton: {
    alignItems: 'flex-start',
    marginTop: 10,
  },
  buttonText: ui.buttonText,
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
  },
  navButtonsContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default buttonStyles;
