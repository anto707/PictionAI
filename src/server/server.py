from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoImageProcessor, AutoModelForImageClassification
import base64
import io
from PIL import Image
import torch
import os
import logging

app = FastAPI()

logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.INFO)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust according to your front-end setup
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGE_SIZE = (224, 224)
MODEL_NAME = "kmewhort/beit-sketch-classifier"

# Model and processor
processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)

def base64_to_pil(base64_string: str) -> Image:
    try:
        # Decode base64 and convert to a PIL image
        image_data = base64.b64decode(base64_string)
        pil_image = Image.open(io.BytesIO(image_data)).convert('RGBA')
        
        # Check if image has transparency
        alpha_channel = pil_image.getchannel('A')
        has_transparency = alpha_channel.getextrema()[0] < 255 or alpha_channel.getextrema()[1] < 255
        
        if has_transparency:
            # Crop image based on alpha channel
            bbox = alpha_channel.getbbox()
            if bbox:
                pil_image = pil_image.crop(bbox)
        else:
            # Crop based on white background for images without transparency (mouse modality)

            grayscale = pil_image.convert("L")

            binary_mask = grayscale.point(lambda p: 0 if p < 240 else 255)

            inverted_mask = Image.eval(binary_mask, lambda x: 255 - x)
            
            # Bounding box of the non-white areas
            bbox = inverted_mask.getbbox()
            logger.info(bbox)
            
            # Crop to the bounding box
            if bbox:
                pil_image = pil_image.crop(bbox)


        # Create a white background and paste the cropped image onto it
        background = Image.new("RGB", pil_image.size, (255, 255, 255))
        background.paste(pil_image, mask=pil_image.split()[3])  # Use alpha channel as mask
        
        return background

    except Exception as e:
        logger.error(f"Error converting base64 to PIL image: {e}", exc_info=True)
        raise ValueError("Invalid base64 image data")



@app.post("/predict")
async def predict(request: Request):
    try:
        data = await request.json()
        base64_image = data.get('imageData')

        if not base64_image:
            logger.error("No image data provided")
            return JSONResponse(content={"error": "No image data provided"}, status_code=400)

        # Convert Base64 image to PIL image
        try:
            pil_image = base64_to_pil(base64_image)
        except ValueError:
            return JSONResponse(content={"error": "Invalid image data"}, status_code=400)

        # Resize image to the expected size if necessary
        if pil_image.size != IMAGE_SIZE:
            pil_image = pil_image.resize(IMAGE_SIZE)

        # Save the image for debugging
        image_path = os.path.join(os.getcwd(), "output.png")
        pil_image.save(image_path)

        # Preprocess the image
        inputs = processor(pil_image, return_tensors="pt")

        # Make the prediction
        with torch.no_grad():
            outputs = model(**inputs)

        # Compute softmax probabilities
        probabilities = torch.softmax(outputs.logits, dim=-1)[0]

        # Get top 4 predictions
        top_probs, top_indices = torch.topk(probabilities, 4)

        top_predictions = []
        for prob, idx in zip(top_probs, top_indices):
            label = model.config.id2label[idx.item()]
            top_predictions.append({
                "label": label,
                "probability": prob.item()
            })

        logger.info(f"Top 4 Predictions: {top_predictions}")

        return JSONResponse(content={
            "predictions": top_predictions
        })

    except Exception as e:
        logger.error(f"Error during prediction: {e}", exc_info=True)
        return JSONResponse(content={"error": "Internal server error"}, status_code=500)
