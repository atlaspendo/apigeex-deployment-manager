export interface GitHubCredentials {
    username: string;
    personalToken: string;
  }
  
  export interface GitHubValidationResponse {
    success: boolean;
    message: string;
    userData?: {
      login: string;
      name?: string;
      avatarUrl?: string;
    };
  }