<?php

namespace Database\Seeders;

use App\Models\Rag\RagAction;
// rag models
use App\Models\Rag\RagActionField;
use Illuminate\Database\Seeder;

class RagSeeder extends Seeder {
    /**
     * Run the database seeds.
     */
    public function run(): void {
        try {
            $itHelpdeskSupport = RagAction::create([
                'name' => 'IT Helpdesk Support',
                'description' => 'Network, Internet, System Unit, Login, Keyboard, Remote, Support, Mouse, Application Error, Connection, Remote Desktop, System Unit, Beep, Audio, Microsoft, Azure, Office, Activation, Inventory, Hardware, VPN, Virtual Private Network, Latency, Headset, Softphone, UPS, Terminate Access, Email, Station Relocation, Seat Reservation',
                'endpoint' => 'https://test-megaform-api.connextglobal.com/ticketing-system/ticket/it',
                'notes' => 'The `issue_summary` field is the title of the ticket and the `issue_description` field is the description of the ticket. Provide them base on the request of the user. Provide the most applicable impact base on the dropdown choices',
                'instructions' => "On MegaTool, click the ticket button, Click 'create', click 'IT Helpdesk Support', fill up the form and click 'create' button",
            ]);

            RagActionField::insert([
                // [] issue: STAFF CANNOT LOGIN
                [
                    'rag_action_id' => $itHelpdeskSupport->id,
                    'name' => 'issue',
                    'type' => 'dropdown',
                    'default_value' => null,
                    'dropdown_options' => json_encode([
                        'BUG/MALFUNCTION ',
                        'CONNECTION DROPPED',
                        'DISCONNECTS',
                        'LOGIN PROBLEM',
                        'NOT RESPONDING',
                        'POOR AUDIO',
                        'POOR VIDEO',
                        'NO INTERNET	INTERNET DOWN',
                        'MS OFFICE ACTIVATION',
                        'PO-INVENTORY',
                        'NEW HIRE',
                        'APPLICATION ASSISTANCE',
                        'HARDWARE ASSISTANCE',
                        'REMOTE DESKTOP',
                        'APP INSTALLATION REQUEST',
                        'APPLICATION ERROR',
                        'INTERNET LATENCY',
                        'VPN',
                        'MOUSE',
                        'KEYBOARD',
                        'HEADSET',
                        'MONITOR',
                        'WEBCAM',
                        'CPU',
                        'UPS',
                        'SOFTPHONE',
                        'TERMINATE ACCESS',
                        'EMAIL',
                        'STATION RELOCATION',
                        'SEAT RESERVATION',
                    ]),
                    'order' => '3',
                    'is_required' => true,
                ],
                // [] impact: Access Error
                [
                    'rag_action_id' => $itHelpdeskSupport->id,
                    'name' => 'impact',
                    'type' => 'dropdown',
                    'default_value' => null,
                    'dropdown_options' => json_encode(['extensive/widespread', 'client imperative', 'client down', 'business essential', 'slow production pace', 'station down - alternative available', 'operational with work around', 'network down', 'inventory', 'new hire']),
                    'order' => '4',
                    'is_required' => true,
                ],
                // [] urgency: MEDIUM
                [
                    'rag_action_id' => $itHelpdeskSupport->id,
                    'name' => 'urgency',
                    'type' => 'dropdown',
                    'default_value' => 'MEDIUM',
                    'dropdown_options' => json_encode(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
                    'order' => '5',
                    'is_required' => true,
                ],
                // [] issue_summary: test
                [
                    'rag_action_id' => $itHelpdeskSupport->id,
                    'name' => 'issue_summary',
                    'type' => 'string',
                    'default_value' => null,
                    'dropdown_options' => null,
                    'order' => '6',
                    'is_required' => true,
                ],
                // [] issue_description: <p>test</p>
                [
                    'rag_action_id' => $itHelpdeskSupport->id,
                    'name' => 'issue_description',
                    'type' => 'string',
                    'default_value' => null,
                    'dropdown_options' => null,
                    'order' => '7',
                    'is_required' => true,
                ],
            ]);

            $megaToolSupport = RagAction::create([
                'name' => 'MegaTool Support',
                'description' => 'Time Tracker, MegaTool Login Credential, Reset, Bugs, Errors',
                'endpoint' => 'https://test-megaform-api.connextglobal.com/ticketing-system/ticket/mt',
                'notes' => 'The `issue_summary` field is the title of the ticket and the `issue_description` field is the description of the ticket. Provide them base on the request of the user. Provide the most applicable impact base on the dropdown choices',
                'instructions' => "On MegaTool, click the ticket button, Click 'create', click 'MegaTool Support', fill up the form and click 'create' button"
            ]);

            RagActionField::insert([
                // [] issue: STAFF CANNOT LOGIN
                [
                    'rag_action_id' => $megaToolSupport->id,
                    'name' => 'issue',
                    'type' => 'dropdown',
                    'default_value' => 'OTHERS',
                    'dropdown_options' => json_encode([
                        'MEGAFORM PARTIALLY INACCESSIBLE',
                        'STAFF CANNOT RESET PASSWORD',
                        'STAFF CANNOT LOGIN',
                        'STAFF BLOCKED LOGIN RESET',
                        'NEW STAFF MEGAFORM ACCESS REQUEST',
                        'STAFF FORM ACCESS REQUEST',
                        'STAFF NOT RECEIVING EMAIL',
                        'ISSUES/BUGS REPORT',
                        'MEGAFORM ADDITIONAL FEATURE REQUEST',
                        'MEGAFORM HELP/TUTORIAL REQUEST',
                        'ADD NEW CLIENT REQUEST',
                        'OTHERS',
                    ]),
                    'order' => '3',
                    'is_required' => true,
                ],
                // [] impact: Access Error
                [
                    'rag_action_id' => $megaToolSupport->id,
                    'name' => 'impact',
                    'type' => 'dropdown',
                    'default_value' => null,
                    'dropdown_options' => json_encode(['WEB APP/SITE DOWN', 'ACCESS ERROR', 'ISSUES/BUG/ERROR', 'RECORD MANAGEMENT', 'TUTORIAL/HELP', 'OTHERS', 'REQUEST', 'MODERATE/LIMITED']),
                    'order' => '4',
                    'is_required' => true,
                ],
                // [] urgency: MEDIUM
                [
                    'rag_action_id' => $megaToolSupport->id,
                    'name' => 'urgency',
                    'type' => 'dropdown',
                    'default_value' => 'MEDIUM',
                    'dropdown_options' => json_encode(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
                    'order' => '5',
                    'is_required' => true,
                ],
                // [] issue_summary: test
                [
                    'rag_action_id' => $megaToolSupport->id,
                    'name' => 'issue_summary',
                    'type' => 'string',
                    'default_value' => null,
                    'dropdown_options' => null,
                    'order' => '6',
                    'is_required' => true,
                ],
                // [] issue_description: <p>test</p>
                [
                    'rag_action_id' => $megaToolSupport->id,
                    'name' => 'issue_description',
                    'type' => 'string',
                    'default_value' => null,
                    'dropdown_options' => null,
                    'order' => '7',
                    'is_required' => true,
                ],
            ]);
        } catch (\Throwable $th) {
            // throw $th;
        }
    }
}
