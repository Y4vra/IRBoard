FROM maven:3.9.6-eclipse-temurin-21 AS dev

WORKDIR /app
COPY . .
CMD ["mvn", "spring-boot:run"]

FROM maven:3.9.6-eclipse-temurin-21 AS build

RUN apt-get update \
 && apt-get install -y curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests


FROM eclipse-temurin:21-jre-jammy AS production
WORKDIR /app

COPY --from=build --chmod=755 /app/target/app-exec.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]