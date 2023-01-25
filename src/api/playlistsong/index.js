const PlaylistSongHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (server, {
    playlistSongsService,
    playlistsService,
    songsService,
    validator,
  }) => {
    const playlistSongHandler = new PlaylistSongHandler(
      playlistSongsService,
      playlistsService,
      songsService,
      validator,
    );
    server.route(routes(playlistSongHandler));
  },
};
