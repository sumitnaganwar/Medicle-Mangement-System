# Authentication Persistence

## Overview
The application now implements persistent authentication that allows users to stay logged in across browser sessions without having to login repeatedly.

## How It Works

### 1. Token Storage
- JWT tokens are stored in `localStorage` with the key `auth_token`
- User data is stored in `localStorage` with the key `auth_user`
- Tokens expire after 24 hours (configurable in backend)

### 2. Authentication Context
- `AuthContext` automatically initializes from stored tokens on app startup
- Validates existing tokens by fetching user profile
- Provides loading state during initialization
- Handles token refresh and user data hydration

### 3. Route Protection
- `PrivateRoute` component protects authenticated routes
- `PublicRoute` component redirects authenticated users away from login/register
- Loading spinner shown during authentication state initialization

### 4. API Integration
- Axios interceptors automatically attach tokens to requests
- Handles 401 responses by clearing invalid tokens
- Prevents redirect loops on login/register pages

## Key Features

✅ **Persistent Login**: Users stay logged in across browser sessions
✅ **Automatic Token Validation**: Invalid tokens are cleared automatically  
✅ **Loading States**: Smooth UX during authentication checks
✅ **Route Protection**: Proper access control for all pages
✅ **Logout Functionality**: Clean logout with token clearing
✅ **Error Handling**: Graceful handling of authentication errors

## Usage

### For Users
1. Login once with your credentials
2. Stay logged in for 24 hours (or until logout)
3. Access all pages without re-authentication
4. Use the logout button in the header to sign out

### For Developers
- Authentication state is managed by `AuthContext`
- Use `useAuth()` hook to access auth state
- Tokens are automatically managed by the API service
- No manual token handling required in components

## Security Notes
- Tokens expire after 24 hours for security
- Invalid tokens are automatically cleared
- All API requests include proper authorization headers
- Sensitive user data is properly sanitized

