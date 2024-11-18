import axios from 'axios';
import { GitHubRepo, GitHubBranch, PRDetails, CreatePROptions } from '../types/types';

const GITHUB_API_BASE = 'https://api.github.com';

export const validateGitHubCredentials = async (username: string, token: string) => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return {
      success: true,
      userData: response.data,
    };
  } catch (error) {
    throw new Error('Invalid GitHub credentials');
  }
};

export const listUserRepositories = async (token: string): Promise<GitHubRepo[]> => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/user/repos`, {
      headers: {
        Authorization: `Bearer ${token}`,
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

export const listBranches = async (token: string, repoFullName: string): Promise<GitHubBranch[]> => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/repos/${repoFullName}/branches`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch branches');
  }
};

export const createPullRequest = async (
  token: string,
  repoFullName: string,
  options: CreatePROptions
): Promise<PRDetails> => {
  try {
    const response = await axios.post(
      `${GITHUB_API_BASE}/repos/${repoFullName}/pulls`,
      {
        title: options.title,
        body: options.description,
        head: options.head,
        base: options.base,
        draft: options.draft,
        maintainer_can_modify: options.maintainer_can_modify,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to create pull request');
  }
};

export const getPRStatus = async (
  token: string,
  repoFullName: string,
  prNumber: number
): Promise<PRDetails> => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${repoFullName}/pulls/${prNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch PR status');
  }
};