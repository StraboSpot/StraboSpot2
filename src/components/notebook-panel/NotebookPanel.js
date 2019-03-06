import React, {Component} from 'react'
import {View} from 'react-native'
import styles from "./NotebookPanel.styles";
import NotebookHeader from './NotebookHeader';
import NotebookFooter from './NotebookFooter';
import NotebookTag from './NotebookTags';
import NotebookNotes from './NotebookNotes';
import NotebookMeasurments from './NotebookMeasurements';
import PhotosAndSketches from './NotebookPhotosAndSketches';

const NotebookPanel = props => (
  <View style={styles.container}>
    <NotebookHeader
      spot={'Pilbara2018-Spot207'}
      spotCoords={'119.734222° East, -20.992911° North'}
      close={props.close}
    />
    <View style={styles.subContainer}>
      <View style={styles.sectionStyle}>
        <NotebookTag
          tag={'Tags'}
          style={styles.textStyle}
        >
        </NotebookTag>
      </View>
      <View style={styles.sectionStyle}>
        <NotebookNotes
          notes={'Notes'}
          style={styles.textStyle}
        />
      </View>
      <View style={styles.sectionStyle}>
        <NotebookMeasurments
          measurements={'Measurements'}
          style={styles.textStyle}
        />
      </View>
      <View style={styles.sectionStyle}>
        <PhotosAndSketches
          photosAndSketches={'Photos and Sketches'}
          style={styles.textStyle}
        />
      </View>
    </View>
      <NotebookFooter/>
  </View>
);

export default NotebookPanel;


