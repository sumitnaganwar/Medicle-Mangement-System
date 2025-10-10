# Email Configuration Guide for OTP Verification

## Overview
This guide will help you configure your own email settings for OTP (One-Time Password) verification in the medical management system. The system currently uses Gmail SMTP, but you can configure it for any email provider.

## Current Issue
The system was previously configured with hardcoded email credentials (`sumitnaganwar45@gmail.com`). This has been removed and you now need to configure your own email settings.

## Step 1: Choose Your Email Provider

### Option A: Gmail (Recommended for Development)
Gmail is the easiest to set up and most reliable for development purposes.

### Option B: Other Email Providers
You can use any SMTP-compatible email provider (Outlook, Yahoo, custom domain, etc.).

## Step 2: Gmail Configuration (Recommended)

### 2.1 Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Enable 2-Factor Authentication if not already enabled

### 2.2 Generate App Password
1. In Google Account settings, go to Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and your device
4. Copy the generated 16-character app password (e.g., `abcd efgh ijkl mnop`)

### 2.3 Configure Application Properties
Update `src/main/resources/application.properties`:

```properties
# Replace with your Gmail address
spring.mail.username=${SPRING_MAIL_USERNAME:your-email@gmail.com}

# Replace with your Gmail App Password (16 characters, no spaces)
spring.mail.password=${SPRING_MAIL_PASSWORD:your-16-char-app-password}
```

### 2.4 Set Environment Variables (Recommended)
Instead of hardcoding credentials, use environment variables:

**Windows (PowerShell):**
```powershell
$env:SPRING_MAIL_USERNAME="your-email@gmail.com"
$env:SPRING_MAIL_PASSWORD="your-16-char-app-password"
```

**Windows (Command Prompt):**
```cmd
set SPRING_MAIL_USERNAME=your-email@gmail.com
set SPRING_MAIL_PASSWORD=your-16-char-app-password
```

**Linux/Mac:**
```bash
export SPRING_MAIL_USERNAME="your-email@gmail.com"
export SPRING_MAIL_PASSWORD="your-16-char-app-password"
```

## Step 3: Alternative Email Providers

### Outlook/Hotmail Configuration
```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=${SPRING_MAIL_USERNAME:your-email@outlook.com}
spring.mail.password=${SPRING_MAIL_PASSWORD:your-password}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Yahoo Mail Configuration
```properties
spring.mail.host=smtp.mail.yahoo.com
spring.mail.port=587
spring.mail.username=${SPRING_MAIL_USERNAME:your-email@yahoo.com}
spring.mail.password=${SPRING_MAIL_PASSWORD:your-app-password}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Custom SMTP Server
```properties
spring.mail.host=your-smtp-server.com
spring.mail.port=587
spring.mail.username=${SPRING_MAIL_USERNAME:your-email@yourdomain.com}
spring.mail.password=${SPRING_MAIL_PASSWORD:your-password}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## Step 4: Testing Your Configuration

### 4.1 Start the Application
1. Set your environment variables
2. Start the Spring Boot application
3. Check the console for any email configuration errors

### 4.2 Test OTP Login
1. Go to the login page
2. Enter credentials for any test user
3. Check if you receive the OTP email
4. Verify the OTP works

### 4.3 Check Logs
Look for these messages in the console:
- `DEBUG: OTP sent successfully to [email] with code: [code]` ✅ Success
- `DEBUG: Email service failed, but continuing with OTP: [code]` ❌ Email failed

## Step 5: Troubleshooting

### Common Issues

#### "Authentication failed" Error
- **Cause**: Wrong email or password
- **Solution**: Verify your email and app password are correct

#### "Connection refused" Error
- **Cause**: Wrong SMTP host or port
- **Solution**: Check your email provider's SMTP settings

#### "App password not working"
- **Cause**: 2FA not enabled or wrong app password
- **Solution**: Generate a new app password from your email provider

#### "OTP not received"
- **Cause**: Email configuration issue or spam folder
- **Solution**: Check spam folder, verify email configuration

### Debug Mode
To see detailed email logs, add this to `application.properties`:
```properties
logging.level.org.springframework.mail=DEBUG
logging.level.com.sun.mail=DEBUG
```

## Step 6: Security Best Practices

### 6.1 Environment Variables
- **Never** commit email credentials to version control
- Use environment variables for sensitive information
- Use `.env` files for local development (add to `.gitignore`)

### 6.2 App Passwords
- Use app-specific passwords instead of your main email password
- Regularly rotate app passwords
- Use different passwords for different applications

### 6.3 Production Considerations
- Use a dedicated email service (SendGrid, AWS SES, etc.) for production
- Implement rate limiting for OTP requests
- Add email templates and branding
- Monitor email delivery rates

## Step 7: Quick Setup Checklist

- [ ] Choose email provider (Gmail recommended)
- [ ] Enable 2FA on your email account
- [ ] Generate app password
- [ ] Update `application.properties` with your email
- [ ] Set environment variables
- [ ] Start application and test login
- [ ] Verify OTP emails are received
- [ ] Test OTP verification works

## Example Configuration Files

### Complete Gmail Configuration
```properties
# application.properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${SPRING_MAIL_USERNAME:your-email@gmail.com}
spring.mail.password=${SPRING_MAIL_PASSWORD:your-app-password}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.default-encoding=UTF-8
```

### Environment Variables (.env file)
```env
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-16-char-app-password
```

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your email provider's SMTP settings
3. Test with a simple email client first
4. Ensure your app password is correct
5. Check if your email provider blocks automated emails

Remember: The system will continue to work even if email fails (for development), but you won't receive actual OTP emails until properly configured.

