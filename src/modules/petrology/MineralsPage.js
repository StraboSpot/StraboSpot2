import React, {useEffect, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {batch, useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewCopyId, isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {SelectInputField} from '../form';
import {setModalVisible} from '../home/home.slice';
import BasicListItem from '../page/BasicListItem';
import BasicPageDetail from '../page/BasicPageDetail';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {updatedModifiedTimestampsBySpotId} from '../project/projects.slice';
import {editedSpotProperties, setSelectedAttributes} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import usePetrologyHook from './usePetrology';

const MineralsPage = (props) => {
  const dispatch = useDispatch();
  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedMineral, setSelectedMineral] = useState({});
  const [spotsWithMinerals, setSpotsWithMinerals] = useState([]);

  const preFormRef = useRef(null);

  const [useSpots] = useSpotsHook();
  const usePetrology = usePetrologyHook();

  useEffect(() => {
    console.log('UE MineralsPage []');
    return () => dispatch(setSelectedAttributes([]));
  }, []);

  useEffect(() => {
    console.log('UE MineralsPage [selectedAttributes, spot]', selectedAttributes, spot);
    if (isEmpty(selectedAttributes)) setSelectedMineral({});
    else {
      setSelectedMineral(selectedAttributes[0]);
      setIsDetailView(true);
    }
    getSpotsWithMinerals();
  }, [selectedAttributes, spot]);

  const addMineral = () => {
    dispatch(setModalVisible({modal: props.page.key}));
  };

  const copyMineralData = (spotId) => {
    const spotToCopy = useSpots.getSpotById(spotId);
    if (!isEmpty(spotToCopy)) {
      const mineralsToCopy = JSON.parse(JSON.stringify(spotToCopy.properties.pet[props.page.key]));
      mineralsToCopy.forEach((mineral, i) => {
        if (mineral.modal) delete mineralsToCopy[i].modal;
        mineralsToCopy[i].id = getNewCopyId();
      });
      const updatedMinerals = spot.properties?.pet && spot.properties.pet[props.page.key]
        ? [...spot.properties.pet[props.page.key], ...mineralsToCopy] : mineralsToCopy;
      const updatedPet = spot.properties?.pet ? {...spot.properties.pet, minerals: updatedMinerals}
        : {minerals: updatedMinerals};
      dispatch(editedSpotProperties({field: 'pet', value: updatedPet}));
      dispatch(updatedModifiedTimestampsBySpotId(spot.properties.id));
      preFormRef.current.resetForm();
    }
  };

  const editMineral = (mineral) => {
    batch(() => {
      setIsDetailView(true);
      setSelectedMineral(mineral);
      dispatch(setModalVisible({modal: null}));
    });
  };

  const getSpotsWithMinerals = () => {
    const allSpotsWithPet = useSpots.getSpotsWithKey('pet');
    setSpotsWithMinerals(allSpotsWithPet.filter(s => s.properties.id !== spot.properties.id
      && s.properties.pet && s.properties.pet[props.page.key]));
  };

  const renderCopyDataSelectBox = () => {
    return (
      <Formik
        innerRef={preFormRef}
        validate={fieldValues => copyMineralData(fieldValues.spot_id_for_pet_copy)}
        validateOnChange={true}
        initialValues={{}}
      >
        <ListItem containerStyle={commonStyles.listItemFormField}>
          <ListItem.Content>
            <Field
              component={formProps => (
                SelectInputField({setFieldValue: formProps.form.setFieldValue, ...formProps.field, ...formProps})
              )}
              name={'spot_id_for_pet_copy'}
              key={'spot_id_for_pet_copy'}
              label={'Copy ' + props.page.label + ' Data From:'}
              choices={spotsWithMinerals.map(s => ({label: s.properties.name, value: s.properties.id}))}
              single={true}
            />
          </ListItem.Content>
        </ListItem>
      </Formik>
    );
  };

  const renderMineralsList = () => {
    let mineralData = spot.properties.pet && spot.properties.pet[props.page.key] || [];
    if (!Array.isArray(mineralData)) mineralData = [];
    const mineralDataSorted = mineralData.slice().sort(
      (a, b) => usePetrology.getMineralTitle(a).localeCompare(usePetrology.getMineralTitle(b)));
    return (
      <React.Fragment>
        <SectionDividerWithRightButton
          dividerText={props.page.label}
          buttonTitle={'Add'}
          onPress={addMineral}
        />
        <FlatList
          data={mineralDataSorted}
          renderItem={({item}) => <BasicListItem page={props.page} item={item} editItem={editMineral}/>}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText text={'There are no minerals at this Spot.'}/>}
        />
      </React.Fragment>
    );
  };

  const renderMineralDetail = () => {
    return (
      <BasicPageDetail
        closeDetailView={() => setIsDetailView(false)}
        page={props.page}
        selectedFeature={selectedMineral}
        groupKey={'pet'}
      />
    );
  };

  const renderMineralsMain = () => {
    return (
      <View style={{flex: 1}}>
        <ReturnToOverviewButton/>
        {renderCopyDataSelectBox()}
        {renderMineralsList()}
      </View>
    );
  };

  return (
    <React.Fragment>
      {isDetailView ? renderMineralDetail() : renderMineralsMain()}
    </React.Fragment>
  );
};

export default MineralsPage;
