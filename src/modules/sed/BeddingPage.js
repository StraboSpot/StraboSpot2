import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {batch, useDispatch, useSelector} from 'react-redux';

import {getNewUUID, isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {Form, useFormHook} from '../form';
import {setModalVisible} from '../home/home.slice';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import BasicListItem from '../page/BasicListItem';
import BasicPageDetail from '../page/BasicPageDetail';
import {PAGE_KEYS} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import useSedHook from '../sed/useSed';
import {editedSpotProperties} from '../spots/spots.slice';

const BeddingPage = (props) => {
  const dispatch = useDispatch();
  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState({});

  const [useForm] = useFormHook();
  const useSed = useSedHook();

  const beddingSharedRef = useRef(null);

  const bedding = spot.properties?.sed?.bedding || {};

  useEffect(() => {
    console.log('UE Rendered BeddingPage\nSpot:', spot);
    console.log('Bedding:', bedding);
    if (!isEmpty(selectedAttributes)) {
      setSelectedAttribute(selectedAttributes[0]);
      setIsDetailView(true);
    }
  }, [selectedAttributes, spot]);

  useLayoutEffect(() => {
    return () => confirmLeavePage();
  }, []);

  const confirmLeavePage = () => {
    if (beddingSharedRef.current && beddingSharedRef.current.dirty) {
      const formCurrent = beddingSharedRef.current;
      Alert.alert('Unsaved Changes',
        'Would you like to save your interval before continuing?',
        [
          {text: 'No', style: 'cancel'},
          {text: 'Yes', onPress: () => saveBeddingShared(formCurrent)},
        ],
        {cancelable: false},
      );
    }
  };

  const addAttribute = () => {
    batch(() => {
      setIsDetailView(true);
      setSelectedAttribute({id: getNewUUID()});
      dispatch(setModalVisible({modal: null}));
    });
  };

  const editAttribute = (attribute, i) => {
    if (!attribute.id) {
      let editedSedData = JSON.parse(JSON.stringify(spot.properties.sed));
      attribute = {...attribute, id: getNewUUID()};
      editedSedData[props.page.key].beds.splice(i, 1, attribute);
      dispatch(editedSpotProperties({field: 'sed', value: editedSedData}));
    }
    batch(() => {
      setIsDetailView(true);
      setSelectedAttribute(attribute);
      dispatch(setModalVisible({modal: null}));
    });
  };

  const renderAttributeDetail = () => {
    return (
      <React.Fragment>
        <BasicPageDetail
          closeDetailView={() => setIsDetailView(false)}
          groupKey={'sed'}
          page={props.page}
          selectedFeature={selectedAttribute}
        />
      </React.Fragment>
    );
  };

  const renderAttributesMain = () => {
    return (
      <View style={{flex: 1, justifyContent: 'flex-start'}}>
        <ReturnToOverviewButton/>
        <SectionDivider dividerText={props.page.label}/>
        {renderBeddingShared()}
        <SectionDividerWithRightButton
          dividerText={'Beds'}
          buttonTitle={'Add'}
          onPress={addAttribute}
        />
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={bedding.beds}
          renderItem={({item, index}) => (
            <BasicListItem
              item={item}
              index={index}
              page={props.page}
              editItem={itemToEdit => editAttribute(itemToEdit, index)}
            />
          )}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText text={'No Beds'}/>}
        />
      </View>
    );
  };

  const renderBeddingShared = () => {
    const formName = spot?.properties?.sed?.character === 'interbedded'
    || spot?.properties?.sed?.character === 'bed_mixed_lit' ? ['sed', 'bedding_shared_interbedded']
      : spot?.properties?.sed?.character === 'package_succe' ? ['sed', 'bedding_shared_package']
        : [];
    return isEmpty(formName) ? (
      <ListEmptyText
        text={'No shared bedding. Add bedding character of interbedded, mixed lithologies or package on the Interval Page first.'}
      />
    ) : (
      <View>
        <SaveAndCloseButton
          cancel={() => dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW))}
          save={() => saveBeddingShared(beddingSharedRef.current)}
        />
        <Formik
          innerRef={beddingSharedRef}
          onSubmit={() => console.log('Submitting form...')}
          onReset={() => console.log('Resetting form...')}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          children={(formProps) => <Form {...{...formProps, formName: formName}}/>}
          initialValues={bedding}
          validateOnChange={false}
          enableReinitialize={true}
        />
      </View>
    );
  };

  const saveBeddingShared = async (formCurrent) => {
    await useSed.saveSedFeature(props.page.key, spot, formCurrent);
    await formCurrent.resetForm();
    dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
  };

  return (
    <React.Fragment>
      {isDetailView ? renderAttributeDetail() : renderAttributesMain()}
    </React.Fragment>
  );
};

export default BeddingPage;