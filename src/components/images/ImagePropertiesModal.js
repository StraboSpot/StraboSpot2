import React, {useState, useRef} from 'react';
import {Text, TextInput, Switch, ScrollView, View} from 'react-native';
import {connect} from "react-redux";
import {Formik} from 'formik';
import FormView from "../form/Form.view";
import {getForm, hasErrors, setForm, showErrors, validateForm} from "../form/form.container";

import {Button, Input} from "react-native-elements";
import styles from './images.styles';
import Modal from '../../shared/ui/modal/Modal.view';
import {spotReducers} from "../../spots/Spot.constants";
import {notebookReducers} from "../notebook-panel/Notebook.constants";
import {formReducers} from "../form/Form.constant";
import {isEmpty} from "../../shared/Helpers";
import SectionDivider from "../../shared/ui/SectionDivider";

const imagePropertiesModal = (props) => {

  const [name, setName] = useState(props.formData.title);
  const [description, setDescription] = useState(props.formData.caption);
  const [switchPosition, setSwitchPosition] = useState(false);
  const [showMoreFields, setShowMoreFields] = useState(false);
  const form = useRef(null);

  const renderMoreFields = () => (
    <View>
      <ScrollView>
        {renderFormFields()}
      </ScrollView>
      <Button
        title={'Show fewer fields'}
        type={'clear'}
        titleStyle={{color: 'blue', fontSize: 14}}
        onPress={() => fieldButtonHandler()}
      />
    </View>

  );


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
    // if (hasErrors(form)) showErrors(form);
    // else {
    //   console.log('Saving form data to Spot ...', form.current.state.values);
    //   let images = props.spot.properties.images;
    //   const i = images.findIndex(imageId => imageId.id === form.current.state.values.id);
    //   images[i] = form.current.state.values;
    //   props.onSpotEdit('images', images);
    //   props.close();
    // }
  };

  const fieldButtonHandler = () => {
    setShowMoreFields(!showMoreFields);
  };

  const renderFormFields = () => {
    console.log('form-data', props.formData);
    if (!isEmpty(getForm())) {
      return (
        <View>
          <SectionDivider dividerText='Feature Type'/>
          <View>
            <Formik
              ref={form}
              onSubmit={onSubmitForm}
              validate={validateForm}
              component={FormView}
              initialValues={props.formData}
              validateOnChange={false}
            />
          </View>
        </View>
      );
    }
  };

  const saveFormAndGo = () => {
    if (isEmpty(name) && props.formData.hasOwnProperty('title')) delete props.formData.title;
    else if (!isEmpty(name)) props.formData.title = name;
    if (isEmpty(description) && props.formData.hasOwnProperty('caption')) delete props.formData.caption;
    else if (!isEmpty(description)) props.formData.caption = description;
    console.log('Saving form data to Spot ...', props.formData);
    let images = props.spot.properties.images;
    const i = images.findIndex(imageId => imageId.id === props.formData.id);
    images[i] = props.formData;
    props.onSpotEdit('images', images);
    props.setFormData(images[i]);

    if (form.current !== null) {
      if (!isEmpty(getForm())) form.current.submitForm()
        .then(() => {
            if (hasErrors(form)) showErrors(form);
            else {
              console.log('Saving form data to Spot ...', form.current.state.values);
              let images = props.spot.properties.images;
              const i = images.findIndex(imageId => imageId.id === form.current.state.values.id);
              images[i] = form.current.state.values;
              props.onSpotEdit('images', images);
              props.setFormData(images[i]);
              props.close();
            }
          }
        )
    }
    else props.close();
  };

  return (
    <Modal
      component={<View style={{flex: 1}}>
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
          <Text style={{marginLeft: 25, fontSize: 16}}>Use as basemap</Text>
          <Switch
            onValueChange={() => setSwitchPosition(!switchPosition)}
            value={switchPosition}
          />
        </View>
      </View>}
      close={() => saveFormAndGo()}
      style={styles.modalContainer}
      modalStyle={{opacity: 1, width: 350}}
    />
  );
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
    formData: state.form.formData
  }
}

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setNotebookPageVisibleToPrev: () => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE_TO_PREV}),
  setFormData: (formData) => ({type: formReducers.SET_FORM_DATA, formData: formData})
};

export default connect(mapStateToProps, mapDispatchToProps)(imagePropertiesModal);
