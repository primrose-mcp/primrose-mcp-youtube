/**
 * Caption Tools
 *
 * MCP tools for YouTube caption/subtitle operations.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerCaptionTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // List Captions
  // ===========================================================================
  server.tool(
    'youtube_list_captions',
    `List caption tracks for a video.

Requires OAuth authentication for videos you own, or API key for public videos.

Args:
  - videoId: The video ID
  - parts: Resource parts to include
  - format: Response format

Returns:
  List of caption tracks.`,
    {
      videoId: z.string().describe('Video ID'),
      parts: z.array(z.string()).optional().default(['snippet']).describe('Resource parts'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ videoId, parts, format }) => {
      try {
        const captions = await client.listCaptions(videoId, parts);
        return formatResponse({ items: captions, count: captions.length, hasMore: false }, format, 'captions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Download Caption
  // ===========================================================================
  server.tool(
    'youtube_download_caption',
    `Download a caption track.

Requires OAuth authentication.

Args:
  - captionId: The caption track ID
  - format: Caption format (sbv, scc, srt, ttml, vtt)
  - language: Translate to language code (optional)

Returns:
  Caption track content.`,
    {
      captionId: z.string().describe('Caption track ID'),
      format: z.enum(['sbv', 'scc', 'srt', 'ttml', 'vtt']).optional().describe('Caption format'),
      language: z.string().optional().describe('Translate to language code'),
    },
    async ({ captionId, format, language }) => {
      try {
        const content = await client.downloadCaption(captionId, format, language);
        return {
          content: [
            {
              type: 'text',
              text: content,
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Insert Caption
  // ===========================================================================
  server.tool(
    'youtube_insert_caption',
    `Upload a caption track for a video.

Requires OAuth authentication. You can only add captions to your own videos.

Args:
  - videoId: The video ID
  - language: Caption language code (e.g., 'en', 'es', 'fr')
  - name: Caption track name
  - captionData: The caption content (SRT, VTT, etc.)
  - isDraft: Whether this is a draft (optional)

Returns:
  Created caption track.`,
    {
      videoId: z.string().describe('Video ID'),
      language: z.string().describe('Language code'),
      name: z.string().describe('Track name'),
      captionData: z.string().describe('Caption content'),
      isDraft: z.boolean().optional().default(false).describe('Is draft'),
    },
    async ({ videoId, language, name, captionData, isDraft }) => {
      try {
        const caption = await client.insertCaption(videoId, { language, name, captionData, isDraft });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Caption track created', caption }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Caption
  // ===========================================================================
  server.tool(
    'youtube_update_caption',
    `Update a caption track.

Requires OAuth authentication.

Args:
  - captionId: The caption track ID
  - isDraft: Whether this is a draft (optional)
  - captionData: New caption content (optional)

Returns:
  Updated caption track.`,
    {
      captionId: z.string().describe('Caption track ID'),
      isDraft: z.boolean().optional().describe('Is draft'),
      captionData: z.string().optional().describe('New caption content'),
    },
    async ({ captionId, isDraft, captionData }) => {
      try {
        const caption = await client.updateCaption(captionId, { isDraft, captionData });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Caption track updated', caption }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Caption
  // ===========================================================================
  server.tool(
    'youtube_delete_caption',
    `Delete a caption track.

Requires OAuth authentication. You can only delete captions on your own videos.

Args:
  - captionId: The caption track ID

Returns:
  Confirmation of deletion.`,
    {
      captionId: z.string().describe('Caption track ID'),
    },
    async ({ captionId }) => {
      try {
        await client.deleteCaption(captionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Caption track ${captionId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
