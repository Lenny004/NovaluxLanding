export const site = {
  name: 'NOVALUX',
  defaultTitle: 'NOVALUX — Red de colaboradores en energía y telecomunicaciones',
  defaultDescription:
    'Únete a NOVALUX: las mejores comisiones del sector en luz, gas, fibra y móvil. Tramitación rápida para autónomos y pymes que quieren una nueva línea de ingresos.',
  defaultKeywords:
    'NOVALUX, colaborador energía, comisiones luz y gas, distribuidor telecomunicaciones, red comercial energía, autónomos comisiones, fibra móvil comisiones',
  locale: 'es_ES',
  ogImage: '/logo.png',
  twitterCard: 'summary_large_image' as const,
};

export const developer = {
  name: 'Lenny Sánchez',
  url: 'https://lennyx004.com',
  comment: 'Sitio web desarrollado por Lenny Sánchez — https://lennyx004.com',
};

export type SeoProps = {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
};

export function resolveSeo(
  props: SeoProps,
  pathname: string,
  origin: string,
) {
  const title = props.title ?? site.defaultTitle;
  const description = props.description ?? site.defaultDescription;
  const keywords = props.keywords ?? site.defaultKeywords;
  const ogImage = props.ogImage ?? site.ogImage;
  const canonicalUrl = new URL(pathname, origin).href;
  const ogImageUrl = new URL(ogImage, origin).href;

  return {
    title,
    description,
    keywords,
    canonicalUrl,
    ogImageUrl,
    ogType: props.ogType ?? 'website',
    robots: props.noindex ? 'noindex, nofollow' : 'index, follow',
  };
}
