const { promotions } = require("./home.service");

const renderMovieList = async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const showingMovieApiUrl = `${baseUrl}/api/movies/showing`;
  const upcomingMovieApiUrl = `${baseUrl}/api/movies/upcoming`;

  try {
    const showingMovieResponse = await fetch(showingMovieApiUrl);
    const upcomingMovieResponse = await fetch(upcomingMovieApiUrl);

    if (!showingMovieResponse.ok || !upcomingMovieResponse.ok) {
      throw new Error(`Response status: ${showingMovieResponse.status} ${upcomingMovieResponse.status}`);
    }

    const showingMoviesList = await showingMovieResponse.json();
    const upcomingMoviesList = await upcomingMovieResponse.json();

    res.render("home", {
      layout: "main",
      showingMovies: showingMoviesList.movies,
      upcomingMovies: upcomingMoviesList.movies,
      promotions,
    });
  } catch (error) {
    console.error("Error loading movies:", error);
    res.status(500).send("Error loading movies.");
  }
};

module.exports = { renderMovieList };