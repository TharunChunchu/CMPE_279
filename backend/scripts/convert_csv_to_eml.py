import csv
import os
import email
from email.message import EmailMessage

def convert_csv_to_eml(csv_filepath, output_dir, text_column='Email Text'):
    """
    Utility script to convert Kaggle phishing CSV datasets into individual .eml files.
    
    Args:
        csv_filepath (str): Path to the downloaded CSV.
        output_dir (str): Directory where .eml files will be saved.
        text_column (str): The column name in the CSV containing raw email text.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with open(csv_filepath, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if text_column not in row:
                print(f"Error: Could not find column '{text_column}' in the CSV.")
                return

            raw_email_data = row[text_column]
            
            # Write out to .eml
            out_path = os.path.join(output_dir, f"email_{i}.eml")
            with open(out_path, mode='w', encoding='utf-8') as out_f:
                out_f.write(raw_email_data)
                
            if i >= 100:
                print(f"Sample conversion completed. Saved {i} .eml files to {output_dir}")
                break

if __name__ == "__main__":
    print("Example Usage:")
    print("Download a CSV dataset from Kaggle, then run:")
    print("convert_csv_to_eml('path_to_dataset.csv', '../sample_data/kaggle_emails', text_column='Email Text')")
