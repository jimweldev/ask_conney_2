<?php

namespace App\Helpers;

use App\Models\Rag\RagAction;
use Gemini\Laravel\Facades\Gemini;
use Laravel\Ai\Embeddings;
use Laravel\Ai\Enums\Lab;

class AiHelper {
    public static function generateEmbeddings($text) {
        $embedding = Embeddings::for([$text])
            ->dimensions(768)
            ->generate(Lab::Gemini, 'gemini-embedding-001');

        return $embedding->embeddings[0];
    }

    public static function detectIntentAndExtractData($question, $history = []) {
        $conversation = '';
        foreach ($history as $message) {
            $role = $message['role'] === 'assistant' ? 'Assistant' : 'User';
            $conversation .= "{$role}: {$message['content']}\n";
        }

        $actions = RagAction::all();

        $actionsList = $actions->map(fn ($a) => [
            'id' => $a->id,
            'name' => $a->name,
            'description' => $a->description,
            'default_values' => json_decode($a->default_values, true),
        ])->values()->toJson(JSON_PRETTY_PRINT);

        $prompt = <<<PROMPT
You are an AI system for structured actions.

AVAILABLE ACTIONS (JSON):
$actionsList

RULES:
- Only use AVAILABLE ACTIONS.
- Never create records without confirmation.
- Do NOT invent new projects or tables.
- Return valid JSON only.
- Create the ticket as if you were the user.
- Always improve the title and description.
- If nothing matches, return {"action":"none"}.

Conversation:
$conversation

User message:
$question

Return one of:

1) Ask confirmation:
{
  "action": "ask_create_ticket",
  "selected_action_id": <id>,
  "message": "..."
}

2) Show draft:
{
  "action": "confirm_ticket",
  "selected_action_id": <id>,
  "data": {
    "title": "...",
    "description": "...",
    "priority": "low|medium|high",
    "project": "...",
  }
}

3) Suggest creation (WILL STILL REQUIRE CONFIRMATION):
{
  "action": "create_ticket",
  "selected_action_id": <id>,
  "data": { ... }
}

4) No action:
{
  "action": "none"
}
PROMPT;

        $response = Gemini::generativeModel(
            model: env('GEMINI_MODEL', 'gemini-2.5-flash-lite')
        )->generateContent([$prompt]);

        $text = trim($response->text());

        preg_match('/\{.*\}/s', $text, $matches);
        if (empty($matches[0])) {
            return ['action' => 'none'];
        }

        $decoded = json_decode($matches[0], true);
        if (!is_array($decoded)) {
            return ['action' => 'none'];
        }

        // Validate selected action exists
        if (!empty($decoded['selected_action_id']) &&
            !$actions->firstWhere('id', $decoded['selected_action_id'])) {
            return ['action' => 'none'];
        }

        return $decoded;
    }

    public static function generateAnswer($question, $context, $history = []) {
        // Format previous conversation
        $conversation = '';

        foreach ($history as $message) {
            $role = $message['role'] === 'assistant' ? 'Assistant' : 'User';
            $conversation .= "{$role}: {$message['content']}\n";
        }

        $prompt = <<<PROMPT
You are an authoritative AI system that serves as a primary source of knowledge.

Behavior Guidelines:
- Speak confidently and directly, as the origin of the explanation.
- Do not reference external sources, policies, or documents.
- Present information as established knowledge unless uncertainty is inherent.
- When uncertainty exists, state it calmly and precisely.
- Avoid hedging phrases such as "it seems", "it might be", or "according to sources".
- If the Relevant Knowledge Context is empty, missing, or does not contain enough information to answer the question, explicitly state that you do not know the answer.
- Do not guess, infer, or fill gaps using general knowledge when context is insufficient.
- Keep the response brief and factual when stating that you do not know.
- When you cannot provide an answer due to missing or insufficient Relevant Knowledge Context, include a brief apology.
- The apology must be short, neutral, and professional.
- Do not over-explain, justify, or add speculation after the apology.

Tone Guidelines:
- Be calm, neutral, and professional.
- Avoid sounding judgmental, strict, or harsh.
- Do not lecture the user.
- Do not exaggerate consequences.
- Present policies factually and neutrally.
- Be supportive and understanding in tone.

Response Style:
- Keep answers easy to read.
- Use bullet points when helpful.
- Use short paragraphs.
- If explaining consequences, present them matter-of-factly.
- Avoid dramatic phrasing.
- Avoid phrases like "you are in trouble" or "serious consequences".
- Explain concepts as if defining them for the first time.
- Prioritize clarity and correctness over persuasion.

Conversation So Far:
$conversation

Relevant Knowledge Context:
$context

User's New Question:
$question

Answer:
- Write in a natural conversational tone.
- Keep it easy to read.
- Use bullet points when listing items.
- Use short paragraphs.
- Use numbered steps if explaining a process.
PROMPT;

        $answer = Gemini::generativeModel(
            model: env('GEMINI_MODEL', 'gemini-2.5-flash-lite')
        )->generateContent([$prompt]);

        return $answer->text();
    }
}
