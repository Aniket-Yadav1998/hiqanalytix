# hiqanalytix — Master Setup Guide

Welcome! This guide takes you from a blank machine to a running website — the React frontend on your screen and a **Java Spring Boot** backend accepting contact form submissions.

> If you don't want to install Java, this preview environment already ships a working Python (FastAPI) backend that speaks the same `POST /api/contact` endpoint. The frontend works with either.

---

## Part 1 — Install the tools (one-time)

### 1.1 Install **Node.js 20 LTS**
- Go to https://nodejs.org → download the **LTS** installer for your OS → install with the default options.
- Open a new terminal and check:
  ```bash
  node -v      # v20.x.x
  npm -v       # 10.x.x
  ```

### 1.2 Install **Yarn** (used by this project)
```bash
npm install -g yarn
yarn -v        # 1.22.x
```

### 1.3 Install **Java JDK 17+** (Temurin recommended)
- Go to https://adoptium.net → pick **Temurin 21 (LTS)** → install with defaults.
- New terminal:
  ```bash
  java -version    # openjdk 21.x.x
  ```

### 1.4 Install **IntelliJ IDEA Community** (free)
- Download: https://www.jetbrains.com/idea/download → install with defaults.

---

## Part 2 — Run the React frontend

You already have the React code in the `/frontend` folder of this repo.

```bash
cd frontend
yarn install
yarn start
```

The website opens on **http://localhost:3000**.

### 2.1 Point the frontend at your backend
Open `frontend/.env` and set:
```
REACT_APP_BACKEND_URL=http://localhost:8080     # if using Spring Boot
# OR
REACT_APP_BACKEND_URL=http://localhost:8001     # if using the FastAPI backend included in this preview
```
Save the file and restart `yarn start`.

---

## Part 3 — Create the Spring Boot backend in IntelliJ

### 3.1 Generate the project with Spring Initializr
1. Open your browser: **https://start.spring.io**
2. Fill in:
   - Project: **Maven**
   - Language: **Java**
   - Spring Boot: **3.3.x** (latest 3.x)
   - Group: `com.hiqanalytix`
   - Artifact: `contact-api`
   - Packaging: **Jar**
   - Java: **21**
3. Dependencies (click "Add Dependencies"):
   - **Spring Web**
   - **Spring Data JPA**
   - **H2 Database**
   - **Validation**
   - **Lombok** (optional)
4. Click **Generate** → a `.zip` downloads.
5. Unzip it somewhere (e.g. `~/projects/contact-api`).

### 3.2 Open in IntelliJ
1. IntelliJ → **File → Open** → select the unzipped `contact-api` folder → **Open as Project**.
2. IntelliJ will download dependencies automatically (bottom-right progress bar).

### 3.3 Drop in the code
Copy the files from `/deliverables/spring-boot/` in this repo into your Spring Boot project, matching the paths:

```
contact-api/
├── src/main/java/com/hiqanalytix/contactapi/
│   ├── ContactApiApplication.java   (already exists — leave it)
│   ├── config/CorsConfig.java
│   ├── contact/ContactController.java
│   ├── contact/ContactEntity.java
│   ├── contact/ContactRepository.java
│   ├── contact/ContactRequest.java
│   └── contact/ContactService.java
└── src/main/resources/
    └── application.properties
```

### 3.4 Run the backend
- Open `ContactApiApplication.java` in IntelliJ → click the green ▶ next to `main`.
- The console shows: `Tomcat started on port(s): 8080`.
- Test it:
  ```bash
  curl http://localhost:8080/api/health
  # {"status":"healthy"}
  ```

### 3.5 View the H2 database (optional)
- Open http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:hiqdb` — user `sa` — password blank → **Connect**.
- Table `CONTACTS` shows every lead submitted.

---

## Part 4 — Run frontend + backend together

- **Terminal 1**: `cd contact-api` → run `./mvnw spring-boot:run` (or use the ▶ in IntelliJ).
- **Terminal 2**: `cd frontend` → run `yarn start`.
- Open http://localhost:3000, fill the contact form, click **Send message**.
- You'll see a green success toast, and the row appears in the H2 console.

---

## Part 5 — Common issues

| Symptom | Fix |
|---|---|
| CORS error in browser console | Confirm the frontend URL in `CorsConfig.java` matches (default `http://localhost:3000`). |
| `Port 8080 already in use` | Change `server.port=8081` in `application.properties` and update `REACT_APP_BACKEND_URL`. |
| Form submit does nothing | Check `frontend/.env` → `REACT_APP_BACKEND_URL` points to the right port. Restart `yarn start` after changes. |
| `mvn` not found on Windows | Use `mvnw.cmd spring-boot:run` (the wrapper included by Spring Initializr). |

---

## Part 6 — What's included

- `frontend/` — React + Tailwind + Framer Motion + Lenis (smooth scroll) + Sonner (toasts).
- `backend/` — FastAPI Python backend (preview-ready, works in this environment).
- `deliverables/spring-boot/` — the Java Spring Boot code to drop into IntelliJ.

You now have a fully working, enterprise-grade website end to end. 🎉
