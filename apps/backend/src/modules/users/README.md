# Users Module - Profile Management

This module provides comprehensive user profile management functionality, including user-facing endpoints for profile updates, password changes, and address management.

## New Endpoints Added (Task 5)

### Profile Management

#### `PATCH /users/profile`

- **Description**: Update current user's profile information
- **Authentication**: Required (JWT)
- **Body**: `UpdateCurrentUserDto`
- **Features**:
  - Email uniqueness validation
  - Updates names, surnames, phone, dateOfBirth
  - Returns updated user profile

#### `PATCH /users/password`

- **Description**: Change current user's password
- **Authentication**: Required (JWT)
- **Body**: `ChangePasswordDto`
- **Features**:
  - Validates current password
  - Minimum 6 characters for new password
  - Secure password hashing with bcrypt

### Address Management

#### `GET /users/addresses`

- **Description**: Get all addresses for current user
- **Authentication**: Required (JWT)
- **Returns**: Array of user addresses ordered by default status

#### `POST /users/addresses`

- **Description**: Create new address for current user
- **Authentication**: Required (JWT)
- **Body**: `CreateUserAddressDto`
- **Features**:
  - Automatic default address management
  - Full address validation

#### `PATCH /users/addresses/:addressId`

- **Description**: Update specific address for current user
- **Authentication**: Required (JWT)
- **Body**: `UpdateUserAddressDto`
- **Features**:
  - Ownership validation (user can only update their own addresses)
  - Default address management

#### `DELETE /users/addresses/:addressId`

- **Description**: Delete specific address for current user
- **Authentication**: Required (JWT)
- **Features**:
  - Ownership validation
  - Permanent deletion

## DTOs

### `UpdateCurrentUserDto`

```typescript
{
  email?: string;        // Validated for uniqueness
  names?: string;
  surnames?: string;
  phone?: string;
  dateOfBirth?: string;  // ISO date string
}
```

### `ChangePasswordDto`

```typescript
{
  currentPassword: string;
  newPassword: string; // Minimum 6 characters
}
```

## Requirements Fulfilled

- ✅ **7.1**: User can access their profile information (GET /users/me)
- ✅ **7.2**: User can update their profile with validation (PATCH /users/profile)
- ✅ **7.3**: User can change password with current password validation (PATCH /users/password)
- ✅ **7.4**: Email uniqueness validation when updating profile

## Security Features

- JWT authentication required for all endpoints
- Password validation using bcrypt
- Email uniqueness checks
- User ownership validation for addresses
- Input validation using class-validator

## Error Handling

- **400**: Invalid input data or current password incorrect
- **401**: Authentication required
- **404**: Resource not found (user or address)
- **409**: Email already in use by another user

## Usage Examples

### Update Profile

```bash
PATCH /users/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "names": "John",
  "surnames": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890"
}
```

### Change Password

```bash
PATCH /users/password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

### Add Address

```bash
POST /users/addresses
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "country": "Mexico",
  "stateProvice": "CDMX",
  "city": "Mexico City",
  "postalCode": "06100",
  "address": "Av. Reforma 123",
  "addressLine": "Apt 4B",
  "isDefault": true
}
```
