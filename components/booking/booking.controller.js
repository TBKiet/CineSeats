exports.renderSeatSelection = async (req, res) => {
    const movieId = req.params.movieId;
    const { showtimeId, showtimeDate, formattedDate, year, dayOfWeek, showtimeTime, image, name_vn, roomName, theaterName, city } = req.body;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const apiBookingUrl = `${baseUrl}/api/booking?showtimeId=${showtimeId}`;
    try {
        // Retrieve available seats for the given showtime
        const availableSeats = await fetch(apiBookingUrl);
        if (!availableSeats.ok) {
            throw new Error(`Response status: ${availableSeats.status}`);
        }
        // Parse the available seats data
        const availableSeatsData = await availableSeats.json();
        // Render the seat selection page with available seats and identifiers
        res.render('seat-selection', {
            movieId,
            showtimeId,
            showtimeDate,
            formattedDate,
            year,
            dayOfWeek,
            showtimeTime,
            theaterName,
            image,
            name_vn,
            roomName,
            city,
            rows: availableSeatsData.rows,
        });
    } catch (error) {
        console.error(`Error retrieving seats for movieID ${movieId}, showtimeID ${showtimeId}:`, error);
        res.status(500).render('error', { message: 'Internal Server Error.' });
    }
}