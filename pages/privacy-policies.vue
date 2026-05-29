<script setup>
const { locale } = useI18n();

const { data: pages } = await useDirectusCollection('legal_pages', {
  key: 'legal-privacy-policy',
  filter: { slug: { _eq: 'privacy-policy' } },
});

const page = computed(() => pages.value?.[0]);

useSeoMeta({
  title: () => page.value?.title ? `${page.value.title} | HealthyStart Group` : 'Privacy Policy | HealthyStart Group',
  description: () => page.value?.title,
  ogTitle: () => page.value?.title,
  ogImage: '/HealthyStart_Group_og2.webp',
  ogImageAlt: () => locale.value === 'es' ? 'HealthyStart Group - Servicios de Salud' : 'HealthyStart Group - Healthcare Services',
});
</script>

<template>
  <div>
    <ClientOnly>
      <section class="py-16 lg:py-32">
        <div class="container">
          <div class="max-w-3xl mx-auto">
            <h1 v-if="page?.title" class="text-4xl md:text-5xl text-secondary font-normal mb-3 text-center">
              {{ page.title }}
            </h1>
            <p v-if="page?.lastUpdated" class="text-center text-secondary/60 mb-12">
              {{ locale === 'es' ? 'Última actualización' : 'Last Updated' }}:
              {{ new Date(page.lastUpdated).toLocaleDateString(locale === 'es' ? 'es-DO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
            </p>
            <div
              v-if="page?.body"
              class="prose prose-lg max-w-none prose-headings:text-secondary prose-headings:font-normal prose-p:text-secondary prose-p:font-normal prose-li:text-secondary prose-a:text-primary hover:prose-a:text-primary/80"
              v-html="page.body"
            />
          </div>
        </div>
      </section>
    </ClientOnly>
  </div>
</template>
