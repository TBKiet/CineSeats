const { getMovieListsByType, getMovieById } = require('./movies.service');
exports.getMoviesJson = async (req, res) => {
    try {
        const queryParam = {
            name_vn: req.query.keyword,
            type_name_vn: req.query.genre,
            limitage_vn: req.query.age,
            country_name_vn: req.query.country,
        }
        const page = parseInt(req.query.page) || 1;
        const movieType = req._parsedUrl.pathname;
        const movieData = await getMovieListsByType(movieType, queryParam, page);
        res.json(movieData);
    } catch (error) {
        console.error("Error loading movies:", error);
        res.status(500).send("Error loading movies.");
    }
};
exports.getMovieByID = async (req, res) => {
    try {
        const movieId = req.params.id;
        const movieData = (await getMovieById(movieId));
        res.json(movieData);
    } catch (error) {
        console.error("Error fetching movie:", error);
        res.status(500).send("Internal server error");
    }
};