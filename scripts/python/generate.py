import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel
import py_midicsv

SYSTEM_PROMPT_PATH = "system_prompt.txt"
with open(SYSTEM_PROMPT_PATH, "r") as f:
    system_prompt = f.read().strip()

# Load API key
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------------------------
#  MODELO Pydantic
# ---------------------------
class MidiCsvResponse(BaseModel):
    csv: str

print("Describe el groove, estilo, instrumentos, etc:")
user_prompt = input("> ")

print("\n🧠 Generando CSV...\n")

response = client.responses.parse(
    model="gpt-4.1",
    text_format=MidiCsvResponse,
    input=[
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": user_prompt
        }
    ],
    temperature=0
)

parsed = response.output_parsed
# parsed: MidiCsvResponse = response.output[0].content[0].parsed
csv_text = parsed.csv

# ---------------------------
#  Guardar CSV
# ---------------------------
csv_filename = "output.csv"
with open(csv_filename, "w") as f:
    f.write(csv_text)

print(f"📄 CSV guardado como {csv_filename}")

# ---------------------------
#  Convertir a MIDI (py_midicsv)
# ---------------------------
midi_filename = "output1.mid"
midi_obj = py_midicsv.csv_to_midi(csv_filename)

# Save the parsed MIDI file to disk
with open("example_converted.mid", "wb") as output_file:
    midi_writer = py_midicsv.FileWriter(output_file)
    midi_writer.write(midi_obj)

print(f"🎵 MIDI generado: {midi_filename}")
print("✔️ ¡Listo!")
