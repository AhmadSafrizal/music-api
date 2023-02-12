const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistSongHandler {
  constructor(playlistSongsService, playlistService, songsService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);

      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistSongsService.verifySong(songId);
      await this._playlistSongsService.verifyPlaylistAccess(playlistId, credentialId);

      // eslint-disable-next-line max-len
      const playlistSongId = await this._playlistSongsService.addPlaylistSong(
        playlistId,
        songId,
      );

      // activity
      await this._songsService.getSongById(songId);
      await this._playlistSongsService.postActivity(
        playlistId,
        songId,
        credentialId,
        'add',
      );

      const response = h.response({
        status: 'success',
        message: 'berhasil menambahkan lagu ke playlist',
        data: {
          playlistSongId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongsHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId,
      );

      const playlist = await this._playlistsService.getPlaylistById(
        credentialId,
        playlistId,
      );

      const songs = await this._songsService.getSongsByPlaylistId(playlistId);
      playlist.songs = songs;

      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getActivitiesHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId,
      );

      const activities = await this._playlistSongsService.getActivitiesFromPlaylist(
        playlistId,
      );
      return {
        status: 'success',
        data: {
          playlistId,
          activities: activities.map((activity) => ({
            username: activity.username,
            title: activity.title,
            action: activity.action,
            time: activity.time,
          })),
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._songsService.getSongById(songId);
      await this._playlistSongsService.postActivity(
        playlistId,
        songId,
        credentialId,
        'delete',
      );

      const owner = await this._playlistsService.getOwnerPlaylistById(playlistId);
      if (owner !== credentialId) {
        throw new AuthorizationError('Anda tidak berhak menghapus lagu di playlist');
      }

      await this._playlistSongsService.deletePlaylistSong(songId);
      return {
        status: 'success',
        message: 'Lagu pada playlist berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = PlaylistSongHandler;
