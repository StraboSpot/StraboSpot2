import React from 'react';

import {ListItem} from 'react-native-elements';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, toTitleCase} from '../../shared/Helpers';
import {mapReducers} from '../maps/maps.constants';
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
          return <ListItem
            key={symbol}
            title={getSymbolTitle(symbol)}
            containerStyle={dialogStyles.dialogContent}
            bottomDivider={i < mapSymbols.length - 2}
            titleStyle={dialogStyles.dialogText}
            switch={{
              onChange: () => toggleSymbolSelected(symbol),
              value: symbolsOn.includes(symbol),
            }}
          />;
        })}
        <ListItem
          key={'all'}
          title='All Symbols'
          containerStyle={{...dialogStyles.dialogContent, paddingTop: 40}}
          titleStyle={dialogStyles.dialogLargerText}
          switch={{onChange: () => toggleAllSymbolsOn(), value: isAllSymbolsOn}}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MapSymbolsDialog;
