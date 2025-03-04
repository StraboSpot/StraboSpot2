import React from 'react';
import {FlatList, View} from 'react-native';

import {ReportForm, ReportImages, ReportSpots, ReportTags, useReportModal} from '.';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import Modal from '../../shared/ui/modal/Modal';
import SaveButton from '../../shared/ui/SaveButton';

const ReportModal = ({openSpotInNotebook, updateSpotsInMapExtent}) => {
  const {
    checkedSpotsIds,
    checkedTagsIds,
    confirmCloseModal,
    formRef,
    handleSpotChecked,
    handleSpotPressed,
    handleTagChecked,
    handleTagPressed,
    initialValues,
    saveReport,
    setUpdatedImages,
    updatedImages,
  } = useReportModal({openSpotInNotebook: openSpotInNotebook});

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
            <View style={{paddingTop: 10}}/>
            <FlatListItemSeparator/>
            <ReportSpots
              checkedSpotsIds={checkedSpotsIds}
              handleSpotChecked={handleSpotChecked}
              handleSpotPressed={handleSpotPressed}
              updateSpotsInMapExtent={updateSpotsInMapExtent}
            />
            <View style={{paddingTop: 10}}/>
            <FlatListItemSeparator/>
            <ReportTags
              checkedTagsIds={checkedTagsIds}
              handleTagChecked={handleTagChecked}
              handleTagPressed={handleTagPressed}
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
