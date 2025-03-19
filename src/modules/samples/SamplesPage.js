import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import IGSNModal from './IGSNModal';
import SamplesList from './SamplesList';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {setModalVisible} from '../home/home.slice';
import BasicPageDetail from '../page/BasicPageDetail';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {setSelectedAttributes} from '../spots/spots.slice';

const SamplesPage = ({page}) => {
  const dispatch = useDispatch();

  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedSample, setSelectedSample] = useState({});
  const [isIGSNModalVisible, setIsIGSNModalVisible] = useState(false);

  useEffect(() => {
    console.log('UE SamplesPage []');
    return () => dispatch(setSelectedAttributes([]));
  }, []);

  useEffect(() => {
    console.log('UE SamplesPage [selectedAttributes, spot]', selectedAttributes, spot);
    if (isEmpty(selectedAttributes)) setSelectedSample({});
    else {
      setSelectedSample(selectedAttributes[0]);
      setIsDetailView(true);
    }
  }, [selectedAttributes, spot]);

  const editSample = (sample) => {
    setIsDetailView(true);
    setSelectedSample(sample);
    dispatch(setModalVisible({modal: null}));
  };

  const openModal = (item) => {
    setSelectedSample(item);
    setIsIGSNModalVisible(true);
  };

  const renderSamplesDetail = () => {
    return (
      <>
        <BasicPageDetail
          closeDetailView={() => {
            console.log('closeDetailView');
            setIsDetailView(false);
          }}
          page={page}
          selectedFeature={selectedSample}
          openModal={openModal}
        />
      </>
    );
  };

  const renderSamplesMain = () => {
    return (
      <View style={{flex: 1}}>
        <>
          <ReturnToOverviewButton/>
          <SectionDividerWithRightButton
            dividerText={page.label}
            onPress={() => dispatch(setModalVisible({modal: page.key}))}
          />
        </>
        <View style={{padding: 20, alignItems: 'center'}}>
          <Text>To register your sample with SESAR press the "Get IGSN" button.
         If there is an IGSN logo there is already an IGSN assigned.</Text>
        </View>
        <SamplesList
          onPress={editSample}
          page={page}
          openModal={openModal}
        />
      </View>
    );
  };

  return (
    <>
      {isDetailView ? renderSamplesDetail() : renderSamplesMain()}
      {isIGSNModalVisible && (
        <IGSNModal
          onModalCancel={() => setIsIGSNModalVisible(false)}
          sampleValues={selectedSample}
          // selectedFeature={selectedFeature}
        />
      )}
    </>
  );
};

export default SamplesPage;
