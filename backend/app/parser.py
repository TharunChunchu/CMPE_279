import email
from email import policy
from email.parser import BytesParser
import re

def parse_eml(file_bytes: bytes) -> dict:
    """Parses raw EML bytes and extracts relevant headers."""
    msg = BytesParser(policy=policy.compat32).parsebytes(file_bytes)
    
    # Extract basic headers
    from_header = msg.get('From', '')
    reply_to_header = msg.get('Reply-To', '')
    subject = msg.get('Subject', '')
    message_id = msg.get('Message-ID', '')
    date = msg.get('Date', '')
    
    # Received headers can have multiple entries
    received_headers = msg.get_all('Received', [])
    
    # Extract domains for analysis
    from_domain = extract_domain(from_header)
    reply_to_domain = extract_domain(reply_to_header)
    
    # Extract body text for AI Analysis
    body_content = ""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == 'text/plain':
                payload = part.get_payload(decode=True)
                if payload:
                    body_content = payload.decode('utf-8', errors='ignore')
                break
    else:
        if msg.get_content_type() == 'text/plain':
            payload = msg.get_payload(decode=True)
            if payload:
                body_content = payload.decode('utf-8', errors='ignore')
                
    return {
        "From": from_header,
        "Reply-To": reply_to_header,
        "Subject": subject,
        "Message-ID": msg.get('Message-ID', ''),
        "Date": msg.get('Date', ''),
        "Received": msg.get_all('Received', []),
        "from_domain": from_domain,
        "reply_to_domain": reply_to_domain,
        "Body": body_content,
    }

def extract_domain(email_header: str) -> str:
    """Extracts the domain from an email address string like 'Name <user@domain.com>' or 'user@domain.com'"""
    if not email_header:
        return ""
    # Regex to find domain part
    match = re.search(r'@([\w.-]+\.[a-zA-Z]{2,})', email_header)
    if match:
        return match.group(1).lower()
    return ""
