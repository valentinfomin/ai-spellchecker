export default {
  async fetch(request, env) {
    // Serve static assets from the /public folder
    return env.ASSETS.fetch(request);
  },
};