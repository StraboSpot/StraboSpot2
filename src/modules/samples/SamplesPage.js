import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import {batch, useDispatch, useSelector} from 'react-redux';

import SamplesList from './SamplesList';
import {isEmpty} from '../../shared/Helpers';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {setModalVisible} from '../home/home.slice';
import BasicPageDetail from '../page/BasicPageDetail';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {setSelectedAttributes} from '../spots/spots.slice';

const SamplesPage = (props) => {
  const dispatch = useDispatch();

  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedSample, setSelectedSample] = useState({});

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
    batch(() => {
      setIsDetailView(true);
      setSelectedSample(sample);
      dispatch(setModalVisible({modal: null}));
    });
  };

  const renderSamplesDetail = () => {
    return (
      <BasicPageDetail
        closeDetailView={() => setIsDetailView(false)}
        page={props.page}
        selectedFeature={selectedSample}
      />
    );
  };

  const renderSamplesMain = () => {
    return (
      <View style={{flex: 1}}>
        <React.Fragment>
          <ReturnToOverviewButton/>
          <SectionDividerWithRightButton
            dividerText={props.page.label}
            buttonTitle={'Add'}
            onPress={() => dispatch(setModalVisible({modal: props.page.key}))}
          />
        </React.Fragment>
        <SamplesList
          onPress={editSample}
          page={props.page}
        />
      </View>
    );
  };

  return (
    <React.Fragment>
      {isDetailView ? renderSamplesDetail() : renderSamplesMain()}
    </React.Fragment>
  );
};

export default SamplesPage;
