/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint(
    'playlistsong',
    'fk_playlistsong.songId_songs.id',
    'FOREIGN KEY("songId") REFERENCES songs(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  // hapus cons fk_playlistsong.songId_songs.id
  pgm.dropConstraint(
    'playlistsong',
    'fk_playlistsong.songId_songs.id',
  );
};
