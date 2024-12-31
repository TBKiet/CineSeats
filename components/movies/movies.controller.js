exports.renderMovieList = async (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const apiMovieUrl = `${baseUrl}/api${req.originalUrl}`;
    try {
        const movieResponse = await fetch(apiMovieUrl);
        if (!movieResponse.ok) {
            throw new Error(`Response status: ${movieResponse.status}`);
        }

        const movieData = await movieResponse.json();
        res.render("movie-list", {
            layout: "main", ...movieData
        });
    } catch (error) {
        console.error("Error loading movies:", error);
        res.status(500).send("Error loading movies.");
    }
};

exports.renderMoviePage = async (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const apiMovieUrl = `${baseUrl}/api${req.originalUrl}`;
    const movieId = req.params.id;
    try {
        const movieResponse = await fetch(apiMovieUrl);
        const showtimeResponse = await fetch(`${baseUrl}/api/showtime?movieId=${movieId}`);
        if (!movieResponse.ok) {
            throw new Error(`Movie response status: ${movieResponse.status}`);
        }
        if (!showtimeResponse.ok) {
            throw new Error(`Showtime response status: ${showtimeResponse.status}`);
        }
        const movieData = await movieResponse.json();
        const showtimeData = await showtimeResponse.json();
        res.render("movie-details", { layout: "main", ...movieData, ...showtimeData.data });
    } catch (error) {
        console.error("Error fetching movie:", error);
        res.status(500).send("Internal server error");
    }
};