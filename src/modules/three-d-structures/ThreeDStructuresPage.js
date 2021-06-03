import React, {useEffect, useState} from 'react';
import {SectionList, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty, toTitleCase} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {useFormHook} from '../form';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {setSelectedAttributes} from '../spots/spots.slice';
import ThreeDStructureDetail from './ThreeDStructureDetail';
import ThreeDStructureItem from './ThreeDStructureItem';

const ThreeDStructuresPage = () => {
  const dispatch = useDispatch();
  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selected3dStructure, setSelected3dStructure] = useState({});
  const [isDetailView, setIsDetailView] = useState(false);

  const [useForm] = useFormHook();

  const SECTIONS = {
    FOLDS: {title: 'Folds', key: 'fold'},
    TENSORS: {title: 'Tensors', key: 'tensor'},
    OTHER: {title: 'Other', key: 'other'},
  };

  useEffect(() => {
    console.log('UE ThreeDStructuresPage: spot changed to', spot);
    if (!isEmpty(selectedAttributes)) {
      setSelected3dStructure(selectedAttributes[0]);
      dispatch(setSelectedAttributes([]));
      setIsDetailView(true);
    }
    else setSelected3dStructure({});
  }, [spot]);

  const add3dStructure = (type) => {
    const new3dStructure = {id: getNewId(), type: type};
    setSelected3dStructure(new3dStructure);
    setIsDetailView(true);
  };

  const edit3dStructure = (threeDStructure) => {
    setSelected3dStructure(threeDStructure);
    setIsDetailView(true);
  };

  const get3dStructureTitle = (threeDStructure) => {
    return threeDStructure.label
      || toTitleCase(useForm.getLabel(threeDStructure.feature_type, ['_3d_structures', threeDStructure.feature_type]))
      || toTitleCase(useForm.getLabel(threeDStructure.type, ['_3d_structures', threeDStructure.feature_type]))
      || '';
  };

  const render3dStructure = (threeDStructure) => {
    return <ThreeDStructureItem item={threeDStructure} edit3dStructure={(item) => edit3dStructure((item))}/>;
  };

  const renderSectionHeader = (sectionTitle) => {
    const sectionKey = Object.values(SECTIONS).reduce((acc, {title, key}) => sectionTitle === title ? key : acc,
      '');
    return (
      <View style={uiStyles.sectionHeaderBackground}>
        <SectionDividerWithRightButton
          dividerText={sectionTitle}
          buttonTitle={'Add'}
          onPress={() => add3dStructure(sectionKey)}
        />
      </View>
    );
  };

  const renderSections = () => {
    const dataSectioned = Object.values(SECTIONS).reduce((acc, {title, key}) => {
      const data = spot?.properties?._3d_structures?.filter(d => d.type === key) || [];
      const dataSorted = data.slice().sort((a, b) => get3dStructureTitle(a).localeCompare(get3dStructureTitle(b)));
      return [...acc, {title: title, data: dataSorted}];
    }, []);

    return (
      <SectionList
        keyExtractor={(item, index) => item + index}
        sections={dataSectioned}
        renderSectionHeader={({section: {title}}) => renderSectionHeader(title)}
        renderItem={({item}) => render3dStructure(item)}
        renderSectionFooter={({section: {data, title}}) => {
          return data.length === 0 && <ListEmptyText text={'No ' + title + ' Observations'}/>;
        }}
        stickySectionHeadersEnabled={true}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    );
  };

  return (
    <React.Fragment>
      {!isDetailView && (
        <View style={{flex: 1}}>
          <ReturnToOverviewButton/>
          {renderSections()}
        </View>
      )}
      {isDetailView && (
        <ThreeDStructureDetail
          show3dStructuresOverview={() => setIsDetailView(false)}
          selected3dStructure={selected3dStructure}
        />
      )}
    </React.Fragment>
  );
};

export default ThreeDStructuresPage;
