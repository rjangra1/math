// Global vars for game state - yeah I know globals aren't great but whatever
let currentPage = 'home';
let activeExercise = null;
let mathQuestions = [];
let questionIndex = 0;
let currentScore = 0;
let userResponses = [];
// User progress data
let userData = {
    totalPoints: 0,
    completedExercises: 0,
    subjectCounts: {
        addition: 0,
        subtraction: 0, 
        multiplication: 0,
        division: 0
    },
    earnedBadges: []
};
// Badge system - could probably organize this better but it works
const badges = [
    {
        id: 'first_try',
        name: 'First Steps',
        description: 'Complete your first exercise',
        icon: 'fa-star',
        requirement: 1,
        type: 'exercises'
    },
    {
        id: 'point_collector',
        name: 'Point Collector', 
        description: 'Earn 100 points total',
        icon: 'fa-coins',
        requirement: 100,
        type: 'points'
    },
    {
        id: 'addition_pro',
        name: 'Addition Pro',
        description: 'Complete 5 addition exercises',
        icon: 'fa-plus',
        requirement: 5,
        type: 'addition'
    },
    {
        id: 'subtraction_star',
        name: 'Subtraction Star',
        description: 'Complete 5 subtraction exercises', 
        icon: 'fa-minus',
        requirement: 5,
        type: 'subtraction'
    },
    {
        id: 'multiplication_master',
        name: 'Multiplication Master',
        description: 'Complete 5 multiplication exercises',
        icon: 'fa-times',
        requirement: 5,
        type: 'multiplication'
    },
    {
        id: 'division_expert',
        name: 'Division Expert',
        description: 'Complete 5 division exercises',
        icon: 'fa-divide',
        requirement: 5,
        type: 'division'
    },
    {
        id: 'perfect_score',
        name: 'Perfect!',
        description: 'Get 100% on any exercise',
        icon: 'fa-trophy',
        requirement: 100,
        type: 'perfect'
    },
    {
        id: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: 'Complete 20 total exercises',
        icon: 'fa-graduation-cap',
        requirement: 20,
        type: 'exercises'
    },
    {
        id: 'math_champion',
        name: 'Math Champion',
        description: 'Earn 500 points total',
        icon: 'fa-crown',
        requirement: 500,
        type: 'points'
    },
    {
        id: 'all_rounder',
        name: 'All Rounder',
        description: 'Complete 10+ exercises in each subject',
        icon: 'fa-medal',
        requirement: 10,
        type: 'all_subjects'
    }
];
// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    refreshUI();
    setupEvents();
});
function loadData() {
    // Load from localStorage if it exists
    const saved = localStorage.getItem('mathLabData');
    if (saved) {
        try {
            userData = JSON.parse(saved);
        } catch (e) {
            console.log('Error loading data:', e);
        }
    }
}
function saveData() {
    // Save to localStorage
    localStorage.setItem('mathLabData', JSON.stringify(userData));
}
function refreshUI() {
    updateHomeStats();
    updateProfileData();
    updateBadgeDisplay();
}
function updateHomeStats() {
    document.getElementById('points').textContent = userData.totalPoints;
    document.getElementById('badges').textContent = userData.earnedBadges.length;
    
    // Calculate average - this could be better but works
    let avg = 0;
    if (userData.completedExercises > 0) {
        avg = Math.round((userData.totalPoints / userData.completedExercises) * 100 / 15);
    }
    document.getElementById('avg').textContent = avg + '%';
}
function updateProfileData() {
    document.getElementById('totalPoints').textContent = userData.totalPoints;
    document.getElementById('totalPractices').textContent = userData.completedExercises;
    // Update subject progress bars
    const subjects = ['addition', 'subtraction', 'multiplication', 'division'];
    subjects.forEach(function(subject) {
        const count = userData.subjectCounts[subject];
        const countElement = document.getElementById(subject === 'addition' ? 'addCount' : 
                                                   subject === 'subtraction' ? 'subCount' :
                                                   subject === 'multiplication' ? 'multCount' : 'divCount');
        const progressElement = document.getElementById(subject === 'addition' ? 'addProgress' :
                                                      subject === 'subtraction' ? 'subProgress' :
                                                      subject === 'multiplication' ? 'multProgress' : 'divProgress');
        
        countElement.textContent = count;
        const percentage = Math.min((count / 10) * 100, 100);
        progressElement.style.width = percentage + '%';
    });
}
function updateBadgeDisplay() {
    const container = document.getElementById('badgeDisplay');
    container.innerHTML = '';
    
    badges.forEach(function(badge) {
        const badgeDiv = document.createElement('div');
        badgeDiv.className = 'badge-item';
        
        const earned = userData.earnedBadges.includes(badge.id);
        if (earned) {
            badgeDiv.classList.add('earned');
        }
        
        badgeDiv.innerHTML = `
            <i class="fas ${badge.icon}"></i>
            <h4>${badge.name}</h4>
            <p>${badge.description}</p>
        `;
        
        container.appendChild(badgeDiv);
    });
}
function setupEvents() {
    // Enter key support for answer input
    const answerInput = document.getElementById('userAnswer');
    if (answerInput) {
        answerInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
    }
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.has-dropdown')) {
            const dropdown = document.getElementById('practiceMenu');
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        }
    });
}
function goToSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.page-content');
    sections.forEach(function(section) {
        section.classList.remove('show');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('show');
    }
    
    currentPage = sectionName;
    
    // Hide dropdown
    const dropdown = document.getElementById('practiceMenu');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}
function showDropdown() {
    const dropdown = document.getElementById('practiceMenu');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}
function startMathPractice(exerciseType) {
    activeExercise = exerciseType;
    mathQuestions = generateMathQuestions(exerciseType);
    questionIndex = 0;
    currentScore = 0;
    userResponses = [];
    
    goToSection('practice');
    updatePracticeHeader();
    showCurrentQuestion();
}
function generateMathQuestions(type) {
    const questions = [];
    
    // Generate 15 questions
    for (let i = 0; i < 15; i++) {
        let num1 = Math.floor(Math.random() * 20) + 1;
        let num2 = Math.floor(Math.random() * 12) + 1;
        
        // Sometimes swap the numbers
        if (Math.random() < 0.5) {
            const temp = num1;
            num1 = num2;
            num2 = temp;
        }
        
        let correctAnswer;
        let operator;
        
        if (type === 'addition') {
            correctAnswer = num1 + num2;
            operator = '+';
        } else if (type === 'subtraction') {
            // Make sure we don't get negative results
            if (num1 < num2) {
                const temp = num1;
                num1 = num2;
                num2 = temp;
            }
            correctAnswer = num1 - num2;
            operator = '-';
        } else if (type === 'multiplication') {
            correctAnswer = num1 * num2;
            operator = '×';
        } else if (type === 'division') {
            // For division, start with the answer and work backwards
            correctAnswer = num1;
            num1 = num1 * num2;
            operator = '÷';
        }
        
        questions.push({
            num1: num1,
            num2: num2,
            operator: operator,
            answer: correctAnswer
        });
    }
    
    return questions;
}
function updatePracticeHeader() {
    const titles = {
        'addition': 'Addition Practice',
        'subtraction': 'Subtraction Practice',
        'multiplication': 'Multiplication Practice',
        'division': 'Division Practice'
    };
    
    document.getElementById('practiceType').textContent = titles[activeExercise];
    document.getElementById('qNum').textContent = questionIndex + 1;
    document.getElementById('score').textContent = currentScore;
    
    // Update progress bar
    const progressPercent = (questionIndex / 15) * 100;
    document.getElementById('progressBar').style.width = progressPercent + '%';
}
function showCurrentQuestion() {
    const question = mathQuestions[questionIndex];
    
    document.getElementById('num1').textContent = question.num1;
    document.getElementById('mathOperator').textContent = question.operator;
    document.getElementById('num2').textContent = question.num2;
    
    // Clear previous answer and focus
    const answerField = document.getElementById('userAnswer');
    answerField.value = '';
    answerField.focus();
    
    // Clear message
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';
    messageDiv.className = 'result-message';
}

let isCorrect = true;

function checkAnswer() {
    if(!isCorrect) {
      isCorrect = true;
      moveToNext();
      return;
    }
    
    const userInput = parseInt(document.getElementById('userAnswer').value);
    const currentQuestion = mathQuestions[questionIndex];
    const messageDiv = document.getElementById('message');
    
    if (isNaN(userInput)) {
        messageDiv.textContent = 'Please enter a number!';
        messageDiv.className = 'result-message wrong';
        return;
    }
    
    isCorrect = userInput === currentQuestion.answer;
    
    // Store the response
    userResponses.push({
        question: currentQuestion,
        userAnswer: userInput,
        correct: isCorrect
    });
    
    if (isCorrect) {
        currentScore++;
        messageDiv.textContent = 'Correct! Great job! 🎉';
        messageDiv.className = 'result-message right';
        moveToNext()
    } else {
        messageDiv.textContent = `Oops! The right answer is ${currentQuestion.answer}`;
        messageDiv.className = 'result-message wrong';
        // Move to next question after delay
    
    }
    
    
}
function skipThis() {
    const currentQuestion = mathQuestions[questionIndex];
    
    // Record as skipped/wrong
    userResponses.push({
        question: currentQuestion,
        userAnswer: null,
        correct: false
    });
    
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = `Skipped! Answer was ${currentQuestion.answer}`;
    messageDiv.className = 'result-message wrong';
    
    setTimeout(function() {
        moveToNext();
    }, 1500);
}
function moveToNext() {
    questionIndex++;
    
    if (questionIndex < 15) {
        updatePracticeHeader();
        showCurrentQuestion();
    } else {
        showFinalResults();
    }
}
function showFinalResults() {
    const percentage = Math.round((currentScore / 15) * 100);
    const pointsEarned = currentScore;
    
    // Update user data
    userData.totalPoints += pointsEarned;
    userData.completedExercises++;
    userData.subjectCounts[activeExercise]++;
    
    // Update results display
    document.getElementById('correctCount').textContent = currentScore;
    document.getElementById('wrongCount').textContent = 15 - currentScore;
    document.getElementById('earnedPoints').textContent = pointsEarned;
    
    // Animate the circular progress
    animateScoreCircle(percentage);
    
    // Check for new badges
    checkForNewBadges(percentage);
    
    // Save data
    saveData();
    
    // Show results page
    goToSection('results');
}
function animateScoreCircle(percentage) {
    const circle = document.getElementById('circularScore');
    const scoreText = document.getElementById('finalPercent');
    
    // Reset circle
    circle.style.background = 'conic-gradient(rgba(255,255,255,0.1) 0deg, rgba(255,255,255,0.1) 360deg)';
    
    setTimeout(function() {
        const degrees = (percentage / 100) * 360;
        let color1 = '#32CD32';
        let color2 = '#90EE90';
        
        // Change colors based on score
        if (percentage < 60) {
            color1 = '#ff4444';
            color2 = '#ff6666';
        } else if (percentage < 80) {
            color1 = '#ffa500';
            color2 = '#ffb347';
        }
        
        circle.style.background = `conic-gradient(${color1} 0deg, ${color2} ${degrees}deg, rgba(255,255,255,0.1) ${degrees}deg)`;
        
        // Animate the percentage text
        let current = 0;
        const increment = percentage / 50;
        const timer = setInterval(function() {
            current += increment;
            if (current >= percentage) {
                current = percentage;
                clearInterval(timer);
            }
            scoreText.textContent = Math.round(current) + '%';
        }, 40);
    }, 500);
}
function checkForNewBadges(score) {
    const newBadges = [];
    
    badges.forEach(function(badge) {
        if (userData.earnedBadges.includes(badge.id)) {
            return; // already have this badge
        }
        
        let shouldEarn = false;
        
        if (badge.type === 'exercises') {
            shouldEarn = userData.completedExercises >= badge.requirement;
        } else if (badge.type === 'points') {
            shouldEarn = userData.totalPoints >= badge.requirement;
        } else if (badge.type === 'perfect') {
            shouldEarn = score === 100;
        } else if (badge.type === 'all_subjects') {
            const allSubjectsCount = Object.values(userData.subjectCounts);
            shouldEarn = allSubjectsCount.every(count => count >= badge.requirement);
        } else if (badge.type === activeExercise) {
            shouldEarn = userData.subjectCounts[activeExercise] >= badge.requirement;
        }
        
        if (shouldEarn) {
            userData.earnedBadges.push(badge.id);
            newBadges.push(badge);
        }
    });
    
    // Show badge notification if any new badges
    if (newBadges.length > 0) {
        const notification = document.getElementById('newBadges');
        notification.innerHTML = `
            <i class="fas fa-trophy"></i>
            <strong>New Badge${newBadges.length > 1 ? 's' : ''} Earned!</strong><br>
            ${newBadges.map(b => b.name).join(', ')}
        `;
        notification.classList.add('show');
    }
    
    // Refresh UI to show updated stats
    refreshUI();
}