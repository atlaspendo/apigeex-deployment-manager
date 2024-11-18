import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as githubService from '../services/githubService';
import type { GitHubRepo, GitHubBranch } from '../services/githubService';

// Types
interface DeploymentState {
  status: 'idle' | 'validating' | 'deploying' | 'success' | 'error';
  currentStep: number;
  logs: Array<{
    message: string;
    type: 'info' | 'error' | 'success';
    timestamp: Date;
  }>;
  error?: string;
}

interface GithubState {
  isAuthenticated: boolean;
  username: string;
  token: string;
  avatarUrl: string;
  isValidating: boolean;
  error: string;
}




// Validation schema
const deploymentSchema = z.object({
  githubUsername: z.string().min(1, 'GitHub username is required'),
  githubToken: z.string().min(1, 'GitHub personal token is required'),
  proxyName: z.string().min(1, 'Proxy name is required'),
  environmentGroup: z.string().min(1, 'Environment group is required'),
  environmentType: z.string().min(1, 'Environment type is required'),
  proxyDirectory: z.string().min(1, 'Proxy directory is required'),
  repository: z.string().optional(),
  branch: z.string().optional(),
  commitMessage: z.string().optional(),
  createPullRequest: z.boolean().optional(),
});

type FormData = z.infer<typeof deploymentSchema>;

// Environment constants
const ENVIRONMENT_GROUPS = ['default', 'edd', 'homerun', 'wow', 'wpay'];
const ENVIRONMENT_TYPES = ['dev', 'test-env', 'test', 'uat', 'prod'];
const DEPLOYMENT_STEPS = [
  'Validate Inputs',
  'Authentication',
  'Build & Upload',
  'Deploy',
  'Verify'
];

const DeploymentForm = () => {
    // Form state using react-hook-form
    const { 
      register, 
      handleSubmit, 
      formState: { errors }, 
      getValues,
      setValue,
      reset,
      watch
    } = useForm<FormData>({
      resolver: zodResolver(deploymentSchema),
      defaultValues: {
        proxyName: '',
        environmentGroup: 'default',
        environmentType: 'dev',
        proxyDirectory: 'apiproxy',
        githubUsername: '',
        githubToken: '',
        createPullRequest: false,
      },
    });
  
    // Component state
    const [deploymentState, setDeploymentState] = useState<DeploymentState>({
      status: 'idle',
      currentStep: 0,
      logs: [],
    });
  
    const [githubState, setGithubState] = useState<GithubState>({
      isAuthenticated: false,
      username: '',
      token: '',
      avatarUrl: '',
      isValidating: false,
      error: '',
    });
  
    // Repository state
    const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
    const [branches, setBranches] = useState<GitHubBranch[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<string>('');
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  
    // Effects
    useEffect(() => {
      if (githubState.isAuthenticated && githubState.token) {
        fetchRepositories();
      }
    }, [githubState.isAuthenticated]);
  
    useEffect(() => {
      if (selectedRepo) {
        fetchBranches();
      }
    }, [selectedRepo]);


    // Helper function for logging
  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setDeploymentState(prev => ({
      ...prev,
      logs: [...prev.logs, { message, type, timestamp: new Date() }],
    }));
  };

  // GitHub API Functions
  const fetchRepositories = async () => {
    if (!githubState.token) return;
    setIsLoadingRepos(true);
    addLog('Fetching GitHub repositories...');
    
    try {
      const repos = await githubService.listUserRepositories(githubState.token);
      setRepositories(repos);
      addLog(`Successfully fetched ${repos.length} repositories`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch repositories';
      addLog(errorMessage, 'error');
      setGithubState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const fetchBranches = async () => {
    if (!selectedRepo || !githubState.token) return;
    setIsLoadingBranches(true);
    addLog(`Fetching branches for ${selectedRepo}...`);

    try {
      const branchList = await githubService.listBranches(githubState.token, selectedRepo);
      setBranches(branchList);
      addLog(`Successfully fetched ${branchList.length} branches`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch branches';
      addLog(errorMessage, 'error');
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const validateGitHub = async () => {
    const username = getValues('githubUsername');
    const token = getValues('githubToken');

    if (!username || !token) {
      setGithubState(prev => ({
        ...prev,
        error: 'Username and token are required'
      }));
      return;
    }

    setGithubState(prev => ({ ...prev, isValidating: true, error: '' }));
    addLog('Validating GitHub credentials...');

    try {
      const response = await githubService.validateGitHubCredentials(username, token);
      setGithubState({
        isAuthenticated: true,
        username: response.userData.login,
        token: token,
        avatarUrl: response.userData.avatar_url,
        isValidating: false,
        error: '',
      });
      addLog('GitHub authentication successful', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'GitHub authentication failed';
      setGithubState({
        isAuthenticated: false,
        username: '',
        token: '',
        avatarUrl: '',
        isValidating: false,
        error: errorMessage,
      });
      addLog(`GitHub authentication failed: ${errorMessage}`, 'error');
    }
  };

  const handleRepoSelect = (repoName: string) => {
    setSelectedRepo(repoName);
    setSelectedBranch('');
    setValue('repository', repoName);
    setValue('branch', '');
  };

  const handleBranchSelect = (branchName: string) => {
    setSelectedBranch(branchName);
    setValue('branch', branchName);
  };

  const handleDeploy = async (data: FormData) => {
    if (!githubState.isAuthenticated) {
      addLog('GitHub authentication required', 'error');
      return;
    }

    try {
      setDeploymentState(prev => ({
        ...prev,
        status: 'deploying',
        currentStep: 0,
        error: undefined,
      }));

      // Validate deployment configuration
      addLog('Validating deployment configuration...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDeploymentState(prev => ({ ...prev, currentStep: 1 }));

      // Authenticate with Apigee
      addLog('Authenticating with Apigee...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDeploymentState(prev => ({ ...prev, currentStep: 2 }));

      // Build and upload
      addLog('Building and uploading proxy bundle...');
      if (selectedRepo && selectedBranch) {
        addLog(`Using repository: ${selectedRepo}, branch: ${selectedBranch}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDeploymentState(prev => ({ ...prev, currentStep: 3 }));

      // Deploy
      addLog('Deploying to target environment...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDeploymentState(prev => ({ ...prev, currentStep: 4 }));

      // Verify
      addLog('Verifying deployment...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDeploymentState(prev => ({
        ...prev,
        status: 'success',
        currentStep: 5,
      }));
      addLog('Deployment completed successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Deployment failed';
      setDeploymentState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      addLog(`Deployment failed: ${errorMessage}`, 'error');
    }
  };

  const handleReset = () => {
    reset();
    setDeploymentState({
      status: 'idle',
      currentStep: 0,
      logs: [],
    });
    setGithubState({
      isAuthenticated: false,
      username: '',
      token: '',
      avatarUrl: '',
      isValidating: false,
      error: '',
    });
    setSelectedRepo('');
    setSelectedBranch('');
    setRepositories([]);
    setBranches([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Apigee Deployment Manager
          </h1>
          <p className="text-gray-600">
            Deploy your Apigee proxies <span className="text-blue-600">without</span> using <span className="text-blue-600">GitHub</span>
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* GitHub Authentication Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  GitHub Authentication
                </h2>
                <div className="space-y-4">
                  {/* GitHub Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GitHub Username
                    </label>
                    <input
                      {...register('githubUsername')}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                        errors.githubUsername ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-blue-500 focus:border-blue-500`}
                      disabled={githubState.isAuthenticated}
                    />
                    {errors.githubUsername && (
                      <p className="mt-1 text-sm text-red-500">{errors.githubUsername.message}</p>
                    )}
                  </div>

                  {/* GitHub Token */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personal Access Token
                      <a 
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Generate token
                      </a>
                    </label>
                    <input
                      {...register('githubToken')}
                      type="password"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                        errors.githubToken ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-blue-500 focus:border-blue-500`}
                      disabled={githubState.isAuthenticated}
                    />
                  </div>

                  {/* Auth Status */}
                  {githubState.isAuthenticated ? (
                    <div className="flex items-center space-x-3 mt-4 bg-green-50 p-4 rounded-md border border-green-100">
                      <img 
                        src={githubState.avatarUrl} 
                        alt="" 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-green-700">
                          Authenticated as <span className="font-medium">{githubState.username}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGithubState({
                          isAuthenticated: false,
                          username: '',
                          token: '',
                          avatarUrl: '',
                          isValidating: false,
                          error: '',
                        })}
                        className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={validateGitHub}
                      disabled={githubState.isValidating}
                      className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${
                        githubState.isValidating
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {githubState.isValidating ? 'Validating...' : 'Validate GitHub Credentials'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Repository Selection Card */}
            {githubState.isAuthenticated && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Repository Selection
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Repository
                      </label>
                      <select
                        value={selectedRepo}
                        onChange={(e) => handleRepoSelect(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a repository</option>
                        {repositories.map((repo) => (
                          <option key={repo.id} value={repo.full_name}>
                            {repo.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedRepo && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Branch
                        </label>
                        <select
                          value={selectedBranch}
                          onChange={(e) => handleBranchSelect(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a branch</option>
                          {branches.map((branch) => (
                            <option key={branch.name} value={branch.name}>
                              {branch.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

{selectedRepo && selectedBranch && (
                      <div className="flex items-center mt-4">
                        <input
                          type="checkbox"
                          id="createPullRequest"
                          {...register('createPullRequest')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="createPullRequest" className="ml-2 text-sm text-gray-700">
                          Create pull request to main branch
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Deployment Configuration Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Deployment Configuration
                </h2>
                <div className="space-y-4">
                  {/* Proxy Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proxy Name
                    </label>
                    <input
                      {...register('proxyName')}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                        errors.proxyName ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.proxyName && (
                      <p className="mt-1 text-sm text-red-500">{errors.proxyName.message}</p>
                    )}
                  </div>

                  {/* Environment Group */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Environment Group
                    </label>
                    <select
                      {...register('environmentGroup')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {ENVIRONMENT_GROUPS.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  {/* Environment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Environment Type
                    </label>
                    <select
                      {...register('environmentType')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {ENVIRONMENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Proxy Directory */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proxy Directory
                    </label>
                    <input
                      {...register('proxyDirectory')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Deployment Progress Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Deployment Progress
                </h2>
                <div className="space-y-3">
                  {DEPLOYMENT_STEPS.map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${
                        index < deploymentState.currentStep ? 'bg-green-500' :
                        index === deploymentState.currentStep ? 'bg-blue-500 animate-pulse' :
                        'border-2 border-gray-300'
                      }`} />
                      <span className={`ml-3 ${
                        index <= deploymentState.currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                    disabled={deploymentState.status === 'deploying'}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit(handleDeploy)}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${
                      deploymentState.status === 'deploying'
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={deploymentState.status === 'deploying' || !githubState.isAuthenticated}
                  >
                    {deploymentState.status === 'deploying' ? 'Deploying...' : 'Deploy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Logs */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Deployment Logs
                </h2>
                <div className="bg-gray-50 rounded-md border border-gray-200 p-4 h-[calc(100vh-220px)] overflow-y-auto">
                  {deploymentState.logs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No logs available</p>
                  ) : (
                    <div className="space-y-2">
                      {deploymentState.logs.map((log, index) => (
                        <div
                          key={index}
                          className={`text-sm ${
                            log.type === 'error' ? 'text-red-600' :
                            log.type === 'success' ? 'text-green-600' :
                            'text-gray-600'
                          }`}
                        >
                          <span className="text-gray-400">
                            [{log.timestamp.toLocaleTimeString()}]
                          </span>{' '}
                          {log.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentForm;