import React, {useState, useRef} from 'react';
import {Text, Switch, View, FlatList} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {Form, useFormHook} from '../form';
import {editedSpotProperties, setSelectedAttributes} from '../spots/spots.slice';
import styles from './images.styles';

const ImagePropertiesModal = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);
  const selectedImage = useSelector(state => state.spot.selectedAttributes[0]);
  const [useForm] = useFormHook();
  const [annotated, setAnnotated] = useState(selectedImage.annotated);
  const form = useRef(null);

  // What happens after submitting the form is handled in saveFormAndGo since we want to show
  // an alert message if there are errors but this function won't be called if form is invalid
  const onSubmitForm = () => {
    console.log('In onSubmitForm');
  };

  const renderFormFields = () => {
    const formName = ['general', 'images'];
    console.log('Rendering form:', formName.join('.'), 'with selected image:', selectedImage);
    return (
      <Formik
        innerRef={form}
        onSubmit={onSubmitForm}
        validate={(values) => useForm.validateForm({formName: formName, values: values})}
        component={(formProps) => Form({formName: formName, ...formProps})}
        initialValues={selectedImage}
        validateOnChange={false}
      />
    );
  };

  const saveFormAndGo = async () => {
    if (form.current !== null) {
      await form.current.submitForm();
      if (useForm.hasErrors(form.current)) useForm.showErrors(form.current);
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
      style={{...uiStyles.modalPosition, left: undefined, right: 100}}
    >
      <View>
        <FlatList
          contentContainerStyle={{paddingBottom: 40}}
          ListHeaderComponent={renderFormFields()}
          ListFooterComponent={
            <View style={styles.switch}>
              <Text style={{marginLeft: 10, fontSize: 16}}>Use as Image-basemap</Text>
              <Switch
                onValueChange={(a) => setAnnotated(a)}
                value={annotated}
              />
            </View>
          }
        />
      </View>
    </Modal>
  );
};

export default ImagePropertiesModal;
