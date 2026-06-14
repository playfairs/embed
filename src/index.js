export default {
  async fetch(request, env) {
    return Response.json(Object.keys(env));
  }
};
