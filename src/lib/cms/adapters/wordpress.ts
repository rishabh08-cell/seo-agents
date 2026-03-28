import { BaseCMSAdapter } from './base';
import type {
    CMSAdapterConfig,
    CMSPlatform,
    CMSSchema,
    CMSTaxonomyTerm,
    CMSContentType,
    CMSCustomField,
    PublishableContent,
    AgentPublishResult,
    ContentImage,
} from '../../../types';

interface WPPost {
    id: number;
    link: string;
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
    slug: string;
    status: string;
    categories: number[];
    tags: number[];
    featured_media: number;
    meta: Record<string, unknown>;
    yoast_head_json?: Record<string, unknown>;
}

interface WPTerm {
    id: number;
    name: string;
    slug: string;
    parent: number;
}

interface WPMediaResponse {
    id: number;
    source_url: string;
}

export class WordPressAdapter extends BaseCMSAdapter {
    readonly platform: CMSPlatform = 'wordpress';

  async connect(config: CMSAdapterConfig): Promise<{ success: boolean; site_name: string; error?: string }> {
        this.siteUrl = config.site_url.replace(/\/+$/, '');
        this.credentials = config.credentials;

      try {
              // Use rawApiRequest here because we are NOT yet connected
          const siteInfo = await this.rawApiRequest<{ name: string; url: string }>('/wp-json');
              this.connected = true;
              return { success: true, site_name: siteInfo.name };
      } catch (err) {
              const message = err instanceof Error ? err.message : 'Connection failed';
              return { success: false, site_name: '', error: message };
      }
  }

  async testConnection(): Promise<boolean> {
        try {
                await this.wpApi<{ id: number }>('/wp-json/wp/v2/users/me');
                return true;
        } catch {
                return false;
        }
  }

  async fetchSchema(): Promise<CMSSchema> {
        this.ensureConnected();

      const [categories, tags] = await Promise.all([
              this.getCategories(),
              this.getTags(),
            ]);

      const postType: CMSContentType = {
              slug: 'post',
              name: 'Post',
              fields: [
                { key: 'title', label: 'Title', type: 'text', required: true },
                { key: 'content', label: 'Content', type: 'richtext', required: true },
                { key: 'excerpt', label: 'Excerpt', type: 'text', required: false },
                { key: 'slug', label: 'Slug', type: 'text', required: false },
                { key: 'status', label: 'Status', type: 'text', required: false, default: 'draft' },
                { key: 'featured_media', label: 'Featured Image', type: 'media', required: false },
                      ],
      };

    
