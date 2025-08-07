# Slack Token Rotation Implementation Guide

## What is Token Rotation?

Token rotation is a security feature that makes your Slack access tokens expire every 12 hours instead of being permanent. Think of it like this:

- **Old way**: Your token works forever (like a permanent key to your house)
- **New way**: Your token expires every 12 hours (like a hotel key card that needs renewal)

## Why We Implemented Token Rotation?

### Security Benefits:
1. **Limited Exposure**: If someone steals your token, they only have 12 hours to use it
2. **Automatic Renewal**: Your app automatically gets new tokens before they expire
3. **One-time Refresh Tokens**: Each refresh token can only be used once, making them more secure
4. **Compliance**: Many security standards require token rotation

### Real-world Example:
- **Without rotation**: If a hacker gets your token, they can access your Slack forever
- **With rotation**: Even if they get your token, it expires in 12 hours, limiting the damage

## Key Concepts

- **Access Token**: Expires every 12 hours (43,200 seconds)
- **Refresh Token**: Used to get new access tokens (one-time use)
- **Token Exchange**: Converting long-lived tokens to rotatable tokens

## What We Just Implemented:

### 1. **Token Exchange System**
- Converts old permanent tokens to new expiring tokens
- Handles both new users and existing users

### 2. **Automatic Refresh Logic**
- Checks if tokens expire within 5 minutes
- Automatically gets new tokens using refresh tokens
- Stores new tokens in the database

### 3. **Graceful Error Handling**
- If refresh fails, prompts user to re-authenticate
- Handles various error scenarios

## Implementation Steps

### 1. Enable Token Rotation in Slack App

1. Go to your Slack App settings: https://api.slack.com/apps
2. Select your app
3. Go to "OAuth & Permissions" in the left sidebar
4. Scroll down to find "Token Rotation" section
5. **Turn on token rotation** (⚠️ **Warning**: This cannot be turned off once enabled)
6. Save changes

### 2. Exchange Long-Lived Tokens

For existing users who already have long-lived tokens, you need to exchange them for rotatable tokens.

**API Endpoint:** `POST /api/auth/exchange-tokens/:userId`

**No Payload Required!** This endpoint doesn't need any request body. It uses the user ID from the URL.

**Example with cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/exchange-tokens/U09650HHQV8 \
  -H "Content-Type: application/json"
```

**Example with Postman:**
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/auth/exchange-tokens/U09650HHQV8`
3. **Headers**: `Content-Type: application/json`
4. **Body**: None (leave empty)

**Response:**
```json
{
  "success": true,
  "message": "Successfully exchanged tokens for token rotation",
  "expiresIn": 43200,
  "expiresAt": "2024-01-07T10:30:00.000Z"
}
```

### 3. Automatic Token Refresh

The system now automatically:
- Checks if tokens are expired or will expire within 5 minutes
- Uses refresh tokens to get new access tokens
- Stores new refresh tokens (they're one-time use)
- Handles token exchange for users without refresh tokens

## When to Use Token Exchange:

### **Scenario 1: Existing Users (Your Current Situation)**
You have users who already authenticated before token rotation was enabled. They have old permanent tokens that need to be converted.

**When**: Right after enabling token rotation in your Slack app
**How**: Call the exchange endpoint for each existing user

### **Scenario 2: New Users**
New users automatically get rotatable tokens during OAuth, so no exchange needed.

### **Scenario 3: Token Refresh**
The system automatically refreshes tokens before they expire (every 12 hours).

## Token Flow

### For New Users:
1. User authenticates via OAuth
2. System receives access token + refresh token
3. Tokens are stored in database
4. System automatically refreshes tokens before expiration

### For Existing Users:
1. User tries to use the app
2. System detects no refresh token
3. System exchanges long-lived token for rotatable tokens
4. New tokens are stored and used

### Token Refresh Process:
1. System checks if token expires within 5 minutes
2. If yes, uses refresh token to get new tokens
3. New access token + new refresh token are stored
4. Old refresh token is automatically revoked by Slack

## Token Lifecycle:

```
1. User authenticates → Gets access token + refresh token
2. Access token expires in 12 hours
3. System detects expiration (5 min before)
4. Uses refresh token to get new access token + new refresh token
5. Old refresh token is automatically revoked by Slack
6. Process repeats every 12 hours
```

## What Happens Behind the Scenes:

### **For Your Current User (U09650HHQV8):**
1. **Current state**: Has old permanent token
2. **After exchange**: Gets new expiring token + refresh token
3. **Future**: System automatically refreshes every 12 hours

### **Database Changes:**
```javascript
// Before exchange
{
  accessToken: "xoxp-old-permanent-token",
  refreshToken: null,
  tokenExpiresAt: "2025-08-06T14:26:03.075Z" // Far future
}

// After exchange
{
  accessToken: "xoxe.xoxp-new-expiring-token",
  refreshToken: "xoxe-1-new-refresh-token",
  tokenExpiresAt: "2024-01-07T10:30:00.000Z" // 12 hours from now
}
```

## API Endpoints

### Authentication
- `GET /api/auth/initiate` - Start OAuth flow
- `GET /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/exchange-tokens/:userId` - Exchange tokens for rotation
- `DELETE /api/auth/logout/:userId` - Logout user

### Messages
- `GET /api/messages/channels/:userId` - Get user's channels
- `POST /api/messages/send/:userId` - Send message
- `POST /api/messages/schedule/:userId` - Schedule message
- `GET /api/messages/scheduled/:userId` - Get scheduled messages
- `DELETE /api/messages/scheduled/:messageId` - Cancel scheduled message

## Error Handling

The system handles various token-related errors:

- **Token expired**: Automatically refreshes
- **No refresh token**: Attempts token exchange
- **Exchange failed**: Prompts user to re-authenticate
- **Refresh failed**: Prompts user to re-authenticate

## Security Benefits

1. **Limited exposure**: Tokens expire every 12 hours
2. **Automatic rotation**: No manual intervention needed
3. **One-time refresh tokens**: Each refresh token can only be used once
4. **Graceful degradation**: System handles token failures gracefully

## Testing

To test token rotation:

1. Enable token rotation in your Slack app
2. Use the exchange endpoint for existing users:
   ```bash
   POST http://localhost:5000/api/auth/exchange-tokens/U09650HHQV8
   ```
3. Wait for tokens to expire (or manually expire them)
4. Verify automatic refresh works
5. Test API calls continue to work

## Monitoring

The system logs token operations:
- Token exchange attempts
- Token refresh attempts
- Success/failure of token operations
- Token expiration times

Check your server logs for these messages to monitor token rotation:
- "No refresh token found, attempting to exchange long-lived token..."
- "Successfully exchanged long-lived token for rotatable tokens"
- "Refreshing access token..."
- "Successfully refreshed access token"

## Next Steps:

1. **Enable token rotation** in your Slack app settings
2. **Call the exchange endpoint** for your user
3. **Test the system** by making API calls
4. **Monitor the logs** to see token rotation in action

The beauty of this implementation is that once you exchange the tokens, everything happens automatically! Your app will continue working seamlessly with rotating tokens every 12 hours. 