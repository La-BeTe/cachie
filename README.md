# Cachie - In-Memory Cache Analytics Engine

Cachie is an in-memory cache analytics engine that tracks search patterns with support for pattern matching, statistical analysis, and client tracking.

This repository contains a Node.js backend API that implements two key endpoints for interacting with search data:

- **POST /search**: Accepts a search query along with client tracking information.
- **GET /analyse**: Analyzes a series of tokens and provides detailed statistics on their occurrences.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [License](#license)

## Installation

Follow these steps to set up the project locally:

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/cachie.git
    cd cachie
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

## Environment Variables

The application requires the following environment variables to configure its runtime behavior:

- `PORT`: The port the server will listen on (default: `9000`).
- `CACHE_TTL`: The time-to-live (TTL) for cache entries in seconds (default: `900` seconds = 15 minutes).
- `MAX_REQUESTS`: The maximum number of requests allowed per client (default: `100`).
- `RATE_LIMIT_WINDOW`: The time window for rate limiting in seconds (default: `3600` seconds = 1 hour).

You can create a `.env` file in the root of the project and add your environment variables there, like so:

```
PORT=9000
CACHE_TTL=900
MAX_REQUESTS=100
RATE_LIMIT_WINDOW=3600
```

Alternatively, you can set these variables directly in your terminal:

```bash
export PORT=9000
export CACHE_TTL=900
export MAX_REQUESTS=100
export RATE_LIMIT_WINDOW=3600
```

## Running the Application

To run the server locally, use the following command:

```bash
npm start
```

This will start the server on the port specified in your `.env` file or `PORT` environment variable (default: `9000`).

Once the server is running, you can access the endpoints at:

- `POST /search`: [http://localhost:9000/search](http://localhost:9000/search)
- `GET /analyse`: [http://localhost:9000/analyse](http://localhost:9000/analyse)

## Testing

### Unit Tests

To run the unit tests for the application, use the following command:

```bash
npm test
```

This will run all the unit tests using Jest.

### Running Tests for Specific Files

To run tests for specific files, use:

```bash
npx jest path/to/test-file.js
```

### Code Coverage

To see the code coverage of your tests, you can run:

```bash
npx jest --coverage
```

## API Documentation

### POST /search

**Request Body:**

```json
{
	"search_query": "The quick brown fox jumps",
	"client_id": "client_123",
	"session_id": "session_1"
}
```

**Response:**

```json
{
	"status": "ok",
	"processed_tokens": 5,
	"processing_time": "5ms"
}
```

### GET /analyse

**Query Parameters:**

- `analysis_token`: Comma-separated list of one or two words to analyze (e.g., "the quick,lazy dog").
- `match_type`: Either `exact` or `fuzzy` (optional, default: `exact`).
- `include_stats`: Boolean to include stats about the analysis (optional, default: `false`).

**Example Request:**

```http
GET /analyse?analysis_token=the quick&match_type=fuzzy&include_stats=true
```

**Response:**

```json
{
	"results": {
		"the quick": {
			"exact_matches": 1,
			"fuzzy_matches": 1,
			"client_distribution": {
				"client_123": 2
			},
			"unique_sessions": 2
		}
	},
	"stats": {
		"unique_clients": 1,
		"unique_sessions": 2,
		"processing_time": "5ms",
		"total_searches_analyzed": 2
	}
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
