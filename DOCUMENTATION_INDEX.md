# Beyond the Fort — Documentation Index

**Project:** Time-Aware Digital Discoverability: Beyond the Fort, Gwalior  
**Workspace:** `Time-Aware-Digital-Discoverability-Beyond-the-Fort`  
**Last Updated:** 2026-10-30  

This index catalogs all architectural, security, testing, and operational documentation across the repository.

---

## Master System Readiness & Resolution Deliverables (October 30, 2026)

| Document | Purpose |
| :--- | :--- |
| [FINAL_SYSTEM_READINESS_REPORT.md](FINAL_SYSTEM_READINESS_REPORT.md) | **Master Production Sign-Off Report** certifying full system readiness, 82/82 passing tests, and multi-service health. |
| [AI_CHATBOT_ROOT_CAUSE_REPORT.md](AI_CHATBOT_ROOT_CAUSE_REPORT.md) | **Chatbot Root Cause Analysis & Resolution**: documents the 429 quota failure, multi-model cascade, and 100% uptime curated fallback. |
| [AI_AGENT_EXECUTION_REPORT.md](AI_AGENT_EXECUTION_REPORT.md) | **Multi-Agent Execution & Pipeline Verification**: documents the 6 LangGraph agents, Node-to-Python bridge, and live execution traces. |
| [SERVICE_STARTUP_GUIDE.md](SERVICE_STARTUP_GUIDE.md) | **Runtime Operations Guide**: instructions for unified single-command (
pm run start:all) and separate terminal service startups. |
| [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md) | **Production Deployment Checklist**: comprehensive verification of security, environment variables, PM2, and Nginx configurations. |

---

## 1. Security & Compliance (Master Deliverables)

| Document | Purpose |
| :--- | :--- |
| [PROJECT_SECURITY_BASELINE.md](PROJECT_SECURITY_BASELINE.md) | Complete technology stack audit, component classification (`VERIFIED`, `PARTIALLY IMPLEMENTED`), and baseline findings. |
| [SECURITY.md](SECURITY.md) | Project security policy, vulnerability reporting protocols, and active defense summary. |
| [SECURITY_AUDIT.md](SECURITY_AUDIT.md) | Vulnerability tracking register (SEC-01 through SEC-16), severity ratings, and remediation status. |
| [API_SECURITY.md](API_SECURITY.md) | REST API endpoints, HTTP security headers, CORS allowlist, CSRF tokens, rate limits, and IDOR defenses. |
| [AUTHENTICATION.md](AUTHENTICATION.md) | Scrypt password hashing, session tokens, cookie hardening, 5-strike brute-force lockout, and admin bootstrapping. |
| [AUTHORIZATION.md](AUTHORIZATION.md) | Role-Based Access Control (RBAC) matrix for Guest, User, Administrator, and BOLA/IDOR prevention. |
| [AI_AGENT_SECURITY.md](AI_AGENT_SECURITY.md) | LangGraph multi-agent security, prompt injection mitigations, Gemini boundary rules, and execution constraints. |
| [DATABASE_SECURITY.md](DATABASE_SECURITY.md) | Storage architecture, atomic private JSON operations, 0o600 file modes, and MongoDB status clarification. |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Secure production deployment checklist, HTTPS, reverse proxy trust hops, and service tokens. |
| [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) | Environment variables guide, `.env.example` mapping, and credential protection rules. |
| [PRIVACY_POLICY.md](PRIVACY_POLICY.md) | Implementation summary of user data, session longevity, location handling, and 365-day retention. |
| [FINAL_SECURITY_AND_AUTH_REPORT.md](FINAL_SECURITY_AND_AUTH_REPORT.md) | Comprehensive executive report on inspection findings, implemented fixes, test results, and remaining risks. |

---

## 2. Architecture & API Specifications

| Document | Purpose |
| :--- | :--- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | High-level system architecture, Express + LangGraph dual-runtime design, and data flows. |
| [API_SPEC.md](API_SPEC.md) | Detailed REST API specifications for all Express routes and request/response payloads. |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Comprehensive API developer guide and curl usage examples. |
| [FEASIBILITY_MATH.md](FEASIBILITY_MATH.md) | Mathematical formulation of the time-space feasibility inequality and 25% mandatory safety buffer. |
| [TOURISM_WORKFLOW.md](TOURISM_WORKFLOW.md) | Detailed walkthrough of the 6-stage LangGraph planner execution pipeline. |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | Secondary reference for Express REST and Python endpoints. |
| [docs/CHATBOT_ARCHITECTURE.md](docs/CHATBOT_ARCHITECTURE.md) | Tansen AI chat architecture and session management. |
| [docs/CHATBOT_API.md](docs/CHATBOT_API.md) | Chatbot REST API endpoint specification. |
| [docs/LOCATION_AND_ROUTE_PLANNING.md](docs/LOCATION_AND_ROUTE_PLANNING.md) | Geographic coordinate modeling, dispersal corridors (3–8 km), and Mapbox routing. |

---

## 3. Operational & User Guides

| Document | Purpose |
| :--- | :--- |
| [README.md](README.md) | Project introduction, quickstart instructions, and hackathon overview. |
| [USER_GUIDE.md](USER_GUIDE.md) | End-user manual for discovering Gwalior heritage, using Tansen AI, and saving itineraries. |
| [ADMIN_GUIDE.md](ADMIN_GUIDE.md) | Administrator manual for role assignment and system maintenance. |
| [BACKUP_AND_RECOVERY.md](BACKUP_AND_RECOVERY.md) | Operational guidelines for backing up and restoring private user and itinerary data. |
| [CHANGELOG.md](CHANGELOG.md) | Historical record of features, security enhancements, and codebase updates. |
| [NAVBAR_I18N_IMPLEMENTATION.md](NAVBAR_I18N_IMPLEMENTATION.md) | Implementation report for the 21-language localization subsystem. |
| [docs/CONFIGURATION_GUIDE.md](docs/CONFIGURATION_GUIDE.md) | Operational environment configuration details. |
| [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | In-depth deployment step-by-step documentation. |

---

## 4. Testing & Verification

| Document | Purpose |
| :--- | :--- |
| [TESTING.md](TESTING.md) | Master testing guide, test commands, and test suite breakdown. |
| [ACCEPTANCE_TESTS.md](ACCEPTANCE_TESTS.md) | Team Venator acceptance criteria and verification report. |
| [AGENT_TEST_REPORT.md](AGENT_TEST_REPORT.md) | Multiagent engine test logs and execution benchmarks. |
| [AGENT_TEST_RESULTS.md](AGENT_TEST_RESULTS.md) | Individual agent test assertions and results. |
| [docs/TESTING_AND_REPAIR_LOG.md](docs/TESTING_AND_REPAIR_LOG.md) | Historical repair log and bug fixes. |
| [docs/CHATBOT_TEST_REPORT.md](docs/CHATBOT_TEST_REPORT.md) | Chatbot regression test outcomes. |

---

## 5. Datasets, Archives & Memory

| Document | Purpose |
| :--- | :--- |
| [DATASET_EXPLORATION.md](DATASET_EXPLORATION.md) | Analysis of the curated Gwalior cultural and artisan POI dataset. |
| [data/IMAGE_ATTRIBUTION.md](data/IMAGE_ATTRIBUTION.md) | Creative Commons licensing and image attributions for POI media. |
| [data/BEYOND_THE_FORT_DATASET_NOTES.md](data/BEYOND_THE_FORT_DATASET_NOTES.md) | Provenance documentation for curated and supplemental datasets. |
| [ARCHIVE_MANIFEST.md](ARCHIVE_MANIFEST.md) | File archive status and safety guarantee manifest. |
| [archive/README.md](archive/README.md) | Explanation of archived legacy artifacts. |
| [archive/removed-items/MANIFEST.md](archive/removed-items/MANIFEST.md) | Inventory of safely archived legacy scripts and assets. |

