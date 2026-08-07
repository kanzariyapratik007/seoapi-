import { query } from '../lib/db';
import { Keyword, PropertyType, Blog, City, Locality } from '../types/db';

export interface IKeywordRepository {
  findKeywordBySlug(slug: string): Promise<(Keyword & { city: City | null; locality: Locality | null; propertyType: PropertyType | null }) | null>;
  findPropertyTypeBySlug(slug: string): Promise<PropertyType | null>;
  findBlogBySlug(slug: string): Promise<Blog | null>;
  getAllPropertyTypes(): Promise<PropertyType[]>;
  getRelatedLinks(currentSlug: string, limit?: number): Promise<{ title: string; slug: string; url: string }[]>;
}

export class KeywordRepository implements IKeywordRepository {
  async findKeywordBySlug(
    slug: string
  ): Promise<(Keyword & { city: City | null; locality: Locality | null; propertyType: PropertyType | null }) | null> {
    const sql = `
      SELECT 
        k.id, k.phrase, k.slug, k.category, k.city_id, k.locality_id, k.property_type_id, k.is_active, k.created_at, k.updated_at,
        c.name as city_name, c.slug as city_slug, c.state_id as city_state_id, c.created_at as city_created_at, c.updated_at as city_updated_at,
        l.name as locality_name, l.slug as locality_slug, l.city_id as locality_city_id, l.created_at as locality_created_at, l.updated_at as locality_updated_at,
        p.name as pt_name, p.slug as pt_slug, p.created_at as pt_created_at, p.updated_at as pt_updated_at
      FROM keywords k
      LEFT JOIN cities c ON k.city_id = c.id
      LEFT JOIN localities l ON k.locality_id = l.id
      LEFT JOIN property_types p ON k.property_type_id = p.id
      WHERE k.slug = $1 AND k.is_active = TRUE
    `;
    
    const res = await query(sql, [slug.toLowerCase()]);
    if (res.rowCount === 0) {
      return null;
    }

    const row = res.rows[0];
    return {
      id: row.id,
      phrase: row.phrase,
      slug: row.slug,
      category: row.category,
      city_id: row.city_id,
      locality_id: row.locality_id,
      property_type_id: row.property_type_id,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      city: row.city_id
        ? {
            id: row.city_id,
            name: row.city_name,
            slug: row.city_slug,
            state_id: row.city_state_id,
            created_at: row.city_created_at,
            updated_at: row.city_updated_at,
          }
        : null,
      locality: row.locality_id
        ? {
            id: row.locality_id,
            name: row.locality_name,
            slug: row.locality_slug,
            city_id: row.locality_city_id,
            created_at: row.locality_created_at,
            updated_at: row.locality_updated_at,
          }
        : null,
      propertyType: row.property_type_id
        ? {
            id: row.property_type_id,
            name: row.pt_name,
            slug: row.pt_slug,
            created_at: row.pt_created_at,
            updated_at: row.pt_updated_at,
          }
        : null,
    };
  }

  async findPropertyTypeBySlug(slug: string): Promise<PropertyType | null> {
    const res = await query<PropertyType>('SELECT * FROM property_types WHERE slug = $1', [slug.toLowerCase()]);
    return res.rowCount > 0 ? res.rows[0] : null;
  }

  async findBlogBySlug(slug: string): Promise<Blog | null> {
    const res = await query<Blog>('SELECT * FROM blogs WHERE slug = $1', [slug.toLowerCase()]);
    return res.rowCount > 0 ? res.rows[0] : null;
  }

  async getAllPropertyTypes(): Promise<PropertyType[]> {
    const res = await query<PropertyType>('SELECT * FROM property_types ORDER BY name ASC');
    return res.rows;
  }

  async getRelatedLinks(currentSlug: string, limit: number = 6): Promise<{ title: string; slug: string; url: string }[]> {
    const sql = `
      (SELECT phrase as title, slug FROM keywords WHERE slug != $1 AND is_active = TRUE ORDER BY RANDOM() LIMIT $2)
      UNION
      (SELECT title, slug FROM blogs WHERE slug != $1 ORDER BY RANDOM() LIMIT $2)
      LIMIT $2
    `;
    const res = await query<{ title: string; slug: string }>(sql, [currentSlug.toLowerCase(), limit]);
    return res.rows.map((row) => ({
      title: row.title,
      slug: row.slug,
      url: `https://propertysdeal.in/propertys-details/${row.slug}`,
    }));
  }
}
export default KeywordRepository;
