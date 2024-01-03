import React, {useRef, useState} from 'react';
import {FlatList, Switch, Text, View} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import styles from './images.styles';
import Modal from '../../shared/ui/modal/Modal';
import {Form, useFormHook} from '../form';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedSpotProperties, setSelectedAttributes} from '../spots/spots.slice';

const ImagePropertiesModal = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);
  const selectedImage = useSelector(state => state.spot.selectedAttributes[0]);

  const [annotated, setAnnotated] = useState(selectedImage.annotated);

  const useForm = useFormHook();

  const formRef = useRef(null);

  const renderFormFields = () => {
    const formName = ['general', 'images'];
    console.log('Rendering form:', formName.join('.'), 'with selected image:', selectedImage);
    return (
      <Formik
        innerRef={formRef}
        onSubmit={() => console.log('Submitting form...')}
        validate={values => useForm.validateForm({formName: formName, values: values})}
        component={formProps => Form({formName: formName, ...formProps})}
        initialValues={selectedImage}
        initialStatus={{formName: formName}}
      />
    );
  };

  const saveFormAndGo = async () => {
    try {
      await formRef.current.submitForm();
      const formValues = useForm.showErrors(formRef.current);
      const images = JSON.parse(JSON.stringify(spot.properties.images));
      console.log('Saving form data to Spot ...', formValues);
      let i = images.findIndex(img => img.id === formValues.id);
      images[i] = {...formValues, annotated: annotated};
      dispatch(setSelectedAttributes([images[i]]));
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(editedSpotProperties({field: 'images', value: images}));
      props.close();
      return Promise.resolve();
    }
    catch (e) {
      console.log('Error submitting form', e);
      return Promise.reject();
    }
  };

  return (
    <Modal
      title={'Image Properties'}
      buttonTitleLeft={'Cancel'}
      buttonTitleRight={'Save'}
      cancel={props.cancel}
      close={saveFormAndGo}
    >
      <FlatList
        ListHeaderComponent={renderFormFields()}
        ListFooterComponent={
          <View style={styles.switch}>
            <Text style={{marginLeft: 10, fontSize: 16}}>Use as Image-basemap</Text>
            <Switch
              onValueChange={a => setAnnotated(a)}
              value={annotated}
            />
          </View>
        }
      />
    </Modal>
  );
};

export default ImagePropertiesModal;
