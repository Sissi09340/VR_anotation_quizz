/* global AFRAME */

// Data for our quiz questions
const QUIZ_DATA = {
    1: {
      videoId: "#vid1", // Corresponds to the ID in <a-assets>
      question: "What is the function of this part?",
      answers: [
        { text: "Pumping Blood", correct: true },
        { text: "Filtering Air", correct: false },
      ]
    },
    2: {
      videoId: "#vid2",
      question: "Which chamber is this?",
      answers: [
        { text: "Left Ventricle", correct: false },
        { text: "Right Atrium", correct: true },
      ]
    }
    // Add more questions here with unique IDs
  };
  
  
  /**
   * Annotation Handler Component
   * Attached to each annotation point.
   * Emits an event to open the quiz modal when clicked.
   */
  AFRAME.registerComponent('annotation-handler', {
    schema: {
      id: { type: 'number' } // Unique ID for the question
    },
  
    init: function () {
      // Add a 'click' event listener to this entity
      this.el.addEventListener('click', (evt) => {
        // When clicked, emit a custom event with the question ID
        // The scene's 'quiz-manager' will listen for this event
        this.el.sceneEl.emit('open-quiz', { questionId: this.data.id });
  
        // Optional: Make other annotations less visible
        document.querySelectorAll('.annotation').forEach(el => {
          el.setAttribute('material', 'opacity', 0.3);
        });
      });
    }
  });
  
  
  /**
   * Quiz Manager Component
   * Attached to the <a-scene> entity. Manages the state of the quiz.
   */
  AFRAME.registerComponent('quiz-manager', {
    init: function () {
      this.quizPanel = document.getElementById('quiz-panel');
      this.quizVideoEl = document.getElementById('quiz-video');
      this.questionTextEl = document.getElementById('question-text');
      this.answerBtn1 = document.getElementById('answer-btn-1');
      this.answerBtn2 = document.getElementById('answer-btn-2');
      this.answerText1 = document.getElementById('answer-text-1');
      this.answerText2 = document.getElementById('answer-text-2');
      this.scoreTextEl = document.getElementById('score-text');
  
      this.goodAnswers = 0;
      this.badAnswers = 0;
      this.currentQuestion = null;
  
      // Listen for the custom event from the annotations
      this.el.sceneEl.addEventListener('open-quiz', this.openQuiz.bind(this));
  
      // Listen for clicks on the answer buttons
      this.answerBtn1.addEventListener('click', () => this.handleAnswer(0));
      this.answerBtn2.addEventListener('click', () => this.handleAnswer(1));
    },
  
    openQuiz: function (evt) {
      const questionId = evt.detail.questionId;
      this.currentQuestion = QUIZ_DATA[questionId];
  
      if (!this.currentQuestion) {
        console.error("Question data not found for ID:", questionId);
        return;
      }
  
      // Populate the quiz panel
      this.quizVideoEl.setAttribute('src', this.currentQuestion.videoId);
      this.questionTextEl.setAttribute('value', this.currentQuestion.question);
      this.answerText1.setAttribute('value', this.currentQuestion.answers[0].text);
      this.answerText2.setAttribute('value', this.currentQuestion.answers[1].text);
      
      // Play the video and show the panel
      const video = document.querySelector(this.currentQuestion.videoId);
      video.currentTime = 0;
      video.play();
      this.quizPanel.setAttribute('visible', true);
    },
  
    handleAnswer: function (answerIndex) {
      if (!this.currentQuestion) return;
  
      const isCorrect = this.currentQuestion.answers[answerIndex].correct;
  
      if (isCorrect) {
        this.goodAnswers++;
        console.log("Correct Answer!");
        // Optional feedback
        this.flashFeedback(this.answerBtn1.id === `answer-btn-${answerIndex+1}` ? this.answerBtn1 : this.answerBtn2, 'green');
      } else {
        this.badAnswers++;
        console.log("Wrong Answer!");
        // Optional feedback
        this.flashFeedback(this.answerBtn1.id === `answer-btn-${answerIndex+1}` ? this.answerBtn1 : this.answerBtn2, 'red');
      }
  
      this.updateScoreboard();
      this.closeQuiz();
    },
  
    updateScoreboard: function () {
      this.scoreTextEl.setAttribute('value', `Good: ${this.goodAnswers} | Bad: ${this.badAnswers}`);
    },
  
    closeQuiz: function () {
      // Hide the panel after a short delay to show feedback
      setTimeout(() => {
          this.quizPanel.setAttribute('visible', false);
          const video = document.querySelector(this.currentQuestion.videoId);
          video.pause();
  
          // Make annotations visible again
          document.querySelectorAll('.annotation').forEach(el => {
              el.setAttribute('material', 'opacity', 1.0);
          });
      }, 1000);
    },
      
    flashFeedback: function (buttonEl, color) {
      const originalColor = buttonEl.getAttribute('color');
      buttonEl.setAttribute('color', color);
      setTimeout(() => {
          buttonEl.setAttribute('color', originalColor);
      }, 1000);
    }
  });