# Email OTP Test Instructions

## Quick Test Steps

### 1. Configure Your Email
Follow the main email configuration guide, then:

### 2. Test the Configuration

#### Option A: Using Environment Variables (Recommended)
```bash
# Set your email credentials
export SPRING_MAIL_USERNAME="your-email@gmail.com"
export SPRING_MAIL_PASSWORD="your-app-password"

# Start the application
./mvnw spring-boot:run
```

#### Option B: Direct Configuration
Edit `src/main/resources/application.properties`:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### 3. Test Login Flow

1. **Start the application**
2. **Go to login page** in your browser
3. **Login with test credentials**:
   - Email: `owner@pharmacy.local`
   - Password: `owner123`
4. **Check your email** for the OTP code
5. **Enter the OTP** in the verification page
6. **Verify successful login**

### 4. Expected Behavior

#### ✅ Success Indicators:
- Console shows: `DEBUG: OTP sent successfully to [email] with code: [code]`
- You receive an email with the OTP
- OTP verification works and you're logged in

#### ❌ Failure Indicators:
- Console shows: `DEBUG: Email service failed, but continuing with OTP: [code]`
- No email received
- OTP verification fails

### 5. Troubleshooting

#### If you don't receive emails:
1. **Check spam folder**
2. **Verify email configuration** in application.properties
3. **Check console logs** for error messages
4. **Test with Gmail App Password** (most reliable)

#### If OTP verification fails:
1. **Check console logs** for OTP comparison
2. **Verify session ID** is being passed correctly
3. **Check OTP expiration** (5 minutes)

### 6. Development Mode

If email configuration fails, the system will still work for development:
- OTP codes are printed in console logs
- You can use the console OTP for testing
- This allows development without email setup

### 7. Production Considerations

For production deployment:
- Use a dedicated email service (SendGrid, AWS SES)
- Implement proper error handling
- Add email templates and branding
- Monitor delivery rates

## Quick Gmail Setup (5 minutes)

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account → Security → App passwords
   - Select "Mail" → Generate password
   - Copy the 16-character password
3. **Set environment variable**:
   ```bash
   export SPRING_MAIL_USERNAME="your-email@gmail.com"
   export SPRING_MAIL_PASSWORD="your-16-char-password"
   ```
4. **Start application and test**

## Test Users Available

After restarting the application, you can test with:

- **Owner**: `owner@pharmacy.local` / `owner123`
- **Employee**: `employee@pharmacy.local` / `employee123`  
- **Supplier**: `supplier@pharmacy.local` / `supplier123`

All users will receive OTP emails to verify their login.

