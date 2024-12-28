const { Showtime, TheaterRoom, Theater } = require('../booking_model/index')
const { getCachedData } = require('../../../config/redisConnection');
const { Op } = require('sequelize');
async function getShowtimes(movieId, date, city) {
    try {
        console.time('Redis'); // Start timing
        const uniqueDatesCacheKey = `uniqueDates:`; // Adjust if uniqueDates is context-specific
        const uniqueCityCacheKey = `uniqueCity`; // Adjust if uniqueCity is context-specific

        // Fetch uniqueDates with caching

        const uniqueDates = await getCachedData(uniqueDatesCacheKey, () =>
            Showtime.findAll({
                attributes: ['date', 'dayOfWeek'],
                where: {
                    movieId,
                    date: {
                        [Op.gte]: new Date(),
                    },
                },
                group: ['date'],
                order: [['date', 'ASC']],
                raw: false, // Fetch plain objects to reduce overhead
            })
        );
        // Fetch uniqueCity with caching
        const uniqueCity = await getCachedData(uniqueCityCacheKey, () =>
            Theater.findAll({
                attributes: ['city'],
                group: ['city'],
                order: [['city', 'ASC']],
                raw: true,
            })
        );
        console.timeEnd('Redis'); // Logs the time taken
        console.time('MySQL'); // Start timing
        const showtimes = await Showtime.findAll({
            attributes: ['showtimeId', 'movieId', 'roomId', 'date', 'startTime'],
            where: {
                ...(movieId ? { movieId } : {}),
                ...(date ? { date } : {}),
            },
            include: [
                {
                    model: TheaterRoom,
                    attributes: ['roomId', 'roomName', 'totalSeats'],
                    include: [
                        {
                            model: Theater,
                            attributes: ['theaterId', 'theaterName', 'Location', 'theaterCity']
                        }
                    ]
                }
            ],
            order: [['startTime', 'ASC']]
        });
        console.timeEnd('MySQL'); // Logs the time taken
        console.time('theaterMap'); // Start timing
        // Build {theaters: []} structure
        const theaterMap = {};
        for (const showtime of showtimes) {
            const { showtimeId, date, startTime } = showtime.dataValues;
            const { roomId, roomName, totalSeats, Theater: theater } = showtime.TheaterRoom;
            const { theaterId, theaterName, Location, theaterCity } = theater.dataValues;
            // If theater not mapped yet, create entry
            // console.log(city + " " + theaterCity);
            if (city && theaterCity != city) {
                continue;
            }
            const currentTime = new Date();
            const showStartTime = new Date(`${date}T${startTime}`);
            if (currentTime > showStartTime) {
                continue;
            }
            if (!theaterMap[theaterId]) {
                theaterMap[theaterId] = {
                    theaterId,
                    theaterName,
                    address: `${Location}, ${theaterCity}`,
                    showtimes: []
                };
            }

            // Append new showtime
            theaterMap[theaterId].showtimes.push({
                showtimeId,
                date,
                startTime: startTime.slice(0, 5), // Extract only HH:MM
                theaterRoom: {
                    roomId,
                    roomName,
                    totalSeats
                }
            });
        }
        console.timeEnd('theaterMap'); // Logs the time taken
        return {
            theaters: Object.values(theaterMap),
            uniqueDates: uniqueDates,
            uniqueCity: uniqueCity
        };
    } catch (error) {
        console.error('Error fetching showtimes:', error);
        throw error;
    }
}
module.exports = { getShowtimes };
