# 🧠 Rule Engine Platform (NestJS + DSL)

A powerful, extensible rule engine platform built with NestJS. This system evaluates custom-defined rules written in YAML/DSL to detect suspicious activity (e.g. Money Laundering, MEV Attacks, Rug Pulls) on transaction datasets. It supports real-time alerts via WebSocket, flexible actions like webhook/email, and persistent alert history.

---

## 🌐 Deployment

The Rule Engine Platform is deployed and accessible via the following link:

[🚀 Access the Rule Engine Platform](backend-production-bdf7.up.railway.app)

## 🚀 Features

- 🧩 Custom YAML/JSON DSL rule format
- 🧠 Support for:
  - `aggregate` conditions (`sum`, `count`, `avg`, etc.)
  - `plain` field conditions
  - `exists` checks
  - Logical nesting: `and`, `or`, `not`
- 🔁 Cron-based automatic rule evaluation (every rule has its own interval)
- 📬 Webhook and Email actions (user-customizable templates)
- 🧠 Alert history stored on match
- 🌐 Real-time alert push via WebSocket
- 🛠️ Unified parser for both YAML and JSON DSL

---

## 📄 DSL Format (YAML or JSON)

```yaml
- name: Detect Money Laundering
  user_id: 'user123'
  source: '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12'
  interval: '5 * * * * *'
  when:
    and:
      - type: plain
        field: strategy_snap_shot_items.weighted_edges[].hash
        operator: '='
        value: '2304959'

      - type: plain
        field: strategy_snap_shot_items.weighted_edges[].weight
        operator: '>'
        value: 0.15

      - type: plain
        field: strategy_snap_shot_items.r.key
        operator: 'eq'
        value: '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12'

      - type: plain
        field: strategy_snap_shot_items.weighted_edges[]
        operator: 'not_containsa'
        value: 'APT_0x1::aptos_coin::AptosCoin'

  aggregate:
    - type: aggregate
      field: strategy_snap_shot_items.weighted_edges[].weight
      op: sum
      operator: '>'
      value: 0.25629205900245483
    - type: aggregate
      field: strategy_snap_shot_items.weighted_edges[].hash
      op: count
      operator: '>'
      value: 50

  then:
    - type: tag
      value: 'Money Laundering'
    - type: notify
      message: 'Potential money laundering detected.'
    - type: email
      to: ['22021217@vnu.edu.vn']
      subject: 'Alert: Money Laundering Detected'
      body: '<p>We have detected a potential money laundering activity in your account. Please review your transactions.</p>'
  tags: ['money', 'servere']
  enabled: true
  is_template: false
```

#### When:

Base condition for query
| Condition Type | Description | Field use | Operator Examples |
|----------------|---------------------------------|--------------|-------------------------|
| Plain | Normal field comparison | `operator` | `=`, `!=`, `<`, `>`, `<=`, `>=` |
| Exists | Boolean field existence check | `operator` | `true`, `false` |

---

| Field Type       | Description                                      | Example                    |
| ---------------- | ------------------------------------------------ | -------------------------- |
| Primitive/Object | Represents a single value or a nested object     | `field.a`                  |
| Array            | Represents a list of values/objects              | `field[]`                  |
| In Array         | Represents a specific field within an array      | `field[].b`                |
| Key/Value        | Represents key-value pairs in array-like objects | `field.key`, `field.value` |

---

| Operator                             | Description                           |
| ------------------------------------ | ------------------------------------- |
| `<=`, `>=`, `<`, `>`, `=`, `!=`      | Base comparison operators             |
| `lte`, `gte`, `lt`, `gt`, `eq`, `ne` | Alternative base comparison operators |
| `contains`                           | Compares partial object               |
| `not_contains`                       | Compares partial object (negated)     |

| Value Type | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| Object     | Used with operators `contains`, `not_contains`, `eq`, or `ne`.     |
| Primitive  | Used with other operators such as `=`, `!=`, `<`, `>`, `<=`, `>=`. |

#### Aggregate:

If no and:/or: notation, auto assume it is and

Supports operations such as `sum`, `min`, `max`, `count`, and `avg`.

```yaml
aggregate:
  - type: aggregate
    field: strategy_snap_shot_items.weighted_edges[].weight
    op: sum
    operator: '>'
    value: 0.25629205900245483
  - type: aggregate
    field: strategy_snap_shot_items.weighted_edges[].hash
    op: count
    operator: '>'
    value: 50
```

## 🛠️ Engine Function Documentation

### Overview

The engine function is the core component responsible for evaluating rules against transaction datasets. It processes rules defined in YAML/DSL format and triggers actions based on the evaluation results.

---

### 🔧 Engine Workflow

1. **Rule Parsing**:

- The engine parses rules written in YAML/DSL format into an internal representation.
- Supports logical operators (`and`, `or`, `not`) and condition types (`aggregate`, `plain`, `exists`).

2. **Dataset Query**:

- The engine evaluates rules against incoming transaction datasets.
- Handles aggregate conditions (`sum`, `count`, `avg`) and field-specific checks.
- Return the data match

3. **Action Execution**:

- Executes actions (`webhook`, `email`, `tag`) when rules are triggered.
- Supports user-defined templates for webhook and email actions.

4. **Alert Management**:

- Stores alert history for triggered rules.
- Pushes real-time alerts via WebSocket.

---

### 🔍 Rule Evaluation Details

#### Supported Condition Types:

- **Aggregate**:
  - Evaluates aggregate metrics like `sum`, `count`, `avg`.
  - Example:
  ```yaml
  type: aggregate
  field: value
  op: sum
  operator: '>'
  value: 1000000
  ```
- **Plain**:
  - Checks individual fields against a condition.
  - Example:
  ```yaml
  type: plain
  field: tx_count
  operator: '>'
  value: 50
  ```
- **Exists**:
  - Verifies the existence of a field.
  - Example:
  ```yaml
  type: exists
  field: suspicious_contract
  operator: true
  ```

#### Logical Operators:

- **AND**: All conditions must be true.
- **OR**: At least one condition must be true.
- **NOT**: Negates the condition.

---

### 🔔 Actions

#### Supported Actions:

- **Webhook**:
  - Sends HTTP requests to a specified endpoint.
  - Example:
  ```yaml
  type: webhook
  group: 'default'
  params:
    headers:
      X-API-Key: 'your-api-key'
    body: |
      {
       "alert": "{{rule.name}}",
       "message": "{{context.message}}"
      }
  ```
- **Email**:
  - Sends email notifications.
  - Example:
  ```yaml
  type: email
  to: '{{user.email}}'
  subject: '🚨 Rule Triggered'
  body: 'Rule {{rule.name}} triggered on {{context.timestamp}}'
  ```

---

### 🕒 Cron-Based Rule Evaluation

Each rule can have its own evaluation interval defined in the `interval` field. The engine automatically evaluates rules based on their intervals.

Example:

```yaml
interval: '* * * * * *'
```

---

### 🌐 Real-Time Alerts

The engine supports real-time alert notifications via WebSocket, enabling instant updates for triggered rules.

---

### 📦 Persistent Alert History

Triggered alerts are stored in the system for future reference and analysis. This ensures traceability and auditability of rule evaluations.

## 🔌 Socket Connection Document

#### Prerequisites:

- **User ID**: Required to establish a connection.

#### Event Types:

1. **Alert**:

- Triggered when a rule matches and generates an alert.

2. **Error**:

- Occurs in the following scenarios:
  - **Misconfigured Rule**: The rule is not supported or improperly defined.
  - **Execution Issue**: An error occurred while running the rule.

## 🌐 API Gateway Documentation

### Base URL

```
backend-production-bdf7.up.railway.app
```

### Endpoints

#### **Docs**

```
backend-production-bdf7.up.railway.app/api
```

#### 1. **Get All Rules**

- **URL:** `rule-engine/rules`
- **Method:** `GET`
- **Description:** Fetch all defined rules.
- **Response:**
  ```json
  [
    {
      "id": "rule-ml-v1",
      "name": "Detect Money Laundering",
      "enabled": true,
      "interval": "type cron"
    },
    ...
  ]
  ```

#### 2. **Get Rule by ID**

- **URL:** `rule-engine/rules/{id}`
- **Method:** `GET`
- **Description:** Fetch a specific rule by its ID.
- **Response:**
  ```json
  {
    "id": "rule-ml-v1",
    "name": "Detect Money Laundering",
    "enabled": true,
    "interval": "type cron",
    "when": { ... },
    "then": { ... }
  }
  ```

#### 3. **Create Rule**

- **URL:** `rule-engine/rules`
- **Method:** `POST`
- **Description:** Create a new rule.
- **Request Body:**
  ```json
  {
    "id": "rule-ml-v2",
    "name": "New Rule",
    "enabled": true,
    "interval": "type cron",
    "when": { ... },
    "then": { ... }
  }
  ```
- **Response:**
  ```json
  {
    "message": "Rule created successfully",
    "ruleId": "rule-ml-v2"
  }
  ```

#### 4. **Update Rule**

- **URL:** `rule-engine/rules/{id}`
- **Method:** `PUT`
- **Description:** Update an existing rule.
- **Request Body:**
  ```json
  {
    "name": "Updated Rule Name",
    "enabled": false,
    "interval": "cron",
    "when": { ... },
    "then": { ... }
  }
  ```
- **Response:**
  ```json
  {
    "message": "Rule updated successfully"
  }
  ```

#### 5. **Delete Rule**

- **URL:** `rule-engine/rules/{id}`
- **Method:** `DELETE`
- **Description:** Delete a rule by its ID.
- **Response:**
  ```json
  {
    "message": "Rule deleted successfully"
  }
  ```

#### 6. **Get rules by user id**

- **URL:** `rule-engine/rules/user/{userId}`
- **Method:** `GET`
- **Description:** Get list of rule by user

#### 7. **Get Alert History**

- **URL:** `alert-engine/alerts`
- **Method:** `GET`
- **Description:** Fetch all alerts generated by rules.
- **Response:**
  ```json
  [
    {
      "id": "alert-123",
      "ruleId": "rule-ml-v1",
      "timestamp": "2023-10-01T12:00:00Z",
      "details": { ... }
    },
    ...
  ]
  ```

#### 8. **Get Alert by ID**

- **URL:** `alert-engine/alerts/{id}`
- **Method:** `GET`
- **Description:** Fetch details of a specific alert.
- **Response:**
  ```json
  {
    "id": "alert-123",
    "ruleId": "rule-ml-v1",
    "timestamp": "2023-10-01T12:00:00Z",
    "details": { ... }
  }
  ```

#### 9. **Get Alert by user ID**

- **URL:** `alert-engine/alerts/user/{id}`
- **Method:** `GET`
- **Description:** Fetch details of a specific alert.
- **Response:**
  ```json
  {
    "id": "alert-123",
    "ruleId": "rule-ml-v1",
    "timestamp": "2023-10-01T12:00:00Z",
    "details": { ... }
  }
  ```

#### 10. **Get Alert by rule ID**

- **URL:** `alert-engine/alerts/rule/{id}`
- **Method:** `GET`
- **Description:** Fetch details of a specific alert.
- **Response:**
  ```json
  {
    "id": "alert-123",
    "ruleId": "rule-ml-v1",
    "timestamp": "2023-10-01T12:00:00Z",
    "details": { ... }
  }
  ```

---

