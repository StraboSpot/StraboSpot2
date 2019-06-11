import React, {Component} from 'react';
import {Text, View} from 'react-native';
import IconButton from '../../../shared/ui/IconButton';
import footerStyle from './NotebookFooter.styles';
import {SpotPages} from "../Notebook.constants";
import {IconButtons} from '../../../shared/app.constants';
import {connect} from "react-redux";

const NotebookFooter = props => {

  const getPageIcon = (page) => {
    switch(page) {
      case SpotPages.TAG:
        if (props.spotPageVisible === SpotPages.TAG) return require('../../../assets/icons/Tag_pressed.png');
        else return require('../../../assets/icons/Tag.png');
      case SpotPages.MEASUREMENT:
        if (props.spotPageVisible === SpotPages.MEASUREMENT || props.spotPageVisible === SpotPages.MEASUREMENTDETAIL) {
          return require('../../../assets/icons/Measurement_pressed.png');
        }
        else return require('../../../assets/icons/Measurement.png');
      case SpotPages.SAMPLE:
        if (props.spotPageVisible === SpotPages.SAMPLE) return require('../../../assets/icons/Sample_pressed.png');
        else return require('../../../assets/icons/Sample.png');
      case SpotPages.NOTE:
        if (props.spotPageVisible === SpotPages.NOTE) return require('../../../assets/icons/Note_pressed.png');
        else return require('../../../assets/icons/Note.png');
      case SpotPages.PHOTO:
        if (props.spotPageVisible === SpotPages.PHOTO) return require('../../../assets/icons/Photo_pressed.png');
        else return require('../../../assets/icons/Photo.png');
      case SpotPages.SKETCH:
        if (props.spotPageVisible === SpotPages.SKETCH) return require('../../../assets/icons/Sketch_pressed.png');
        else return require('../../../assets/icons/Sketch.png');
    }
  };

  return (
    <View style={footerStyle.footerIconContainer}>
      <IconButton
        source={getPageIcon(SpotPages.TAG)}
        style={footerStyle.footerIcon}
      />
      <IconButton
        source={getPageIcon(SpotPages.MEASUREMENT)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(SpotPages.MEASUREMENT)}
      />
      <IconButton
        source={getPageIcon(SpotPages.SAMPLE)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(SpotPages.SAMPLE)}
      />
      <IconButton
        source={getPageIcon(SpotPages.NOTE)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(SpotPages.NOTE)}

      />
      <IconButton
        source={getPageIcon(SpotPages.PHOTO)}
        style={footerStyle.footerIcon}
        onPress={() => props.onPress(IconButtons.CAMERA)}
      />
      <IconButton
        source={getPageIcon(SpotPages.SKETCH)}
        style={footerStyle.footerIcon}
      />
    </View>
  );
};


function mapStateToProps(state) {
  return {
    spotPageVisible: state.notebook.visiblePage
  }
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookFooter);
