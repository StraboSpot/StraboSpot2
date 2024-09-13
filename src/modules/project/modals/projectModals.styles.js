import {StyleSheet} from 'react-native';

import {DARKGREY} from '../../../shared/styles.constants';

const projectModalStyle = StyleSheet.create({
  gridItem: {
    width: '30%', // Width of each item (a bit less than 33.33% to leave space between)
    margin: '1.5%', // To add space between grid items
    height: 75, // Set height of each grid item
    borderColor: DARKGREY,
    // borderWidth: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTotalUploadContainer: {
    padding: 10,
  },
  imageUploadingProgressContainer: {
    padding: 10,
  },
  messageContainer: {
    padding: 10,
  },
  messageText: {
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});

export default projectModalStyle;
