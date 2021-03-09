import React, {useEffect, useState} from 'react';
import {SectionList, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewId} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {LABEL_DICTIONARY} from '../form';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import ThreeDStructureDetail from '../three-d-structures/ThreeDStructureDetail';
import FabricDetail from './FabricDetail';

const FabricsPage = () => {
  const dispatch = useDispatch();

  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedFabric, setSelectedFabric] = useState({});
  const [isDetailView, setIsDetailView] = useState(false);

  const fabricsDictionary = Object.values(LABEL_DICTIONARY.fabrics).reduce(
    (acc, form) => ({...acc, ...form}), {});
  const FABRIC_SECTIONS = {
    FAULT_ROCK: {title: 'Fault Rock Fabrics', key: 'fault_rock'},
    IGNEOUS: {title: 'Igneous Fabrics', key: 'igneous_rock'},
    METAMORPHIC: {title: 'Metamorphic Fabrics', key: 'metamorphic_rock'},
    DEPRECIATED: {title: 'Fabrics (Depreciated Version)', key: null},
  };

  useEffect(() => {
    console.log('UE FabricsPage: spot changed to', spot);
    setSelectedFabric({});
  }, [spot]);

  const addFabric = (type) => {
    const newFabric = {id: getNewId(), type: type};
    setSelectedFabric(newFabric);
    setIsDetailView(true);
  };

  const editFabric = (fabric) => {
    setSelectedFabric(fabric);
    setIsDetailView(true);
  };

  const getLabel = (key) => {
    if (Array.isArray(key)) {
      const labelsArr = key.map(val => fabricsDictionary[val] || val);
      return labelsArr.join(', ');
    }
    return fabricsDictionary[key] || key.replace('_', ' ');
  };

  const getFabricTitle = (fabric) => {
    return fabric.label || getLabel(fabric.type) || '';
  };

  const renderFabric = (fabric) => {
    const fabricTitle = getFabricTitle(fabric);
    const fabricFieldsText = Object.entries(fabric).reduce((acc, [key, value]) => {
      return key === 'id' ? acc : (acc === '' ? '' : acc + '\n') + getLabel(key) + ': ' + getLabel(value);
    }, '');
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={fabric.id}
        onPress={() => editFabric(fabric)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title style={commonStyles.listItemTitle}>{fabricTitle}</ListItem.Title>
          {fabricFieldsText !== '' && (
            <ListItem.Subtitle>{fabricFieldsText}</ListItem.Subtitle>
          )}
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const renderFabricSections = () => {
    let fabricsGrouped = Object.values(FABRIC_SECTIONS).reduce((acc, {title, key}) => {
      const data = key ? spot?.properties?.fabrics?.filter(fabric => fabric.type === key) || []
        : spot?.properties?._3d_structures?.filter(struct => struct.type === 'fabric') || [];
      const dataSorted = data.slice().sort((a, b) => getFabricTitle(a).localeCompare(getFabricTitle(b)));
      return [...acc, {title: title, data: dataSorted}];
    }, []);

    return (
      <SectionList
        keyExtractor={(item, index) => item + index}
        sections={fabricsGrouped}
        renderSectionHeader={({section: {title}}) => renderSectionHeader(title)}
        renderItem={({item}) => renderFabric(item)}
        renderSectionFooter={({section}) => {
          return section.data.length === 0 && <ListEmptyText text={'No ' + section.title}/>;
        }}
        stickySectionHeadersEnabled={true}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    );
  };

  const renderSectionHeader = (sectionTitle) => {
    const sectionKey = Object.values(FABRIC_SECTIONS).reduce((acc, {title, key}) => sectionTitle === title ? key : acc,
      '');
    if (sectionKey) {
      return (
        <View style={uiStyles.sectionHeaderBackground}>
          <SectionDividerWithRightButton
            dividerText={sectionTitle}
            buttonTitle={'Add'}
            onPress={() => addFabric(sectionKey)}
          />
        </View>
      );
    }
    else return <SectionDivider dividerText={sectionTitle}/>;
  };

  return (
    <React.Fragment>
      {!isDetailView && (
        <View style={{flex: 1}}>
          <ReturnToOverviewButton
            onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
          />
          {renderFabricSections()}
        </View>
      )}
      {isDetailView && (
        <React.Fragment>
          {selectedFabric.type === 'fabric' ? (
              <ThreeDStructureDetail
                show3dStructuresOverview={() => setIsDetailView(false)}
                selected3dStructure={selectedFabric}
              />
            )
            : (
              <FabricDetail
                showFabricsOverview={() => setIsDetailView(false)}
                selectedFabric={selectedFabric}
              />
            )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default FabricsPage;
