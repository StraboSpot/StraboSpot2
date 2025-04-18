import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {Formik} from 'formik';
import {Button, CheckBox, Icon} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {PAGE_KEYS} from './page.constants';
import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import alert from '../../shared/ui/alert';
import PickerOverlay from '../../shared/ui/PickerOverlay';
import SaveAndCancelButtons from '../../shared/ui/SaveAndCancelButtons';
import {Form, useForm} from '../form';
import GeoFieldsInputs from '../geography/GeoFieldInputs';
import NoteForm from '../notes/NoteForm';
import usePetrology from '../petrology/usePetrology';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import IGSNModal from '../samples/IGSNModal';
import useSamples from '../samples/useSamples';
import {LITHOLOGY_SUBPAGES} from '../sed/sed.constants';
import useSed from '../sed/useSed';
import {useSpots} from '../spots';
import {editedSpotProperties, setSelectedAttributes} from '../spots/spots.slice';
import {useTags} from '../tags';
import DeleteOverlay from './ui/DeleteOverlay';
import sampleStyles from '../samples/samples.styles';
import {setSelectedUserCode} from '../user/userProfile.slice';

const BasicPageDetail = ({
                           closeDetailView,
                           deleteTemplate,
                           groupKey = 'general',
                           page,
                           openModal,
                           selectedFeature,
                           saveTemplate,
                         }) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);
  const {isInternetReachable} = useSelector(state => state.connections.isOnline);
  const {userCodes, selectedUserCode} = useSelector(state => state.user.sesar);

  const [isIGSNChecked, setIsIGSNChecked] = useState(selectedFeature.isOnMySesar || false);
  const [isDeleteOverlayVisible, setIsDeleteOverlayVisible] = useState(false);
  const [isIGSNModalVisible, setIsIGSNModalVisible] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [sampleFormRef, setSelectedSample] = useState({});

  const {showErrors, validateForm} = useForm();
  const {deletePetFeature, onMineralChange, savePetFeature} = usePetrology();
  const {onSampleFormChange} = useSamples();
  const {deleteSedFeature, onSedFormChange, saveSedBedFeature, saveSedFeature} = useSed();
  const {checkSampleName} = useSpots();
  const {deleteFeatureTags} = useTags();

  const formRef = useRef(null);

  const pageKey = page.key === PAGE_KEYS.FABRICS && selectedFeature.type === 'fabric' ? '_3d_structures'
    : page.key === PAGE_KEYS.ROCK_TYPE_SEDIMENTARY ? PAGE_KEYS.LITHOLOGIES : page.key;
  let pageData = pageKey === PAGE_KEYS.NOTES ? {} : [];
  if (spot && spot.properties) {
    if (spot.properties[groupKey] && spot.properties[groupKey][pageKey]) pageData = spot.properties[groupKey][pageKey];
    else if (spot.properties[pageKey]) pageData = spot.properties[pageKey];
  }
  const title = groupKey === 'pet' && pageKey === PAGE_KEYS.ROCK_TYPE_IGNEOUS
  && !selectedFeature.rock_type && selectedFeature.igneous_rock_class
    ? toTitleCase(selectedFeature.igneous_rock_class.replace('_', ' ') + ' Rock')
    : page.label_singular || toTitleCase(page.label).slice(0, -1);

  const isTemplate = saveTemplate;

  useLayoutEffect(() => {
    console.log('ULE BasicPageDetail []');
    return () => confirmLeavePage();
  }, []);

  useEffect(() => {
    console.log('UE BasicPageDetail []');
    return () => dispatch(setSelectedAttributes([]));
  }, []);

  useEffect(() => {
    console.log('UE BasicPageDetail [selectedFeature]', selectedFeature);
    if (!isTemplate && isEmpty(selectedFeature)) closeDetailView();
  }, [selectedFeature]);

  const cancelForm = async () => {
    await formRef.current.resetForm();
    closeDetailView();
  };

  const confirmLeavePage = () => {
    if (!isTemplate && formRef.current && formRef.current.dirty) {
      const formCurrent = formRef.current;
      alert('Unsaved Changes',
        'Would you like to save your data before continuing?',
        [{
          text: 'No',
          style: 'cancel',
        }, {
          text: 'Yes',
          onPress: () => saveForm(formCurrent),
        }],
        {cancelable: false},
      );
    }
  };

  const deleteFeature = () => {
    deleteFeatureTags([selectedFeature]);
    if (groupKey === 'pet') deletePetFeature(pageKey, spot, selectedFeature);
    else if (groupKey === 'sed') deleteSedFeature(pageKey, spot, selectedFeature);
    else {
      let editedPageData = pageData ? JSON.parse(JSON.stringify(pageData)) : [];
      editedPageData = editedPageData.filter(f => f.id !== selectedFeature.id);
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(editedSpotProperties({field: pageKey, value: editedPageData}));
    }
    dispatch(setSelectedAttributes([]));
    closeDetailView();
  };

  const deleteFeatureConfirm = () => {
    if (pageKey === PAGE_KEYS.SAMPLES && selectedFeature.isOnMySesar) {
      setIsDeleteOverlayVisible(true);
    }
    else {
      alert('Delete ' + title,
        'Are you sure you would like to delete this ' + title + '?',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => deleteFeature(),
          },
        ],
        {cancelable: false},
      );
    }
  };

  const getFormName = () => {
    let formName = [groupKey, pageKey];
    if (groupKey === 'pet' && selectedFeature.rock_type) formName = ['pet_deprecated', pageKey];
    else if (groupKey === 'pet' && pageKey === 'igneous') formName = [groupKey, selectedFeature.igneous_rock_class];
    else if (pageKey === '_3d_structures' || pageKey === 'fabrics') formName = [pageKey, selectedFeature.type];
    else if (page.subkey) formName = [pageKey, page.subkey];
    console.log('Rendering form:', formName[0] + '.' + formName[1]);
    return formName;
  };

  const getIsDisabled = (fieldName) => {
    return selectedFeature.isOnMySesar
      ? isInternetReachable
        ? fieldName === 'Sample_IGSN' : true
      : false;
  };

  const openPicker = () => {
    setIsPickerVisible(true);
  };

  const closePicker = () => {
    setIsPickerVisible(false);
  };

  const renderFormFields = () => {
    const formName = getFormName();
    return (
      <View style={{flex: 1}}>
        <Formik
          innerRef={formRef}
          onSubmit={() => console.log('Submitting form...')}
          onReset={() => console.log('Resetting form...')}
          validate={values => validateForm({formName: formName, values: values})}
          initialValues={selectedFeature}
          initialStatus={{formName: formName}}
          enableReinitialize={true}
        >
          {formProps => (
            <>
              <GeoFieldsInputs geomFormRef={formRef}/>
              <Form {...{
                ...formProps,
                formName: formName,
                onMyChange: page.key === PAGE_KEYS.MINERALS
                  ? ((name, value) => onMineralChange(formRef.current, name, value))
                  : page.key === LITHOLOGY_SUBPAGES.LITHOLOGY
                    ? ((name, value) => onSedFormChange(formRef.current, name, value))
                    : page.key === PAGE_KEYS.SAMPLES
                      ? ((name, value) => onSampleFormChange(formRef.current, name, value))
                      : undefined
                ,
                getIsDisabled: getIsDisabled,
              }}/>
            </>
          )}
        </Formik>
        <Button
          titleStyle={{color: themes.RED}}
          title={'Delete ' + title + (isTemplate ? ' Template' : '')}
          type={'clear'}
          onPress={() => isTemplate ? deleteTemplate() : deleteFeatureConfirm()}
        />
      </View>
    );
  };

  const renderIGSNUploadCheckbox = () => {
    return (
      <View style={{justifyContent: 'flex-start', alignItems: 'center'}}>
        {!selectedFeature.isOnMySesar
          && (
            <Text style={sampleStyles.mySesarUpdateDisclaimer}>To upload to your MYSESAR account and obtain an IGSN
              check below:</Text>
          )
        }
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <CheckBox
            title={'Upload to MYSESAR'}
            checked={isIGSNChecked}
            checkedTitle={selectedFeature.isOnMySesar && 'On MYSESAR and IGSN assigned'}
            onPress={() => setIsIGSNChecked(!isIGSNChecked)}
            disabled={selectedFeature.isOnMySesar}
          />
          {isIGSNChecked && isEmpty(selectedUserCode) && <Icon
            reverse
            name={'warning-outline'}
            type={'ionicon'}
            color={'red'}
            size={10}
            onPress={() => alert('Sesar Code Required')}
          />}
        </View>
      </View>
    );
  };

  const renderNotesField = () => {
    return (
      <View style={{flex: 1}}>
        <NoteForm
          formRef={formRef}
          initialNotesValues={selectedFeature}
        />
        <Button
          titleStyle={{color: themes.RED}}
          title={'Delete ' + title + (isTemplate ? ' Template' : '')}
          type={'clear'}
          onPress={() => isTemplate ? deleteTemplate() : deleteFeatureConfirm()}
        />
      </View>
    );
  };

  const renderIGSNUserCodePicker = () => {
    return (
      <View style={{padding: 10, marginLeft: 20}}>
        {!selectedFeature?.isOnMySesar && <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
          <Text style={{fontSize: themes.MEDIUM_TEXT_SIZE, marginRight: 20}}>Sesar User Code:</Text>
          {!isEmpty(userCodes)
            && (
              <Button
            title={selectedUserCode}
            type={'clear'}
            iconRight
            icon={<Icon
              name={'chevron-down'}
              containerStyle={{paddingLeft: 5}}
              type={'ionicon'}
            />}
            disabled={selectedFeature.isOnMySesar}
            disabledTitleStyle={{color: themes.BLACK}}
            onPress={openPicker}
            titleStyle={{fontSize: themes.MEDIUM_TEXT_SIZE, color: themes.BLACK}}
          />
            )}
        </View>}
        <PickerOverlay
          isPickerVisible={isPickerVisible}
          data={[...userCodes, null]}
          onSelect={itemValue => dispatch(setSelectedUserCode(itemValue))}
          value={selectedUserCode}
          closePicker={closePicker}
          dividerText={'Select User Code'}
        />
      </View>
    );
  };

  const renderSesarUploadDisclosure = () => {
    if (!isInternetReachable) {
      return (
        <View style={{padding: 20}}>
          <Text style={sampleStyles.mySesarUpdateDisclaimer}>This sample has already been registered in your MYSESAR
            account with an IGSN number and needs to sync. You will need to be online make any updates.</Text>
        </View>
      );
    }
    else {
      return (
        <View style={{padding: 20}}>
          <Text style={sampleStyles.mySesarUpdateDisclaimer}>This sample has already been registered in your MYSESAR
            account. Any changes will be automatically updated. You may be prompted to sign into your MySesar
            account.</Text>
        </View>
      );
    }
  };

  const saveButtonOnPress = () => {
    isTemplate ? saveTemplateForm(formRef.current) : saveForm(formRef.current);
  };

  const saveFeature = async (formCurrent) => {
    try {
      await formCurrent.submitForm();
      const editedFeatureData = showErrors(formRef.current || formCurrent, isEmpty(formRef.current));
      console.log('Saving', page.label, 'data', editedFeatureData, 'to Spot', pageData);
      let editedPageData = pageData ? JSON.parse(JSON.stringify(pageData)) : [];
      editedPageData = editedPageData.filter(f => f.id !== editedFeatureData.id);
      editedPageData.push(editedFeatureData);
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(editedSpotProperties({field: pageKey, value: editedPageData}));

      if (page.key === PAGE_KEYS.SAMPLES && editedFeatureData.sample_id_name) {
        await checkSampleName(editedFeatureData.sample_id_name);
      }
    }
    catch (err) {
      console.log('Error saving', pageKey, err);
      throw Error;
    }
  };

  const saveForm = async (formCurrent) => {
    try {
      if (groupKey === 'pet') {
        await savePetFeature(pageKey, spot, formRef.current || formCurrent, isEmpty(formRef.current));
      }
      else if (groupKey === 'sed' && pageKey === 'bedding') {
        await saveSedBedFeature(pageKey, spot, formRef.current || formCurrent, isEmpty(formRef.current));
      }
      else if (groupKey === 'sed') {
        await saveSedFeature(pageKey, spot, formRef.current || formCurrent, isEmpty(formRef.current));
      }
      else {
        if (formCurrent?.values.isOnMySesar || isIGSNChecked) {
          setSelectedSample(formCurrent);
          setIsIGSNModalVisible(true);
        }
        else {
          await saveFeature(formCurrent);
          await formCurrent.resetForm();
          closeDetailView();
        }
      }
    }
    catch (err) {
      console.error('ERROR saving form', err);
    }
  };

  const onSampleSaved = async (formCurrent) => {
    console.log('Saving Sample To SESAR', formRef.current?.values);
    await saveFeature(formCurrent);
    closeDetailView();
  };

  const saveTemplateForm = async (formCurrent) => {
    await formCurrent.submitForm();
    const formValues = showErrors(formRef.current || formCurrent, isEmpty(formRef.current));
    saveTemplate(formValues);
  };

  return (
    <>
      {(isTemplate || !isEmpty(selectedFeature)) && (
        <>
          <SaveAndCancelButtons
            cancel={cancelForm}
            save={saveButtonOnPress}
            getIsDisabled={(!isInternetReachable && isIGSNChecked) || (isIGSNChecked && isEmpty(selectedUserCode))}
          />
          {page.key === PAGE_KEYS.SAMPLES && selectedFeature?.isOnMySesar && renderSesarUploadDisclosure()}
          {page.key === PAGE_KEYS.SAMPLES && isInternetReachable && renderIGSNUploadCheckbox()}
          {page.key === PAGE_KEYS.SAMPLES && isIGSNChecked && !isEmpty(userCodes) && renderIGSNUserCodePicker()}
          <FlatList
            ListHeaderComponent={page?.key === PAGE_KEYS.NOTES ? renderNotesField() : renderFormFields()}/>
        </>
      )}
      {isIGSNModalVisible && (
        <IGSNModal
          onModalCancel={() => setIsIGSNModalVisible(false)}
          onSampleSaved={onSampleSaved}
          ref={formRef}
        />
      )}
      <DeleteOverlay
        isVisible={isDeleteOverlayVisible}
        closeModal={() => setIsDeleteOverlayVisible(false)}
        deleteSample={deleteFeature}
      />
    </>
  );
};

export default BasicPageDetail;
