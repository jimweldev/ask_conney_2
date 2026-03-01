<?php

namespace App\Helpers;

use Gemini\Laravel\Facades\Gemini;
use Laravel\Ai\Embeddings;
use Laravel\Ai\Enums\Lab;
use App\Models\Rag\RagAction;

class AiHelper {
    public static function generateEmbeddings($text) {
        $embedding = Embeddings::for([$text])
            ->dimensions(768)
            ->generate(Lab::Gemini, 'gemini-embedding-001');

        return $embedding->embeddings[0];
    }

    public static function detectIntentAndExtractData($question, $history = []) {
        // 1️⃣ Format conversation
        $conversation = '';
        foreach ($history as $message) {
            $role = $message['role'] === 'assistant' ? 'Assistant' : 'User';
            $conversation .= "{$role}: {$message['content']}\n";
        }

        // 2️⃣ Match action from the actions table
        $actions = RagAction::all();
        $matchedAction = null;

        foreach ($actions as $action) {
            $keywords = json_decode($action->keywords, true) ?? [];
            foreach ($keywords as $keyword) {
                if (stripos($question, $keyword) !== false) {
                    $matchedAction = $action;
                    break 2;
                }
            }
        }

        // 3️⃣ Set defaults based on matched action
        if ($matchedAction) {
            $project = $matchedAction->name;
            $table = $matchedAction->target_table;
            $type = $matchedAction->type;
            $defaults = json_decode($matchedAction->default_values, true) ?? [];
        } else {
            $project = null;
            $table = 'tickets';
            $type = 'ticket';
            $defaults = ['priority' => 'medium'];
        }

        // 4️⃣ Build AI prompt using $conversation, $project, $table, $type, etc.
        $prompt = <<<PROMPT
You are an AI assistant that decides whether to perform an action and where the record should go.

RULES:
- Never create a ticket/dispute without explicit user confirmation.
- Detect type of request and assign a project/table:
    - IT Helpdesk issues → "IT Helpdesk Support", table="tickets"
    - Website issues → "MegaTool Support", table="tickets"
    - Travel bookings → "Connext Travel", table="tickets"
    - Payroll disputes → table="disputes"
- First ask user if they want to create a record.
- After user confirms, show a draft with details (title, priority if relevant, project/table) for final confirmation.
- Return ONLY valid JSON.

Responses:

1️⃣ User describes a problem, has NOT confirmed:
{
  "action": "ask_create_ticket",
  "message": "It seems you are having a problem with <issue>. Do you want me to help you create a record?"
}

2️⃣ After user says yes, show draft for final confirmation:
{
  "action": "confirm_ticket",
  "data": {
    "title": "short title",
    "description": "detailed description",
    "priority": "low|medium|high",
    "project": "project name if applicable",
    "table": "tickets|disputes"
  },
  "message": "Here are the record details. Reply with 'yes' to confirm or 'no' to cancel.\n\n**Title**: <title>\n**Priority**: <priority>\n**Project**: <project>\n**Table**: <table>\n**Description**: <description>"
}

3️⃣ User confirms creation:
{
  "action": "create_ticket",
  "data": {
    "title": "short title",
    "description": "detailed description",
    "priority": "low|medium|high",
    "project": "project name if applicable",
    "table": "tickets|disputes"
  }
}

4️⃣ If no action is required:
{
  "action": "none"
}

Conversation so far:
$conversation

User message:
$question
PROMPT;

        $response = Gemini::generativeModel(
            model: env('GEMINI_MODEL', 'gemini-2.5-flash-lite')
        )->generateContent([$prompt]);

        // 5️⃣ Extract JSON from AI response
        $text = trim($response->text());
        $jsonStart = strpos($text, '{');
        $jsonEnd = strrpos($text, '}');

        if ($jsonStart === false || $jsonEnd === false) {
            return ['action' => 'none'];
        }

        $jsonString = substr($text, $jsonStart, $jsonEnd - $jsonStart + 1);
        $decoded = json_decode($jsonString, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
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
