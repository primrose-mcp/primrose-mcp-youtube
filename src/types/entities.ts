/**
 * YouTube API Entity Types
 *
 * Type definitions for YouTube Data API v3 resources.
 */

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  /** Maximum number of items to return (1-50 for most endpoints) */
  maxResults?: number;
  /** Page token for pagination */
  pageToken?: string;
}

export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Number of items in this response */
  count: number;
  /** Total results available (if provided) */
  totalResults?: number;
  /** Results per page */
  resultsPerPage?: number;
  /** Whether more items are available */
  hasMore: boolean;
  /** Token for next page */
  nextPageToken?: string;
  /** Token for previous page */
  prevPageToken?: string;
}

// =============================================================================
// Common Types
// =============================================================================

export interface Thumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface ThumbnailSet {
  default?: Thumbnail;
  medium?: Thumbnail;
  high?: Thumbnail;
  standard?: Thumbnail;
  maxres?: Thumbnail;
}

export interface Localized {
  title: string;
  description: string;
}

export interface ResourceId {
  kind: string;
  videoId?: string;
  channelId?: string;
  playlistId?: string;
}

// =============================================================================
// Video
// =============================================================================

export interface Video {
  kind: string;
  etag: string;
  id: string;
  snippet?: VideoSnippet;
  contentDetails?: VideoContentDetails;
  status?: VideoStatus;
  statistics?: VideoStatistics;
  player?: VideoPlayer;
  topicDetails?: VideoTopicDetails;
  recordingDetails?: VideoRecordingDetails;
  liveStreamingDetails?: LiveStreamingDetails;
  localizations?: Record<string, Localized>;
}

export interface VideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: ThumbnailSet;
  channelTitle: string;
  tags?: string[];
  categoryId: string;
  liveBroadcastContent: string;
  defaultLanguage?: string;
  localized?: Localized;
  defaultAudioLanguage?: string;
}

export interface VideoContentDetails {
  duration: string;
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
  regionRestriction?: {
    allowed?: string[];
    blocked?: string[];
  };
  contentRating?: Record<string, string>;
  projection?: string;
  hasCustomThumbnail?: boolean;
}

export interface VideoStatus {
  uploadStatus: string;
  failureReason?: string;
  rejectionReason?: string;
  privacyStatus: string;
  publishAt?: string;
  license: string;
  embeddable: boolean;
  publicStatsViewable: boolean;
  madeForKids: boolean;
  selfDeclaredMadeForKids?: boolean;
}

export interface VideoStatistics {
  viewCount: string;
  likeCount?: string;
  dislikeCount?: string;
  favoriteCount: string;
  commentCount?: string;
}

export interface VideoPlayer {
  embedHtml: string;
  embedHeight?: number;
  embedWidth?: number;
}

export interface VideoTopicDetails {
  topicIds?: string[];
  relevantTopicIds?: string[];
  topicCategories?: string[];
}

export interface VideoRecordingDetails {
  recordingDate?: string;
}

export interface LiveStreamingDetails {
  actualStartTime?: string;
  actualEndTime?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  concurrentViewers?: string;
  activeLiveChatId?: string;
}

// =============================================================================
// Channel
// =============================================================================

export interface Channel {
  kind: string;
  etag: string;
  id: string;
  snippet?: ChannelSnippet;
  contentDetails?: ChannelContentDetails;
  statistics?: ChannelStatistics;
  topicDetails?: ChannelTopicDetails;
  status?: ChannelStatus;
  brandingSettings?: ChannelBrandingSettings;
  auditDetails?: ChannelAuditDetails;
  contentOwnerDetails?: ChannelContentOwnerDetails;
  localizations?: Record<string, Localized>;
}

export interface ChannelSnippet {
  title: string;
  description: string;
  customUrl?: string;
  publishedAt: string;
  thumbnails: ThumbnailSet;
  defaultLanguage?: string;
  localized?: Localized;
  country?: string;
}

export interface ChannelContentDetails {
  relatedPlaylists: {
    likes?: string;
    favorites?: string;
    uploads?: string;
  };
}

export interface ChannelStatistics {
  viewCount: string;
  subscriberCount?: string;
  hiddenSubscriberCount: boolean;
  videoCount: string;
}

export interface ChannelTopicDetails {
  topicIds?: string[];
  topicCategories?: string[];
}

export interface ChannelStatus {
  privacyStatus: string;
  isLinked: boolean;
  longUploadsStatus?: string;
  madeForKids?: boolean;
  selfDeclaredMadeForKids?: boolean;
}

export interface ChannelBrandingSettings {
  channel: {
    title?: string;
    description?: string;
    keywords?: string;
    trackingAnalyticsAccountId?: string;
    unsubscribedTrailer?: string;
    defaultLanguage?: string;
    country?: string;
  };
  image?: {
    bannerExternalUrl?: string;
  };
}

export interface ChannelAuditDetails {
  overallGoodStanding: boolean;
  communityGuidelinesGoodStanding: boolean;
  copyrightStrikesGoodStanding: boolean;
  contentIdClaimsGoodStanding: boolean;
}

export interface ChannelContentOwnerDetails {
  contentOwner?: string;
  timeLinked?: string;
}

// =============================================================================
// Playlist
// =============================================================================

export interface Playlist {
  kind: string;
  etag: string;
  id: string;
  snippet?: PlaylistSnippet;
  status?: PlaylistStatus;
  contentDetails?: PlaylistContentDetails;
  player?: PlaylistPlayer;
  localizations?: Record<string, Localized>;
}

export interface PlaylistSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: ThumbnailSet;
  channelTitle: string;
  defaultLanguage?: string;
  localized?: Localized;
}

export interface PlaylistStatus {
  privacyStatus: string;
  podcastStatus?: string;
}

export interface PlaylistContentDetails {
  itemCount: number;
}

export interface PlaylistPlayer {
  embedHtml: string;
}

// =============================================================================
// Playlist Item
// =============================================================================

export interface PlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet?: PlaylistItemSnippet;
  contentDetails?: PlaylistItemContentDetails;
  status?: PlaylistItemStatus;
}

export interface PlaylistItemSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: ThumbnailSet;
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: ResourceId;
  videoOwnerChannelTitle?: string;
  videoOwnerChannelId?: string;
}

export interface PlaylistItemContentDetails {
  videoId: string;
  startAt?: string;
  endAt?: string;
  note?: string;
  videoPublishedAt?: string;
}

export interface PlaylistItemStatus {
  privacyStatus: string;
}

// =============================================================================
// Search Result
// =============================================================================

export interface SearchResult {
  kind: string;
  etag: string;
  id: ResourceId;
  snippet?: SearchResultSnippet;
}

export interface SearchResultSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: ThumbnailSet;
  channelTitle: string;
  liveBroadcastContent?: string;
}

// =============================================================================
// Comment & Comment Thread
// =============================================================================

export interface CommentThread {
  kind: string;
  etag: string;
  id: string;
  snippet?: CommentThreadSnippet;
  replies?: CommentThreadReplies;
}

export interface CommentThreadSnippet {
  channelId: string;
  videoId?: string;
  topLevelComment: Comment;
  canReply: boolean;
  totalReplyCount: number;
  isPublic: boolean;
}

export interface CommentThreadReplies {
  comments: Comment[];
}

export interface Comment {
  kind: string;
  etag: string;
  id: string;
  snippet?: CommentSnippet;
}

export interface CommentSnippet {
  authorDisplayName: string;
  authorProfileImageUrl: string;
  authorChannelUrl?: string;
  authorChannelId?: { value: string };
  channelId?: string;
  videoId?: string;
  textDisplay: string;
  textOriginal: string;
  parentId?: string;
  canRate: boolean;
  viewerRating: string;
  likeCount: number;
  moderationStatus?: string;
  publishedAt: string;
  updatedAt: string;
}

// =============================================================================
// Subscription
// =============================================================================

export interface Subscription {
  kind: string;
  etag: string;
  id: string;
  snippet?: SubscriptionSnippet;
  contentDetails?: SubscriptionContentDetails;
  subscriberSnippet?: SubscriberSnippet;
}

export interface SubscriptionSnippet {
  publishedAt: string;
  title: string;
  description: string;
  resourceId: ResourceId;
  channelId: string;
  thumbnails: ThumbnailSet;
}

export interface SubscriptionContentDetails {
  totalItemCount: number;
  newItemCount: number;
  activityType: string;
}

export interface SubscriberSnippet {
  title: string;
  description: string;
  channelId: string;
  thumbnails: ThumbnailSet;
}

// =============================================================================
// Caption
// =============================================================================

export interface Caption {
  kind: string;
  etag: string;
  id: string;
  snippet?: CaptionSnippet;
}

export interface CaptionSnippet {
  videoId: string;
  lastUpdated: string;
  trackKind: string;
  language: string;
  name: string;
  audioTrackType: string;
  isCC: boolean;
  isLarge: boolean;
  isEasyReader: boolean;
  isDraft: boolean;
  isAutoSynced: boolean;
  status: string;
  failureReason?: string;
}

// =============================================================================
// Activity
// =============================================================================

export interface Activity {
  kind: string;
  etag: string;
  id: string;
  snippet?: ActivitySnippet;
  contentDetails?: ActivityContentDetails;
}

export interface ActivitySnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: ThumbnailSet;
  channelTitle: string;
  type: string;
  groupId?: string;
}

export interface ActivityContentDetails {
  upload?: { videoId: string };
  like?: { resourceId: ResourceId };
  favorite?: { resourceId: ResourceId };
  comment?: { resourceId: ResourceId };
  subscription?: { resourceId: ResourceId };
  playlistItem?: { resourceId: ResourceId; playlistId: string; playlistItemId: string };
  recommendation?: { resourceId: ResourceId; reason: string; seedResourceId: ResourceId };
  social?: { type: string; resourceId: ResourceId; author: string; referenceUrl: string; imageUrl: string };
  channelItem?: { resourceId: ResourceId };
}

// =============================================================================
// Channel Section
// =============================================================================

export interface ChannelSection {
  kind: string;
  etag: string;
  id: string;
  snippet?: ChannelSectionSnippet;
  contentDetails?: ChannelSectionContentDetails;
}

export interface ChannelSectionSnippet {
  type: string;
  channelId: string;
  title: string;
  position: number;
  defaultLanguage?: string;
  localized?: Localized;
}

export interface ChannelSectionContentDetails {
  playlists?: string[];
  channels?: string[];
}

// =============================================================================
// i18n Types
// =============================================================================

export interface I18nLanguage {
  kind: string;
  etag: string;
  id: string;
  snippet?: {
    hl: string;
    name: string;
  };
}

export interface I18nRegion {
  kind: string;
  etag: string;
  id: string;
  snippet?: {
    gl: string;
    name: string;
  };
}

// =============================================================================
// Video Category
// =============================================================================

export interface VideoCategory {
  kind: string;
  etag: string;
  id: string;
  snippet?: {
    channelId: string;
    title: string;
    assignable: boolean;
  };
}

// =============================================================================
// Video Abuse Report Reason
// =============================================================================

export interface VideoAbuseReportReason {
  kind: string;
  etag: string;
  id: string;
  snippet?: {
    label: string;
    secondaryReasons?: Array<{
      id: string;
      label: string;
    }>;
  };
}

// =============================================================================
// Member & Membership Level
// =============================================================================

export interface Member {
  kind: string;
  etag: string;
  snippet?: MemberSnippet;
}

export interface MemberSnippet {
  creatorChannelId: string;
  memberDetails: {
    channelId: string;
    channelUrl: string;
    displayName: string;
    profileImageUrl: string;
  };
  membershipsDetails: {
    highestAccessibleLevel: string;
    highestAccessibleLevelDisplayName: string;
    membershipsDuration: {
      memberSince: string;
      memberTotalDurationMonths: number;
    };
    accessibleLevels: string[];
  };
}

export interface MembershipsLevel {
  kind: string;
  etag: string;
  id: string;
  snippet?: {
    creatorChannelId: string;
    levelDetails: {
      displayName: string;
    };
  };
}

// =============================================================================
// Watermark
// =============================================================================

export interface WatermarkTiming {
  type: string;
  offsetMs: number;
  durationMs?: number;
}

export interface WatermarkPosition {
  type: string;
  cornerPosition: string;
}

export interface Watermark {
  timing: WatermarkTiming;
  position: WatermarkPosition;
  imageUrl: string;
  imageBytes: string;
  targetChannelId: string;
}

// =============================================================================
// Channel Banner
// =============================================================================

export interface ChannelBanner {
  kind: string;
  etag: string;
  url: string;
}

// =============================================================================
// Playlist Image
// =============================================================================

export interface PlaylistImage {
  kind: string;
  id: string;
  snippet?: {
    playlistId: string;
    type: string;
    width?: number;
    height?: number;
  };
}

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';

// =============================================================================
// Video Parts
// =============================================================================

export type VideoPart =
  | 'contentDetails'
  | 'fileDetails'
  | 'id'
  | 'liveStreamingDetails'
  | 'localizations'
  | 'player'
  | 'processingDetails'
  | 'recordingDetails'
  | 'snippet'
  | 'statistics'
  | 'status'
  | 'suggestions'
  | 'topicDetails';

export type ChannelPart =
  | 'auditDetails'
  | 'brandingSettings'
  | 'contentDetails'
  | 'contentOwnerDetails'
  | 'id'
  | 'localizations'
  | 'snippet'
  | 'statistics'
  | 'status'
  | 'topicDetails';

export type PlaylistPart =
  | 'contentDetails'
  | 'id'
  | 'localizations'
  | 'player'
  | 'snippet'
  | 'status';

export type PlaylistItemPart = 'contentDetails' | 'id' | 'snippet' | 'status';

export type CommentPart = 'id' | 'snippet';

export type CommentThreadPart = 'id' | 'replies' | 'snippet';

export type SubscriptionPart = 'contentDetails' | 'id' | 'snippet' | 'subscriberSnippet';

export type CaptionPart = 'id' | 'snippet';

export type ActivityPart = 'contentDetails' | 'id' | 'snippet';

export type ChannelSectionPart = 'contentDetails' | 'id' | 'snippet' | 'targeting';
