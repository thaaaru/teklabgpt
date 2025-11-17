#!/usr/bin/env python3
"""
Multi-AI Search Tool
Queries ChatGPT, Claude, Gemini, and Perplexity simultaneously, verifies consensus,
and synthesizes responses via Boss Mode.
"""

import argparse
import os
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Optional, Tuple


def mask_api_key(api_key: str) -> str:
    """Mask API key for display, showing only first 8 and last 4 characters"""
    if not api_key or len(api_key) < 12:
        return "****"
    return f"{api_key[:8]}...{api_key[-4:]}"


def query_openai(prompt: str, api_key: str) -> Dict:
    """Query OpenAI ChatGPT API"""
    start_time = time.time()
    try:
        import openai

        client = openai.OpenAI(api_key=api_key)

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        elapsed = time.time() - start_time
        response_text = response.choices[0].message.content

        return {
            "model": "ChatGPT (GPT-4o)",
            "response": response_text,
            "status": "success",
            "time": elapsed,
            "words": len(response_text.split()),
            "chars": len(response_text),
        }
    except Exception as e:  # pylint: disable=broad-except
        elapsed = time.time() - start_time
        return {
            "model": "ChatGPT",
            "response": None,
            "status": "error",
            "error": str(e),
            "time": elapsed,
        }


def query_anthropic(prompt: str, api_key: str) -> Dict:
    """Query Anthropic Claude API"""
    start_time = time.time()
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )

        elapsed = time.time() - start_time
        response_text = response.content[0].text

        return {
            "model": "Claude (Sonnet 4.5)",
            "response": response_text,
            "status": "success",
            "time": elapsed,
            "words": len(response_text.split()),
            "chars": len(response_text),
        }
    except Exception as e:  # pylint: disable=broad-except
        elapsed = time.time() - start_time
        return {
            "model": "Claude",
            "response": None,
            "status": "error",
            "error": str(e),
            "time": elapsed,
        }


def query_gemini(prompt: str, api_key: str) -> Dict:
    """Query Google Gemini API"""
    start_time = time.time()
    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)

        model = genai.GenerativeModel("gemini-2.0-flash-exp")
        response = model.generate_content(prompt)

        elapsed = time.time() - start_time
        response_text = response.text

        return {
            "model": "Gemini (2.0 Flash)",
            "response": response_text,
            "status": "success",
            "time": elapsed,
            "words": len(response_text.split()),
            "chars": len(response_text),
        }
    except Exception as e:  # pylint: disable=broad-except
        elapsed = time.time() - start_time
        return {
            "model": "Gemini",
            "response": None,
            "status": "error",
            "error": str(e),
            "time": elapsed,
        }


def query_perplexity(prompt: str, api_key: str) -> Dict:
    """Query Perplexity API"""
    start_time = time.time()
    try:
        import openai

        client = openai.OpenAI(api_key=api_key, base_url="https://api.perplexity.ai")

        response = client.chat.completions.create(
            model="sonar",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        elapsed = time.time() - start_time
        response_text = response.choices[0].message.content

        return {
            "model": "Perplexity (Sonar)",
            "response": response_text,
            "status": "success",
            "time": elapsed,
            "words": len(response_text.split()),
            "chars": len(response_text),
        }
    except Exception as e:  # pylint: disable=broad-except
        elapsed = time.time() - start_time
        return {
            "model": "Perplexity",
            "response": None,
            "status": "error",
            "error": str(e),
            "time": elapsed,
        }


def tokenize(text: str) -> List[str]:
    """Normalize text into tokens for similarity comparisons."""
    if not text:
        return []
    cleaned = "".join(ch.lower() if ch.isalnum() or ch.isspace() else " " for ch in text)
    return [token for token in cleaned.split() if len(token) > 2]


def compute_text_similarity(text_a: str, text_b: str) -> float:
    """Compute a simple token-overlap similarity between two texts."""
    tokens_a = set(tokenize(text_a))
    tokens_b = set(tokenize(text_b))
    if not tokens_a or not tokens_b:
        return 0.0
    intersection = len(tokens_a & tokens_b)
    union = len(tokens_a | tokens_b)
    if union == 0:
        return 0.0
    return intersection / union


def query_all_models(
    prompt: str,
    openai_key: Optional[str] = None,
    anthropic_key: Optional[str] = None,
    gemini_key: Optional[str] = None,
    perplexity_key: Optional[str] = None,
) -> List[Dict]:
    """Query all AI models in parallel"""
    results: List[Dict] = []

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = []

        if openai_key:
            futures.append(("openai", executor.submit(query_openai, prompt, openai_key)))

        if anthropic_key:
            futures.append(("anthropic", executor.submit(query_anthropic, prompt, anthropic_key)))

        if gemini_key:
            futures.append(("gemini", executor.submit(query_gemini, prompt, gemini_key)))

        if perplexity_key:
            futures.append(("perplexity", executor.submit(query_perplexity, prompt, perplexity_key)))

        for name, future in futures:
            try:
                results.append(future.result())
            except Exception as exc:  # pylint: disable=broad-except
                results.append(
                    {
                        "model": name,
                        "response": None,
                        "status": "error",
                        "error": str(exc),
                    },
                )

    return results


def verify_responses(
    results: List[Dict],
    agreement_threshold: float = 0.35,
) -> Tuple[List[Dict], List[Dict], List[str]]:
    """
    Cross-check each successful response against every other response.
    Returns (verified_results, flagged_results, verification_notes).
    """
    successful = [
        r
        for r in results
        if r.get("status") == "success" and isinstance(r.get("response"), str) and r["response"].strip()
    ]

    if len(successful) < 2:
        notes = ["Not enough overlapping responses to run verification."]
        return successful, [], notes

    score_map: Dict[int, List[float]] = {index: [] for index in range(len(successful))}

    for i in range(len(successful)):
        for j in range(i + 1, len(successful)):
            first = successful[i]
            second = successful[j]
            similarity = compute_text_similarity(first["response"], second["response"])
            score_map[i].append(similarity)
            score_map[j].append(similarity)

    verified: List[Dict] = []
    flagged: List[Dict] = []
    notes: List[str] = []

    for index, response in enumerate(successful):
        scores = score_map.get(index, [])
        avg_score = sum(scores) / len(scores) if scores else 0.0
        labeled_response = dict(response)
        labeled_response["average_agreement"] = avg_score
        percentage = avg_score * 100

        if avg_score < agreement_threshold:
            flagged.append(labeled_response)
            notes.append(
                f"{response['model']} average agreement {percentage:.1f}% — flagged as potentially hallucinatory."
            )
        else:
            verified.append(labeled_response)
            notes.append(f"{response['model']} average agreement {percentage:.1f}% — kept.")

    if not verified and flagged:
        notes.append("All responses were flagged; no consensus answer available.")

    return verified, flagged, notes


def boss_synthesis(
    verified_results: List[Dict],
    openai_key: str,
    original_prompt: str,
) -> str:
    """Boss Mode: Use AI to synthesize all responses into one authoritative answer"""
    if not verified_results:
        return "No successful responses to synthesize."

    synthesis_prompt = f"""You are the BOSS AI reviewing responses from multiple AI models. Your job is to create ONE authoritative, comprehensive answer.

ORIGINAL QUESTION: {original_prompt}

RESPONSES FROM YOUR TEAM:

"""

    for i, result in enumerate(verified_results, 1):
        synthesis_prompt += f"{i}. {result['model']}:\n{result['response']}\n\n"

    synthesis_prompt += """
As the BOSS, analyze all responses and create the FINAL AUTHORITATIVE ANSWER by:
1. Identifying common themes and consensus
2. Highlighting unique insights from each model
3. Resolving any contradictions with your judgment
4. Adding your own expertise
5. Providing the most complete, accurate answer

Be decisive, comprehensive, and authoritative. This is the final answer the user will rely on."""

    try:
        import openai

        client = openai.OpenAI(api_key=openai_key)

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": synthesis_prompt}],
            temperature=0.7,
        )

        return response.choices[0].message.content
    except Exception as e:  # pylint: disable=broad-except
        return f"Boss synthesis failed: {str(e)}"


def synthesize_responses(
    results: List[Dict],
    boss_mode: bool = False,
    openai_key: Optional[str] = None,
    original_prompt: Optional[str] = None,
    verified_successful: Optional[List[Dict]] = None,
    flagged_outliers: Optional[List[Dict]] = None,
    verification_notes: Optional[List[str]] = None,
) -> str:
    """Synthesize responses from multiple AI models"""
    synthesis = "# Multi-AI Search Results\n\n"

    successful = [r for r in results if r["status"] == "success"]
    if verified_successful is not None:
        successful = verified_successful
    failed = [r for r in results if r["status"] == "error"]

    if boss_mode and openai_key and len(successful) > 0:
        boss_answer = boss_synthesis(successful, openai_key, original_prompt or "")
        synthesis += "## 👔 BOSS FINAL ANSWER\n\n"
        synthesis += boss_answer + "\n\n"
        synthesis += "---\n\n"
        synthesis += "## 📋 Individual Team Responses\n\n"

    if verification_notes:
        synthesis += "## 🧪 Verification Notes\n\n"
        for note in verification_notes:
            synthesis += f"- {note}\n"
        synthesis += "\n"

    if flagged_outliers:
        synthesis += "### 🚫 Removed Responses\n\n"
        for outlier in flagged_outliers:
            similarity_pct = outlier.get("average_agreement", 0.0) * 100
            synthesis += f"- **{outlier['model']}** removed (agreement {similarity_pct:.1f}%).\n"
        synthesis += "\n"

    # Display individual responses with stats
    for i, result in enumerate(successful, 1):
        time_str = f" ⚡ {result.get('time', 0):.2f}s" if "time" in result else ""
        words = result.get("words", 0)
        synthesis += f"## {i}. {result['model']}{time_str}\n\n"
        synthesis += f"**Response:** {words} words\n\n"
        synthesis += f"{result['response']}\n\n"
        synthesis += "---\n\n"

    # Display errors if any
    if failed:
        synthesis += "## ⚠️ Errors\n\n"
        for result in failed:
            synthesis += f"**{result['model']}:** {result.get('error', 'Unknown error')}\n\n"

    total_models = len([r for r in results if r.get("status")])
    synthesis += "## 📊 Performance Statistics\n\n"
    synthesis += f"- **Successful responses used:** {len(successful)}/{total_models}\n"
    synthesis += f"- **Models queried:** {', '.join([r['model'] for r in successful]) or 'None'}\n\n"

    if successful:
        sorted_by_speed = sorted(successful, key=lambda x: x.get("time", float("inf")))
        synthesis += "### ⚡ Speed Ranking\n"
        for i, result in enumerate(sorted_by_speed, 1):
            time_val = result.get("time", 0.0)
            medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else "  "
            synthesis += f"{medal} **{result['model']}**: {time_val:.2f}s\n"

        synthesis += "\n### 📝 Response Length\n"
        sorted_by_words = sorted(successful, key=lambda x: x.get("words", 0), reverse=True)
        for response in sorted_by_words:
            words = response.get("words", 0)
            chars = response.get("chars", 0)
            synthesis += f"- **{response['model']}**: {words} words ({chars} chars)\n"

        total_time = sum(r.get("time", 0) for r in successful)
        total_words = sum(r.get("words", 0) for r in successful)
        avg_time = total_time / len(successful)
        synthesis += "\n### 🎯 Totals\n"
        synthesis += f"- **Total response time:** {total_time:.2f}s\n"
        synthesis += f"- **Average response time:** {avg_time:.2f}s\n"
        synthesis += f"- **Total words generated:** {total_words}\n"
        synthesis += f"- **Fastest model:** {sorted_by_speed[0]['model']} ({sorted_by_speed[0].get('time', 0):.2f}s)\n"
        synthesis += f"- **Most detailed:** {sorted_by_words[0]['model']} ({sorted_by_words[0].get('words', 0)} words)\n"
    else:
        synthesis += "⚠️ No verified responses were available after verification.\n"

    return synthesis


def main() -> int:
    """CLI entry point"""
    parser = argparse.ArgumentParser(description="Query multiple AI models simultaneously")
    parser.add_argument("prompt", nargs="?", help="The question or topic to search")
    parser.add_argument("--openai-key", help="OpenAI API key")
    parser.add_argument("--anthropic-key", help="Anthropic API key")
    parser.add_argument("--gemini-key", help="Google Gemini API key")
    parser.add_argument("--perplexity-key", help="Perplexity API key")
    parser.add_argument("--boss", action="store_true", help="Enable Boss Mode: Generate final answer from all responses")
    parser.add_argument("--output", "-o", help="Output file (default: stdout)")

    args = parser.parse_args()

    # Get API keys from environment or arguments
    openai_key = args.openai_key or os.getenv("OPENAI_API_KEY")
    anthropic_key = args.anthropic_key or os.getenv("ANTHROPIC_API_KEY")
    gemini_key = args.gemini_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    perplexity_key = args.perplexity_key or os.getenv("PERPLEXITY_API_KEY")

    # Check if at least one API key is available
    if not any([openai_key, anthropic_key, gemini_key, perplexity_key]):
        print("❌ Error: No API keys found!")
        print("\nPlease set at least one API key:")
        print("  export OPENAI_API_KEY='your-key'")
        print("  export ANTHROPIC_API_KEY='your-key'")
        print("  export GEMINI_API_KEY='your-key'")
        print("  export PERPLEXITY_API_KEY='your-key'")
        return 1

    # Boss mode requires OpenAI key
    if args.boss and not openai_key:
        print("⚠️  Boss Mode requires OpenAI API key for synthesis")
        print("Continuing without Boss Mode...\n")
        args.boss = False

    # Get prompt
    if not args.prompt:
        print("Enter your question/topic (press Ctrl+D when done):")
        prompt = input("> ")
    else:
        prompt = args.prompt

    boss_emoji = "👔 " if args.boss else ""
    print(f"\n{boss_emoji}🔍 Querying AI models about: {prompt}\n")

    # Show which models will be queried (with masked keys)
    models_to_query = []
    print("🔐 API Keys Configured:")
    if openai_key:
        models_to_query.append("ChatGPT")
        print(f"  ✓ OpenAI: {mask_api_key(openai_key)}")
    if anthropic_key:
        models_to_query.append("Claude")
        print(f"  ✓ Anthropic: {mask_api_key(anthropic_key)}")
    if gemini_key:
        models_to_query.append("Gemini")
        print(f"  ✓ Gemini: {mask_api_key(gemini_key)}")
    if perplexity_key:
        models_to_query.append("Perplexity")
        print(f"  ✓ Perplexity: {mask_api_key(perplexity_key)}")

    mode_text = "(BOSS MODE)" if args.boss else ""
    print(f"\n📡 Querying: {', '.join(models_to_query)} {mode_text}\n")

    # Query all models
    results = query_all_models(prompt, openai_key, anthropic_key, gemini_key, perplexity_key)
    verified_successful, flagged_outliers, verification_notes = verify_responses(results)

    if flagged_outliers:
        print("🧪 Verification detected suspicious responses. They will be excluded from synthesis.")

    # Synthesize responses
    output = synthesize_responses(
        results,
        boss_mode=args.boss,
        openai_key=openai_key,
        original_prompt=prompt,
        verified_successful=verified_successful,
        flagged_outliers=flagged_outliers,
        verification_notes=verification_notes,
    )

    # Output results
    if args.output:
        with open(args.output, "w", encoding="utf-8") as file:
            file.write(output)
        print(f"✅ Results saved to: {args.output}")
    else:
        print(output)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
