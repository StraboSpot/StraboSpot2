import {useSelector} from 'react-redux';

// Hooks
import useServerRequests from '../services/useServerRequests';

const useProject = () => {
  const datasets = useSelector(state => state.project.datasets);
  const [serverRequests] = useServerRequests();
  const defaultTypes = ['geomorphic', 'hydrologic', 'paleontological', 'igneous', 'metamorphic', 'sedimentological',
    'other'];

  const getCurrentDataset = () => {
    return Object.values(datasets).find(dataset => dataset.current);
  };

  const loadProjectRemote = async (projectId, encodedLogin) => {
    console.log(`Getting ${projectId.name} project from server...`);
    const project = await serverRequests.getProject(projectId, encodedLogin);
    console.log('Loaded Project:', project);
    if (!project.description) project.description = {};
    if (!project.description.project_name) project.description.project_name = 'Unnamed';
    if (!project.other_features) project.other_features = defaultTypes;
    return project;
  };

  const projectHelpers = {
    getCurrentDataset: getCurrentDataset,
    loadProjectRemote: loadProjectRemote,
  };

  return [projectHelpers];
};

export default useProject;
