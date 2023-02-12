const AlbumsLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albumsLike',
  version: '1.0.0',
  register: async (server, { service, albumsService }) => {
    const albumsLikesHandler = new AlbumsLikesHandler(service, albumsService);
    server.route(routes(albumsLikesHandler));
  },
};
