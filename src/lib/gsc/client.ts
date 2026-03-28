import { google } from 'googleapis';
import { config } from '../../config';
import type {
  GSCSearchAnalyticsRow,
  GSCQueryParams,
  GSCSiteEntry,
} from '../../types';

const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri,
);

/**
 * Google Search Console API client.
 * Wraps the googleapis searchconsole v1 service.
 */
export class GSCClient {
  private sc: ReturnType<typeof google.searchconsole>;

  constructor(accessToken: string, refreshToken?: string) {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    this.sc = google.searchconsole({ version: 'v1', auth: oauth2Client });
  }

  /**
   * List all sites the authenticated user has access to in GSC.
   */
  async listSites(): Promise<GSCSiteEntry[]> {
    const res = await this.sc.sites.list();
    const sites = res.data.siteEntry || [];
    return sites.map((s: any) => ({
      site_url: s.siteUrl || '',
      permission_level: s.permissionLevel || 'siteUnverifiedUser',
    }));
  }

  /**
   * Query Search Analytics (the core GSC performance data).
   * Returns rows of query/page/country/device with clicks, impressions, ctr, position.
   */
  async queryAnalytics(
    siteUrl: string,
    params: GSCQueryParams,
  ): Promise<GSCSearchAnalyticsRow[]> {
    const requestBody: Record<string, any> = {
      startDate: params.start_date,
      endDate: params.end_date,
      dimensions: params.dimensions || ['query', 'page'],
      rowLimit: params.row_limit || 1000,
      startRow: params.start_row || 0,
    };

    if (params.dimension_filters?.length) {
      requestBody.dimensionFilterGroups = [
        {
          filters: params.dimension_filters.map((f) => ({
            dimension: f.dimension,
            operator: f.operator || 'contains',
            expression: f.expression,
          })),
        },
      ];
    }

    const res = await this.sc.searchanalytics.query({
      siteUrl,
      requestBody,
    });

    const rows = res.data.rows || [];
    return rows.map((r: any) => ({
      keys: r.keys || [],
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr || 0,
      position: r.position || 0,
    }));
  }

  /**
   * Fetch top queries for a specific page URL.
   * Useful for correlating a WordPress post with its search queries.
   */
  async queriesForPage(
    siteUrl: string,
    pageUrl: string,
    startDate: string,
    endDate: string,
  ): Promise<GSCSearchAnalyticsRow[]> {
    return this.queryAnalytics(siteUrl, {
      start_date: startDate,
      end_date: endDate,
      dimensions: ['query'],
      dimension_filters: [
        { dimension: 'page', operator: 'equals', expression: pageUrl },
      ],
      row_limit: 100,
    });
  }

  /**
   * Fetch top pages and their aggregate metrics.
   */
  async topPages(
    siteUrl: string,
    startDate: string,
    endDate: string,
    limit = 50,
  ): Promise<GSCSearchAnalyticsRow[]> {
    return this.queryAnalytics(siteUrl, {
      start_date: startDate,
      end_date: endDate,
      dimensions: ['page'],
      row_limit: limit,
    });
  }

  /**
   * Fetch performance data grouped by date for trend analysis.
   */
  async performanceByDate(
    siteUrl: string,
    startDate: string,
    endDate: string,
  ): Promise<GSCSearchAnalyticsRow[]> {
    return this.queryAnalytics(siteUrl, {
      start_date: startDate,
      end_date: endDate,
      dimensions: ['date'],
      row_limit: 500,
    });
  }
}

/**
 * Generate the Google OAuth URL for GSC access.
 * Requests read-only Search Console + basic profile scopes.
 */
export function getGSCAuthUrl(state?: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    state: state || '',
  });
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}
