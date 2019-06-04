import React, {useState, Component} from 'react';
import {Text, ScrollView, TouchableOpacity, View} from 'react-native';

import TagsOverview from './notebook-tags/TagsOverview';
import NotesOverview from './notebook-notes/NotesOverview';
import MeasurementsOverview from './notebook-measurements/MeasurementsOverview';
import PhotosAndSketches from './notebook-photo-and-sketches/SpotPhotosAndSketchesOverview';
import Collapsible from 'react-native-collapsible';
import {Icon} from 'react-native-elements';

// Styles
import notebookStyles from "./NotebookPanel.styles";

const SECTIONS = [
  {
    title: 'Tags',
    content: <TagsOverview/>
  }, {
    title: 'Notes',
    content: <NotesOverview/>
  }, {
    title: 'Measurements',
    content: <MeasurementsOverview/>
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
    <ScrollView>
      {SECTIONS.map((section, index) => {
        return (
          <View key={section.title}>
            <TouchableOpacity onPress={() => toggleCollapsed(section.title)}>
              <View style={notebookStyles.collapsibleSectionHeaderContainer}>
                {collapsedSections.includes(section.title) ? expandedIcon : collapseIcon}
                <Text style={notebookStyles.collapsibleSectionHeaderText}>{section.title}</Text>
              </View>
            </TouchableOpacity>
            <Collapsible collapsed={collapsedSections.includes(section.title)} align="center">
              <View>
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
