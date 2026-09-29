import { MetadataRoute } from "next";
import { allOpportunities } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://wintality.kz";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/opportunities`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard/mock-interview`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard/resume`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard/essay-checker`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard/roadmap`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const opportunityRoutes: MetadataRoute.Sitemap = allOpportunities.map((opp) => ({
    url: `${baseUrl}/opportunities/${opp.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: opp.isFeatured ? 0.85 : 0.7,
  }));

  return [...staticRoutes, ...opportunityRoutes];
}
