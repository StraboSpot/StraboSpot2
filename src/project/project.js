import * as RemoteServer from '../services/server-requests';

const defaultTypes = ['geomorphic', 'hydrologic', 'paleontological', 'igneous', 'metamorphic', 'sedimentological',
  'other'];

export const loadProjectRemote = async (projectId, encoded_login) => {
  console.log(`Getting ${projectId.name} project from server...`);
  const project = await RemoteServer.getProject(projectId, encoded_login);
  console.log('Loaded Project:', project);
  if (!project.description) project.description = {};
  if (!project.description.project_name) project.description.project_name = 'Unnamed';
  if (!project.other_features) project.other_features = defaultTypes;
};

