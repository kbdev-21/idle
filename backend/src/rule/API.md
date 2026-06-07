# Pragmatic HTTP API Guidelines

## I. JSON Responses

If the initial intent is just simple collection queries with only offset/limit - which is totally fine for most projects, return the **raw data** directly.

However, if the requirement is to support exactly page-based pagination, wrap **all** the whole app's response data **consistently** using this example structure:

```json
{
  "data": [],
  "pagination": {
    "total": 100,
    "offset": 0,
    "limit": 10
  }
  // other fields if needed
}
```

## II. GET API endpoints

### 1. Canonical Resource Lookup

**Explain:** Fetching a single entity via its primary ID

**Naming rule:** `GET /users/{userId}`, `GET /wallets/{walletId}`

**Response data:** **One** single object or 404 error

### 2. Alternate Unique Lookup

**Explain:** Fetching a single entity via its **unique** field

**Naming rule:** `GET /users/by-username/{username}`, `GET /wallets/by-user-id/{userId}`

**Response data:** **One** single object or 404 error

### 3. Collection Filtering Query

**Explain:** Querying a list of resources based on criteria or relations

**Naming rule:** `GET /orders?storeId=abcxyz&search=adam&offset=0&limit=10&sortBy=finalPrice&sortDir=DESC`

**Response data:** An **array** of objects (can be an empty [])

### 4. Nested Ownership Query

**Explain:** Fetching a collection scoped to a parent resource, when the child cannot meaningfully exist without the parent

**Rules:**
- Max **2 levels** deep
- Only **pagination/sorting** params allowed (`offset`, `limit`, `sortBy`, `sortDir`). If business filters are needed → use a flat Collection Filtering Query.

**Naming rule:** `GET /users/{userId}/addresses?offset=0&limit=10`

**Response data:** An **array** of objects (can be an empty [])

**Avoid:**
- `GET /stores/{storeId}/orders` *(orders outlive stores - not a true ownership relationship)*
- `GET /stores/{storeId}/orders/{orderId}/items` *(3 levels deep)*
- `GET /users/{userId}/addresses?city=HCM&type=HOME` *(business filters)*

### 5. The `/me` alias

**Explain:** Use `/me` strictly as a semantic alias for `currentUserId` to avoid ambiguity.

**Avoid:** `GET /wallets/me` *(Ambiguous, returns a single wallet or a list of wallets?)*

**Recommend:**
- `GET /wallets/by-user-id/me` _(Alternate Unique Lookup, returns a single wallet)_
- `GET /users/me` _(acceptable with `me` as `currentUserId`)_

## III. POST API endpoints

Unlike `GET` endpoints, `POST` has more many use cases, which leads to much more flexibility. There are no strict rules, just follow these principles:

### 1. Simple Create

**Explain:** Creating a new resource

**Naming rule:** `POST /users`, `POST /orders`

**Request body:** A `CreateResourceRequest` DTO, which contains fields that relevant to the creation

**Response data:** The **created** object

### 2. Bulk Create

**Explain:** Creating multiple resources in a single request.

**Naming rule:** `POST /users/bulk`, `POST /products/bulk`

**Request body:** An **array** of `CreateResourceRequest` DTOs.

**Response data:** An **array** of created objects.

### 3. Action Endpoint

**Explain:** Execute an operation that isn't a simple CRUD, which usually has side effects or complex business logic.

**Naming rule:** No specific one, flexibility is allowed. But usually use a verb phrase to represent the action after the resources path that relative to it .

**Examples:**
- `POST /wallets/{walletId}/adjust` _(change the balance, create a transaction history, ...)_
- `POST /transactions/{transactionId}/init` _(initialize a multi-step transaction flow)_
- `POST /payments/{paymentId}/refund` _(trigger a refund request and its following steps)_

**Request body/Path params/Query params:** Flexible - include the data relevant to the action

**Response data:** The affected resource, or an object provides information about the action

## IV. PUT/PATCH API endpoints

Prefer using `PATCH` for update operations (partial update).

`PUT` is only allowed for simple objects (< 10 fields), where the entire resource can be safely and predictably replace.

### Why avoid PUT most cases?

- **Ambiguous contract:** Clients don't know which fields to send — required, optional, or backend-managed.
- **Unpredictable overwrites:** Omitting a field may silently null it out, causing unintended data loss or side effects.

### 1. Simple Partial Update

**Explain:** Partially update a resource's allowed fields

**Naming rule:** `PATCH /users/{userId}`, `PATCH /orders/{orderId}`

**Note:** Must handle `null` fields (clear the value) and absent fields (leave it untouched) correctly.

**Request body:** An `UpdateResourceRequest` DTO, which contains only the fields that this endpoint explicitly allows to be updated.

**Response data:** The **updated** object

### 2. Complex Update → Use POST Action Endpoint instead

If the update involves heavy business logic, side effects, or multiple resources, **do not use PATCH/PUT**.

Use a `POST` Action Endpoint mentioned above instead.

**Examples:**
- `POST /users/{userId}/deactivate` *(not `PATCH /users/{userId}` with `{ status: "inactive" }`)*

## V. Conclusion

The final goal of these principles:
- **Every endpoint is clear and predictable:** same patterns, same conventions
- **Endpoint paths are self-describing:** the method, resource, and intent are understandable at a glance
- **Business logic stays out of CRUD:** simple endpoints stay simple; complexity is explicit via Action Endpoints.
