export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    default_branch: string;
    private: boolean;
  }
  
  export interface GitHubBranch {
    name: string;
    commit: {
      sha: string;
      url: string;
    };
    protected: boolean;
  }
  
  export interface GitHubCommit {
    message: string;
    branch: string;
    createPullRequest: boolean;
  }