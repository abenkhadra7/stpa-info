document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add animation to concept cards on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all concept cards
    document.querySelectorAll('.concept-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
    
    // Apply the same animation effect to quiz sections
    document.querySelectorAll('.quiz-section').forEach(quiz => {
        quiz.style.opacity = '0';
        quiz.style.transform = 'translateY(20px)';
        quiz.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(quiz);
    });

    // Quiz functionality
    setupQuizzes();
});

// Enhanced quiz functionality
function setupQuizzes() {
    // Track completion status for all quizzes
    const quizStatus = {};
    
    // Initialize quiz tracking
    document.querySelectorAll('.quiz-question').forEach((question, index) => {
        const questionId = question.querySelector('input[type="radio"]').name;
        quizStatus[questionId] = false;
        
        // Add educative.io-like focus effect on options
        const options = question.querySelectorAll('.option');
        options.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            
            option.addEventListener('click', () => {
                // Select the radio when clicking anywhere on the option
                radio.checked = true;
                
                // Add visual selection effect
                options.forEach(opt => opt.classList.remove('option-selected'));
                option.classList.add('option-selected');
            });
        });
    });
    
    // Add listeners to all submit buttons
    document.querySelectorAll('.submit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const questionContainer = this.closest('.quiz-question');
            const questionId = questionContainer.querySelector('input[type="radio"]').name;
            const correctAnswer = this.getAttribute('data-correct');
            
            checkAnswer(questionId, correctAnswer);
            
            // Add completion marker
            if (!quizStatus[questionId]) {
                quizStatus[questionId] = true;
                updateProgressIndicator();
            }
        });
    });
    
    // Add a quiz progress indicator to the page
    addQuizProgressIndicator();
}

// Function to check quiz answers - replacing the inline function from HTML
function checkAnswer(questionId, correctAnswer) {
    // Hide all feedback for this question
    const feedbacks = document.querySelectorAll(`[id^=feedback-${questionId}]`);
    feedbacks.forEach(feedback => {
        feedback.style.display = 'none';
    });
    
    // Get selected answer
    const selectedOption = document.querySelector(`input[name="${questionId}"]:checked`);
    
    if (selectedOption) {
        const answer = selectedOption.value;
        
        // Show relevant feedback with animation
        const feedbackElement = document.getElementById(`feedback-${questionId}-${answer}`);
        if (feedbackElement) {
            feedbackElement.style.display = 'block';
            feedbackElement.style.animation = 'fadeIn 0.5s';
        }
        
        // Highlight correct/incorrect with educative.io style
        const options = document.querySelectorAll(`input[name="${questionId}"]`);
        options.forEach(option => {
            const parentDiv = option.closest('.option');
            parentDiv.classList.remove('correct-answer', 'incorrect-answer', 'unselected-answer');
            
            if (option.value === correctAnswer) {
                parentDiv.classList.add('correct-answer');
                // Add checkmark icon
                let iconSpan = parentDiv.querySelector('.result-icon');
                if (!iconSpan) {
                    iconSpan = document.createElement('span');
                    iconSpan.className = 'result-icon';
                    parentDiv.appendChild(iconSpan);
                }
                iconSpan.innerHTML = '✓';
                iconSpan.style.color = '#95bf47';
            } 
            else if (option.checked) {
                parentDiv.classList.add('incorrect-answer');
                // Add X icon
                let iconSpan = parentDiv.querySelector('.result-icon');
                if (!iconSpan) {
                    iconSpan = document.createElement('span');
                    iconSpan.className = 'result-icon';
                    parentDiv.appendChild(iconSpan);
                }
                iconSpan.innerHTML = '✗';
                iconSpan.style.color = '#bf7247';
            }
            else {
                parentDiv.classList.add('unselected-answer');
            }
        });
        
        // Disable further selections after answering
        options.forEach(option => {
            option.disabled = true;
        });
        
        // Change button text and disable it
        const submitBtn = document.querySelector(`.quiz-question:has(input[name="${questionId}"]) .submit-btn`);
        if (submitBtn) {
            submitBtn.textContent = 'Answered';
            submitBtn.disabled = true;
            submitBtn.classList.add('answered-btn');
        }
        
        // If correct, add success animation
        if (selectedOption.value === correctAnswer) {
            const questionDiv = selectedOption.closest('.quiz-question');
            questionDiv.classList.add('question-correct');
            setTimeout(() => {
                questionDiv.classList.remove('question-correct');
            }, 1500);
        }
    } else {
        alert('Please select an answer first.');
    }
}

// Add a progress indicator for quizzes
function addQuizProgressIndicator() {
    const quizSections = document.querySelectorAll('.quiz-section');
    const totalQuizzes = quizSections.length;
    
    if (totalQuizzes > 0) {
        const progressBar = document.createElement('div');
        progressBar.className = 'quiz-progress-container';
        progressBar.innerHTML = `
            <div class="quiz-progress-text">Quiz Progress: <span id="quiz-completed">0</span>/${totalQuizzes}</div>
            <div class="quiz-progress-bar-container">
                <div id="quiz-progress-bar" class="quiz-progress-bar"></div>
            </div>
        `;
        
        // Insert after the first heading
        const header = document.querySelector('header');
        if (header && header.nextElementSibling) {
            header.parentNode.insertBefore(progressBar, header.nextElementSibling);
        }
    }
}

// Update progress indicator
function updateProgressIndicator() {
    const quizSections = document.querySelectorAll('.quiz-section');
    const totalQuizzes = quizSections.length;
    
    // Count answered quizzes (those with disabled submit buttons)
    const answeredQuizzes = document.querySelectorAll('.submit-btn.answered-btn').length;
    
    // Update counter
    const counter = document.getElementById('quiz-completed');
    if (counter) {
        counter.textContent = answeredQuizzes;
    }
    
    // Update progress bar
    const progressBar = document.getElementById('quiz-progress-bar');
    if (progressBar) {
        const percentage = (answeredQuizzes / totalQuizzes) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

// Reading progress bar
window.onscroll = function() {
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = (winScroll / height) * 100;
    document.getElementById("progressBar").style.width = scrolled + "%";
};
