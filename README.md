# YouTube MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/youtube)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for YouTube, enabling AI assistants to manage videos, channels, playlists, and interact with the YouTube Data API.

## Features

- **Videos** - Upload, update, and manage videos
- **Channels** - Access channel information and statistics
- **Playlists** - Create and manage playlists
- **Playlist Items** - Add and organize videos in playlists
- **Comments** - Read and manage video comments
- **Subscriptions** - Manage channel subscriptions
- **Captions** - Access and manage video captions
- **Activities** - Track channel activities
- **Channel Sections** - Organize channel layout
- **Internationalization** - Language and region settings
- **Categories** - Video and guide categories
- **Members** - Channel membership management
- **Search** - Search for videos, channels, and playlists

## Quick Start

### Recommended: Use Primrose SDK

The easiest way to use this MCP server is with the Primrose SDK:

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseMCP } from 'primrose-mcp';

const primrose = new PrimroseMCP({
  apiKey: process.env.PRIMROSE_API_KEY,
});

const youtubeClient = primrose.getClient('youtube', {
  accessToken: process.env.YOUTUBE_ACCESS_TOKEN,
});
```

## Manual Installation

### Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Google Cloud project with YouTube Data API v3 enabled

### Setup

1. Clone and install dependencies:

```bash
git clone <repository-url>
cd primrose-mcp-youtube
npm install
```

2. Deploy to Cloudflare Workers:

```bash
npx wrangler deploy
```

## Configuration

### Required Headers (one of)

| Header | Description |
|--------|-------------|
| `X-YouTube-Access-Token` | OAuth 2.0 access token |
| `X-YouTube-API-Key` | API key (for read-only public data) |

### Example Request

```bash
curl -X POST https://your-worker.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "X-YouTube-Access-Token: your-access-token" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

## Available Tools

### Video Tools
- `youtube_list_videos` - List videos
- `youtube_get_video` - Get video details
- `youtube_insert_video` - Upload a video
- `youtube_update_video` - Update video metadata
- `youtube_delete_video` - Delete a video
- `youtube_rate_video` - Like or dislike a video
- `youtube_get_rating` - Get video rating

### Channel Tools
- `youtube_list_channels` - List channels
- `youtube_get_channel` - Get channel details
- `youtube_update_channel` - Update channel settings

### Playlist Tools
- `youtube_list_playlists` - List playlists
- `youtube_get_playlist` - Get playlist details
- `youtube_insert_playlist` - Create a playlist
- `youtube_update_playlist` - Update a playlist
- `youtube_delete_playlist` - Delete a playlist

### Playlist Item Tools
- `youtube_list_playlist_items` - List videos in a playlist
- `youtube_insert_playlist_item` - Add video to playlist
- `youtube_update_playlist_item` - Update playlist item
- `youtube_delete_playlist_item` - Remove video from playlist

### Comment Tools
- `youtube_list_comment_threads` - List comment threads
- `youtube_get_comment` - Get comment details
- `youtube_insert_comment` - Post a comment
- `youtube_update_comment` - Update a comment
- `youtube_delete_comment` - Delete a comment
- `youtube_set_moderation_status` - Moderate comments

### Subscription Tools
- `youtube_list_subscriptions` - List subscriptions
- `youtube_insert_subscription` - Subscribe to a channel
- `youtube_delete_subscription` - Unsubscribe from a channel

### Caption Tools
- `youtube_list_captions` - List video captions
- `youtube_insert_caption` - Upload captions
- `youtube_update_caption` - Update captions
- `youtube_delete_caption` - Delete captions
- `youtube_download_caption` - Download caption track

### Activity Tools
- `youtube_list_activities` - List channel activities

### Channel Section Tools
- `youtube_list_channel_sections` - List channel sections
- `youtube_insert_channel_section` - Create a channel section
- `youtube_update_channel_section` - Update a channel section
- `youtube_delete_channel_section` - Delete a channel section

### Internationalization Tools
- `youtube_list_i18n_languages` - List supported languages
- `youtube_list_i18n_regions` - List supported regions

### Category Tools
- `youtube_list_video_categories` - List video categories
- `youtube_list_guide_categories` - List guide categories

### Member Tools
- `youtube_list_members` - List channel members
- `youtube_list_memberships_levels` - List membership levels

### Search Tools
- `youtube_search` - Search videos, channels, playlists

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Type check
npm run typecheck

# Deploy
npm run deploy
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Google Cloud Console](https://console.cloud.google.com)
- [Model Context Protocol](https://modelcontextprotocol.io)
