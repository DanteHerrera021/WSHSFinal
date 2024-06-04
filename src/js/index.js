import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function loadConfig() {
    const response = await fetch('./src/config.json');
    const config = await response.json();
    return config;
}

function truncateString(str, maxLength) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3) + '...';
    }
    return str;
}

const formatTime = (timeInSeconds) => {
    // Calculate minutes and seconds
    const minutes = Math.floor(timeInSeconds / 60);

    // Return formatted time
    return `${minutes}m`;
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