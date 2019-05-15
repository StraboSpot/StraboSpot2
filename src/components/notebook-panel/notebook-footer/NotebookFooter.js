import React, {Component} from 'react';
import {Text, View} from 'react-native';
import IconButton from '../../../ui/IconButton';
import footerStyle from './NotebookFooter.styles';
import {SpotPages} from "../Notebook.constants";
import {IconButtons} from '../../../shared/app.constants';

const NotebookFooter = props => (
    <View style={footerStyle.footerIconContainer}>
      <IconButton
        source={require('../../../assets/icons/Tag.png')}
        style={footerStyle.footerIcon}
      />
      <IconButton
        source={require('../../../assets/icons/Measurement.png')}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(SpotPages.MEASUREMENT)}
      />
      <IconButton
        source={require('../../../assets/icons/Sample.png')}
        style={footerStyle.footerIcon}
      />
      <IconButton
        source={require('../../../assets/icons/Note.png')}
        style={footerStyle.footerIcon}
      />
      <IconButton
        source={require('../../../assets/icons/Photo.png')}
        style={footerStyle.footerIcon}
        onPress={() => props.onPress(IconButtons.CAMERA)}
      />
      <IconButton
        source={require('../../../assets/icons/Sketch.png')}
        style={footerStyle.footerIcon}
      />
    </View>
);

export default NotebookFooter;
