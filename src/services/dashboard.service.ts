import skinAnalysisService from './skinAnalysis.service';
import blogService from './blog.service';

export interface DashboardStats {
  skinAnalysis: {
    totalSubmissions: number;
    completedAnalyses: number;
    pendingAnalyses: number;
    failedAnalyses: number;
    successRate: number;
  };
  blogs: {
    totalBlogs: number;
    publishedBlogs: number;
    draftBlogs: number;
    featuredBlogs: number;
    totalViews: number;
    avgViewsPerBlog: number;
  };
}

class DashboardService {
  /**
   * Get combined dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch skin analysis stats (required)
      const skinAnalysisResponse = await skinAnalysisService.getAnalysisStats();
      const skinStats = skinAnalysisResponse.data;

      // Try to fetch blog stats (optional - may fail if endpoint doesn't exist yet)
      let blogStats: any = {};
      try {
        const blogStatsResponse = await blogService.getBlogStats();
        blogStats = blogStatsResponse.data || {};
      } catch (blogError) {
        console.warn('Blog stats not available:', blogError);
        // Use default values
        blogStats = {
          totalBlogs: 0,
          publishedBlogs: 0,
          draftBlogs: 0,
          featuredBlogs: 0,
          totalViews: 0,
        };
      }

      // Calculate derived metrics
      const successRate =
        skinStats.totalAnalyses > 0
          ? Math.round(
              (skinStats.completedAnalyses / skinStats.totalAnalyses) * 100
            )
          : 0;

      const avgViewsPerBlog =
        (blogStats.publishedBlogs || 0) > 0
          ? Math.round((blogStats.totalViews || 0) / (blogStats.publishedBlogs || 0))
          : 0;

      return {
        skinAnalysis: {
          totalSubmissions: skinStats.totalAnalyses || 0,
          completedAnalyses: skinStats.completedAnalyses || 0,
          pendingAnalyses: skinStats.pendingAnalyses || 0,
          failedAnalyses: skinStats.failedAnalyses || 0,
          successRate,
        },
        blogs: {
          totalBlogs: blogStats.totalBlogs || 0,
          publishedBlogs: blogStats.publishedBlogs || 0,
          draftBlogs: blogStats.draftBlogs || 0,
          featuredBlogs: blogStats.featuredBlogs || 0,
          totalViews: blogStats.totalViews || 0,
          avgViewsPerBlog,
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get recent skin analysis submissions
   */
  async getRecentSubmissions(limit: number = 5) {
    try {
      const response = await skinAnalysisService.getAllAnalyses({
        page: 1,
        limit,
        sortBy: '-createdAt',
      });
      return response.data.analyses;
    } catch (error) {
      console.error('Error fetching recent submissions:', error);
      throw error;
    }
  }

  /**
   * Get status distribution data for pie chart
   */
  async getStatusDistribution() {
    try {
      const response = await skinAnalysisService.getAnalysisStats();
      const stats = response.data;

      return [
        {
          name: 'Completed',
          value: stats.completedAnalyses,
          fill: 'hsl(var(--chart-1))',
        },
        {
          name: 'Pending',
          value: stats.pendingAnalyses,
          fill: 'hsl(var(--chart-2))',
        },
        {
          name: 'Failed',
          value: stats.failedAnalyses,
          fill: 'hsl(var(--chart-3))',
        },
      ].filter((item) => item.value > 0); // Only show categories with data
    } catch (error) {
      console.error('Error fetching status distribution:', error);
      throw error;
    }
  }

  /**
   * Get blog performance data for bar chart
   */
  async getBlogPerformance() {
    try {
      const response = await blogService.getBlogStats();
      const stats = response.data || {};

      return {
        published: stats.publishedBlogs || 0,
        drafts: stats.draftBlogs || 0,
        featured: stats.featuredBlogs || 0,
        totalViews: stats.totalViews || 0,
      };
    } catch (error) {
      console.warn('Error fetching blog performance:', error);
      // Return default values if blog stats fail
      return {
        published: 0,
        drafts: 0,
        featured: 0,
        totalViews: 0,
      };
    }
  }
}

export default new DashboardService();
