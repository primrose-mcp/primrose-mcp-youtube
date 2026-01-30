/**
 * YouTube API Client
 *
 * Handles all HTTP communication with the YouTube Data API v3.
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple tenants with different OAuth tokens.
 */

import type {
  Activity,
  Caption,
  Channel,
  ChannelSection,
  Comment,
  CommentThread,
  I18nLanguage,
  I18nRegion,
  Member,
  MembershipsLevel,
  PaginatedResponse,
  PaginationParams,
  Playlist,
  PlaylistItem,
  SearchResult,
  Subscription,
  Video,
  VideoAbuseReportReason,
  VideoCategory,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import {
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  QuotaExceededError,
  RateLimitError,
  YouTubeApiError,
} from './utils/errors.js';

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// =============================================================================
// YouTube Client Interface
// =============================================================================

export interface YouTubeClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;

  // Videos
  listVideos(
    ids: string[],
    parts?: string[]
  ): Promise<PaginatedResponse<Video>>;
  getVideo(videoId: string, parts?: string[]): Promise<Video>;
  searchVideos(params: SearchParams): Promise<PaginatedResponse<SearchResult>>;
  updateVideo(
    videoId: string,
    updates: VideoUpdateInput
  ): Promise<Video>;
  deleteVideo(videoId: string): Promise<void>;
  rateVideo(videoId: string, rating: 'like' | 'dislike' | 'none'): Promise<void>;
  getVideoRating(videoIds: string[]): Promise<VideoRating[]>;
  reportVideoAbuse(videoId: string, reasonId: string, secondaryReasonId?: string, comments?: string): Promise<void>;

  // Channels
  getMyChannel(parts?: string[]): Promise<Channel>;
  getChannel(channelId: string, parts?: string[]): Promise<Channel>;
  listChannels(ids: string[], parts?: string[]): Promise<PaginatedResponse<Channel>>;
  listChannelsByUsername(username: string, parts?: string[]): Promise<PaginatedResponse<Channel>>;
  updateChannel(channelId: string, updates: ChannelUpdateInput): Promise<Channel>;

  // Playlists
  listMyPlaylists(params?: PaginationParams, parts?: string[]): Promise<PaginatedResponse<Playlist>>;
  listChannelPlaylists(channelId: string, params?: PaginationParams, parts?: string[]): Promise<PaginatedResponse<Playlist>>;
  getPlaylist(playlistId: string, parts?: string[]): Promise<Playlist>;
  createPlaylist(input: PlaylistCreateInput): Promise<Playlist>;
  updatePlaylist(playlistId: string, updates: PlaylistUpdateInput): Promise<Playlist>;
  deletePlaylist(playlistId: string): Promise<void>;

  // Playlist Items
  listPlaylistItems(playlistId: string, params?: PaginationParams, parts?: string[]): Promise<PaginatedResponse<PlaylistItem>>;
  addVideoToPlaylist(playlistId: string, videoId: string, position?: number): Promise<PlaylistItem>;
  updatePlaylistItem(playlistItemId: string, playlistId: string, videoId: string, position: number): Promise<PlaylistItem>;
  removeFromPlaylist(playlistItemId: string): Promise<void>;

  // Comments
  listCommentThreads(params: CommentThreadListParams): Promise<PaginatedResponse<CommentThread>>;
  getCommentThread(commentThreadId: string, parts?: string[]): Promise<CommentThread>;
  postComment(channelId: string, videoId: string | undefined, text: string): Promise<CommentThread>;
  listComments(parentId: string, params?: PaginationParams, parts?: string[]): Promise<PaginatedResponse<Comment>>;
  replyToComment(parentId: string, text: string): Promise<Comment>;
  updateComment(commentId: string, text: string): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
  setCommentModerationStatus(commentIds: string[], moderationStatus: 'heldForReview' | 'published' | 'rejected', banAuthor?: boolean): Promise<void>;

  // Subscriptions
  listMySubscriptions(params?: PaginationParams, parts?: string[]): Promise<PaginatedResponse<Subscription>>;
  listChannelSubscribers(channelId: string, params?: PaginationParams, parts?: string[]): Promise<PaginatedResponse<Subscription>>;
  subscribe(channelId: string): Promise<Subscription>;
  unsubscribe(subscriptionId: string): Promise<void>;

  // Captions
  listCaptions(videoId: string, parts?: string[]): Promise<Caption[]>;
  downloadCaption(captionId: string, format?: string, language?: string): Promise<string>;
  insertCaption(videoId: string, caption: CaptionInsertInput): Promise<Caption>;
  updateCaption(captionId: string, updates: CaptionUpdateInput): Promise<Caption>;
  deleteCaption(captionId: string): Promise<void>;

  // Activities
  listActivities(params: ActivityListParams): Promise<PaginatedResponse<Activity>>;

  // Channel Sections
  listChannelSections(channelId: string, parts?: string[]): Promise<ChannelSection[]>;
  insertChannelSection(input: ChannelSectionInput): Promise<ChannelSection>;
  updateChannelSection(sectionId: string, input: ChannelSectionInput): Promise<ChannelSection>;
  deleteChannelSection(sectionId: string): Promise<void>;

  // i18n
  listI18nLanguages(hl?: string): Promise<I18nLanguage[]>;
  listI18nRegions(hl?: string): Promise<I18nRegion[]>;

  // Video Categories
  listVideoCategories(regionCode?: string, hl?: string): Promise<VideoCategory[]>;

  // Video Abuse Report Reasons
  listVideoAbuseReportReasons(hl?: string): Promise<VideoAbuseReportReason[]>;

  // Members & Memberships
  listMembers(params?: MemberListParams): Promise<PaginatedResponse<Member>>;
  listMembershipsLevels(parts?: string[]): Promise<MembershipsLevel[]>;

  // Search
  search(params: SearchParams): Promise<PaginatedResponse<SearchResult>>;
}

// =============================================================================
// Input Types
// =============================================================================

export interface SearchParams extends PaginationParams {
  q?: string;
  type?: 'video' | 'channel' | 'playlist';
  channelId?: string;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
  publishedAfter?: string;
  publishedBefore?: string;
  regionCode?: string;
  relevanceLanguage?: string;
  safeSearch?: 'moderate' | 'none' | 'strict';
  videoCategoryId?: string;
  videoDefinition?: 'any' | 'high' | 'standard';
  videoDimension?: '2d' | '3d' | 'any';
  videoDuration?: 'any' | 'long' | 'medium' | 'short';
  videoEmbeddable?: 'any' | 'true';
  videoLicense?: 'any' | 'creativeCommon' | 'youtube';
  videoType?: 'any' | 'episode' | 'movie';
  eventType?: 'completed' | 'live' | 'upcoming';
  forMine?: boolean;
  forContentOwner?: boolean;
  location?: string;
  locationRadius?: string;
  topicId?: string;
}

export interface VideoUpdateInput {
  title?: string;
  description?: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus?: 'private' | 'public' | 'unlisted';
  embeddable?: boolean;
  publicStatsViewable?: boolean;
  madeForKids?: boolean;
  defaultLanguage?: string;
}

export interface VideoRating {
  videoId: string;
  rating: 'like' | 'dislike' | 'none' | 'unspecified';
}

export interface ChannelUpdateInput {
  description?: string;
  keywords?: string;
  defaultLanguage?: string;
  country?: string;
  unsubscribedTrailer?: string;
}

export interface PlaylistCreateInput {
  title: string;
  description?: string;
  privacyStatus?: 'private' | 'public' | 'unlisted';
  defaultLanguage?: string;
}

export interface PlaylistUpdateInput {
  title?: string;
  description?: string;
  privacyStatus?: 'private' | 'public' | 'unlisted';
  defaultLanguage?: string;
}

export interface CommentThreadListParams extends PaginationParams {
  videoId?: string;
  channelId?: string;
  allThreadsRelatedToChannelId?: string;
  order?: 'time' | 'relevance';
  searchTerms?: string;
  moderationStatus?: 'heldForReview' | 'likelySpam' | 'published';
}

export interface CaptionInsertInput {
  language: string;
  name: string;
  isDraft?: boolean;
  captionData: string;
}

export interface CaptionUpdateInput {
  isDraft?: boolean;
  captionData?: string;
}

export interface ActivityListParams extends PaginationParams {
  channelId?: string;
  mine?: boolean;
  publishedAfter?: string;
  publishedBefore?: string;
  regionCode?: string;
}

export interface ChannelSectionInput {
  type: string;
  title?: string;
  position?: number;
  playlistIds?: string[];
  channelIds?: string[];
}

export interface MemberListParams extends PaginationParams {
  mode?: 'all_current' | 'updates';
  hasAccessToLevel?: string;
  filterByMemberChannelId?: string;
}

// =============================================================================
// YouTube Client Implementation
// =============================================================================

class YouTubeClientImpl implements YouTubeClient {
  private credentials: TenantCredentials;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
  }

  // ===========================================================================
  // HTTP Request Helper
  // ===========================================================================

  private getAuthParams(): Record<string, string> {
    if (this.credentials.accessToken) {
      return {};
    }
    if (this.credentials.apiKey) {
      return { key: this.credentials.apiKey };
    }
    throw new AuthenticationError(
      'No credentials provided. Include X-YouTube-Access-Token or X-YouTube-API-Key header.'
    );
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.credentials.accessToken) {
      headers.Authorization = `Bearer ${this.credentials.accessToken}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { params?: Record<string, string | number | boolean | undefined> } = {}
  ): Promise<T> {
    const { params = {}, ...fetchOptions } = options;

    const allParams = { ...this.getAuthParams(), ...params };
    const filteredParams = Object.entries(allParams)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)] as [string, string]);

    const queryString = new URLSearchParams(filteredParams).toString();
    const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...this.getAuthHeaders(),
        ...(fetchOptions.headers || {}),
      },
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? Number.parseInt(retryAfter, 10) : 60);
    }

    if (response.status === 401) {
      throw new AuthenticationError('Authentication failed. Check your OAuth token or API key.');
    }

    if (response.status === 403) {
      const errorBody = await response.text();
      if (errorBody.includes('quotaExceeded')) {
        throw new QuotaExceededError('YouTube API quota exceeded.');
      }
      throw new ForbiddenError('Access forbidden. You may lack required permissions.');
    }

    if (response.status === 404) {
      throw new NotFoundError('Resource', 'unknown');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.error?.message || errorJson.message || message;
      } catch {
        // Use default message
      }
      throw new YouTubeApiError(message, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  private toPaginatedResponse<T>(response: YouTubeListResponse<T>): PaginatedResponse<T> {
    return {
      items: response.items || [],
      count: response.items?.length || 0,
      totalResults: response.pageInfo?.totalResults,
      resultsPerPage: response.pageInfo?.resultsPerPage,
      hasMore: !!response.nextPageToken,
      nextPageToken: response.nextPageToken,
      prevPageToken: response.prevPageToken,
    };
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      if (this.credentials.accessToken) {
        await this.request<YouTubeListResponse<Channel>>('/channels', {
          params: { part: 'id', mine: true },
        });
        return { connected: true, message: 'Successfully connected to YouTube API (OAuth)' };
      }
      await this.request<YouTubeListResponse<VideoCategory>>('/videoCategories', {
        params: { part: 'snippet', regionCode: 'US' },
      });
      return { connected: true, message: 'Successfully connected to YouTube API (API Key)' };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Videos
  // ===========================================================================

  async listVideos(
    ids: string[],
    parts: string[] = ['snippet', 'contentDetails', 'statistics']
  ): Promise<PaginatedResponse<Video>> {
    const response = await this.request<YouTubeListResponse<Video>>('/videos', {
      params: {
        part: parts.join(','),
        id: ids.join(','),
      },
    });
    return this.toPaginatedResponse(response);
  }

  async getVideo(videoId: string, parts: string[] = ['snippet', 'contentDetails', 'statistics', 'status']): Promise<Video> {
    const result = await this.listVideos([videoId], parts);
    if (result.items.length === 0) {
      throw new NotFoundError('Video', videoId);
    }
    return result.items[0];
  }

  async searchVideos(params: SearchParams): Promise<PaginatedResponse<SearchResult>> {
    return this.search({ ...params, type: 'video' });
  }

  async updateVideo(videoId: string, updates: VideoUpdateInput): Promise<Video> {
    const current = await this.getVideo(videoId, ['snippet', 'status']);

    const body: Record<string, unknown> = {
      id: videoId,
      snippet: {
        title: updates.title ?? current.snippet?.title,
        description: updates.description ?? current.snippet?.description,
        tags: updates.tags ?? current.snippet?.tags,
        categoryId: updates.categoryId ?? current.snippet?.categoryId,
        defaultLanguage: updates.defaultLanguage ?? current.snippet?.defaultLanguage,
      },
    };

    if (updates.privacyStatus || updates.embeddable !== undefined || updates.publicStatsViewable !== undefined || updates.madeForKids !== undefined) {
      body.status = {
        privacyStatus: updates.privacyStatus ?? current.status?.privacyStatus,
        embeddable: updates.embeddable ?? current.status?.embeddable,
        publicStatsViewable: updates.publicStatsViewable ?? current.status?.publicStatsViewable,
        madeForKids: updates.madeForKids ?? current.status?.madeForKids,
      };
    }

    return this.request<Video>('/videos', {
      method: 'PUT',
      params: { part: 'snippet,status' },
      body: JSON.stringify(body),
    });
  }

  async deleteVideo(videoId: string): Promise<void> {
    await this.request<void>('/videos', {
      method: 'DELETE',
      params: { id: videoId },
    });
  }

  async rateVideo(videoId: string, rating: 'like' | 'dislike' | 'none'): Promise<void> {
    await this.request<void>('/videos/rate', {
      method: 'POST',
      params: { id: videoId, rating },
    });
  }

  async getVideoRating(videoIds: string[]): Promise<VideoRating[]> {
    const response = await this.request<{ items: VideoRating[] }>('/videos/getRating', {
      params: { id: videoIds.join(',') },
    });
    return response.items || [];
  }

  async reportVideoAbuse(
    videoId: string,
    reasonId: string,
    secondaryReasonId?: string,
    comments?: string
  ): Promise<void> {
    const body: Record<string, string> = {
      videoId,
      reasonId,
    };
    if (secondaryReasonId) body.secondaryReasonId = secondaryReasonId;
    if (comments) body.comments = comments;

    await this.request<void>('/videos/reportAbuse', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ===========================================================================
  // Channels
  // ===========================================================================

  async getMyChannel(parts: string[] = ['snippet', 'contentDetails', 'statistics']): Promise<Channel> {
    const response = await this.request<YouTubeListResponse<Channel>>('/channels', {
      params: { part: parts.join(','), mine: true },
    });
    if (!response.items?.length) {
      throw new NotFoundError('Channel', 'mine');
    }
    return response.items[0];
  }

  async getChannel(channelId: string, parts: string[] = ['snippet', 'contentDetails', 'statistics']): Promise<Channel> {
    const result = await this.listChannels([channelId], parts);
    if (result.items.length === 0) {
      throw new NotFoundError('Channel', channelId);
    }
    return result.items[0];
  }

  async listChannels(ids: string[], parts: string[] = ['snippet', 'contentDetails', 'statistics']): Promise<PaginatedResponse<Channel>> {
    const response = await this.request<YouTubeListResponse<Channel>>('/channels', {
      params: {
        part: parts.join(','),
        id: ids.join(','),
      },
    });
    return this.toPaginatedResponse(response);
  }

  async listChannelsByUsername(username: string, parts: string[] = ['snippet', 'contentDetails', 'statistics']): Promise<PaginatedResponse<Channel>> {
    const response = await this.request<YouTubeListResponse<Channel>>('/channels', {
      params: {
        part: parts.join(','),
        forUsername: username,
      },
    });
    return this.toPaginatedResponse(response);
  }

  async updateChannel(channelId: string, updates: ChannelUpdateInput): Promise<Channel> {
    const body = {
      id: channelId,
      brandingSettings: {
        channel: {
          description: updates.description,
          keywords: updates.keywords,
          defaultLanguage: updates.defaultLanguage,
          country: updates.country,
          unsubscribedTrailer: updates.unsubscribedTrailer,
        },
      },
    };

    return this.request<Channel>('/channels', {
      method: 'PUT',
      params: { part: 'brandingSettings' },
      body: JSON.stringify(body),
    });
  }

  // ===========================================================================
  // Playlists
  // ===========================================================================

  async listMyPlaylists(
    params: PaginationParams = {},
    parts: string[] = ['snippet', 'contentDetails', 'status']
  ): Promise<PaginatedResponse<Playlist>> {
    const response = await this.request<YouTubeListResponse<Playlist>>('/playlists', {
      params: {
        part: parts.join(','),
        mine: true,
        maxResults: params.maxResults || 25,
        pageToken: params.pageToken,
      },
    });
    return this.toPaginatedResponse(response);
  }

  async listChannelPlaylists(
    channelId: string,
    params: PaginationParams = {},
    parts: string[] = ['snippet', 'contentDetails', 'status']
  ): Promise<PaginatedResponse<Playlist>> {
    const response = await this.request<YouTubeListResponse<Playlist>>('/playlists', {
      params: {
        part: parts.join(','),
        channelId,
        maxResults: params.maxResults || 25,
        pageToken: params.pageToken,
      },
    });
    return this.toPaginatedResponse(response);
  }

  async getPlaylist(playlistId: string, parts: string[] = ['snippet', 'contentDetails', 'status']): Promise<Playlist> {
    const response = await this.request<YouTubeListResponse<Playlist>>('/playlists', {
      params: {
        part: parts.join(','),
        id: playlistId,
      },
    });
    if (!response.items?.length) {
      throw new NotFoundError('Playlist', playlistId);
    }
    return response.items[0];
  }

  async createPlaylist(input: PlaylistCreateInput): Promise<Playlist> {
    const body = {
      snippet: {
        title: input.title,
        description: input.description,
        defaultLanguage: input.defaultLanguage,
      },
      status: {
        privacyStatus: input.privacyStatus || 'private',
      },
    };

    return this.request<Playlist>('/playlists', {
      method: 'POST',
      params: { part: 'snippet,status' },
      body: JSON.stringify(body),
    });
  }

  async updatePlaylist(playlistId: string, updates: PlaylistUpdateInput): Promise<Playlist> {
    const current = await this.getPlaylist(playlistId, ['snippet', 'status']);

    const body = {
      id: playlistId,
      snippet: {
        title: updates.title ?? current.snippet?.title,
        description: updates.description ?? current.snippet?.description,
        defaultLanguage: updates.defaultLanguage ?? current.snippet?.defaultLanguage,
      },
      status: {
        privacyStatus: updates.privacyStatus ?? current.status?.privacyStatus,
      },
    };

    return this.request<Playlist>('/playlists', {
      method: 'PUT',
      params: { part: 'snippet,status' },
      body: JSON.stringify(body),
    });
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    await this.request<void>('/playlists', {
      method: 'DELETE',
      params: { id: playlistId },
    });
  }

  // ===========================================================================
  // Playlist Items
  // ===========================================================================

  async listPlaylistItems(
    playlistId: string,
    params: PaginationParams = {},
    parts: string[] = ['snippet', 'contentDetails', 'status']
  ): Promise<PaginatedResponse<PlaylistItem>> {
    const response = await this.request<YouTubeListResponse<PlaylistItem>>('/playlistItems', {
      params: {
        part: parts.join(','),
        playlistId,
        maxResults: params.maxResults || 25,
        pageToken: params.pageToken,
      },
    });
    return this.toPaginatedResponse(response);
  }

  async addVideoToPlaylist(playlistId: string, videoId: string, position?: number): Promise<PlaylistItem> {
    const body: Record<string, unknown> = {
      snippet: {
        playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId,
        },
      },
    };
    if (position !== undefined) {
      (body.snippet as Record<string, unknown>).position = position;
    }

    return this.request<PlaylistItem>('/playlistItems', {
      method: 'POST',
      params: { part: 'snippet' },
      body: JSON.stringify(body),
    });
  }

  async updatePlaylistItem(playlistItemId: string, playlistId: string, videoId: string, position: number): Promise<PlaylistItem> {
    const body = {
      id: playlistItemId,
      snippet: {
        playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId,
        },
        position,
      },
    };

    return this.request<PlaylistItem>('/playlistItems', {
      method: 'PUT',
      params: { part: 'snippet' },
      body: JSON.stringify(body),
    });
  }

  async removeFromPlaylist(playlistItemId: string): Promise<void> {
    await this.request<void>('/playlistItems', {
      method: 'DELETE',
      params: { id: playlistItemId },
    });
  }

  // ===========================================================================
  // Comments
  // ===========================================================================

  async listCommentThreads(params: CommentThreadListParams): Promise<PaginatedResponse<CommentThread>> {
    const requestParams: Record<string, string | number | boolean | undefined> = {
      part: 'snippet,replies',
      maxResults: params.maxResults || 25,
      pageToken: params.pageToken,
      order: params.order,
      searchTerms: params.searchTerms,
      moderationStatus: params.moderationStatus,
    };

    if (params.videoId) {
      requestParams.videoId = params.videoId;
    } else if (params.channelId) {
      requestParams.channelId = params.channelId;
    } else if (params.allThreadsRelatedToChannelId) {
      requestParams.allThreadsRelatedToChannelId = params.allThreadsRelatedToChannelId;
    }

    const response = await this.request<YouTubeListResponse<CommentThread>>('/commentThreads', {
      params: requestParams,
    });
    return this.toPaginatedResponse(response);
  }

  async getCommentThread(commentThreadId: string, parts: string[] = ['snippet', 'replies']): Promise<CommentThread> {
    const response = await this.request<YouTubeListResponse<CommentThread>>('/commentThreads', {
      params: {
        part: parts.join(','),
        id: commentThreadId,
      },
    });
    if (!response.items?.length) {
      throw new NotFoundError('CommentThread', commentThreadId);
    }
    return response.items[0];
  }

  async postComment(channelId: string, videoId: string | undefined, text: string): Promise<CommentThread> {
    const snippet: Record<string, unknown> = {
      channelId,
      topLevelComment: {
        snippet: {
          textOriginal: text,
        },
      },
    };
    if (videoId) {
      snippet.videoId = videoId;
    }

    return this.request<CommentThread>('/commentThreads', {
      method: 'POST',
      params: { part: 'snippet' },
      body: JSON.stringify({ snippet }),
    });
  }

  async listComments(
    parentId: string,
    params: PaginationParams = {},
    parts: string[] = ['snippet']
  ): Promise<PaginatedResponse<Comment>> {
    const response = await this.request<YouTubeListResponse<Comment>>('/comments', {
      params: {
        part: parts.join(','),
        parentId,
        maxResults: params.maxResults || 25,
        pageToken: params.pageToken,
      },
    });
    return this.toPaginatedResponse(response);
  }

  async replyToComment(parentId: string, text: string): Promise<Comment> {
    return this.request<Comment>('/comments', {
      method: 'POST',
      params: { part: 'snippet' },
      body: JSON.stringify({
        snippet: {
          parentId,
          textOriginal: text,
        },
      }),
    });
  }

  async updateComment(commentId: string, text: string): Promise<Comment> {
    return this.request<Comment>('/comments', {
      method: 'PUT',
      params: { part: 'snippet' },
      body: JSON.stringify({
        id: commentId,
        snippet: {
          textOriginal: text,
        },
      }),
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.request<void>('/comments', {
      method: 'DELETE',
      params: { id: commentId },
    });
  }

  async setCommentModerationStatus(
    commentIds: string[],
    moderationStatus: 'heldForReview' | 'published' | 'rejected',
    banAuthor = false
  ): Promise<void> {
    await this.request<void>('/comments/setModerationStatus', {
      method: 'POST',
      params: {
        id: commentIds.join(','),
        moderationStatus,
        banAuthor,
      },
    });
  }

  // ===========================================================================
  // Subscriptions
  // ===========================================================================

  async listMySubscriptions(
    params: PaginationParams = {},
    parts: string[] = ['snippet', 'contentDetails']
  ): Promise<PaginatedResponse<Subscription>> {
    const response = await this.request<YouTubeListResponse<Subscription>>('/subscriptions', {
      params: {
        part: parts.join(','),
        mine: true,
        maxResults: params.maxResults || 25,
        pageToken: params.pageToken,
      },
    });
    return this.toPaginatedResponse(response);
  }

  async listChannelSubscribers(
    channelId: string,
    params: PaginationParams = {},
    parts: string[] = ['snippet', 'subscriberSnippet']
  ): Promise<PaginatedResponse<Subscription>> {
    const response = await this.request<YouTubeListResponse<Subscription>>('/subscriptions', {
      params: {
        part: parts.join(','),
        mySubscribers: true,
        maxResults: params.maxResults || 25,
        pageToken: params.pageToken,
      },
    });
    return this.toPaginatedResponse(response);
  }

  async subscribe(channelId: string): Promise<Subscription> {
    return this.request<Subscription>('/subscriptions', {
      method: 'POST',
      params: { part: 'snippet' },
      body: JSON.stringify({
        snippet: {
          resourceId: {
            kind: 'youtube#channel',
            channelId,
          },
        },
      }),
    });
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    await this.request<void>('/subscriptions', {
      method: 'DELETE',
      params: { id: subscriptionId },
    });
  }

  // ===========================================================================
  // Captions
  // ===========================================================================

  async listCaptions(videoId: string, parts: string[] = ['snippet']): Promise<Caption[]> {
    const response = await this.request<YouTubeListResponse<Caption>>('/captions', {
      params: {
        part: parts.join(','),
        videoId,
      },
    });
    return response.items || [];
  }

  async downloadCaption(captionId: string, format?: string, language?: string): Promise<string> {
    const params: Record<string, string | undefined> = {};
    if (format) params.tfmt = format;
    if (language) params.tlang = language;

    const response = await fetch(
      `${API_BASE_URL}/captions/${captionId}?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][])}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new YouTubeApiError(`Failed to download caption: ${response.status}`, response.status);
    }

    return response.text();
  }

  async insertCaption(videoId: string, caption: CaptionInsertInput): Promise<Caption> {
    const metadata = {
      snippet: {
        videoId,
        language: caption.language,
        name: caption.name,
        isDraft: caption.isDraft ?? false,
      },
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('media', new Blob([caption.captionData], { type: 'text/plain' }));

    const response = await fetch(
      `https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.credentials.accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new YouTubeApiError(`Failed to insert caption: ${errorBody}`, response.status);
    }

    return response.json() as Promise<Caption>;
  }

  async updateCaption(captionId: string, updates: CaptionUpdateInput): Promise<Caption> {
    const body: Record<string, unknown> = {
      id: captionId,
    };

    if (updates.isDraft !== undefined) {
      body.snippet = { isDraft: updates.isDraft };
    }

    if (updates.captionData) {
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(body)], { type: 'application/json' }));
      formData.append('media', new Blob([updates.captionData], { type: 'text/plain' }));

      const response = await fetch(
        `https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.credentials.accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new YouTubeApiError(`Failed to update caption: ${errorBody}`, response.status);
      }

      return response.json() as Promise<Caption>;
    }

    return this.request<Caption>('/captions', {
      method: 'PUT',
      params: { part: 'snippet' },
      body: JSON.stringify(body),
    });
  }

  async deleteCaption(captionId: string): Promise<void> {
    await this.request<void>('/captions', {
      method: 'DELETE',
      params: { id: captionId },
    });
  }

  // ===========================================================================
  // Activities
  // ===========================================================================

  async listActivities(params: ActivityListParams): Promise<PaginatedResponse<Activity>> {
    const requestParams: Record<string, string | number | boolean | undefined> = {
      part: 'snippet,contentDetails',
      maxResults: params.maxResults || 25,
      pageToken: params.pageToken,
      publishedAfter: params.publishedAfter,
      publishedBefore: params.publishedBefore,
      regionCode: params.regionCode,
    };

    if (params.mine) {
      requestParams.mine = true;
    } else if (params.channelId) {
      requestParams.channelId = params.channelId;
    }

    const response = await this.request<YouTubeListResponse<Activity>>('/activities', {
      params: requestParams,
    });
    return this.toPaginatedResponse(response);
  }

  // ===========================================================================
  // Channel Sections
  // ===========================================================================

  async listChannelSections(channelId: string, parts: string[] = ['snippet', 'contentDetails']): Promise<ChannelSection[]> {
    const response = await this.request<YouTubeListResponse<ChannelSection>>('/channelSections', {
      params: {
        part: parts.join(','),
        channelId,
      },
    });
    return response.items || [];
  }

  async insertChannelSection(input: ChannelSectionInput): Promise<ChannelSection> {
    const body: Record<string, unknown> = {
      snippet: {
        type: input.type,
        title: input.title,
        position: input.position,
      },
    };

    if (input.playlistIds || input.channelIds) {
      body.contentDetails = {
        playlists: input.playlistIds,
        channels: input.channelIds,
      };
    }

    return this.request<ChannelSection>('/channelSections', {
      method: 'POST',
      params: { part: 'snippet,contentDetails' },
      body: JSON.stringify(body),
    });
  }

  async updateChannelSection(sectionId: string, input: ChannelSectionInput): Promise<ChannelSection> {
    const body: Record<string, unknown> = {
      id: sectionId,
      snippet: {
        type: input.type,
        title: input.title,
        position: input.position,
      },
    };

    if (input.playlistIds || input.channelIds) {
      body.contentDetails = {
        playlists: input.playlistIds,
        channels: input.channelIds,
      };
    }

    return this.request<ChannelSection>('/channelSections', {
      method: 'PUT',
      params: { part: 'snippet,contentDetails' },
      body: JSON.stringify(body),
    });
  }

  async deleteChannelSection(sectionId: string): Promise<void> {
    await this.request<void>('/channelSections', {
      method: 'DELETE',
      params: { id: sectionId },
    });
  }

  // ===========================================================================
  // i18n
  // ===========================================================================

  async listI18nLanguages(hl?: string): Promise<I18nLanguage[]> {
    const response = await this.request<YouTubeListResponse<I18nLanguage>>('/i18nLanguages', {
      params: {
        part: 'snippet',
        hl,
      },
    });
    return response.items || [];
  }

  async listI18nRegions(hl?: string): Promise<I18nRegion[]> {
    const response = await this.request<YouTubeListResponse<I18nRegion>>('/i18nRegions', {
      params: {
        part: 'snippet',
        hl,
      },
    });
    return response.items || [];
  }

  // ===========================================================================
  // Video Categories
  // ===========================================================================

  async listVideoCategories(regionCode = 'US', hl?: string): Promise<VideoCategory[]> {
    const response = await this.request<YouTubeListResponse<VideoCategory>>('/videoCategories', {
      params: {
        part: 'snippet',
        regionCode,
        hl,
      },
    });
    return response.items || [];
  }

  // ===========================================================================
  // Video Abuse Report Reasons
  // ===========================================================================

  async listVideoAbuseReportReasons(hl?: string): Promise<VideoAbuseReportReason[]> {
    const response = await this.request<YouTubeListResponse<VideoAbuseReportReason>>('/videoAbuseReportReasons', {
      params: {
        part: 'snippet',
        hl,
      },
    });
    return response.items || [];
  }

  // ===========================================================================
  // Members & Memberships
  // ===========================================================================

  async listMembers(params: MemberListParams = {}): Promise<PaginatedResponse<Member>> {
    const response = await this.request<YouTubeListResponse<Member>>('/members', {
      params: {
        part: 'snippet',
        mode: params.mode || 'all_current',
        maxResults: params.maxResults || 25,
        pageToken: params.pageToken,
        hasAccessToLevel: params.hasAccessToLevel,
        filterByMemberChannelId: params.filterByMemberChannelId,
      },
    });
    return this.toPaginatedResponse(response);
  }

  async listMembershipsLevels(parts: string[] = ['snippet']): Promise<MembershipsLevel[]> {
    const response = await this.request<YouTubeListResponse<MembershipsLevel>>('/membershipsLevels', {
      params: {
        part: parts.join(','),
      },
    });
    return response.items || [];
  }

  // ===========================================================================
  // Search
  // ===========================================================================

  async search(params: SearchParams): Promise<PaginatedResponse<SearchResult>> {
    const requestParams: Record<string, string | number | boolean | undefined> = {
      part: 'snippet',
      q: params.q,
      type: params.type,
      channelId: params.channelId,
      order: params.order,
      maxResults: params.maxResults || 25,
      pageToken: params.pageToken,
      publishedAfter: params.publishedAfter,
      publishedBefore: params.publishedBefore,
      regionCode: params.regionCode,
      relevanceLanguage: params.relevanceLanguage,
      safeSearch: params.safeSearch,
      videoCategoryId: params.videoCategoryId,
      videoDefinition: params.videoDefinition,
      videoDimension: params.videoDimension,
      videoDuration: params.videoDuration,
      videoEmbeddable: params.videoEmbeddable,
      videoLicense: params.videoLicense,
      videoType: params.videoType,
      eventType: params.eventType,
      forMine: params.forMine,
      forContentOwner: params.forContentOwner,
      location: params.location,
      locationRadius: params.locationRadius,
      topicId: params.topicId,
    };

    const response = await this.request<YouTubeListResponse<SearchResult>>('/search', {
      params: requestParams,
    });
    return this.toPaginatedResponse(response);
  }
}

// =============================================================================
// Types for YouTube API Responses
// =============================================================================

interface YouTubeListResponse<T> {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
  items?: T[];
}

// =============================================================================
// Factory Function
// =============================================================================

export function createYouTubeClient(credentials: TenantCredentials): YouTubeClient {
  return new YouTubeClientImpl(credentials);
}
