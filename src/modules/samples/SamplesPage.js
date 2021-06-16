import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import {batch, useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {setModalVisible} from '../home/home.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {setSelectedAttributes} from '../spots/spots.slice';
import SampleDetail from './SampleDetail';
import SamplesList from './SamplesList';

const SamplesPage = (props) => {
  const dispatch = useDispatch();

  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedSample, setSelectedSample] = useState({});

  useEffect(() => {
    return () => dispatch(setSelectedAttributes([]));
  }, []);

  useEffect(() => {
    console.log('UE Rendered SamplesPage\nSpot:', spot, '\nSelectedAttributes:', selectedAttributes);
    if (!isEmpty(selectedAttributes)) {
      setSelectedSample(selectedAttributes[0]);
      dispatch(setModalVisible({modal: null}));
      setIsDetailView(true);
    }
    else setSelectedSample({});
  }, [spot, selectedAttributes]);

  const editSample = (sample) => {
    batch(() => {
      setIsDetailView(true);
      setSelectedSample(sample);
      dispatch(setModalVisible({modal: null}));
    });
  };

  const renderSamplesDetail = () => {
    return (
      <SampleDetail
        closeDetailView={() => setIsDetailView(false)}
        page={props.page}
        selectedSample={selectedSample}
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
            onPress={() => dispatch(setModalVisible({modal: props.page.modal}))}
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
