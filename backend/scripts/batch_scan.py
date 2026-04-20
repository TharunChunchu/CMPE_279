import os
import sys
import csv

# Add the parent directory to Python path to import our app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.parser import parse_eml
from app.heuristics import evaluate_email

def scan_eml_directory(directory_path):
    """Scans an entire directory (like the Enron dataset folder) of emails."""
    print(f"--- Batch Scanning Directory: {directory_path} ---")
    safe_count = 0
    suspicious_count = 0
    phishing_count = 0
    
    files = [f for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]
    
    for filename in files:
        filepath = os.path.join(directory_path, filename)
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            parsed_data = parse_eml(content)
            result = evaluate_email(parsed_data)
        except Exception as e:
            continue
            
        if result['status'] == 'Phishing':
            phishing_count += 1
        elif result['status'] == 'Suspicious':
            suspicious_count += 1
        else:
            safe_count += 1
            
    print(f"Total Emails Scanned: {len(files)}")
    print(f"  [+] Safe emails:       {safe_count}")
    print(f"  [!] Suspicious emails: {suspicious_count}")
    print(f"  [x] Phishing emails:   {phishing_count}")
    print("-" * 50)


def scan_kaggle_csv(csv_path, text_column='Email Text'):
    """Scans a Kaggle CSV dataset directly row by row."""
    print(f"--- Batch Scanning Kaggle CSV: {csv_path} ---")
    safe_count = 0
    suspicious_count = 0
    phishing_count = 0
    total = 0
    
    with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if text_column not in row:
                print(f"Error: Could not find '{text_column}' column.")
                return
                
            raw_text = row[text_column].encode('utf-8')
            parsed_data = parse_eml(raw_text)
            result = evaluate_email(parsed_data)
            
            if result['status'] == 'Phishing':
                phishing_count += 1
            elif result['status'] == 'Suspicious':
                suspicious_count += 1
            else:
                safe_count += 1
            total += 1
            
    print(f"Total Emails Scanned: {total}")
    print(f"  [+] Safe emails:       {safe_count}")
    print(f"  [!] Suspicious emails: {suspicious_count}")
    print(f"  [x] Phishing emails:   {phishing_count}")
    print("-" * 50)


if __name__ == "__main__":
    print("Welcome to the Batch Dataset Scanner!")
    print("Please select an option:")
    print("1: Scan a folder of Enron Dataset (.txt / .eml) files")
    print("2: Scan a Kaggle Phishing Dataset (.csv)")
    
    choice = input("Enter choice (1 or 2): ").strip()
    
    if choice == '1':
        dir_path = input("Enter the absolute path to the dataset directory: ").strip()
        if os.path.isdir(dir_path):
            scan_eml_directory(dir_path)
        else:
            print("Invalid directory path.")
            
    elif choice == '2':
        csv_path = input("Enter the absolute path to the Kaggle CSV file: ").strip()
        col_name = input("Enter the name of the column containing email text (e.g. 'Email Text'): ").strip()
        if os.path.isfile(csv_path):
            scan_kaggle_csv(csv_path, col_name)
        else:
            print("Invalid file path.")
    else:
        print("Invalid choice.")
