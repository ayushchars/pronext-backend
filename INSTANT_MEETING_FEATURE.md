# ⚡ Instant Meeting Feature

## Overview
The meeting creation system now supports **two types of meetings**:

### 1. **Scheduled Meetings** (Default)
- Meeting starts at a future date/time
- Users know exactly when to join
- Can plan ahead

### 2. **Instant Meetings** (NEW ✨)
- Meeting starts **immediately** (at creation time)
- Perfect for urgent/ad-hoc meetings
- Participants can join right away

---

## Backend Implementation

### Meeting Creation Endpoint
**POST `/api/admin/meeting/create`**

#### Request Body (Scheduled Meeting):
```json
{
  "title": "Weekly Team Sync",
  "description": "Weekly team synchronization meeting",
  "scheduledAt": "2025-12-27T14:30:00Z",
  "duration": 60,
  "topic": "Team Update",
  "allowedSubscriptionTiers": ["Basic", "Premium", "Pro"]
}
```

#### Request Body (Instant Meeting - NEW):
```json
{
  "title": "Emergency Discussion",
  "description": "Urgent team discussion",
  "duration": 30,
  "topic": "Crisis Management",
  "isInstant": true
}
```

**Note:** When `isInstant: true`, `scheduledAt` is NOT required and is automatically set to the current time.

---

## Controller Logic Changes

### Before:
```javascript
// Required scheduledAt in the future
if (!title || !scheduledAt || !duration) {
  return ErrorResponse(res, "Title, scheduled time, and duration are required");
}

if (new Date(scheduledAt) <= new Date()) {
  return ErrorResponse(res, "Meeting must be scheduled in the future");
}
```

### After:
```javascript
// scheduledAt required only for scheduled meetings
if (!title || !duration) {
  return ErrorResponse(res, "Title and duration are required");
}

// For non-instant meetings, scheduledAt is required
if (!isInstant && !scheduledAt) {
  return ErrorResponse(res, "Scheduled time is required for non-instant meetings");
}

// For instant meetings, set time to now
if (isInstant) {
  meetingScheduledAt = new Date().toISOString();
}

// Only validate future time for scheduled meetings
if (!isInstant && new Date(meetingScheduledAt) <= new Date()) {
  return ErrorResponse(res, "Meeting must be scheduled in the future");
}
```

---

## Database Schema Update

### New Field in Meeting Model:
```javascript
isInstant: {
  type: Boolean,
  default: false,
  description: "Indicates if meeting was created as instant (starts immediately)"
}
```

### Stored Meeting Data:
```json
{
  "_id": "...",
  "title": "Emergency Discussion",
  "scheduledAt": "2025-12-26T18:45:23.123Z",  // Set to creation time
  "duration": 30,
  "isInstant": true,
  "status": "scheduled",  // Will become "ongoing" when started
  "createdAt": "2025-12-26T18:45:23.123Z",
  "zoomMeetingId": "...",
  "zoomLink": "...",
  ...
}
```

---

## API Usage Examples

### Example 1: Create Instant Meeting
```bash
curl -X POST http://localhost:5000/api/admin/meeting/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Huddle",
    "description": "Quick sync about project status",
    "duration": 15,
    "topic": "Project Status",
    "isInstant": true
  }'
```

**Response:**
```json
{
  "status": 1,
  "message": "Meeting created successfully",
  "data": {
    "_id": "675a1234567890",
    "title": "Team Huddle",
    "scheduledAt": "2025-12-26T18:50:00.000Z",
    "duration": 15,
    "isInstant": true,
    "zoomLink": "https://zoom.us/wc/join/123456789",
    "zoomPasscode": "abc123",
    "status": "scheduled"
  }
}
```

### Example 2: Create Scheduled Meeting
```bash
curl -X POST http://localhost:5000/api/admin/meeting/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Annual Review",
    "description": "Annual performance review meeting",
    "scheduledAt": "2025-12-30T10:00:00Z",
    "duration": 60,
    "topic": "Performance Review"
  }'
```

---

## Meeting Status Flow

### Instant Meetings:
```
Creation → "scheduled" (with scheduledAt = now) → "ongoing" → "completed"
```

### Scheduled Meetings:
```
Creation → "scheduled" (with future scheduledAt) → "ongoing" → "completed"
```

Both follow the same lifecycle; the difference is just the initial `scheduledAt` time.

---

## Use Cases

### When to Use Instant Meetings:
✅ Emergency meetings  
✅ Quick team huddles  
✅ Spontaneous discussions  
✅ Ad-hoc stand-ups  
✅ Crisis management calls  

### When to Use Scheduled Meetings:
✅ Regular team meetings  
✅ Training sessions  
✅ Planned presentations  
✅ Recurring meetings  
✅ Formal reviews  

---

## Validation Rules

| Scenario | Requirement | Result |
|----------|-------------|--------|
| `isInstant: true` | `scheduledAt` NOT needed | ✅ Uses current time |
| `isInstant: true` | `duration` required | ✅ Must be 15-480 minutes |
| `isInstant: false` | `scheduledAt` required | ✅ Must be in future |
| `isInstant: false` | `scheduledAt` in past | ❌ Error |
| Both types | `title` required | ✅ Required |
| Both types | `duration` 15-480 mins | ✅ Required |

---

## Frontend Integration (When Needed)

### Checkbox Option in Meeting Creation Form:
```jsx
<label>
  <input type="checkbox" name="isInstant" />
  Create Instant Meeting (starts now)
</label>
```

When checked:
- Hide the date/time picker
- Show "Meeting will start immediately" message
- Disable `scheduledAt` validation

---

## Important Notes

1. **Instant meetings still use Zoom**: The real Zoom API is called with the current time
2. **Status is "scheduled"**: Even instant meetings start with "scheduled" status (not "ongoing") until the meeting actually starts
3. **No date picker needed**: For instant meetings, no need to select date/time
4. **Duration still applies**: Instant meetings still have a duration (15-480 minutes)
5. **User can still join immediately**: The Zoom link is available as soon as the meeting is created

---

## Testing

### Test Case 1: Create Instant Meeting
```
Input: title="Test", duration=30, isInstant=true
Expected: Meeting created with scheduledAt = now
Result: ✅ Users can join immediately
```

### Test Case 2: Create Scheduled Meeting
```
Input: title="Test", scheduledAt="2025-12-27T14:00:00Z", duration=60
Expected: Meeting created with future scheduledAt
Result: ✅ Visible in meetings list
```

### Test Case 3: Create Instant Without Duration
```
Input: title="Test", isInstant=true
Expected: Error (duration required)
Result: ✅ Proper validation
```

---

## Summary

✅ Instant meetings: `POST /api/admin/meeting/create` with `isInstant: true`  
✅ Scheduled meetings: `POST /api/admin/meeting/create` with `scheduledAt` and `isInstant: false` (or omitted)  
✅ Database field: `isInstant` boolean flag added  
✅ Validation: Flexible based on meeting type  
✅ User experience: Select meeting type when creating
