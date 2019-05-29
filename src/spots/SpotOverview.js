import React, {useState, Component} from 'react';
import {Text, ScrollView, TouchableOpacity, View} from 'react-native';
import spotStyles from "./SpotStyles";
import SpotTag from './spot-tags/SpotTagsOverview';
import SpotNotesOverview from './spot-notes/SpotNotesOverview';
import NotebookMeasurments from './spot-measurements/SpotMeasurementsOverview';
import PhotosAndSketches from './spot-photo-and-sketches/SpotPhotosAndSketchesOverview';
import Collapsible from 'react-native-collapsible';
import {Icon} from 'react-native-elements'

const SECTIONS = [
  {
    title: 'Tags',
    content: <SpotTag/>
  },
  {
    title: 'Notes',
    content: <SpotNotesOverview/>
  },
  {
    title: 'Measurements',
    content: <NotebookMeasurments/>
  },
  {
    title: 'Photos and Sketches',
    content: <PhotosAndSketches/>
  },
];

const SpotOverview = props => {
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

  // const [collapsedTag, setCollapsedTag] = useState(false);
  // const [collapsedNotes, setCollapsedNotes] = useState(false);
  // const [collapsedMeasurements, setCollapsedMeasurements] = useState(false);
  // const [collapsedPhotos, setCollapsedPhotos] = useState(false);
  // const [isExpanded, setIsExpanded] = useState(minimizedIcon);
  const [collapsedSections, setCollapsedSections] = useState([]);

  // useEffect(() => console.log('Collapsed', collapsedSections))

  const toggleCollapsed = (name) => {
    if (collapsedSections.includes(name)) {
      setCollapsedSections(collapsedSections.filter((val) => val !== name))
    }
    else setCollapsedSections(collapsedSections.concat(name));
    // switch (name) {
    //   case ('tags'):
    //     setCollapsedTag(!collapsedTag);
    //     setIsExpanded(!isExpanded);
    //     break;
    //   case ('notes'):
    //     setCollapsedNotes(!collapsedNotes);
    //     setIsExpanded(!isExpanded);
    //     break;
    //   case ('measurements'):
    //     setCollapsedMeasurements(!collapsedMeasurements);
    //     setIsExpanded(!isExpanded);
    //     break;
    //   case ('photos'):
    //     setCollapsedPhotos(!collapsedPhotos);
    //     setIsExpanded(!isExpanded);
    //     break;
    // }
  };

  const isSectionCollapsed = (name) => {
    return collapsedSections.includes(name)
  };

  return (
    <ScrollView style={spotStyles.container}>
      <TouchableOpacity onPress={() => toggleCollapsed('tags')}>
        <View style={spotStyles.header}>
          {collapsedSections.includes('tags') ?  collapseIcon : expandedIcon}
          <Text style={spotStyles.headerText}>{SECTIONS[0].title}</Text>
        </View>
      </TouchableOpacity>
      <Collapsible collapsed={isSectionCollapsed('tags')} align="center">
        <View style={spotStyles.content}>
          {SECTIONS[0].content}
        </View>
      </Collapsible>
      <TouchableOpacity onPress={() => toggleCollapsed('notes')}>
        <View style={spotStyles.header}>
          {collapsedSections.includes('notes') ?  collapseIcon : expandedIcon}
          <Text style={spotStyles.headerText}>{SECTIONS[1].title}</Text>
        </View>
      </TouchableOpacity>
      <Collapsible collapsed={isSectionCollapsed('notes')} align="center">
        <View style={spotStyles.content}>
          {SECTIONS[1].content}
        </View>
      </Collapsible>
      <TouchableOpacity onPress={() => toggleCollapsed('measurements')}>
        <View style={spotStyles.header}>
          {collapsedSections.includes('measurements') ?  collapseIcon : expandedIcon}
          <Text style={spotStyles.headerText}>{SECTIONS[2].title}</Text>
        </View>
      </TouchableOpacity>
      <Collapsible collapsed={isSectionCollapsed('measurements')} align="center">
        <View style={spotStyles.content}>
          {SECTIONS[2].content}
        </View>
      </Collapsible>
      <TouchableOpacity onPress={() => toggleCollapsed('photos')}>
        <View style={spotStyles.header}>
          {collapsedSections.includes('photos') ?  collapseIcon : expandedIcon}
          <Text style={spotStyles.headerText}>{SECTIONS[3].title}</Text>
        </View>
      </TouchableOpacity>
      <Collapsible collapsed={isSectionCollapsed('photos')} align="center">
        <View style={spotStyles.content}>
          {SECTIONS[3].content}
        </View>
      </Collapsible>
    </ScrollView>
  );
};

export default SpotOverview;
