import React, {useRef} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {DateInputField, NumberInputField, TextInputField, useFormHook} from '../form';
import {setNotebookPageVisibleToPrev} from '../notebook-panel/notebook.slice';
import {
  addedSpotsIdsToDataset,
  deletedSpotIdFromDataset,
  updatedModifiedTimestampsBySpotsIds,
} from '../project/projects.slice';
import {editedOrCreatedSpot} from '../spots/spots.slice';

const Metadata = () => {
  const [useForm] = useFormHook();

  const dispatch = useDispatch();
  const datasets = useSelector(state => state.project.datasets);
  const spot = useSelector(state => state.spot.selectedSpot);

  const metadataFormRef = useRef(null);

  const cancelFormAndGo = () => {
    dispatch(setNotebookPageVisibleToPrev());
  };

  const handleDatasetChecked = (datasetChecked) => {
    const datasetsWithThisSpot = Object.values(datasets).reduce((acc, dataset) => {
      return dataset.spotIds.includes(spot.properties.id) ? [...acc, dataset.id] : acc;
    }, []);

    if (datasetsWithThisSpot.length === 1 && datasetsWithThisSpot.includes(datasetChecked.id)) {
      Alert.alert('Unable to Remove Spot from Dataset', 'One dataset must remain checked.');
    }
    else {
      if (datasetChecked.spotIds.includes(spot.properties.id)) {
        dispatch(deletedSpotIdFromDataset({datasetId: datasetChecked.id, spotId: spot.properties.id}));
      }
      else dispatch(addedSpotsIdsToDataset({datasetId: datasetChecked.id, spotIds: [spot.properties.id]}));
    }
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
        onSubmit={values => console.log('Submitting form...', values)}
        innerRef={metadataFormRef}
        enableReinitialize={true}
      >
        {formProps => (
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

  const renderDatasetItem = (dataset) => {
    const isChecked = dataset.spotIds?.includes(spot.properties.id);
    return (
      <ListItem key={dataset.id.toString()} containerStyle={commonStyles.listItem}>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{dataset.name}</ListItem.Title>
          <ListItem.Subtitle>
            {dataset.spotIds
              ? `(${dataset.spotIds.length} spot${dataset.spotIds.length !== 1 ? 's' : ''})`
              : '(0 spots)'}
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.CheckBox
          checked={isChecked}
          onPress={() => handleDatasetChecked(dataset)}
          disabled={true}     // Disabled changing datasets until server can handle it
        />
      </ListItem>
    );
  };

  const renderDatasets = () => {
    return (
      <React.Fragment>
        <SectionDivider dividerText={'Datasets'}/>
        <FlatList
          data={Object.values(datasets)}
          renderItem={({item}) => renderDatasetItem(item)}
        />
      </React.Fragment>
    );
  };

  const saveForm = async () => {
    try {
      await metadataFormRef.current.submitForm();
      const editedSpotProperties = useForm.showErrors(metadataFormRef.current);
      console.log('Saving form data to Spot ...');
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(editedOrCreatedSpot({...spot, properties: editedSpotProperties}));
      return Promise.resolve();
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
            <SectionDivider dividerText={'Metadata'}/>
            {renderMetadataForm()}
            {renderDatasets()}
          </React.Fragment>
        }
      />
    </React.Fragment>
  );
};

export default Metadata;
