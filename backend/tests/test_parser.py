import pytest
from app.parser import parse_eml, extract_domain

def test_extract_domain():
    assert extract_domain("Support <support@github.com>") == "github.com"
    assert extract_domain("user@example.com") == "example.com"
    assert extract_domain("") == ""

def test_parse_eml():
    raw_eml = b"""From: Support <support@github.com>
To: user@example.com
Reply-To: badactor@hacker.net
Subject: Your password has been reset
Date: Wed, 20 Apr 2026 12:00:00 -0700
Message-ID: <1234567890.github@github.com>
Received: from mail.github.com by mail.example.com with SMTP id 1234;
Received: from internal.github.com by mail.github.com with SMTP id 5678;

Hi User,
Your password was successfully reset.
"""
    result = parse_eml(raw_eml)
    assert result["from_domain"] == "github.com"
    assert result["reply_to_domain"] == "hacker.net"
    assert result["Subject"] == "Your password has been reset"
    assert len(result["Received"]) == 2
    assert "Message-ID" in result
