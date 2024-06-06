import React, {useRef, useState} from 'react';
import {FlatList, Switch, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Formik} from 'formik';
import {Avatar, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import AddImageOverlayModal from './AddImageOverlayModal';
import useSedHook from './useSed';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SaveAndCancelButtons from '../../shared/ui/SaveAndCancelButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {Form, useFormHook} from '../form';
import {setLoadingStatus} from '../home/home.slice';
import {setStratSection} from '../maps/maps.slice';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {PAGE_KEYS} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';

const StratSectionPage = ({page}) => {
  console.log('Rendering StratSectionPage...');

  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedImage, setSelectedImage] = useState(undefined);

  const stratSectionRef = useRef(null);

  const useForm = useFormHook();
  const navigation = useNavigation();
  const useSed = useSedHook();

  const stratSection = spot.properties?.sed?.strat_section || {};

  console.log('Spot:', spot);
  console.log('Strat Section:', stratSection);

  const renderImageItem = (image) => {
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={image.id}
        onPress={() => setSelectedImage(image)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title style={commonStyles.listItemTitle}>{getImageLabel(image.id)}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const getImageLabel = (id) => {
    const image = spot.properties.images.find(i => id === i.id);
    return image && image.title ? image.title : 'Untitled';
  };

  const renderImageOverlaysSection = () => {
    return (
      <View>
        <SectionDividerWithRightButton
          dividerText={'Image Overlays'}
          onPress={() => setSelectedImage({})}
        />
        <FlatList
          keyExtractor={item => item.id}
          data={stratSection.images}
          renderItem={({item, index}) => renderImageItem(item, index)}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText text={'No Image Overlays'}/>}
        />
      </View>
    );
  };

  const renderSectionSettingsSection = () => {
    const formName = ['sed', 'strat_section'];
    return (
      <View style={{flex: 1}}>
        <SectionDivider dividerText={'Section Settings'}/>
        <SaveAndCancelButtons
          cancel={() => dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW))}
          save={saveStratSection}
        />
        <View style={{flex: 1}}>
          <FlatList
            ListHeaderComponent={
              <>
                <Formik
                  innerRef={stratSectionRef}
                  onSubmit={() => console.log('Submitting form...')}
                  onReset={() => console.log('Resetting form...')}
                  validate={values => useForm.validateForm({formName: formName, values: values})}
                  initialValues={stratSection}
                  validateOnChange={false}
                  enableReinitialize={true}
                >
                  {formProps => <Form {...{...formProps, formName: formName}}/>}
                </Formik>
              </>
            }
          />
        </View>
      </View>
    );
  };

  const renderStratSectionToggle = () => {
    return (
      <View>
        <ListItem containerStyle={commonStyles.listItem} key={'strat_section_toggle'}>
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>
              Add a Stratigraphic Section at this Spot?
            </ListItem.Title>
          </ListItem.Content>
          <Switch
            value={!isEmpty(stratSection)}
            onValueChange={() => useSed.toggleStratSection(spot)}
          />
        </ListItem>
      </View>
    );
  };

  const renderStratSectionsMain = () => {
    return (
      <View style={{flex: 1, justifyContent: 'flex-start'}}>
        <ReturnToOverviewButton/>
        {renderStratSectionToggle()}
        {!isEmpty(stratSection) && (
          <View style={{flex: 1}}>
            <FlatListItemSeparator/>
            <ListItem
              containerStyle={commonStyles.listItem}
              key={'strat_section'}
              onPress={() => {
                dispatch(setLoadingStatus({view: 'home', bool: true}));
                if (SMALL_SCREEN) navigation.navigate('HomeScreen', {screen: 'Map'});
                setTimeout(() => {
                  dispatch(setStratSection(stratSection));
                  dispatch(setLoadingStatus({view: 'home', bool: false}));
                }, 500);
              }}
            >
              <Avatar
                source={require('../../assets/icons/SedStratColumn.png')}
                size={20}
                containerStyle={{alignSelf: 'center'}}
              />
              <ListItem.Content>
                <ListItem.Title style={commonStyles.listItemTitle}>View Stratigraphic Section</ListItem.Title>
              </ListItem.Content>
            </ListItem>
            {renderImageOverlaysSection()}
            {renderSectionSettingsSection()}
          </View>
        )}
        {selectedImage && <AddImageOverlayModal closeModal={() => setSelectedImage(undefined)} image={selectedImage}/>}
      </View>
    );
  };

  const saveStratSection = async () => {
    await useSed.saveSedFeature(page.key, spot, stratSectionRef.current);
    await stratSectionRef.current.resetForm();
    dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
  };

  return (
    <React.Fragment>
      {renderStratSectionsMain()}
    </React.Fragment>
  );
};

export default StratSectionPage;
