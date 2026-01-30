/**
 * Search Tools
 *
 * MCP tools for YouTube search operations.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerSearchTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // General Search
  // ===========================================================================
  server.tool(
    'youtube_search',
    `Search YouTube for videos, channels, or playlists.

Args:
  - query: Search query string
  - type: Resource type to search (video, channel, playlist)
  - maxResults: Maximum results to return (1-50)
  - pageToken: Pagination token
  - order: Sort order (date, rating, relevance, title, videoCount, viewCount)
  - channelId: Filter by channel
  - publishedAfter: Filter by publish date (RFC 3339)
  - publishedBefore: Filter by publish date (RFC 3339)
  - regionCode: ISO country code
  - relevanceLanguage: Relevance language code
  - safeSearch: Safe search setting (moderate, none, strict)
  - eventType: Filter live events (completed, live, upcoming)
  - location: Geographic coordinates (lat,lng)
  - locationRadius: Search radius (e.g., "100km", "50mi")
  - topicId: Freebase topic ID
  - videoCategoryId: Video category ID
  - videoDefinition: Filter by definition (any, high, standard)
  - videoDimension: Filter by dimension (2d, 3d, any)
  - videoDuration: Filter by duration (any, long, medium, short)
  - videoEmbeddable: Filter embeddable videos (any, true)
  - videoLicense: Filter by license (any, creativeCommon, youtube)
  - videoType: Filter by type (any, episode, movie)
  - format: Response format

Returns:
  Search results with resource snippets.`,
    {
      query: z.string().describe('Search query'),
      type: z.enum(['video', 'channel', 'playlist']).optional().describe('Resource type'),
      maxResults: z.number().int().min(1).max(50).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      order: z.enum(['date', 'rating', 'relevance', 'title', 'videoCount', 'viewCount']).optional(),
      channelId: z.string().optional().describe('Filter by channel ID'),
      publishedAfter: z.string().optional().describe('Published after (RFC 3339)'),
      publishedBefore: z.string().optional().describe('Published before (RFC 3339)'),
      regionCode: z.string().optional().describe('ISO country code'),
      relevanceLanguage: z.string().optional().describe('Relevance language code'),
      safeSearch: z.enum(['moderate', 'none', 'strict']).optional().describe('Safe search'),
      eventType: z.enum(['completed', 'live', 'upcoming']).optional().describe('Live event type'),
      location: z.string().optional().describe('Geographic coordinates (lat,lng)'),
      locationRadius: z.string().optional().describe('Search radius'),
      topicId: z.string().optional().describe('Freebase topic ID'),
      videoCategoryId: z.string().optional().describe('Video category ID'),
      videoDefinition: z.enum(['any', 'high', 'standard']).optional(),
      videoDimension: z.enum(['2d', '3d', 'any']).optional(),
      videoDuration: z.enum(['any', 'long', 'medium', 'short']).optional(),
      videoEmbeddable: z.enum(['any', 'true']).optional(),
      videoLicense: z.enum(['any', 'creativeCommon', 'youtube']).optional(),
      videoType: z.enum(['any', 'episode', 'movie']).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async (params) => {
      try {
        const { format, ...searchParams } = params;
        const result = await client.search({
          q: searchParams.query,
          type: searchParams.type,
          maxResults: searchParams.maxResults,
          pageToken: searchParams.pageToken,
          order: searchParams.order,
          channelId: searchParams.channelId,
          publishedAfter: searchParams.publishedAfter,
          publishedBefore: searchParams.publishedBefore,
          regionCode: searchParams.regionCode,
          relevanceLanguage: searchParams.relevanceLanguage,
          safeSearch: searchParams.safeSearch,
          eventType: searchParams.eventType,
          location: searchParams.location,
          locationRadius: searchParams.locationRadius,
          topicId: searchParams.topicId,
          videoCategoryId: searchParams.videoCategoryId,
          videoDefinition: searchParams.videoDefinition,
          videoDimension: searchParams.videoDimension,
          videoDuration: searchParams.videoDuration,
          videoEmbeddable: searchParams.videoEmbeddable,
          videoLicense: searchParams.videoLicense,
          videoType: searchParams.videoType,
        });
        return formatResponse(result, format, 'searchResults');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
