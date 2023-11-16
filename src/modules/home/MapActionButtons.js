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

const MapActionButtons = ({dialogClickHandler, leftsideIconAnimation, style, zoomToCustomMap, zoomToCenterOfflineTile}) => {
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

  const buttonStyle = () => {
    return SMALL_SCREEN ? homeStyles.smallScreenMapActionButtons : homeStyles.mapActionsContainer;
  };

  return (
    <>
      <View style={[buttonStyle(), style]}>
        <IconButton
          source={require('../../assets/icons/MapActionsButton.png')}
          onPress={() => toggleDialog('mapActionsMenuVisible')}
          containerStyle={uiStyles.imageIconContainer}
        />
        {isAllSymbolsOn
          ? (
            <IconButton
              source={require('../../assets/icons/SymbolsButton.png')}
              onPress={() => toggleDialog('mapSymbolsMenuVisible')}
              containerStyle={uiStyles.imageIconContainer}
            />
          ) : (
            <IconButton
              source={require('../../assets/icons/SymbolsButton_pressed.png')}
              onPress={() => toggleDialog('mapSymbolsMenuVisible')}
              containerStyle={uiStyles.imageIconContainer}
            />
          )
        }
        {!currentImageBasemap && !stratSection && (
          <IconButton
            source={require('../../assets/icons/LayersButton.png')}
            onPress={() => toggleDialog('baseMapMenuVisible')}
            containerStyle={uiStyles.imageIconContainer}
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
        zoomToCustomMap={zoomToCustomMap}
        zoomToCenterOfflineTile={zoomToCenterOfflineTile}
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
