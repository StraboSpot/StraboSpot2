import React, {useState} from 'react';
import {FlatList, Text, TouchableOpacity, View} from 'react-native';

import Collapsible from 'react-native-collapsible';
import {ButtonGroup, Icon, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import {projectReducers} from '../project/project.constants';
import {tagsStyles} from '../tags';

const Tags = () => {
  const dispatch = useDispatch();
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

  const sectionContents = (type) => {
    let filteredTags = {};
    if (!isEmpty(tags)) filteredTags = tags.filter(tag => tag.type === type);
    if (isEmpty(filteredTags)) {
      return (
        <View style={{alignContent: 'center', justifyContent: 'center'}}>
          <Text style={tagsStyles.noTagsText}>No Tags</Text>
        </View>
      );
    }
    return <FlatList data={filteredTags} renderItem={({item}) => renderTag(item)}/>;
  };

  const renderTag = (item) => {
    if (!isEmpty(item)) {
      return (
        <ListItem
          title={item.name}
          containerStyle={[commonStyles.listItem, {marginTop: 1}]}
          rightTitle={item.spots ? `${item.spots.length} spots` : '0 spots'}
          rightTitleStyle={tagsStyles.valueInList}
          onPress={() => {
            dispatch({
              type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE,
              view: settingPanelReducers.SET_SIDE_PANEL_VIEW.TAG_DETAIL,
              // tag: item,
              bool: true,
            });
            dispatch({type: projectReducers.SET_SELECTED_TAG, tag: item});
          }
          }
          chevron
        />
      );
    }
    else return <Text>No Data</Text>;
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
    {id: 1, title: 'Geologic Units', content: sectionContents('geologic_unit')},
    {id: 2, title: 'Concepts', content: sectionContents('concept')},
    {id: 3, title: 'Documentation', content: sectionContents('documentation')},
    {id: 4, title: 'Rosetta', content: sectionContents('rosetta')},
    {id: 5, title: 'Experimental Apparatus', content: sectionContents('experimental_apparatus')},
    {id: 6, title: 'Other', content: sectionContents('other')},
  ];

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, justifyContent: 'center'}}>
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
      <View style={{flex: 9}}>
        {tags ? renderCollapsibleList(sections) :
          <View style={commonStyles.noContentContainer}>
            <Text style={commonStyles.noContentText}>No Tags!</Text>
          </View>}
      </View>
    </View>
  );
};

export default Tags;
