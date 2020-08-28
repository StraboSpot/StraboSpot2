import React, {useState, useRef} from 'react';
import {Text, TextInput, Switch, ScrollView, View, FlatList} from 'react-native';

import {Formik} from 'formik';
import {Button, Input} from 'react-native-elements';
import {connect} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import Modal from '../../shared/ui/modal/Modal';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, useFormHook} from '../form';
import {homeReducers} from '../home/home.constants';
import {notebookReducers} from '../notebook-panel/notebook.constants';
import {spotReducers} from '../spots/spot.constants';
import styles from './images.styles';

const ImagePropertiesModal = (props) => {
  const [useForm] = useFormHook();
  const [name, setName] = useState(props.selectedImage.title);
  const [description, setDescription] = useState(props.selectedImage.caption);
  const [annotated, setAnnotated] = useState(props.selectedImage.annotated);
  const [showMoreFields, setShowMoreFields] = useState(false);
  const form = useRef(null);

  const renderMoreFields = () => {
    const {width, height} = props.getDeviceDims;
    if (width > height) {
      return (
        <View>
          <FlatList
            ListHeaderComponent={
              <View style={{height: 425}}>
                {renderFormFields()}
              </View>
            }
            scrollEnabled={false}
            />
          <Button
            title={'Show fewer fields'}
            type={'clear'}
            titleStyle={{color: 'blue', fontSize: 14}}
            onPress={() => fieldButtonHandler()}
          />
        </View>
      );
    }
    else {
      return (
        <View>
          <View>
            {renderFormFields()}
          </View>
          <Button
            title={'Show fewer fields'}
            type={'clear'}
            titleStyle={{color: 'blue', fontSize: 14}}
            onPress={() => fieldButtonHandler()}
          />
        </View>
      );
    }
  };


  const renderLessFields = () => (
    <View>
      <Button
        title={'Show more fields'}
        type={'clear'}
        titleStyle={{color: 'blue', fontSize: 14}}
        onPress={() => fieldButtonHandler()}
      />
    </View>
  );

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

  const fieldButtonHandler = () => {
    setShowMoreFields(!showMoreFields);
  };

  const renderFormFields = () => {
    const formName = ['general', 'images'];
    console.log('Rendering form:', formName.join('.'), 'with selected image:', props.selectedImage);
    return (
      <View style={{flex: 1}}>
        <SectionDivider dividerText='Feature Type'/>
        <ScrollView>
          <Formik
            innerRef={form}
            onSubmit={onSubmitForm}
            validate={(values) => useForm.validateForm({formName: formName, values: values})}
            component={(formProps) => Form({formName: formName, ...formProps})}
            initialValues={props.selectedImage}
            validateOnChange={false}
          />
        </ScrollView>
      </View>
    );
  };

  const saveFormAndGo = () => {
    if (isEmpty(name) && props.selectedImage.hasOwnProperty('title')) delete props.selectedImage.title;
    else if (!isEmpty(name)) props.selectedImage.title = name;
    if (isEmpty(description) && props.selectedImage.hasOwnProperty('caption')) delete props.selectedImage.caption;
    else if (!isEmpty(description)) props.selectedImage.caption = description;
    if (isEmpty(annotated) && props.selectedImage.hasOwnProperty('annotated')) delete props.selectedImage.annotated;
    else if (!isEmpty(annotated)) props.selectedImage.annotated = annotated;
    console.log('Saving form data to Spot ...', props.selectedImage);
    let images = props.spot.properties.images;
    let i = images.findIndex(img => img.id === props.selectedImage.id);
    images[i] = props.selectedImage;
    props.onSpotEdit('images', images);
    props.setSelectedAttributes([images[i]]);

    if (form.current !== null) {
      form.current.submitForm().then(() => {
          if (useForm.hasErrors(form)) useForm.showErrors(form);
          else {
            console.log('Saving form data to Spot ...', form.current.values);
            images = props.spot.properties.images;
            i = images.findIndex(img => img.id === form.current.values.id);
            images[i] = form.current.values;
            props.onSpotEdit('images', images);
            props.setSelectedAttributes([images[i]]);
            props.close();
          }
        },
      );
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
      modalStyle={{opacity: 1, width: 350}}
    >
      <View>
        <Input
          placeholder={'Image Name'}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          onChangeText={(text) => setName(text)}
          value={name}
        />
        <View style={styles.textboxContainer}>
          <TextInput
            placeholder={'Description'}
            maxLength={120}
            multiline={true}
            numberOfLines={4}
            style={styles.textbox}
            onChangeText={(text) => setDescription(text)}
            value={description}
          />
        </View>
        <View style={styles.button}>
          {showMoreFields ? renderMoreFields() : renderLessFields()}
        </View>
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

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
    selectedImage: state.spot.selectedAttributes[0],
    getDeviceDims: state.home.deviceDimensions,
  };
}

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setNotebookPageVisibleToPrev: () => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE_TO_PREV}),
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
  setDeviceDims: (height, width) => ({type: homeReducers.DEVICE_DIMENSIONS, height: height, width: width}),
};

export default connect(mapStateToProps, mapDispatchToProps)(ImagePropertiesModal);
