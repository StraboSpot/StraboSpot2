import React from 'react';
import {Switch} from 'react-native';

import {ButtonGroup, ListItem} from 'react-native-elements';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {mapReducers} from '../maps/maps.constants';
import styles from '../measurements/measurements.styles';
import useMeasurementsHook from '../measurements/useMeasurements';
import dialogStyles from './dialog.styles';

const scaleAnimation = new ScaleAnimation({
  useNativeDriver: true,
});

const MapSymbolsDialog = (props) => {
  const dispatch = useDispatch();
  const symbolsOn = useSelector(state => state.map.symbolsOn) || [];
  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);
  const mapSymbols = useSelector(state => state.map.mapSymbols);
  const tagTypeForColor = useSelector(state => state.map.tagTypeForColor);
  const [useMeasurements] = useMeasurementsHook();

  const getSymbolTitle = (symbol) => {
    const label = toTitleCase(useMeasurements.getLabel(symbol));
    return label.endsWith('y') ? label.slice(0, -1) + 'ies' : label + 's';
  };

  const toggleAllSymbolsOn = () => {
    dispatch({type: mapReducers.SET_ALL_SYMBOLS_TOGGLED, toggled: !isAllSymbolsOn});
  };

  const toggleSymbolSelected = (symbol) => {
    let symbolsOnCopy = [...symbolsOn];
    const i = symbolsOnCopy.indexOf(symbol);
    if (i === -1) symbolsOnCopy.push(symbol);
    else symbolsOnCopy.splice(i, 1);
    dispatch({type: mapReducers.SET_SYMBOLS_DISPLAYED, symbols: symbolsOnCopy});
  };

  return (
    <Dialog
      dialogAnimation={scaleAnimation}
      dialogStyle={dialogStyles.dialogBox}
      visible={props.visible}
      dialogTitle={
        <DialogTitle
          title='Map Symbols'
          style={dialogStyles.dialogTitle}
          textStyle={dialogStyles.dialogTitleText}
        />}
      onTouchOutside={props.onTouchOutside}
    >
      <DialogContent>
        {!isEmpty(mapSymbols) && mapSymbols.map((symbol, i) => {
          return (
            <ListItem
              key={symbol}
              containerStyle={dialogStyles.dialogContent}
              bottomDivider={i < mapSymbols.length - 2}>
              <ListItem.Content>
                <ListItem.Title style={dialogStyles.dialogText}>{getSymbolTitle(symbol)}</ListItem.Title>
              </ListItem.Content>
              <Switch onChange={() => toggleSymbolSelected(symbol)} value={symbolsOn.includes(symbol)}/>
            </ListItem>
          );
        })}
        <ListItem key={'all'} containerStyle={{...dialogStyles.dialogContent, paddingTop: 40}}>
          <ListItem.Content>
            <ListItem.Title style={dialogStyles.dialogLargerText}>{'All Symbols'}</ListItem.Title>
          </ListItem.Content>
          <Switch onChange={() => toggleAllSymbolsOn()} value={isAllSymbolsOn}/>
        </ListItem>
        <ListItem key={'tag_color'} containerStyle={{...dialogStyles.dialogContent}}>
          <ListItem.Content>
            <ListItem.Title style={dialogStyles.dialogLargerText}>{'Tag Color Prioritization'}</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ButtonGroup
          onPress={i => dispatch({
            type: mapReducers.SET_TAG_TYPE_FOR_COLOR,
            tagTypeForColor: i === 0 ? 'geologic_unit' : 'concept',
          })}
          selectedIndex={tagTypeForColor === 'geologic_unit' ? 0 : 1}
          buttons={['Geologic Unit Tags', 'Conceptual Tags']}
          containerStyle={styles.measurementDetailSwitches}
          selectedButtonStyle={{backgroundColor: themes.PRIMARY_ACCENT_COLOR}}
          textStyle={{color: themes.PRIMARY_ACCENT_COLOR}}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MapSymbolsDialog;
