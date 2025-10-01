"""
Notification service for sending emails and SMS.
"""


class NotificationService:
    """Service for sending notifications."""
    
    def send_email(self, to_email, subject, body):
        """
        Send email notification.
        
        Args:
            to_email (str): Recipient email
            subject (str): Email subject
            body (str): Email body
            
        Returns:
            bool: True if sent successfully
        """
        # Placeholder - integrate with actual email service
        print(f"Email to {to_email}: {subject}")
        return True
    
    def send_sms(self, phone_number, message):
        """
        Send SMS notification.
        
        Args:
            phone_number (str): Recipient phone number
            message (str): SMS message
            
        Returns:
            bool: True if sent successfully
        """
        # Placeholder - integrate with SMS gateway
        print(f"SMS to {phone_number}: {message}")
        return True
    
    def notify_user(self, user, notification_type, data):
        """
        Send notification to user based on preferences.
        
        Args:
            user: User model instance
            notification_type (str): Type of notification
            data (dict): Notification data
            
        Returns:
            bool: True if sent successfully
        """
        # Determine notification method based on user preferences
        # For now, send email
        if user.email:
            subject = self._get_subject(notification_type)
            body = self._get_body(notification_type, data)
            return self.send_email(user.email, subject, body)
        
        return False
    
    def _get_subject(self, notification_type):
        """Get email subject based on notification type."""
        subjects = {
            'registration': 'Welcome to UEI Platform',
            'application_submitted': 'Application Submitted Successfully',
            'application_approved': 'Application Approved',
            'performance_update': 'Performance Update Available'
        }
        return subjects.get(notification_type, 'Notification from UEI')
    
    def _get_body(self, notification_type, data):
        """Get email body based on notification type."""
        # Placeholder - use templates in production
        return f"Notification: {notification_type}\nData: {data}"
