import React, {useState} from 'react';
import {Platform, Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import Modal from '../../shared/ui/modal/Modal';
import modalStyle from '../../shared/ui/modal/modal.style';
import Spacer from '../../shared/ui/Spacer';
import uiStyles from '../../shared/ui/ui.styles';
import {setModalVisible} from '../home/home.slice';
import Templates from '../templates/Templates';
import Compass from './Compass';
import {setCompassMeasurements} from './compass.slice';
import compassStyles from './compass.styles';
import {isEmpty} from '../../shared/Helpers';

const CompassModal = (props) => {
  const dispatch = useDispatch();

  const [isShowTemplates, setIsShowTemplates] = useState(false);
  const [compassData, setCompassData] = useState({});
  const [showCompassRawDataView, setShowCompassRawDataView] = useState(false);

  const closeCompassModal = () => {
    if (isShowTemplates) setIsShowTemplates(false);
    else {
      dispatch(setModalVisible({modal: null}));
      dispatch(setCompassMeasurements({}));
      showCompassMetadataModal(false);
    }
  };

  const showCompassMetadataModal = (value) => {
    setShowCompassRawDataView(!value ? value : !showCompassRawDataView);
  };

  const renderCompassData = () => (
    <View style={{
      backgroundColor: 'white',
      padding: 20,
      borderBottomRightRadius: 20,
      borderTopRightRadius: 20,
      zIndex: 100,
    }}>
      <View style={uiStyles.headerContainer}>
        <Text style={commonStyles.dialogTitleText}>Compass Data</Text>
      </View>
      <View style={{marginBottom: 20}}>
        {/*<Text>Accelerometer:</Text>*/}
        {/*<Text> x: {compassData.accelX}</Text>*/}
        {/*<Text> y: {compassData.accelY}</Text>*/}
        {/*<Text> z: {compassData.accelZ}</Text>*/}
        {/*<Spacer/>*/}
        {/*<Text>Magnetometer:</Text>*/}
        {/*<Text> x: {compassData.magX}</Text>*/}
        {/*<Text> y: {compassData.magY}</Text>*/}
        {/*<Text> z: {compassData.magZ}</Text>*/}
        <Spacer/>
        <Text>Strike and Dip</Text>
        <Text> Rho: {compassData?.ENU_pole[0]}</Text>
        <Text> Phi: {compassData?.ENU_pole[1]}</Text>
        <Text> Theta: {compassData?.ENU_pole[2]}</Text>
        <Spacer/>
        <Text>Trend and Plunge</Text>
        <Text> Rho: {compassData?.ENU_tp[0]}</Text>
        <Text> Phi: {compassData?.ENU_tp[1]}</Text>
        <Text> Theta: {compassData?.ENU_tp[2]}</Text>
        <View>
          <Spacer/>
          <Text style={{textAlign: 'center', padding: 10, fontSize: 20}}>Matrix Rotation</Text>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text style={compassStyles.compassMatrixHeader}>{Platform.OS === 'ios' ? 'North' : 'East'}</Text>
              <Text style={compassStyles.compassMatrixDataText}>M11: {compassData.M11}</Text>
              <Text style={compassStyles.compassMatrixDataText}>M21: {compassData.M21} </Text>
              <Text style={compassStyles.compassMatrixDataText}>M31: {compassData.M31}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={compassStyles.compassMatrixHeader}>{Platform.OS === 'ios' ? 'West' : 'North'}</Text>
              <Text style={compassStyles.compassMatrixDataText}>M12: {compassData.M12}</Text>
              <Text style={compassStyles.compassMatrixDataText}>M22: {compassData.M22} </Text>
              <Text style={compassStyles.compassMatrixDataText}>M32: {compassData.M32}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={compassStyles.compassMatrixHeader}>Up</Text>
              <Text style={compassStyles.compassMatrixDataText}>M13: {compassData.M13}</Text>
              <Text style={compassStyles.compassMatrixDataText}>M23: {compassData.M23} </Text>
              <Text style={compassStyles.compassMatrixDataText}>M33: {compassData.M33}</Text>
            </View>
          </View>
          <Spacer/>
        </View>
      </View>

      <View style={{alignItems: 'center'}}>
        <Text>Heading: {compassData.heading}</Text>
        <Text>Strike: {compassData.strike}</Text>
        <Text>Dip: {compassData.dip}</Text>
        <Text>Plunge: {compassData.plunge}</Text>
        <Text>Trend: {compassData.trend}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      close={closeCompassModal}
      onPress={props.onPress}
      buttonTitleRight={isShowTemplates && ''}
    >
      <Templates
        isShowTemplates={isShowTemplates}
        setIsShowTemplates={bool => setIsShowTemplates(bool)}
      />
      <View>
        {!isShowTemplates
          && (
            <Compass
              goToCurrentLocation={props.goToCurrentLocation}
              showCompassDataModal={showCompassMetadataModal}
              setCompassRawDataToDisplay={(data) => {
                showCompassRawDataView && setCompassData(data);
              }}
            />
          )}
        <Overlay
          isVisible={showCompassRawDataView}
          overlayStyle={[{...modalStyle.modalContainer, width: 400}, compassStyles.compassDataModalPosition]}
        >
          {!isEmpty(compassData) && showCompassRawDataView && renderCompassData()}
          <Button
            title={'close'}
            onPress={() => showCompassMetadataModal(false)}
          />
        </Overlay>

      </View>

    </Modal>
  );
};

export default CompassModal;
