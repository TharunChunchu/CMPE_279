def evaluate_email(parsed_data: dict) -> dict:
    """
    Evaluates parsed email headers using heuristics and returns a phishing report.
    Returns a dict with 'status' (Safe, Suspicious, Phishing) and a list of 'warnings'.
    """
    warnings = []
    score = 0
    
    # 1. Domain Mismatch (From vs Reply-To)
    from_domain = parsed_data.get('from_domain')
    reply_to_domain = parsed_data.get('reply_to_domain')
    
    if from_domain and reply_to_domain and from_domain != reply_to_domain:
        warnings.append(f"Spam/Spoofing risk: 'From' domain ({from_domain}) does not match 'Reply-To' domain ({reply_to_domain}).")
        score += 3
        
    # 2. Missing Message-ID
    message_id = parsed_data.get('Message-ID', '')
    if not message_id or len(message_id.strip()) < 5:
        warnings.append("Header anomaly: Missing or malformed Message-ID.")
        score += 2
        
    # 3. Suspicious Subject
    subject = parsed_data.get('Subject', '').lower()
    spam_keywords = ["urgent", "password", "bank", "verify", "account", "login", "winner", "seized", "suspended", "security alert"]
    found_keywords = [kw for kw in spam_keywords if kw in subject]
    if found_keywords:
        warnings.append(f"Suspicious subject keywords found: {', '.join(found_keywords)}.")
        score += 2
        
    # 4. Received Headers anomalies (too few)
    received = parsed_data.get('Received', [])
    if len(received) < 2:
        warnings.append("Header anomaly: Abnormally low number of 'Received' routing headers indicating possible direct injection.")
        score += 1
        
    # Determine final status based on heuristic score
    if score >= 4:
        status = "Phishing"
    elif score >= 2:
        status = "Suspicious"
    else:
        status = "Safe"
        
    return {
        "score": score,
        "status": status,
        "warnings": warnings
    }
