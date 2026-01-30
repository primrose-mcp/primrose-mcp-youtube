/**
 * Playlist Tools
 *
 * MCP tools for YouTube playlist operations.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerPlaylistTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // List My Playlists
  // ===========================================================================
  server.tool(
    'youtube_list_my_playlists',
    `List the authenticated user's playlists.

Requires OAuth authentication.

Args:
  - maxResults: Maximum results to return (1-50)
  - pageToken: Pagination token
  - parts: Resource parts to include
  - format: Response format

Returns:
  Paginated list of playlists.`,
    {
      maxResults: z.number().int().min(1).max(50).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      parts: z
        .array(z.string())
        .optional()
        .default(['snippet', 'contentDetails', 'status'])
        .describe('Resource parts'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ maxResults, pageToken, parts, format }) => {
      try {
        const result = await client.listMyPlaylists({ maxResults, pageToken }, parts);
        return formatResponse(result, format, 'playlists');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Channel Playlists
  // ===========================================================================
  server.tool(
    'youtube_list_channel_playlists',
    `List playlists for a specific channel.

Args:
  - channelId: The channel ID
  - maxResults: Maximum results to return (1-50)
  - pageToken: Pagination token
  - parts: Resource parts to include
  - format: Response format

Returns:
  Paginated list of playlists.`,
    {
      channelId: z.string().describe('Channel ID'),
      maxResults: z.number().int().min(1).max(50).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      parts: z
        .array(z.string())
        .optional()
        .default(['snippet', 'contentDetails', 'status'])
        .describe('Resource parts'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ channelId, maxResults, pageToken, parts, format }) => {
      try {
        const result = await client.listChannelPlaylists(channelId, { maxResults, pageToken }, parts);
        return formatResponse(result, format, 'playlists');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Playlist
  // ===========================================================================
  server.tool(
    'youtube_get_playlist',
    `Get a playlist by ID.

Args:
  - playlistId: The playlist ID
  - parts: Resource parts to include
  - format: Response format

Returns:
  Playlist details.`,
    {
      playlistId: z.string().describe('Playlist ID'),
      parts: z
        .array(z.string())
        .optional()
        .default(['snippet', 'contentDetails', 'status'])
        .describe('Resource parts'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ playlistId, parts, format }) => {
      try {
        const playlist = await client.getPlaylist(playlistId, parts);
        return formatResponse(playlist, format, 'playlist');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Playlist
  // ===========================================================================
  server.tool(
    'youtube_create_playlist',
    `Create a new playlist.

Requires OAuth authentication.

Args:
  - title: Playlist title
  - description: Playlist description
  - privacyStatus: Privacy status (private, public, unlisted)
  - defaultLanguage: Default language code

Returns:
  Created playlist details.`,
    {
      title: z.string().describe('Playlist title'),
      description: z.string().optional().describe('Playlist description'),
      privacyStatus: z.enum(['private', 'public', 'unlisted']).default('private').describe('Privacy status'),
      defaultLanguage: z.string().optional().describe('Default language code'),
    },
    async ({ title, description, privacyStatus, defaultLanguage }) => {
      try {
        const playlist = await client.createPlaylist({
          title,
          description,
          privacyStatus,
          defaultLanguage,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Playlist created', playlist }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Playlist
  // ===========================================================================
  server.tool(
    'youtube_update_playlist',
    `Update a playlist.

Requires OAuth authentication. You can only update your own playlists.

Args:
  - playlistId: Playlist ID to update
  - title: New title
  - description: New description
  - privacyStatus: New privacy status
  - defaultLanguage: New default language

Returns:
  Updated playlist details.`,
    {
      playlistId: z.string().describe('Playlist ID to update'),
      title: z.string().optional().describe('New title'),
      description: z.string().optional().describe('New description'),
      privacyStatus: z.enum(['private', 'public', 'unlisted']).optional().describe('Privacy status'),
      defaultLanguage: z.string().optional().describe('Default language'),
    },
    async ({ playlistId, title, description, privacyStatus, defaultLanguage }) => {
      try {
        const playlist = await client.updatePlaylist(playlistId, {
          title,
          description,
          privacyStatus,
          defaultLanguage,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Playlist updated', playlist }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Playlist
  // ===========================================================================
  server.tool(
    'youtube_delete_playlist',
    `Delete a playlist.

Requires OAuth authentication. You can only delete your own playlists.

Args:
  - playlistId: Playlist ID to delete

Returns:
  Confirmation of deletion.`,
    {
      playlistId: z.string().describe('Playlist ID to delete'),
    },
    async ({ playlistId }) => {
      try {
        await client.deletePlaylist(playlistId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Playlist ${playlistId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Search Playlists
  // ===========================================================================
  server.tool(
    'youtube_search_playlists',
    `Search for YouTube playlists.

Args:
  - query: Search query string
  - maxResults: Maximum results to return (1-50)
  - pageToken: Pagination token
  - channelId: Filter by channel
  - format: Response format

Returns:
  Search results with playlist snippets.`,
    {
      query: z.string().describe('Search query'),
      maxResults: z.number().int().min(1).max(50).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      channelId: z.string().optional().describe('Filter by channel ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ query, maxResults, pageToken, channelId, format }) => {
      try {
        const result = await client.search({
          q: query,
          type: 'playlist',
          maxResults,
          pageToken,
          channelId,
        });
        return formatResponse(result, format, 'searchResults');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
