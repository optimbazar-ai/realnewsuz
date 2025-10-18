import { createApi } from "unsplash-js";
import nodeFetch from "node-fetch";

if (!process.env.UNSPLASH_ACCESS_KEY) {
  throw new Error("UNSPLASH_ACCESS_KEY must be set");
}

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  fetch: nodeFetch as any,
});

export async function searchPhotoForArticle(keyword: string, usedPhotoIds: string[] = []): Promise<{
  imageUrl: string;
  photographerName: string;
  photographerUrl: string;
  photoId: string;
} | null> {
  
  // =================== VAQTINCHALIK TEST KODI (Ssenariy #1B) ===================
  // Maqsad: Unsplash API'dan xatolikni ataylab simulyatsiya qilish
  console.log("⚠️ TEST MODE: Simulating Unsplash API Error...");
  throw new Error("Simulated Unsplash API Error: No image found or API down");
  // ===========================================================================
  
  try {
    const result = await unsplash.search.getPhotos({
      query: keyword,
      page: 1,
      perPage: 10,
      orientation: "landscape",
    });

    if (result.errors || !result.response || result.response.results.length === 0) {
      console.error("No photos found for keyword:", keyword);
      return null;
    }

    const availablePhotos = result.response.results.filter(
      photo => !usedPhotoIds.includes(photo.id)
    );

    if (availablePhotos.length === 0) {
      console.log("All photos for this keyword are already used, getting random photo");
      return await getRandomPhoto(keyword);
    }

    const randomIndex = Math.floor(Math.random() * availablePhotos.length);
    const photo = availablePhotos[randomIndex];

    await unsplash.photos.trackDownload({
      downloadLocation: photo.links.download_location,
    });

    return {
      imageUrl: photo.urls.regular,
      photographerName: photo.user.name,
      photographerUrl: `${photo.user.links.html}?utm_source=real_news&utm_medium=referral`,
      photoId: photo.id,
    };
  } catch (error) {
    console.error("Error searching Unsplash photos:", error);
    return null;
  }
}

export async function getRandomPhoto(query?: string): Promise<{
  imageUrl: string;
  photographerName: string;
  photographerUrl: string;
  photoId: string;
} | null> {
  try {
    const result = await unsplash.photos.getRandom({
      query: query || "news",
      orientation: "landscape",
    });

    if (result.errors || !result.response) {
      console.error("Error getting random photo");
      return null;
    }

    const photo = Array.isArray(result.response) ? result.response[0] : result.response;

    await unsplash.photos.trackDownload({
      downloadLocation: photo.links.download_location,
    });

    return {
      imageUrl: photo.urls.regular,
      photographerName: photo.user.name,
      photographerUrl: `${photo.user.links.html}?utm_source=real_news&utm_medium=referral`,
      photoId: photo.id,
    };
  } catch (error) {
    console.error("Error getting random Unsplash photo:", error);
    return null;
  }
}
