import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import {Form, useFormHook} from '../form';
import {setModalValues, setModalVisible} from '../home/home.slice';
import {PAGE_KEYS} from '../page/page.constants';
import useSedHook from '../sed/useSed';
import Templates from '../templates/Templates';
import AddRockAlterationOreModal from './AddRockAlterationOreModal';
import AddRockIgneousModal from './AddRockIgneousModal';
import AddRockMetamorphicModal from './AddRockMetamorphicModal';
import AddRockSedimentaryModal from './AddRockSedimentaryModal';
import {IGNEOUS_ROCK_TYPES} from './petrology.constants';
import usePetrologyHook from './usePetrology';

const AddRockModal = (props) => {
  const dispatch = useDispatch();
  const modalValues = useSelector(state => state.home.modalValues);
  const spot = useSelector(state => state.spot.selectedSpot);
  const templates = useSelector(state => state.project.project?.templates) || {};

  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [survey, setSurvey] = useState({});
  const [choices, setChoices] = useState({});
  const [initialValues, setInitialValues] = useState({id: getNewId()});
  const [isShowTemplates, setIsShowTemplates] = useState(false);
  const [rockKey, setRockKey] = useState(null);
  const formRef = useRef(null);

  const [useForm] = useFormHook();
  const usePetrology = usePetrologyHook();
  const useSed = useSedHook();

  const groupKey = props.modalKey === PAGE_KEYS.ROCK_TYPE_SEDIMENTARY ? 'sed' : 'pet';

  useLayoutEffect(() => {
    const rockKeyUpdated = props.modalKey === PAGE_KEYS.ROCK_TYPE_IGNEOUS
      ? rockKey || modalValues.igneous_rock_class || 'plutonic'
      : props.modalKey;
    setRockKey(rockKeyUpdated);
    if (templates[rockKeyUpdated] && templates[rockKeyUpdated].isInUse
      && templates[rockKeyUpdated].active && templates[rockKeyUpdated].active[0]
      && templates[rockKeyUpdated].active[0].values) {
      setInitialValues({...templates[rockKeyUpdated].active[0].values, id: getNewId()});
    }
    else {
      const initialValuesTemp = !isEmpty(modalValues) ? modalValues
        : props.modalKey === PAGE_KEYS.ROCK_TYPE_IGNEOUS ? {id: getNewId(), igneous_rock_class: rockKeyUpdated}
          : {id: getNewId()};
      setInitialValues(initialValuesTemp);
    }
    const formName = [groupKey, rockKeyUpdated];
    setSurvey(useForm.getSurvey(formName));
    setChoices(useForm.getChoices(formName));
    setChoicesViewKey(null);
  }, [modalValues, props.modalKey, templates]);

  useEffect(() => {
    return () => dispatch(setModalValues({}));
  }, []);

  const onCloseModalPressed = () => {
    if (choicesViewKey) setChoicesViewKey(null);
    else if (isShowTemplates) setIsShowTemplates(false);
    else dispatch(setModalVisible({modal: null}));
  };

  const renderAddRock = () => {
    return (
      <React.Fragment>
        <FlatList
          bounces={false}
          ListHeaderComponent={
            <View style={{flex: 1}}>
              <Formik
                innerRef={formRef}
                initialValues={initialValues}
                onSubmit={(values) => console.log('Submitting form...', values)}
                enableReinitialize={true}
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
        {!choicesViewKey && <SaveButton title={'Save Rock'} onPress={saveRock}/>}
      </React.Fragment>
    );
  };

  const renderAddRockModalContent = () => {
    return (
      <Modal
        close={onCloseModalPressed}
        buttonTitleRight={choicesViewKey ? 'Done' : isShowTemplates ? '' : null}
        onPress={props.onPress}
      >
        {!choicesViewKey && (
          <Templates
            isShowTemplates={isShowTemplates}
            setIsShowTemplates={bool => setIsShowTemplates(bool)}
            rockKey={rockKey}
          />
        )}
        {!isShowTemplates && renderAddRock()}
      </Modal>
    );
  };

  const renderForm = (formProps) => {
    return (
      <React.Fragment>
        {Object.keys(IGNEOUS_ROCK_TYPES).includes(rockKey) && (
          <AddRockIgneousModal
            survey={survey}
            choices={choices}
            setChoicesViewKey={setChoicesViewKey}
            formName={[groupKey, rockKey]}
            formProps={formProps}
            setPetKey={setRockKey}
            setSurvey={setSurvey}
            setChoices={setChoices}
          />
        )}
        {rockKey === PAGE_KEYS.ROCK_TYPE_ALTERATION_ORE && (
          <AddRockAlterationOreModal
            survey={survey}
            choices={choices}
            setChoicesViewKey={setChoicesViewKey}
            formName={[groupKey, rockKey]}
            formProps={formProps}
          />
        )}
        {rockKey === PAGE_KEYS.ROCK_TYPE_METAMORPHIC && (
          <AddRockMetamorphicModal
            survey={survey}
            choices={choices}
            setChoicesViewKey={setChoicesViewKey}
            formName={[groupKey, rockKey]}
            formProps={formProps}
          />
        )}
        {rockKey === PAGE_KEYS.ROCK_TYPE_SEDIMENTARY && (
          <AddRockSedimentaryModal
            survey={survey}
            choices={choices}
            setChoicesViewKey={setChoicesViewKey}
            formName={[groupKey, rockKey]}
            formProps={formProps}
          />
        )}
      </React.Fragment>
    );
  };

  const renderSubform = (formProps) => {
    const relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
    return (
      <Form {...{formName: [groupKey, rockKey], surveyFragment: relevantFields, ...formProps}}/>
    );
  };

  const saveRock = () => {
    if (groupKey === 'pet') usePetrology.savePetFeature(props.modalKey, spot, formRef.current);
    else if (groupKey === 'sed') useSed.saveSedFeature(props.modalKey, spot, formRef.current);
    dispatch(setModalValues({...formRef.current.values, id: getNewId()}));
  };

  if (Platform.OS === 'android') return renderAddRockModalContent();
  else return <DragAnimation>{renderAddRockModalContent()}</DragAnimation>;
};

export default AddRockModal;
