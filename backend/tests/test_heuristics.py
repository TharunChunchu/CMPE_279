import pytest
from app.heuristics import evaluate_email

def test_evaluate_email_safe():
    data = {
        "from_domain": "github.com",
        "reply_to_domain": "github.com",
        "Message-ID": "<12345.github@github.com>",
        "Subject": "Update regarding your repository",
        "Received": ["rec1", "rec2", "rec3"]
    }
    result = evaluate_email(data)
    assert result["status"] == "Safe"
    assert result["score"] == 0

def test_evaluate_email_phishing():
    data = {
        "from_domain": "paypal.com",
        "reply_to_domain": "hacker.net",
        "Message-ID": "",
        "Subject": "Urgent Security Alert: Account Suspended",
        "Received": ["rec1"]
    }
    result = evaluate_email(data)
    assert result["status"] == "Phishing"
    assert result["score"] >= 4
    # Missing Message ID (2) + Domain mismatch (3) + Subject keywords (2) + Received anomaly (1) = 8
    assert result["score"] == 8
