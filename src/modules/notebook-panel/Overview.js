import React, {useState, Component} from 'react';
import {Text, ScrollView, FlatList, TouchableOpacity, View} from 'react-native';

import TagsOverview from '../tags/TagsOverview';
import NotesOverview from '../notes/NotesOverview';
import MeasurementsOverview from '../measurements/MeasurementsOverview';
import NotebookImages from '../images/ImageNotebook';
import Collapsible from 'react-native-collapsible';
import {Icon} from 'react-native-elements';

// Styles
import notebookStyles from './notebookPanel.styles';

const Overview = props => {

  const SECTIONS = [
    {
      id: 1,
      title: 'Measurements',
      content: <MeasurementsOverview/>,
    },
    {
      id: 2,
      title: 'Photos and Sketches',
      content: <NotebookImages/>,
    },
    {
      id: 3,
      title: 'Tags',
      content: <TagsOverview/>,
    },
    {
      id: 4,
      title: 'Notes',
      content: <NotesOverview/>,
    },
  ];

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

  const [collapsedSections, setCollapsedSections] = useState(['Tags', 'Notes', 'Photos and Sketches']);

  const toggleCollapsed = (name) => {
    if (collapsedSections.includes(name)) setCollapsedSections(collapsedSections.filter((val) => val !== name));
    else setCollapsedSections(collapsedSections.concat(name));
  };

  const renderCollapsibleList = () => {

    return (
      <FlatList
        keyExtractor={(section) => section.id.toString()}
        data={SECTIONS}
        renderItem={({item}) => renderSections(item)}/>
    );
  };

  const renderSections = (section) => {
    return (
      <View key={section.title}>
        <TouchableOpacity onPress={() => toggleCollapsed(section.title)}>
          <View style={notebookStyles.collapsibleSectionHeaderContainer}>
            {collapsedSections.includes(section.title) ? expandedIcon : collapseIcon}
            <Text style={notebookStyles.collapsibleSectionHeaderText}>{section.title}</Text>
          </View>
        </TouchableOpacity>
        {/*<Collapsible collapsed={false} align="center">*/}
        <Collapsible collapsed={collapsedSections.includes(section.title)} align='center'>
          <View>
            {section.content}
          </View>
        </Collapsible>
      </View>
    );
  };

  return (
    <View>
      {renderCollapsibleList()}
    </View>
  );
};

export default Overview;
