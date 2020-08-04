import React from 'react';

import {ListItem} from 'react-native-elements';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';
import {useDispatch, useSelector} from 'react-redux';

import {mapReducers, mapSymbolsSwitcher} from '../maps/maps.constants';
import dialogStyles from './dialog.styles';

const scaleAnimation = new ScaleAnimation({
  useNativeDriver: true,
});

const MapSymbolsDialog = (props) => {
  const dispatch = useDispatch();
  const selectedSymbols = useSelector(state => state.map.symbolsDisplayed) || [];
  const allSymbolsToggled = useSelector(state => state.map.allSymbolsToggled);
  const symbolKeys = mapSymbolsSwitcher.map(symbolEntry => symbolEntry.key);

  const toggleAllSymbols = () => {
    console.log('All Symbols Toggled');
    dispatch({type: mapReducers.SET_ALL_SYMBOLS_TOGGLED, toggled: !allSymbolsToggled});
    dispatch({type: mapReducers.SET_SYMBOLS_DISPLAYED, symbols: symbolKeys});
  };

  const toggleSymbolSelected = (symbol) => {
    let selectedSymbolsCopy = [...selectedSymbols];
    const i = selectedSymbolsCopy.indexOf(symbol);
    if (i === -1) selectedSymbolsCopy.push(symbol);
    else selectedSymbolsCopy.splice(i, 1);
    dispatch({type: mapReducers.SET_SYMBOLS_DISPLAYED, symbols: selectedSymbolsCopy});
    if (selectedSymbolsCopy.length === symbolKeys.length) {
      dispatch({type: mapReducers.SET_ALL_SYMBOLS_TOGGLED, toggled: true});
    }
    else dispatch({type: mapReducers.SET_ALL_SYMBOLS_TOGGLED, toggled: false});
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
        {mapSymbolsSwitcher.map((switcherEntry, i) => {
          return <ListItem
            key={switcherEntry.key}
            title={switcherEntry.title}
            containerStyle={dialogStyles.dialogContent}
            bottomDivider={i < symbolKeys.length - 2}
            titleStyle={dialogStyles.dialogText}
            switch={{
              onChange: () => toggleSymbolSelected(switcherEntry.key),
              value: selectedSymbols.includes(switcherEntry.key),
            }}
          />;
        })}
        <ListItem
          key={'all'}
          title='All Symbols'
          containerStyle={{...dialogStyles.dialogContent, paddingTop: 40}}
          titleStyle={dialogStyles.dialogLargerText}
          switch={{onChange: () => toggleAllSymbols(), value: allSymbolsToggled}}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MapSymbolsDialog;
