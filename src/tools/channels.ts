/**
 * Channel Tools
 *
 * MCP tools for YouTube channel operations.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerChannelTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // Get My Channel
  // ===========================================================================
  server.tool(
    'youtube_get_my_channel',
    `Get the authenticated user's YouTube channel.

Requires OAuth authentication.

Args:
  - parts: Resource parts to include (snippet, contentDetails, statistics, status, brandingSettings, topicDetails, auditDetails)
  - format: Response format

Returns:
  Channel details for the authenticated user.`,
    {
      parts: z
        .array(z.string())
        .optional()
        .default(['snippet', 'contentDetails', 'statistics'])
        .describe('Resource parts to include'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ parts, format }) => {
      try {
        const channel = await client.getMyChannel(parts);
        return formatResponse(channel, format, 'channel');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Channel
  // ===========================================================================
  server.tool(
    'youtube_get_channel',
    `Get a YouTube channel by ID.

Args:
  - channelId: The YouTube channel ID
  - parts: Resource parts to include
  - format: Response format

Returns:
  Channel details.`,
    {
      channelId: z.string().describe('YouTube channel ID'),
      parts: z
        .array(z.string())
        .optional()
        .default(['snippet', 'contentDetails', 'statistics'])
        .describe('Resource parts to include'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ channelId, parts, format }) => {
      try {
        const channel = await client.getChannel(channelId, parts);
        return formatResponse(channel, format, 'channel');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Channels
  // ===========================================================================
  server.tool(
    'youtube_list_channels',
    `Get multiple YouTube channels by ID.

Args:
  - channelIds: Array of channel IDs (max 50)
  - parts: Resource parts to include
  - format: Response format

Returns:
  List of channel details.`,
    {
      channelIds: z.array(z.string()).max(50).describe('Array of channel IDs'),
      parts: z
        .array(z.string())
        .optional()
        .default(['snippet', 'contentDetails', 'statistics'])
        .describe('Resource parts'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ channelIds, parts, format }) => {
      try {
        const result = await client.listChannels(channelIds, parts);
        return formatResponse(result, format, 'channels');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Channel By Username
  // ===========================================================================
  server.tool(
    'youtube_get_channel_by_username',
    `Get a YouTube channel by username.

Args:
  - username: The YouTube username
  - parts: Resource parts to include
  - format: Response format

Returns:
  Channel details.`,
    {
      username: z.string().describe('YouTube username'),
      parts: z
        .array(z.string())
        .optional()
        .default(['snippet', 'contentDetails', 'statistics'])
        .describe('Resource parts'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ username, parts, format }) => {
      try {
        const result = await client.listChannelsByUsername(username, parts);
        if (result.items.length === 0) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: `Channel not found for username: ${username}` }, null, 2) }],
            isError: true,
          };
        }
        return formatResponse(result.items[0], format, 'channel');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Channel
  // ===========================================================================
  server.tool(
    'youtube_update_channel',
    `Update a YouTube channel's branding settings.

Requires OAuth authentication. You can only update your own channel.

Args:
  - channelId: The channel ID to update
  - description: New channel description
  - keywords: Channel keywords (space-separated)
  - defaultLanguage: Default language code
  - country: Country code
  - unsubscribedTrailer: Video ID for unsubscribed viewer trailer

Returns:
  Updated channel details.`,
    {
      channelId: z.string().describe('Channel ID to update'),
      description: z.string().optional().describe('New description'),
      keywords: z.string().optional().describe('Keywords (space-separated)'),
      defaultLanguage: z.string().optional().describe('Default language code'),
      country: z.string().optional().describe('Country code'),
      unsubscribedTrailer: z.string().optional().describe('Unsubscribed trailer video ID'),
    },
    async ({ channelId, description, keywords, defaultLanguage, country, unsubscribedTrailer }) => {
      try {
        const channel = await client.updateChannel(channelId, {
          description,
          keywords,
          defaultLanguage,
          country,
          unsubscribedTrailer,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Channel updated', channel }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Search Channels
  // ===========================================================================
  server.tool(
    'youtube_search_channels',
    `Search for YouTube channels.

Args:
  - query: Search query string
  - maxResults: Maximum results to return (1-50)
  - pageToken: Pagination token
  - order: Sort order (date, rating, relevance, title, videoCount, viewCount)
  - regionCode: ISO country code
  - format: Response format

Returns:
  Search results with channel snippets.`,
    {
      query: z.string().describe('Search query'),
      maxResults: z.number().int().min(1).max(50).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      order: z.enum(['date', 'rating', 'relevance', 'title', 'videoCount', 'viewCount']).optional(),
      regionCode: z.string().optional().describe('ISO country code'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ query, maxResults, pageToken, order, regionCode, format }) => {
      try {
        const result = await client.search({
          q: query,
          type: 'channel',
          maxResults,
          pageToken,
          order,
          regionCode,
        });
        return formatResponse(result, format, 'searchResults');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
