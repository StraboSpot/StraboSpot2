import React, {useState} from 'react';
import {Dimensions, Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {Overlay} from 'react-native-elements/dist/overlay/Overlay';

import {isEmpty} from '../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR, SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import modalStyle from '../../shared/ui/modal/modal.style';
import ModalHeader from '../../shared/ui/modal/ModalHeader';
import {Form, formStyles, MainButtons, useFormHook} from '../form';

const AddRockMetamorphicModal = (props) => {
  const [isFaciesModalVisible, setIsFaciesModalVisible] = useState(false);

  const [useForm] = useFormHook();

  // Relevant keys for quick-entry modal
  const firstKeys = ['metamorphic_rock_type'];
  const secondKeys = ['protolith'];
  const thirdKeys = ['facies'];
  const fourthKeys = ['zone'];
  const lastKeys = ['notes_metamorphic'];

  // Relevant fields for quick-entry modal
  const lastKeysFields = lastKeys.map(k => props.survey.find(f => f.name === k));

  const addFacies = (faciesPressed) => {
    const currentFacies = JSON.parse(JSON.stringify(props.formProps.values?.facies || []));
    const updatedFacies = currentFacies.includes(faciesPressed) ? currentFacies.filter(f => f !== faciesPressed)
      : [...currentFacies, faciesPressed];
    if (isEmpty(updatedFacies)) {
      const {facies, ...valuesNew} = props.formProps.values;
      props.formProps.setValues(valuesNew);
    }
    else props.formProps.setFieldValue('facies', updatedFacies);
  };

  const faciesButtonText = (key) => {
    return (
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text
          style={props.formProps?.values?.facies?.includes(key) ? formStyles.formButtonSelectedTitle
            : formStyles.formButtonTitle}>
          {useForm.getLabel(key, props.formName)}
        </Text>
      </View>
    );
  };

  const FaciesButton = (faciesProps) => {
    return (
      <Button
        containerStyle={{padding: 2.5}}
        buttonStyle={[formStyles.formButtonLarge, {
          backgroundColor: props.formProps?.values?.facies?.includes(faciesProps.faciesKey)
            ? PRIMARY_ACCENT_COLOR : SECONDARY_BACKGROUND_COLOR,
          height: '100%',
        }]}
        type={'outline'}
        title={() => faciesButtonText(faciesProps.faciesKey)}
        onPress={() => addFacies(faciesProps.faciesKey)}
      />
    );
  };

  const renderFaciesModal = () => {
    const {width} = Dimensions.get('window');
    const faciesModalWidth = width > 520 ? 500 : '90%';
    return (
      <Overlay
        overlayStyle={[modalStyle.modalContainer, modalStyle.modalPosition, {width: faciesModalWidth, left: 20}]}
        isVisible={true}
      >
        <ModalHeader
          buttonTitleRight={'Done'}
          title={'Facies'}
          close={() => setIsFaciesModalVisible(false)}
        />
        <View style={{flex: 1}}>

          <View style={{flex: 5, flexDirection: 'row', paddingRight: 5}}>
            <View style={{width: 20, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[formStyles.formButtonTitle, {transform: [{rotate: '-90deg'}], width: 60}]}>Pressure</Text>
            </View>
            <View style={{
              flex: 1,
              flexDirection: 'column',
              borderStyle: 'solid',
              borderLeftWidth: 1,
              borderBottomWidth: 1,
            }}>
              <View style={{flex: 8, flexDirection: 'row'}}>
                <View style={{flex: 9, flexDirection: 'column'}}>
                  <View style={{flex: 2, flexDirection: 'row'}}>
                    <View style={{flex: 4}}/>
                    <View style={{flex: 5}}>
                      <FaciesButton faciesKey={'eclogite'}/>
                    </View>
                  </View>
                  <View style={{flex: 4, flexDirection: 'row'}}>
                    <View style={{flex: 5, flexDirection: 'column'}}>
                      <View style={{flex: 2, flexDirection: 'row'}}>
                        <View style={{flex: 2}}/>
                        <View style={{flex: 2}}><FaciesButton faciesKey={'blueschist'}/></View>
                        <View style={{flex: 1}}/>
                      </View>
                      <View style={{flex: 2, flexDirection: 'row'}}>
                        <View style={{flex: 1}}/>
                        <View style={{flex: 2}}><FaciesButton faciesKey={'prehnite_pumpy'}/></View>
                        <View style={{flex: 2}}><FaciesButton faciesKey={'greenschist'}/></View>
                      </View>
                    </View>
                    <View style={{flex: 2}}><FaciesButton faciesKey={'amphibolite'}/></View>
                    <View style={{flex: 2}}><FaciesButton faciesKey={'upper_amph'}/></View>
                  </View>
                </View>
                <View style={{flex: 2}}><FaciesButton faciesKey={'granulite'}/></View>
              </View>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 2}}><FaciesButton faciesKey={'zeolite'}/></View>
                <View style={{flex: 2}}/>
                <View style={{flex: 5}}><FaciesButton faciesKey={'hornfels'}/></View>
                <View style={{flex: 2}}/>
              </View>
            </View>
          </View>
          <View style={{height: 30, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={formStyles.formButtonTitle}>Temperature</Text>
          </View>
          <View style={{flexDirection: 'row', height: 80, paddingBottom: 10}}>
            <View style={{width: '50%'}}>
              <FaciesButton faciesKey={'ultra_high_pre'}/>
            </View>
            <View style={{width: '50%'}}>
              <FaciesButton faciesKey={'ultra_high_tem'}/>
            </View>
          </View>
        </View>
      </Overlay>
    );
  };

  return (
    <React.Fragment>
      <MainButtons
        mainKeys={firstKeys}
        formName={props.formName}
        formProps={props.formProps}
        setChoicesViewKey={props.setChoicesViewKey}
      />
      <MainButtons
        mainKeys={secondKeys}
        formName={props.formName}
        formProps={props.formProps}
        setChoicesViewKey={props.setChoicesViewKey}
      />
      <MainButtons
        mainKeys={thirdKeys}
        formName={props.formName}
        formProps={props.formProps}
        setChoicesViewKey={() => setIsFaciesModalVisible(true)}
      />
      <MainButtons
        mainKeys={fourthKeys}
        formName={props.formName}
        formProps={props.formProps}
        setChoicesViewKey={props.setChoicesViewKey}
      />
      <Form {...{surveyFragment: lastKeysFields, ...props.formProps}}/>
      {isFaciesModalVisible && renderFaciesModal()}
    </React.Fragment>
  );
};

export default AddRockMetamorphicModal;
