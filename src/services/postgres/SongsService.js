const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelSong } = require('../../utils/songsDB');
const { mapDBToModelPlaylistSongs } = require('../../utils/playlistSongDB');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    if (title && performer) {
      const result = await this._pool.query(
        `SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE '%${title}%' AND LOWER(performer) LIKE '%${performer}%'`,
      );
      return result.rows;
    }

    if (title || performer) {
      const result = await this._pool.query(
        `SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE '%${title}%' OR LOWER(performer) LIKE '%${performer}%'`,
      );
      return result.rows;
    }
    const result = await this._pool.query(
      'SELECT id, title, performer FROM songs',
    );
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapDBToModelSong)[0];
  }

  async getSongsByPlaylistId(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
        JOIN playlistsong ON songs.id = playlistsong."songId"
        JOIN playlists ON playlistsong."playlistId" = playlists.id
        WHERE playlistsong."playlistId" = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelPlaylistSongs);
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id ',
      values: [title, year, genre, performer, duration, albumId, id],
    };
    const resultSong = await this._pool.query(query);
    if (!resultSong.rowCount) {
      throw new NotFoundError('Gagal Memperbarui lagu');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifySongIsExists(id) {
    const query = await this._pool.query({
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id],
    });

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }
}

module.exports = SongsService;
