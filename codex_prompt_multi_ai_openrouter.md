# Codex Prompt: Build Multi-AI App with OpenRouter

Generate a complete, production-ready Python application that queries 6 AI models simultaneously (ChatGPT, Claude, Perplexity, DeepSeek, Gemini, and Qwen) using OpenRouter API, compares their responses, and includes a "Boss Mode" that synthesizes all answers.

---

## MODELS TO INTEGRATE

Via OpenRouter API (all models accessed through single endpoint):

1. **ChatGPT (GPT-4o)** - `openai/gpt-4o` - $2.50/$10.00 per 1M tokens (in/out)
2. **Claude Sonnet 4.5** - `anthropic/claude-sonnet-4.5` - $3.00/$15.00 per 1M tokens
3. **Gemini 2.0 Flash** - `google/gemini-2.0-flash-001` - $0.10/$0.40 per 1M tokens
4. **Perplexity Sonar** - `perplexity/sonar` - $1.00/$1.00 per 1M tokens
5. **DeepSeek Chat** - `deepseek/deepseek-chat` - $0.14/$0.28 per 1M tokens
6. **Qwen 2.5 72B** - `qwen/qwen-2.5-72b-instruct` - $0.35/$0.40 per 1M tokens

---

## CORE REQUIREMENTS

### 1. OpenRouter API Integration
- **Base URL:** `https://openrouter.ai/api/v1/chat/completions`
- **Authentication:** Bearer token in Authorization header
- **Single API key** for all models: `OPENROUTER_API_KEY`
- **Parallel queries** using asyncio and aiohttp
- **Error handling** for rate limits, timeouts, and API errors

### 2. Boss Mode
- After getting all 6 responses, use GPT-4o to synthesize them
- Boss prompt: "You are the BOSS reviewing 6 AI responses. Create ONE authoritative answer by identifying consensus, highlighting unique insights, resolving contradictions, and adding your expertise."
- Make Boss Mode optional via `--boss` CLI flag

### 3. Performance Metrics
Track for each model:
- Response time (seconds)
- Token usage (input/output/total)
- Estimated cost (USD)
- Response length (words/chars)
- Speed ranking (fastest to slowest)
- Cost efficiency ranking

### 4. Output Formats
- **Terminal:** Rich formatted output with colors, tables, progress bars
- **Markdown:** Full report saved to .md file
- **JSON:** Structured data for API integration
- **Comparison mode:** Side-by-side view

---

## CODE STRUCTURE TO GENERATE

```
multi-ai-openrouter/
├── multi_ai.py                 # Main CLI application (GENERATE THIS)
├── openrouter_client.py        # OpenRouter API wrapper (GENERATE THIS)
├── boss_mode.py                # Synthesis logic (GENERATE THIS)
├── formatters.py               # Output formatting (GENERATE THIS)
├── config.py                   # Model configs & pricing (GENERATE THIS)
├── requirements.txt            # Dependencies (GENERATE THIS)
├── .env.example                # Environment template (GENERATE THIS)
└── README.md                   # Usage docs (GENERATE THIS)
```

---

## FILE 1: config.py

```python
"""Configuration for Multi-AI OpenRouter App"""

MODELS = {
    "gpt-4o": {
        "id": "openai/gpt-4o",
        "name": "ChatGPT (GPT-4o)",
        "provider": "OpenAI",
        "input_price": 2.50,   # per 1M tokens
        "output_price": 10.00,
        "emoji": "🤖"
    },
    "claude": {
        "id": "anthropic/claude-sonnet-4.5",
        "name": "Claude Sonnet 4.5",
        "provider": "Anthropic",
        "input_price": 3.00,
        "output_price": 15.00,
        "emoji": "🎭"
    },
    "gemini": {
        "id": "google/gemini-2.0-flash-001",
        "name": "Gemini 2.0 Flash",
        "provider": "Google",
        "input_price": 0.10,
        "output_price": 0.40,
        "emoji": "💎"
    },
    "perplexity": {
        "id": "perplexity/sonar",
        "name": "Perplexity Sonar",
        "provider": "Perplexity",
        "input_price": 1.00,
        "output_price": 1.00,
        "emoji": "🔍"
    },
    "deepseek": {
        "id": "deepseek/deepseek-chat",
        "name": "DeepSeek Chat",
        "provider": "DeepSeek",
        "input_price": 0.14,
        "output_price": 0.28,
        "emoji": "🌊"
    },
    "qwen": {
        "id": "qwen/qwen-2.5-72b-instruct",
        "name": "Qwen 2.5 72B",
        "provider": "Alibaba",
        "input_price": 0.35,
        "output_price": 0.40,
        "emoji": "🐉"
    }
}

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

DEFAULT_PARAMS = {
    "temperature": 0.7,
    "max_tokens": 2048,
    "top_p": 0.9
}

TIMEOUT = 60  # seconds
MAX_RETRIES = 3
```

---

## FILE 2: openrouter_client.py

Generate complete code with:

### Required Functions:

```python
import aiohttp
import asyncio
import time
from typing import Dict, List, Optional

async def query_model(
    model_id: str,
    prompt: str,
    api_key: str,
    params: Optional[Dict] = None
) -> Dict:
    """
    Query a single model via OpenRouter API

    Args:
        model_id: OpenRouter model ID (e.g., "openai/gpt-4o")
        prompt: User question/prompt
        api_key: OpenRouter API key
        params: Optional params (temperature, max_tokens, etc.)

    Returns:
        {
            "model": str,
            "response": str,
            "status": "success" | "error",
            "time": float (seconds),
            "tokens": {
                "input": int,
                "output": int,
                "total": int
            },
            "cost": float (USD),
            "error": Optional[str]
        }
    """
    # Implementation:
    # - Make POST request to OPENROUTER_BASE_URL
    # - Headers: Authorization, HTTP-Referer, X-Title
    # - Body: model, messages, temperature, max_tokens
    # - Track start/end time
    # - Parse response and calculate cost
    # - Handle errors with try/except
    pass

async def query_all_models(
    prompt: str,
    api_key: str,
    models: Optional[List[str]] = None,
    params: Optional[Dict] = None
) -> List[Dict]:
    """
    Query all selected models in parallel

    Args:
        prompt: User question
        api_key: OpenRouter API key
        models: List of model keys (default: all 6 models)
        params: Optional parameters

    Returns:
        List of result dictionaries from each model
    """
    # Implementation:
    # - Use asyncio.gather() to run queries in parallel
    # - Handle individual model failures
    # - Return all results (both success and error)
    pass

def calculate_cost(input_tokens: int, output_tokens: int, model_key: str) -> float:
    """
    Calculate cost for a model query

    Args:
        input_tokens: Number of input tokens
        output_tokens: Number of output tokens
        model_key: Model key from MODELS config

    Returns:
        Cost in USD
    """
    # Formula: (input_tokens * input_price + output_tokens * output_price) / 1_000_000
    pass
```

### Required Features:
- Async/await for parallel execution
- Proper error handling (rate limits, timeouts, network errors)
- Exponential backoff for retries
- Token counting and cost calculation
- Response time tracking
- Clean, typed code with docstrings

---

## FILE 3: boss_mode.py

Generate complete code with:

```python
import aiohttp
from typing import List, Dict

async def synthesize_responses(
    results: List[Dict],
    original_prompt: str,
    api_key: str
) -> Dict:
    """
    Boss Mode: Use GPT-4o to synthesize all responses into one authoritative answer

    Args:
        results: List of response dicts from all models
        original_prompt: The original user question
        api_key: OpenRouter API key

    Returns:
        {
            "boss_answer": str,
            "time": float,
            "cost": float,
            "status": "success" | "error"
        }
    """
    # Implementation:
    # - Filter successful results
    # - Build synthesis prompt with all responses
    # - Query GPT-4o with synthesis prompt
    # - Return synthesized answer
    pass

def build_synthesis_prompt(results: List[Dict], original_prompt: str) -> str:
    """
    Build the Boss synthesis prompt

    Args:
        results: List of successful model responses
        original_prompt: Original user question

    Returns:
        Formatted prompt for Boss synthesis
    """
    # Prompt structure:
    # 1. Explain Boss role
    # 2. Show original question
    # 3. List all model responses
    # 4. Give synthesis instructions
    pass
```

---

## FILE 4: formatters.py

Generate complete code with:

```python
from typing import List, Dict, Optional
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.markdown import Markdown
import json

def format_terminal_output(
    results: List[Dict],
    boss_answer: Optional[Dict] = None,
    original_prompt: str = ""
) -> None:
    """
    Display results in terminal with Rich formatting

    Features:
    - Show Boss answer in panel (if enabled)
    - Display each model's response in collapsible sections
    - Show performance metrics table
    - Display rankings (speed, cost, length)
    - Use emojis and colors
    """
    pass

def format_markdown_output(
    results: List[Dict],
    boss_answer: Optional[Dict] = None,
    original_prompt: str = ""
) -> str:
    """
    Generate markdown report

    Structure:
    # Multi-AI Search Results

    **Query:** {prompt}
    **Models:** {list}
    **Date:** {timestamp}

    ## 👔 Boss Final Answer (if enabled)

    ## Individual Responses

    ### 1. {Model Name} ({time}s, ${cost})
    {response}

    ## 📊 Performance Metrics

    | Model | Time | Cost | Words | Tokens |
    ...
    """
    pass

def format_json_output(
    results: List[Dict],
    boss_answer: Optional[Dict] = None,
    original_prompt: str = ""
) -> str:
    """
    Generate JSON output for API integration

    Structure:
    {
        "query": str,
        "timestamp": str,
        "boss_mode": bool,
        "boss_answer": {...},
        "models": [
            {
                "model": str,
                "response": str,
                "metrics": {...}
            }
        ],
        "analytics": {
            "total_cost": float,
            "total_time": float,
            "fastest_model": str,
            "cheapest_model": str
        }
    }
    """
    pass

def format_comparison_view(results: List[Dict]) -> None:
    """
    Display side-by-side comparison of model responses
    Use Rich columns to show responses in parallel
    """
    pass

def generate_analytics(results: List[Dict]) -> Dict:
    """
    Calculate performance analytics

    Returns:
        {
            "total_cost": float,
            "total_time": float,
            "avg_time": float,
            "success_rate": float,
            "speed_ranking": [(model, time), ...],
            "cost_ranking": [(model, cost), ...],
            "length_ranking": [(model, words), ...],
            "fastest_model": str,
            "cheapest_model": str,
            "most_detailed": str
        }
    """
    pass
```

---

## FILE 5: multi_ai.py (Main CLI App)

Generate complete code with:

```python
#!/usr/bin/env python3
"""
Multi-AI Search - Query 6 AI models simultaneously via OpenRouter
"""

import argparse
import asyncio
import os
from dotenv import load_dotenv
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

# Imports from our modules
from config import MODELS, DEFAULT_PARAMS
from openrouter_client import query_all_models
from boss_mode import synthesize_responses
from formatters import (
    format_terminal_output,
    format_markdown_output,
    format_json_output,
    format_comparison_view
)

console = Console()

def parse_args():
    """
    Parse command line arguments

    Support:
    - positional prompt argument
    - --boss flag for Boss Mode
    - --models to select specific models
    - --output for file output
    - --format (terminal/markdown/json/compare)
    - --temperature, --max-tokens
    - --interactive for conversation mode
    """
    pass

async def main():
    """
    Main application flow:

    1. Load environment variables (.env file)
    2. Parse CLI arguments
    3. Validate OpenRouter API key
    4. Show query info (prompt, models, boss mode status)
    5. Query all models in parallel (with progress indicator)
    6. If Boss Mode: synthesize responses
    7. Format and display/save output
    8. Show analytics summary
    """

    # Example flow:
    # - load_dotenv()
    # - args = parse_args()
    # - api_key = get_api_key()
    # - show_query_info()
    # - with Progress(...) as progress:
    #     results = await query_all_models(...)
    # - if args.boss:
    #     boss_answer = await synthesize_responses(...)
    # - format_output(...)
    pass

def get_api_key() -> str:
    """
    Get OpenRouter API key from env or prompt user
    Show setup instructions if missing
    """
    pass

def show_setup_instructions():
    """
    Display helpful setup instructions if API key is missing
    """
    print("""
    ❌ OpenRouter API key not found!

    Get your API key:
    1. Visit: https://openrouter.ai/keys
    2. Sign up and create API key
    3. Add $10-20 in credits

    Setup:
    export OPENROUTER_API_KEY='sk-or-v1-xxxxx'

    Or create .env file:
    OPENROUTER_API_KEY=sk-or-v1-xxxxx
    """)

if __name__ == "__main__":
    asyncio.run(main())
```

### CLI Interface Requirements:

```bash
# Basic usage
python multi_ai.py "What is quantum computing?"

# Boss Mode enabled
python multi_ai.py "Explain blockchain technology" --boss

# Select specific models
python multi_ai.py "Best Python frameworks 2025" --models gpt-4o claude gemini

# Save to file
python multi_ai.py "Future of AI" --output report.md --format markdown

# JSON output
python multi_ai.py "Climate change solutions" --format json --output data.json

# Comparison view
python multi_ai.py "Write a haiku about technology" --format compare

# Custom parameters
python multi_ai.py "Explain recursion" --temperature 0.9 --max-tokens 1000

# Interactive mode (bonus)
python multi_ai.py --interactive
```

---

## FILE 6: requirements.txt

```txt
aiohttp>=3.9.0
python-dotenv>=1.0.0
rich>=13.7.0
asyncio>=3.4.3
pydantic>=2.5.0
```

---

## FILE 7: .env.example

```bash
# OpenRouter API Key (Required)
# Get it from: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx

# Optional: Your site info for OpenRouter analytics
OPENROUTER_SITE_URL=https://yourdomain.com
OPENROUTER_SITE_NAME=Multi-AI Search App

# Default Settings
DEFAULT_TEMPERATURE=0.7
DEFAULT_MAX_TOKENS=2048
ENABLE_BOSS_MODE=false
```

---

## FILE 8: README.md

Generate comprehensive documentation with:

### Sections to Include:
1. **Project Overview** - What it does, why it's useful
2. **Features** - Key features list with emojis
3. **Installation** - pip install, setup steps
4. **Quick Start** - 3-5 basic examples
5. **Configuration** - API key setup, .env file
6. **Usage** - All CLI options explained
7. **Output Formats** - Examples of each format
8. **Model Comparison** - Table of 6 models with pricing
9. **Cost Estimates** - Example costs per query
10. **Troubleshooting** - Common errors and solutions
11. **Advanced Usage** - Tips and tricks
12. **Contributing** - How to add new models
13. **License** - MIT

---

## ERROR HANDLING REQUIREMENTS

Handle these scenarios with clear messages:

### 1. Missing API Key
```
❌ OpenRouter API key not found!

Get your API key at: https://openrouter.ai/keys
Then: export OPENROUTER_API_KEY='sk-or-v1-xxxxx'
```

### 2. Rate Limiting
```
⚠️  Rate limited by OpenRouter
Retrying in 30 seconds... (attempt 2/3)
Tip: Add more credits at https://openrouter.ai/credits
```

### 3. Timeout
```
⏱️  Request timeout for {model_name}
Continuing with other models...
```

### 4. Invalid Model
```
❌ Model "{model}" not found
Available: gpt-4o, claude, gemini, perplexity, deepseek, qwen
```

### 5. Network Error
```
🌐 Network error - check your internet connection
Retrying... (attempt 1/3)
```

---

## CODE QUALITY REQUIREMENTS

### Must Include:
- ✅ **Type hints** on all functions
- ✅ **Docstrings** (Google style) for all functions/classes
- ✅ **Error handling** with try/except blocks
- ✅ **Logging** for debugging (use logging module)
- ✅ **Input validation** for user inputs
- ✅ **PEP 8** compliant formatting
- ✅ **Comments** for complex logic
- ✅ **Async/await** for performance
- ✅ **Progress indicators** for long operations
- ✅ **Helpful error messages** for users

### Code Style:
```python
# Good example:
async def query_model(
    model_id: str,
    prompt: str,
    api_key: str,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Query a single AI model via OpenRouter API.

    Args:
        model_id: OpenRouter model identifier (e.g., "openai/gpt-4o")
        prompt: User's question or prompt text
        api_key: OpenRouter API authentication key
        params: Optional parameters for model configuration

    Returns:
        Dictionary containing model response, metrics, and status

    Raises:
        aiohttp.ClientError: If network request fails
        ValueError: If model_id is invalid
    """
    # Implementation here...
```

---

## TESTING REQUIREMENTS

Include test examples in README:

```python
# Test 1: Basic query
python multi_ai.py "What is 2+2?"

# Expected: All 6 models return "4" or similar

# Test 2: Boss Mode
python multi_ai.py "Explain AI" --boss

# Expected: Boss synthesis combines all responses

# Test 3: Model selection
python multi_ai.py "Hello" --models gemini deepseek

# Expected: Only Gemini and DeepSeek respond

# Test 4: JSON output
python multi_ai.py "Test" --format json

# Expected: Valid JSON structure

# Test 5: Error handling (invalid key)
OPENROUTER_API_KEY=invalid python multi_ai.py "Test"

# Expected: Clear error message with setup instructions
```

---

## PERFORMANCE REQUIREMENTS

- ⚡ **Parallel execution** - All 6 models queried simultaneously (not sequential)
- ⚡ **Total time** < 10 seconds for all models (limited by slowest model)
- ⚡ **Memory efficient** - Use async streaming where possible
- ⚡ **Progress indicators** - Show real-time progress while querying
- ⚡ **Graceful degradation** - Continue if some models fail

---

## UI/UX REQUIREMENTS

### Terminal Output Example:

```
╭──────────────────────────────────────────────────────╮
│         🔍 Multi-AI Search via OpenRouter           │
╰──────────────────────────────────────────────────────╯

Query: "What is quantum computing?"
Models: 6 (GPT-4o, Claude, Gemini, Perplexity, DeepSeek, Qwen)
Boss Mode: ✅ Enabled

⚡ Querying models in parallel...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 6/6

╭────────────────────────────────────────────────────╮
│              👔 BOSS FINAL ANSWER                  │
╰────────────────────────────────────────────────────╯

[Synthesized comprehensive answer here...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Performance Metrics

┏━━━━━━━━━━━━━━━━━┳━━━━━━━┳━━━━━━━━━━┳━━━━━━━┓
┃ Model           ┃ Time  ┃ Cost     ┃ Words ┃
┡━━━━━━━━━━━━━━━━━╇━━━━━━━╇━━━━━━━━━━╇━━━━━━━┩
│ 💎 Gemini      │ 1.2s  │ $0.0003  │ 342   │
│ 🌊 DeepSeek    │ 1.5s  │ $0.0002  │ 289   │
│ 🐉 Qwen        │ 1.8s  │ $0.0004  │ 315   │
│ 🔍 Perplexity  │ 2.1s  │ $0.0018  │ 387   │
│ 🤖 GPT-4o      │ 2.4s  │ $0.0078  │ 456   │
│ 🎭 Claude      │ 3.2s  │ $0.0116  │ 512   │
└─────────────────┴───────┴──────────┴───────┘

⚡ Fastest: Gemini (1.2s)
💰 Cheapest: DeepSeek ($0.0002)
📝 Most Detailed: Claude (512 words)

Total Cost: $0.0221 (2.2¢)
Total Time: 3.2s (parallel)
Success Rate: 100% (6/6)
```

---

## SPECIAL INSTRUCTIONS FOR QWEN MODEL

**Qwen Details:**
- Full model ID: `qwen/qwen-2.5-72b-instruct`
- Provider: Alibaba Cloud
- Strong at: Multilingual tasks, Chinese language, coding
- Context window: 32K tokens
- Pricing: $0.35 input, $0.40 output per 1M tokens

**Integration notes:**
- Same API format as other models
- No special headers needed
- Supports all standard OpenAI parameters
- May have different rate limits than other providers

---

## OUTPUT FORMAT

Generate these 8 files as complete, runnable code:

1. ✅ `config.py` - Model definitions and settings
2. ✅ `openrouter_client.py` - API client with async queries
3. ✅ `boss_mode.py` - Synthesis logic
4. ✅ `formatters.py` - Output formatting (terminal, markdown, JSON)
5. ✅ `multi_ai.py` - Main CLI application
6. ✅ `requirements.txt` - Dependencies
7. ✅ `env.example` - Environment template
8. ✅ `README.md` - Complete documentation

Each file should be:
- **Complete** - Ready to run without modifications
- **Production-ready** - Proper error handling, logging, validation
- **Well-documented** - Docstrings, comments, type hints
- **PEP 8 compliant** - Proper formatting
- **Tested** - Handle edge cases

---

## FINAL CHECKLIST

Before generating code, ensure:

- [ ] All 6 models configured (GPT-4o, Claude, Gemini, Perplexity, DeepSeek, Qwen)
- [ ] Async/await for parallel queries
- [ ] Boss Mode synthesis with GPT-4o
- [ ] Cost calculation for all models
- [ ] Performance metrics tracking
- [ ] 4 output formats (terminal, markdown, JSON, compare)
- [ ] Rich terminal UI with colors and progress
- [ ] Comprehensive error handling
- [ ] CLI with all specified options
- [ ] Complete README with examples
- [ ] .env.example with all variables
- [ ] Type hints on all functions
- [ ] Docstrings for all functions
- [ ] PEP 8 compliant code

---

## START GENERATING CODE NOW

Generate all 8 files with complete, production-ready code. Start with `config.py` and work through each file systematically. Make sure all imports are correct and all functions are fully implemented.

Begin!
