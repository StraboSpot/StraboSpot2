import React from 'react';
import {Platform, Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';
import {useSelector} from 'react-redux';

// Styles
import overlayStyles from './overlay.styles';

const MapActionsDialog = (props) => {

  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const {isInternetReachable, isConnected} = useSelector(state => state.home.isOnline);
  const stratSection = useSelector(state => state.map.stratSection);

  return (
    <Overlay
      animationType={'slide'}
      isVisible={props.visible}
      overlayStyle={[overlayStyles.overlayContainer]}
      onBackdropPress={props.onTouchOutside}
      backdropStyle={{backgroundColor: 'transparent'}}
    >
      <View style={[overlayStyles.titleContainer]}>
        <Text style={[overlayStyles.titleText]}>Map Actions</Text>
      </View>
      <View>
        <Button
          onPress={() => props.onPress('zoom')}
          title={'Zoom to Extent of Spots'}
          titleStyle={overlayStyles.buttonTitle}
          type={'clear'}
        />
        {/*<Button*/}
        {/*  onPress={() => props.onPress('zoomToOfflineMap')}*/}
        {/*  title='Zoom to Offline Map'*/}
        {/*  titleStyle={overlayStyles.dialogText}*/}
        {/*  type={'clear'}*/}
        {/*/>*/}
        {((isInternetReachable && isConnected) || (!isInternetReachable && isConnected && currentBasemap?.source)) && (
          <Button
            onPress={() => props.onPress('saveMap')}
            title={'Save Map for Offline Use'}
            titleStyle={overlayStyles.buttonTitle}
            type={'clear'}
          />
        )}
        <Button
          onPress={() => props.onPress('addTag')}
          title={'Add Tag(s) to Spot(s)'}
          titleStyle={overlayStyles.buttonTitle}
          type={'clear'}
        />
        {Platform.OS === 'ios' && (
          <Button
            onPress={() => props.onPress('stereonet')}
            title={'Lasso Spots for Stereonet'}
            titleStyle={overlayStyles.buttonTitle}
            type={'clear'}
          />
        )}
        <Button
          onPress={() => props.onPress('mapMeasurement')}
          title={'Measure Distance'}
          titleStyle={overlayStyles.buttonTitle}
          type={'clear'}
        />
        {stratSection && (
          <Button
            onPress={() => props.onPress('stratSection')}
            title={'Strat Section Settings'}
            titleStyle={overlayStyles.buttonTitle}
            type={'clear'}
          />
        )}
      </View>
    </Overlay>
  );
};

export default MapActionsDialog;
