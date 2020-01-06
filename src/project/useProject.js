
import useServerRequests from '../services/useServerRequests';

const useProject = () => {
  const [serverRequests] = useServerRequests();

const defaultTypes = ['geomorphic', 'hydrologic', 'paleontological', 'igneous', 'metamorphic', 'sedimentological',
  'other'];

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
    loadProjectRemote: loadProjectRemote,
  };

  return [projectHelpers];
};

export default useProject;
