// Types for GitHub PR
export interface PRDetails {
    number: number;
    html_url: string;
    title: string;
    state: string;
    created_at: string;
    user: {
      login: string;
      avatar_url: string;
    };
    base: {
      ref: string;
      sha: string;
    };
    head: {
      ref: string;
      sha: string;
    };
  }
  
  export interface CreatePROptions {
    title: string;
    description: string;
    base: string;
    head: string;
    draft?: boolean;
    maintainer_can_modify?: boolean;
  }
  
  // Types for Deployment
  export interface DeploymentState {
    status: 'idle' | 'validating' | 'deploying' | 'success' | 'error';
    currentStep: number;
    logs: Array<{
      message: string;
      type: 'info' | 'error' | 'success';
      timestamp: Date;
    }>;
    error?: string;
  }
  
  export interface GithubState {
    isAuthenticated: boolean;
    username: string;
    token: string;
    avatarUrl: string;
    isValidating: boolean;
    error: string;
  }
  
  export interface DeploymentLog {
    message: string;
    type: 'info' | 'error' | 'success';
    timestamp: Date;
  }
  
  export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    default_branch: string;
    private: boolean;
    html_url: string;
    owner: {
      login: string;
      avatar_url: string;
    };
  }
  
  export interface GitHubBranch {
    name: string;
    commit: {
      sha: string;
      url: string;
    };
    protected: boolean;
  }