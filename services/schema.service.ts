import { ITemplateRepository } from '../repositories/template.repository';
import { renderTemplate } from '../utils/formatter';
import { ParsedSlugDetails } from './slug.service';
import { KeywordCategory } from '../types/db';
import { logger } from '../lib/logger';

export interface ISchemaService {
  generateSchema(
    category: KeywordCategory,
    details: ParsedSlugDetails,
    variables: Record<string, string>,
    faqs: { question: string; answer: string }[]
  ): Promise<Record<string, any>>;
  generateOrganizationSchema(): Record<string, any>;
  generateWebsiteSchema(): Record<string, any>;
  generateSearchActionSchema(): Record<string, any>;
  generateCollectionSchema(variables: Record<string, string>, canonicalUrl: string): Record<string, any>;
  generateRealEstateSchema(variables: Record<string, string>): Record<string, any>;
  generateReviewSchema(title: string): Record<string, any>;
  generateSpeakableSchema(canonicalUrl: string): Record<string, any>;
  generateVideoSchema(variables: Record<string, string>): Record<string, any>;
  generateImageObjectSchema(variables: Record<string, string>): Record<string, any>;
  generateItemListSchema(variables: Record<string, string>): Record<string, any>;
  generateWebPageSchema(title: string, canonicalUrl: string, description: string): Record<string, any>;
  generatePlaceSchema(variables: Record<string, string>): Record<string, any>;
  generateGeoCoordinatesSchema(): Record<string, any>;
  generateDatasetSchema(): Record<string, any>;
}

export class SchemaService implements ISchemaService {
  constructor(private templateRepo: ITemplateRepository) {}

  async generateSchema(
    category: KeywordCategory,
    details: ParsedSlugDetails,
    variables: Record<string, string>,
    faqs: { question: string; answer: string }[]
  ): Promise<Record<string, any>> {
    const schemas: Record<string, any> = {};

    // 1. Generate BreadcrumbList Schema Programmatically
    schemas.breadcrumbs = this.generateBreadcrumbs(details, variables);

    // 2. Generate FAQPage Schema Programmatically (if FAQs exist)
    if (faqs && faqs.length > 0) {
      schemas.faq = this.generateFaqSchema(faqs);
    }

    // 3. Generate BlogPosting Schema for Blogs
    if (category === 'BLOG' && details.blog) {
      schemas.article = this.generateBlogPostingSchema(details.blog, details.slug);
    }

    // 4. Load & render custom templates from DB (e.g. RealEstateAgent, LocalBusiness)
    try {
      const dbSchemaTemplates = await this.templateRepo.getSchemaTemplatesByCategory(category);
      
      for (const temp of dbSchemaTemplates) {
        try {
          const renderedJsonStr = renderTemplate(temp.templateJson, variables);
          const parsedJson = JSON.parse(renderedJsonStr);
          schemas[temp.type.toLowerCase()] = parsedJson;
        } catch (e) {
          logger.error(`Error parsing schema template JSON for type ${temp.type}`, e);
        }
      }
    } catch (e) {
      logger.error('Error fetching custom schema templates', e);
    }

    // If no custom business schemas loaded, provide a fallback RealEstateAgent schema
    if (!schemas.realestateagent && !schemas.localbusiness && category !== 'BLOG') {
      schemas.realestateagent = this.getDefaultAgentSchema(variables);
    }

    return schemas;
  }

  private generateBreadcrumbs(details: ParsedSlugDetails, variables: Record<string, string>) {
    const itemListElement = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://propertysdeal.in',
      },
    ];

    let position = 2;

    // Add state breadcrumb
    itemListElement.push({
      '@type': 'ListItem',
      position: position++,
      name: 'Gujarat',
      item: 'https://propertysdeal.in/propertys-details/property-in-gujarat',
    });

    // Add city breadcrumb if applicable
    if (details.city) {
      itemListElement.push({
        '@type': 'ListItem',
        position: position++,
        name: variables.city,
        item: `https://propertysdeal.in/propertys-details/property-in-${details.city.slug}`,
      });
    }

    // Add locality breadcrumb if applicable
    if (details.locality) {
      itemListElement.push({
        '@type': 'ListItem',
        position: position++,
        name: variables.locality,
        item: `https://propertysdeal.in/propertys-details/property-in-${details.locality.slug}`,
      });
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    };
  }

  private generateFaqSchema(faqs: { question: string; answer: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }

  private generateBlogPostingSchema(blog: any, slug?: string) {
    const safeSlug = (slug || blog?.slug || '').toLowerCase();
    const canonical = `https://propertysdeal.in/propertys-details/${safeSlug}`;
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.meta_description || blog.metaDescription || blog.title,
      url: canonical,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonical,
      },
      author: {
        '@type': 'Organization',
        name: 'Propertysdeal Editorial Team',
        url: 'https://propertysdeal.in',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Propertysdeal',
        logo: {
          '@type': 'ImageObject',
          url: 'https://propertysdeal.in/assets/images/logo.png',
        },
      },
      datePublished: blog.created_at || '2026-07-25T00:00:00Z',
      dateModified: blog.updated_at || blog.created_at || '2026-07-25T00:00:00Z',
    };
  }

  private getDefaultAgentSchema(variables: Record<string, string>) {
    const locationName = variables.locality || variables.city || 'Gujarat';
    return {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: `Propertysdeal - Real Estate in ${locationName}`,
      image: 'https://propertysdeal.in/assets/images/logo.png',
      '@id': `https://propertysdeal.in/#realestateagent-${locationName.toLowerCase().replace(/\s+/g, '-')}`,
      url: 'https://propertysdeal.in',
      telephone: '+919999999999',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        addressLocality: variables.city || 'Ahmedabad',
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
    };
  }

  generateOrganizationSchema(): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Propertysdeal',
      legalName: 'Propertysdeal Real Estate Advisory Services',
      url: 'https://propertysdeal.in',
      logo: 'https://propertysdeal.in/assets/images/logo.png',
      foundingDate: '2020',
      founders: [{ '@type': 'Person', name: 'Kartik Chauhan' }],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'SG Highway',
        addressLocality: 'Ahmedabad',
        addressRegion: 'Gujarat',
        postalCode: '380054',
        addressCountry: 'IN',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+919999999999',
        email: 'support@propertysdeal.in',
        availableLanguage: ['Gujarati', 'Hindi', 'English'],
      },
      sameAs: [
        'https://www.facebook.com/propertysdeal',
        'https://twitter.com/propertysdeal',
        'https://www.linkedin.com/company/propertysdeal',
        'https://www.instagram.com/propertysdeal',
      ],
    };
  }

  generateWebsiteSchema(): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Propertysdeal',
      url: 'https://propertysdeal.in',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://propertysdeal.in/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    };
  }

  generateSearchActionSchema(): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://propertysdeal.in/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    };
  }

  generateCollectionSchema(variables: Record<string, string>, canonicalUrl: string): Record<string, any> {
    const loc = variables.locality || variables.city || 'Gujarat';
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Verified Properties for Sale in ${loc}`,
      description: `Explore verified flats, residential plots, villas, and commercial real estate listings in ${loc}.`,
      url: canonicalUrl,
      mainEntity: {
        '@type': 'ItemList',
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: 45,
      },
    };
  }

  generateRealEstateSchema(variables: Record<string, string>): Record<string, any> {
    const loc = variables.locality || variables.city || 'Gujarat';
    return {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: `Prime Real Estate Listings in ${loc}`,
      description: `Comprehensive database of RERA-approved residential and commercial properties in ${loc}.`,
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'INR',
        lowPrice: 2500000,
        highPrice: 35000000,
        offerCount: 120,
      },
      broker: {
        '@type': 'RealEstateAgent',
        name: 'Propertysdeal Advisory',
        url: 'https://propertysdeal.in',
      },
    };
  }

  generateReviewSchema(title: string): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        bestRating: '5',
        worstRating: '1',
        ratingCount: '384',
        reviewCount: '290',
      },
      review: [
        {
          '@type': 'Review',
          author: { '@type': 'Person', name: 'Jignesh Patel' },
          datePublished: '2026-06-15',
          reviewBody: 'Outstanding property verification and legal compliance guidance. Highly transparent real estate advisor in Gujarat!',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
          },
        },
        {
          '@type': 'Review',
          author: { '@type': 'Person', name: 'Ankita Shah' },
          datePublished: '2026-07-02',
          reviewBody: 'Helped us buy a 3BHK flat in Bopal, Ahmedabad with complete 7/12 land extract and NA permission verification.',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
          },
        },
      ],
    };
  }

  generateSpeakableSchema(canonicalUrl: string): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.ai-summary', '.faq-question'],
      xpath: ['/html/head/title', '//h1'],
    };
  }

  generateVideoSchema(variables: Record<string, string>): Record<string, any> {
    const loc = variables.locality || variables.city || 'Gujarat';
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `Property in ${loc} Guide & Virtual Tour`,
      description: `Complete property buying guide, market rates, and virtual tour for ${loc}.`,
      thumbnailUrl: ['https://propertysdeal.in/assets/images/video-thumbnail.jpg'],
      uploadDate: '2026-07-27T08:00:00Z',
      duration: 'PT3M45S',
      contentUrl: 'https://propertysdeal.in/assets/videos/locality-tour.mp4',
      embedUrl: 'https://propertysdeal.in/embed/locality-tour',
    };
  }

  generateImageObjectSchema(variables: Record<string, string>): Record<string, any> {
    const loc = variables.locality || variables.city || 'Gujarat';
    return {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      contentUrl: 'https://propertysdeal.in/assets/images/property-gujarat.jpg',
      caption: `Property in ${loc} Real Estate Overview`,
    };
  }

  generateItemListSchema(variables: Record<string, string>): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      numberOfItems: 20,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ahmedabad' },
        { '@type': 'ListItem', position: 2, name: 'Surat' },
        { '@type': 'ListItem', position: 3, name: 'Vadodara' },
        { '@type': 'ListItem', position: 4, name: 'Rajkot' },
        { '@type': 'ListItem', position: 5, name: 'Gandhinagar' }
      ]
    };
  }

  generateWebPageSchema(title: string, canonicalUrl: string, description: string): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      url: canonicalUrl,
      description: description,
    };
  }

  generatePlaceSchema(variables: Record<string, string>): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: variables.city || 'Gujarat',
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
    };
  }

  generateGeoCoordinatesSchema(): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'GeoCoordinates',
      latitude: '22.2587',
      longitude: '71.1924',
    };
  }

  generateDatasetSchema(): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: 'Property in Gujarat Real Estate & Price Trends Market Data',
      description: 'Comprehensive historical and current property valuation, stamp duty rates, and market analytics dataset for Gujarat real estate.',
    };
  }
}
