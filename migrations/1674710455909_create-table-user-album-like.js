/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('useralbumlikes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    userId: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    albumId: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('useralbumlikes', 'unique_userId_and_albumId', 'UNIQUE("userId", "albumId")');

  pgm.addConstraint('useralbumlikes', 'fk_useralbumlikes.users.id', 'FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE');

  pgm.addConstraint('useralbumlikes', 'fk_useralbumlikes.albums.id', 'FOREIGN KEY ("albumId") REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('useralbumlikes');
};
