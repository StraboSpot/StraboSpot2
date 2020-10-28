import React, {useState, useRef} from 'react';
import {Text, Switch, ScrollView, View} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import Modal from '../../shared/ui/modal/Modal';
import {Form, useFormHook} from '../form';
import {spotReducers} from '../spots/spot.constants';
import {editedSpotProperties, setSelectedAttributes} from '../spots/spots.slice';
import styles from './images.styles';

const ImagePropertiesModal = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);
  const selectedImage = useSelector(state => state.spot.selectedAttributes[0]);
  const [useForm] = useFormHook();
  const [annotated, setAnnotated] = useState(selectedImage.annotated);
  const form = useRef(null);

  const onSubmitForm = () => {
    // if (useForm.hasErrors(form)) useForm.showErrors(form);
    // else {
    //   console.log('Saving form data to Spot ...', form.current.values);
    //   let images = props.spot.properties.images;
    //   const i = images.findIndex(imageId => imageId.id === form.current.values.id);
    //   images[i] = form.current.values;
    //   props.onSpotEdit('images', images);
    //   props.close();
    // }
  };

  const renderFormFields = () => {
    const formName = ['general', 'images'];
    console.log('Rendering form:', formName.join('.'), 'with selected image:', selectedImage);
    return (
      <View style={{flex: 0, maxHeight: 700}}>
        <ScrollView>
          <Formik
            innerRef={form}
            onSubmit={onSubmitForm}
            validate={(values) => useForm.validateForm({formName: formName, values: values})}
            component={(formProps) => Form({formName: formName, ...formProps})}
            initialValues={selectedImage}
            validateOnChange={false}
          />
        </ScrollView>
      </View>
    );
  };

  const saveFormAndGo = async () => {
    if (form.current !== null) {
      await form.current.submitForm();
      if (useForm.hasErrors(form)) useForm.showErrors(form);
      else {
        const images = JSON.parse(JSON.stringify(spot.properties.images));
        console.log('Saving form data to Spot ...', form.current.values);
        let i = images.findIndex(img => img.id === form.current.values.id);
        images[i] = {...form.current.values, annotated: annotated};
        dispatch(setSelectedAttributes([images[i]]));
        dispatch(editedSpotProperties({field: 'images', value: images}));
        props.close();
      }
    }
    props.close();
  };

  return (
    <Modal
      title={'Save'}
      buttonTitleLeft={'Cancel'}
      cancel={props.cancel}
      close={() => saveFormAndGo()}
      style={styles.modalContainer}
    >
      <View>
        {renderFormFields()}
        <View style={styles.switch}>
          <Text style={{marginLeft: 10, fontSize: 16}}>Use as Image-basemap</Text>
          <Switch
            onValueChange={(annotated) => setAnnotated(annotated)}
            value={annotated}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ImagePropertiesModal;
