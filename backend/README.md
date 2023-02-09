# Backend

This is the backend for the [frontend](..).

## Setup

Make sure to install the dependencies first:

```bash
yarn install
```

The `.tool-versions` file contains the versions of the tools used in this project.
If you use [asdf](https://asdf-vm.com/#/), you can run `asdf install` to install the correct versions.

Next, create a `.env` file.
The template for the files is `.env.example`.

Generate the Prisma client:

```bash
yarn db:client:gen
```

If you want to use the database migrations, you need to run the following command:

```bash
yarn db:migration:deploy
```

## Development

Start the development server on http://localhost:3001 (by default, set the `PORT` environment variable to change the port):

```bash
yarn dev
```

To generate a new migration, run the following command:

```bash
yarn db:migration:new
```

To format the prisma schema, run the following command:

```bash
yarn db:schema:format
```

## Production

Build the application for production:

```bash
yarn build
```

Start the application in production mode:

```bash
yarn start
```
