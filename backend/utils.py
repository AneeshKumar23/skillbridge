from googleapiclient.discovery import build
import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
from PIL import Image, ImageDraw, ImageFont
import random

_HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_HERE, ".env"))


def _get_model():
    """Return a GenerativeModel using the already-configured genai state."""
    return genai.GenerativeModel(model_name=os.getenv("MODEL_NAME", "gemma-3-27b-it"))

def search_youtube(query, max_results=5):
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    results = youtube.search().list(
        q=query,
        part="snippet",
        type="video",
        maxResults=max_results
    ).execute()

    videos = []
    for item in results["items"]:
        videos.append({
            "type": "video",
            "title": item["snippet"]["title"],
            "link": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
        })
    return videos

def generate_certificate(name: str) -> tuple:
    """Generate a certificate PNG and return (filename, raw_bytes) for upload."""
    import io
    img = Image.open("assets/image.png")
    d = ImageDraw.Draw(img)
    location = (600, 550)
    text_color = (18, 48, 134)
    font = ImageFont.truetype("assets/aerial.ttf", 75)
    d.text(location, name, fill=text_color, font=font)

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    file_bytes = buffer.getvalue()
    file_name = f"{name}.png"
    return file_name, file_bytes

def generate_youtube_content(query):
    # Step 1: Get YouTube videos
    video_links = search_youtube(query, max_results=5)

    # Step 2: Ask Gemini to generate the title/description
    model = _get_model()
    prompt = f"""
You are helping a user learn a new skill: "{query}".
Below are the YouTube video links.

Generate a JSON with the following format:
{{
  "title": "...",
  "description": "...",
  "materials": [ <use the videos below as-is> ]
}}

Use this exact list for "materials":

{json.dumps(video_links, indent=4)}
"""

    response = model.generate_content(
        contents=prompt,
    )

    text = response.text
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # Strip Markdown formatting if needed
        text = text.strip("```json").strip("```")
        data = json.loads(text)

    return data


def fetch_article_links(prompt):
    base_prompt = f"""
grab all the contents from internet and give the article links with title in the given format:

{{
[
    {{
        "title": "<title>",
        "link": "<link>"
    }},
    {{
        "title": "<title>",
        "link": "<link>"
    }},
    {{
        "title": "<title>",
        "link": "<link>"
    }},
    {{
        "title": "<title>",
        "link": "<link>"
    }},
    {{
        "title": "<title>",
        "link": "<link>"
    }}
]
}}
    I want the output to be in JSON format.
    Do not include any additional text or explanations. No youtube links only the website links. Generate 5 article links with their titles.
"""

    model = _get_model()
    response = model.generate_content(
        contents=base_prompt + prompt,
    )

    text = response.text.strip()
    # Strip optional ```json ... ``` fence
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]  # drop opening fence line
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    text = text.strip()

    # The prompt asks for { [...] } — unwrap outer braces if needed
    if text.startswith("{") and not text.startswith("["):
        inner = text[text.index("["):text.rindex("]") + 1]
        data = json.loads(inner)
    else:
        data = json.loads(text)

    return data


def get_embedding(text: str):
    """Return an embedding vector for `text` or None if unavailable.

    Priority:
    1. Use Gemini via `google.generativeai` when `MODEL_API_KEY` is set.
    2. Fallback to OpenAI when `OPENAI_API_KEY` is set.
    If neither is configured the function returns None so callers can skip vector storage.
    """
    import os

    # 1) Try Gemini via google.generativeai
    MODEL_API_KEY = os.getenv("MODEL_API_KEY")
    if MODEL_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=MODEL_API_KEY)
            model = os.getenv("EMBEDDING_MODEL", "textembedding-gecko-001")
            resp = genai.get_embeddings(model=model, input=text)
            return resp["data"][0]["embedding"]
        except Exception as e:
            print("Gemini embedding error:", e)

    # 2) Fallback to OpenAI if available
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if OPENAI_API_KEY:
        try:
            import openai
            model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
            openai.api_key = OPENAI_API_KEY
            resp = openai.Embedding.create(model=model, input=text)
            return resp["data"][0]["embedding"]
        except Exception as e:
            print("OpenAI embedding error:", e)

    return None