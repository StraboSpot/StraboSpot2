import React, {useState} from 'react';
import {View} from 'react-native';

import {useSelector} from 'react-redux';

import {SMALL_SCREEN} from '../../shared/styles.constants';
import IconButton from '../../shared/ui/IconButton';
import uiStyles from '../../shared/ui/ui.styles';
import UseMapsHook from '../maps/useMaps';
import BaseMapDialog from './BaseMapDialogBox';
import homeStyles from './home.style';
import MapActionsDialog from './MapActionsDialogBox';
import MapSymbolsDialog from './MapSymbolsDialogBox';
import overlayStyles from './overlay.styles';

const MapActionButtons = ({dialogClickHandler, mapComponentRef}) => {
  const [useMaps] = UseMapsHook();

  const [dialogs, setDialogs] = useState({
    mapActionsMenuVisible: false,
    mapSymbolsMenuVisible: false,
    baseMapMenuVisible: false,
  });

  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);

  // Toggle given dialog between true (visible) and false (hidden)
  const toggleDialog = (dialog) => {
    console.log('Toggle', dialog);
    setDialogs(d => ({...d, [dialog]: !d[dialog]}));
  };

  return (
    <>
      <View style={SMALL_SCREEN ? homeStyles.smallScreenMapActionButtons : homeStyles.mapActionsContainer}>
        <IconButton
          source={SMALL_SCREEN ? require('../../assets/icons/MapActions_Transparent.png') : require('../../assets/icons/MapActionsButton.png')}
          onPress={() => toggleDialog('mapActionsMenuVisible')}
        />
        {isAllSymbolsOn
          ? (
            <IconButton
              source={SMALL_SCREEN ? require('../../assets/icons/Symbols_Transparent.png') :require('../../assets/icons/SymbolsButton.png')}
              onPress={() => toggleDialog('mapSymbolsMenuVisible')}
            />
          ) : (
            <IconButton
              source={require('../../assets/icons/SymbolsButton_pressed.png')}
              onPress={() => toggleDialog('mapSymbolsMenuVisible')}
            />
          )
        }
        {!currentImageBasemap && !stratSection && (
          <IconButton
            source={SMALL_SCREEN ? require('../../assets/icons/Layers_Transparent.png') : require('../../assets/icons/LayersButton.png')}
            onPress={() => toggleDialog('baseMapMenuVisible')}
          />
        )}
      </View>
      <MapActionsDialog
        visible={dialogs.mapActionsMenuVisible}
        overlayStyle={overlayStyles.mapActionsPosition}
        onPress={(name) => {
          dialogClickHandler('mapActionsMenuVisible', name);
          toggleDialog('mapActionsMenuVisible');
        }}
        onTouchOutside={() => toggleDialog('mapActionsMenuVisible')}
      />
      <MapSymbolsDialog
        visible={dialogs.mapSymbolsMenuVisible}
        overlayStyle={overlayStyles.mapSymbolsPosition}
        onPress={(name) => {
          dialogClickHandler('mapSymbolsMenuVisible', name);
          toggleDialog('mapSymbolsMenuVisible');
        }}
        onTouchOutside={() => toggleDialog('mapSymbolsMenuVisible')}
      />
      <BaseMapDialog
        visible={dialogs.baseMapMenuVisible}
        overlayStyle={overlayStyles.baseMapPosition}
        close={() => toggleDialog('baseMapMenuVisible')}
        mapComponentRef={mapComponentRef}
        onPress={(name) => {
          useMaps.setBasemap(name);
          toggleDialog('baseMapMenuVisible');
        }}
        onTouchOutside={() => toggleDialog('baseMapMenuVisible')}
      />
    </>
  );
};

export default MapActionButtons;
