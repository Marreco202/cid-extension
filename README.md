# CID - Companion In Development

An open source AI-powered copilot for understanding and visualizing code repositories directly in VS Code.

## Features

CID is an AI assistant extension that helps developers understand, analyze, and visualize their codebase with multiple AI model support.

### 🤖 Multi-Model AI Support

- **GPT (OpenAI)**: Use OpenAI's GPT models for code analysis
- **Gemini (Google)**: Leverage Google's Gemini Pro models
- **Ollama**: Run local models for privacy-focused development

### 💬 Interactive Chat Interface

Access an AI chat assistant directly in VS Code to:
- Get code explanations
- Receive suggestions and guidance
- Stream responses in real-time
>it is basically an LLM Chat window on VSCode, nothing special.

**Command**: `CID: Open Chat`

### 📊 Mermaid Diagram Generation

Automatically generate visual diagrams of your project structure:
- Analyze repository architecture
- Create flowcharts and dependency diagrams
- Render diagrams with interactive pan and zoom

**Commands**: 
- `CID: Generate and Show Mermaid for Project`
- `CID: Render Mermaid File on Webview`

### 🔍 Code Analysis Tools

#### Current File Analysis
- **Command**: `CID: Explain Current File`
- Get AI-powered explanations of the active file

#### Python Function Analysis
- **Command**: `CID: List all functions on project`
- Scan all Python files in your workspace
- Extract function names, parameters, return types, and docstrings
- Display results in an organized output channel

#### Workspace File Listing
- **Command**: `CID: List Workspace Files`
- View all TypeScript files in your project

### 🎨 Custom Sidebar View

Access CID features through a dedicated sidebar panel in the Activity Bar:
- Quick access to the chat interface
- Functions tree view
- Easy navigation to all CID commands

## Requirements

### API Keys (Optional, based on model choice)

Depending on which AI model you want to use, you'll need:

- **OpenAI GPT**: OpenAI API key
- **Google Gemini**: Google AI API key
- **Ollama**: Local Ollama installation (no API key needed)

### Dependencies

The extension automatically includes:
- `openai` - OpenAI SDK
- `@google/genai` - Google Generative AI SDK
- `ollama` - Ollama JavaScript library
- `mermaid` - Diagram rendering
- `dotenv` - Environment variable management

## Installation

1. Install the extension from the VS Code Marketplace (when published)
2. Or run from source:
   ```bash
   npm install
   npm run compile
   ```
3. Configure your preferred AI model in the extension settings
4. Add your API keys to a `.env` file (if using cloud models)

## Usage

### Opening the Chat

1. Click the CID icon in the Activity Bar
2. Click the chat icon in the Functions View header, or
3. Run the command: `CID: Open Chat`

### Generating Project Diagrams

1. Open your project in VS Code
2. Run: `CID: Generate and Show Mermaid for Project`
3. View the interactive diagram in a new panel

### Analyzing Python Code

1. Open a workspace with Python files
2. Run: `CID: List all functions on project`
3. Check the "CID: Python functions" output channel for results

## Available Commands

| Command | Description |
|---------|-------------|
| `CID: Open Chat` | Launch the interactive AI chat interface |
| `CID: Explain Current File` | Get an AI explanation of the active file |
| `CID: List all functions on project` | Analyze all Python functions in workspace |
| `CID: List Workspace Files` | Display all TypeScript files |
| `CID: Generate and Show Mermaid for Project` | Create and display project diagram |
| `CID: Render Mermaid File on Webview` | Preview an open Mermaid file |
| `CID: Test Gemini Connection` | Verify Gemini API connectivity |
| `CID: Find and Console Log README.md` | Debug utility for README detection |

## Extension Settings

This extension is currently in early development. Configuration settings will be added in future releases for:

- AI model selection
- API endpoints
- Custom prompts
- Output preferences

## Known Issues

- The extension is in active development (v0.0.1)
- Some commands are experimental and may require additional configuration
- Python analysis feature is optimized for Python files only

## Architecture

### Services
- `GPTService.ts` - OpenAI GPT integration
- `GeminiService.mts` - Google Gemini integration
- `OllamaService.ts` - Local Ollama model support
- `RepositoryService.ts` - Workspace file analysis

### Providers
- `ChatViewProvider.ts` - Chat interface management
- `MermaidViewProvider.ts` - Diagram rendering
- `ModelProvider.ts` - AI model factory
- `RepoDataProvider.ts` - Repository data collection
- `FunctionsTreeDataProvider.ts` - Sidebar tree view

## Release Notes

### 0.0.1

Initial development release:
- Multi-model AI support (GPT, Gemini, Ollama)
- Interactive chat interface with streaming responses
- Mermaid diagram generation
- Python function analysis
- Custom sidebar integration

## Contributing

This is an open source project. Contributions are welcome!

## License

[Add your license here]

**Enjoy using CID!**
