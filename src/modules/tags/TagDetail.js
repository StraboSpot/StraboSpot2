import React, {useRef, useState} from 'react';
import {FlatList, ScrollView, Text, TextInput, View} from 'react-native';

import {Formik} from 'formik';
import {Button, ListItem} from 'react-native-elements';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {toTitleCase, getDimensions, isEmpty} from '../../shared/Helpers';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {Form, formStyles, useFormHook} from '../form';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {projectReducers} from '../project/project.constants';
import useSpotsHook from '../spots/useSpots';
import {tagsStyles, tagTypes, useTagsHook} from '../tags';

const TagDetail = () => {
  const [useForm] = useFormHook();
  const [useTags] = useTagsHook();
  const [useSpots] = useSpotsHook();

  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const tags = useSelector(state => state.project.project.tags);

  const [tagName, setTagName] = useState(selectedTag && selectedTag.name ? selectedTag.name : 'Undefined');
  const [isDetailModalVisibile, setIsDetailModalVisible] = useState(false);
  const form = useRef(null);

  // What happens after submitting the form is handled in saveFormAndClose since we want to show
  // an alert message if there are errors but this function won't be called if form is invalid
  const onSubmitForm = () => {
    console.log('In onSubmitForm');
  };

  const renderCancelSaveButtons = () => {
    return (
      <View>
        <SaveAndCloseButton
          cancel={() => setIsDetailModalVisible(false)}
          save={() => saveFormAndClose()}
        />
      </View>
    );
  };

  const renderTagForm = () => {
    const formName = ['project', 'tags'];
    console.log('Rendering form: tag', selectedTag);
    return (
      <View style={{flex: 1}}>
        <Formik
          innerRef={form}
          onSubmit={onSubmitForm}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          component={(formProps) => Form({formName: formName, ...formProps})}
          initialValues={selectedTag}
          validateOnChange={false}
          enableReinitialize={true}
        />
      </View>
    );
  };

  const renderSpots = (spot, i) => {
    const spotData = useSpots.getSpotById(spot);
    if (!isEmpty(spotData)) {
      return (
        <ListItem
          title={spotData.properties.name}
          bottomDivider={i < selectedTag.spots.length - 1}
        />
      );
    }
  };

  const renderTagInfo = () => {
    let str = selectedTag.type;
    str = str.split('_').join(' ');
    const titleCase = toTitleCase(str);
    return (
      <View>
        <View style={tagsStyles.sectionContainer}>
          <View>
            <ListItem
              title={'Name'}
              titleStyle={commonStyles.listItemTitle}
              rightElement={
                <TextInput
                  defaultValue={!isEmpty(selectedTag) && selectedTag.name}
                  onChangeText={(text) => setTagName(text)}
                  onBlur={() => useTags.save(selectedTag.id, tagName)}
                  style={tagsStyles.listText}
                />
              }
              bottomDivider
            />
            <ListItem
              title={'Type'}
              titleStyle={commonStyles.listItemTitle}
              bottomDivider
              rightElement={
                <Text style={tagsStyles.listText}>{titleCase}</Text>
              }
            />
            {renderTypeFields(selectedTag.concept_type)}
            <ListItem
              title={'Notes'}
              titleStyle={commonStyles.listItemTitle}
              rightElement={
                <TextInput
                  multiline={true}
                  placeholder={'No Notes'}
                  editable={false}
                  numberOfLines={5}
                  style={{flex: 2, minHeight: 50, maxHeight: 100}}
                  defaultValue={selectedTag && selectedTag.notes}
                />
              }
            />
          </View>
        </View>
      </View>
    );
  };

  const renderTaggedSpots = () => {
    const height = getDimensions().height;
    return (
      <View style={[tagsStyles.sectionContainer, {maxHeight: height * 0.40}]}>
        <ScrollView>
          {selectedTag && selectedTag.spots ?
            selectedTag.spots.map((spotId, index) => {
              return <View key={spotId}>{renderSpots(spotId, index)}</View>;
            }) : <Text>No Spots</Text>}
        </ScrollView>
      </View>
    );
  };

  const renderTypeFields = (type) => {
    if (type) {
      const titleCaseName = type.split('_').join(' ');
      switch (selectedTag.type) {
        case tagTypes.CONCEPT || tagTypes.DOCUMENTATION:
          return <ListItem
            titleStyle={{...commonStyles.listItemTitle, fontSize: 15}}
            title={'Concept Type'}
            bottomDivider
            rightElement={
              <Text style={tagsStyles.listText}>{toTitleCase(titleCaseName)}</Text>
            }
          />;
        default:
          return null;
      }
    }
  };

  const saveForm = async () => {
    try {
      await form.current.submitForm();
      if (useForm.hasErrors(form)) {
        useForm.showErrors(form);
        return Promise.reject();
      }
      else {
        console.log('Saving tag data to Project ...');
        console.log('Form values', form.current.values);
        let updatedTags = tags.filter(tag => tag.id !== selectedTag.id);
        updatedTags.push(form.current.values);
        dispatch({type: projectReducers.UPDATE_PROJECT, field: 'tags', value: updatedTags});
        return Promise.resolve();
      }
    }
    catch (e) {
      console.log('Error submitting form', e);
      return Promise.reject();
    }
  };

  const saveFormAndClose = () => {
    saveForm().then(() => {
      console.log('Finished saving tag data');
      setIsDetailModalVisible(false);
    }, () => {
      console.log('Error saving tag data');
    });
  };

  return (
    <React.Fragment>
      <SidePanelHeader
        backButton={() => dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false})}
        title={'Tags'}
        headerTitle={!isEmpty(selectedTag) && selectedTag.name}
      />
      <View style={{flex: 5, paddingTop: 10}}>
        <FlatList
          ListHeaderComponent={
            <View>
              <View>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                  <Divider sectionText={'Tag Info'}/>
                  <Button
                    title={'view/edit'}
                    type={'clear'}
                    titleStyle={commonStyles.standardButtonText}
                    onPress={() => setIsDetailModalVisible(true)}/>
                </View>
                {selectedTag && renderTagInfo()}
              </View>
              <View>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                  <Divider sectionText={'Tagged Spots'}/>
                  <Button
                    title={'add/remove'}
                    type={'clear'}
                    titleStyle={commonStyles.standardButtonText}
                    onPress={() => dispatch({
                      type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE,
                      bool: true,
                      view: settingPanelReducers.SET_SIDE_PANEL_VIEW.TAG_ADD_REMOVE_SPOTS,
                    })}/>
                </View>
                {selectedTag && renderTaggedSpots()}
              </View>
            </View>}
        />
      </View>
      <Dialog
        dialogTitle={<DialogTitle title={!isEmpty(selectedTag) && selectedTag.name}/>}
        visible={isDetailModalVisibile}
        width={350}
        dialogStyle={tagsStyles.modalView}>
        <DialogContent>
          {renderCancelSaveButtons()}
          <ScrollView style={formStyles.formContainer}>
            {renderTagForm()}
          </ScrollView>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default TagDetail;
