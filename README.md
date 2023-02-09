# FER Job Fair website

This is the repository for the [FER Job Fair](https://jobfair.fer.unizg.hr) website.

The current folder contains the frontend code. The backend code is located in the [backend](./backend) folder.

## Setup

Make sure to install the dependencies first:

```bash
yarn install
```

The .tool-versions file contains the versions of the tools used in this project.
If you use [asdf](https://asdf-vm.com/#/), you can run `asdf install` to install the correct versions.

Next, create a `.env` file.
The template for the files is `.env.example`.

Make sure to follow the setup steps for the [backend](./backend/README.md) next.

Next, generate the GraphQL schema on the backend:

```bash
yarn graphql:schema:dump
```

And then generate the GraphQL types for the frontend:

```bash
yarn graphql:schema:gen
```

## Development

Start the development server on http://localhost:3000 (by default, set the `PORT` environment variable to change the port)

```bash
yarn dev
```

### Caddy configuration

Caddy is used as a reverse proxy for the frontend and backend. The configuration file is the [Caddyfile](./Caddyfile).
To run Caddy, run the following command:

```bash
sudo caddy run
```

It assumes that the frontend is running on port 3000 and the backend is running on port 3001.
It will start a reverse proxy on port 80.

## Production

Build the frontend for production:

```bash
yarn build
```

Start the frontend in production mode:

```bash
yarn start
```

### Docker

To run the whole application in a Docker container, run the following command:

```bash
docker compose up --build --detach --remove-orphans --pull always --wait
```

It will start all required services (frontend, backend, database, proxy, minio).
No ports are exposed to the host machine.
To access the application, you to create a `docker-compose.override.yml` file
and add the appropriate configuration/overrides to it.
