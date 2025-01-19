# Environment

.env file
```Environment
# The URL of the authentication service API
AUTH_API=<Authentication service API URL, e.g., http://localhost:3000>

# The URL of the project management service API
PROJECT_API=<Project management service API URL, e.g., http://localhost:3001>

# The URL of the task management service API
TASK_API=<Task management service API URL, e.g., http://localhost:3002>

# A secret key for signing and verifying JSON Web Tokens (JWT)
JWT_KEY=<Strong and unique key for JWT authentication>

# OpenTelemetry resource attributes
OTEL_RESOURCE_ATTRIBUTES=<Resource attributes, e.g., service.name=front-service>

# The endpoint for OpenTelemetry data export
OTEL_EXPORTER_OTLP_ENDPOINT=<OpenTelemetry exporter endpoint, e.g., http://localhost:4318>

# The log level for OpenTelemetry logging
OTEL_LOG_LEVEL=<Log level, e.g., info, debug, warn, error>
```

# Run Development

Initialize the database first, and set up Authentication [[Go Auth Service](https://github.com/Pezl05/go-auth-service)] , Project Services [[NestJS Project Service](https://github.com/Pezl05/nestjs-project-service)] and Task Services [[Python Task Service](https://github.com/Pezl05/python-task-service)].

```Docker-compose file
# Docker-compose.yaml file
version: '3.8'

services:
  db:
    image: postgres:latest
    container_name: project_mgmt_db
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: P@ssw0rd
      POSTGRES_DB: project_mgmt
    volumes:
      - ./database/data:/var/lib/postgresql/data
      # - ./database/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - project_network
  
  auth-service:
    image: go-auth-service:v1
    container_name: auth-service
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=admin
      - DB_PASSWORD=P@ssw0rd
      - DB_NAME=project_mgmt
      - JWT_KEY=P@ssw0rd
    ports:
      - "3000:3000"
    networks:
      - project_network
    depends_on:
      - db
    restart: unless-stopped

  project-service:
    image: nestjs-project-service:v1
    container_name: project-service
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=admin
      - DB_PASSWORD=P@ssw0rd
      - DB_NAME=project_mgmt
      - JWT_KEY=P@ssw0rd
    ports:
      - "3001:3000"
    networks:
      - project_network
    depends_on:
      - auth-service
    restart: unless-stopped    

  task-service:
    image: python-task-service:v1
    container_name: task-service
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=admin
      - DB_PASSWORD=P@ssw0rd
      - DB_NAME=project_mgmt
      - JWT_KEY=P@ssw0rd
    ports:
      - "3002:3000"
    networks:
      - project_network
    depends_on:
      - project-service
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  project_network:
```

Create & Run Database Container using Docker Compose 
```
$ docker compose up -d
```

Build Command.
```
# Download dependencies
$ npm install

# NextJS Run Application for Development
$ npm run dev
```

# Run Container
```
version: '3.8'

services:
  db:
    image: postgres:latest
    container_name: project_mgmt_db
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: P@ssw0rd
      POSTGRES_DB: project_mgmt
    volumes:
      - ./database/data:/var/lib/postgresql/data
      # - ./database/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - project_network
  
  auth-service:
    image: go-auth-service:v1
    container_name: auth-service
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=admin
      - DB_PASSWORD=P@ssw0rd
      - DB_NAME=project_mgmt
      - JWT_KEY=P@ssw0rd
    ports:
      - "3000:3000"
    networks:
      - project_network
    depends_on:
      - db
    restart: unless-stopped

  project-service:
    image: nestjs-project-service:v1
    container_name: project-service
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=admin
      - DB_PASSWORD=P@ssw0rd
      - DB_NAME=project_mgmt
      - JWT_KEY=P@ssw0rd
    ports:
      - "3001:3000"
    networks:
      - project_network
    depends_on:
      - auth-service
    restart: unless-stopped    

  task-service:
    image: python-task-service:v1
    container_name: task-service
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=admin
      - DB_PASSWORD=P@ssw0rd
      - DB_NAME=project_mgmt
      - JWT_KEY=P@ssw0rd
    ports:
      - "3002:3000"
    networks:
      - project_network
    depends_on:
      - project-service
    restart: unless-stopped

  front-service:
    build: .
    image: nextjs-front-service:v1
    container_name: front-service
    ports:
      - "3003:3000"
    networks:
      - project_network
    depends_on:
      - task-service
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  project_network:
```

Create & Run container using Docker Compose.
```
$ docker compose up -d --build
```

Stop & Delete container using Docker Compose.
```
$ docker compose down
```