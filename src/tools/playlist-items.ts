/**
 * Playlist Item Tools
 *
 * MCP tools for managing videos within YouTube playlists.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerPlaylistItemTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // List Playlist Items
  // ===========================================================================
  server.tool(
    'youtube_list_playlist_items',
    `List videos in a playlist.

Args:
  - playlistId: The playlist ID
  - maxResults: Maximum results to return (1-50)
  - pageToken: Pagination token
  - parts: Resource parts to include
  - format: Response format

Returns:
  Paginated list of playlist items (videos).`,
    {
      playlistId: z.string().describe('Playlist ID'),
      maxResults: z.number().int().min(1).max(50).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      parts: z
        .array(z.string())
        .optional()
        .default(['snippet', 'contentDetails', 'status'])
        .describe('Resource parts'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ playlistId, maxResults, pageToken, parts, format }) => {
      try {
        const result = await client.listPlaylistItems(playlistId, { maxResults, pageToken }, parts);
        return formatResponse(result, format, 'playlistItems');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Video to Playlist
  // ===========================================================================
  server.tool(
    'youtube_add_video_to_playlist',
    `Add a video to a playlist.

Requires OAuth authentication. You can only add videos to your own playlists.

Args:
  - playlistId: The playlist ID
  - videoId: The video ID to add
  - position: Position in playlist (0-indexed, optional)

Returns:
  Created playlist item.`,
    {
      playlistId: z.string().describe('Playlist ID'),
      videoId: z.string().describe('Video ID to add'),
      position: z.number().int().min(0).optional().describe('Position in playlist (0-indexed)'),
    },
    async ({ playlistId, videoId, position }) => {
      try {
        const item = await client.addVideoToPlaylist(playlistId, videoId, position);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Video added to playlist', item }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Playlist Item
  // ===========================================================================
  server.tool(
    'youtube_update_playlist_item',
    `Update a playlist item's position.

Requires OAuth authentication.

Args:
  - playlistItemId: The playlist item ID
  - playlistId: The playlist ID
  - videoId: The video ID
  - position: New position in playlist (0-indexed)

Returns:
  Updated playlist item.`,
    {
      playlistItemId: z.string().describe('Playlist item ID'),
      playlistId: z.string().describe('Playlist ID'),
      videoId: z.string().describe('Video ID'),
      position: z.number().int().min(0).describe('New position (0-indexed)'),
    },
    async ({ playlistItemId, playlistId, videoId, position }) => {
      try {
        const item = await client.updatePlaylistItem(playlistItemId, playlistId, videoId, position);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Playlist item updated', item }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove from Playlist
  // ===========================================================================
  server.tool(
    'youtube_remove_from_playlist',
    `Remove a video from a playlist.

Requires OAuth authentication. You can only remove videos from your own playlists.

Args:
  - playlistItemId: The playlist item ID (not the video ID)

Returns:
  Confirmation of removal.`,
    {
      playlistItemId: z.string().describe('Playlist item ID to remove'),
    },
    async ({ playlistItemId }) => {
      try {
        await client.removeFromPlaylist(playlistItemId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Playlist item ${playlistItemId} removed` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
