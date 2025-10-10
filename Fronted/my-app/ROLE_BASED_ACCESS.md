# Role-Based Page Access Implementation

## Overview
The medical management system now implements comprehensive role-based access control (RBAC) that restricts page access based on user roles. Users are automatically redirected to appropriate pages based on their role, and the sidebar menu shows only relevant options for each role.

## User Roles

### 1. Owner
**Full Access** - Complete system management capabilities
- **Dashboard**: Overview of all system metrics
- **Medicines**: Full medicine inventory management
- **Customers**: Customer database management
- **Billing**: Sales and billing operations
- **Reports**: All reporting features
- **Transactions**: Financial transaction history
- **Profit Analysis**: Business analytics and profit tracking
- **Purchases**: Complete purchase management system
- **Top 10 Medicines**: Best-selling medicine reports
- **Near Expiry Medicines**: Expiry tracking and alerts
- **Expired Medicines History**: Historical expiry data
- **Out-of-Stock Alerts**: Dynamic alerts for zero stock items
- **Supplier Registration**: Add new suppliers to the system

### 2. Employee
**Limited Access** - Basic operational capabilities
- **Dashboard**: Basic system overview
- **Medicines**: Medicine inventory viewing and basic management
- **Customers**: Customer database access
- **Billing**: Sales and billing operations
- **Reports**: Basic reporting features
- **Profile**: Personal profile management

### 3. Supplier
**Portal Access** - Supplier-specific features
- **Dashboard**: Supplier portal overview
- **My Profile**: Supplier profile management
- **Medical Owner**: Owner information and contact
- **Orders**: Current order management
- **Order History**: Historical order tracking

## Route Protection

### Route Components
- `PrivateRoute`: Requires authentication for all users
- `PublicRoute`: Only accessible when not authenticated
- `OwnerRoute`: Only accessible by users with "Owner" role
- `EmployeeRoute`: Only accessible by users with "Employee" role
- `SupplierRoute`: Only accessible by users with "Supplier" role
- `OwnerOrEmployeeRoute`: Accessible by both Owner and Employee roles

### Protected Routes

#### Common Routes (Owner + Employee)
```
/medicines - Medicine management
/customers - Customer management
/billing - Sales and billing
/reports - Basic reports
/profile - User profile
```

#### Owner-Only Routes
```
/transactions - Financial transactions
/profit-analysis - Business analytics
/top-medicines - Top selling medicines
/near-expiry - Expiry tracking
/out-of-stock - Stock alerts
/expired-medicines - Expiry history
/purchase - Purchase management
/purchase/create - Create purchases
/purchase/deliveries - Delivery tracking
/purchase/history - Purchase history
/purchase/payments - Payment management
/suppliers/register - Supplier registration
/owner/reports/* - Advanced owner reports
```

#### Supplier-Only Routes
```
/supplier/portal - Supplier dashboard
/supplier/profile - Supplier profile
/supplier/owner - Owner information
/supplier/orders - Order management
/supplier/order-history - Order history
```

## Navigation Behavior

### Home Route Logic
- **Suppliers**: Automatically redirected to `/supplier/portal`
- **Owners & Employees**: Redirected to main dashboard `/`

### Sidebar Menu
- **Dynamic Menu**: Shows different menu items based on user role
- **Role Indicator**: Displays current user role at the top of sidebar
- **Out-of-Stock Alerts**: Dynamically added to owner menu when zero stock items exist
- **Profile Access**: Available for Owner and Employee roles

### Access Control
- **Unauthorized Access**: Users trying to access restricted pages are redirected to their home page
- **Authentication Required**: All protected routes require valid authentication
- **Role Validation**: Each route validates user role before granting access

## Security Features

### Frontend Protection
- Route-level protection using React Router
- Component-level role checking
- Automatic redirects for unauthorized access
- Loading states during authentication checks

### Backend Integration
- JWT token-based authentication
- Role information embedded in JWT claims
- API endpoints protected by role-based security configuration

## Usage Examples

### For Owners
1. Login with Owner credentials
2. Access full system with all features
3. Manage purchases, suppliers, and advanced reports
4. View out-of-stock alerts and expiry tracking

### For Employees
1. Login with Employee credentials
2. Access basic operational features
3. Handle daily sales, customer management, and basic reporting
4. Cannot access financial analytics or purchase management

### For Suppliers
1. Login with Supplier credentials
2. Automatically redirected to supplier portal
3. Manage orders and view order history
4. Access supplier-specific information and tools

## Implementation Details

### Files Modified
- `src/App.jsx`: Added role-based route protection components
- `src/components/common/Sidebar.jsx`: Implemented role-based menu rendering
- `src/components/common/AuthContext.jsx`: Provides user role information

### Key Components
- `OwnerRoute`: Protects owner-only pages
- `EmployeeRoute`: Protects employee-only pages  
- `SupplierRoute`: Protects supplier-only pages
- `OwnerOrEmployeeRoute`: Allows access for both owner and employee roles

### Menu Configuration
- Role-specific menu arrays defined in Sidebar component
- Dynamic menu rendering based on user role
- Out-of-stock alerts integrated into owner menu
- Clean separation of concerns for each role

## Testing
To test the role-based access:
1. Create users with different roles (Owner, Employee, Supplier)
2. Login with each role and verify correct menu items appear
3. Try accessing restricted pages and verify redirects work
4. Check that out-of-stock alerts appear for owners when applicable

This implementation ensures that each user type sees only the features and pages relevant to their role, providing a secure and user-friendly experience tailored to their specific needs and permissions.

