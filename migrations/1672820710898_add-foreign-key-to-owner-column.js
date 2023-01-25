/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // buat user
  pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES ('old_playlists', 'old_playlists', 'old_playlists', 'old_playlists')");

  // ubah owner ketika owner null
  pgm.sql("UPDATE playlists SET owner = 'old_playlists' WHERE owner IS NULL");

  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // hapus cons fk_playlists.owner_user.id
  pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id');

  // mengubah nilai owner
  pgm.sql("UPDATE playlists SET owner = NULL WHERE owner = 'old_playlists'");

  // menghapus user
  pgm.sql("DELETE FROM users WHERE id = 'old_playlists'");
};
