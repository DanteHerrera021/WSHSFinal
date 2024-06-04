import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function transformString(str) {
    // Split the string by '-'
    const words = str.split('-');

    // Capitalize the first letter of each word and make the rest lowercase
    const capitalizedWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    // Join the capitalized words with a space
    const result = capitalizedWords.join(' ');

    return result;
}

function formatTime(time) {
    let secondsToMinutes = time / 60

    let hours = Math.floor(secondsToMinutes / 60);
    let minutes = secondsToMinutes % 60;

    return (hours == 0) ? `${minutes} minutes` : `${hours}h ${minutes}m`;
}

async function loadConfig() {
    const response = await fetch('/config.json');
    const config = await response.json();
    return config;
}

const searchParams = new URLSearchParams(window.location.search);
let unformattedRecipeName = searchParams.get('recipeName');
let recipeName = transformString(unformattedRecipeName);

async function fetchData() {
    const config = await loadConfig();
    const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

    let { data: Recipe, error: recipeError } = await supabase
        .from('Recipe')
        .select('*')
        .ilike('recipeName', recipeName);

    if (recipeError) {
        console.error('Error fetching recipe data:', recipeError);
        return;
    }

    document.title = Recipe[0].recipeName + " Recipe";

    $('#header-text').text(Recipe[0].recipeName);
    $('#time').text(formatTime(Recipe[0].estTotalCookTime));
    $('#serving-size').text((
        Recipe[0].servings == 1) ? Recipe[0].servings + " person" : Recipe[0].servings + " people"
    );

    let longDescSplit = Recipe[0].longDescription.split("\\n");

    longDescSplit.forEach(par => {
        $("div.description").append("<p class='desc-paragraph'>" + par + "</p>");
    });

    console.log(Recipe[0].id)

    let { data: ingredients, error: ingredientError } = await supabase
        .from('Ingredients')
        .select('*')
        .eq('recipeId', Recipe[0].id);

    if (ingredientError) {
        console.error('Error fetching ingredient data:', ingredientError);
        return;
    }

    ingredients.forEach(ingredient => {
        $('#ingredients').append(`<li class="ingredient">${ingredient.ingredientAmount} ${ingredient.ingredientName.toLowerCase()}</li>`)
    })

    const newHref = `./step.html?recipeId=${Recipe[0].id}&stepNumber=1`;
    console.log(newHref);
    $('#step-redirect').attr('href', newHref);
}

window.onload = fetchData()