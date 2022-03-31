import React, {useEffect, useState} from 'react';
import {SectionList, View} from 'react-native';

import {batch, useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {setModalValues, setModalVisible} from '../home/home.slice';
import BasicPageDetail from '../page/BasicPageDetail';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {setSelectedAttributes} from '../spots/spots.slice';
import FabricListItem from './FabricListItem';

const FabricsPage = (props) => {
  const dispatch = useDispatch();
  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedFabric, setSelectedFabric] = useState({});
  const [isDetailView, setIsDetailView] = useState(false);

  const FABRIC_SECTIONS = {
    FAULT_ROCK: {title: 'Fault & Sheer Zone Fabrics', key: 'fault_rock'},
    IGNEOUS: {title: 'Igneous Fabrics', key: 'igneous_rock'},
    METAMORPHIC: {title: 'Metamorphic Fabrics', key: 'metamorphic_rock'},
    DEPRECATED: {title: 'Fabrics (Deprecated Version)', key: null},
  };

  useEffect(() => {
    console.log('UE FabricsPage []');
    return () => dispatch(setSelectedAttributes([]));
  }, []);

  useEffect(() => {
    console.log('UE FabricsPage [selectedAttributes, spot]', selectedAttributes, spot);
    if (isEmpty(selectedAttributes)) setSelectedFabric({});
    else {
      setSelectedFabric(selectedAttributes[0]);
      setIsDetailView(true);
    }
  }, [selectedAttributes, spot]);

  const addFabric = (type) => {
    dispatch(setModalValues({type: type}));
    dispatch(setModalVisible({modal: props.page.key}));
  };

  const editFabric = (fabric) => {
    batch(() => {
      setIsDetailView(true);
      setSelectedFabric(fabric);
      dispatch(setModalVisible({modal: null}));
    });
  };

  const renderFabricSections = () => {
    let fabricsGrouped = Object.values(FABRIC_SECTIONS).reduce((acc, {title, key}) => {
      const data = key ? spot?.properties?.fabrics?.filter(fabric => fabric.type === key) || []
        : spot?.properties?._3d_structures?.filter(struct => struct.type === 'fabric') || [];
      return [...acc, {title: title, data: data.reverse()}];
    }, []);

    return (
      <SectionList
        keyExtractor={(item, index) => item + index}
        sections={fabricsGrouped}
        renderSectionHeader={({section: {title}}) => renderSectionHeader(title)}
        renderItem={({item}) => <FabricListItem fabric={item} editFabric={editFabric}/>}
        renderSectionFooter={({section}) => {
          return section.data.length === 0 && <ListEmptyText text={'No ' + section.title}/>;
        }}
        stickySectionHeadersEnabled={true}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    );
  };

  const renderSectionHeader = (sectionTitle) => {
    const sectionKey = Object.values(FABRIC_SECTIONS).reduce((acc, {title, key}) => {
        return sectionTitle === title ? key : acc;
      },
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

  const renderFabricDetail = () => {
    return (
      <BasicPageDetail
        closeDetailView={() => setIsDetailView(false)}
        page={props.page}
        selectedFeature={selectedFabric}
      />
    );
  };

  const renderFabricsMain = () => {
    return (
      <View style={{flex: 1}}>
        <ReturnToOverviewButton/>
        {renderFabricSections()}
      </View>
    );
  };

  return (
    <React.Fragment>
      {isDetailView ? renderFabricDetail() : renderFabricsMain()}
    </React.Fragment>
  );
};

export default FabricsPage;
