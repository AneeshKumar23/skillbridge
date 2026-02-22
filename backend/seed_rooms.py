"""Seed rooms for all existing skills in user_skills table."""
import os
import psycopg2
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("MODEL_API_KEY"))
MODEL_NAME = os.getenv("MODEL_NAME", "gemma-3-27b-it")

CATEGORIES = [
    "Programming", "Web Development", "Backend & APIs", "AI & Machine Learning",
    "Crafts & Fashion", "Agriculture", "Music & Arts", "Trade Skills",
    "Health & Wellness", "Science", "Business", "Sports", "Language Learning",
    "Design", "Other"
]

def categorise(skill):
    try:
        cats = ", ".join(CATEGORIES)
        model = genai.GenerativeModel(MODEL_NAME)
        resp = model.generate_content(
            f"Which single category best describes the skill '{skill}'?\n"
            f"Categories: {cats}\n"
            f"Reply with ONLY the category name, nothing else."
        )
        answer = resp.text.strip().strip('"').strip("'")
        return answer if answer in CATEGORIES else "Other"
    except Exception:
        return "Other"

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
conn.autocommit = True
cur = conn.cursor()

# Get all unique skills
cur.execute("SELECT DISTINCT unnest(skills) FROM user_skills WHERE skills IS NOT NULL")
all_skills = [row[0] for row in cur.fetchall()]

print(f"Found {len(all_skills)} unique skills. Creating rooms...")

for skill in all_skills:
    key = skill.lower().strip()
    cur.execute("SELECT id FROM rooms WHERE skill = %s", (key,))
    if not cur.fetchone():
        cat = categorise(skill)
        cur.execute(
            "INSERT INTO rooms (skill, category, description) VALUES (%s, %s, %s)",
            (key, cat, f"Community chat room for {skill}")
        )
        print(f"Created room: {key} ({cat})")

cur.close()
conn.close()
print("Done.")
