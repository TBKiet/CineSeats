// movie.js
class MovieService {
    static Movie = require("../components/movies/movies.model");

    static async getMovieListsByType(movieType, page = 1, limit = 8, query = {}) {
        const today = new Date();
        let defaultFilter = {};
        const movieStates = { all: "inactive-film", showing: "inactive-film", upcoming: "inactive-film" };

        if (movieType === "showing") {
            defaultFilter = { release_date: { $lte: today }, end_date: { $gte: today } };
            movieStates.showing = "active-film";
        } else if (movieType === "upcoming") {
            defaultFilter = { release_date: { $gt: today } };
            movieStates.upcoming = "active-film";
        } else {
            movieStates.all = "active-film";
        }

        const filter = { ...defaultFilter, ...query };
        try {
            const movies = await MovieService.Movie.find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
            const totalMovies = await MovieService.Movie.countDocuments(filter);
            const totalPages = Math.ceil(totalMovies / limit);
            const extractUnique = (key) => [...new Set(movies.flatMap((movie) => movie[key]))].sort();
            return {
                movies,
                genres: extractUnique("type_name_vn"),
                ages: extractUnique("limitage_vn"),
                ratings: extractUnique("ratings"),
                countries: extractUnique("country_name_vn"),
                totalPages,
                currentPage: page,
                ...movieStates,
            };
        } catch (err) {
            console.error("Error fetching movies:", err);
            return {
                movies: [],
                genres: [],
                ages: [],
                ratings: [],
                countries: [],
                totalPages: 0,
                currentPage: page,
                ...movieStates,
            };
        }
    }

    static async getRelatedMovies(movieData) {
        try {
            const regexGenres = new RegExp(movieData.type_name_vn.join("|"), "i");
            return await MovieService.Movie.find({
                type_name_vn: { $regex: regexGenres },
                id: { $ne: movieData.id },
            }).lean();
        } catch (err) {
            console.error("Error fetching related movies:", err);
            return [];
        }
    }

    static async getMovieById(movieId) {
        const movie = await MovieService.Movie.findOne({ id: movieId }).lean();
        if (!movie) return null;

        const formatDate = (date) =>
            new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

        const relatedMovies = await this.getRelatedMovies(movie);

        return {
            ...movie,
            release_date: formatDate(movie.release_date),
            end_date: formatDate(movie.end_date),
            relatedMovies,
        };
    }
}

module.exports = MovieService;
