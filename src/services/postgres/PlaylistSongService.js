const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBToModelPlaylistActivities } = require('../../utils/playlistActivitiesDB');

class PlaylistSongsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationService = collaborationsService;
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlistSong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsong VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan lagu ke playlist');
    }

    return result.rows[0].id;
  }

  async postActivity(playlistId, songId, userId, action) {
    const id = `playlistSongActivity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlistsongactivities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Aktifitas gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getActivitiesFromPlaylist(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlistsongactivities.action, playlistsongactivities.time FROM playlistsongactivities
      RIGHT JOIN users on users.id = playlistsongactivities."userId"
      RIGHT JOIN songs on songs.id = playlistsongactivities."songId"
      WHERE playlistsongactivities."playlistId" = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapDBToModelPlaylistActivities);
  }

  async deletePlaylistSong(songId) {
    const query = {
      text: 'DELETE FROM playlistsong WHERE "songId" = $1 RETURNING id',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu di playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifySong(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT playlists.owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistSongsService;
