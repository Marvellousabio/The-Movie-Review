const APILINK ='https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=7cd926522837bcc70ef80b560ac969ea&page=1';
const IMG_PATH ='https://image.tmdb.org/t/p/w1280';
const SEARCHAPI ="https://api.themoviedb.org/3/search/movie?&api_key=7cd926522837bcc70ef80b560ac969ea&query=";
const MOVIE='https://api.themoviedb.org/3/movie/{movie_id}?api_key=7cd926522837bcc70ef80b560ac969ea'
const GENE='https://api.themoviedb.org/3/genre/movie/list?api_key=7cd926522837bcc70ef80b560ac969ea'
const EMBED='https://api.themoviedb.org/3/movie/{id}/videos?api_key=7cd926522837bcc70ef80b560ac969ea'
const CAST='https://api.themoviedb.org/3/movie/{id}/credits?api_key=7cd926522837bcc70ef80b560ac969ea'

const main=document.getElementById('section');
const form=document.getElementById('form');
const search=document.getElementById('query');
const loader = document.getElementById('loader');

// ====== Modal Elements ======
const modal = document.getElementById('movieModal');
const closeBtn = document.querySelector('.close');
const movieDetails = document.getElementById('movieDetails');
const genreContainer = document.getElementById('genres');


let currentPage = 1;

returnMovies(APILINK);

function returnMovies(url){
   if (currentPage === 1) main.innerHTML = '';
loader.style.display = 'block';

    fetch(`${url}&page=${currentPage}`)
    .then(res=> res.json())
    .then(function(data) {
        loader.style.display = 'none';
    if (!data.results || data.results.length === 0) {
        main.innerHTML = '<h2>No results found</h2>';
        return;
      }

       data.results.forEach(element=>{
         if (!element || !element.id) return; 

        const div_card = document.createElement('div');
        div_card.setAttribute('class','card');

        const image = document.createElement('img');
        image.setAttribute('class', 'thumbnail');
        image.src = element.poster_path 
  ? IMG_PATH + element.poster_path 
  : 'https://via.placeholder.com/300x450?text=No+Image';
         image.alt = element.title;

        const title = document.createElement('h3');
        title.textContent = element.title;

        const rating = document.createElement('p');
        rating.textContent = `⭐ ${element.vote_average.toFixed(1)}`;
        
        const year = document.createElement('p');
        year.textContent = `📅 ${element.release_date.slice(0,4)}`;

        const favBtn = document.createElement('button');
        favBtn.innerHTML = '❤️';
        favBtn.classList.add('fav-btn');

        favBtn.onclick = () => {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (!favorites.some(m => m.id === element.id)) {
            favorites.push(element);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            favBtn.innerHTML = '💖';
        }
        };


        
        div_card.appendChild(image);
        div_card.appendChild(title);
        div_card.appendChild(rating);
        div_card.appendChild(favBtn);
        div_card.appendChild(year);

         div_card.dataset.id = element.id;
         
        div_card.addEventListener('click', (e) => {
          const movieId = e.currentTarget.dataset.id;
          if (movieId) showMovieDetails(movieId);
        });

        main.appendChild(div_card);
    });
    

})

.catch(error => {
      loader.style.display = 'none';
      main.innerHTML = '<h2>Error loading movies</h2>';
      console.error(error);
    });
    
}
document.getElementById('loadMore').addEventListener('click', () => {
  currentPage++;
  returnMovies(APILINK);
})

function showFavorites() {
  main.innerHTML = '';
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  if (favorites.length === 0) {
    main.innerHTML = '<h2>No favorite movies yet ❤️</h2>';
    return;
  }

  favorites.forEach(m => {
    const div_card = document.createElement('div');
    div_card.setAttribute('class', 'card');

    const image = document.createElement('img');
    image.setAttribute('class', 'thumbnail');
    image.src = element.poster_path 
  ? IMG_PATH + element.poster_path 
  : 'https://via.placeholder.com/300x450?text=No+Image';


    const title = document.createElement('h3');
    title.textContent = m.title;

    const rating = document.createElement('p');
    rating.textContent = `⭐ ${m.vote_average.toFixed(1)}`;

    const year = document.createElement('p');
    year.textContent = `📅 ${m.release_date.slice(0, 4)}`;

    const favBtn = document.createElement('button');
    favBtn.innerHTML = '💔 Remove';
    favBtn.classList.add('fav-btn');
   
    favBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // prevent modal from opening
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.some(m => m.id === element.id)) {
    favorites.push(element);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    favBtn.innerHTML = '💖';
  } else {
    favorites = favorites.filter(m => m.id !== element.id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    favBtn.innerHTML = '❤️';
  }
});

    div_card.appendChild(image);
    div_card.appendChild(title);
    div_card.appendChild(rating);
    div_card.appendChild(favBtn);
    div_card.appendChild(year);

    div_card.dataset.id = m.id;
    div_card.addEventListener('click', (e) => {
      const movieId = e.currentTarget.dataset.id;
      if (movieId) showMovieDetails(movieId);
    });

    main.appendChild(div_card);
  });
}



function loadGenres() {
  fetch(GENE)
    .then(res => res.json())
    .then(data => {
      data.genres.forEach(g => {
        const btn = document.createElement('button');
        btn.classList.add('genre-btn');
        btn.innerText = g.name;
        btn.onclick = () => {
        document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        main.innerHTML = '';
        returnMovies(`https://api.themoviedb.org/3/discover/movie?api_key=7cd926522837bcc70ef80b560ac969ea&with_genres=${g.id}`);
        };

        genreContainer.appendChild(btn);
      });
    });
}
loadGenres();

// ====== Show Movie Details in Modal ======
async function showMovieDetails(movieId) {
    if(!movieId) return;
  modal.style.display = 'block';
  movieDetails.innerHTML = '<div class="spinner"></div>';


  try {
    const [movieRes, videoRes, castRes] = await Promise.all([
      fetch(MOVIE.replace('{movie_id}', movieId)),
      fetch(EMBED.replace('{id}', movieId)),
      fetch(CAST.replace('{id}', movieId))
    ]);

    if (!movieRes.ok) throw new Error('Movie not found');
    const movieData = await movieRes.json();
    const videoData = await videoRes.json();
    const castData = await castRes.json();

    const trailer = videoData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const castList = castData.cast.slice(0, 8); // top 8 actors

    movieDetails.innerHTML = `
      <h2>${movieData.title}</h2>
      <img src="${IMG_PATH + movieData.poster_path}" alt="${movieData.title}">
      <p><strong>Release:</strong> ${movieData.release_date}</p>
      <p><strong>Rating:</strong> ⭐ ${movieData.vote_average.toFixed(1)}</p>
      <p><strong>Runtime:</strong> ${movieData.runtime} mins</p>
      <p><strong>Overview:</strong> ${movieData.overview}</p>

      ${trailer ? `
        <iframe class="trailer"
          src="https://www.youtube.com/embed/${trailer.key}"
          frameborder="0"
          allowfullscreen>
        </iframe>` : `<p>No trailer available</p>`}

      <h3>Cast</h3>
      <div class="cast-container">
        ${castList.map(actor => `
          <div class="cast-card">
            <img src="https://image.tmdb.org/t/p/w185${actor.profile_path}" alt="${actor.name}">
            <p>${actor.name}</p>
            <p style="opacity:0.7;">as ${actor.character}</p>
          </div>
        `).join('')}
      </div>
    `;
    // ====== Close Modal ======
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};
  } catch (error) {
    movieDetails.innerHTML = '<p>Error loading movie details.</p>';
    console.error(error);
  }
}



document.getElementById('showFavorites').addEventListener('click', showFavorites);

form.addEventListener("submit",(e) =>{
    e.preventDefault();
    main.innerHTML='';

    const searchItem =search.value;

    if (searchItem){

        returnMovies(SEARCHAPI+searchItem);
        search.value='';
    }
    
});

const toggle = document.getElementById('theme-toggle');
const body = document.body;

if (localStorage.getItem('theme') === 'light') {
  body.classList.add('light-mode');
}

toggle.onclick = () => {
  body.classList.toggle('light-mode');
  const theme = body.classList.contains('light-mode') ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
};
