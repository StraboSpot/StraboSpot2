import React, {useState} from 'react';
import {Text, View, FlatList, TouchableOpacity} from 'react-native';
import {ButtonGroup, Icon, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';
import Collapsible from 'react-native-collapsible';
import {isEmpty} from '../../shared/Helpers';

//Styles
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import tagStyles from './Tags.styles';
import commonStyles from '../../shared/common.styles';

const Tags = (props) => {

  const tags = useSelector(state => state.project.project.tags);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState([]);

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

  const sectionContents = (name) => {
    let content;
    switch (name) {
      case 'Geologic Units':
        const geo = tags.filter(tag => tag.type === 'geologic_unit');
          content =
            <FlatList data={geo} renderItem={({item}) => renderTag(item)}/>;
          break;
      case 'Concepts':
        const concept = tags.filter(tag => tag.type === 'concept');
        content =
          <FlatList data={concept} renderItem={({item}) => renderTag(item)}/>;
          break;
      case 'Documentation' :
        const documentation = tags.filter(tag => tag.type === 'documentation');
        content =
          <FlatList data={documentation} renderItem={({item}) => renderTag(item)}/>;
      case 'Rosetta' :
        const rosetta = tags.filter(tag => tag.type === 'rosetta');
        content =
          <FlatList data={rosetta} renderItem={({item}) => renderTag(item)}/>;
    }
    return content;
  };

  const renderTag = (item) => {
    if (!isEmpty(item)) {
      return (
        <ListItem
          title={item.name}
          containerStyle={[commonStyles.listItem, {marginTop: 1}]}
          rightTitle={item.spots ? `${item.spots.length} spots` : '0 spots'}
          rightTitleStyle={tagStyles.rightTitleListStyle}
          chevron
        />
      );
    }
    else return <Text>No Data</Text>
  };

  const renderCollapsibleList = (sections) => {
    return (
      <FlatList
        keyExtractor={(section) => section.id.toString()}
        data={sections}
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

  const toggleCollapsed = (name) => {
    if (collapsedSections.includes(name)) setCollapsedSections(collapsedSections.filter((val) => val !== name));
    else setCollapsedSections(collapsedSections.concat(name));
  };

  const sections = [
    {id: 1, title: 'Geologic Units', content: sectionContents('Geologic Units')},
    {id: 2, title: 'Concepts', content: sectionContents('Concepts')},
    {id: 3, title: 'Documentation', content: sectionContents('Documentation')},
    {id: 4, title: 'Rosetta', content: sectionContents('Rosetta')},
    {id: 5, title: 'Experimental Apparatus', content: sectionContents('Experimental Apparatus')},
    {id: 6, title: 'Other', content: sectionContents('Other')},
  ];

  return (
    <View >
      <View>
        <ButtonGroup
          selectedIndex={selectedIndex}
          onPress={(index) => {
            console.log(index);
            setSelectedIndex(index);
          }}
          buttons={['Categorized', 'Map Extent', 'Recently Used']}
          containerStyle={{height: 50}}
          buttonStyle={{padding: 5}}
          textStyle={{fontSize: 12}}
        />
      </View>
      <View>
        {renderCollapsibleList(sections)}
      </View>
    </View>
  );
};

export default Tags;
