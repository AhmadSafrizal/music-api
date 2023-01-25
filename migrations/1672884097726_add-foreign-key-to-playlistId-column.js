/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint(
    'playlistsong',
    'fk_playlistsong.playlistId_playlists.id',
    'FOREIGN KEY("playlistId") REFERENCES playlists(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  // hapus cons fk_playlistsong.playlistId_playlists.id
  pgm.dropConstraint(
    'playlistsong',
    'fk_playlistsong.playlistId_playlists.id',
  );
};
