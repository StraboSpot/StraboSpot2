import {useDispatch, useSelector} from 'react-redux';


const useTags = () => {
  const dispatch = useDispatch();
  const projectTags = useSelector(state => state.project.project.tags);


  const save = (id, value) => {
    const tag = projectTags.find(tag => tag.id === id);
    tag.name = value;
  };

  return [{
    save: save,
  }];
};

export default useTags;
