import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    year: z.number(),
    type: z.string(),
    thumbnail: z.string(),
    thumbnailType: z.enum(['image', 'video']),
    thumbnailAlt: z.string(),
    order: z.number(),
  }),
});

const about = defineCollection({
  type: 'content',
  schema: z.object({
    bio: z.string(),
    approach: z.array(z.string()),
    projectTypes: z.array(z.string()),
    clients: z.array(
      z.object({
        name: z.string(),
        year: z.number().optional(),
      })
    ),
    awards: z.array(
      z.object({
        year: z.number(),
        award: z.string(),
        project: z.string(),
      })
    ),
  }),
});

export const collections = { projects, about };
