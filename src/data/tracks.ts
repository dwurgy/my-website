// The music player's songs: Apple Music catalog song IDs, in play order. David
// picks these (3 to 5). Titles, artwork, and lengths come from Apple Music
// when the player loads, so nothing else about the songs is written here.
//
// To find another song's ID, open it in Apple Music and copy its link: the ID
// is the number after "?i=" (for a single, the last number in the link).

export const songIds: string[] = [
  '1382319792', // When You're Ready
  '1631447120', // Anger & Grace (Acoustic)
  '1382319808', // Didn't See It Coming
  '1760789086', // Hark (Mitsunami, feat. My Brothers And I)
  '1382320661', // Always Be Loving You
];

/** Apple Music's page for the band, the fallback for "Listen on Apple Music". */
export const artistUrl = 'https://music.apple.com/us/artist/my-brothers-and-i/892386824';
