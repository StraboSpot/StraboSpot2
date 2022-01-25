import React, {useEffect, useRef, useState} from 'react';
import {Alert, FlatList, Switch, View} from 'react-native';

import {Formik} from 'formik';
import {Avatar, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {Form, useFormHook} from '../form';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {PAGE_KEYS} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import ImageOverlayDetail from './ImageOverlayDetail';
import useSedHook from './useSed';

const StratSectionPage = (props) => {
  const dispatch = useDispatch();

  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedImage, setSelectedImage] = useState({});

  const stratSection = spot.properties?.sed?.strat_section || {};

  const stratSectionRef = useRef(null);

  const [useForm] = useFormHook();
  const useSed = useSedHook();

  useEffect(() => {
    console.log('UE Rendered StratSectionPage\nSpot:', spot);
    console.log('Strat Section:', stratSection);
  }, []);

  const renderImageDetail = () => {
    return (
      <ImageOverlayDetail
        image={selectedImage}
        cancel={() => setSelectedImage({})}
      />
    );
  };

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
          buttonTitle={'Add'}
          onPress={() => Alert.alert('Notice', 'This feature has not been implemented yet.')}
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
        <SaveAndCloseButton
          cancel={() => dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW))}
          save={saveStratSection}
        />
        <View style={{flex: 1}}>
          <Formik
            innerRef={stratSectionRef}
            onSubmit={() => console.log('Submitting form...')}
            onReset={() => console.log('Resetting form...')}
            validate={(values) => useForm.validateForm({formName: formName, values: values})}
            children={(formProps) => <Form {...{...formProps, formName: formName}}/>}
            initialValues={stratSection}
            validateOnChange={false}
            enableReinitialize={true}
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
            onValueChange={() => Alert.alert('Notice', 'This feature has not been implemented yet.')}
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
              containerStyle={commonStyles.listItem} key={'strat_section'}
              onPress={() => Alert.alert('Notice', 'This feature has not been implemented yet.')}
            >
              <Avatar
                source={require('../../assets/icons/SedStratColumn_transparent.png')}
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
      </View>
    );
  };

  const saveStratSection = async () => {
    await useSed.saveSedFeature(props.page.key, spot, stratSectionRef.current);
    await stratSectionRef.current.resetForm();
    dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
  };

  return (
    <React.Fragment>
      {isEmpty(selectedImage) ? renderStratSectionsMain() : renderImageDetail()}
    </React.Fragment>
  );
};

export default StratSectionPage;
