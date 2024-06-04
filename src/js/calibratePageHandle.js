import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function loadConfig() {
    const response = await fetch('./src/config.json');
    const config = await response.json();
    return config;
}

async function addProfile(stoveProfileName, boilPoint, roomTemp, boilTimeMed, boilTimeHigh) {
    let medWattage = ((2 * 0.2365882365) * 1000) * 4.186 * ((boilPoint - 32) * 5 / 9) - ((roomTemp - 32) * 5 / 9) / boilTimeMed;
    let highWattage = ((2 * 0.2365882365) * 1000) * 4.186 * ((boilPoint - 32) * 5 / 9) - ((roomTemp - 32) * 5 / 9) / boilTimeHigh;

    let heatSlope = (highWattage - medWattage) / 50

    const { error: errorStove } = await supabase
        .from('Stove')
        .insert({ stoveName: stoveProfileName, mediumWattage: medWattage, highWattage: highWattage, heatSlope: heatSlope })

    if (errorStove) {
        console.error(errorStove);
    }

    const { data: stove, error: errorRetrieveStove } = await supabase
        .from('Stove')
        .select("*")
        .eq('stoveName', stoveProfileName)

    if (errorRetrieveStove) {
        console.error(errorRetrieveStove)
    }

    let currentTime = new Date().toISOString();

    const { error: errorCalibration } = await supabase
        .from('Calibration')
        .insert({ stoveID: stove[0].stoveID, userID: 1, likes: 0, dislikes: 0, dateCreated: currentTime });

    if (errorCalibration) {
        console.error(errorCalibration);
    }
}

const config = await loadConfig();
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

let isStopped = true;
let cookTimer;

const formatTime = (timeInSeconds) => {
    // Calculate minutes and seconds
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;

    // Pad single-digit seconds with leading zero
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    // Return formatted time
    return `${minutes}:${formattedSeconds}`;
}

$(function () {
    $("#proceed-btn").on('click', function () {
        $('#verify-stove-change').addClass('hidden');
        $("#med-calibration").removeClass('hidden');
    })

    let profileNameInput = false;
    let roomTempInput = false;

    $("#profile-name").on("input", () => {
        profileNameInput = true;
        if (roomTempInput && profileNameInput) {
            $("#medium-information").css('opacity', '1');
        }
    })
    $("#room-temp").on("input", () => {
        roomTempInput = true;
        if (roomTempInput && profileNameInput) {
            $("#medium-information").css('opacity', '1');
        }
    })

    let profileName;
    let roomTemp;
    let boilTimeMed;
    let boilTimeHigh;

    $("#medium-proceed").on("click", function () {
        if (!$("#profile-name").val()) {
            alert("Profile name is required.");
        } else {
            if (isNaN(parseInt($("#room-temp").val())) || parseInt($("#room-temp").val()) == 0) {
                alert("Please enter a number for the temperature.")
            } else {
                profileName = $("#profile-name").val();
                roomTemp = parseInt($("#room-temp").val());

                $("#profile-name-text").text(profileName);

                $("#med-calibration").addClass('hidden');
                $("#timer-container").removeClass("hidden");
            }
        }
    })

    let time = 0;

    $('#timerControl').on('click', function () {
        isStopped = !isStopped;
        if (!isStopped) {
            cookTimer = setInterval(function () {
                time++;
                $('#timer').text(formatTime(time));
            }, 1000);
            $(this).replaceWith("<button id='timerEndControl'>End Timer & Proceed</button>")
            $("#timerEndControl").on('click', function () {
                isStopped = !isStopped;
                if (isStopped) {
                    clearInterval(cookTimer);
                }
                boilTimeMed = time;
                // $(this).replaceWith("<button id='timerControl'>End Timer</button>")
                $("#timer-container").addClass('hidden');
                $("#high-calibration").removeClass("hidden");

            })
        }
    })

    let boilPoint = 211.18

    $("#high-proceed").on("click", function () {
        time = 0;
        $('#timer').text(formatTime(time));
        $("#timerEndControl").replaceWith("<button id='timerControl'>Start Timer</button>")

        $("#high-calibration").addClass('hidden');
        $("#timer-container").removeClass("hidden");

        $('#timerControl').on('click', function () {
            isStopped = !isStopped;
            if (!isStopped) {
                cookTimer = setInterval(function () {
                    time++;
                    $('#timer').text(formatTime(time));
                }, 1000);
                $(this).replaceWith("<button id='timerEndControl'>End Timer & Proceed</button>")
                $("#timerEndControl").on('click', function () {
                    isStopped = !isStopped;
                    if (isStopped) {
                        clearInterval(cookTimer);
                    }
                    boilTimeHigh = time;
                    $("#timer-container").addClass('hidden');

                    addProfile(profileName, boilPoint, roomTemp, boilTimeMed, boilTimeHigh);

                    $("#verification-screen").removeClass("hidden");

                })
            }
        })

    })

})

