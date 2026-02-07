# Meeting Minutes & Financial Tracking - N8N Workflows

This document provides the complete N8N workflow setup for the meeting minutes and financial tracking feature in the Care Kenya Welfare app.

## Overview

The system handles:
- **Meeting Management**: Create, edit, publish meeting records with agenda, minutes, action items
- **Financial Tracking**: Record contributions (hosting, food, refreshments, monthly contributions)
- **Attendance Tracking**: Track who attended meetings
- **Document Management**: Upload and manage meeting documents (PDFs, reports)

## Webhook Endpoints

All webhooks are accessed via: `https://n8n.tenear.com/webhook/{org}/{endpoint}`

### Meetings Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/welfare/meetings/list` | GET | List all meetings for organization |
| `/welfare/meetings/{id}` | GET | Get single meeting details |
| `/welfare/meetings/save` | POST | Create or update a meeting |
| `/welfare/meetings/delete` | POST | Delete a meeting |
| `/welfare/meetings/publish` | POST | Publish a meeting (change status) |

### Contributions Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/welfare/meetings/{id}/contributions` | GET | Get contributions for a meeting |
| `/welfare/meetings/{id}/contributions/add` | POST | Add a new contribution |

### Attendance Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/welfare/meetings/{id}/attendance` | GET | Get attendance for a meeting |
| `/welfare/meetings/{id}/attendance/add` | POST | Record attendance |

## N8N Workflow Structure

### Workflow 1: Meeting Management (Main)

```
[Webhook: welfare/meetings/*]
        ↓
[Switch: Route by Method/Action]
        ↓
┌───────────────┬───────────────┬───────────────┐
│ Case: GET     │ Case: POST    │ Case: POST    │
│ (List/Detail) │ (Save)        │ (Delete)      │
└───────┬───────┴───────┬───────┴───────┬───────┘
        │               │               │
        ▼               ▼               ▼
[PostgreSQL:      [PostgreSQL:     [PostgreSQL:
 Execute Query]   Execute Query]   Execute Query]
        │               │               │
        └───────────────┴───────────────┘
                        │
                        ▼
              [Set: Format Response]
                        │
                        ▼
            [Respond to Webhook]
```

### Workflow 2: Contributions Management

```
[Webhook: POST /welfare/meetings/*/contributions/add]
        ↓
[Code: Parse contribution data]
        ↓
[PostgreSQL: Call add_contribution function]
        ↓
[Code: Format success/error response]
        ↓
[Respond to Webhook]
```

### Workflow 3: Attendance Tracking

```
[Webhook: POST /welfare/meetings/*/attendance/add]
        ↓
[Code: Parse attendance data]
        ↓
[PostgreSQL: Call record_attendance function]
        ↓
[Code: Format success/error response]
        ↓
[Respond to Webhook]
```

## Detailed N8N Workflow JSON

### Main Meeting Workflow

```json
{
  "name": "Welfare - Meeting Minutes Management",
  "nodes": [
    {
      "parameters": {
        "path": "welfare/meetings"
      },
      "name": "Webhook - Meeting Routes",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [100, 200],
      "webhookId": "welfare-meetings"
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value": "={{ $json.method }}"
            }
          ]
        }
      },
      "name": "Switch - Route by Method",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [300, 200]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "=SELECT * FROM get_meetings({{ $json.org_id || 1 }}, 50, 0) AS meetings"
      },
      "name": "PostgreSQL - List Meetings",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [500, 100],
      "credentials": {
        "postgresApi": {
          "id": "your-postgres-credentials",
          "name": "PostgreSQL"
        }
      }
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "=SELECT * FROM get_meeting_details({{ $json.id }})"
      },
      "name": "PostgreSQL - Get Meeting Details",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [500, 200],
      "credentials": {
        "postgresApi": {
          "id": "your-postgres-credentials",
          "name": "PostgreSQL"
        }
      }
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "=SELECT * FROM save_meeting(\n  {{ $json.id || 'NULL' }},\n  {{ $json.org_id || 1 }},\n  '{{ $json.title }}',\n  '{{ $json.meeting_date }}',\n  '{{ $json.venue }}',\n  '{{ $json.agenda }}',\n  '{{ $json.minutes_content }}',\n  '{{ JSON.stringify($json.attendees || []) }}',\n  '{{ JSON.stringify($json.absent_apologies || []) }}',\n  '{{ JSON.stringify($json.action_items || []) }}',\n  '{{ $json.status }}',\n  {{ $json.created_by || 'NULL' }}\n)"
      },
      "name": "PostgreSQL - Save Meeting",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [500, 300],
      "credentials": {
        "postgresApi": {
          "id": "your-postgres-credentials",
          "name": "PostgreSQL"
        }
      }
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "=DELETE FROM public.meetings WHERE id = {{ $json.id }} RETURNING id"
      },
      "name": "PostgreSQL - Delete Meeting",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [500, 400],
      "credentials": {
        "postgresApi": {
          "id": "your-postgres-credentials",
          "name": "PostgreSQL"
        }
      }
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "success",
              "value": "true"
            }
          ]
        }
      },
      "name": "Set - Success Response",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [700, 200]
    },
    {
      "parameters": {
        "options": {}
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [900, 200]
    }
  ],
  "connections": {
    "Webhook - Meeting Routes": {
      "main": [
        [
          {
            "node": "Switch - Route by Method",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Switch - Route by Method": {
      "main": [
        [
          {
            "node": "PostgreSQL - List Meetings",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "PostgreSQL - Get Meeting Details",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "PostgreSQL - Save Meeting",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "PostgreSQL - Delete Meeting",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "PostgreSQL - List Meetings": {
      "main": [
        [
          {
            "node": "Set - Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "PostgreSQL - Get Meeting Details": {
      "main": [
        [
          {
            "node": "Set - Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "PostgreSQL - Save Meeting": {
      "main": [
        [
          {
            "node": "Set - Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "PostgreSQL - Delete Meeting": {
      "main": [
        [
          {
            "node": "Set - Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Contributions Workflow

```json
{
  "name": "Welfare - Meeting Contributions",
  "nodes": [
    {
      "parameters": {
        "path": "welfare/meetings/:meetingId/contributions/add"
      },
      "name": "Webhook - Add Contribution",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [100, 200],
      "webhookId": "welfare-meeting-contribution"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "=SELECT * FROM add_contribution(\n  {{ $json.org_id || 1 }},\n  {{ $json.meeting_id }},\n  {{ $json.member_id || 'NULL' }},\n  '{{ $json.member_name }}',\n  '{{ $json.contribution_type }}',\n  {{ $json.amount }},\n  '{{ $json.payment_method || 'CASH' }}',\n  '{{ $json.transaction_reference || '' }}',\n  '{{ $json.notes || '' }}',\n  {{ $json.recorded_by || 'NULL' }}\n)"
      },
      "name": "PostgreSQL - Add Contribution",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [300, 200],
      "credentials": {
        "postgresApi": {
          "id": "your-postgres-credentials",
          "name": "PostgreSQL"
        }
      }
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "success",
              "value": "true"
            }
          ]
        }
      },
      "name": "Set - Success Response",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [500, 200]
    },
    {
      "parameters": {
        "options": {}
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [700, 200]
    }
  ],
  "connections": {
    "Webhook - Add Contribution": {
      "main": [
        [
          {
            "node": "PostgreSQL - Add Contribution",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "PostgreSQL - Add Contribution": {
      "main": [
        [
          {
            "node": "Set - Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Attendance Workflow

```json
{
  "name": "Welfare - Meeting Attendance",
  "nodes": [
    {
      "parameters": {
        "path": "welfare/meetings/:meetingId/attendance/add"
      },
      "name": "Webhook - Record Attendance",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [100, 200],
      "webhookId": "welfare-meeting-attendance"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "=SELECT * FROM record_attendance(\n  {{ $json.org_id || 1 }},\n  {{ $json.meeting_id }},\n  {{ $json.member_id || 'NULL' }},\n  '{{ $json.member_name }}',\n  '{{ $json.status }}',\n  '{{ $json.arrival_time || \"now()\" }}'\n)"
      },
      "name": "PostgreSQL - Record Attendance",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [300, 200],
      "credentials": {
        "postgresApi": {
          "id": "your-postgres-credentials",
          "name": "PostgreSQL"
        }
      }
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "success",
              "value": "true"
            }
          ]
        }
      },
      "name": "Set - Success Response",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [500, 200]
    },
    {
      "parameters": {
        "options": {}
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [700, 200]
    }
  ],
  "connections": {
    "Webhook - Record Attendance": {
      "main": [
        [
          {
            "node": "PostgreSQL - Record Attendance",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "PostgreSQL - Record Attendance": {
      "main": [
        [
          {
            "node": "Set - Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Database Setup

### Run the Schema

1. Connect to your PostgreSQL database
2. Run the schema file:

```bash
psql -h your-host -U your-user -d your-database -f meetings_schema.sql
```

### Verify Functions

```sql
-- Test the functions exist
SELECT * FROM pg_proc WHERE proname LIKE 'get_meetings';
SELECT * FROM pg_proc WHERE proname LIKE 'save_meeting';
SELECT * FROM pg_proc WHERE proname LIKE 'add_contribution';
SELECT * FROM pg_proc WHERE proname LIKE 'record_attendance';
```

## Frontend API Service

### meetingService.js

```javascript
const N8N_BASE = 'https://n8n.tenear.com/webhook';

class MeetingService {
  async getMeetings(orgId, limit = 50, offset = 0) {
    const response = await fetch(
      `${N8N_BASE}/welfare/meetings/list?org_id=${orgId}&limit=${limit}&offset=${offset}`
    );
    return response.json();
  }

  async getMeetingDetails(meetingId) {
    const response = await fetch(
      `${N8N_BASE}/welfare/meetings/${meetingId}`
    );
    return response.json();
  }

  async saveMeeting(meetingData) {
    const response = await fetch(`${N8N_BASE}/welfare/meetings/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meetingData)
    });
    return response.json();
  }

  async deleteMeeting(meetingId) {
    const response = await fetch(`${N8N_BASE}/welfare/meetings/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: meetingId })
    });
    return response.json();
  }

  async addContribution(contributionData) {
    const response = await fetch(
      `${N8N_BASE}/welfare/meetings/${contributionData.meeting_id}/contributions/add`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contributionData)
      }
    );
    return response.json();
  }

  async recordAttendance(attendanceData) {
    const response = await fetch(
      `${N8N_BASE}/welfare/meetings/${attendanceData.meeting_id}/attendance/add`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData)
      }
    );
    return response.json();
  }
}

export const meetingService = new MeetingService();
```

## Testing

### Test Meeting List

```bash
curl "https://n8n.tenear.com/webhook/welfare/meetings/list?org_id=1"
```

### Test Create Meeting

```bash
curl -X POST "https://n8n.tenear.com/webhook/welfare/meetings/save" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": 1,
    "title": "January 2026 Monthly Meeting",
    "meeting_date": "2026-01-15 10:00:00",
    "venue": "Community Hall",
    "agenda": "1. Opening Prayer\n2. Attendance\n3. Financial Report\n4. Any Other Business",
    "status": "DRAFT",
    "created_by": 1
  }'
```

### Test Add Contribution

```bash
curl -X POST "https://n8n.tenear.com/webhook/welfare/meetings/1/contributions/add" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": 1,
    "meeting_id": 1,
    "member_id": 5,
    "member_name": "John Doe",
    "contribution_type": "HOSTING",
    "amount": 500,
    "payment_method": "CASH",
    "notes": "For January meeting refreshments"
  }'
```

### Test Record Attendance

```bash
curl -X POST "https://n8n.tenear.com/webhook/welfare/meetings/1/attendance/add" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": 1,
    "meeting_id": 1,
    "member_id": 5,
    "member_name": "John Doe",
    "status": "PRESENT",
    "arrival_time": "2026-01-15 09:45:00"
  }'
```

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": [...],
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Security Considerations

1. **Authentication**: All webhooks should verify JWT tokens
2. **Authorization**: Check user role before allowing create/update/delete
3. **Input Validation**: Validate all input parameters
4. **Rate Limiting**: Implement rate limiting per org
5. **SQL Injection**: Use parameterized queries (already implemented via functions)

## Next Steps

1. Run the database schema in PostgreSQL
2. Import N8N workflows
3. Configure PostgreSQL credentials in N8N
4. Create frontend meetingService
5. Build MeetingMinutes component
6. Test end-to-end flow
