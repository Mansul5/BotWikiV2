import { WikipediaData } from '../types';

/**
 * Nettoie les phrases d'interrogation courantes en français (ou anglais)
 * pour optimiser la recherche de titre sur Wikipédia si nécessaire.
 */
export function extractSubjectQuery(rawQuery: string): string {
  let q = rawQuery.trim();
  // Supprimer la ponctuation finale éventuelle (?, !)
  q = q.replace(/[?!.]+$/, '').trim();

  // Liste de préfixes interrogatifs fréquents
  const prefixes = [
    /^(qu'est-ce que|qu'est ce que|c'est quoi|qui est|qui était|qui sont|parle[- ]moi de|parle[- ]moi du|parle[- ]moi des|qu'est[- ]ce qu'|raconte[- ]moi|donne[- ]moi des infos sur|définition de|définis|qu'est[- ]ce)\s+/i,
    /^(what is|who is|tell me about|define|what are|who was)\s+/i,
    /^(peux[- ]tu me dire qui est|peux[- ]tu me parler de|explique[- ]moi)\s+/i,
  ];

  for (const regex of prefixes) {
    if (regex.test(q)) {
      const extracted = q.replace(regex, '').trim();
      if (extracted.length >= 2) {
        return extracted;
      }
    }
  }

  return q;
}

export async function searchWikipedia(
  userQuery: string,
  lang = 'fr'
): Promise<WikipediaData> {
  const cleanQuery = extractSubjectQuery(userQuery);
  const targetLang = lang || 'fr';

  try {
    // 1. Essai direct sur l'API Summary REST
    const directUrl = `https://${targetLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
    let response = await fetch(directUrl);

    let relatedTitles: string[] = [];

    // Si pas de page directe exacte, utiliser OpenSearch pour trouver les meilleurs résultats
    if (!response.ok || response.status === 404) {
      const opensearchUrl = `https://${targetLang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
        cleanQuery
      )}&limit=5&namespace=0&format=json&origin=*`;

      const searchResp = await fetch(opensearchUrl);
      if (!searchResp.ok) {
        throw new Error('Erreur de connexion à Wikipédia');
      }

      const searchData = await searchResp.json();
      const results: string[] = searchData[1] || [];

      if (results.length === 0) {
        // Dernier recours avec la requête brute complète
        if (cleanQuery !== userQuery.trim()) {
          return searchWikipedia(userQuery.trim(), lang);
        }
        throw new Error("Aucun article correspondant n'a été trouvé.");
      }

      const bestMatch = results[0];
      relatedTitles = results.slice(1);

      response = await fetch(
        `https://${targetLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch)}`
      );
    } else {
      // Rechercher quelques suggestions connexes pour enrichir la réponse
      try {
        const opensearchUrl = `https://${targetLang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
          cleanQuery
        )}&limit=4&namespace=0&format=json&origin=*`;
        const searchResp = await fetch(opensearchUrl);
        if (searchResp.ok) {
          const searchData = await searchResp.json();
          const results: string[] = searchData[1] || [];
          relatedTitles = results.filter(
            (t) => t.toLowerCase() !== cleanQuery.toLowerCase()
          );
        }
      } catch {
        // Silencieux pour les suggestions connexes
      }
    }

    if (!response.ok) {
      throw new Error("Impossible de récupérer l'article.");
    }

    const data = await response.json();

    if (!data.extract) {
      throw new Error("Aucun résumé disponible pour cet article.");
    }

    const pageUrl = data.content_urls?.desktop?.page ||
      `https://${targetLang}.wikipedia.org/wiki/${encodeURIComponent(data.title || cleanQuery)}`;

    return {
      title: data.title || cleanQuery,
      extract: data.extract,
      description: data.description,
      pageUrl,
      thumbnail: data.thumbnail
        ? {
            source: data.thumbnail.source,
            width: data.thumbnail.width,
            height: data.thumbnail.height,
          }
        : undefined,
      relatedTopics: relatedTitles.slice(0, 4),
      lang: targetLang,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
    throw new Error(errorMsg);
  }
}

export async function getRandomArticle(lang = 'fr'): Promise<WikipediaData> {
  const targetLang = lang || 'fr';
  const url = `https://${targetLang}.wikipedia.org/api/rest_v1/page/random/summary`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération d’un article aléatoire');
  }
  const data = await response.json();
  const pageUrl = data.content_urls?.desktop?.page ||
    `https://${targetLang}.wikipedia.org/wiki/${encodeURIComponent(data.title)}`;

  return {
    title: data.title,
    extract: data.extract,
    description: data.description,
    pageUrl,
    thumbnail: data.thumbnail
      ? {
          source: data.thumbnail.source,
          width: data.thumbnail.width,
          height: data.thumbnail.height,
        }
      : undefined,
    lang: targetLang,
  };
}
