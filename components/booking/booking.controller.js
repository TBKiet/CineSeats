const e = require('express');
const { extractAvailableSeats } = require('./booking.service');
exports.getSeatsJson = async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    }
    const { showtimeId } = req.body;
    console.log('showtimeId', showtimeId);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const apiBookingUrl = `${baseUrl}/api/booking?showtimeId=${showtimeId}`;
    const apiReservedUrl = `${baseUrl}/api/reserved?showtimeId=${showtimeId}`;
    try {
        // Retrieve available seats for the given showtime
        const availableSeats = await fetch(apiBookingUrl);
        const reservedSeats = await fetch(apiReservedUrl);
        if (!availableSeats.ok) {
            throw new Error(`Response status: ${availableSeats.status}`);
        }
        if (!reservedSeats.ok) {
            throw new Error(`Response status: ${reservedSeats.status}`);
        }
        // Parse the available seats data
        let availableSeatsData = await availableSeats.json();
        const reservedSeatsData = await reservedSeats.json();
        availableSeatsData = extractAvailableSeats(availableSeatsData, reservedSeatsData);
        // Return the available seats data
        res.json({ success: true, rows: availableSeatsData.rows });
    } catch (error) {
        console.error(`Error retrieving seats for showtimeID ${showtimeId}:`, error);
        res.status(500).json({ success: false, message: 'Internal Server Error.' });
    }
}
exports.renderSeatSelection = async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    }
    const movieId = req.params.movieId;
    const { showtimeId, theaterId, date } = req.body;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const apiBookingUrl = `${baseUrl}/api/booking?showtimeId=${showtimeId}`;
    const apiReservedUrl = `${baseUrl}/api/reserved?showtimeId=${showtimeId}`;
    const apiMovieUrl = `${baseUrl}/api/movies/${movieId}?related=false`;
    const apiShowtimeUrl = `${baseUrl}/api/showtime/${showtimeId}`;
    const apiRelevantShowtime = `${baseUrl}/api/showtime?movieId=${movieId}&date=${date}&theater=${theaterId}`;
    try {
        // Retrieve available seats for the given showtime
        const availableSeats = await fetch(apiBookingUrl);
        const reservedSeats = await fetch(apiReservedUrl);
        const movie = await fetch(apiMovieUrl);
        const showtime = await fetch(apiShowtimeUrl);
        const relevantShowtime = await fetch(apiRelevantShowtime);
        if (!availableSeats.ok) {
            throw new Error(`Response status: ${availableSeats.status}`);
        }
        if (!reservedSeats.ok) {
            throw new Error(`Response status: ${reservedSeats.status}`);
        }
        if (!movie.ok) {
            throw new Error(`Response status: ${movie.status}`);
        }
        if (!showtime.ok) {
            throw new Error(`Response status: ${showtime.status}`);
        }
        if (!relevantShowtime.ok) {
            throw new Error(`Response status: ${relevantShowtime.status}`);
        }
        // Parse the available seats data
        let availableSeatsData = await availableSeats.json();
        const reservedSeatsData = await reservedSeats.json();
        availableSeatsData = extractAvailableSeats(availableSeatsData, reservedSeatsData);
        const movieData = await movie.json();
        let showtimeData = await showtime.json();
        let relevantShowtimeData = await relevantShowtime.json();
        showtimeData = showtimeData.data;
        relevantShowtimeData = relevantShowtimeData.data.theaters[0].showtimes;
        // Render the seat selection page with available seats and identifiers
        res.render('seat-selection', {
            movieId,
            showtimeId,
            showtimeDate: showtimeData.date,
            formattedDate: showtimeData.formattedDate,
            year: showtimeData.year,
            dayOfWeek: showtimeData.dayOfWeek,
            showtimeTime: showtimeData.startTime,
            theaterName: showtimeData.TheaterRoom.Theater.theaterName,
            image: movieData.image,
            name_vn: movieData.name_vn,
            roomName: showtimeData.TheaterRoom.roomName,
            city: showtimeData.TheaterRoom.Theater.theaterCity,
            relevantShowtime: relevantShowtimeData,
            rows: availableSeatsData.rows,
        });
    } catch (error) {
        console.error(`Error retrieving seats for movieID ${movieId}, showtimeID ${showtimeId}:`, error);
        res.status(500).render('error', { message: 'Internal Server Error.' });
    }
};