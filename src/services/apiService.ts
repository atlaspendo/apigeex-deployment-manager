import axios from 'axios';
import { DeploymentConfig, ApiResponse } from '../types/deployment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const deployProxy = async (config: DeploymentConfig): Promise<ApiResponse> => {
  try {
    const response = await api.post('/deploy', config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Deployment failed');
    }
    throw error;
  }
};

export const validateConfig = async (config: DeploymentConfig): Promise<ApiResponse> => {
  try {
    const response = await api.post('/validate', config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Validation failed');
    }
    throw error;
  }
};

// For development/demo purposes
export const simulateDeployment = async (config: DeploymentConfig): Promise<ApiResponse> => {
  const steps = [
    { delay: 1000, message: 'Validating deployment configuration...' },
    { delay: 1500, message: 'Authenticating with Apigee...' },
    { delay: 2000, message: 'Building and uploading proxy bundle...' },
    { delay: 1500, message: 'Deploying to target environment...' },
    { delay: 1000, message: 'Verifying deployment...' }
  ];

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, step.delay));
  }

  return {
    success: true,
    message: 'Deployment completed successfully'
  };
};