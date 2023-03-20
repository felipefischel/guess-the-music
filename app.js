// Global variables
let PLAYLIST_ID = "37i9dQZEVXbMDoHDwVN2tF";
const audioPlayer = document.querySelector("#audio-player");

function startGame() {
  // Fetch the Spotify "Global Top 50" playlist
  fetch(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`, {
    headers: { Authorization: `Bearer ${access_token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      const songs = data.items.map((item) => item.track);

      // Add play audio button and event listener
      const playButton = document.querySelector("#play-button");
      playButton.addEventListener("click", playAudio);

      // Get the mute/unmute button element
      const muteUnmuteButton = document.querySelector("#mute-unmute-button");

      // Add the initial speaker symbol to the button
      muteUnmuteButton.innerHTML = "🔊";

      muteUnmuteButton.addEventListener("click", () => {
        if (audioPlayer.muted) {
          audioPlayer.muted = false;
          muteUnmuteButton.innerHTML = "🔊";
        } else {
          audioPlayer.muted = true;
          muteUnmuteButton.innerHTML = "🔇";
        }
      });

      function playAudio() {
        // Change the button text to "Next song" after the first click
        playButton.textContent = "Next song";

        // Reshuffle and play a new song
        reshuffle(songs, audioPlayer);
        audioPlayer.play();

        // Clear the old timer and start a new one
        clearTimeout(timer);
        startTimer();

        // Reset and update the progress bar
        updateProgressBar();

        // Reset option buttons background color
        resetOptionBackgrounds();
      }

      reshuffle(songs, audioPlayer);
    })
    .catch((error) => console.error(error));
}

function resetOptionBackgrounds() {
  const options = document.querySelectorAll("#options-container button");
  options.forEach((option) => {
    option.style.backgroundColor = "";
  });
}

let songStreak = 0;
let firstAttempt = true;

function reshuffle(songs, audioPlayer) {
  let randomSong = null;
  // Keep looking for a song until a valid preview URL is found
  while (!randomSong || !randomSong.preview_url) {
    randomSong = songs[Math.floor(Math.random() * songs.length)];
  }

  // Update the UI with the song details
  audioPlayer.src = randomSong.preview_url;

  const options = document.querySelectorAll("#options-container button");
  const usedSongs = new Set();
  const usedArtists = new Set();

  // Choose unique songs or artists for the options
  while (usedSongs.size < 3) {
    let optionSong = songs[Math.floor(Math.random() * songs.length)];
    const mainArtist = optionSong.artists[0].name;
    if (optionSong !== randomSong && !usedSongs.has(optionSong) && !usedArtists.has(mainArtist)) {
      usedSongs.add(optionSong);
      usedArtists.add(mainArtist);
    }
  }

  // Add the correct song and its artist to the usedSongs and usedArtists sets
  usedSongs.add(randomSong);
  usedArtists.add(randomSong.artists[0].name);

  // Convert the set to an array and shuffle it
  const shuffledSongs = Array.from(usedSongs);
  shuffleArray(shuffledSongs);

  const guessType = document.getElementById("guess-type").value;

  options.forEach((option, index) => {
    // Remove any existing event listeners
    const newOption = option.cloneNode(true);
    option.parentNode.replaceChild(newOption, option);

    // Display song names or artist names based on user's selection
    newOption.textContent = guessType === "song" ? shuffledSongs[index].name : shuffledSongs[index].artists[0].name;

    newOption.addEventListener("click", () => {
      const correctAnswer = guessType === "song" ? randomSong.name : randomSong.artists[0].name;
      if (newOption.textContent === correctAnswer) {
        if (firstAttempt) {
          songStreak++;
        }
        newOption.style.backgroundColor = "#89F8A8";
      } else {
        newOption.style.backgroundColor = "#F88989";
        firstAttempt = false;
        songStreak = 0; // Reset the streak

        // Highlight the correct answer in green
        const innerOptions = document.querySelectorAll("#options-container button");
        innerOptions.forEach((innerOption) => {
          if (innerOption.textContent === correctAnswer) {
            innerOption.style.backgroundColor = "#89F8A8";
          }
        });
      }
      document.querySelector("#current-streak").textContent = `🔥 Current streak: ${songStreak}`;

      // Disable all option buttons after one is clicked
      options.forEach((option) => {
        option.disabled = true;
      });
    });

    // Reset the firstAttempt variable for the next round
    firstAttempt = true;
  });
}

// I create a funciton to fetch all Spotify-supported countries.
// I only need to use it if I want to check if there are more Spotify-supported countries.
async function fetchMarkets() {
  const response = await fetch("https://api.spotify.com/v1/markets", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const data = await response.json();
  const markets = data.markets;
  console.log(markets);
}

// List of all Spotify-supported country codes
// const countryCodes = [
//   "AD", "AE", "AG", "AL", "AM", "AO", "AR", "AT", "AU", "AZ",
//   "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BN",
//   "BO", "BR", "BS", "BT", "BW", "BY", "BZ", "CA", "CD", "CG",
//   "CH", "CI", "CL", "CM", "CO", "CR", "CV", "CW", "CY", "CZ",
//   "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "ES",
//   "ET", "FI", "FJ", "FM", "FR", "GA", "GB", "GD", "GE", "GH",
//   "GM", "GN", "GQ", "GR", "GT", "GW", "GY", "HK", "HN", "HR",
//   "HT", "HU", "ID", "IE", "IL", "IN", "IQ", "IS", "IT", "JM",
//   "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KR", "KW",
//   "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU",
//   "LV", "LY", "MA", "MC", "MD", "ME", "MG", "MH", "MK", "ML",
//   "MN", "MO", "MR", "MT", "MU", "MV", "MW", "MX", "MY", "MZ",
//   "NA", "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NZ", "OM",
//   "PA", "PE", "PG", "PH", "PK", "PL", "PS", "PT", "PW", "PY",
//   "QA", "RO", "RS", "RW", "SA", "SB", "SC", "SE", "SG", "SI",
//   "SK", "SL", "SM", "SN", "SR", "ST", "SV", "SZ", "TD", "TG",
//   "TH", "TJ", "TL", "TN", "TO", "TR", "TT", "TV", "TW", "TZ",
//   "UA", "UG", "US", "UY", "UZ", "VC", "VE", "VN", "VU", "WS",
//   "XK", "ZA", "ZM", "ZW",
// ];

// In the fetchPlaylist method I print out which country codes have a "top 50" playlist and I hard code them into the list bellow.
// This way I don't have to make iterate through the entire list of country codes.
// I can pass the entire list every once in a while to check if theres a new country.

const countryCodes = [
  "US", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CO", "CA", "CH",
  "CL", "CR", "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR",
  "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IL", "IS", "IT",
  "JP", "LT", "LV", "MX", "MY", "NI", "NL", "NO", "NZ", "PA", "PE",
  "PH", "PL", "PT", "PY", "RO", "SE", "SG", "SK", "SV", "TH", "TR",
  "TW", "UY", "VN", "ZA",
];

async function fetchPlaylists() {
  const selectElement = document.querySelector("#playlist-select");

  // Fetch the country-specific Top 50 playlists
  const playlistPromises = countryCodes.map(async (countryCode) => {
    const response = await fetch(
      `https://api.spotify.com/v1/browse/categories/toplists/playlists?country=${countryCode}&limit=50`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    const data = await response.json();
    return data.playlists.items;
  });

  const playlistsArray = await Promise.all(playlistPromises);
  const playlists = playlistsArray.flat();

  // Filter playlists containing "Top 50" and populate the select element
  const addedPlaylists = new Set();
  playlists.forEach((playlist) => {
    if (playlist.name.includes("Top 50") && !addedPlaylists.has(playlist.name)) {
      addedPlaylists.add(playlist.name);
      const option = document.createElement("option");
      option.value = playlist.id;
      option.textContent = playlist.name.replace("Top 50 - ", ""); // Remove "Top 50 -" part
      selectElement.appendChild(option);

      // Set "Top 50 - Global" as the default option
      if (playlist.name === "Top 50 - Global") {
        option.selected = true;
        PLAYLIST_ID = playlist.id;
        selectElement.insertBefore(option, selectElement.firstChild);
      }
    }
  });
  // console.log(addedPlaylists) // retrieve the list of playlists. I can uncomment this line if I want to check with all playlists.

  // Add an event listener to update the current playlist when a new one is selected
  selectElement.addEventListener("change", (event) => {
    PLAYLIST_ID = event.target.value;
    startGame();
  });
}

// Fetch the api token from a Google Cloud Function I created. By creating a Cloud Function I can safely store my API secrets.
fetch(`https://us-central1-guess-the-music-380212.cloudfunctions.net/getSpotifySecrets`, {
  method: "POST",
})
  .then((res) => res.json())
  .then((data) => (access_token = data.access_token))
  // .then(() => fetchMarkets()) // Calling the fetchMarkets function which prints the available markets on the console. Only need to call this once to get a list of country codes into an array. I hard coded the list.
  .then(() => fetchPlaylists())
  .then(() => startGame())
  .catch((error) => console.error(error));

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const timeLimit = 30000; // 30 seconds
let timer;

function startTimer() {
  timer = setTimeout(() => {
    alert("Time's up!");
    // Show the correct answer and move on to the next question
  }, timeLimit);

  updateProgressBar();
}

let interval;

function updateProgressBar() {
  clearInterval(interval); // Clear any previous intervals

  const progressBar = document.getElementById("progress-bar");

  // Set the progress bar to 100% before starting the interval
  progressBar.style.width = "100%";

  let timeLeft = timeLimit;
  interval = setInterval(() => {
    timeLeft -= 100;
    const progress = (timeLeft / timeLimit) * 100;
    progressBar.style.width = progress + "%";
    if (timeLeft <= 0) {
      clearInterval(interval);
    }
  }, 100);
}
