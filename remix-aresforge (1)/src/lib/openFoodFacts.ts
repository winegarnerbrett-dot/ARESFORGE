import type { FoodCatalogProduct } from '../types/fitness';

interface OpenFoodFactsNutriments {
  'energy-kcal_serving'?: number;
  'energy-kcal_100g'?: number;
  proteins_serving?: number;
  proteins_100g?: number;
  carbohydrates_serving?: number;
  carbohydrates_100g?: number;
  fat_serving?: number;
  fat_100g?: number;
}

interface OpenFoodFactsRawProduct {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  serving_size?: string;
  image_front_small_url?: string;
  nutriments?: OpenFoodFactsNutriments;
}

function normalizeProduct(raw: OpenFoodFactsRawProduct, source: 'barcode' | 'search'): FoodCatalogProduct | null {
  const name = (raw.product_name || raw.product_name_en || '').trim();
  if (!name) return null;

  const n = raw.nutriments || {};
  const hasServing =
    typeof n['energy-kcal_serving'] === 'number' &&
    n['energy-kcal_serving'] > 0 &&
    Boolean(raw.serving_size && raw.serving_size.trim());

  const calories = hasServing
    ? Number(n['energy-kcal_serving'] || 0)
    : Number(n['energy-kcal_100g'] || 0);
  const protein = hasServing
    ? Number(n.proteins_serving || 0)
    : Number(n.proteins_100g || 0);
  const carbs = hasServing
    ? Number(n.carbohydrates_serving || 0)
    : Number(n.carbohydrates_100g || 0);
  const fat = hasServing
    ? Number(n.fat_serving || 0)
    : Number(n.fat_100g || 0);

  const servingLabel = hasServing && raw.serving_size
    ? raw.serving_size.trim().slice(0, 60)
    : '100 g / 100 ml';

  return {
    id: `off-${raw.code || crypto.randomUUID()}`,
    name: name.slice(0, 120),
    brand: (raw.brands || 'Packaged Item').split(',')[0].trim().slice(0, 80),
    barcode: String(raw.code || '').slice(0, 40),
    servingLabel,
    caloriesPerServing: Math.round(calories),
    proteinPerServing: Math.round(protein * 10) / 10,
    carbsPerServing: Math.round(carbs * 10) / 10,
    fatPerServing: Math.round(fat * 10) / 10,
    imageUrl: raw.image_front_small_url,
    source,
  };
}

export async function fetchProductByBarcode(barcode: string): Promise<FoodCatalogProduct | null> {
  const cleaned = barcode.replace(/[^0-9A-Za-z]/g, '').trim();
  if (!cleaned) return null;

  const response = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(cleaned)}.json`
  );
  if (!response.ok) {
    throw new Error(`Nutrition lookup failed (HTTP ${response.status})`);
  }

  const data = (await response.json()) as {
    status?: number;
    product?: OpenFoodFactsRawProduct;
  };

  if (data.status !== 1 || !data.product) {
    return null;
  }

  return normalizeProduct({ ...data.product, code: cleaned }, 'barcode');
}

export async function searchProductsByQuery(query: string): Promise<FoodCatalogProduct[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(trimmed)}&search_simple=1&action=process&json=1&page_size=12&fields=code,product_name,product_name_en,brands,serving_size,image_front_small_url,nutriments`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Food search failed (HTTP ${response.status})`);
  }

  const data = (await response.json()) as { products?: OpenFoodFactsRawProduct[] };
  const results: FoodCatalogProduct[] = [];
  for (const item of data.products || []) {
    const normalized = normalizeProduct(item, 'search');
    if (normalized && (normalized.caloriesPerServing > 0 || normalized.proteinPerServing > 0)) {
      results.push(normalized);
    }
  }
  return results;
}
