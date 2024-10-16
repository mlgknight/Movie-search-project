const searchInput = document.getElementById("form-search");
const inputButton = document.getElementById("search-input");
const movies = document.getElementById("movies");
const watchSection = document.getElementById("watch-list");
const movieInformation = document.getElementById("movie-information");
let alertMessage = "";
let moviesList = [];
let watchlist = [];

loadWatchlist();
handleLastMovieList(moviesList);
handleWatchList(watchlist);

console.log(moviesList);
console.log(watchlist);

if (window.location.href.includes("index.html")) {
    searchInput.addEventListener("submit", function (e) {
        let htmlHolder = "";
        e.preventDefault();
        fetch(`https://www.omdbapi.com/?s=${inputButton.value}&apikey=a01f471e`)
            .then(res => res.json())
            .then(data => {
                moviesList = data.Search || [];
                saveWatchlist();
                for (let movie of moviesList) {
                    htmlHolder += `
                        <div class="is-cursor-pointer card">
                            <div class="card-image">
                                <figure class="image is-2by5">
                                    <img data-id="${movie.imdbID}" src="${movie.Poster}" alt="Placeholder image">
                                </figure>
                            </div>
                        </div>`;
                }
                movies.innerHTML = htmlHolder;
            });
    });
}

document.addEventListener("click", async function (event) {
    const elementClicked = event.target;
    const movieId = elementClicked.dataset.id;
    const movie = moviesList.find(m => m.imdbID === movieId);

    if (elementClicked.tagName === "IMG" && movieId) {
        try {
            const res = await fetch(`http://www.omdbapi.com/?apikey=a01f471e&t=${movie.Title}`);
            const data = await res.json();
            if (res.ok && data.Response === "True") {
                movieInformation.classList.remove("hidden", "close-btn-closed");
                const movieInfoHtml = `
                    <div data-theme="black" class="movie-info">
                        <button id="close-btn" data-close="true" class="wishlist-btn close-btn">X</button>
                        <p>Title: ${data.Title}</p>
                        <p>imdb ID: ${data.imdbID}</p>
                        <p>Type: ${data.Type}</p>
                        <p>Year Released: ${movie.Year}</p>
                        <p>Genre: ${data.Genre}</p>
                        <p>imdbRating: ${data.imdbRating}</p>
                        <p>Movie Plot: ${data.Plot}</p>
                        <button data-id="${data.imdbID}" class="wishlist-btn">Watch List</button>
                        <p id="alert-message"></p>
                    </div>`;
                console.log(data);
                movieInformation.innerHTML = movieInfoHtml;
            } else {
                console.log("Error:", data.Error);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }

    else if (elementClicked.tagName === "BUTTON" && movieId && !elementClicked.dataset.remove && !elementClicked.dataset.close) {
        const alertMessageContainer = document.getElementById("alert-message");
        if (movie && !watchlist.some(obj => obj.imdbID === movieId)) {
            watchlist.unshift(movie);
            saveWatchlist();
            handleWatchList(watchlist);
            alertMessage = `${movie.Title} Added!`;

            if (alertMessageContainer) {
                alertMessageContainer.textContent = alertMessage;
                alertMessageContainer.className = "greentext";
            } else {
                console.error("Alert message container not found");
            }
        } else {
            alertMessage = `${movie.Title} Already exists!`;

            if (alertMessageContainer) {
                alertMessageContainer.textContent = alertMessage;
                alertMessageContainer.className = "redtext";
            } else {
                console.error("Alert message container not found");
            }
        }
    }
    else if (elementClicked.tagName === "BUTTON" && elementClicked.dataset.remove) {
        const movieId = elementClicked.dataset.id;
        const index = watchlist.findIndex(obj => obj.imdbID === movieId);
        if (index !== -1) {
            watchlist.splice(index, 1);
            saveWatchlist();
            handleWatchList(watchlist);
            console.log(`Removed movie with ID: ${movieId}`);
        } else {
            console.error(`Movie with ID: ${movieId} not found in watchlist.`);
        }
    }

    else if (elementClicked.tagName === "BUTTON" && elementClicked.dataset.close) {
        movieInformation.classList.add("hidden");
        setTimeout(() => {
            movieInformation.classList.add("close-btn-closed");
        }, 500);
    }
});

function handleWatchList(array) {
    let htmlHolder = "";
    for (let movie of array) {
        htmlHolder += `
            <div class="is-cursor-pointer card">
                <div class="card-image">
                    <figure class="image is-2by5">
                        <img data-id="${movie.imdbID}" src="${movie.Poster}" alt="Placeholder image">
                    </figure>
                    <button data-id="${movie.imdbID}" data-remove="true" class="remove-btn">Remove</button>
                </div>
            </div>`;
    }
    if (watchSection) {
        watchSection.innerHTML = htmlHolder;
    }
}

function handleLastMovieList(array) {
    let htmlHolder = "";
    for (let movie of array) {
        htmlHolder += `
            <div class="is-cursor-pointer card">
                <div class="card-image">
                    <figure class="image is-2by5">
                        <img data-id="${movie.imdbID}" src="${movie.Poster}" alt="Placeholder image">
                    </figure>
                </div>
            </div>`;
    }
    if (movies) {
        movies.innerHTML = htmlHolder;
    }
}

function saveWatchlist() {
    const arrayToString = JSON.stringify(watchlist);
    localStorage.setItem("Movies", arrayToString);

    const savelastMovie = JSON.stringify(moviesList);
    localStorage.setItem("lastMovieSet", savelastMovie);
}

function loadWatchlist() {
    const getItem = localStorage.getItem("Movies");
    const getitemLastList = localStorage.getItem("lastMovieSet");
    watchlist = JSON.parse(getItem) || [];
    moviesList = JSON.parse(getitemLastList) || [];
}
