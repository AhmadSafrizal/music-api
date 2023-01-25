/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlistsong', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlistId: {
      type: 'VARCHAR(50)',
      notNull: false,
    },
    songId: {
      type: 'VARCHAR(50)',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlistsong');
};
