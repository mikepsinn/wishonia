import { getUserIdServer } from "@/lib/api/getUserIdServer"
import { getGithubAccessToken } from "@/lib/getOauthAccessToken"
import {
  Directory,
  GithubUser,
  ListOfUsers,
  Readme,
  RepoFetchProps,
  RepoProps,
} from "@/lib/types"

type GitHubApiError = {
  message: string;
  documentation_url: string;
  status?: string;
}

const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[GitHub API] ${message}`, data || '')
  }
}

export const checkRateLimit = async () => {
  try {
    debugLog('Checking rate limit')
    const userId = await getUserIdServer()
    let accessToken
    if (userId) {
      accessToken = await getGithubAccessToken(userId)
    }
    if (!accessToken) {
      throw new Error("No GitHub access token found")
    }
    const headers = createHeaders(accessToken)

    const res = await fetch(`https://api.github.com/rate_limit`, {
      method: "GET",
      headers,
    })

    if (!res.ok) {
      const error = await res.json() as GitHubApiError
      debugLog('Rate limit error:', error)
      throw new Error(`GitHub API error: ${error.message}`)
    }

    const rateLimitData = await res.json()
    debugLog('Rate limit response:', rateLimitData)
    
    if (!rateLimitData?.resources?.core?.remaining) {
      throw new Error('Invalid rate limit response format')
    }

    return rateLimitData.resources.core.remaining
  } catch (error) {
    console.error('Rate limit check failed:', error)
    return 0 // Return 0 to indicate no remaining calls
  }
}

function createHeaders(accessToken?: string): {
  Accept: string
  "X-GitHub-Api-Version": string
  Authorization?: string
} {
  const headers: {
    Accept: string
    "X-GitHub-Api-Version": string
    Authorization?: string
  } = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  return headers
}

// Add at the top of the file
class GitHubAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubAuthError';
  }
}

/**
 * This TypeScript function fetches and returns a GitHub user's profile data using the GitHub API.
 * @param {string} username - The `username` parameter in the `getGithubProfile` function is a string
 * that represents the GitHub username of the user whose profile you want to retrieve.
 * @returns The function `getGithubProfile` returns a Promise that resolves to a `GithubUser` object
 * fetched from the GitHub API for the specified `username`.
 */
export const getGithubProfile = async (username: string) => {
  try {
    debugLog(`Fetching profile for user: ${username}`)
    const userId = await getUserIdServer()
    let accessToken
    if (userId) {
      accessToken = await getGithubAccessToken(userId)
      if (!accessToken) {
        throw new GitHubAuthError('GitHub authentication required')
      }
    }
    const headers = createHeaders(accessToken)

    const res = await fetch(`https://api.github.com/users/${username}`, {
      method: "GET",
      headers,
    })

    if (res.status === 401 || res.status === 403) {
      throw new GitHubAuthError('GitHub authentication expired')
    }

    if (!res.ok) {
      const error = await res.json() as GitHubApiError
      debugLog('Profile fetch error:', error)
      throw new Error(`GitHub API error: ${error.message}`)
    }

    const githubUserData: GithubUser = await res.json()
    debugLog('Profile response:', githubUserData)
    return githubUserData
  } catch (error) {
    console.error(`Failed to fetch GitHub profile for ${username}:`, error)
    throw error // Re-throw to handle in the UI layer
  }
}

/**
 * The function `listUsers` fetches a list of GitHub users based on a query string using the GitHub API
 * with authentication.
 * @param {string} query - The `query` parameter in the `listUsers` function is provided by the AI and is a string that
 * represents the search query used to find users on GitHub. This query is used to search for users
 * based on specific criteria such as username, location, programming language, etc.
 * @returns The `listUsers` function is returning a list of GitHub users based on the provided query
 * string. The function makes a request to the GitHub API to search for users matching the query, with
 * a limit of 4 users per page. The response is then parsed as a `ListOfUsers` type and returned from
 * the function.
 */
export const listUsers = async (query: string) => {
  debugLog(`Searching users with query: ${query}`)
  const userId = await getUserIdServer()
  let accessToken
  if (userId) {
    accessToken = await getGithubAccessToken(userId)
  }
  const headers = createHeaders(accessToken)

  const res = await fetch(
    `https://api.github.com/search/users?q=${query}&per_page=4&page=1`,
    {
      method: "GET",
      headers,
    }
  )

  const githubUserList: ListOfUsers = await res.json()
  debugLog('Users search response:', githubUserList)
  return githubUserList as ListOfUsers
}

/**
 * The function `convertUserType` takes a query string, retrieves a list of users matching the query,
 * fetches their GitHub profiles, and returns an array of profiles.
 * @param {string} query - The `query` parameter in the `convertUserType` function is provided by the AI and is a string that is
 * used to search for users.
 * @returns The `convertUserType` function is returning an array of GitHub profiles for users based on
 * the query provided. The function first fetches a list of users using the `listUsers` function, then
 * maps over the list to fetch the GitHub profile for each user using the `getGithubProfile` function.
 * Finally, it returns an array of profiles for all the users fetched.
 */
type UserList = {
  login: string
}

export const convertUserType = async (query: string) => {
  const userList = await listUsers(query)

  const promises = userList.items.map(async (user: UserList) => {
    const profile = await getGithubProfile(user.login)
    return profile
  })

  const profiles = await Promise.all(promises)
  return profiles
}

/**
 * The function `searchRepositories` in TypeScript fetches GitHub repositories based on a query string
 * using an access token.
 * @param {string} query - The `query` parameter in the `searchRepositories` function is a string that
 * represents the search query used to search for repositories on GitHub. This query is used to filter
 * the repositories based on specific criteria such as keywords, language, topics, etc.
 * @returns The function `searchRepositories` is returning an array of `RepoProps` objects.
 */
export const searchRepositories = async (query: string) => {
  debugLog(`Searching repositories with query: ${query}`)
  const userId = await getUserIdServer()
  let accessToken
  if (userId) {
    accessToken = await getGithubAccessToken(userId)
  }
  const headers = createHeaders(accessToken)

  const res = await fetch(
    `https://api.github.com/search/repositories?q=${query}&per_page=4&page=1`,
    {
      method: "GET",
      headers,
    }
  )

  const githubRepositories: RepoFetchProps = await res.json()
  const { items } = githubRepositories

  debugLog('Repository search response:', items)
  return items as RepoProps[]
}

/**
 * The function `getReadme` retrieves the README.md file content from a specified GitHub repository
 * using the GitHub API, decodes the content from base64, and returns it as a string.
 * @param {string} repo - The `repo` parameter in the `getReadme` function refers to the name of the
 * repository you want to retrieve the README file from. It is a string that represents the repository
 * name on GitHub.
 * @param {string} owner - The `owner` parameter in the `getReadme` function refers to the owner or
 * organization that owns the GitHub repository from which you want to fetch the README file. This
 * could be an individual user or a GitHub organization.
 * @returns The `getReadme` function returns a Promise that resolves to a `Readme` object. The `Readme`
 * object contains information about the README file of a specific GitHub repository, including the
 * decoded content of the README file in UTF-8 format.
 */
export const getReadme = async (
  repo: string,
  owner: string
): Promise<Readme> => {
  debugLog(`Fetching README for ${owner}/${repo}`)
  const userId = await getUserIdServer()
  let accessToken
  if (userId) {
    accessToken = await getGithubAccessToken(userId)
  }
  const headers = createHeaders(accessToken)

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/README.md`,
    {
      method: "GET",
      headers,
    }
  )
  const readme: Readme = await res.json()

  // Decode the content from base64
  readme.content = Buffer.from(readme.content, "base64").toString("utf8")
  debugLog('README response:', readme)
  return readme
}

/* The `export const getDir` function is an asynchronous function that fetches the contents of a
directory in a GitHub repository. Here's a breakdown of what the function does: */
export const getDir = async ({
  repo,
  owner,
}: {
  repo: string
  owner: string
}): Promise<Directory[]> => {
  debugLog(`Fetching directory contents for ${owner}/${repo}`)
  const userId = await getUserIdServer()
  let accessToken
  if (userId) {
    accessToken = await getGithubAccessToken(userId)
  }
  const headers = createHeaders(accessToken)

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/`,
    {
      method: "GET",
      headers,
    }
  )
  const dir: Directory[] = await res.json()

  debugLog('Directory contents response:', dir)
  return dir
}

/**
 * The functions `getDirContent` and `decodeContent` are used to fetch directory content and decode
 * content from a specified URL using a GitHub access token.
 * @param {string} url - The `url` parameter in both functions represents the URL from which you want
 * to fetch data. It is a string that specifies the location of the resource you want to access.
 * @param {string | null} userId - The `userId` parameter is a string that represents the user ID of
 * the current user. It is used to authenticate and authorize the user to access certain resources or
 * perform specific actions within the application. In the provided code snippets, the `userId` is used
 * to retrieve an access token for making requests to
 * @returns For the `getDirContent` function, a Promise of an array of Directory objects is being
 * returned.
 */
export const getDirContent = async (
  url: string,
  userId: string | null
): Promise<Directory[]> => {
  let accessToken
  if (userId) {
    accessToken = await getGithubAccessToken(userId)
  }
  const headers = createHeaders(accessToken)

  const res = await fetch(url, {
    method: "GET",
    headers,
  })
  const content: Directory[] = await res.json()
  return content
}

/**
 * The function `decodeContent` asynchronously fetches content from a specified URL using a GET request
 * with optional authentication based on the user ID.
 * @param {string} url - The `url` parameter is a string that represents the URL from which the content
 * will be fetched.
 * @param {string | null} userId - The `userId` parameter is a string that represents the user's
 * identification. It can be used to retrieve the access token for the user from GitHub in order to
 * make authenticated requests. If `userId` is provided, the function will attempt to fetch the access
 * token for that user before making the request to
 * @returns The `decodeContent` function returns a Promise that resolves to a string.
 */
export const decodeContent = async (
  url: string,
  userId: string | null
): Promise<string> => {
  let accessToken
  if (userId) {
    accessToken = await getGithubAccessToken(userId)
  }
  const headers = createHeaders(accessToken)

  const res = await fetch(url, {
    method: "GET",
    headers,
  })
  const { content }: Directory = await res.json()
  return content
}
