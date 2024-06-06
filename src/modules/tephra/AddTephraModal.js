import React, {useEffect, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {TEPHRA_SUBPAGES} from './tephra.constants';
import {getNewUUID, toTitleCase} from '../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR, PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import Modal from '../../shared/ui/modal/Modal';
import SaveAndCloseModalButtons from '../../shared/ui/SaveAndCloseModalButtons';
import {Form, useFormHook} from '../form';
import {setModalValues, setModalVisible} from '../home/home.slice';
import {PAGE_KEYS} from '../page/page.constants';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedSpotProperties} from '../spots/spots.slice';

const AddTephraModal = ({onPress}) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [choicesViewKey, setChoicesViewKey] = useState(null);

  const formRef = useRef(null);
  const useForm = useFormHook();

  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);

  const pageKey = PAGE_KEYS.TEPHRA;

  useEffect(() => {
    console.log('UE AddTephraModal []');
    return () => dispatch(setModalValues({}));
  }, []);

  const renderNotebookTephraModal = () => {
    const subpages = TEPHRA_SUBPAGES;
    const formName = [pageKey, Object.values(subpages)[selectedTypeIndex]];
    return (
      <Modal
        closeModal={() => choicesViewKey ? setChoicesViewKey(null) : dispatch(setModalVisible({modal: null}))}
        buttonTitleRight={choicesViewKey && 'Done'}
        onPress={onPress}
      >
        <ButtonGroup
          selectedIndex={selectedTypeIndex}
          onPress={i => setSelectedTypeIndex(i)}
          buttons={Object.values(subpages).map(v => toTitleCase(v.replace(/interval_/g, ' ')))}
          containerStyle={{height: 40, borderRadius: 10}}
          buttonStyle={{padding: 5}}
          selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
          textStyle={{color: PRIMARY_TEXT_COLOR}}
        />
        <FlatList
          bounces={false}
          ListHeaderComponent={
            <View style={{flex: 1}}>
              <Formik
                innerRef={formRef}
                initialValues={{}}
                onSubmit={values => console.log('Submitting form...', values)}
                validate={values => useForm.validateForm({formName: formName, values: values})}
                validateOnChange={false}
              >
                {formProps => (
                  <View style={{flex: 1}}>
                    <Form {...{formName: formName, ...formProps}}/>
                  </View>
                )}
              </Formik>
            </View>
          }
        />
        {!choicesViewKey && <SaveAndCloseModalButtons saveAction={saveTephra}/>}
      </Modal>
    );
  };

  const saveTephra = async () => {
    try {
      await formRef.current.submitForm();
      const editedTephraLayerData = useForm.showErrors(formRef.current);
      console.log('Saving tephra data to Spot ...');
      let editedTephraLayersData = spot.properties.tephra ? JSON.parse(
        JSON.stringify(spot.properties.tephra)) : [];
      editedTephraLayersData.push({...editedTephraLayerData, id: getNewUUID()});
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(editedSpotProperties({field: pageKey, value: editedTephraLayersData}));
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  return renderNotebookTephraModal();
};

export default AddTephraModal;
