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
  setAllSymbolsToggled,
  setIsShowSpotLabelsOn,
  setSymbolsDisplayed,
  setTagTypeForColor,
} from '../../maps/maps.slice';
import styles from '../../measurements/measurements.styles';
import useMeasurementsHook from '../../measurements/useMeasurements';

const MapSymbolsOverlay = (props) => {

  const dispatch = useDispatch();
  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);
  const mapSymbols = useSelector(state => state.map.mapSymbols);
  const symbolsOn = useSelector(state => state.map.symbolsOn) || [];
  const tagTypeForColor = useSelector(state => state.map.tagTypeForColor);
  const isShowSpotLabelsOn = useSelector(state => state.map.isShowSpotLabelsOn);
  const useMeasurements = useMeasurementsHook();

  const getSymbolTitle = (symbol) => {
    return toTitleCase(useMeasurements.getLabel(symbol));
  };

  const renderSymbolsList = ({item, index}) => {
    return (
      <ListItem
        key={item}
        bottomDivider={index < mapSymbols.length - 2}>
        <ListItem.Content>
          <ListItem.Title>{getSymbolTitle(item)}</ListItem.Title>
        </ListItem.Content>
        <Switch onValueChange={() => toggleSymbolSelected(item)} value={symbolsOn.includes(item)}/>
      </ListItem>
    );
  };

  const toggleAllSymbolsOn = () => {
    dispatch(setAllSymbolsToggled(!isAllSymbolsOn));
  };

  const toggleShowTagColor = () => {
    if (tagTypeForColor) dispatch(setTagTypeForColor(undefined));
    else dispatch(setTagTypeForColor('geologic_unit'));
  };

  const toggleSymbolSelected = (symbol) => {
    let symbolsOnCopy = [...symbolsOn];
    const i = symbolsOnCopy.indexOf(symbol);
    if (i === -1) symbolsOnCopy.push(symbol);
    else symbolsOnCopy.splice(i, 1);
    dispatch(setSymbolsDisplayed(symbolsOnCopy));
  };

  return (
    <Overlay
      animationType={'slide'}
      backdropStyle={{backgroundColor: 'transparent'}}
      isVisible={props.visible}
      onBackdropPress={props.onTouchOutside}
      overlayStyle={[overlayStyles.overlayContainer, props.overlayStyle]}
    >
      <View style={[overlayStyles.titleContainer]}>
        <Text style={[overlayStyles.titleText]}>Map Symbols</Text>
      </View>
      {!isEmpty(mapSymbols) && (
        <FlatList
          keyExtractor={item => item}
          data={mapSymbols}
          renderItem={renderSymbolsList}
          ItemSeparatorComponent={FlatListItemSeparator}
        />
      )}
      <ListItem
        key={'all'}
        containerStyle={commonStyles.listItem}
      >
        <ListItem.Content>
          <ListItem.Title>{'All Symbols'}</ListItem.Title>
        </ListItem.Content>
        <Switch onValueChange={() => toggleAllSymbolsOn()} value={isAllSymbolsOn}/>
      </ListItem>
      <FlatListItemSeparator/>
      <ListItem
        key={'spotLabels'}
        containerStyle={commonStyles.listItem}
      >
        <ListItem.Content>
          <ListItem.Title>{'Symbol Labels'}</ListItem.Title>
        </ListItem.Content>
        <Switch onValueChange={() => dispatch(setIsShowSpotLabelsOn(!isShowSpotLabelsOn))}
                value={isShowSpotLabelsOn}/>
      </ListItem>
      <FlatListItemSeparator/>
      <ListItem
        key={'tag_color'}
        containerStyle={commonStyles.listItem}
      >
        <ListItem.Content>
          <ListItem.Title>{'Show Tag Color'}</ListItem.Title>
        </ListItem.Content>
        <Switch onValueChange={() => toggleShowTagColor()} value={tagTypeForColor !== undefined}/>
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
