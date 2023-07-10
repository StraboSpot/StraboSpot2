import React from 'react';
import {Platform, Text, View} from 'react-native';

import {Overlay, Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

// Styles
import styles from './dialog.styles';
import homeStyles from './home.style';

const MapActionsDialog = (props) => {

  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const {isInternetReachable, isConnected} = useSelector(state => state.home.isOnline);
  const stratSection = useSelector(state => state.map.stratSection);

  return (
    <Overlay
      animationType={'slide'}
      isVisible={props.visible}
      overlayStyle={[homeStyles.dialogBox, styles.dialogBox]}
      onBackdropPress={props.onTouchOutside}
      backdropStyle={{backgroundColor: 'transparent'}}
    >
      <View style={[homeStyles.dialogTitleContainer, styles.dialogTitle]}>
        <Text style={[homeStyles.dialogTitleText, styles.dialogTitleText]}>Map Actions</Text>
      </View>
      <View>
        <Button
          onPress={() => props.onPress('zoom')}
          title={'Zoom to Extent of Spots'}
          titleStyle={styles.dialogText}
          type={'clear'}
        />
        {/*<Button*/}
        {/*  onPress={() => props.onPress('zoomToOfflineMap')}*/}
        {/*  title='Zoom to Offline Map'*/}
        {/*  titleStyle={styles.dialogText}*/}
        {/*  type={'clear'}*/}
        {/*/>*/}
        {((isInternetReachable && isConnected) || (!isInternetReachable && isConnected && currentBasemap?.source)) && (
          <Button
            onPress={() => props.onPress('saveMap')}
            style={styles.dialogContent}
            title={'Save Map for Offline Use'}
            titleStyle={styles.dialogText}
            type={'clear'}
          />
        )}
        <Button
          onPress={() => props.onPress('addTag')}
          style={styles.dialogContent}
          title={'Add Tag(s) to Spot(s)'}
          titleStyle={styles.dialogText}
          type={'clear'}
        />
        {Platform.OS === 'ios' && (
          <Button
            onPress={() => props.onPress('stereonet')}
            style={styles.dialogContent}
            title={'Lasso Spots for Stereonet'}
            titleStyle={styles.dialogText}
            type={'clear'}
          />
        )}
        <Button
          onPress={() => props.onPress('mapMeasurement')}
          style={styles.dialogContent}
          title={'Measure Distance'}
          titleStyle={styles.dialogText}
          type={'clear'}
        />
        {stratSection && (
          <Button
            onPress={() => props.onPress('stratSection')}
            style={styles.dialogContent}
            title={'Strat Section Settings'}
            titleStyle={styles.dialogText}
            type={'clear'}
          />
        )}
      </View>
    </Overlay>
  );
};

export default MapActionsDialog;
