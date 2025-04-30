import os
import cv2
import numpy as np
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
import json
import google.generativeai as genai
from datetime import datetime
import time

# Load environment variables and configure Gemini
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Please set GOOGLE_API_KEY in your .env file.")

genai.configure(api_key=GOOGLE_API_KEY)

# Define the Pydantic model for structured output
class VehicleData(BaseModel):
    number_plate: str = Field(description="The number plate of the vehicle")
    vehicle_type: str = Field(description="The type of vehicle (e.g., two_wheeler, four_wheeler)")

# Initialize LangChain’s Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.0
)





# Set up the prompt template for formatting the output
prompt_template = PromptTemplate(
    template="""Analyze this image and identify:
        1. The license plate number (if visible)
        2. The vehicle type (must be one of: Bike, Car, Truck, Scooter, Others)
        
        Return ONLY a JSON object with this format:
        {
          "licensePlate": "the license plate text or null if not visible",
          "vehicleType": "one of: Bike, Car, Truck, Scooter, Others",
          "confidence": "high/medium/low"
        {parser_instructions}""",
    input_variables=["number_plate", "vehicle_type"],
    partial_variables={"parser_instructions": PydanticOutputParser(pydantic_object=VehicleData).get_format_instructions()}
)

# Set up the output parser
parser = PydanticOutputParser(pydantic_object=VehicleData)

# Create the chain for formatting
chain = prompt_template | llm | parser

def process_vehicle_image(image_data: bytes) -> str:
    """Process the vehicle image using Gemini 1.5 Flash and return JSON output."""
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([
        "Analyze this vehicle image and extract the number plate and vehicle type. Return the result in the format:\nNumber Plate: <plate>\nVehicle Type: <type>",
        {"mime_type": "image/jpeg", "data": image_data}
    ])

    # Parse the response silently
    raw_response = response.text
    lines = raw_response.split("\n")
    number_plate = lines[0].split(": ")[1] if len(lines) > 0 and ": " in lines[0] else "Not detected"
    vehicle_type = lines[1].split(": ")[1] if len(lines) > 1 and ": " in lines[1] else "unknown"

    # Format the result using LangChain
    result = chain.invoke({"number_plate": number_plate, "vehicle_type": vehicle_type})
    
    # Convert to JSON
    json_output = json.dumps(result.dict(), indent=2)
    return json_output

def stream_and_auto_capture(ip_camera_url: str):
    """Stream video from phone camera and automatically capture vehicle images using motion detection."""
    # Initialize the camera stream
    camera = cv2.VideoCapture(ip_camera_url)
    
    if not camera.isOpened():
        raise ValueError(f"Error: Could not open camera stream at {ip_camera_url}")

    capture_count = 0
    prev_frame = None
    min_contour_area = 5000  # Minimum area for motion detection (adjust as needed)
    cooldown = 2.0  # Seconds to wait between captures
    last_capture_time = 0

    print("Streaming video from phone camera... Press 'q' to quit.")

    while True:
        ret, frame = camera.read()
        if not ret:
            print("Error: Could not read frame")
            break

        # Convert to grayscale and blur for motion detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        # Initialize the first frame
        if prev_frame is None:
            prev_frame = gray
            continue

        # Compute the difference between frames
        frame_delta = cv2.absdiff(prev_frame, gray)
        thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
        thresh = cv2.dilate(thresh, None, iterations=2)

        # Find contours
        contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        motion_detected = False
        for contour in contours:
            if cv2.contourArea(contour) < min_contour_area:
                continue
            motion_detected = True
            # Draw bounding box (optional, for visualization)
            (x, y, w, h) = cv2.boundingRect(contour)
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        # If motion is detected and cooldown period has passed, capture and process
        current_time = time.time()
        if motion_detected and (current_time - last_capture_time) > cooldown:
            # Capture the clear frame
            _, buffer = cv2.imencode('.jpg', frame)
            image_data = buffer.tobytes()

            # Process with Gemini and print only the required output
            try:
                result = process_vehicle_image(image_data)
                print("Vehicle Data:")
                print(result)

                # Save the image and print the path
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                image_path = f"vehicle_{timestamp}_{capture_count}.jpg"
                cv2.imwrite(image_path, frame)
                print(f"Saved as: {image_path}")
                capture_count += 1
                last_capture_time = current_time
            except Exception as e:
                print(f"Error processing image: {e}")

        # Update previous frame
        prev_frame = gray

        # Display the frame
        cv2.imshow('Phone Camera Stream', frame)

        # Quit on 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Clean up
    camera.release()
    cv2.destroyAllWindows()

# Example usage
if __name__ == "__main__":
    # Replace with your phone's IP Webcam URL (e.g., http://192.168.1.100:8080/video)
    IP_CAMERA_URL = "http://192.168.1.4:8080/video"  # Update this with your IP address
    try:
        stream_and_auto_capture(IP_CAMERA_URL)
    except Exception as e:
        print(f"Error: {e}")