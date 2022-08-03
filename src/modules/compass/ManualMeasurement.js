import React, {useRef} from 'react';
import {View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import SaveButton from '../../shared/SaveButton';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import {NumberInputField} from '../form';
import {MODAL_KEYS} from '../home/home.constants';
import {COMPASS_TOGGLE_BUTTONS} from './compass.constants';

const ManualMeasurement = (props) => {
  const modalVisible = useSelector(state => state.home.modalVisible);

  const manualFormRef = useRef(null);

  return (
    <React.Fragment>
      <Formik
        initialValues={{}}
        onSubmit={values => console.log('Submitting form...', values)}
        innerRef={manualFormRef}
        enableReinitialize={true}
      >
        {formProps => (
          <View>
            {props.measurementTypes.includes(COMPASS_TOGGLE_BUTTONS.PLANAR) && (
              <React.Fragment>
                <ListItem containerStyle={commonStyles.listItemFormField}>
                  <ListItem.Content>
                    <Field
                      component={NumberInputField}
                      name={'strike'}
                      label={'Strike'}
                      key={'strike'}
                    />
                  </ListItem.Content>
                </ListItem>
                <FlatListItemSeparator/>
                <ListItem containerStyle={commonStyles.listItemFormField}>
                  <ListItem.Content>
                    <Field
                      component={NumberInputField}
                      name={'dip_direction'}
                      label={'Azimuthal Dip Direction'}
                      key={'dip_direction'}
                    />
                  </ListItem.Content>
                </ListItem>
                <FlatListItemSeparator/>
                <ListItem containerStyle={commonStyles.listItemFormField}>
                  <ListItem.Content>
                    <Field
                      component={NumberInputField}
                      name={'dip'}
                      label={'Dip'}
                      key={'dip'}
                    />
                  </ListItem.Content>
                </ListItem>
                <FlatListItemSeparator/>
              </React.Fragment>
            )}
            {props.measurementTypes.includes(COMPASS_TOGGLE_BUTTONS.LINEAR) && (
              <React.Fragment>
                <ListItem containerStyle={commonStyles.listItemFormField}>
                  <ListItem.Content>
                    <Field
                      component={NumberInputField}
                      name={'trend'}
                      label={'Trend'}
                      key={'trend'}
                    />
                  </ListItem.Content>
                </ListItem>
                <FlatListItemSeparator/>
                <ListItem containerStyle={commonStyles.listItemFormField}>
                  <ListItem.Content>
                    <Field
                      component={NumberInputField}
                      name={'plunge'}
                      label={'Plunge'}
                      key={'plunge'}
                    />
                  </ListItem.Content>
                </ListItem>
                <FlatListItemSeparator/>
              </React.Fragment>
            )}
            {props.setAttributeMeasurements && modalVisible !== MODAL_KEYS.SHORTCUTS.MEASUREMENT
              && modalVisible !== MODAL_KEYS.NOTEBOOK.MEASUREMENTS && (
                <SaveButton title={'Add to Attribute'} onPress={() => props.addAttributeMeasurement(formProps.values)}/>
              )}
          </View>
        )}
      </Formik>
    </React.Fragment>
  );
};

export default ManualMeasurement;
