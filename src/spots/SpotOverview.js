import React, {Component} from 'react';
import {Button, Text, View} from 'react-native';
import spotStyles from "./SpotStyles";
import SpotTag from './spot-tags/SpotTagsOverview';
import SpotNotesOverview from './spot-notes/SpotNotesOverview';
import NotebookMeasurments from './spot-measurements/SpotMeasurementsOverview';
import PhotosAndSketches from './spot-photo-and-sketches/SpotPhotosAndSketchesOverview';

const SpotOverview = props => (
  <View>
    <View style={spotStyles.sectionStyle}>
      <SpotTag
        tag={'Tags'}
        style={spotStyles.textStyle}
      >
      </SpotTag>
    </View>
    <View style={[spotStyles.sectionStyle, {borderTopWidth: 1}]}>
      <SpotNotesOverview
        notes={'Notes'}
        style={spotStyles.textStyle}
      />
    </View>
    <View style={[spotStyles.sectionStyle, {borderTopWidth: 1}]}>
      <NotebookMeasurments
        measurements={'Measurements'}
        style={spotStyles.textStyle}
      />
    </View>
    <View style={[spotStyles.sectionStyle, {borderTopWidth: 1}]}>
      <PhotosAndSketches
        photosAndSketches={'Photos and Sketches'}
        style={spotStyles.textStyle}
      />
    </View>
  </View>
);

export default SpotOverview;
