import React, {useRef, useState} from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {ReportForm, ReportImages, ReportSpots, ReportTags} from '.';
import {getNewUUID, isEmpty, isEqual} from '../../shared/Helpers';
import alert from '../../shared/ui/alert';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import Modal from '../../shared/ui/modal/Modal';
import SaveButton from '../../shared/ui/SaveButton';
import {useForm} from '../form';
import {setModalVisible} from '../home/home.slice';
import {updatedProject} from '../project/projects.slice';

const ReportModal = ({updateSpotsInMapExtent}) => {
  const dispatch = useDispatch();
  const report = useSelector(state => state.home.modalValues);
  const reports = useSelector(state => state.project.project?.reports) || [];

  const formRef = useRef(null);
  const {showErrors} = useForm();

  const reportImages = report?.images ? JSON.parse(JSON.stringify(report?.images)) : [];
  const [updatedImages, setUpdatedImages] = useState(reportImages);
  const reportSpots = report?.spots ? JSON.parse(JSON.stringify(report?.spots)) : [];
  const [checkedSpotsIds, setCheckedSpotsIds] = useState(reportSpots);
  const reportTags = report?.tags ? JSON.parse(JSON.stringify(report?.tags)) : [];
  const [checkedTagsIds, setCheckedTagsIds] = useState(reportTags);
  const initialValues = isEmpty(report) ? {} : report;

  const closeModal = () => {
    dispatch(setModalVisible({modal: null}));
  };

  const confirmCloseModal = () => {
    const areImageChanged = !isEqual(report?.images, updatedImages);
    if ((formRef.current && formRef.current.dirty) || areImageChanged) {
      const formCurrent = formRef?.current || {};
      alert(
        'Unsaved Changes',
        'Would you like to save your report before continuing?',
        [
          {
            text: 'No',
            style: 'cancel',
            onPress: closeModal,
          },
          {
            text: 'Yes',
            onPress: () => saveReport(formCurrent),
          },
        ],
        {cancelable: false},
      );
    }
    else closeModal();
  };

  const handleSpotChecked = (spotId) => {
    console.log('Spot', spotId, checkedSpotsIds);
    if (checkedSpotsIds.find(id => id === spotId)) setCheckedSpotsIds(checkedSpotsIds.filter(id => id !== spotId));
    else setCheckedSpotsIds([...checkedSpotsIds, spotId]);
  };

  const handleTagChecked = (tagId) => {
    console.log('Tag', tagId, checkedTagsIds);
    if (checkedTagsIds.find(id => id === tagId)) setCheckedTagsIds(checkedTagsIds.filter(id => id !== tagId));
    else setCheckedTagsIds([...checkedTagsIds, tagId]);
  };

  const saveReport = async () => {
    try {
      console.log('Saving report ...');
      await formRef.current.submitForm();
      let editedReport = showErrors(formRef.current);
      if (!editedReport.id) editedReport.id = getNewUUID();
      if (!editedReport.created_timestamp) editedReport.created_timestamp = Date.now();
      editedReport.updated_timestamp = Date.now();
      editedReport.images = updatedImages;
      editedReport.spots = checkedSpotsIds;
      editedReport.tags = checkedTagsIds;
      let updatedReports = reports.filter(r => r.id !== editedReport.id);
      updatedReports.push({...editedReport});
      dispatch(updatedProject({field: 'reports', value: updatedReports}));
      closeModal();
    }
    catch (e) {
      console.log('Error saving report data', e);
    }
  };

  return (
    <Modal
      title={isEmpty(initialValues) ? 'Create New Report' : 'Update Report'}
      buttonTitleRight={'Close'}
      closeModal={confirmCloseModal}
    >
      <FlatList
        bounces={false}
        ListHeaderComponent={
          <>
            <ReportForm initialValues={initialValues} ref={formRef}/>
            <FlatListItemSeparator/>
            <ReportImages setUpdatedImages={setUpdatedImages} updatedImages={updatedImages}/>
            <FlatListItemSeparator/>
            <ReportSpots
              checkedSpotsIds={checkedSpotsIds}
              handleSpotChecked={handleSpotChecked}
              updateSpotsInMapExtent={updateSpotsInMapExtent}
            />
            <FlatListItemSeparator/>
            <ReportTags
              checkedTagsIds={checkedTagsIds}
              handleTagChecked={handleTagChecked}
              updateSpotsInMapExtent={updateSpotsInMapExtent}
            />
          </>
        }
      />
      <SaveButton title={'Save Report'} onPress={saveReport}/>
    </Modal>
  );
};

export default ReportModal;
