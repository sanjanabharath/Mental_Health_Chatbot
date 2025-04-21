# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import datetime
import random
import logging
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.document_loaders import DirectoryLoader, TextLoader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Constants
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
PROFILE_FILE = os.path.join(DATA_DIR, "profile.json")
RESOURCES_FILE = os.path.join(DATA_DIR, "resources.json")
KNOWLEDGE_DIR = os.path.join(DATA_DIR, "knowledge")
DB_DIR = os.path.join(DATA_DIR, "chroma_db")

# Create data directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(KNOWLEDGE_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)

# Try to initialize the Mistral model and tokenizer with error handling
model = None
tokenizer = None

try:
    logger.info("Attempting to import transformers and torch")
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM
    
    MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2"
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    logger.info(f"Loading model {MODEL_NAME} on {device}")
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            device_map="auto" if device == "cuda" else None,
            low_cpu_mem_usage=True
        )
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        model = None
        tokenizer = None
except ImportError as e:
    logger.error(f"Import error: {str(e)}")
    logger.info("Will use fallback response generator")
except Exception as e:
    logger.error(f"Unexpected error initializing model: {str(e)}")

# Initialize embeddings and vector store
vector_store = None
try:
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Function to initialize or load the vector store
    def get_vector_store():
        if os.path.exists(DB_DIR) and len(os.listdir(DB_DIR)) > 0:
            # Load existing vector store
            logger.info("Loading existing vector store")
            return Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
        else:
            # Initialize and populate vector store with mental health resources
            logger.info("Initializing new vector store")
            if not os.path.exists(KNOWLEDGE_DIR) or len(os.listdir(KNOWLEDGE_DIR)) == 0:
                # Create sample knowledge files if directory is empty
                create_sample_knowledge_files()
            
            # Load documents
            loader = DirectoryLoader(KNOWLEDGE_DIR, glob="**/*.txt", loader_cls=TextLoader)
            documents = loader.load()
            
            # Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            chunks = text_splitter.split_documents(documents)
            
            # Create vector store
            vectorstore = Chroma.from_documents(
                documents=chunks,
                embedding=embeddings, 
                persist_directory=DB_DIR
            )
            vectorstore.persist()
            return vectorstore
    
    # Initialize vector store
    vector_store = get_vector_store()
    logger.info("Vector store initialized successfully")
except Exception as e:
    logger.error(f"Error initializing vector store: {str(e)}")
    vector_store = None

# Create sample knowledge files for the vector store
def create_sample_knowledge_files():
    logger.info("Creating sample knowledge files")
    sample_files = {
        "anxiety.txt": """
Anxiety is a normal and often healthy emotion. However, when a person regularly feels disproportionate levels of anxiety, it might become a medical disorder.

Common anxiety symptoms include:
- Feeling nervous, restless or tense
- Having a sense of impending danger, panic or doom
- Having an increased heart rate
- Breathing rapidly (hyperventilation)
- Sweating
- Trembling
- Feeling weak or tired
- Trouble concentrating
- Having trouble sleeping
- Experiencing gastrointestinal (GI) problems

Self-help techniques for anxiety:
1. Deep breathing exercises
2. Progressive muscle relaxation
3. Mindfulness meditation
4. Regular physical exercise
5. Adequate sleep
6. Limiting caffeine and alcohol
7. Maintaining a healthy diet
8. Journaling
9. Social connection and support
        """,
        "depression.txt": """
Depression is a common and serious medical illness that negatively affects how you feel, think, and act. It causes feelings of sadness and/or a loss of interest in activities you once enjoyed.

Common symptoms of depression include:
- Feeling sad or having a depressed mood
- Loss of interest or pleasure in activities once enjoyed
- Changes in appetite (weight loss or gain)
- Trouble sleeping or sleeping too much
- Loss of energy or increased fatigue
- Increase in purposeless physical activity or slowed movements
- Feeling worthless or guilty
- Difficulty thinking, concentrating or making decisions
- Thoughts of death or suicide

Self-help strategies for depression:
1. Set attainable goals
2. Engage in activities that may make you feel better
3. Exercise regularly
4. Try to spend time with others
5. Postpone important decisions until depression improves
6. Discuss decisions with trusted friends or family
7. Expect your mood to improve gradually, not immediately
8. Develop a routine, especially for sleep
9. Continue educating yourself about depression
        """,
        "stress_management.txt": """
Stress management refers to techniques and psychotherapies aimed at controlling a person's level of stress for improving everyday functioning.

Effects of chronic stress:
- Anxiety
- Depression
- Digestive problems
- Headaches
- Heart disease
- Sleep problems
- Weight gain
- Memory and concentration impairment

Effective stress management techniques:
1. Physical activity (30 minutes of exercise most days)
2. Relaxation techniques (deep breathing, meditation, yoga, tai chi)
3. Connecting with others (social support)
4. Time management strategies
5. Setting boundaries
6. Practicing self-care
7. Getting enough sleep
8. Seeking professional help when needed
9. Keeping a stress diary to identify stressors
        """,
        "sleep_hygiene.txt": """
Sleep hygiene refers to the habits and practices that are conducive to sleeping well on a regular basis.

Good sleep hygiene practices:
1. Maintain a consistent sleep schedule (go to bed and wake up at the same time)
2. Create a relaxing bedtime routine
3. Ensure your bedroom is quiet, dark, and cool
4. Use a comfortable mattress and pillows
5. Limit exposure to screens before bedtime
6. Avoid caffeine, alcohol, and large meals close to bedtime
7. Regular physical activity during the day
8. Manage worries (journaling before bed can help)
9. Limit daytime naps to 20-30 minutes

Poor sleep can contribute to:
- Decreased cognitive function
- Mood disturbances
- Increased risk of accidents
- Weakened immune system
- Higher risk of health problems like heart disease and diabetes
        """,
        "mindfulness.txt": """
Mindfulness is the psychological process of bringing one's attention to experiences occurring in the present moment, which can be developed through meditation and other training.

Benefits of mindfulness practice:
- Reduced stress and anxiety
- Improved focus and attention
- Better emotional regulation
- Enhanced self-awareness
- Improved relationship satisfaction
- Increased immune functioning
- Reduced rumination
- Improved memory and cognitive flexibility

Mindfulness techniques:
1. Mindful breathing: Focus on the sensation of breath entering and leaving the body
2. Body scan meditation: Systematically focus attention on different parts of the body
3. Mindful eating: Pay close attention to the sensory experience of eating
4. Walking meditation: Bring awareness to each step and breath while walking
5. Mindful observation: Choose an object and focus on observing it for a few minutes
6. Mindful listening: Close your eyes and notice all the sounds around you
7. Thought labeling: Observe thoughts as they arise and label them
        """,
        "crisis_resources.txt": """
Crisis Resources for Mental Health Emergencies:

1. 988 Suicide & Crisis Lifeline
   - Call or text 988
   - Available 24/7
   - Provides free and confidential support for people in distress

2. Crisis Text Line
   - Text HOME to 741741
   - Available 24/7
   - Trained crisis counselors provide support via text message

3. Emergency Services
   - Call 911 for immediate emergencies
   - Go to the nearest emergency room
   - Contact local urgent psychiatric care services

Warning signs that indicate someone may need immediate help:
- Talking about wanting to die or kill oneself
- Looking for ways to kill oneself
- Talking about feeling hopeless or having no purpose
- Talking about feeling trapped or being in unbearable pain
- Talking about being a burden to others
- Increasing alcohol or drug use
- Acting anxious, agitated, or reckless
- Sleeping too little or too much
- Withdrawing or feeling isolated
- Showing rage or talking about seeking revenge
- Displaying extreme mood swings
        """
    }
    
    for filename, content in sample_files.items():
        file_path = os.path.join(KNOWLEDGE_DIR, filename)
        with open(file_path, 'w') as file:
            file.write(content)
    
    logger.info(f"Created {len(sample_files)} sample knowledge files")

# Initialize default resources and profile if they don't exist
def init_resources():
    if not os.path.exists(RESOURCES_FILE):
        resources = {
            "crisis": [
                {"name": "988 Suicide & Crisis Lifeline", "link": "https://988lifeline.org/"},
                {"name": "Crisis Text Line", "link": "https://www.crisistextline.org/"},
                {"name": "SAMHSA National Helpline", "link": "https://www.samhsa.gov/find-help/national-helpline"}
            ],
            "self_help": [
                {"name": "Anxiety Management Techniques", "link": "https://www.mind.org.uk/information-support/types-of-mental-health-problems/anxiety-and-panic-attacks/self-care/"},
                {"name": "Depression Self-Care Strategies", "link": "https://www.healthline.com/health/depression/self-care-for-depression"},
                {"name": "Mindfulness Practices", "link": "https://www.mindful.org/meditation/mindfulness-getting-started/"}
            ],
            "professional": [
                {"name": "Find a Therapist", "link": "https://www.psychologytoday.com/us/therapists"},
                {"name": "Mental Health America", "link": "https://www.mhanational.org/finding-therapy"},
                {"name": "Online Therapy Services", "link": "https://www.betterhelp.com/"}
            ]
        }
        with open(RESOURCES_FILE, 'w') as f:
            json.dump(resources, f, indent=2)

def init_profile():
    if not os.path.exists(PROFILE_FILE):
        profile = {
            "name": "",
            "feelingToday": "",
            "sleepQuality": "",
            "stressLevel": "",
            "lastCheckIn": "",
            "nextFollowUp": "",
            "conversationHistory": [],
            "identifiedConcerns": [],
            "recommendedResources": []
        }
        with open(PROFILE_FILE, 'w') as f:
            json.dump(profile, f, indent=2)

# Initialize default data
init_resources()
init_profile()

# Helper function to read user profile
def get_profile():
    try:
        if os.path.exists(PROFILE_FILE):
            with open(PROFILE_FILE, 'r') as f:
                return json.load(f)
        else:
            init_profile()
            with open(PROFILE_FILE, 'r') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Error reading profile: {e}")
        return {}

# Helper function to update user profile
def update_profile(profile_data):
    try:
        current_profile = get_profile()
        updated_profile = {**current_profile, **profile_data}
        
        # Update conversation history if provided
        if 'message' in profile_data and 'response' in profile_data:
            if 'conversationHistory' not in updated_profile:
                updated_profile['conversationHistory'] = []
            
            updated_profile['conversationHistory'].append({
                "timestamp": datetime.datetime.now().isoformat(),
                "message": profile_data['message'],
                "response": profile_data['response']
            })
        
        with open(PROFILE_FILE, 'w') as f:
            json.dump(updated_profile, f, indent=2)
        
        return updated_profile
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        return {}

# Helper function to read resources
def get_resources():
    try:
        if os.path.exists(RESOURCES_FILE):
            with open(RESOURCES_FILE, 'r') as f:
                return json.load(f)
        else:
            init_resources()
            with open(RESOURCES_FILE, 'r') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Error reading resources: {e}")
        return {"crisis": [], "self_help": [], "professional": []}

# Extract user information from message
def extract_user_info(message):
    user_info = {}
    
    # Simple rule-based extraction (in production would use NLP models)
    lowercase_msg = message.lower()
    
    # Extract feeling
    feeling_indicators = ["feeling", "feel", "felt", "mood", "emotion"]
    for indicator in feeling_indicators:
        if indicator in lowercase_msg:
            # Simple extraction - would be more sophisticated in production
            words_after = lowercase_msg.split(indicator)[1].strip().split()[:10]
            if words_after:
                user_info["feelingToday"] = " ".join(words_after)
                break
    
    # Extract sleep quality
    sleep_indicators = ["slept", "sleep", "insomnia", "tired", "rest", "rested"]
    for indicator in sleep_indicators:
        if indicator in lowercase_msg:
            words_after = lowercase_msg.split(indicator)[1].strip().split()[:10]
            if words_after:
                user_info["sleepQuality"] = " ".join(words_after)
                break
    
    # Extract stress level
    stress_indicators = ["stress", "stressed", "anxiety", "anxious", "overwhelmed"]
    for indicator in stress_indicators:
        if indicator in lowercase_msg:
            words_after = lowercase_msg.split(indicator)[1].strip().split()[:10]
            if words_after:
                user_info["stressLevel"] = " ".join(words_after)
                break
    
    # Extract name (very simple approach)
    name_indicators = ["my name is", "i am", "i'm", "call me"]
    for indicator in name_indicators:
        if indicator in lowercase_msg:
            words_after = lowercase_msg.split(indicator)[1].strip().split()
            if words_after and len(words_after[0]) > 1:  # Simple check to avoid pronouns
                user_info["name"] = words_after[0].capitalize()
                break
    
    return user_info

# Fallback response generation without using the model
def generate_fallback_response(message, history=None):
    # Get user profile for personalization
    profile = get_profile()
    user_name = profile.get("name", "")
    
    # Personalized greeting if name is available
    greeting = f"Hi {user_name}, " if user_name else "Hi, "
    
    # Check for common patterns in the message
    message_lower = message.lower()
    
    # Check for greetings
    greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]
    if any(greeting in message_lower for greeting in greetings):
        responses = [
            f"{greeting}how are you feeling today?",
            f"{greeting}it's good to chat with you. How has your day been?",
            f"{greeting}I'm here to support you. How are you doing mentally today?"
        ]
        return random.choice(responses)
    
    # Check for how are you type questions
    how_are_you = ["how are you", "how do you feel", "how's it going", "how are things"]
    if any(phrase in message_lower for phrase in how_are_you):
        responses = [
            "I'm here and ready to help you. More importantly, how are you feeling today?",
            "I'm functioning well! But I'd like to know more about how you're doing.",
            "I'm here to support you. Would you like to share how you've been feeling lately?"
        ]
        return random.choice(responses)
    
    # Check for mental health concerns
    anxiety_patterns = ["anxious", "anxiety", "worried", "nervous", "panicking"]
    if any(pattern in message_lower for pattern in anxiety_patterns):
        responses = [
            "It sounds like you might be experiencing some anxiety. Deep breathing exercises can sometimes help - try breathing in for 4 counts, holding for 2, and exhaling for 6. Would you like to try some other relaxation techniques?",
            "I hear that you're feeling anxious. That's a common emotion that many people experience. Have you found any strategies that help you manage anxiety in the past?",
            "Anxiety can be challenging to deal with. Some people find that mindfulness exercises help. Would you like to talk more about what's causing these feelings?"
        ]
        return random.choice(responses)
    
    depression_patterns = ["depressed", "depression", "sad", "hopeless", "unmotivated"]
    if any(pattern in message_lower for pattern in depression_patterns):
        responses = [
            "I'm sorry to hear you're feeling this way. Depression can be really difficult. Have you been able to talk to anyone about how you're feeling?",
            "Thank you for sharing that with me. Many people experience depression, and there are resources that can help. Would it be helpful to talk about some self-care strategies?",
            "I'm here to listen. Depression affects many people differently. Could you tell me more about how it's affecting your daily life?"
        ]
        return random.choice(responses)
    
    sleep_patterns = ["can't sleep", "insomnia", "sleeping", "tired", "exhausted"]
    if any(pattern in message_lower for pattern in sleep_patterns):
        responses = [
            "Sleep difficulties can really impact our mental health. Have you tried establishing a regular sleep routine? Going to bed and waking up at the same time each day can help.",
            "I understand how frustrating sleep problems can be. Limiting screen time before bed and creating a calming bedtime routine might help. Would you like more sleep hygiene tips?",
            "Sleep is so important for our wellbeing. Some people find relaxation techniques before bed helpful. Would you like to talk more about what might be affecting your sleep?"
        ]
        return random.choice(responses)
    
    # Check for thank you messages
    thank_you = ["thank you", "thanks", "appreciate", "helpful"]
    if any(phrase in message_lower for phrase in thank_you):
        responses = [
            "You're welcome! I'm glad I could help. Is there anything else you'd like to talk about?",
            "I'm happy to support you on your mental health journey. Feel free to reach out anytime.",
            "You're very welcome. Taking care of your mental health is important, and I'm here to help with that."
        ]
        return random.choice(responses)
    
    # Default responses for when no pattern is matched
    default_responses = [
        "I'm here to support you. Could you tell me more about how you're feeling today?",
        "Thank you for sharing that with me. How has this been affecting your daily life?",
        "I'm listening. Would you like to explore some coping strategies together?",
        "Mental health is an important journey. What kind of support are you looking for today?",
        "I'm here to help. Could you share more about what's been on your mind recently?"
    ]
    
    return random.choice(default_responses)

# Generate response using Mistral model and RAG when available, or fallback
def generate_response(message, history=None):
    try:
        # Log attempt to generate response
        logger.info(f"Generating response for message: {message[:30]}...")
        
        # Check if model is loaded
        if model is None or tokenizer is None:
            logger.warning("Model not loaded, using fallback response generator")
            return generate_fallback_response(message, history)

        # Get relevant context from RAG
        rag_context = ""
        if vector_store is not None:
            try:
                results = vector_store.similarity_search(message, k=2)
                if results:
                    rag_context = "\n\n".join([doc.page_content for doc in results])
            except Exception as e:
                logger.error(f"Error in RAG retrieval: {str(e)}")
        
        # Prepare profile context
        profile = get_profile()
        profile_context = ""
        if profile and profile.get("name"):
            profile_context += f"User's name: {profile.get('name')}\n"
        if profile and profile.get("feelingToday"):
            profile_context += f"User's recent feeling: {profile.get('feelingToday')}\n"
        if profile and profile.get("sleepQuality"):
            profile_context += f"User's sleep quality: {profile.get('sleepQuality')}\n"
        if profile and profile.get("stressLevel"):
            profile_context += f"User's stress level: {profile.get('stressLevel')}\n"

        # Create conversation history context
        history_context = ""
        if history and len(history) > 0:
            for msg in history:
                sender = "User" if msg.get("sender") == "user" else "Assistant"
                history_context += f"{sender}: {msg.get('content', '')}\n"

        # Create system prompt with all context
        system_prompt = f"""You are MindfulAI, a compassionate mental health assistant.
Your goal is to provide supportive, evidence-based responses to help users with their mental wellness.
Be empathetic, non-judgmental, and focus on active listening and validation.
Never provide medical diagnoses or replace professional mental health care.

USER PROFILE:
{profile_context}

RELEVANT MENTAL HEALTH INFORMATION:
{rag_context}

CONVERSATION HISTORY:
{history_context}

When responding to the user:
1. Show empathy and understanding
2. Ask follow-up questions to better understand their situation when appropriate
3. Provide practical, evidence-based suggestions
4. Encourage self-care and healthy coping strategies
5. Suggest professional help when appropriate
6. Keep responses concise, warm, and conversational

User message: {message}
"""

        # Generate response
        messages = [{"role": "system", "content": system_prompt}]
        input_ids = tokenizer.apply_chat_template(messages, return_tensors="pt").to(device)
        
        with torch.no_grad():
            outputs = model.generate(
                input_ids,
                max_new_tokens=512,
                do_sample=True,
                top_p=0.9,
                temperature=0.7,
                pad_token_id=tokenizer.eos_token_id
            )
        
        response = tokenizer.decode(outputs[0][input_ids.shape[1]:], skip_special_tokens=True).strip()
        
        # Sometimes the model outputs role prefixes in its response, remove them
        if response.startswith("Assistant:"):
            response = response[len("Assistant:"):].strip()
        
        logger.info("Generated response successfully using model")
        return response
    
    except Exception as e:
        logger.error(f"Error generating model response: {str(e)}")
        logger.info("Falling back to rule-based response generator")
        return generate_fallback_response(message, history)

# API routes
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        history = data.get('history', [])
        
        logger.info(f"Received chat request: {message[:30]}...")
        
        # Extract user information
        user_info = extract_user_info(message)
        
        # Generate response
        response = generate_response(message, history)
        
        # Update profile with message and response
        if user_info:
            user_info['message'] = message
            user_info['response'] = response
            update_profile(user_info)
            logger.info(f"Updated user profile with extracted info: {user_info.keys()}")
        
        return jsonify({
            "message": response,
            "profile_updates": user_info
        })
    
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "message": "I'm here to support you, but I'm having some technical difficulties. Could you try rephrasing or asking something else?",
            "profile_updates": {}
        })

@app.route('/api/profile', methods=['GET', 'POST'])
def profile():
    if request.method == 'GET':
        try:
            profile_data = get_profile()
            logger.info("Profile data retrieved successfully")
            return jsonify(profile_data)
        except Exception as e:
            logger.error(f"Error retrieving profile: {str(e)}")
            return jsonify({}), 200  # Return empty profile rather than error
    else:  # POST
        try:
            profile_data = request.json
            updated_profile = update_profile(profile_data)
            logger.info("Profile updated successfully")
            return jsonify(updated_profile)
        except Exception as e:
            logger.error(f"Error updating profile: {str(e)}")
            return jsonify({"error": "Failed to update profile"}), 500

@app.route('/api/resources', methods=['GET'])
def resources():
    try:
        resources_data = get_resources()
        logger.info("Resources retrieved successfully")
        return jsonify(resources_data)
    except Exception as e:
        logger.error(f"Error retrieving resources: {str(e)}")
        return jsonify({"crisis": [], "self_help": [], "professional": []}), 200

@app.route('/health', methods=['GET'])
def health_check():
    model_status = "loaded" if model is not None else "not loaded"
    tokenizer_status = "loaded" if tokenizer is not None else "not loaded"
    vector_store_status = "initialized" if vector_store is not None else "not initialized"
    
    status = {
        "status": "healthy",
        "model": model_status,
        "tokenizer": tokenizer_status,
        "vector_store": vector_store_status,
        "fallback_available": True
    }
    
    logger.info(f"Health check: {status}")
    return jsonify(status)

@app.route('/', methods=['GET'])
def root():
    return "MindfulAI Mental Health Chatbot API is running. Use /api/chat, /api/profile, /api/resources endpoints."

if __name__ == '__main__':
    logger.info("Starting Flask application")
    app.run(debug=True, host='0.0.0.0', port=5000)