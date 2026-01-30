/**
 * Response Formatting Utilities
 *
 * Helpers for formatting tool responses in JSON or Markdown.
 */

import type {
  Channel,
  Comment,
  CommentThread,
  PaginatedResponse,
  Playlist,
  PlaylistItem,
  ResponseFormat,
  SearchResult,
  Subscription,
  Video,
} from '../types/entities.js';
import { YouTubeApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof YouTubeApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).items)
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');

  if (data.totalResults !== undefined) {
    lines.push(`**Total:** ${data.totalResults} | **Showing:** ${data.count}`);
  } else {
    lines.push(`**Showing:** ${data.count}`);
  }

  if (data.hasMore && data.nextPageToken) {
    lines.push(`**More available:** Yes (nextPageToken: \`${data.nextPageToken}\`)`);
  }
  lines.push('');

  if (data.items.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  switch (entityType) {
    case 'videos':
      lines.push(formatVideosTable(data.items as Video[]));
      break;
    case 'channels':
      lines.push(formatChannelsTable(data.items as Channel[]));
      break;
    case 'playlists':
      lines.push(formatPlaylistsTable(data.items as Playlist[]));
      break;
    case 'playlistItems':
      lines.push(formatPlaylistItemsTable(data.items as PlaylistItem[]));
      break;
    case 'searchResults':
      lines.push(formatSearchResultsTable(data.items as SearchResult[]));
      break;
    case 'comments':
      lines.push(formatCommentsTable(data.items as Comment[]));
      break;
    case 'commentThreads':
      lines.push(formatCommentThreadsTable(data.items as CommentThread[]));
      break;
    case 'subscriptions':
      lines.push(formatSubscriptionsTable(data.items as Subscription[]));
      break;
    default:
      lines.push(formatGenericTable(data.items));
  }

  return lines.join('\n');
}

/**
 * Format videos as Markdown table
 */
function formatVideosTable(videos: Video[]): string {
  const lines: string[] = [];
  lines.push('| ID | Title | Channel | Views | Duration |');
  lines.push('|---|---|---|---|---|');

  for (const video of videos) {
    const title = truncate(video.snippet?.title || '-', 40);
    const channel = video.snippet?.channelTitle || '-';
    const views = video.statistics?.viewCount || '-';
    const duration = video.contentDetails?.duration || '-';
    lines.push(`| ${video.id} | ${title} | ${channel} | ${views} | ${duration} |`);
  }

  return lines.join('\n');
}

/**
 * Format channels as Markdown table
 */
function formatChannelsTable(channels: Channel[]): string {
  const lines: string[] = [];
  lines.push('| ID | Title | Subscribers | Videos |');
  lines.push('|---|---|---|---|');

  for (const channel of channels) {
    const title = truncate(channel.snippet?.title || '-', 40);
    const subs = channel.statistics?.subscriberCount || '-';
    const videos = channel.statistics?.videoCount || '-';
    lines.push(`| ${channel.id} | ${title} | ${subs} | ${videos} |`);
  }

  return lines.join('\n');
}

/**
 * Format playlists as Markdown table
 */
function formatPlaylistsTable(playlists: Playlist[]): string {
  const lines: string[] = [];
  lines.push('| ID | Title | Items | Privacy |');
  lines.push('|---|---|---|---|');

  for (const playlist of playlists) {
    const title = truncate(playlist.snippet?.title || '-', 40);
    const items = playlist.contentDetails?.itemCount ?? '-';
    const privacy = playlist.status?.privacyStatus || '-';
    lines.push(`| ${playlist.id} | ${title} | ${items} | ${privacy} |`);
  }

  return lines.join('\n');
}

/**
 * Format playlist items as Markdown table
 */
function formatPlaylistItemsTable(items: PlaylistItem[]): string {
  const lines: string[] = [];
  lines.push('| ID | Position | Video Title | Video ID |');
  lines.push('|---|---|---|---|');

  for (const item of items) {
    const title = truncate(item.snippet?.title || '-', 40);
    const position = item.snippet?.position ?? '-';
    const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId || '-';
    lines.push(`| ${item.id} | ${position} | ${title} | ${videoId} |`);
  }

  return lines.join('\n');
}

/**
 * Format search results as Markdown table
 */
function formatSearchResultsTable(results: SearchResult[]): string {
  const lines: string[] = [];
  lines.push('| Type | ID | Title | Channel |');
  lines.push('|---|---|---|---|');

  for (const result of results) {
    const type = result.id.kind.replace('youtube#', '');
    const id = result.id.videoId || result.id.channelId || result.id.playlistId || '-';
    const title = truncate(result.snippet?.title || '-', 40);
    const channel = result.snippet?.channelTitle || '-';
    lines.push(`| ${type} | ${id} | ${title} | ${channel} |`);
  }

  return lines.join('\n');
}

/**
 * Format comments as Markdown table
 */
function formatCommentsTable(comments: Comment[]): string {
  const lines: string[] = [];
  lines.push('| ID | Author | Comment | Likes |');
  lines.push('|---|---|---|---|');

  for (const comment of comments) {
    const author = comment.snippet?.authorDisplayName || '-';
    const text = truncate(comment.snippet?.textDisplay || '-', 50);
    const likes = comment.snippet?.likeCount ?? '-';
    lines.push(`| ${comment.id} | ${author} | ${text} | ${likes} |`);
  }

  return lines.join('\n');
}

/**
 * Format comment threads as Markdown table
 */
function formatCommentThreadsTable(threads: CommentThread[]): string {
  const lines: string[] = [];
  lines.push('| ID | Author | Comment | Replies |');
  lines.push('|---|---|---|---|');

  for (const thread of threads) {
    const comment = thread.snippet?.topLevelComment;
    const author = comment?.snippet?.authorDisplayName || '-';
    const text = truncate(comment?.snippet?.textDisplay || '-', 50);
    const replies = thread.snippet?.totalReplyCount ?? '-';
    lines.push(`| ${thread.id} | ${author} | ${text} | ${replies} |`);
  }

  return lines.join('\n');
}

/**
 * Format subscriptions as Markdown table
 */
function formatSubscriptionsTable(subscriptions: Subscription[]): string {
  const lines: string[] = [];
  lines.push('| ID | Channel | New Items |');
  lines.push('|---|---|---|');

  for (const sub of subscriptions) {
    const title = truncate(sub.snippet?.title || '-', 40);
    const newItems = sub.contentDetails?.newItemCount ?? '-';
    lines.push(`| ${sub.id} | ${title} | ${newItems} |`);
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5);

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => String(record[k] ?? '-'));
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  return formatGenericTable(data);
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (camelCase to Title Case)
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Truncate a string to a maximum length
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
}
