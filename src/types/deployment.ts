export interface DeploymentConfig {
    proxyName: string;
    environmentGroup: string;
    environmentType: string;
    proxyDirectory: string;
    githubUsername: string;
    githubToken: string;
  }
  
  export interface DeploymentLog {
    message: string;
    type: 'info' | 'error' | 'success';
    timestamp: Date;
  }
  
  export interface DeploymentState {
    status: 'idle' | 'validating' | 'deploying' | 'success' | 'error';
    currentStep: number;
    logs: DeploymentLog[];
    error?: string;
  }
  
  export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
  }
  
  export interface GithubCredentials {
    username: string;
    token: string;
  }