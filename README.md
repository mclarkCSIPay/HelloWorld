# X2-HelloWorldD

Minimal Node.js/TypeScript web server serving a "Hello World" page for the AI-DLC triPOS Lane Devices POC initiative.

## Overview

This service provides a simple HTTP server that serves a single HTML page displaying "Hello World" centered horizontally. It follows X2 platform technology standards and serves as the foundational proof-of-concept for future lane device integration work.

## Technology Stack

- Node.js 18.18+
- TypeScript 4.x
- Koa framework
- Jest for unit testing
- fast-check for property-based testing
- Playwright for browser integration testing

## Installation

```bash
# Install dependencies
yarn install
```

## Development

```bash
# Run in development mode with hot reload
yarn dev

# Build TypeScript
yarn build

# Run in production mode
yarn start
```

## Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Lint code
yarn lint
```

## Configuration

The server can be configured using environment variables:

- `PORT` - Server port (default: 3000)
- `HOST` - Bind address (default: "0.0.0.0")
- `NODE_ENV` - Environment (development/production)

## Usage

Start the server and navigate to `http://localhost:3000` to see the Hello World page.

```bash
# Example with custom port
PORT=8080 yarn start
```

## Project Structure

```
X2-HelloWorldD/
├── src/
│   ├── index.ts              # Entry point
│   ├── route/                # Koa route handlers
│   ├── service/              # Business logic
│   ├── util/                 # Helper functions
│   └── test/                 # Test files
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
└── jest.config.js
```
