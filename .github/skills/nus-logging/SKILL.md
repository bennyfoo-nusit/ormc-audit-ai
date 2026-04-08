---
name: nus-logging
description: >
  NUS-specific logging taxonomy and JSON log field contract for custom-coded systems,
  based on the NUS IT Logging, Monitoring and Alerts guideline. This is an
  organisation-level, language-agnostic skill for implementing or reviewing application
  logs that must comply with the NUS standard log types, event codes, and file format.
---

# NUS – Logging Types & Standard Log Format

> **Organisation-level skill:** This skill is language-agnostic and sits alongside
> `.github/skills/coding/SKILL.md` as an NUS-wide standard.
>
> This skill defines the **NUS-specific what-to-log and how-to-shape-the-log-entry rules**.
> Use it together with the relevant language/framework logging skill for implementation mechanics.
> For Java, pair it with `.github/skills/java/logging/SKILL.md`.
>
> **Source basis:** Confluence page `Custom Coded Systems - Logging, Monitoring and Alerts Guidelines`
> (space `nusit`, page `28180623`).

## A) Scope and intent

Apply this skill when a system needs to follow the NUS custom-coded application logging guideline, especially for:
- backend application exception logging
- heartbeat events
- business events
- authorization updates
- confidential data access events
- authentication logs
- JSON log file structure intended for Splunk ingestion

This skill focuses on **event taxonomy, required fields, field names, and safe content**.
It does **not** replace language/framework logging guidance.

## B) Logging types – what must be logged

### B.1 Backend log categories

For backend custom-coded systems, the NUS guideline distinguishes these application log categories:

| Category | Primary platform | Purpose |
| --- | --- | --- |
| Exception / Incident | Splunk Enterprise | Unhandled failures or incidents requiring attention |
| Heartbeat | Splunk Enterprise | Presence/continuity signal proving logs are still flowing |
| Business Event | Splunk Enterprise | Important business actions and reads of confidential data |
| Authorization Update | Splunk Enterprise | Fine-grained permission changes |
| Authentication | Splunk Enterprise | Login attempts and outcomes |
| Metrics / Traces / APM / uncaught exceptions | Splunk Observability | Application performance monitoring and traces |

### B.2 Operational interpretation

Use the following log types/categories for application logs:
- `ex` — exception event
- `hbt` — heartbeat event
- business / functional event
- authorization update
- confidential data accessed
- configuration update
- `authn` — authentication event

### B.3 Event category vs event code

For **business / functional / authorization update / confidential data accessed /
configuration update** logging, the **event code is not fixed** to literal values such as
`func`, `authz`, `confi`, or `sysconf`.

Instead, application teams **SHOULD** define domain-specific event codes that describe the
actual business or security action, for example:
- `add-user`
- `delete-user`
- `grant-folder-access`
- `read-student-profile`
- `update-password-policy`

Rules:
- Event codes **SHOULD** be lowercase and hyphen-separated.
- Event codes **SHOULD** be stable, machine-friendly, and meaningful to downstream log users.
- The event code **SHOULD** express the specific action, not just the broad category.
- If your implementation needs both a broad category and a specific event code, keep the
  category separate from the specific event code.

### B.4 Canonical values vs illustrative samples

The Confluence page contains some sample payload inconsistencies. When implementing logging, prefer the
**canonical table-defined values** over inconsistent examples.

Canonical values to use:
- `dt` in ISO8601 UTC
- business event code / event code in lowercase, preferably hyphen-separated
- structured `details` with non-sensitive values only

Do **not** copy inconsistent sample values such as mixed-case event codes when the table defines a stricter format.

## C) File and transport format

### C.1 Local file format
- Local application logs **SHOULD** be stored as `.jsonl` files.
- Logs **MUST** be written as **one JSON object per line**.
- JSON logs **SHOULD** be written to the filesystem or dedicated mounted log path according to hosting model.

### C.2 JSON object rule
- Each log entry **MUST** be a valid JSON object.
- Nested custom details **MAY** be placed inside `details`.
- `details` **MUST NOT** contain confidential data, secrets, or unmasked PII.

### C.3 Time format
- `dt` **MUST** be ISO8601 in **UTC** timezone.
- Example: `2024-10-03T06:45:36Z`

## D) Standard fields (common contract)

These fields form the NUS base contract for application logs.

| Logical field | Physical field | Rule |
| --- | --- | --- |
| Datetime | `dt` | ISO8601 UTC timestamp |
| User ID | `userid` | User/account/system identifier related to the event |
| Is User | `isUser` | `true` for human-originated event, `false` for system-originated event |
| Environment | `env` | Environment name such as `DEV`, `SIT`, `QAT`, `PRD` |
| Application ID | `appId` | eApps ID / application identifier |
| Application Name | `app` | Human-readable application/system name |
| Module | `mod` | Deployable module name if applicable; empty/null if not applicable |
| Class / Controller | `class` | Logging originator class/component |
| Version | `ver` | Deployed application/module version |
| Caller IP | `ip` | Caller IP / forwarded client IP / machine IP |
| Server IP | `sip` | Server IP where relevant |
| Server Hostname | `server` | Hostname / endpoint / FQDN |

### D.1 User identity values
`userid` may contain:
- NUS user principal name for NUS users
- local username/email/identifier for local users
- `system` for system-initiated activity without a service account
- service account ID where a service account performed the action
- `anonymous` for anonymous access

### D.2 Required mindset
- These common fields **SHOULD** be present consistently across applicable backend log events.
- Use opaque, operationally useful identifiers.
- Do not place secrets or confidential values into common fields.

## E) Event-specific formats

### E.1 Exception logging

Use for exceptions/incidents requiring attention.

Required additional fields:
- `level`: `error`
- `event`: `ex`
- `msg`: safe exception summary
- `details`: optional structured details

Rules:
- Exception message **MUST** be safe for logs.
- Stack trace **MAY** be included in `details.stackTrace` only if it does not expose sensitive data.
- Use this for failures that need human attention or investigation.

### E.2 Heartbeat events

Heartbeat events are used to detect missing logs.

Required additional fields:
- `level`: `info`
- `event`: `hbt`
- `msg`: optional heartbeat message, e.g. `--- heartbeat ---`

Rules:
- One heartbeat event **SHOULD** be generated every hour.
- Heartbeat logs support the “missing log” alerting pattern.

### E.3 Business events and authorization logging

Required additional fields:
- `level`: one of `debug`, `info`, `warn`
- `event`: domain-specific event code such as `add-user`, `delete-user`, `grant-role`, `read-user-profile`, `update-config`
- `msg`: concise event summary
- `details`: structured event details

#### E.3.1 Business events
Use for important business actions and meaningful domain events.

`details` fields:
- `evCode` — **mandatory**, lowercase, no spaces
- `evDetails` — additional event details
- `evActor` — actor user ID if applicable

Rules:
- `evCode` **MUST** be stable and machine-friendly.
- `event` and `evCode` **SHOULD** align; if both are present, they should describe the same business action.
- `evDetails` **MUST NOT** contain confidential or PII data.

Examples:
- `event: add-user`, `evCode: add-user`
- `event: delete-user`, `evCode: delete-user`

#### E.3.2 Authorization updates
Use for permission or grant changes.

`details` fields:
- `grantor`
- `grantee`
- `objt` — role/object type
- `obj` — role/object identifier/name where applicable

Example event codes:
- `grant-role`
- `revoke-role`
- `assign-folder-access`

#### E.3.3 Confidential data access
Use when confidential information is read/accessed.

`details` fields:
- `accId` — accessor user ID
- `objt` — data type accessed
- `obj` — object identifier

Rules:
- Object identifiers **SHOULD** be non-sensitive identifiers.
- Do **not** log raw confidential payload values.
- Do **not** log the confidential content itself.

Example event codes:
- `read-user-profile`
- `view-payslip`
- `download-transcript`

#### E.3.4 Configuration updates
Use for important configuration changes.

`details` fields:
- `updId` — updater user ID
- `obj` — configuration identifier/name
- `val` — updated value

Rules:
- `val` **MUST NOT** contain confidential values, secrets, tokens, or PII.

Example event codes:
- `update-password-policy`
- `change-session-timeout`
- `update-feature-toggle`

### E.4 Authentication log

Authentication logs are logged to a **separate log index** from general event logs.

Required additional fields:
- `event`: `authn`
- `success`: boolean
- `failReason`: required when `success == false`
- `mfa`: boolean
- `mfat`: MFA type when `mfa == true`

Rules:
- Log login attempts and outcomes.
- For externally managed auth providers, the application may log successful login while the provider logs full success/failure + MFA details.
- Failure reasons **MUST** stay safe and must not expose secrets.

## F) Severity / level guidance

Use these NUS-aligned levels:
- `error` — unhandled exception / incident requiring human intervention
- `warn` — handled but abnormal condition
- `info` — normal operational or business event, heartbeat, configuration update, successful significant actions
- `debug` — technical diagnostics and low-level event tracing

When applying this skill with a language/framework logging skill:
- use the language/framework skill for logger syntax, framework configuration, and runtime integration
- use this NUS skill to choose the right fields, event code, `msg`, and `details`

## G) Safety and privacy rules

- Confidential data and PII **MUST NOT** be logged in clear text.
- Full names, NRIC/FIN, phone numbers, addresses, bank account numbers, credit card numbers, tokens, passwords, and secrets **MUST NOT** appear in `msg` or `details`.
- If a configuration value is sensitive, it **MUST** be omitted or redacted.
- If a business event references a person or object, prefer stable identifiers over raw personal data.
- Logging examples that include sensitive-looking values **MUST NOT** be copied blindly into production code.

## H) Prettified samples (adapted from the Confluence guideline)

### H.1 Exception log sample

```json
{
  "dt": "2024-10-03T06:45:36Z",
  "userid": "c.cai@nus.edu.sg",
  "isUser": true,
  "env": "PRD",
  "appId": "1234",
  "app": "uNivUS",
  "mod": "Scholarship",
  "class": "ScholarshipAdminController",
  "ver": "1.5.1.2",
  "ip": "185.123.152.50",
  "sip": "185.123.152.50",
  "server": "inetapps.nus.edu.sg",
  "level": "error",
  "event": "ex",
  "msg": "Unable to load the configuration for XX service, system cannot proceed with processing.",
  "details": {
    "myCustomType": "Error",
    "stackTrace": [
      "at ScholarshipAdminController.LoadConfiguration() in C:\\Projects\\Scholarship\\ScholarshipAdminController.cs:line 45",
      "at ScholarshipAdminController.ProcessRequest() in C:\\Projects\\Scholarship\\ScholarshipAdminController.cs:line 21",
      "at Middleware.RequestHandler.Invoke() in C:\\Projects\\Middleware\\RequestHandler.cs:line 78"
    ],
    "anyOtherCustomField": "Hello World"
  }
}
```

### H.2 Heartbeat event sample

```json
{
  "dt": "2024-10-03T06:45:36Z",
  "userid": "system",
  "isUser": false,
  "env": "PRD",
  "appId": "1234",
  "app": "uNivUS",
  "ip": "185.123.152.50",
  "sip": "185.123.152.50",
  "server": "inetapps.nus.edu.sg",
  "level": "info",
  "event": "hbt",
  "msg": "--- heartbeat ---"
}
```

### H.3 Business / authorization / confidential-data / configuration event samples

```jsonl
{
  "dt": "2024-10-03T09:15:30Z",
  "userid": "a.lee@nus.edu.sg",
  "isUser": true,
  "env": "PRD",
  "appId": "1234",
  "app": "uNivUS",
  "mod": "Registration",
  "class": "RegistrationController",
  "ver": "2.3.4",
  "ip": "192.168.0.1",
  "sip": "10.0.0.1",
  "server": "prodapps.nus.edu.sg",
  "level": "info",
  "event": "cancel-application",
  "msg": "The user has cancelled the application process.",
  "details": {
    "evCode": "cancel-application",
    "evDetails": "User cancelled the application process at step 3.",
    "evActor": "a.lee@nus.edu.sg"
  }
}
{
  "dt": "2024-10-03T10:00:45Z",
  "userid": "m.tan@nus.edu.sg",
  "isUser": true,
  "env": "PRD",
  "appId": "5678",
  "app": "PTS",
  "mod": "Admin Panel",
  "class": "AuthorizationController",
  "ver": "1.0.0",
  "ip": "192.168.0.2",
  "sip": "10.0.0.2",
  "server": "prodapps.nus.edu.sg",
  "level": "info",
  "event": "grant-role",
  "msg": "Authorization role updated.",
  "details": {
    "grantor": "m.tan@nus.edu.sg",
    "grantee": "j.ong@nus.edu.sg",
    "objt": "Role",
    "obj": "Admin"
  }
}
{
  "dt": "2024-10-03T11:20:30Z",
  "userid": "r.lim@nus.edu.sg",
  "isUser": true,
  "env": "QAT",
  "appId": "91011",
  "app": "uNivUS",
  "mod": "Student Services",
  "class": "DataAccessController",
  "ver": "4.0.1",
  "ip": "192.168.0.3",
  "sip": "10.0.0.3",
  "server": "qatapps.nus.edu.sg",
  "level": "warn",
  "event": "read-user-profile",
  "msg": "Sensitive data access detected.",
  "details": {
    "accId": "r.lim@nus.edu.sg",
    "objt": "UserProfile",
    "obj": "12345"
  }
}
{
  "dt": "2024-10-03T12:45:10Z",
  "userid": "system",
  "isUser": false,
  "env": "DEV",
  "appId": "13579",
  "app": "ConfigManager",
  "mod": "",
  "class": "ConfigUpdateService",
  "ver": "3.2.1",
  "ip": "192.168.0.4",
  "sip": "10.0.0.4",
  "server": "devapps.nus.edu.sg",
  "level": "debug",
  "event": "update-max-connections",
  "msg": "Configuration parameter updated.",
  "details": {
    "updId": "system",
    "obj": "MaxConnections",
    "val": "500"
  }
}
```

### H.4 Authentication log sample

```jsonl
{
  "dt": "2024-10-03T13:05:45Z",
  "userid": "j.smith@nus.edu.sg",
  "isUser": true,
  "env": "PRD",
  "appId": "9876",
  "app": "LoginPortal",
  "mod": "WebAuth",
  "class": "AuthController",
  "ver": "1.0.2",
  "ip": "192.168.1.1",
  "sip": "10.1.1.1",
  "server": "auth.nus.edu.sg",
  "event": "authn",
  "success": true,
  "mfa": true,
  "mfat": "TOTP"
}
{
  "dt": "2024-10-03T13:10:22Z",
  "userid": "r.doe@nus.edu.sg",
  "isUser": true,
  "env": "PRD",
  "appId": "9876",
  "app": "LoginPortal",
  "mod": "WebAuth",
  "class": "AuthController",
  "ver": "1.0.2",
  "ip": "192.168.1.2",
  "sip": "10.1.1.2",
  "server": "auth.nus.edu.sg",
  "event": "authn",
  "success": false,
  "failReason": "Password was incorrect",
  "mfa": false
}
```

## I) Language-specific implementation guidance

- Pair this skill with your language/framework logging skill for implementation details.
- For Java, use `.github/skills/java/logging/SKILL.md` for SLF4J/Logback syntax, logger declaration, MDC, and exception logging mechanics.
- Shape each log entry so its fields align with this NUS JSON contract.
- If the codebase already uses structured JSON logging, extend the existing structure rather than inventing a parallel schema.
- If the codebase does not yet emit JSON logs, do not replace the existing approach without explicit instruction; instead propose a migration path.

## J) Review checklist

- [ ] Log type chosen correctly: `ex`, `hbt`, domain-specific event code, or `authn`
- [ ] Common NUS fields present where applicable: `dt`, `userid`, `isUser`, `env`, `appId`, `app`, `mod`, `class`, `ver`, `ip`, `sip`, `server`
- [ ] `dt` uses ISO8601 UTC
- [ ] Logs are emitted as JSON objects suitable for `.jsonl`
- [ ] Business/security/configuration event codes are domain-specific, lowercase, and hyphen-separated where practical
- [ ] `evCode` is lowercase and has no spaces when used
- [ ] `details` contains structured, non-sensitive values only
- [ ] No confidential/PII/secrets are written into `msg`, `details`, or MDC
- [ ] Heartbeat is implemented hourly where required
- [ ] Authentication logs are separated logically from general event logs
- [ ] Language-specific implementation follows the relevant language/framework logging skill

