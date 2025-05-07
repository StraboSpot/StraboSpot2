import React from 'react';
import {FlatList, Switch, Text, View} from 'react-native';

import {ButtonGroup, ListItem, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import overlayStyles from './overlay.styles';
import commonStyles from '../../../shared/common.styles';
import {isEmpty, toTitleCase} from '../../../shared/Helpers';
import * as themes from '../../../shared/styles.constants';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import {
  setFeatureTypesOff,
  setIsShowOnly1stMeas,
  setIsShowSpotLabelsOn,
  setTagTypeForColor,
} from '../../maps/maps.slice';
import styles from '../../measurements/measurements.styles';
import useMeasurements from '../../measurements/useMeasurements';

const MapSymbolsOverlay = ({onTouchOutside, overlayStyle, visible}) => {
  const dispatch = useDispatch();
  const featureTypesOff = useSelector(state => state.map.featureTypesOff) || [];
  const isShowOnly1stMeas = useSelector(state => state.map.isShowOnly1stMeas);
  const isShowSpotLabelsOn = useSelector(state => state.map.isShowSpotLabelsOn);
  const mapSymbols = useSelector(state => state.map.mapSymbols);
  const tagTypeForColor = useSelector(state => state.map.tagTypeForColor);

  const {getMeasurementLabel} = useMeasurements();

  const getSymbolTitle = symbol => toTitleCase(getMeasurementLabel(symbol));

  const handleShowOnly1stMeas = () => dispatch(setIsShowOnly1stMeas(!isShowOnly1stMeas));

  const handleShowSpotLabelsOn = () => dispatch(setIsShowSpotLabelsOn(!isShowSpotLabelsOn));

  const renderSymbolsList = ({item, index}) => {
    return (
      <ListItem containerStyle={commonStyles.listItemFormField} key={item}>
        <>
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>    {getSymbolTitle(item)}</ListItem.Title>
          </ListItem.Content>
          <Switch onValueChange={() => toggleFeatureTypesOff(item)} value={!featureTypesOff.includes(item)}/>
        </>
      </ListItem>
    );
  };

  const toggleFeatureTypesOff = (featureType) => {
    let featureTypesOffCopy = [...featureTypesOff];
    const i = featureTypesOffCopy.indexOf(featureType);
    if (i === -1) featureTypesOffCopy.push(featureType);
    else featureTypesOffCopy.splice(i, 1);
    dispatch(setFeatureTypesOff(featureTypesOffCopy));
  };

  const toggleShowTagColor = () => {
    if (tagTypeForColor) dispatch(setTagTypeForColor(undefined));
    else dispatch(setTagTypeForColor('geologic_unit'));
  };

  return (
    <Overlay
      animationType={'slide'}
      backdropStyle={{backgroundColor: 'transparent'}}
      isVisible={visible}
      onBackdropPress={onTouchOutside}
      overlayStyle={[overlayStyles.overlayContainer, overlayStyle]}
    >
      <View style={[overlayStyles.titleContainer]}>
        <Text style={[overlayStyles.titleText]}>Map Symbols</Text>
      </View>
      {!isEmpty(mapSymbols) && (
        <>
          <ListItem key={'feature_types'} containerStyle={commonStyles.listItem}>
            <ListItem.Content>
              <ListItem.Title style={commonStyles.listItemTitle}>Feature Types</ListItem.Title>
            </ListItem.Content>
          </ListItem>
          <FlatListItemSeparator/>
          <FlatList
            keyExtractor={item => item}
            data={mapSymbols}
            renderItem={renderSymbolsList}
            ItemSeparatorComponent={FlatListItemSeparator}
          />
        </>
      )}
      <FlatListItemSeparator/>
      <ListItem key={'spotLabels'} containerStyle={commonStyles.listItemFormField}>
        <>
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>Labels</ListItem.Title>
          </ListItem.Content>
          <Switch onValueChange={handleShowSpotLabelsOn} value={isShowSpotLabelsOn}/>
        </>
      </ListItem>
      <FlatListItemSeparator/>
      <ListItem key={'Only1stMeas'} containerStyle={commonStyles.listItemFormField}>
        <>
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>Only 1st Measurements</ListItem.Title>
          </ListItem.Content>
          <Switch onValueChange={handleShowOnly1stMeas} value={isShowOnly1stMeas}/>
        </>
      </ListItem>
      <FlatListItemSeparator/>
      <ListItem key={'tag_color'} containerStyle={commonStyles.listItemFormField}>
        <>
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>Tag Colors</ListItem.Title>
          </ListItem.Content>
          <Switch onValueChange={toggleShowTagColor} value={tagTypeForColor !== undefined}/>
        </>
      </ListItem>
      {tagTypeForColor && (
        <ButtonGroup
          onPress={i => dispatch(setTagTypeForColor(i === 0 ? 'geologic_unit' : 'concept'))}
          selectedIndex={tagTypeForColor === 'geologic_unit' ? 0 : 1}
          buttons={['Geologic Unit', 'Conceptual']}
          containerStyle={styles.measurementDetailSwitches}
          selectedButtonStyle={{backgroundColor: themes.PRIMARY_ACCENT_COLOR}}
          textStyle={{color: themes.PRIMARY_ACCENT_COLOR}}
        />
      )}
    </Overlay>
  );
};

export default MapSymbolsOverlay;
