/**
 * Video Tools
 *
 * MCP tools for YouTube video operations.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerVideoTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // Get Video
  // ===========================================================================
  server.tool(
    'youtube_get_video',
    `Get details for a YouTube video by ID.

Args:
  - videoId: The YouTube video ID
  - parts: Resource parts to include (snippet, contentDetails, statistics, status, player, topicDetails, recordingDetails, liveStreamingDetails)
  - format: Response format ('json' or 'markdown')

Returns:
  Video details including title, description, statistics, and more.`,
    {
      videoId: z.string().describe('YouTube video ID'),
      parts: z
        .array(z.string())
        .optional()
        .default(['snippet', 'contentDetails', 'statistics', 'status'])
        .describe('Resource parts to include'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ videoId, parts, format }) => {
      try {
        const video = await client.getVideo(videoId, parts);
        return formatResponse(video, format, 'video');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Videos
  // ===========================================================================
  server.tool(
    'youtube_list_videos',
    `Get details for multiple YouTube videos by ID.

Args:
  - videoIds: Array of YouTube video IDs (max 50)
  - parts: Resource parts to include
  - format: Response format

Returns:
  List of video details.`,
    {
      videoIds: z.array(z.string()).max(50).describe('Array of YouTube video IDs'),
      parts: z
        .array(z.string())
        .optional()
        .default(['snippet', 'contentDetails', 'statistics'])
        .describe('Resource parts to include'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ videoIds, parts, format }) => {
      try {
        const result = await client.listVideos(videoIds, parts);
        return formatResponse(result, format, 'videos');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Search Videos
  // ===========================================================================
  server.tool(
    'youtube_search_videos',
    `Search for YouTube videos.

Args:
  - query: Search query string
  - maxResults: Maximum results to return (1-50)
  - pageToken: Pagination token
  - order: Sort order (date, rating, relevance, title, viewCount)
  - channelId: Filter by channel
  - publishedAfter: Filter by publish date (RFC 3339)
  - publishedBefore: Filter by publish date (RFC 3339)
  - regionCode: ISO country code
  - videoDuration: Filter by duration (any, long, medium, short)
  - videoDefinition: Filter by definition (any, high, standard)
  - videoType: Filter by type (any, episode, movie)
  - eventType: Filter live events (completed, live, upcoming)
  - format: Response format

Returns:
  Search results with video snippets.`,
    {
      query: z.string().describe('Search query'),
      maxResults: z.number().int().min(1).max(50).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      order: z.enum(['date', 'rating', 'relevance', 'title', 'viewCount']).optional().describe('Sort order'),
      channelId: z.string().optional().describe('Filter by channel ID'),
      publishedAfter: z.string().optional().describe('Filter videos published after (RFC 3339)'),
      publishedBefore: z.string().optional().describe('Filter videos published before (RFC 3339)'),
      regionCode: z.string().optional().describe('ISO country code'),
      videoDuration: z.enum(['any', 'long', 'medium', 'short']).optional().describe('Filter by duration'),
      videoDefinition: z.enum(['any', 'high', 'standard']).optional().describe('Filter by definition'),
      videoType: z.enum(['any', 'episode', 'movie']).optional().describe('Filter by type'),
      eventType: z.enum(['completed', 'live', 'upcoming']).optional().describe('Filter live events'),
      safeSearch: z.enum(['moderate', 'none', 'strict']).optional().describe('Safe search setting'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ query, maxResults, pageToken, order, channelId, publishedAfter, publishedBefore, regionCode, videoDuration, videoDefinition, videoType, eventType, safeSearch, format }) => {
      try {
        const result = await client.searchVideos({
          q: query,
          maxResults,
          pageToken,
          order,
          channelId,
          publishedAfter,
          publishedBefore,
          regionCode,
          videoDuration,
          videoDefinition,
          videoType,
          eventType,
          safeSearch,
        });
        return formatResponse(result, format, 'searchResults');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Video
  // ===========================================================================
  server.tool(
    'youtube_update_video',
    `Update a YouTube video's metadata.

Requires OAuth authentication. You can only update videos on your own channel.

Args:
  - videoId: The video ID to update
  - title: New title
  - description: New description
  - tags: New tags array
  - categoryId: New category ID
  - privacyStatus: New privacy status (private, public, unlisted)
  - embeddable: Whether the video can be embedded
  - madeForKids: Whether the video is made for kids

Returns:
  Updated video details.`,
    {
      videoId: z.string().describe('Video ID to update'),
      title: z.string().optional().describe('New title'),
      description: z.string().optional().describe('New description'),
      tags: z.array(z.string()).optional().describe('New tags'),
      categoryId: z.string().optional().describe('New category ID'),
      privacyStatus: z.enum(['private', 'public', 'unlisted']).optional().describe('Privacy status'),
      embeddable: z.boolean().optional().describe('Whether video can be embedded'),
      madeForKids: z.boolean().optional().describe('Made for kids designation'),
    },
    async ({ videoId, title, description, tags, categoryId, privacyStatus, embeddable, madeForKids }) => {
      try {
        const video = await client.updateVideo(videoId, {
          title,
          description,
          tags,
          categoryId,
          privacyStatus,
          embeddable,
          madeForKids,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Video updated', video }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Video
  // ===========================================================================
  server.tool(
    'youtube_delete_video',
    `Delete a YouTube video.

Requires OAuth authentication. You can only delete videos on your own channel.

Args:
  - videoId: The video ID to delete

Returns:
  Confirmation of deletion.`,
    {
      videoId: z.string().describe('Video ID to delete'),
    },
    async ({ videoId }) => {
      try {
        await client.deleteVideo(videoId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Video ${videoId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Rate Video
  // ===========================================================================
  server.tool(
    'youtube_rate_video',
    `Rate a YouTube video (like, dislike, or remove rating).

Requires OAuth authentication.

Args:
  - videoId: The video ID to rate
  - rating: Rating to apply (like, dislike, none)

Returns:
  Confirmation of rating.`,
    {
      videoId: z.string().describe('Video ID to rate'),
      rating: z.enum(['like', 'dislike', 'none']).describe('Rating to apply'),
    },
    async ({ videoId, rating }) => {
      try {
        await client.rateVideo(videoId, rating);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Video ${videoId} rated: ${rating}` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Video Rating
  // ===========================================================================
  server.tool(
    'youtube_get_video_rating',
    `Get your rating for one or more videos.

Requires OAuth authentication.

Args:
  - videoIds: Array of video IDs to check

Returns:
  Your rating for each video.`,
    {
      videoIds: z.array(z.string()).max(50).describe('Video IDs to check'),
    },
    async ({ videoIds }) => {
      try {
        const ratings = await client.getVideoRating(videoIds);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ratings, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Report Video Abuse
  // ===========================================================================
  server.tool(
    'youtube_report_video_abuse',
    `Report a video for abusive content.

Requires OAuth authentication.

Args:
  - videoId: The video ID to report
  - reasonId: Abuse reason ID (from youtube_list_video_abuse_report_reasons)
  - secondaryReasonId: Secondary reason ID (optional)
  - comments: Additional comments (optional)

Returns:
  Confirmation of report.`,
    {
      videoId: z.string().describe('Video ID to report'),
      reasonId: z.string().describe('Abuse reason ID'),
      secondaryReasonId: z.string().optional().describe('Secondary reason ID'),
      comments: z.string().optional().describe('Additional comments'),
    },
    async ({ videoId, reasonId, secondaryReasonId, comments }) => {
      try {
        await client.reportVideoAbuse(videoId, reasonId, secondaryReasonId, comments);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Video ${videoId} reported` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
