import React, {useEffect, useState} from 'react';
import {FlatList, View} from 'react-native';

import {ButtonGroup} from 'react-native-elements';
import {batch, useDispatch, useSelector} from 'react-redux';

import {getNewUUID, isEmpty, toTitleCase} from '../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR, PRIMARY_TEXT_COLOR, PRIMARY_TEXT_SIZE} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {setModalVisible} from '../home/home.slice';
import BasicListItem from '../page/BasicListItem';
import BasicPageDetail from '../page/BasicPageDetail';
import {PAGE_KEYS} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedSpotProperties} from '../spots/spots.slice';
import {INTERPRETATIONS_SUBPAGES, LITHOLOGY_SUBPAGES, STRUCTURE_SUBPAGES} from './sed.constants';

const BasicSedPage = (props) => {
  const dispatch = useDispatch();
  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState({});
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);

  const attributes = spot && spot.properties && spot.properties.sed && spot.properties.sed[props.page.key] || [];

  useEffect(() => {
    console.log('UE BasicSedPage [selectedAttributes, spot]', selectedAttributes, spot);
    if (!isEmpty(selectedAttributes)) {
      setSelectedAttribute(selectedAttributes[0]);
      setIsDetailView(true);
    }
  }, [selectedAttributes, spot]);

  const addAttribute = () => {
    batch(() => {
      setIsDetailView(true);
      setSelectedAttribute({id: getNewUUID()});
      dispatch(setModalVisible({modal: null}));
    });
  };

  const editAttribute = (attribute, i) => {
    if (!attribute.id) {
      let editedSedData = JSON.parse(JSON.stringify(spot.properties.sed));
      attribute = {...attribute, id: getNewUUID()};
      editedSedData[props.page.key].splice(i, 1, attribute);
      dispatch(editedSpotProperties({field: 'sed', value: editedSedData}));
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
    }
    batch(() => {
      setIsDetailView(true);
      setSelectedAttribute(attribute);
      dispatch(setModalVisible({modal: null}));
    });
  };

  const renderAttributeDetail = () => {
    const subpages = props.page.key === PAGE_KEYS.LITHOLOGIES ? LITHOLOGY_SUBPAGES
      : props.page.key === PAGE_KEYS.STRUCTURES ? STRUCTURE_SUBPAGES
        : props.page.key === PAGE_KEYS.INTERPRETATIONS ? INTERPRETATIONS_SUBPAGES
          : undefined;
    if (subpages) {
      return (
        <React.Fragment>
          <ButtonGroup
            selectedIndex={selectedTypeIndex}
            onPress={i => setSelectedTypeIndex(i)}
            buttons={Object.values(subpages).map(v => toTitleCase(v.replace(/_/g, ' ')))}
            containerStyle={{height: 40, borderRadius: 10}}
            buttonStyle={{padding: 5}}
            selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
            textStyle={{color: PRIMARY_TEXT_COLOR, fontSize: PRIMARY_TEXT_SIZE}}
          />
          <BasicPageDetail
            closeDetailView={() => setIsDetailView(false)}
            groupKey={'sed'}
            page={{...props.page, key: Object.values(subpages)[selectedTypeIndex]}}
            selectedFeature={selectedAttribute}
          />
        </React.Fragment>
      );
    }
    else {
      return (
        <BasicPageDetail
          closeDetailView={() => setIsDetailView(false)}
          groupKey={'sed'}
          page={props.page}
          selectedFeature={selectedAttribute}
        />
      );
    }
  };

  const renderAttributesMain = () => {
    return (
      <View style={{flex: 1, justifyContent: 'flex-start'}}>
        <ReturnToOverviewButton/>
        <SectionDividerWithRightButton
          dividerText={props.page.label}
          buttonTitle={'Add'}
          onPress={addAttribute}
        />
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={attributes}
          renderItem={({item, index}) => (
            <BasicListItem
              item={item}
              index={index}
              page={props.page}
              editItem={itemToEdit => editAttribute(itemToEdit, index)}
            />
          )}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText text={'No ' + props.page.label}/>}
        />
      </View>
    );
  };

  return (
    <React.Fragment>
      {isDetailView ? renderAttributeDetail() : renderAttributesMain()}
    </React.Fragment>
  );
};

export default BasicSedPage;
