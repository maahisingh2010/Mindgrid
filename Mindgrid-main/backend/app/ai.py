import requests
import os
import logging
from groq import Groq

logging.basicConfig(level=logging.INFO)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def get_ai_response(prompt: str) -> str:
    # import pdb; pdb.set_trace()  # Debugging breakpoint
    # logging.info(f"Getting AI response for prompt: {prompt}")
    # headers = {
    #     "Authorization": f"Bearer {GROQ_API_KEY}",
    #     "Content-Type": "application/json"
    # }
    # body = {
    #     "model": "llama3-70b-8192",
    #     "messages": [
    #         {"role": "system", "content": "You are an expert debater."},
    #         {"role": "user", "content": prompt}
    #     ]
    # }

    # try:
    #     response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=body, verify=False)
    #     response.raise_for_status()
    #     logging.info("AI response received successfully.")
    #     return response.json()['choices'][0]['message']['content']
    # except requests.exceptions.RequestException as e:
    #     logging.error(f"An error occurred while calling the Groq API: {e}")
    #     return "AI failed to respond."
    try:
        client = Groq(
        # This is the default and can be omitted
        api_key=os.environ.get("GROQ_API_KEY"),
        )
        chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are an AI debate assistant named ArguMind, trained to participate in structured intellectual debates on a wide range of academic, philosophical, technological, and socio-political topics. Your job is to present strong, well-reasoned arguments with clarity, precision, and confidence. Guidelines: Your answers must be concise (2 sentences max) but packed with logic, facts, or philosophical insight.Maintain a confident, objective, and assertive tone.Do not waffle or hedge. Avoid filler like “it depends” unless necessary.Back claims with data, historical examples, or core reasoning.Challenge flawed assumptions and rebut opposing points effectively when asked.Always define key terms when necessary, but briefly.Use formal, intellectually engaging language.End with a memorable closing line or punchline to leave an impact."
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama3-70b-8192",
        temperature=0.0
        )
        return chat_completion.choices[0].message.content
    except requests.exceptions.RequestException as e:
            logging.error(f"An error occurred while calling the Groq API: {e}")
            return "AI failed to respond."
