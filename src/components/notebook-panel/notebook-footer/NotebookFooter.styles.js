import {StyleSheet} from 'react-native';

const notebookFooterStyles = StyleSheet.create({
  footerContainer: {
    height: 70,
    borderTopWidth: 1,
    padding: 10,
  },
  footerIconContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  footerIcon: {
    width: 40,
    height: 40
  }
});

export default notebookFooterStyles;
