# Test Users Guide - Role-Based Access Testing

## Default Test Users

After restarting your backend application, you'll have the following test users available:

### 1. Owner User (Full Access)
- **Email**: `owner@pharmacy.local`
- **Password**: `owner123`
- **Role**: Owner
- **Access**: Full system access including purchases, suppliers, advanced reports, financial analytics

### 2. Employee User (Limited Access)
- **Email**: `employee@pharmacy.local`
- **Password**: `employee123`
- **Role**: Employee
- **Access**: Basic operations - medicines, customers, billing, basic reports

### 3. Supplier User (Portal Access)
- **Email**: `supplier@pharmacy.local`
- **Password**: `supplier123`
- **Role**: Supplier
- **Access**: Supplier portal features only

### 4. Additional Owner User
- **Email**: `sumitnaganwar45@gmail.com`
- **Password**: `password123`
- **Role**: Owner
- **Access**: Full system access

## How to Test Different Roles

### Step 1: Restart Backend Application
1. Stop your Spring Boot application
2. Start it again to load the new test users
3. The DataSeeder will automatically create the test users if they don't exist

### Step 2: Test Each Role
1. **Logout** from current session
2. **Login** with different credentials to test each role
3. **Observe** the different menu items and page access

### Step 3: Expected Behavior by Role

#### Owner Login (`owner@pharmacy.local` / `owner123`)
- **Sidebar Menu**: Full menu with all features
- **Pages Accessible**: All pages including purchases, suppliers, advanced reports
- **Home Redirect**: Goes to main dashboard
- **Features**: Can manage everything in the system

#### Employee Login (`employee@pharmacy.local` / `employee123`)
- **Sidebar Menu**: Limited menu (Dashboard, Medicines, Customers, Billing, Reports, Profile)
- **Pages Accessible**: Only basic operational pages
- **Home Redirect**: Goes to main dashboard
- **Restrictions**: Cannot access purchase management, supplier features, or advanced analytics

#### Supplier Login (`supplier@pharmacy.local` / `supplier123`)
- **Sidebar Menu**: Supplier-specific menu (Dashboard, Profile, Owner Info, Orders, Order History)
- **Pages Accessible**: Only supplier portal features
- **Home Redirect**: Automatically redirected to supplier portal
- **Features**: Can manage orders and view supplier-specific information

## Creating New Users with Specific Roles

### Through Registration Form
1. Go to `/register` page
2. Fill out the registration form
3. **Default Role**: New registrations default to "Employee" role
4. **Note**: You cannot change the role through the registration form - it's hardcoded to "Employee"

### Through Backend (For Development)
To create users with specific roles, you can:

1. **Modify DataSeeder.java** (as we did above)
2. **Use API endpoints** (if available)
3. **Direct database insertion** (for development only)

## Role-Based Access Summary

| Feature | Owner | Employee | Supplier |
|---------|-------|----------|----------|
| Dashboard | ✅ | ✅ | ✅ (Portal) |
| Medicines | ✅ | ✅ | ❌ |
| Customers | ✅ | ✅ | ❌ |
| Billing | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ |
| Transactions | ✅ | ❌ | ❌ |
| Profit Analysis | ✅ | ❌ | ❌ |
| Purchases | ✅ | ❌ | ❌ |
| Supplier Management | ✅ | ❌ | ❌ |
| Advanced Reports | ✅ | ❌ | ❌ |
| Supplier Portal | ❌ | ❌ | ✅ |
| Order Management | ❌ | ❌ | ✅ |

## Troubleshooting

### If you can't login with new test users:
1. **Restart the backend application** to ensure DataSeeder runs
2. **Check the database** to verify users were created
3. **Verify credentials** are exactly as specified above

### If role-based access isn't working:
1. **Clear browser cache** and localStorage
2. **Logout and login again** to refresh authentication
3. **Check browser console** for any JavaScript errors
4. **Verify JWT token** contains correct role information

### To verify users were created:
You can check the database or add a simple API endpoint to list all users and their roles.

## Security Notes

- **Test users are for development only** - remove or change passwords in production
- **Default passwords are weak** - use strong passwords in production
- **Role assignment is secure** - roles are validated on both frontend and backend
- **JWT tokens contain role information** - ensure tokens are properly validated

This setup allows you to thoroughly test the role-based access control system and ensure each user type sees only the appropriate features and pages.

