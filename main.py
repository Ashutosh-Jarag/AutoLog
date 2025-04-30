import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
import json
import google.generativeai as genai

# Step 1: Load environment variables and configure Gemini
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Please set GOOGLE_API_KEY in your .env file.")

genai.configure(api_key=GOOGLE_API_KEY)

# Define the Pydantic model for structured output
class VehicleData(BaseModel):
    number_plate: str = Field(description="The number plate of the vehicle")
    vehicle_type: str = Field(description="The type of vehicle (e.g., two_wheeler, four_wheeler)")

# Initialize LangChain’s Gemini model (for text formatting)
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.0
)

# Set up the prompt template for formatting the output
prompt_template = PromptTemplate(
    template="""Format the following vehicle data as JSON:
    Number Plate: {number_plate}
    Vehicle Type: {vehicle_type}
    {parser_instructions}
    """,
    input_variables=["number_plate", "vehicle_type"],
    partial_variables={"parser_instructions": PydanticOutputParser(pydantic_object=VehicleData).get_format_instructions()}
)

# Set up the output parser
parser = PydanticOutputParser(pydantic_object=VehicleData)

# Create the chain for formatting
chain = prompt_template | llm | parser

def process_vehicle_image(image_path: str) -> str:
    """
    Process the vehicle image in three steps:
    1. Load the image
    2. Send it to Gemini 1.5 Flash
    3. Analyze and format the result
    """
    # Step 1: Load the image
    try:
        with open(image_path, "rb") as image_file:
            image_data = image_file.read()
    except FileNotFoundError:
        raise ValueError(f"Image file not found at: {image_path}")

    # Step 2: Send the image to Gemini 1.5 Flash
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([
        "Analyze this vehicle image and extract the number plate and vehicle type. Return the result in the format:\nNumber Plate: <plate>\nVehicle Type: <type>",
        {"mime_type": "image/jpeg", "data": image_data}  # Adjust mime_type if needed (e.g., "image/png")
    ])

    # Step 3: Model analyzes the image and we process the response
    raw_response = response.text
    #print("Raw response from Gemini:", raw_response)  # Debug output

    # Parse the response (assuming format "Number Plate: XYZ123\nVehicle Type: four_wheeler")
    lines = raw_response.split("\n")
    number_plate = lines[0].split(": ")[1] if len(lines) > 0 and ": " in lines[0] else "Not detected"
    vehicle_type = lines[1].split(": ")[1] if len(lines) > 1 and ": " in lines[1] else "unknown"

    # Format the result using LangChain
    result = chain.invoke({"number_plate": number_plate, "vehicle_type": vehicle_type})
    
    # Convert to JSON
    json_output = json.dumps(result.dict(), indent=2)
    return json_output

# Example usage
if __name__ == "__main__":
    # Specify your image path
    image_path = "/home/delldevice11/Desktop/Langchain/project/test5.jpeg"  # Update this path
    try:
        result = process_vehicle_image(image_path)
        print("Final JSON output:")
        print(result)
    except Exception as e:
        print(f"Error: {e}")