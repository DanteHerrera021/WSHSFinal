import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// const circularProgress = document.querySelectorAll(".circular-progress");

// Array.from(circularProgress).forEach((progressBar) => {
//     const progressValue = progressBar.querySelector(".percentage");
//     const innerCircle = progressBar.querySelector(".inner-circle");
//     let startValue = 0,
//         endValue = Number(progressBar.getAttribute("data-percentage")),
//         speed = 50,
//         progressColor = progressBar.getAttribute("data-progress-color");

//     const progress = setInterval(() => {
//         startValue++;
//         progressValue.textContent = `${startValue}%`;
//         progressValue.style.color = `${progressColor}`;

//         innerCircle.style.backgroundColor = `${progressBar.getAttribute(
//             "data-inner-circle-color"
//         )}`;

//         progressBar.style.background = `conic-gradient(${progressColor} ${startValue * 3.6
//             }deg,${progressBar.getAttribute("data-bg-color")} 0deg)`;
//         if (startValue === endValue) {
//             clearInterval(progress);
//         }
//     }, speed);
// });



async function loadConfig() {
    const response = await fetch('./config.json');
    const config = await response.json();
    return config;
}

function formatTime(time) {
    let hours = Math.floor(time / 3600); // Calculate hours
    let minutes = Math.floor((time % 3600) / 60); // Calculate remaining minutes
    let seconds = time % 60; // Calculate remaining seconds

    return (hours == 0) ? `${minutes}m ${seconds}s` : `${hours}h ${minutes}m ${seconds}s`;
}

function formatTimeColon(seconds) {
    if (seconds < 3600) {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let remainingSeconds = seconds % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

function updateProgressBar(progressBar, timer, targetTime) {
    let currentTime = 0;
    let intervalId = setInterval(() => {
        if (currentTime >= targetTime) {
            clearInterval(intervalId);
        } else {
            currentTime++;
            let progress = (currentTime / targetTime) * 100;
            progressBar.css('width', `${progress}%`);
            timer.text(`${formatTimeColon(currentTime)}/${formatTimeColon(targetTime)}`);
        }
    }, 1000);
}

const searchParams = new URLSearchParams(window.location.search);
let recipeId = searchParams.get('recipeId');
let stepId = searchParams.get('stepNumber');

async function fetchData() {
    const config = await loadConfig();
    const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

    let { data: Steps, error: stepsError } = await supabase
        .from('Step')
        .select('*')
        .eq('recipeId', recipeId);

    if (stepsError) {
        console.error('Error fetching data:', error);
        return;
    }

    let { data: Stove, error: stoveError } = await supabase
        .from('Stove')
        .select('*')

    if (stoveError) {
        console.error('Error fetching data:', error);
        return;
    }

    $(function () {
        let step;

        Steps.forEach(s => {
            if (s.stepNumber == stepId) {
                step = s
            }
        });

        let isFirstStep = true;
        let isLastStep = true;

        Steps.forEach(s => {
            if (step.stepNumber - 1 == s.stepNumber) {
                $('#back-btn').attr('href', `./step.html?recipeId=${recipeId}&stepNumber=${s.stepNumber}`);
                isFirstStep = false;
            }
            if (step.stepNumber + 1 == s.stepNumber) {
                $('#next-btn').attr('href', `./step.html?recipeId=${recipeId}&stepNumber=${s.stepNumber}`);
                isLastStep = false;
            }
        })

        if (isFirstStep) {
            $('#back-btn').remove();
        }
        if (isLastStep) {
            $('#next-btn').attr('href', `./enjoy.html`);
            $('#next-btn > button').text('Finish')
        }

        let targetTime;

        $("#main-header").text(`Step ${step.stepNumber} - ${step.stepName}`);
        $("#step-desc").text(step.stepDescription);

        Stove.forEach(stove => {
            const $option = $('<option></option>').val(stove.stoveName).text(stove.stoveName);
            $("#stove-dropdown").append($option);
        })

        $('#stove-dropdown').change(function () {
            let selectedStove;
            Stove.forEach(stove => {
                if ($("#stove-dropdown").val() == stove.stoveName) {
                    selectedStove = stove;
                }
            })

            console.log(selectedStove)

            targetTime =
                Math.floor((step.stepWattage) / (selectedStove.heatSlope * (step.stepPowerLevel - 50) + selectedStove.mediumWattage))

            $(".timer").text(`0:00/${formatTimeColon(targetTime)}`);
        })

        $('#start-btn').click(function () {
            const progressBar = $('.progress');
            const timer = $('.timer');
            updateProgressBar(progressBar, timer, targetTime);
        });

    })
}

window.onload = fetchData;