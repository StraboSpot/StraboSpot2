import React, {useState, Component} from 'react';
import {Button, Text, ScrollView, StyleSheet, View} from 'react-native';
import spotStyles from "./SpotStyles";
import SpotTag from './spot-tags/SpotTagsOverview';
import SpotNotesOverview from './spot-notes/SpotNotesOverview';
import NotebookMeasurments from './spot-measurements/SpotMeasurementsOverview';
import PhotosAndSketches from './spot-photo-and-sketches/SpotPhotosAndSketchesOverview';
import Accordion from 'react-native-collapsible/Accordion';
import Collapsible from 'react-native-collapsible';

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

  const [activeSections, setActiveSections] = useState([]);

  const _renderHeader = section => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>{section.title}</Text>
      </View>
    );
  };

  const _renderContent = section => {
    return (
      <View style={{flex:1}}>
      <ScrollView style={styles.content}>
        {section.content}
      </ScrollView>
      </View>
    );
  };

  const _updateSections = activeSections => {
    setActiveSections(activeSections)
  };


    return (
      <View style={styles.container}>
        <Text style={spotStyles.textStyle}>OVERVIEW</Text>
        <Text>Tap on the section title to expand</Text>
        <View style={{flex:2}}>
        <Accordion
          containerStyle={{height: 100}}
          sections={SECTIONS}
          activeSections={activeSections}
          expandMultiple={true}
          renderHeader={_renderHeader}
          renderContent={_renderContent}
          onChange={_updateSections}
        />
        </View>
        {/*<View style={{flex:2}}>*/}
        {/*  <PhotosAndSketches/>*/}
        {/*</View>*/}
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgrey',
  },

  header: {
    backgroundColor: 'lightgrey',
    padding: 10,
    borderTopWidth: 1,
  },
  headerText: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 0,
    backgroundColor: 'lightgrey',
  },
  active: {
    backgroundColor: 'rgba(255,255,255,1)',
  },
  inactive: {
    backgroundColor: 'green',
  },
  selectors: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selector: {
    backgroundColor: '#F5FCFF',
    padding: 10,
  },
  activeSelector: {
    fontWeight: 'bold',
  },
  selectTitle: {
    fontSize: 14,
    fontWeight: '500',
    padding: 10,
  },
  multipleToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 30,
    alignItems: 'center',
  },
  multipleToggle__title: {
    fontSize: 16,
    marginRight: 8,
  },
});
// const SpotOverview = props => {

// return (
//   <View>
//     <View style={spotStyles.sectionStyle}>
//       <SpotTag
//         tag={'Tags'}
//         style={spotStyles.textStyle}
//       >
//       </SpotTag>
//     </View>
//     <View style={[spotStyles.sectionStyle, {borderTopWidth: 1}]}>
//       <SpotNotesOverview
//         notes={'Notes'}
//         style={spotStyles.textStyle}
//       />
//     </View>
//     <View style={[spotStyles.sectionStyle, {borderTopWidth: 1}]}>
//       <NotebookMeasurments
//         measurements={'Measurements'}
//         style={spotStyles.textStyle}
//       />
//     </View>
//     <View style={[spotStyles.sectionStyle, {borderTopWidth: 1}]}>
//       <PhotosAndSketches
//         photosAndSketches={'Photos and Sketches'}
//         style={spotStyles.textStyle}
//       />
//     </View>
//   </View>
// )
// };

export default SpotOverview;
