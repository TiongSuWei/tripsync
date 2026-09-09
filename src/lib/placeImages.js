import { base44 } from '@/api/base44Client';

// Extract place names from markdown links in AI-generated text
export const extractPlaces = (text) => {
  const matches = [...text.matchAll(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g)];
  return matches
    .map(m => m[1].trim())
    .filter(name => name.length > 2 && !/^(Day \d+|✈️|🏨|🍽️|🎭|💰|📅|Trip Summary|Accommodation|Food|Attractions|Budget|Itinerary|Summary)/i.test(name))
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3);
};

// Generate images for extracted places in parallel
export const generatePlaceImages = async (text) => {
  const places = extractPlaces(text);
  if (places.length === 0) return [];
  try {
    const results = await Promise.all(
      places.map(place =>
        base44.integrations.Core.GenerateImage({
          prompt: `A beautiful, high-quality travel photo of ${place}, scenic, professional travel photography`,
        }).then(r => ({ place, url: r?.url })).catch(() => null)
      )
    );
    return results.filter(Boolean).filter(r => r.url);
  } catch {
    return [];
  }
};