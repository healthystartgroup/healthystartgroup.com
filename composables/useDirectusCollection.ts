import { readItems } from '@directus/sdk';

interface DirectusCollectionOptions {
  limit?: number;
  key?: string;
  fields?: string[];
  filter?: Record<string, unknown>;
  sort?: string[];
}

function getTranslation(item: any, locale: string, fallback = 'en') {
  const translations = item.translations || [];
  return (
    translations.find((t: any) => t.languages_code === locale) ||
    translations.find((t: any) => t.languages_code === fallback) ||
    {}
  );
}

function transformService(item: any, locale: string) {
  const t = getTranslation(item, locale);
  return {
    title: t.title,
    description: t.description,
    meta: {
      icon: item.icon,
      link: t.link,
    },
  };
}

function transformTestimonial(item: any, locale: string) {
  const t = getTranslation(item, locale);
  return {
    meta: {
      quote: t.quote,
      name: item.name,
      role: t.role,
      avatar: item.avatar,
    },
  };
}

function transformStaff(item: any, locale: string) {
  const t = getTranslation(item, locale);
  return {
    meta: {
      name: item.name,
      role: t.role,
      image: item.image,
    },
  };
}

function transformArticle(item: any, locale: string) {
  const t = getTranslation(item, locale);
  const slug = (t.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return {
    id: item.id,
    title: t.title,
    description: t.description,
    path: `/${slug}`,
    meta: {
      coverImage: item.cover_image,
      publishedAt: item.published_at,
      readingTime: item.reading_time,
      excerpt: t.excerpt,
      body: t.body,
      category: t.category,
      tags: t.tags ? (typeof t.tags === 'string' ? t.tags.split(',') : t.tags) : [],
      author: {
        name: item.author_name,
        role: t.author_role,
        avatar: item.author_avatar,
      },
    },
  };
}

const transformers: Record<string, (item: any, locale: string) => any> = {
  services: transformService,
  testimonials: transformTestimonial,
  staff: transformStaff,
  articles: transformArticle,
};

export function useDirectusCollection<T = any>(
  collection: string,
  options: DirectusCollectionOptions = {}
) {
  const { $directus } = useNuxtApp();
  const { locale } = useI18n();

  const cacheKey = options.key || `directus-${collection}-${locale.value}`;

  return useAsyncData<T[]>(
    cacheKey,
    async () => {
      const queryOptions: Record<string, unknown> = {
        fields: options.fields || ['*', 'translations.*'],
        filter: {
          status: { _eq: 'published' },
          ...options.filter,
        },
        sort: options.sort || ['sort'],
        limit: options.limit ?? -1,
      };

      const items = await ($directus as any).request(
        readItems(collection, queryOptions)
      );

      const transformer = transformers[collection];
      if (!transformer) return items as T[];

      return (items || []).map((item: any) =>
        transformer(item, locale.value)
      ) as T[];
    },
    {
      watch: [() => locale.value],
    }
  );
}
