FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN mvn -DskipTests package

FROM eclipse-temurin:17-jre-jammy
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /workspace/target/payment-service-0.0.1-SNAPSHOT.jar ./payment-service.jar
EXPOSE 4000
ENTRYPOINT ["java","-jar","/app/payment-service.jar"]
