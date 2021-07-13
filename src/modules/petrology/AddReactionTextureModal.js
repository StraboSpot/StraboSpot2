import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import {Form, useFormHook} from '../form';
import {setModalValues} from '../home/home.slice';
import {PAGE_KEYS} from '../page/page.constants';
import usePetrologyHook from './usePetrology';

const AddReactionTextureModal = () => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [choicesViewKey, setChoicesViewKey] = useState(null);

  const formRef = useRef(null);

  const [useForm] = useFormHook();
  const usePetrology = usePetrologyHook();

  const petKey = PAGE_KEYS.REACTIONS;
  const formName = ['pet', petKey];
  const survey = useForm.getSurvey(formName);

  useEffect(() => {
    return () => dispatch(setModalValues({}));
  }, []);

  const renderAddReactionTextureModalContent = () => {
    return (
      <Modal>
        <React.Fragment>
          <FlatList
            bounces={false}
            ListHeaderComponent={
              <View style={{flex: 1}}>
                <Formik
                  innerRef={formRef}
                  initialValues={{id: getNewId()}}
                  onSubmit={(values) => console.log('Submitting form...', values)}
                >
                  {(formProps) => (
                    <View style={{flex: 1}}>
                      {choicesViewKey ? renderSubform(formProps) : renderForm(formProps)}
                    </View>
                  )}
                </Formik>
              </View>
            }
          />
        </React.Fragment>
        {choicesViewKey ? renderDoneButton() : renderSaveButton()}
      </Modal>
    );
  };

  const renderDoneButton = () => (
    <Button
      titleStyle={{color: PRIMARY_ACCENT_COLOR}}
      title={'Done'}
      type={'save'}
      onPress={() => setChoicesViewKey(null)}
    />
  );

  const renderForm = (formProps) => {
    return (
      <React.Fragment>
        <Form
          {...{
            formName: formName,
            ...formProps,
          }}
        />
      </React.Fragment>
    );
  };

  const renderSaveButton = () => (
    <SaveButton
      title={'Save Reaction Texture'}
      onPress={saveReactionTexture}
    />
  );

  const renderSubform = (formProps) => {
    const relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
    return (
      <Form
        {...{
          formName: formName,
          surveyFragment: relevantFields, ...formProps,
        }}
      />
    );
  };

  const saveReactionTexture = () => {
    usePetrology.savePetFeature(petKey, spot, formRef.current);
    formRef.current?.setFieldValue('id', getNewId());
  };

  if (Platform.OS === 'android') return renderAddReactionTextureModalContent();
  else return <DragAnimation>{renderAddReactionTextureModalContent()}</DragAnimation>;
};

export default AddReactionTextureModal;
