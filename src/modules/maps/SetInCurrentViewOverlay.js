import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import IconButton from '../../shared/ui/IconButton';
import overlayStyles from '../home/overlays/overlay.styles';

// Modal to prompt the user to select a geometry if no geometry has been set
const SetInCurrentViewOverlay = ({
                                   createDefaultGeomContinued,
                                   setShowSetInCurrentViewModal,
                                   showSetInCurrentViewModal,
                                 }) => {

  const buttons = ['Point', 'LineString', 'Polygon'];

  const buttonIcon = (button) => {
    return button === 'LineString' ? require('../../assets/icons/LineButton.png')
      : button === 'Point' ? require('../../assets/icons/PointButton.png')
        : button === 'Polygon' ? require('../../assets/icons/PolygonButton.png')
          : null;
  };

  const updateDefaultGeomType = (geomType) => {
    setShowSetInCurrentViewModal(false);
    createDefaultGeomContinued(geomType);
  };

  return (
    <Overlay
      animationType={'slide'}
      overlayStyle={overlayStyles.overlayContainer}
      isVisible={showSetInCurrentViewModal}
      onBackdropPress={() => {
      }}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>Select a Geometry Type</Text>
      </View>
      <View style={[overlayStyles.overlayContent, overlayStyles.selectGeometryTypeContent]}>
        {buttons.map(button =>
          <Button
            icon={
              <IconButton
                style={{paddingRight: 15}}
                source={buttonIcon(button)}
                onPress={() => updateDefaultGeomType(button)}
              />
            }
            title={button}
            buttonStyle={overlayStyles.buttonText}
            type={'clear'}
            onPress={() => updateDefaultGeomType(button)}
            key={button}
          />,
        )}
      </View>
    </Overlay>
  );
};

export default SetInCurrentViewOverlay;
