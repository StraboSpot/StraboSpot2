import React from 'react';
import {View} from 'react-native';

import {withNavigation} from 'react-navigation';
import {connect, useSelector} from 'react-redux';

import {IconButtons} from '../../../shared/app.constants';
import {isEmpty} from '../../../shared/Helpers';
import IconButton from '../../../shared/ui/IconButton';
import {NotebookPages} from '../notebook.constants';
import footerStyle from './notebookFooter.styles';

const NotebookFooter = props => {

  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const getPageIcon = (page) => {
    switch (page) {
      case NotebookPages.TAG:
        if (props.notebookPageVisible === NotebookPages.TAG) return require('../../../assets/icons/Tag_pressed.png');
        else return require('../../../assets/icons/Tag.png');
      case NotebookPages.MEASUREMENT:
        if (props.notebookPageVisible === NotebookPages.MEASUREMENT
          || props.notebookPageVisible === NotebookPages.MEASUREMENTDETAIL) {
          return require('../../../assets/icons/Measurement_pressed.png');
        }
        else return require('../../../assets/icons/Measurement.png');
      case NotebookPages.SAMPLE:
        if (props.notebookPageVisible === NotebookPages.SAMPLE) {
          return require('../../../assets/icons/Sample_pressed.png');
        }
        else return require('../../../assets/icons/Sample.png');
      case NotebookPages.NOTE:
        if (props.notebookPageVisible === NotebookPages.NOTE) return require('../../../assets/icons/Note_pressed.png');
        else return require('../../../assets/icons/Note.png');
      case NotebookPages.PHOTO:
        if (props.notebookPageVisible === NotebookPages.PHOTO) {
          return require('../../../assets/icons/Photo_pressed.png');
        }
        else return require('../../../assets/icons/Photo.png');
      case NotebookPages.SKETCH:
        if (props.notebookPageVisible === NotebookPages.SKETCH) {
          return require('../../../assets/icons/Sketch_pressed.png');
        }
        else return require('../../../assets/icons/Sketch.png');
    }
  };

  return (
    <View style={footerStyle.footerIconContainer}>
      <IconButton
        source={getPageIcon(NotebookPages.TAG)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(NotebookPages.TAG)}

      />
      <IconButton
        source={getPageIcon(NotebookPages.MEASUREMENT)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(NotebookPages.MEASUREMENT)}
      />
      <IconButton
        source={getPageIcon(NotebookPages.SAMPLE)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(NotebookPages.SAMPLE)}
      />
      <IconButton
        source={getPageIcon(NotebookPages.NOTE)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(NotebookPages.NOTE)}

      />
      <IconButton
        source={getPageIcon(NotebookPages.PHOTO)}
        style={footerStyle.footerIcon}
        onPress={() => props.onPress(IconButtons.CAMERA)}
      />
      <IconButton
        source={getPageIcon(NotebookPages.SKETCH)}
        style={footerStyle.footerIcon}
        onPress={() => props.navigation.navigate('Sketch', {selectedSpot: selectedSpot})}
      />
    </View>
  );
};

function mapStateToProps(state) {
  return {
    notebookPageVisible: isEmpty(state.notebook.visibleNotebookPagesStack)
      ? null
      : state.notebook.visibleNotebookPagesStack.slice(-1)[0],
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(NotebookFooter));
