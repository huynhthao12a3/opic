// 1. Variable
const synth = window.speechSynthesis;
const timerDisplay = document.getElementById('timer');
const questionSelect = document.getElementById('questionSelect');
const readButton = document.getElementById('readButton');
const notification = document.getElementById('notification');
const replayButton = document.getElementById('replayButton');
const showIntroduceButton = document.getElementById('showIntroduceButton');

let timerInterval;
let startTime;
let currentQuestion = []; // Now an array
let lastSpokenText = '';

// Voices
const voiceSelect = document.getElementById('voiceSelect');
function initVoices() {
    const voices = window.speechSynthesis.getVoices();
    const newVoices = voices.filter(item => item.lang == "en-US")
    newVoices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = voice.name;
        voiceSelect.appendChild(option);
    });
}

// 2. Question data
const questionData = {
    cooking: {
        original: [
            `You indicated in the survey that you like cooking. How did you become interested in cooking? What do you usually cook? Could you tell me something about it in as much detail as possible? What kind of food do you like to cook? Why? Tell me how to cook. How often do you cook? When and where do you usually cook?`,
            `Tell me about the first time you cooked. What was it? How did it taste?`,
            `Maybe something unexpected happened when you cooked. Tell me about your experience with details. What kind of food do you cook? And what was wrong with it?`
        ],
        remaining: []
    },
    familyandfriend: {
        original: [
            `Talk about a time when you visited a friend or a family member recently. What did you do when you visited them? What was memorable about that visit`,
            `Please introduce your family. How many people are in your family? What is your personality like? Please be specific. `,
            `I would like to know about your friend. What kind of person is he/she? How did you become friends with him or her?`,
            `Describe two different friends or family members describe each of them in as much detail as you can and then tell me about the things they have in common and the differences between them.`
        ],
        remaining: []
    },
    house: {
        original: [
            `I would like to know where you live. Talk about the different rooms in your home. Tell me about your favorite room in your home? What does it look like?`,
            `Can you tell me about the household appliances in your house? What is your favorite one among them why do you like it the most? What furniture do you have in your room? Also, what is your favorite? Why do you find it special?  `,
            `What kind of housework did you do when you were young? Tell me how you helped out around the house in your childhood.`
        ],
        remaining: []
    },
    neighborhood: {
        original: [
            `Let's talk about where you live. Tell me what you like and don't like about your neighborhood.`,
            `What are the things you did to change your home? Did you buy new furniture or paintings? Tell me about everything you did.`,
            `Tell me about some memorable events since you moved there.`
        ],
        remaining: []
    },
    vacation: {
        original: [
            `What activities do you enjoy doing at home during your vacation? Describe exactly what you did during the last vacation that you spent at home, give me a description of what you did from the first to the last, talk about all the people you saw and everything that you did?`,
            `Could you tell me about an unusual or unexpected experience you had during a vacation you had at home? Who was involved and why was this experience so memorable?`,
            `You indicated that you take vacations at home. What do people in your country normally do on their vacations? How has the way they spend vacations changed over the years? Give me specific examples.`
        ],
        remaining: []
    },
    park: {
        original: [
            `You indicated that you go to the park. Where is it located? Describe the park you like to go to in detail.`,
            `Describe the last time you went to a park. When was it with whom last weekend?`,
            `Tell me about a memorable event that happened at the park you often go to. When was it? What was the event about? What did you do there at that time? Why was it so memorable? Tell me in as much detail as you can.`
        ],
        remaining: []
    },
    walk: {
        original: [
            `Can you describe a place where you often go for a walk?`,
            `Where do you usually walk, and why do you like that place?`,
            `Do you prefer walking alone or with someone else? Why?`,
            `Have you ever had a memorable experience while walking?`
        ],
        remaining: []
    },
    music: {
        original: [
            `How often do you listen to music? When and where do you usually listen to music? What kind of music device do you use when listening to music? Tell me all the details.`,
            `What kind of music do you like? Why? Who is your favorite singer or composer?`,
            `When and how did you first become interested in listening to music? Was there a special reason? If so, why?`,
            `Tell me about the special moments or episodes you've experienced while listening to music.`
        ],
        remaining: []
    },
    movie: {
        original: [
            `In your background survey you indicated that you like to watch movies. What kind of movie do you like, are there any reasons you like specific movies?`,
            `Tell me about your favorite movie. What is that and what is the story line? Who is the star of the movie and why do you like it?`,
            `Who is your favorite character from any movie or TV show? Why is that character you describe him or her in detail`,
            `Describe the theater you go to. What does it look like? Why do you like going there? Tell me everything you can remember.`
        ],
        remaining: []
    },
    work: {
        original: [
            `You indicated you work. Please give me a description of the company you work for. What is the name of the company? What kind of business does it do? Where is it located? Give me a detailed description of your company?`,
            `You indicated in the survey that you work. Describe your manager or boss to me in detail. What kind of person is he or she?`,
            `What do you usually do at work? Do you read emails or attend meetings? What else do you do at work?`,
            `You indicated that you work. Where is your office located? And can you tell me what your office or work space looks like in as much detail as possible?`,
            `Do you have a dress code in your company? Are you allowed to wear casual clothing at work? Which do you prefer, casual or formal office attire?`,
            `Tell me how you get from your house to work everyday from beginning to end. How long does it usually take to get to work?`
        ],
        remaining: []
    },
    internet: {
        original: [
            `How often do you use the internet and for what purposes?`,
            `What do people normally do on the internet? Do they play games watch television or watch movies? Talk about all the things people do online.`,
            `Tell me about your early experience of surfing the internet. What do you remember particularly about that experience?`
        ],
        remaining: []
    }
};

// 3. Dropdown Object
function initDropdown() {
    const questions = Object.keys(questionData);
    questions.forEach((question, index) => {
        const option = document.createElement('option');
        option.value = question;
        option.textContent = (index+1) + ". " + question.charAt(0).toUpperCase() + question.slice(1);
        questionSelect.appendChild(option);
    });

    // Enable multiple selections
    questionSelect.setAttribute('multiple', 'true');

    loadDropdown();
}



function loadDropdown() {
    // Get the list of selected topics
    console.log("load drodown")
    const selectedQuestions = Array.from(questionSelect.selectedOptions).map(option => option.value);

    currentQuestion = selectedQuestions; // Store selected questions in the array

    // Initialize 'remaining' array for selected topics
    currentQuestion.forEach(question => {
        if (!questionData[question].remaining) {
            questionData[question].remaining = [];
        }
        questionData[question].remaining = [...questionData[question].original];
    });

    notification.classList.add('hidden');
    stopTimer();
    replayButton.style.display = 'none';
}

questionSelect.addEventListener('change', () => {
    synth.cancel();
    loadDropdown();
});

// Allow multiple selections without Ctrl key
questionSelect.addEventListener('mousedown', function(e) {
    e.preventDefault();
    const option = e.target;
    option.selected = !option.selected;
});

// 4. Read question
async function readQuestion() {
     

     console.log("currentQuestion: ", currentQuestion )
 
    if (!currentQuestion || currentQuestion.length === 0) {
        console.error('No question selected');
        notification.classList.remove('hidden');
        return;
    }

    // Combine remaining questions from all selected topics
    let remainingQuestions = [];
    currentQuestion.forEach(topic => {
        if (questionData[topic] && questionData[topic].remaining) {
            remainingQuestions = remainingQuestions.concat(questionData[topic].remaining);
        }
    });

    if (remainingQuestions.length === 0) {
        notification.classList.remove('hidden');
        return;
    }

     console.log("remainingQuestions: ", remainingQuestions )


    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    const question = remainingQuestions[randomIndex];

    lastSpokenText = question;

    // Remove the selected question from all topics
    currentQuestion.forEach(topic => {
        if (questionData[topic] && questionData[topic].remaining.includes(question)) {
            const index = questionData[topic].remaining.indexOf(question);
            questionData[topic].remaining.splice(index, 1);
        }
    });

    replayButton.style.display = 'inline-block';

    await speakQuestion(question);
}

// 5. Speak question
function speakQuestion(question) {
    return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(question);
        utterance.lang = 'en-US';

        const selectedVoiceName = voiceSelect.value;
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
            readButton.disabled = true;
            replayButton.disabled = true;
            stopTimer();
        };

        utterance.onend = () => {
            startTimer();
            readButton.disabled = false;
            replayButton.disabled = false;

            // Check if any questions are remaining after speaking
            let totalRemaining = 0;
            currentQuestion.forEach(topic => {
                if (questionData[topic] && questionData[topic].remaining) {
                    totalRemaining += questionData[topic].remaining.length;
                }
            });

            if (totalRemaining === 0) {
                notification.classList.remove('hidden');
            }

            resolve();
        };
        synth.speak(utterance);
    });
}


// 6. Reply question
function replayQuestion() {
    if (lastSpokenText) {
        speakQuestion(lastSpokenText);
    }
}

// 7. Timer
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerDisplay.textContent = "00:00";
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)} seconds`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

// 8. Main handle
readButton.addEventListener('click', readQuestion);
replayButton.addEventListener('click', replayQuestion);
showIntroduceButton.addEventListener('click', showIntroduceHtml);

// 9. Onload, run first
window.onload = () => {
    if (!synth) {
        alert('Text-to-Speech not supported. Please change browser.');
        readButton.disabled = true;
        return;
    }
    initDropdown();
    initVoices();
};

function showIntroduceHtml() {
  var htmlShow = document.getElementById("html-show");
  if (htmlShow.style.display === "none") {
    htmlShow.style.display = "block";
  } else {
    htmlShow.style.display = "none";
  }
}
