/**
 * Channel Section Tools
 *
 * MCP tools for YouTube channel section operations.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerChannelSectionTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // List Channel Sections
  // ===========================================================================
  server.tool(
    'youtube_list_channel_sections',
    `List channel sections (shelves) for a channel.

Args:
  - channelId: The channel ID
  - parts: Resource parts to include
  - format: Response format

Returns:
  List of channel sections.`,
    {
      channelId: z.string().describe('Channel ID'),
      parts: z.array(z.string()).optional().default(['snippet', 'contentDetails']).describe('Resource parts'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ channelId, parts, format }) => {
      try {
        const sections = await client.listChannelSections(channelId, parts);
        return formatResponse({ items: sections, count: sections.length, hasMore: false }, format, 'channelSections');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Insert Channel Section
  // ===========================================================================
  server.tool(
    'youtube_insert_channel_section',
    `Add a channel section (shelf) to your channel.

Requires OAuth authentication. Maximum 10 sections per channel.

Section types: allPlaylists, completedEvents, liveEvents, multipleChannels, multiplePlaylists,
popularUploads, recentUploads, singlePlaylist, subscriptions, upcomingEvents

Args:
  - type: Section type
  - title: Section title (optional for some types)
  - position: Section position (0-indexed)
  - playlistIds: Playlist IDs (for multiplePlaylists or singlePlaylist)
  - channelIds: Channel IDs (for multipleChannels)

Returns:
  Created channel section.`,
    {
      type: z.enum([
        'allPlaylists',
        'completedEvents',
        'liveEvents',
        'multipleChannels',
        'multiplePlaylists',
        'popularUploads',
        'recentUploads',
        'singlePlaylist',
        'subscriptions',
        'upcomingEvents',
      ]).describe('Section type'),
      title: z.string().optional().describe('Section title'),
      position: z.number().int().min(0).optional().describe('Position (0-indexed)'),
      playlistIds: z.array(z.string()).optional().describe('Playlist IDs'),
      channelIds: z.array(z.string()).optional().describe('Channel IDs'),
    },
    async ({ type, title, position, playlistIds, channelIds }) => {
      try {
        const section = await client.insertChannelSection({
          type,
          title,
          position,
          playlistIds,
          channelIds,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Channel section created', section }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Channel Section
  // ===========================================================================
  server.tool(
    'youtube_update_channel_section',
    `Update a channel section.

Requires OAuth authentication.

Args:
  - sectionId: The section ID to update
  - type: Section type
  - title: Section title
  - position: Section position (0-indexed)
  - playlistIds: Playlist IDs
  - channelIds: Channel IDs

Returns:
  Updated channel section.`,
    {
      sectionId: z.string().describe('Section ID'),
      type: z.string().describe('Section type'),
      title: z.string().optional().describe('Section title'),
      position: z.number().int().min(0).optional().describe('Position'),
      playlistIds: z.array(z.string()).optional().describe('Playlist IDs'),
      channelIds: z.array(z.string()).optional().describe('Channel IDs'),
    },
    async ({ sectionId, type, title, position, playlistIds, channelIds }) => {
      try {
        const section = await client.updateChannelSection(sectionId, {
          type,
          title,
          position,
          playlistIds,
          channelIds,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Channel section updated', section }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Channel Section
  // ===========================================================================
  server.tool(
    'youtube_delete_channel_section',
    `Delete a channel section.

Requires OAuth authentication.

Args:
  - sectionId: The section ID to delete

Returns:
  Confirmation of deletion.`,
    {
      sectionId: z.string().describe('Section ID'),
    },
    async ({ sectionId }) => {
      try {
        await client.deleteChannelSection(sectionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Channel section ${sectionId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
