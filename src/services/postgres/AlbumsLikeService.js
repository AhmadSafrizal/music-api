const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbumLike(userId, albumId) {
    const id = `albumLike-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO useralbumlikes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menyukai album');
    }

    await this._cacheService.delete(`likes:${albumId}`);
    return result.rows[0].id;
  }

  async deleteAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM useralbumlikes WHERE "userId" = $1 AND "albumId" = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus like');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async checkLikes(userId, albumId) {
    const query = {
      text: 'SELECT * FROM useralbumlikes WHERE "userId" = $1 AND "albumId" = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    return result.rowCount;
  }

  async getLikesCount(albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);
      return {
        likes: JSON.parse(result),
        cached: 'cache',
      };
    } catch {
      const query = {
        text: 'SELECT COUNT("userId") FROM useralbumlikes WHERE "albumId" = $1',
        values: [albumId],
      };

      const { rows } = await this._pool.query(query);

      // eslint-disable-next-line radix
      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(parseInt(rows[0].count)));

      return {
        // eslint-disable-next-line radix
        likes: parseInt(rows[0].count),
        cached: 'database',
      };
    }
  }
}

module.exports = AlbumsService;
