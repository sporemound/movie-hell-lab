interface Env {
  MOVIE_HELL_BACKEND?: Fetcher;
}

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/") && env.MOVIE_HELL_BACKEND) {
    return env.MOVIE_HELL_BACKEND.fetch(request);
  }
  return next();
};
