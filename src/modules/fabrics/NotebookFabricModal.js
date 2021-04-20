import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';

import {Field, Formik} from 'formik';
import {Button, ButtonGroup, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewId, isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_ACCENT_COLOR, PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {Form, LABEL_DICTIONARY, TextInputField, useFormHook, formStyles} from '../form';
import {editedSpotProperties} from '../spots/spots.slice';
import FaultRockFabric from './FaultRockFabric';

const NotebookFabricModal = (props) => {
  const [useForm] = useFormHook();

  const dispatch = useDispatch();
  const modalValues = useSelector(state => state.home.modalValues);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [survey, setSurvey] = useState({});
  const [choices, setChoices] = useState({});

  const formRef = useRef(null);

  const fabricsDictionary = Object.values(LABEL_DICTIONARY.fabrics).reduce(
    (acc, form) => ({...acc, ...form}), {});
  const types = ['fault_rock', 'igneous_rock', 'metamorphic_rock'];

  useEffect(() => {
    const initialValues = isEmpty(modalValues) ? {id: getNewId(), type: 'fault_rock'} : modalValues;
    formRef.current?.setValues(initialValues);
    setSelectedTypeIndex(types.indexOf(initialValues.type));
    const defaultFormName = ['fabrics', initialValues.type];
    setSurvey(useForm.getSurvey(initialValues.type ? ['fabrics', initialValues.type] : defaultFormName));
    setChoices(useForm.getChoices(initialValues.type ? ['fabrics', initialValues.type] : defaultFormName));
  }, [modalValues]);

  const getLabel = (key) => {
    if (Array.isArray(key)) {
      const labelsArr = key.map(val => fabricsDictionary[val] || val);
      return labelsArr.join(', ');
    }
    return fabricsDictionary[key] || key.toString().replace('_', ' ');
  };

  const onFabricTypePress = (i) => {
    setSelectedTypeIndex(i);
    const type = types[i];
    const formName = ['fabrics', type];
    formRef.current?.setFieldValue('type', type);
    setSurvey(useForm.getSurvey(formName));
    setChoices(useForm.getChoices(formName));
  };

  const renderSubform = (formProps) => {
    const relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
    return (
      <Form {...{
        formName: ['fabrics', formRef.current?.values?.type],
        surveyFragment: relevantFields, ...formProps,
      }}/>
    );
  };

  const renderForm = () => {
    return (
      <React.Fragment>
        <ButtonGroup
          selectedIndex={selectedTypeIndex}
          onPress={onFabricTypePress}
          buttons={['Fault', 'Igneous', 'Metam.']}
          containerStyle={{height: 40, borderRadius: 10}}
          buttonStyle={{padding: 5}}
          textStyle={{color: PRIMARY_TEXT_COLOR}}
        />
        <ListItem containerStyle={commonStyles.listItemFormField}>
          <ListItem.Content>
            <Field
              component={TextInputField}
              name={'label'}
              label={'Label'}
              key={'label'}
            />
          </ListItem.Content>
        </ListItem>
        <FlatListItemSeparator/>
        {formRef.current?.values?.type === 'fault_rock' && (
          <FaultRockFabric
            formRef={formRef}
            survey={survey}
            choices={choices}
            getLabel={getLabel}
            setChoicesViewKey={setChoicesViewKey}
          />
        )}
      </React.Fragment>
    );
  };

  const renderNotebookFabricModalContent = () => {
    return (
      <Modal
        close={props.close}
        textStyle={{fontWeight: 'bold'}}
        onPress={props.onPress}
        style={uiStyles.modalPosition}
      >
        <React.Fragment>
          <FlatList
            bounces={false}
            ListHeaderComponent={
              <View style={{flex: 1}}>
                <Formik
                  innerRef={formRef}
                  initialValues={{}}
                  onSubmit={(values) => console.log('Submitting form...', values)}
                  // validate={(item) => console.log(item, formRef)}
                  // validateOnChange={true}
                  // enableReinitialize={true}
                >
                  {(formProps) => (
                    <View style={{flex: 1}}>
                      {choicesViewKey ? renderSubform(formProps) : renderForm()}
                    </View>
                  )}
                </Formik>
              </View>
            }
          />
        </React.Fragment>
        {choicesViewKey ? (
            <Button
              titleStyle={{color: PRIMARY_ACCENT_COLOR}}
              title={'Done'}
              type={'save'}
              onPress={() => setChoicesViewKey(null)}
            />
          )
          : <SaveButton title={'Save Fabric'} onPress={saveFabric}/>}
      </Modal>
    );
  };

  const saveFabric = async () => {
    try {
      await formRef.current.submitForm();
      if (useForm.hasErrors(formRef.current)) {
        useForm.showErrors(formRef.current);
        throw Error;
      }
      let editedFabricData = formRef.current.values;
      console.log('Saving fabic data to Spot ...');
      let editedFabricsData = spot.properties.fabrics ? JSON.parse(JSON.stringify(spot.properties.fabrics)) : [];
      editedFabricsData.push({...editedFabricData, id: getNewId()});
      dispatch(editedSpotProperties({field: 'fabrics', value: editedFabricsData}));
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  if (Platform.OS === 'android') return renderNotebookFabricModalContent();
  else return <DragAnimation>{renderNotebookFabricModalContent()}</DragAnimation>;
};

export default NotebookFabricModal;
