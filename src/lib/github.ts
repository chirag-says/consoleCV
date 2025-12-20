// InternDeck - GitHub Import Utility
// Fetches user's repositories and maps them to the projects array

import type { GitHubRepo, Project } from "@/types/resume";

/**
 * Fetches the top repositories for a GitHub user
 * Filters out forks and sorts by stars
 * @param username - GitHub username
 * @param limit - Maximum number of repos to fetch (default: 6)
 */
export async function fetchGitHubRepos(
    username: string,
    limit: number = 6
): Promise<GitHubRepo[]> {
    const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=stars&per_page=100`,
        {
            headers: {
                Accept: "application/vnd.github.v3+json",
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        }
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`GitHub user "${username}" not found`);
        }
        if (response.status === 403) {
            throw new Error("GitHub API rate limit exceeded. Please try again later.");
        }
        throw new Error(`Failed to fetch GitHub repos: ${response.statusText}`);
    }

    const repos: GitHubRepo[] = await response.json();

    // Filter out forks and limit results
    return repos
        .filter((repo) => !repo.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, limit);
}

/**
 * Maps GitHub repositories to the Project interface format
 * @param repos - Array of GitHub repositories
 */
export function mapReposToProjects(repos: GitHubRepo[]): Project[] {
    return repos.map((repo) => ({
        title: repo.name
            .replace(/-/g, " ")
            .replace(/_/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        description: repo.description || `A ${repo.language || "software"} project`,
        techStack: [
            ...(repo.language ? [repo.language] : []),
            ...repo.topics.slice(0, 3),
        ].filter(Boolean),
        link: repo.html_url,
    }));
}

/**
 * Fetches GitHub repos and converts them to Project format
 * @param username - GitHub username
 * @param limit - Maximum number of projects to return
 */
export async function importGitHubProjects(
    username: string,
    limit: number = 6
): Promise<Project[]> {
    const repos = await fetchGitHubRepos(username, limit);
    return mapReposToProjects(repos);
}
