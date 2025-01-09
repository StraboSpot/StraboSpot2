import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import SamplesList from './SamplesList';
import {isEmpty, toTitleCase} from '../../shared/Helpers';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {setModalVisible} from '../home/home.slice';
import BasicPageDetail from '../page/BasicPageDetail';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {setSelectedAttributes} from '../spots/spots.slice';
import {PAGE_KEYS} from '../page/page.constants';
import {ButtonGroup} from 'react-native-elements';
import {PRIMARY_ACCENT_COLOR, PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';

const SamplesPage = ({page}) => {
  const buttons = ['samples', 'Register for IGSN'];
  const dispatch = useDispatch();

  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedSample, setSelectedSample] = useState({});
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);


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

  const renderSamplesDetail = () => {
    return (
      <>
        <ButtonGroup
          selectedIndex={selectedTypeIndex}
          onPress={i => setSelectedTypeIndex(i)}
          buttons={buttons}
          containerStyle={{height: 40, borderRadius: 10}}
          buttonStyle={{padding: 5}}
          selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
          textStyle={{color: PRIMARY_TEXT_COLOR}}
        />
        <BasicPageDetail
          closeDetailView={() => setIsDetailView(false)}
          page={{...page, key: 'samples', subkey: buttons[selectedTypeIndex]}}
          selectedFeature={selectedSample}
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
        <SamplesList
          onPress={editSample}
          page={page}
        />
      </View>
    );
  };

  return isDetailView ? renderSamplesDetail() : renderSamplesMain();
};

export default SamplesPage;
