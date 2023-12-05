import React, {useRef, useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import AddButton from '../../shared/ui/AddButton';
import SaveButton from '../../shared/ui/ButtonRounded';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import modalStyle from '../../shared/ui/modal/modal.style';
import {SelectInputField} from '../form';
import {setLoadingStatus, setModalVisible} from '../home/home.slice';
import useLocationHook from '../maps/useLocation';
import {MODAL_KEYS, PAGE_KEYS} from '../page/page.constants';
import {TAG_TYPES} from '../project/project.constants';
import {addedTagToSelectedSpot, setSelectedTag} from '../project/projects.slice';
import {TagDetailModal, useTagsHook} from '../tags';

const TagsModal = (props) => {
  const toast = useToast();
  const [useTags] = useTagsHook();
  const useLocation = useLocationHook();

  const dispatch = useDispatch();
  const isMultipleFeaturesTaggingEnabled = useSelector(state => state.project.isMultipleFeaturesTaggingEnabled);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const pageVisible = useSelector(state => state.notebook.visibleNotebookPagesStack.slice(-1)[0]);
  const selectedFeature = useSelector(state => state.spot.selectedAttributes[0]);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const selectedSpotFeaturesForTagging = useSelector(state => state.spot.selectedAttributes) || [];
  const selectedSpotsForTagging = useSelector(state => state.spot.intersectedSpotsForTagging);
  const tags = useSelector(state => state.project.project.tags) || [];

  const formRef = useRef(null);

  const [checkedTagsTemp, setCheckedTagsTemp] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const addTag = () => {
    dispatch(setSelectedTag({}));
    setIsDetailModalVisible(true);
  };

  const checkTags = (tag) => {
    const checkedTagsIds = checkedTagsTemp.map(checkedTag => checkedTag.id);
    if (checkedTagsIds.includes(tag.id)) {
      const filteredCheckedTags = checkedTagsTemp.filter(checkedTag => checkedTag.id !== tag.id);
      setCheckedTagsTemp(filteredCheckedTags);
    }
    else setCheckedTagsTemp([...checkedTagsTemp, tag]);
  };

  const closeTagDetailModal = () => {
    setIsDetailModalVisible(false);
    dispatch(addedTagToSelectedSpot(false));
  };

  const getRelevantTags = () => {
    return pageVisible === PAGE_KEYS.GEOLOGIC_UNITS || modalVisible === MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS
      ? searchTagsByType(PAGE_KEYS.GEOLOGIC_UNITS)
      : isEmpty(searchText) ? JSON.parse(JSON.stringify(tags.filter(t => t.type !== PAGE_KEYS.GEOLOGIC_UNITS)))
        : searchTagsByType(searchText);
  };

  const save = async () => {
    try {
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      let tagsToUpdate = [];
      if (modalVisible === MODAL_KEYS.SHORTCUTS.TAG || modalVisible === MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS) {
        useLocation.setPointAtCurrentLocation().then((spot) => {
          checkedTagsTemp.map((tag) => {
            if (isEmpty(tag.spots)) tag.spots = [];
            tag.spots.push(spot.properties.id);
            tagsToUpdate.push(tag);
          });
          useTags.saveTag(tagsToUpdate);
          props.goToCurrentLocation();
        });
      }
      else useTags.addSpotsToTags(checkedTagsTemp, selectedSpotsForTagging);
      // if (props.close) props.close();
      dispatch(setModalVisible({modal: null}));
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      toast.show('Tags Saved!', {type: 'success'});
    }
    catch (err) {
      console.error('Error saving Tag', err);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      toast.show('Tags Saved Error!', {type: 'danger'});

    }
  };

  const renderSpotTagsList = () => {
    return (
      <React.Fragment>
        {!isEmpty(tags) && pageVisible !== PAGE_KEYS.GEOLOGIC_UNITS
          && modalVisible !== MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS && (
            <Formik
              initialValues={{}}
              validate={fieldValues => setSearchText(fieldValues.searchText)}
              onSubmit={values => console.log('Submitting form...', values)}
              innerRef={formRef}
            >
              {() => (
                <ListItem containerStyle={commonStyles.listItemFormField}>
                  <ListItem.Content>
                    <Field
                      component={formProps => (
                        SelectInputField(
                          {setFieldValue: formProps.form.setFieldValue, ...formProps.field, ...formProps})
                      )}
                      name={'searchText'}
                      key={'searchText'}
                      label={'Tag Type'}
                      choices={TAG_TYPES.filter(t => t !== PAGE_KEYS.GEOLOGIC_UNITS).map(
                        tagType => ({label: useTags.getLabel(tagType), value: tagType}))}
                      single={true}
                    />
                  </ListItem.Content>
                </ListItem>
              )}
            </Formik>
          )}
        <FlatList
          keyExtractor={item => item.id.toString()}
          data={getRelevantTags().sort((tagA, tagB) => tagA.name.localeCompare(tagB.name))}  // alphabetize by name
          renderItem={({item}) => renderTagItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText
            text={!isEmpty(tags) && isEmpty(getRelevantTags()) ? 'There are no tags with this type.' : ''}/>}
        />
      </React.Fragment>
    );
  };

  const renderTagItem = (tag) => {
    let isAlreadyChecked = false;
    if (isMultipleFeaturesTaggingEnabled) {
      isAlreadyChecked = tag.features && tag.features[selectedSpot.properties.id] && !isEmpty(
          selectedSpotFeaturesForTagging)
        && selectedSpotFeaturesForTagging.every(
          element => tag.features[selectedSpot.properties.id].includes(element.id));
    }
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={tag.id}
        onPress={() => (modalVisible !== MODAL_KEYS.SHORTCUTS.TAG
          && modalVisible !== MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS
          && modalVisible !== MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS)
          ? useTags.addRemoveTag(tag, selectedSpot)
          : checkTags(tag)}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{tag.name}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{useTags.getLabel(tag.type)}</ListItem.Title>
        </ListItem.Content>
        {(!props.isFeatureLevelTagging) && (
          <ListItem.CheckBox
            checked={(modalVisible && modalVisible !== MODAL_KEYS.SHORTCUTS.TAG
              && modalVisible !== MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS
              && modalVisible !== MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS)
              ? tag && tag.spots && tag.spots.includes(selectedSpot.properties.id)
              : checkedTagsTemp.map(checkedTag => checkedTag.id).includes(tag.id)}
            onPress={() => (modalVisible !== MODAL_KEYS.SHORTCUTS.TAG
              && modalVisible !== MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS
              && modalVisible !== MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS)
              ? useTags.addRemoveTag(tag, selectedSpot)
              : checkTags(tag)}
          />
        )}
        {(props.isFeatureLevelTagging) && (
          <ListItem.CheckBox
            checked={!isMultipleFeaturesTaggingEnabled
              ? tag.features && tag.features[selectedSpot.properties.id] && selectedFeature
              && tag.features[selectedSpot.properties.id].includes(selectedFeature.id) : isAlreadyChecked
            }
            onPress={() => !isMultipleFeaturesTaggingEnabled ? useTags.addRemoveTag(tag, selectedSpot,
                props.isFeatureLevelTagging)
              : useTags.addRemoveTag(tag, selectedSpot, props.isFeatureLevelTagging, isAlreadyChecked)}
          />
        )}
      </ListItem>
    );
  };

  const searchTagsByType = (tagType) => {
    const tagsCopy = JSON.parse(JSON.stringify(tags));
    return useTags.filterTagsByTagType(tagsCopy, tagType);
  };

  return (
    <React.Fragment>
      {modalVisible !== MODAL_KEYS.NOTEBOOK.TAGS && modalVisible !== MODAL_KEYS.OTHER.FEATURE_TAGS && (
        <View style={modalStyle.textContainer}>
          <AddButton
            title={'Create New Tag'}
            type={'outline'}
            onPress={addTag}
          />

        </View>
      )}
      <View style={modalStyle.textContainer}>
        {tags && !isEmpty(tags) ? <Text style={modalStyle.textStyle}>Check all tags that apply</Text>
          : <Text style={modalStyle.textStyle}>No Tags</Text>}
      </View>
      {renderSpotTagsList()}
      {(!isEmpty(tags) && modalVisible !== MODAL_KEYS.NOTEBOOK.TAGS && modalVisible !== MODAL_KEYS.OTHER.FEATURE_TAGS)
        && (
          <SaveButton
            buttonStyle={{backgroundColor: 'red'}}
            title={'Save tag(s)'}
            onPress={() => save()}
            disabled={isEmpty(checkedTagsTemp)}
          />
        )}
      <TagDetailModal
        isVisible={isDetailModalVisible}
        closeModal={closeTagDetailModal}
        type={modalVisible === MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS && PAGE_KEYS.GEOLOGIC_UNITS}
      />
    </React.Fragment>
  );
};

export default TagsModal;
