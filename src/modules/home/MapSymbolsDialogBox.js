import React from 'react';
import {Dimensions, FlatList, Platform, Switch, Text, View} from 'react-native';

import {ButtonGroup, ListItem, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import {setAllSymbolsToggled, setIsShowSpotLabelsOn, setSymbolsDisplayed, setTagTypeForColor} from '../maps/maps.slice';
import styles from '../measurements/measurements.styles';
import useMeasurementsHook from '../measurements/useMeasurements';
import dialogStyles from './dialog.styles';
import homeStyles from './home.style';

const deviceHeight = Dimensions.get(Platform.OS === 'ios' ? 'window' : 'screen').height;

const MapSymbolsDialog = (props) => {
  const dispatch = useDispatch();
  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);
  const mapSymbols = useSelector(state => state.map.mapSymbols);
  const symbolsOn = useSelector(state => state.map.symbolsOn) || [];
  const tagTypeForColor = useSelector(state => state.map.tagTypeForColor);
  const isShowSpotLabelsOn = useSelector(state => state.map.isShowSpotLabelsOn);
  const [useMeasurements] = useMeasurementsHook();

  const getSymbolTitle = (symbol) => {
    return toTitleCase(useMeasurements.getLabel(symbol));
  };

  const renderSymbolsList = ({item, index}) => {
    return (
      <ListItem
        key={item}
        containerStyle={dialogStyles.dialogContent}
        bottomDivider={index < mapSymbols.length - 2}>
        <ListItem.Content>
          <ListItem.Title style={dialogStyles.dialogText}>{getSymbolTitle(item)}</ListItem.Title>
        </ListItem.Content>
        <Switch onChange={() => toggleSymbolSelected(item)} value={symbolsOn.includes(item)}/>
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
      isVisible={props.visible}
      overlayStyle={[homeStyles.dialogBox, dialogStyles.dialogBox]}
      onBackdropPress={props.onTouchOutside}
      backdropStyle={{backgroundColor: 'transparent'}}
    >
      <View style={[homeStyles.dialogTitleContainer, dialogStyles.dialogTitle]}>
        <Text style={[homeStyles.dialogTitleText, dialogStyles.dialogTitleText]}>Map Symbols</Text>
      </View>
      <View>
        {!isEmpty(mapSymbols) && (
          <View style={{maxHeight: deviceHeight * 0.60}}>
            <FlatList
              keyExtractor={item => item}
              data={mapSymbols}
              renderItem={renderSymbolsList}
              ItemSeparatorComponent={FlatListItemSeparator}
            />
          </View>
        )}
        <ListItem key={'all'} containerStyle={{...dialogStyles.dialogContent, paddingTop: 40}}>
          <ListItem.Content>
            <ListItem.Title style={dialogStyles.dialogLargerText}>{'All Symbols'}</ListItem.Title>
          </ListItem.Content>
          <Switch onChange={() => toggleAllSymbolsOn()} value={isAllSymbolsOn}/>
        </ListItem>
        <ListItem key={'spotLabels'} containerStyle={{...dialogStyles.dialogContent}}>
          <ListItem.Content>
            <ListItem.Title style={dialogStyles.dialogLargerText}>{'Symbol Labels'}</ListItem.Title>
          </ListItem.Content>
          <Switch onChange={() => dispatch(setIsShowSpotLabelsOn(!isShowSpotLabelsOn))} value={isShowSpotLabelsOn}/>
        </ListItem>
        <ListItem key={'tag_color'} containerStyle={{...dialogStyles.dialogContent}}>
          <ListItem.Content>
            <ListItem.Title style={dialogStyles.dialogLargerText}>{'Show Tag Color'}</ListItem.Title>
          </ListItem.Content>
          <Switch onChange={() => toggleShowTagColor()} value={tagTypeForColor !== undefined}/>
        </ListItem>
        {tagTypeForColor && (
          <ButtonGroup
            onPress={i => dispatch(setTagTypeForColor(i === 0 ? 'geologic_unit' : 'concept'))}
            selectedIndex={tagTypeForColor === 'geologic_unit' ? 0 : 1}
            buttons={['Geologic Unit', 'Conceptual']}
            containerStyle={styles.measurementDetailSwitches}
            selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
            textStyle={{color: themes.PRIMARY_ACCENT_COLOR}}
          />
        )}
      </View>
    </Overlay>
  );
};

export default MapSymbolsDialog;
