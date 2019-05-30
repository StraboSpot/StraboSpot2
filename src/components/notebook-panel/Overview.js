import React, {useState, Component} from 'react';
import {Text, ScrollView, TouchableOpacity, View} from 'react-native';
import spotStyles from "./SpotStyles";
import SpotTag from './notebook-tags/SpotTagsOverview';
import SpotNotesOverview from './SpotNotesOverview';
import NotebookMeasurments from './notebook-measurements/SpotMeasurementsOverview';
import PhotosAndSketches from './notebook-photo-and-sketches/SpotPhotosAndSketchesOverview';
import Collapsible from 'react-native-collapsible';
import {Icon} from 'react-native-elements';
import spotPageStyles from './SpotPageStyles';

const SECTIONS = [
  {
    title: 'Tags',
    content: <SpotTag/>
  }, {
    title: 'Notes',
    content: <SpotNotesOverview/>
  }, {
    title: 'Measurements',
    content: <NotebookMeasurments/>
  }, {
    title: 'Photos and Sketches',
    content: <PhotosAndSketches/>
  }];

const Overview = props => {
  const expandedIcon = <Icon
    name='ios-add'
    type='ionicon'
    color='#b2b2b7'
    containerStyle={{paddingRight: 10}}/>;

  const collapseIcon = <Icon
    name='ios-remove'
    type='ionicon'
    color='#b2b2b7'
    containerStyle={{paddingRight: 10}}/>;

  const [collapsedSections, setCollapsedSections] = useState([]);

  const toggleCollapsed = (name) => {
    if (collapsedSections.includes(name)) setCollapsedSections(collapsedSections.filter((val) => val !== name));
    else setCollapsedSections(collapsedSections.concat(name));
  };

  return (
    <ScrollView style={spotStyles.container}>
      {SECTIONS.map((section, index) => {
        return (
          <View>
            <TouchableOpacity onPress={() => toggleCollapsed(section.title)}>
              <View style={spotStyles.header}>
                {collapsedSections.includes(section.title) ? expandedIcon : collapseIcon}
                <Text style={spotPageStyles.spotDividerText}>{section.title}</Text>
              </View>
            </TouchableOpacity>
            <Collapsible collapsed={collapsedSections.includes(section.title)} align="center">
              <View style={spotStyles.content}>
                {section.content}
              </View>
            </Collapsible>
          </View>
        )
      })}
    </ScrollView>
  );
};

export default Overview;