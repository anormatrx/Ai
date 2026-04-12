# Plan: Activation of AI 3D Nexus (16 Modules)

## Research Summary
The project currently has a solid foundation with a custom Express server (`server.ts`) and several services (`DarkRoomAgent`, `MemoryService`, `GemmaService`, `PluginService`). However, many modules are either partially implemented or disconnected from the UI. The user wants a "production-ready" system where all 16 modules are functional and integrated through the "OpenClaw" orchestrator.

## Work Units

1. **Unit 1: OpenClaw Orchestrator & Router Enhancement**
   - **Files**: `server.ts`, `src/services/RouterService.ts`
   - **Description**: Update the central router to handle all 16 modules. Ensure that every user message passes through a decision phase before any action is taken.

2. **Unit 2: Local AI & Model Selection**
   - **Files**: `src/services/server/GemmaService.ts`, `server.ts`
   - **Description**: Finalize Ollama/Gemma integration. Implement logic to switch between Gemini (cloud) and Gemma (local) based on task type or user preference.

3. **Unit 3: Sandbox & Python Execution Environment**
   - **Files**: `src/services/DarkRoomAgent.ts`, `server.ts`
   - **Description**: Secure the Python execution environment. Ensure it can handle multi-line scripts and return structured output/errors.

4. **Unit 4: Terminal & Shell Command Execution**
   - **Files**: `server.ts`, `src/services/DarkRoomAgent.ts`
   - **Description**: Add a `/api/terminal` endpoint. Implement safe shell command execution (ls, pwd, cat, etc.) and return output to the UI.

5. **Unit 5: File Explorer & File System API**
   - **Files**: `server.ts`, `src/services/DarkRoomAgent.ts`
   - **Description**: Implement CRUD operations (Create, Read, Update, Delete) for files and folders via a new `/api/files` endpoint.

6. **Unit 6: Code Editor Integration**
   - **Files**: `src/components/lab/CodeEditor.tsx`, `server.ts`
   - **Description**: Connect the frontend code editor to the file system API and the Python sandbox.

7. **Unit 7: Skills Library & Plugin System**
   - **Files**: `src/services/server/PluginService.ts`, `server.ts`
   - **Description**: Expand the plugin system to include a "Skills Library" where each skill is a predefined, executable function (e.g., "calculate", "format-json").

8. **Unit 8: Agent System (Architect & Runner)**
   - **Files**: `server.ts`, `src/services/DarkRoomAgent.ts`
   - **Description**: Enhance the Agent Architect to not just design but also "deploy" agents that can run in the background.

9. **Unit 9: Memory Vault & Long-term Context**
   - **Files**: `src/services/server/MemoryService.ts`, `server.ts`
   - **Description**: Implement a robust conversation history system that persists across sessions and provides context to the AI.

10. **Unit 10: Web Automation & Scraping Service**
    - **Files**: `server.ts`, `src/services/server/WebAutomationService.ts` (to be created)
    - **Description**: Create a service for making HTTP requests, fetching page content, and basic scraping.

11. **Unit 11: GitHub Integration (Sync & Center)**
    - **Files**: `server.ts`, `src/services/server/GitHubService.ts` (to be created)
    - **Description**: Implement basic git operations (status, add, commit, push, pull) via the UI.

12. **Unit 12: Diagnostics, Health & Launch Platform**
    - **Files**: `server.ts`, `src/components/dashboard/LaunchPlatform.tsx`, `src/components/ThreeScene.tsx`
    - **Description**: Implement a system-wide health check API. Connect the Launch Platform UI to these checks and update the 3D scene based on system status.

## E2E Test Recipe
1. **Backend Verification**: Use `curl` to test each new API endpoint (`/api/chat`, `/api/terminal`, `/api/files`, `/api/agent/execute`).
2. **Frontend Verification**: Open the app in the browser, interact with the Chat, Terminal, and File Explorer. Verify that changes in the UI are reflected in the file system and system state.
3. **Integration Check**: Ask OpenClaw to "Build a python script that lists files", then "Run it", then "Save it to a new file". Verify the entire flow works.

## Worker Instructions
Each worker will:
1. Read the relevant files for their unit.
2. Implement the required logic/API/UI changes.
3. Verify the changes using the E2E test recipe (specifically the parts relevant to their unit).
4. Ensure no breaking changes are introduced to other modules.
