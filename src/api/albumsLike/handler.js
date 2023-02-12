const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class AlbumsLikesHandler {
  constructor(service, albumsService) {
    this._service = service;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postLikeHandler(request, h) {
    try {
      const { albumId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._albumsService.getAlbumById(albumId);

      const like = await this._service.checkLikes(credentialId, albumId);

      if (!like) {
        const likeId = await this._service.addAlbumLike(credentialId, albumId);

        const response = h.response({
          status: 'success',
          message: `Berhasil menyukai pada album ${likeId}`,
        });
        response.code(201);
        return response;
      }

      await this._service.deleteAlbumLike(credentialId, albumId);

      const response = h.response({
        status: 'success',
        message: 'Berhasil melakukan unlike',
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
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getLikeHandler(request, h) {
    try {
      const { albumId } = request.params;
      const { likes, cached } = await this._service.getLikesCount(albumId);

      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });
      response.code(200);
      response.header('X-Data-Source', cached);
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
      // Server ERROR!
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

module.exports = AlbumsLikesHandler;
