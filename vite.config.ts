import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const repositoryName = env.GITHUB_REPOSITORY?.split("/")[1];
  const isGitHubActions = env.GITHUB_ACTIONS === "true";

  return {
    base: isGitHubActions && repositoryName ? `/${repositoryName}/` : "/",
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      hmr: false,
    },
  };
});