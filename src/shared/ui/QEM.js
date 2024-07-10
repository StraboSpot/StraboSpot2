import React, {useEffect, useRef} from 'react';
import {FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {Tab} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {useFormHook} from '../../modules/form';
import {setModalValues, setModalVisible} from '../../modules/home/home.slice';
import {updatedModifiedTimestampsBySpotsIds} from '../../modules/project/projects.slice';
import {editedSpotProperties} from '../../modules/spots/spots.slice';
import Modal from '../../shared/ui/modal/Modal';
import SaveAndCloseModalButtons from '../../shared/ui/SaveAndCloseModalButtons';
import {getNewUUID, toTitleCase} from '../Helpers';
import {
  PRIMARY_ACCENT_COLOR,
  PRIMARY_TEXT_COLOR,
  PRIMARY_TEXT_SIZE,
  SECONDARY_BACKGROUND_COLOR,
} from '../styles.constants';

const QEM = ({
               children,
               choicesViewKey,
               groupKey,
               onPress,
               pageKey,
               selectedTypeIndex,
               setChoicesViewKey,
               setSelectedTypeIndex,
               subpages,
             }) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const formRef = useRef(null);
  const useForm = useFormHook();

  useEffect(() => {
    console.log('UE QEM []');
    return () => dispatch(setModalValues({}));
  }, []);

  const renderQEM = () => {
    const formName = groupKey ? [groupKey, pageKey] : [pageKey, Object.values(subpages)[selectedTypeIndex]];

    return (
      <Modal
        closeModal={() => choicesViewKey ? setChoicesViewKey(null) : dispatch(setModalVisible({modal: null}))}
        buttonTitleRight={choicesViewKey && 'Done'}
        onPress={onPress}
      >
        {subpages && (
          <Tab
            indicatorStyle={{backgroundColor: PRIMARY_ACCENT_COLOR, height: 3}}
            onChange={setSelectedTypeIndex}
            value={selectedTypeIndex}
          >
            {Object.values(subpages).map((subpage, i) => (
              <Tab.Item
                buttonStyle={{backgroundColor: SECONDARY_BACKGROUND_COLOR, padding: 0}}
                containerStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
                key={subpage}
                title={toTitleCase(subpage.replace(/interval_/g, ' '))}
                titleProps={{numberOfLines: 1}}
                titleStyle={{color: PRIMARY_TEXT_COLOR, fontSize: PRIMARY_TEXT_SIZE, fontWeight: 'bold'}}
              />
            ))}
          </Tab>
        )}
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
                    {children(formProps)}
                    {/*{choicesViewKey ? renderFormFragment({formProps: formProps, formName: formName})*/}
                    {/*  : children(formProps)}*/}
                  </View>
                )}
              </Formik>
            </View>
          }
        />
        {!choicesViewKey && <SaveAndCloseModalButtons saveAction={save}/>}
      </Modal>
    );
  };

  // const renderFormFragment = ({formProps, formName}) => {
  //   const survey = useForm.getSurvey(formName);
  //   const relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
  //   return (
  //     <Form {...{formName: formName, surveyFragment: relevantFields, ...formProps}}/>
  //   );
  // };

  const save = async () => {
    try {
      await formRef.current.submitForm();
      const editedIndivAttributeData = useForm.showErrors(formRef.current);
      console.log('Saving', pageKey, 'data to Spot ...');
      let editedAllAttributesData = spot.properties[pageKey] ? JSON.parse(
        JSON.stringify(spot.properties[pageKey])) : [];
      editedAllAttributesData.push({...editedIndivAttributeData, id: getNewUUID()});
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(editedSpotProperties({field: pageKey, value: editedAllAttributesData}));
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  return renderQEM();
};

export default QEM;
