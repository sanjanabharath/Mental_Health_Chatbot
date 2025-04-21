# MindAI: Your Compassionate Mental Health Companion

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MindAI is a Flask-based mental health chatbot API designed to provide supportive and evidence-based conversations. It leverages the power of large language models (specifically [Mistral-7B-Instruct-v0.2](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2)) for generating empathetic responses, enhanced with retrieval-augmented generation (RAG) using a Chroma vector store built from mental health resources. When the primary model is unavailable, a rule-based fallback mechanism ensures continuous support.

## Features

* **Empathetic Chat:** Engages in conversations with a focus on understanding and validating user feelings.
* **Knowledge-Enhanced Responses:** Utilizes a vector database of mental health information to provide relevant and helpful responses.
* **User Profile Management:** Stores and updates user information (name, feelings, sleep quality, stress level, conversation history) to personalize interactions.
* **Resource Recommendations:** Offers links to crisis helplines, self-help resources, and professional support based on the conversation.
* **Fallback Mechanism:** Implements a rule-based response generator to ensure functionality even if the primary language model encounters issues.
* **Health Check Endpoint:** Provides an endpoint to monitor the API's health status, including the loading status of the model and vector store.
* **CORS Enabled:** Allows cross-origin requests, making it easy to integrate with frontend applications.
* **Logging:** Comprehensive logging of application activities and potential errors.

## Getting Started

### Prerequisites

* **Python 3.7+**
* **pip** (Python package installer)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd MindAI
    ```

2.  **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```
    This command will install all the necessary dependencies listed in the `requirements.txt` file:
    ```
    flask==2.3.3
    flask-cors==4.0.0
    transformers==4.35.2
    torch==2.6.0
    langchain==0.0.335
    chromadb==0.4.18
    sentence-transformers==2.2.2
    huggingface-hub==0.19.4
    python-dotenv==1.0.0
    ```

### Running the Application

1.  **Run the `app.py` script:**
    ```bash
    python app.py
    ```
    The API will start running on `http://0.0.0.0:5000/`.

### API Endpoints

* **`/api/chat` (POST):**
    * Accepts a JSON payload with `message` (the user's input) and optionally `history` (an array of previous messages in the conversation).
    * Returns a JSON response containing the chatbot's `message` and any `profile_updates` based on the user's input.
    * Example request:
        ```json
        {
            "message": "I've been feeling really stressed lately.",
            "history": [
                {"sender": "user", "content": "Hello"},
                {"sender": "assistant", "content": "Hi, how are you feeling today?"}
            ]
        }
        ```
    * Example response:
        ```json
        {
            "message": "I hear that you're feeling stressed. It's important to acknowledge those feelings. Have you identified any specific triggers for your stress?",
            "profile_updates": {
                "stressLevel": "really stressed"
            }
        }
        ```

* **`/api/profile` (GET, POST):**
    * **GET:** Retrieves the current user profile as a JSON object.
    * **POST:** Accepts a JSON payload to update the user profile. The keys in the JSON will be merged with the existing profile.
    * Example GET response:
        ```json
        {
            "name": "John",
            "feelingToday": "a bit down",
            "sleepQuality": "not great",
            "stressLevel": "moderate",
            "lastCheckIn": "2025-04-21T10:30:00.000Z",
            "nextFollowUp": "",
            "conversationHistory": [ ... ],
            "identifiedConcerns": [],
            "recommendedResources": []
        }
        ```
    * Example POST request:
        ```json
        {
            "feelingToday": "better",
            "sleepQuality": "good"
        }
        ```

* **`/api/resources` (GET):**
    * Retrieves a JSON object containing lists of crisis resources, self-help resources, and professional support links.
    * Example response:
        ```json
        {
            "crisis": [
                {"name": "988 Suicide & Crisis Lifeline", "link": "[https://988lifeline.org/](https://988lifeline.org/)"},
                // ... more crisis resources
            ],
            "self_help": [
                {"name": "Anxiety Management Techniques", "link": "[https://www.mind.org.uk/information-support/types-of-mental-health-problems/anxiety-and-panic-attacks/self-care/](https://www.mind.org.uk/information-support/types-of-mental-health-problems/anxiety-and-panic-attacks/self-care/)"},
                // ... more self-help resources
            ],
            "professional": [
                {"name": "Find a Therapist", "link": "[https://www.psychologytoday.com/us/therapists](https://www.psychologytoday.com/us/therapists)"},
                // ... more professional resources
            ]
        }
        ```

* **`/health` (GET):**
    * Provides a health status check of the API, indicating if it's running, the model and tokenizer loading status, the vector store initialization status, and the availability of the fallback mechanism.
    * Example response:
        ```json
        {
            "status": "healthy",
            "model": "loaded",
            "tokenizer": "loaded",
            "vector_store": "initialized",
            "fallback_available": true
        }
        ```

* **`/` (GET):**
    * A basic endpoint that indicates the API is running and provides a brief description of the available API endpoints.

## Data Storage

The application utilizes the following files and directories within the `data` directory:

* **`profile.json`:** Stores the user's profile information, including their name, recent feelings, sleep quality, stress level, last check-in time, conversation history, identified concerns, and recommended resources.
* **`resources.json`:** Contains a curated list of mental health resources categorized as crisis, self-help, and professional support.
* **`knowledge/`:** A directory containing `.txt` files with information related to various mental health topics (e.g., anxiety, depression, stress management). These files are used to build the vector store.
* **`chroma_db/`:** A directory where the Chroma vector store is persisted. This database stores embeddings of the text documents in the `knowledge/` directory, enabling efficient retrieval of relevant information.

## Logging

The application uses Python's `logging` module to record important events, errors, and information. Logs are written to both the `app.log` file and the console. This helps in monitoring the application's behavior and debugging any issues.

## Contributing

Contributions to MindAI are welcome! Please feel free to submit pull requests with bug fixes, new features, or improvements to the existing codebase. For significant changes, it's recommended to open an issue first to discuss the proposed changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

**MindAI is intended for informational and supportive purposes only and does not provide medical advice, diagnosis, or treatment. It is not a substitute for professional mental health care. If you are experiencing a mental health crisis, please seek help from a qualified professional or use the crisis resources provided.**
