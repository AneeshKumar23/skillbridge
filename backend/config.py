import os
from dotenv import load_dotenv

# Use abspath(__file__) so this works regardless of CWD or how the module is imported
_HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_HERE, ".env"))

MODEL_API_KEY = os.getenv("MODEL_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # service_role key (bypasses RLS)

BASE_PROMPT = """
    {{
        "title": "<title>",
        "important_terminalogy": [
            {
                "term": "<term>",
                "description": "<description>"
            }, 
            {
                "term": "<term>",
                "description": "<description>"
            }
        ],
        "milestones: [
            {
                "main_goal": "<main_goal1>",
                "sub_goals": [
                    "<sub_goal_1>",
                    "<sub_goal_2>",
                    "<sub_goal_3>",
                    "<sub_goal_4>"
                    "<sub_goal_5>"
                ],
            },
            {
                "main_goal": "<main_goal2>",
                "sub_goals": [
                    "<sub_goal_1>",
                    "<sub_goal_2>",
                    "<sub_goal_3>",
                    "<sub_goal_4>"
                    "<sub_goal_5>"
                ],
            },
            {
                "main_goal": "<main_goal3>",
                "sub_goals": [
                    "<sub_goal_1>",
                    "<sub_goal_2>",
                    "<sub_goal_3>",
                    "<sub_goal_4>"
                    "<sub_goal_5>"
                ],
            },
            {
                "main_goal": "<main_goal4>",
                "sub_goals": [
                    "<sub_goal_1>",
                    "<sub_goal_2>",
                    "<sub_goal_3>",
                    "<sub_goal_4>"
                    "<sub_goal_5>"
                ],
            },
            {
                "main_goal": "<main_goal5>",
                "sub_goals": [
                    "<sub_goal_1>",
                    "<sub_goal_2>",
                    "<sub_goal_3>",
                    "<sub_goal_4>"
                    "<sub_goal_5>"
                ],
            }
        ]
    }}

    I want the output to be in JSON format.
    Do not include any additional text or explanations. Generate 5 terminalogy terms with their descriptions, and 5 milestones with main goals and sub-goals.
    The main goals should be the main steps to learn the skill, and the sub-goals should be the smaller tasks that lead to achieving the main goal. 
    Give me contents for the given prompt.
"""