# 🐙 GitHub Code Review Agent

🤖 An AI-powered code review bot that automatically 🔍 reviews pull requests using 🧠 GPT-4o-mini. This repo contains a 🟢 Node.js app that can run locally or be 🏗️ containerized using 🐳 Docker.

---

## 🚀 Prerequisites

- **🟢 Node.js** >= 22 or **🐳 Docker**

---

## 🐳 Setup for Running on Docker

1. **🚀 Run the compose in detached mode:**

   ```bash
   docker compose up --build -d
   ```

2. Thats it, everything should run.

3. To stop the running container
   ```bash
   docker compose down
   ```

---

## ⚙️ Setup for Running on 🟢 Node.js

1. **📦 Install dependencies:**

   ```bash
   npm install
   ```

2. **📂 Copy environment variables file & configure:**

   ```bash
   cp .env.example .env
   ```

3. **📝 Fill in your `.env` file:**

   ```env
   # 🎯 Port for server (defaults to 8080)
   PORT=8080

   # 🏗️ Node environment: `development` | `production`
   NODE_ENV='production'

   # 🔑 OpenAI API Key
   OPENAI_API_KEY=<key>

   # 🔑 GitHub Personal Access Token with repo scope
   GITHUB_TOKEN=<key>

   # 🔐 GitHub webhook secret verifier
   GITHUB_WEBHOOK_SECRET=<secret>
   ```

4. **🌐 For local testing, use ngrok**

---

## Filtering branches

1. Create a `config.json` in the root of the repo

```json
{
  "filter_branches": {
    "repo-a": ["org_name:branch_name1"],
    "repo-b": ["org_name:branch_name1", "org_name:branch_name2"]
  }
}
```

2. If there is no config.json available, then allows all branches

---

## 📜 Viewing Logs on Docker

To 📖 view logs for the running container:

```bash
   docker logs -f <container_id>
```

---

## 🧹 Cleaning Up

To 🗑️ remove the built Docker image:

```bash
   docker rmi git-pr-reviewer
```

---

## 🛠 Troubleshooting

If you encounter issues, try:

1. **🔍 Ensure Docker is running:**

   ```bash
   docker ps
   ```

2. **📖 Check logs:**

   ```bash
   docker logs <container_id>
   ```

3. **📡 Verify port availability:**
   ```bash
   netstat -tulnp | grep 8080
   ```

For further assistance, check the 📚 [Docker documentation](https://docs.docker.com/).
