# Conversation API Documentation

## Base URL
```
/api/v1/conversations
```

## Authentication
Tất cả các endpoints đều yêu cầu authentication token trong header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Lấy danh sách conversation của user
**GET** `/api/v1/conversations`

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số lượng conversation mỗi trang (default: 20, max: 100)
- `type` (optional): Loại conversation ('direct' | 'group')
- `search` (optional): Tìm kiếm theo tên hoặc mô tả
- `sortBy` (optional): Sắp xếp theo ('lastMessageAt' | 'createdAt' | 'name')
- `sortOrder` (optional): Thứ tự sắp xếp ('asc' | 'desc')

**Example Request:**
```bash
GET /api/v1/conversations?page=1&limit=10&type=group&search=work&sortBy=lastMessageAt&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "_id": "conversation_id",
        "type": "group",
        "name": "Work Team",
        "description": "Team discussion",
        "avatarUrl": "https://example.com/avatar.jpg",
        "createdBy": "user_id",
        "isActive": true,
        "lastMessageAt": "2024-01-15T10:30:00Z",
        "lastMessage": {
          "messageId": "message_id",
          "content": "Hello everyone!",
          "senderId": "sender_id",
          "type": "text",
          "createdAt": "2024-01-15T10:30:00Z"
        },
        "settings": {
          "allowInvites": true,
          "showMembersList": true,
          "allowMemberMessages": true
        },
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "currentUserParticipant": {
          "userId": "user_id",
          "role": "admin",
          "joinedAt": "2024-01-01T00:00:00Z",
          "isMuted": false,
          "lastReadAt": "2024-01-15T10:30:00Z",
          "unreadCount": 0
        },
        "participantDetails": [
          {
            "userId": "user_id",
            "role": "admin",
            "joinedAt": "2024-01-01T00:00:00Z",
            "isMuted": false,
            "lastReadAt": "2024-01-15T10:30:00Z",
            "unreadCount": 0,
            "user": {
              "_id": "user_id",
              "displayName": "John Doe",
              "username": "johndoe",
              "avatarUrl": "https://example.com/user.jpg",
              "status": "online",
              "lastSeen": "2024-01-15T10:30:00Z"
            }
          }
        ],
        "lastMessageSender": {
          "_id": "sender_id",
          "displayName": "Jane Smith",
          "username": "janesmith",
          "avatarUrl": "https://example.com/jane.jpg"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Lấy chi tiết conversation
**GET** `/api/v1/conversations/:conversationId`

**Path Parameters:**
- `conversationId`: ID của conversation

**Example Request:**
```bash
GET /api/v1/conversations/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "conversation_id",
    "type": "direct",
    "name": null,
    "description": null,
    "avatarUrl": null,
    "createdBy": "user_id",
    "isActive": true,
    "lastMessageAt": "2024-01-15T10:30:00Z",
    "lastMessage": {
      "messageId": "message_id",
      "content": "Hi there!",
      "senderId": "sender_id",
      "type": "text",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "settings": {
      "allowInvites": true,
      "showMembersList": true,
      "allowMemberMessages": true
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "currentUserParticipant": {
      "userId": "user_id",
      "role": "member",
      "joinedAt": "2024-01-01T00:00:00Z",
      "isMuted": false,
      "lastReadAt": "2024-01-15T10:30:00Z",
      "unreadCount": 0
    },
    "participantDetails": [
      {
        "userId": "user_id",
        "role": "member",
        "joinedAt": "2024-01-01T00:00:00Z",
        "isMuted": false,
        "lastReadAt": "2024-01-15T10:30:00Z",
        "unreadCount": 0,
        "user": {
          "_id": "user_id",
          "displayName": "John Doe",
          "username": "johndoe",
          "avatarUrl": "https://example.com/user.jpg",
          "status": "online",
          "lastSeen": "2024-01-15T10:30:00Z"
        }
      }
    ],
    "lastMessageSender": {
      "_id": "sender_id",
      "displayName": "Jane Smith",
      "username": "janesmith",
      "avatarUrl": "https://example.com/jane.jpg"
    }
  }
}
```

### 3. Tạo conversation mới
**POST** `/api/v1/conversations`

**Request Body:**
```json
{
  "type": "group",
  "name": "Project Team",
  "description": "Team discussion for project",
  "participantIds": ["user_id_1", "user_id_2", "user_id_3"],
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Validation Rules:**
- `type`: Bắt buộc, phải là 'direct' hoặc 'group'
- `name`: Bắt buộc nếu type là 'group', tối đa 100 ký tự
- `description`: Tùy chọn nếu type là 'group', tối đa 500 ký tự
- `participantIds`: Bắt buộc, mảng các user ID hợp lệ
- `avatarUrl`: Tùy chọn, phải là URL hợp lệ

**Response:**
```json
{
  "success": true,
  "message": "Conversation created successfully",
  "data": {
    "_id": "new_conversation_id",
    "type": "group",
    "name": "Project Team",
    "description": "Team discussion for project",
    "avatarUrl": "https://example.com/avatar.jpg",
    "createdBy": "user_id",
    "isActive": true,
    "participants": [
      {
        "userId": "user_id",
        "role": "admin",
        "joinedAt": "2024-01-15T10:30:00Z",
        "isMuted": false,
        "lastReadAt": "2024-01-15T10:30:00Z",
        "unreadCount": 0
      }
    ],
    "settings": {
      "allowInvites": true,
      "showMembersList": true,
      "allowMemberMessages": true
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Cập nhật conversation
**PUT** `/api/v1/conversations/:conversationId`

**Path Parameters:**
- `conversationId`: ID của conversation

**Request Body:**
```json
{
  "name": "Updated Team Name",
  "description": "Updated description",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "settings": {
    "allowInvites": false,
    "showMembersList": true,
    "allowMemberMessages": true
  }
}
```

**Permissions:**
- Chỉ admin hoặc moderator mới có thể cập nhật conversation

**Response:**
```json
{
  "success": true,
  "message": "Conversation updated successfully",
  "data": {
    "_id": "conversation_id",
    "type": "group",
    "name": "Updated Team Name",
    "description": "Updated description",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "settings": {
      "allowInvites": false,
      "showMembersList": true,
      "allowMemberMessages": true
    },
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 5. Xóa conversation
**DELETE** `/api/v1/conversations/:conversationId`

**Path Parameters:**
- `conversationId`: ID của conversation

**Permissions:**
- Chỉ admin mới có thể xóa conversation

**Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Type must be either 'direct' or 'group'"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions to update conversation"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Conversation not found or access denied"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Direct conversation already exists",
  "data": {
    "_id": "existing_conversation_id"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Error details (only in development)"
}
```

## Notes

1. **Pagination**: API hỗ trợ pagination với giới hạn tối đa 100 conversations mỗi trang
2. **Search**: Tìm kiếm theo tên hoặc mô tả của conversation (chỉ áp dụng cho group conversations)
3. **Sorting**: Có thể sắp xếp theo lastMessageAt, createdAt, hoặc name
4. **Permissions**: 
   - Tất cả users có thể xem conversations họ tham gia
   - Chỉ admin/moderator có thể cập nhật conversation
   - Chỉ admin có thể xóa conversation
5. **Soft Delete**: Conversation bị xóa sẽ được đánh dấu isActive = false thay vì xóa hoàn toàn
6. **Direct Conversations**: Không thể tạo duplicate direct conversation giữa 2 users 