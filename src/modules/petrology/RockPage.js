import React, {useEffect, useRef, useState} from 'react';
import {Alert, SectionList, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {batch, useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewCopyId, getNewId, isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {SelectInputField, useFormHook} from '../form';
import {setModalValues, setModalVisible} from '../home/home.slice';
import BasicListItem from '../page/BasicListItem';
import BasicPageDetail from '../page/BasicPageDetail';
import {PAGE_KEYS} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {editedSpotProperties} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import {IGNEOUS_ROCK_CLASSES} from './petrology.constants';

const RockPage = (props) => {
  const dispatch = useDispatch();
  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();
  const [useSpots] = useSpotsHook();

  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedRock, setSelectedRock] = useState({});
  const [spotsWithRockType, setSpotsWithRockType] = useState([]);

  const preFormRef = useRef(null);

  const groupKey = props.page.key === PAGE_KEYS.ROCK_TYPE_SEDIMENTARY ? 'sed' : 'pet';
  const rockData = spot.properties[groupKey] || {};

  const IGNEOUS_SECTIONS = {
    PLUTONIC: {title: 'Plutonic Rocks', key: IGNEOUS_ROCK_CLASSES.plutonic},
    VOLCANIC: {title: 'Volcanic Rocks', key: IGNEOUS_ROCK_CLASSES.volcanic},
    DEPRECATED: {title: 'Igneous Rocks (Deprecated Version)', key: null},
  };

  const METAMORPHIC_SECTIONS = {
    PLUTONIC: {title: 'Metamorphic Rocks', key: PAGE_KEYS.ROCK_TYPE_METAMORPHIC},
    DEPRECATED: {title: 'Metamorphic Rocks (Deprecated Version)', key: null},
  };

  const ALTERATION_ORE_SECTIONS = {
    ALTERATION_ORE: {title: 'Alteration, Ore Rocks', key: PAGE_KEYS.ROCK_TYPE_ALTERATION_ORE},
    DEPRECATED: {title: 'Alteration, Ore Rocks (Deprecated Version)', key: null},
  };

  const SEDIMENTARY_SECTIONS = {
    SEDIMENTARY: {title: 'Sedimentary Rocks', key: PAGE_KEYS.ROCK_TYPE_SEDIMENTARY},
  };

  const pageSections = props.page.key === PAGE_KEYS.ROCK_TYPE_IGNEOUS ? IGNEOUS_SECTIONS
    : props.page.key === PAGE_KEYS.ROCK_TYPE_METAMORPHIC ? METAMORPHIC_SECTIONS
      : props.page.key === PAGE_KEYS.ROCK_TYPE_ALTERATION_ORE ? ALTERATION_ORE_SECTIONS
        : SEDIMENTARY_SECTIONS;

  useEffect(() => {
    console.log('UE Rendered RockPage\nSpot:', spot, '\nSelectedAttributes:', selectedAttributes);
    if (isEmpty(selectedAttributes)) setSelectedRock({});
    else {
      setSelectedRock(selectedAttributes[0]);
      setIsDetailView(true);
    }
    getSpotsWithRockType();
  }, [selectedAttributes, spot]);

  const addRock = (sectionKey) => {
    let newRock = props.page.key === PAGE_KEYS.ROCK_TYPE_IGNEOUS ? {id: getNewId(), igneous_rock_class: sectionKey}
      : {id: getNewId()};
    dispatch(setModalValues(newRock));
    dispatch(setModalVisible({modal: props.page.key}));
  };

  const editRock = (rock) => {
    batch(() => {
      setIsDetailView(true);
      setSelectedRock(rock);
      dispatch(setModalVisible({modal: null}));
    });
  };

  const copyPetData = (spotId) => {
    const spotToCopy = useSpots.getSpotById(spotId);

    const copyPetDataContinued = () => {
      let updatedPetData = JSON.parse(JSON.stringify(rockData));
      if (groupKey === 'pet' && spotToCopy?.properties?.pet?.rock_type) {
        const survey = useForm.getSurvey(['pet_deprecated', props.page.key]);
        const fieldNames = survey.reduce((acc, field) => field.name ? [...acc, field.name] : acc, []);
        const petDataToCopyFiltered = Object.entries(spotToCopy.properties.pet).reduce((acc, [key, value]) => {
          return fieldNames.includes(key) ? {...acc, [key]: value} : acc;
        }, {});
        const petDataFiltered = Object.entries(rockData).reduce((acc, [key, value]) => {
          return fieldNames.includes(key) ? acc : {...acc, [key]: value};
        }, {});
        const updatedRockType = rockData.rock_type ? [...new Set([...rockData.rock_type, props.page.key])]
          : [props.page.key];
        updatedPetData = {...petDataFiltered, ...petDataToCopyFiltered, rock_type: updatedRockType};
      }
      if (spotToCopy.properties[groupKey] && spotToCopy.properties[groupKey][props.page.key]) {
        const copyDataWithNewIds = spotToCopy.properties[groupKey][props.page.key].map(r => ({...r, id: getNewCopyId()}));
        updatedPetData[props.page.key] = [...rockData[props.page.key] || [], ...copyDataWithNewIds];
      }
      dispatch(editedSpotProperties({field: groupKey, value: updatedPetData}));
    };

    if (!isEmpty(spotToCopy)) {
      const title = props.page.label;
      console.log('Copying ' + title + ' data from Spot:', spotToCopy);
      if (groupKey === 'pet' && spotToCopy?.properties?.pet?.rock_type?.includes(props.page.key)
        && rockData?.rock_type?.includes(props.page.key)) {
        Alert.alert('Overwrite Existing Data',
          'Are you sure you want to overwrite any current ' + title + ' rock data '
          + 'with the ' + title + ' rock data from ' + spotToCopy.properties.name + '?',
          [
            {
              text: 'No',
              style: 'cancel',
              onPress: () => preFormRef.current.resetForm(),
            },
            {
              text: 'Yes',
              onPress: () => copyPetDataContinued(),
            },
          ],
          {cancelable: false},
        );
      }
      else copyPetDataContinued();
    }
    else console.log('Spot to copy is empty. Aborting copying.');
  };

  const getSpotsWithRockType = () => {
    const allActiveSpotsWithGroupKey = useSpots.getSpotsWithKey(groupKey);
    setSpotsWithRockType(allActiveSpotsWithGroupKey.filter(s => s.properties.id !== spot.properties.id
      && (s.properties[groupKey]
        && (s.properties[groupKey].rock_type?.includes(props.page.key) || s.properties[groupKey][props.page.key]))));
  };

  const renderCopySelect = () => {
    const label = 'Copy ' + props.page.label + ' Data From:';
    return (
      <Formik
        innerRef={preFormRef}
        validate={(fieldValues) => copyPetData(fieldValues.spot_id_for_pet_copy)}
        validateOnChange={true}
        initialValues={{}}
      >
        <ListItem containerStyle={commonStyles.listItemFormField}>
          <ListItem.Content>
            <Field
              component={(formProps) => (
                SelectInputField({setFieldValue: formProps.form.setFieldValue, ...formProps.field, ...formProps})
              )}
              name={'spot_id_for_pet_copy'}
              key={'spot_id_for_pet_copy'}
              label={label}
              choices={spotsWithRockType.map(s => ({label: s.properties.name, value: s.properties.id}))}
              single={true}
            />
          </ListItem.Content>
        </ListItem>
      </Formik>
    );
  };

  const renderSectionHeader = (sectionTitle) => {
    const sectionKey = Object.values(pageSections).reduce((acc, {title, key}) => {
        return sectionTitle === title ? key : acc;
      },
      '');
    if (sectionKey) {
      return (
        <View style={uiStyles.sectionHeaderBackground}>
          <SectionDividerWithRightButton
            dividerText={sectionTitle}
            buttonTitle={'Add'}
            onPress={() => addRock(sectionKey)}
          />
        </View>
      );
    }
    else return <SectionDivider dividerText={sectionTitle}/>;
  };

  const renderSections = () => {
    const rocksGrouped = Object.values(pageSections).reduce((acc, {title, key}) => {
      const data = key ? spot?.properties[groupKey] && spot?.properties[groupKey][props.page.key]
        && Array.isArray(spot?.properties[groupKey][props.page.key])
        && spot?.properties[groupKey][props.page.key].filter(
          rock => key === props.page.key || rock.igneous_rock_class === key) || []
        : spot?.properties[groupKey] && spot?.properties[groupKey].rock_type?.includes(props.page.key)
          ? [spot.properties[groupKey]]
          : [];
      return !key && isEmpty(data) ? acc : [...acc, {title: title, data: data.reverse()}];
    }, []);

    return (
      <SectionList
        keyExtractor={(item, index) => item + index}
        sections={rocksGrouped}
        renderSectionHeader={({section: {title}}) => renderSectionHeader(title)}
        renderItem={({item}) => <BasicListItem item={item} page={props.page} editItem={editRock}/>}
        renderSectionFooter={({section}) => {
          return section.data.length === 0 && <ListEmptyText text={'No ' + section.title}/>;
        }}
        stickySectionHeadersEnabled={true}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    );
  };

  const renderRockDetail = () => {
    return (
      <BasicPageDetail
        closeDetailView={() => setIsDetailView(false)}
        page={props.page}
        selectedFeature={selectedRock}
        groupKey={groupKey}
      />
    );
  };

  const renderRockMain = () => {
    return (
      <View style={{flex: 1}}>
        <ReturnToOverviewButton/>
        {renderCopySelect()}
        {renderSections()}
      </View>
    );
  };

  return (
    <React.Fragment>
      {isDetailView ? renderRockDetail() : renderRockMain()}
    </React.Fragment>
  );
};

export default RockPage;
