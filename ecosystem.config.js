/* eslint-disable camelcase */
module.exports = {
  apps: [
    {
      name: "JobFair Frontend",
      exec_mode: "cluster",
      instances: "max",
      interpreter: "/bin/bash",
      script: "yarn",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "JobFair Backend",
      exec_mode: "cluster",
      instances: "max",
      interpreter: "/bin/bash",
      cwd: "./backend",
      script: "yarn",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
