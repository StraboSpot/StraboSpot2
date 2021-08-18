import React, {useRef} from 'react';
import {FlatList, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {DateInputField, NumberInputField, TextInputField, useFormHook} from '../form';
import {setNotebookPageVisibleToPrev} from '../notebook-panel/notebook.slice';
import {addedSpot} from '../spots/spots.slice';

const Metadata = () => {
  const [useForm] = useFormHook();

  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const metadataFormRef = useRef(null);

  const cancelFormAndGo = () => {
    dispatch(setNotebookPageVisibleToPrev());
  };

  const renderCancelSaveButtons = () => {
    return (
      <View>
        <SaveAndCloseButton
          cancel={() => cancelFormAndGo()}
          save={() => saveFormAndGo()}
        />
      </View>
    );
  };

  const renderMetadataForm = () => {
    return (
      <Formik
        initialValues={spot.properties}
        onSubmit={(values) => console.log('Submitting form...', values)}
        innerRef={metadataFormRef}
      >
        {(formProps) => (
          <View>
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content>
                <Field
                  component={TextInputField}
                  name={'name'}
                  label={'Name'}
                  key={'name'}
                />
              </ListItem.Content>
            </ListItem>
            <FlatListItemSeparator/>
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content>
                <Field
                  component={NumberInputField}
                  name={'id'}
                  label={'ID'}
                  key={'id'}
                  editable={false}
                />
              </ListItem.Content>
            </ListItem>
            <FlatListItemSeparator/>
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content>
                <Field
                  component={DateInputField}
                  name={'date'}
                  label={'Date Created'}
                  key={'date'}
                  isDisplayOnly={true}
                  isShowTime={true}
                />
              </ListItem.Content>
            </ListItem>
            <FlatListItemSeparator/>
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content>
                <Field
                  component={DateInputField}
                  name={'modified_timestamp'}
                  label={'Date Last Modified'}
                  key={'modified_timestamp'}
                  isDisplayOnly={true}
                  isShowTime={true}
                />
              </ListItem.Content>
            </ListItem>
          </View>
        )}
      </Formik>
    );
  };

  const saveForm = async () => {
    try {
      await metadataFormRef.current.submitForm();
      if (useForm.hasErrors(metadataFormRef.current)) {
        useForm.showErrors(metadataFormRef.current);
        return Promise.reject();
      }
      else {
        console.log('Saving form data to Spot ...');
        let editedSpotProperties = metadataFormRef.current.values;
        dispatch(addedSpot({...spot, properties: editedSpotProperties}));
        return Promise.resolve();
      }
    }
    catch (e) {
      console.log('Error submitting form', e);
      return Promise.reject();
    }
  };

  const saveFormAndGo = () => {
    saveForm().then(() => {
      console.log('Finished saving form data to Spot');
      dispatch(setNotebookPageVisibleToPrev());
    }, () => {
      console.log('Error saving form data to Spot');
    });
  };

  return (
    <React.Fragment>
      {renderCancelSaveButtons()}
      <FlatList
        ListHeaderComponent={
          <React.Fragment>
            <SectionDivider dividerText='Metadata'/>
            {renderMetadataForm()}
          </React.Fragment>
        }
      />
    </React.Fragment>
  );
};

export default Metadata;
