/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlistsongactivities', {
    id: {
      type: 'VARCHAR(50)',
      primarykey: true,
    },
    playlistId: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    songId: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    userId: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    action: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    time: {
      type: 'TIMESTAMP',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'playlistsongactivities',
    'fk_playlistsongactivities.playlistId_playlists.id',
    'FOREIGN KEY ("playlistId") REFERENCES playlists(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    'playlistsongactivities',
    'fk_playlistsongactivities.playlistId_playlists.id',
  );

  pgm.dropTable('playlistsongactivities');
};
