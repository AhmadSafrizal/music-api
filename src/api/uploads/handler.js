const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadCoverHandler(request, h) {
    try {
      const { cover } = request.payload;
      const { id } = request.params;

      this._validator.validateImageHeaders(cover.hapi.headers);

      const filename = await this._service.writeFile(
        cover,
        cover.hapi,
      );

      const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/uploads/file/covers/${filename}`;
      await this._albumsService.addCoverAlbum(id, fileLocation);

      const response = h.response({
        status: 'success',
        message: 'Cover berhasil diunggah',
        data: {
          fileLocation,
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

module.exports = UploadsHandler;
