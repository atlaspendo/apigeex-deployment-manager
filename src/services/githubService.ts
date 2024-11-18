import axios from 'axios';
import { GitHubCredentials, GitHubValidationResponse } from '../types/github';

const GITHUB_API_BASE = 'https://api.github.com';

export const validateGitHubCredentials = async (
  credentials: GitHubCredentials
): Promise<GitHubValidationResponse> => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/user`, {
      headers: {
        Authorization: `token ${credentials.personalToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return {
      success: true,
      message: 'Authentication successful',
      userData: {
        login: response.data.login,
        name: response.data.name,
        avatarUrl: response.data.avatar_url,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Invalid GitHub credentials',
    };
  }
};

export const listRepositories = async (token: string) => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/user/repos`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      params: {
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch repositories');
  }
};