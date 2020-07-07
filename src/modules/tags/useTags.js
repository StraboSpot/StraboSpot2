import {useDispatch, useSelector} from 'react-redux';

import {tagTypes} from './tags.constants';

const useTags = () => {
  const dispatch = useDispatch();
  const projectTags = useSelector(state => state.project.project.tags);
  const selectedTag = useSelector(state => state.tags.selectedTag);

  const getTagTypes = () => {
    return tagTypes;
  };

  const save = (id, value) => {
    const tag = projectTags.find(tag => tag.id === id);
    tag.concept_type = value;
  };

  return [{
    getTagTypes: getTagTypes,
    save: save,
  }];
};

export default useTags;
