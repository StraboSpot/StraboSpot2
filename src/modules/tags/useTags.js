import {useDispatch, useSelector} from 'react-redux';

import {labelDictionary} from '../form';


const useTags = () => {
  const dispatch = useDispatch();
  const projectTags = useSelector(state => state.project.project.tags || []);
  const tagsDictionary = labelDictionary.project.tags;

  const getLabel = (key) => {
    return tagsDictionary[key] || key.replace(/_/g, ' ');
  };

  const save = (id, value) => {
    const tag = projectTags.find(tag => tag.id === id);
    tag.name = value;
  };

  return [{
    getLabel: getLabel,
    save: save,
  }];
};

export default useTags;
