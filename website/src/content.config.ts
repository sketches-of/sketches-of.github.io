import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';


const gigs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/gigs" }),
});

export const collections = {
  gigs,
};