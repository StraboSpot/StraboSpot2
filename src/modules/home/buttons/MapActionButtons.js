import React from 'react';
import {useWindowDimensions} from 'react-native';

import {useSelector} from 'react-redux';

import {SMALL_SCREEN} from '../../../shared/styles.constants';
import IconButton from '../../../shared/ui/IconButton';
import useMapsHook from '../../maps/useMaps';
import homeStyles from '../home.style';
import {MapActionsOverlay, MapLayersOverlay, MapSymbolsOverlay, overlayStyles} from '../overlays';

const MapActionButtons = ({dialogClickHandler, dialogs, mapComponentRef, toggleDialog}) => {
  const {height} = useWindowDimensions();
  const useMaps = useMapsHook();

  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);

  return (
    <>
      <IconButton
        source={SMALL_SCREEN ? require('../../../assets/icons/MapActions.png')
          : require('../../../assets/icons/MapActionsButton.png')}
        onPress={() => toggleDialog('mapActionsMenuVisible')}
        imageStyle={SMALL_SCREEN && homeStyles.iconSizeSmallScreen}
      />
      {isAllSymbolsOn
        ? (
          <IconButton
            source={SMALL_SCREEN ? require('../../../assets/icons/Symbols.png')
              : require('../../../assets/icons/SymbolsButton.png')}
            onPress={() => toggleDialog('mapSymbolsMenuVisible')}
            imageStyle={SMALL_SCREEN && homeStyles.iconSizeSmallScreen}
          />
        ) : (
          <IconButton
            source={SMALL_SCREEN ? require('../../../assets/icons/Symbols_pressed.png')
              : require('../../../assets/icons/SymbolsButton_pressed.png')}
            onPress={() => toggleDialog('mapSymbolsMenuVisible')}
            imageStyle={SMALL_SCREEN && homeStyles.iconSizeSmallScreen}
          />
        )
      }
      {!currentImageBasemap && !stratSection && (
        <IconButton
          source={SMALL_SCREEN ? require('../../../assets/icons/Layers.png')
            : require('../../../assets/icons/LayersButton.png')}
          onPress={() => toggleDialog('baseMapMenuVisible')}
          imageStyle={SMALL_SCREEN && homeStyles.iconSizeSmallScreen}
        />
      )}
      <MapActionsOverlay
        visible={dialogs.mapActionsMenuVisible}
        overlayStyle={{...overlayStyles.mapActionsPosition, maxHeight: height * 0.80, flex: 1}}
        onPress={name => dialogClickHandler('mapActionsMenuVisible', name)}
        onTouchOutside={() => toggleDialog('mapActionsMenuVisible')}
      />
      <MapSymbolsOverlay
        visible={dialogs.mapSymbolsMenuVisible}
        overlayStyle={{...overlayStyles.mapSymbolsPosition, maxHeight: height * 0.80, flex: 1}}
        onPress={name => dialogClickHandler('mapSymbolsMenuVisible', name)}
        onTouchOutside={() => toggleDialog('mapSymbolsMenuVisible')}
      />
      <MapLayersOverlay
        visible={dialogs.baseMapMenuVisible}
        overlayStyle={{...overlayStyles.baseMapPosition, maxHeight: height * 0.80, flex: 1}}
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
