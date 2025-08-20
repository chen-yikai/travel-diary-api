# Build stage
FROM gradle:8.5-jdk21 AS builder

WORKDIR /app

# Copy gradle files first for better caching
COPY build.gradle.kts gradle.properties ./
COPY gradle/ gradle/

# Download dependencies (this layer will be cached unless build files change)
RUN gradle dependencies --no-daemon

# Copy source code
COPY src/ src/

# Build the application
RUN gradle shadowJar --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

# Install curl for health checks (optional)
RUN apk add --no-cache curl

# Create app user for security
RUN addgroup -g 1000 app && \
    adduser -u 1000 -G app -s /bin/sh -D app

WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/build/libs/*-all.jar app.jar

# Change ownership of the app directory
RUN chown -R app:app /app

# Switch to non-root user
USER app

# Expose the port your Ktor app runs on
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Run the application
CMD ["java", "-jar", "app.jar"]
