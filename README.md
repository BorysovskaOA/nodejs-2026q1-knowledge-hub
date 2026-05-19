# Knowledge Hub

## Docker image

```
https://hub.docker.com/r/olhaborysovska/nodejs-2026q1-knowledge-hub-app
```

Image does not have any critical vulnerabilities:
CRITICAL 0  
HIGH 12
MEDIUM 13
LOW 1

## Env variables

Define env variables in .env based on .env.example

## AI generation:

Go to https://aistudio.google.com/app/api-keys and create a new key:

1. Click `Create API key` button
2. Provide a name for your key and select a project to which this API key will be assigned. You can create new project or assign to other project.
3. Click `Create key` button.
4. Once created, copy this API key cna place it for GEMINI_API_KEY variable
5. Select model from the list of available models and place in correct env variables. Best way is to go to https://aistudio.google.com/app/rate-limit and selest model that has more than 0/0 (those are unsupported/unavailable). For content generation used gemini-2.5-flash, for embeddings used:gemini-embedding-2.

Qdrant is used for RAG vector db which is added to docker-compose.yaml to start together with app.
For index building was used vectors with output dimentionality `768` and `Cosine` algorithm for similarity checking.

Both Gemini and Qdrant have limitations for free usage:

### Gemini

- Request Limits: Free tier users may have approximately 20 requests per day (RPD) for advanced models such as Gemini 2.5 Flash, a reduction from previous limits.
- Model Restrictions: Many free accounts have lost access to the premium Gemini 2.5 Pro model.
- Rate Limits: Users are generally restricted to 5–15 requests per minute (RPM), depending on the model.
- Data Usage: Google may use free tier data to improve services.
- Service Instability: Free access is not guaranteed, and capacity is unpredictable, which can result in 429 error messages (rate-limit).

### Qdrant

- Capacity: The free tier is limited to 1 GB of RAM and 4 GB of disk storage.
- No High Availability: Free tier clusters are not highly available, making them vulnerable to downtime.
- Resource Sharing: Free clusters share resources, which can lead to unpredictable latency.
- Limited Support: There is no dedicated support for free users

## Run in docker

### Production

```
docker compose up -d --build
```

### Development

```
docker compose --profile dev up -d --build
```

## Seeding

```
npx prisma db seed
```

## Local installation

### Installing NPM modules

```
npm install
```

### Running application

```
npm start
```

After starting the app on port (4000 as default) you can open
in your browser OpenAPI documentation by typing http://localhost:4000/doc/.
For more information about OpenAPI/Swagger please visit https://swagger.io/.

## Testing

After application running open new terminal and enter:

To run all tests: unit and e2e

```
npm run test
```

To run only one of all test suites

```
npm run test -- <path to suite>
```

To run all test with authorization

```
npm run test:auth
```

To run only specific test suite with authorization

```
npm run test:auth -- <path to suite>
```

To run refresh token tests

```
npm run test:refresh
```

To run RBAC (role-based access control) tests

```
npm run test:rbac
```

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

### Debugging in VSCode

Press <kbd>F5</kbd> to debug.

For more information, visit: https://code.visualstudio.com/docs/editor/debugging

## Documentation

Documentation for APIs provided by swagger on `/doc` route with all description and input/output params.
