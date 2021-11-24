// TODO(you): Write the JavaScript necessary to complete the assignment.
const quizApi = 'https://wpr-quiz-api.herokuapp.com/attempts';
const screen1 = document.querySelector('#introduction');
const screen2 = document.querySelector('#attempt-quiz');
const screen3 = document.querySelector('#review-quiz');
const btnStart = document.querySelector('#intro-start');
const btnSubmit = document.querySelector('#attempt-submit');
const attFooter = document.querySelector('.attempt-footer');
const btnRetry = document.querySelector('#review-submit')
const questionScore = document.querySelector('.review-score');
const questionPercentage = document.querySelector('.review-percentage');
const questionText = document.querySelector('.review-text');
const btnConfirm = document.querySelector('#confirm');
const btnCancel = document.querySelector('#cancel');
let id;

// Start the quiz
btnStart.onclick = function() {
    screen1.classList.toggle('hidden');
    screen2.classList.toggle('hidden');
    document.querySelector('.header').scrollIntoView();
}
// Call Api to show question
fetch(quizApi, {
    method: 'POST'
})
.then(function (response) {
    return response.json()
})
.then(function(jsonData) {
    id = jsonData._id;
    // Show the questions
    const myArray = jsonData.questions
    myArray.map(function(ques, index) {
        const showQuestion = document.querySelector('.attempt-question');
        const questionBlock = document.createElement('div');
        questionBlock.classList.add('block');
        questionBlock.id = ques._id;
        const questionHeading = document.createElement('h3');
        questionHeading.classList.add('mt-18');
        const questionDescription = document.createElement('p');
        const questionChoiceList = document.createElement('div');
        questionChoiceList.classList.add('answer');
        questionHeading.textContent = 'Question ' + (index + 1) + ' of 10';
        questionDescription.textContent = ques.text;

        showQuestion.appendChild(questionBlock);
        questionBlock.appendChild(questionHeading);
        questionBlock.appendChild(questionDescription);
        questionBlock.appendChild(questionChoiceList);
        
        for(value of ques.answers) {
            const questionOption = document.createElement('div');
            questionOption.classList.add('option');
            questionOption.addEventListener('click', onClickOption  )
            questionOption.addEventListener('click', onClickChangeColor)
            
            const questionInputType = document.createElement('input');
            questionInputType.type = 'radio';
            questionInputType.name = 'option' + (index + 1);
            questionInputType.value = ques.answers.indexOf(value);
            const questionAnswer = document.createElement('span');
            questionAnswer.textContent = value;

            questionChoiceList.appendChild(questionOption);
            questionOption.appendChild(questionInputType);
            questionOption.appendChild(questionAnswer);
        }
    })
    // Call API to show answers
    const correctChoice = [];
    fetch(`https://wpr-quiz-api.herokuapp.com/attempts/${id}/submit`, {
        method: 'POST'
    })
        .then(function (response) {
            return response.json();
        })
        .then(function(jsonData) {
            const correctAns = jsonData.correctAnswers;
            for(const ca in correctAns) {
                correctChoice.push(correctAns[ca]);
            }
        })
        
        const inputList = [];
        const optionNumbers = document.querySelectorAll('.option')
        const blockNumbers = document.querySelectorAll('.block');
        
        // Submit the quiz + show dialog box + show the answers
        // Click submit => open dialog box
        btnSubmit.addEventListener('click', onShowConfirmBox);
        function onShowConfirmBox() {
            document.querySelector('.model').classList.toggle('open')
        }
        // When press yes in diaglog box
        btnConfirm.addEventListener('click', onShowAnswer);
        function onShowAnswer() {
        for(let i = 0; i < optionNumbers.length; i++) {
            optionNumbers[i].classList.add('disabled-choice') // Disabled all the option so users can't choose any more
        }
        for(let i = 0; i < blockNumbers.length; i++) {
            let checklist = false;
            const option = blockNumbers[i].querySelector('.selected');
            if(option) {
                const inputChoice = option.querySelector('input');
                inputList.push(inputChoice.value); // Store the input checked into an array
                checklist = true;
            }

            if(checklist == false) {
                inputList.push('-1') // If no checked push -1
            }
        }

        let correctAnswers = jsonData.score; // Initialize the count number starting by 0
        const totalAnswer = correctChoice.length;  // Total score
        for(let i = 0; i < totalAnswer; i++) {
            const option = blockNumbers[i].querySelector('.selected');
            const optionList = blockNumbers[i].querySelectorAll('.option');

            if(option) {
                // Case 1: When your answer is correct 
                if(inputList[i] == correctChoice[i]) {
                    option.classList.add('true');
                    addElements(option, 'Correct answer');
                    correctAnswers ++; // Score increased
                } else {
                    // Case 2: When your answer is wrong
                    option.classList.add('false');
                    addElements(option, 'Your answer');
                    const unselectedOption = optionList[correctChoice[i]];
                    unselectedOption.classList.add('correct-when-wrong');
                    addElements(unselectedOption, 'Correct answer');
                }
            } else {
                // Case 3: When your answer is not choosen
                const option = blockNumbers[i].querySelectorAll('.option');
                const unselectedOption = option[correctChoice[i]];
                unselectedOption.classList.add('correct-when-wrong');
                addElements(unselectedOption, 'Correct answer');
            }
        }
        // Create a div tag display answer
        function addElements(option, text) {
            const newElement = document.createElement('div');
            newElement.classList.add('option-correct');
            newElement.textContent = text;
            option.appendChild(newElement);
        }

        screen3.classList.toggle('hidden')
        btnSubmit.classList.toggle('hidden');
        attFooter.classList.add('hidden');
        document.querySelector('.model').style.display = 'none';
        returnReview(correctAnswers, totalAnswer)
        
         // Review footer
        function returnReview(correct, total) {
            const reviewScore = document.querySelector('.review-score');
            reviewScore.textContent = correct + '/' + total;
            const reviewPercents = document.querySelector('.review-percentage');
            reviewPercents.textContent = (correct * 10) + '%';
            const reviewText = document.querySelector('.review-text');
            if(correct < 5) {
                reviewText.textContent = 'Practice more to improve it :D';
            } else if(correct >=5 && correct < 7) {
                reviewText.textContent = 'Good, keep up!';
            } else if(correct >=7 && correct < 9) {
                reviewText.textContent = 'Well done!';
            } else {
                reviewText.textContent = 'Perfect!'
            }
        }
    }
    // When press No in diaglog box
    btnCancel.addEventListener('click', onCancel);
    function onCancel() {
        document.querySelector('.model').classList.toggle('open')
    }
    
    // Change color when users click
    const questionNode = document.querySelectorAll('.option');
    for(const e of questionNode) {
        e.addEventListener('click', onClickChangeColor)
    }
    function onClickChangeColor(e) {
        for(const e of this.parentElement.querySelectorAll('.option')) {
            e.classList.remove('selected')
        }
        this.classList.add('selected');
    }
    // Check the input
    function onClickOption(event) {
        const questionOption = event.currentTarget;
        const input = questionOption.querySelector('input');
        input.checked = true;
    }
    // Try again
    btnRetry.onclick = function() {
        location.reload();
        document.querySelector('.header').scrollIntoView();
    }
})












