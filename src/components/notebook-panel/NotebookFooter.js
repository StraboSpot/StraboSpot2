import React, {Component} from 'react';
import {Text, View} from 'react-native';
import IconButton from '../../ui/IconButton';
import styles from "./NotebookPanel.styles";
import {SpotPages} from "./Notebook.constants";

const NotebookFooter = props => (
  <View style={styles.footerContainer}>
    <View style={styles.footerIconContainer}>
      <IconButton
        source={require('../../assets/icons/Tag.png')}
        style={styles.footerIcon}
      />
    <IconButton
        source={require('../../assets/icons/Measurement.png')}
        style={styles.footerIcon}
        onPress={() => props.onPress(SpotPages.MEASUREMENT)}
      />
      <IconButton
        source={require('../../assets/icons/Sample.png')}
        style={styles.footerIcon}
      />
      <IconButton
        source={require('../../assets/icons/Note.png')}
        style={styles.footerIcon}
      />
      <IconButton
        source={require('../../assets/icons/Photo.png')}
        style={styles.footerIcon}
      />
      <IconButton
        source={require('../../assets/icons/Sketch.png')}
        style={styles.footerIcon}
      />
    </View>

  </View>
);

export default NotebookFooter;
