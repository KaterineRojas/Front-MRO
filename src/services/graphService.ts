/**
 * Microsoft Graph API Service
 * Handles all interactions with Microsoft Graph API for user data and photo retrieval
 */

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';

export interface GraphUserProfile {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  mobilePhone?: string;
  officeLocation?: string;
  department?: string;
  businessPhones?: string[];
}

/**
 * Fetches the current user's profile from Microsoft Graph
 */
export async function getUserProfile(accessToken: string): Promise<GraphUserProfile | null> {
  try {
    const response = await fetch(`${GRAPH_ENDPOINT}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch user profile:', response.statusText);
      return null;
    }

    const profile: GraphUserProfile = await response.json();
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Fetches the current user's photo from Microsoft Graph
 * Returns a blob URL that can be used as an image src
 * Includes 5 second timeout to prevent hanging
 */
export async function getUserPhoto(accessToken: string): Promise<string | null> {
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ User photo fetch timeout after 5 seconds');
      controller.abort();
    }, 5000); // 5 second timeout

    const response = await fetch(`${GRAPH_ENDPOINT}/me/photo/$value`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    });

    // Clear timeout on success
    clearTimeout(timeoutId);

    if (!response.ok) {
      // 404 means no photo is set
      if (response.status === 404) {
        console.log('ℹ️ User has no profile photo');
        return null;
      }
      console.error('Failed to fetch user photo:', response.statusText);
      return null;
    }

    const blob = await response.blob();
    const photoUrl = URL.createObjectURL(blob);
    console.log('✅ User photo loaded successfully');
    return photoUrl;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('⚠️ User photo fetch aborted (timeout)');
      return null;
    }
    console.error('❌ Error fetching user photo:', error);
    return null;
  }
}

/**
 * Fetches both user profile and photo in parallel
 * Returns combined data
 */
export async function getUserProfileWithPhoto(accessToken: string): Promise<{
  profile: GraphUserProfile | null;
  photoUrl: string | null;
}> {
  const [profile, photoUrl] = await Promise.all([
    getUserProfile(accessToken),
    getUserPhoto(accessToken),
  ]);

  return { profile, photoUrl };
}
