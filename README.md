# Short-Link Manager

## Table of Contents

* [**About**](#-about-the-project) - Project Overview
* [**Docs**](#-documentation) - Navigating the Application
* [**Features**](#-features) - Application Functionality
* [**Getting started**](#-getting-started) - How to run application locally
* [**TechStack**](#️-tech-stack) - About technologies used
* [**License**](#-license) - Terms of application usage

---

### 🔨 About the Project

[`Short-link manager`](https://github.com/miqel-dll/short-links-manager) is an application that provides a dashboard for managing a URL shortening system along with a backend to handle redirections. The system allows user registration, enabling users to create custom redirects to any service using memorable and user-friendly links.

Security is implemented using [`JSON Web Tokens (JWT)`](https://www.jwt.io). Each generated access key is valid for up to 15 minutes, after which the frontend application automatically handles key rotation and token refreshing in the background. The dashboard displays active redirects, click counts, and statistical charts for specific timeframes. It also provides full CRUD (Create, Read, Update, Delete) capabilities for link management.

Furthermore, users can manage their profiles. Both account registration and password changes require email verification codes. The system supports profile picture uploads with built-in cropping functionality. Files are stored in [`MinIO`](https://www.min.io), an open-source Amazon S3-compatible object storage solution.

---

### 📄 Documentation

All available functionalities and system behavior are described in the [`Swagger`](https://swagger.io/) documentation. It provides a user-friendly interface to explore and test API endpoints directly from the browser. You can check available routes, required parameters, and expected responses. The documentation is automatically generated and accessible at:

```http
GET http://localhost/api
```

Access to the application’s database is available via [`adminer`](https://www.adminer.org/pl/) at the address below, using the credentials specified in the [.env](./backend/.env.d.ts) file or in [docker-compose.yml](./docker-compose.yml)

```http
GET http://localhost/adminer
```

Access to the application interface, which allows you to manage the conversation through buttons and view it in real time, is available at the address below:

```http
GET http://localhost/panel
```

---

### 📄 Features

#### [**Backend**](./backend/)

* The backend handles all redirections.
* The backend logs every step, including each request and its handling duration, in the logs table.
* There's a database CRUD controller that identifies endpoints and responds with data based on what it finds.
* Verification is done using JSON Web Tokens (JWT).
 Two levels of authentication guards: one checks if you're signed in to manage personal settings, and the other checks if you're authorized to manage the system.
* Passwords are securely stored using salted hashing, with an abstraction function for comparison.
* Verification emails are sent with two validation options: clicking a link or entering a code.

#### [**Frontend**](./frontend/)

* Users can register, change their password, verify their account via email, or delete their account. There's an option to set or remove a profile picture. You can also modify your own permissions (if the "manage" setting is enabled for demo purposes).
* Logs can be displayed or filtered by date and status, and there's an option to download all logs as CSV or JSON.
* Logs are displayed with infinite scrolling.
* Routing is permission-based and secured: only admins can view logs and members or modify permissions.
* Users are protected from losing input data through a CanDeactivateGuard on every form or edit form.
* Users can view redirections, see the total number of clicks, and modify or delete them (if permitted). A panel for creating new redirections is visible only to users with the necessary permissions.
  
---

### 🚀 Getting Started

Follow these steps to get the project up and running locally:

#### 1. Clone the Repository

```bash
git clone https://github.com/miqel-dll/short-links-manager.git
```

#### 2. Environment Variable Configuration

The application as a demo **includes** default environmental settings for basic functionality. However, if you want anything else for any purpose, you can configure these everything in a [.env](./backend/.env.d.ts) file.

> ⚠ The demo version does not include SMTP server configuration. If these environment variables are not provided, the application will skip email verification during registration and password changes.

#### 3. Build Docker Container

Make sure [`Docker`](https://www.docker.com) is installed, then run:

```bash

# Application build with reverse-proxy (default)
docker compose --env-file ./backend/.env.demo -f docker/docker-compose.yml --profile prod up -d -V --build

# Application build if you're already using 80 and 443 ports
docker compose --env-file ./backend/.env.demo -f docker/docker-compose.yml --profile prod-native up -d -V --build

```

> This application includes a container running a reverse proxy, which requires **ports 80 and 443** to be available.  
> If you already have another service running on these ports, you can still access the containers directly in **prod-native** profile:
>
> * **API** → port `13000`,
> * **Panel** → port `14000`,
> * **Adminer** → port `18080`,
>

---

### 🛠️ Tech Stack

* [**NestJS**](https://nestjs.com/) – Node.js framework for scalable backend applications.
* [**Angular 20**](https://angular.dev) – Framework for building efficient application interfaces.
* [**TypeScript**](https://www.typescriptlang.org/) – Strongly-typed superset of JavaScript.
* [**PostgreSQL**](https://www.postgresql.org/) – Popular open-source relational database.
* [**TypeORM**](https://typeorm.io/) – Powerful ORM for database interactions in Node.js applications.
* [**Docker**](https://www.docker.com/) – Tool for containerizing applications and their dependencies.
* [**MinIO**](https://www.min.io/) – Open-source, Amazon S3-compatible tool for data storage.
* [**Redis**](https://www.min.io/) – Ultra-fast database for caching most common responses.

---

### 📌 License

This project is available under the MIT License. For more details, see the [LICENSE](LICENSE) file.
