export const collectionWallpapers: Record<string, string> = {
  "season-1": "/wallpapers/collection-1.jpg",
  "season-2": "/wallpapers/collection-2.jpg",
  "season-3": "/wallpapers/collection-3.jpg",
};

export function getCollectionWallpaper(slug: string) {
  const key = (slug || "").toLowerCase();
  return collectionWallpapers[key] ?? "/wallpapers/collection-1.jpg";
}
