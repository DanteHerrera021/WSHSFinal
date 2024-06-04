import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const circularProgress = document.querySelectorAll(".circular-progress");

Array.from(circularProgress).forEach((progressBar) => {
    const progressValue = progressBar.querySelector(".percentage");
    const innerCircle = progressBar.querySelector(".inner-circle");
    let startValue = 0,
        endValue = Number(progressBar.getAttribute("data-percentage")),
        speed = 50,
        progressColor = progressBar.getAttribute("data-progress-color");

    const progress = setInterval(() => {
        startValue++;
        progressValue.textContent = `${startValue}%`;
        progressValue.style.color = `${progressColor}`;

        innerCircle.style.backgroundColor = `${progressBar.getAttribute(
            "data-inner-circle-color"
        )}`;

        progressBar.style.background = `conic-gradient(${progressColor} ${startValue * 3.6
            }deg,${progressBar.getAttribute("data-bg-color")} 0deg)`;
        if (startValue === endValue) {
            clearInterval(progress);
        }
    }, speed);
});


async function loadConfig() {
    const response = await fetch('/config.json');
    const config = await response.json();
    return config;
}

function formatTime(time) {
    let secondsToMinutes = time / 60

    let hours = Math.floor(secondsToMinutes / 60);
    let minutes = secondsToMinutes % 60;

    return (hours == 0) ? `${minutes} minutes` : `${hours}h ${minutes}m`;
}

async function fetchData() {
    const config = await loadConfig();
    const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

    let { data: Recipe, error } = await supabase
        .from('Recipe')
        .select('*')

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    console.log(Recipe);

    $(function () {

        Recipe.forEach(row => {
            let toLower = row.recipeName.toLowerCase();
            let dashes = toLower.replace(/\s+/g, '-');

            let time = formatTime(row.estTotalCookTime);
            let shortString = truncateString(row.description, 26);


            $("#card-container").append(
                `<div class="card">
                <figure class="recipe-img-container">
                <img
                    src="./src/img/${dashes}.jpg"
                    alt="${dashes}"
                />
                </figure>
                <div>
                    <header>
                        <h2>${row.recipeName}</h2>
                        <h3>Cook time: ${time}</h3>
                    </header>
                    <div class="short-desc">
                        <p>${shortString}</p>
                    </div>
                    <div class="long-desc">
                        <p>${row.description}</p>
                    </div>
                    <div class="go-to-container">
                        <p><a href="./recipe.html?recipeName=${dashes}">Go to recipe page ></a></p>
                    </div>
                </div>
            </div>`
            )
        })

        $(".card").on('click', function () {
            $(".card").removeClass('selected');
            $(this).addClass('selected');
        })
    })
}

window.onload = fetchData;