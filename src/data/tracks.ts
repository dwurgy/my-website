// The music player's songs: Apple Music catalog song IDs, in play order. David
// picks these (3 to 5). Titles, artwork, and lengths come from Apple Music
// when the player loads, so nothing else about the songs is written here.
//
// Find an ID in the list at /api/music/songs on a preview link, or at the end
// of a song's Apple Music address (…?i=<id>).

export const songIds: string[] = [];

/** Apple Music's page for the band, the fallback for "Listen on Apple Music". */
export const artistUrl = 'https://music.apple.com/us/artist/my-brothers-and-i/892386824';
