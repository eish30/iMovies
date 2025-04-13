const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const Admin = require("./models/adminModel");
const Movie = require("./models/movieModel");
const Theatre = require("./models/theatreModel");
const Show = require("./models/showModel");
const Favorite = require("./models/favoriteModel");
const Booking = require("./models/bookingModel");
const Review = require("./models/reviewModel");
const User = require("./models/userModel");

mongoose.connect("mongodb://127.0.0.1:27017/your-db-name");

async function seedDB() {
  try {
    // Clear existing collections
    await Admin.deleteMany({});
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Show.deleteMany({});
    await Favorite.deleteMany({});
    await Booking.deleteMany({}); // Clear the bookings
    await Review.deleteMany({}); // Clear the reviews
    await User.deleteMany({}); // Clear the users

    // Seed admin
    const admin = await Admin.create({
      username: "superadmin",
      email: "admin@example.com",
      password: "admin123",
    });

    console.log("✅ Admin seeded");

    // Seed users
    const user1Password = await bcrypt.hash("password123", 10);
    const user2Password = await bcrypt.hash("password456", 10);

    const usersData = [
      {
        username: "user1",
        email: "user1@example.com",
        password: user1Password,
      },
      {
        username: "user2",
        email: "user2@example.com",
        password: user2Password,
      },
    ];

    const insertedUsers = await User.insertMany(usersData);
    console.log("👥 Users seeded");

    // Seed movies
    const moviesData = [
      {
        
movieName: "The Shawshank Redemption",
description: "Two imprisoned men bond over a number of years...",
genres:"Drama",
releaseDate:"1994-09-22",
runtime: 142,
certification: "R",
media: "D:\\VIT Imp\\Winter Sem 2025\\code\\mern proj\\iMovies\\frontend\\frontend\\src\\assets\\shawshankPoster.jpg",

movieId:"55e9c2e7-8552-489b-ad04-76538a6c1c67"
},
      {
        movieName:"The Godfather",
description:"The aging patriarch of an organized crime dynasty...",
genres:"Crime",
releaseDate:"1972-03-24",
runtime:175,
certification:"R",
media:"D:\VIT Imp\Winter Sem 2025\code\mern proj\iMovies\frontend\frontend\src\assets\godfatherPoster.jpg",
movieId:"87a64778-bc97-4945-9c1a-b0b57c5696a8"
      },
      {
        movieName:"the dark knight",
description:"When the menace known as the Joker wreaks havoc...",
genres:"Action",
releaseDate:"2008-07-18",
runtime:152,
certification:"PG-13",
media:"D:\VIT Imp\Winter Sem 2025\code\mern proj\iMovies\frontend\frontend\src\assets\darkknightPoster.jpg",
movieId:"f4ba14b1-d5b6-4708-93cc-73b31ab6d0ee"
      },
    ];

    const insertedMovies = await Movie.insertMany(moviesData);
    console.log("🎬 Movies seeded");

    // Seed theatres
    const theatresData = [
      {
        theatreName: "Grand Cinema",
        theatreId: uuidv4(),
        location: "New York",
        balconySeatPrice: 15,
        middleSeatPrice: 12,
        lowerSeatPrice: 10,
        balconySeats: { rows: 2, columns: 10 },
        middleSeats: { rows: 4, columns: 12 },
        lowerSeats: { rows: 3, columns: 14 },
        adminEmail: admin.email,
        updatedBy: admin.email,
        updatedDate: new Date(),
      },
      {
        theatreName: "Movie Palace",
        theatreId: uuidv4(),
        location: "Los Angeles",
        balconySeatPrice: 16,
        middleSeatPrice: 13,
        lowerSeatPrice: 11,
        balconySeats: { rows: 2, columns: 9 },
        middleSeats: { rows: 3, columns: 11 },
        lowerSeats: { rows: 4, columns: 13 },
        adminEmail: admin.email,
        updatedBy: admin.email,
        updatedDate: new Date(),
      },
    ];

    const insertedTheatres = await Theatre.insertMany(theatresData);
    console.log("🏢 Theatres seeded");

    // Seed shows
    for (const movie of insertedMovies) {
      for (const theatre of insertedTheatres) {
        const show1 = {
          adminEmail: admin.email,
          showId: uuidv4(),
          movieId: movie.movieId,
          theatreName: theatre.theatreName,
          showdate: "2025-04-20",
          showtime: "18:30",
          tickets: { balcony: {}, middle: {}, lower: {} }, // Initialize ticket categories
        };
        const show2 = {
          adminEmail: admin.email,
          showId: uuidv4(),
          movieId: movie.movieId,
          theatreName: theatre.theatreName,
          showdate: "2025-04-21",
          showtime: "21:00",
          tickets: { balcony: {}, middle: {}, lower: {} }, // Initialize ticket categories
        };

        const insertedShows = await Show.insertMany([show1, show2]);
        const showIds = insertedShows.map((s) => s.showId);

        await Movie.updateOne(
          { movieId: movie.movieId },
          { $addToSet: { shows: { $each: showIds } } }
        );
      }
      console.log(`🎭 Shows added for movie: ${movie.movieName}`);
    }

    // Seed favorites
    const userEmail = "user1@example.com";
    const favoriteEntries = insertedMovies.slice(0, 2).map((movie) => ({
      movieId: movie.movieId,
      userEmail,
    }));

    await Favorite.insertMany(favoriteEntries);
    console.log("❤️ Favorite movies seeded for user:", userEmail);

    // Seed bookings
    const testUserEmail = "user1@example.com";
    const sampleBookings = [];

    for (const movie of insertedMovies.slice(0, 2)) {
      const relatedShows = await Show.find({ movieId: movie.movieId });

      if (relatedShows.length > 0) {
        const show = relatedShows[0];

        const booking = {
          bookingId: uuidv4(),
          userEmail: testUserEmail,
          showId: show.showId,
          ticketsData: {
            balcony: { "B1": true, "B2": true },
            middle: { "M5": true },
            lower: {},
          },
        };

        // Ensure show.tickets exists, then update the show's tickets with these seats
        if (!show.tickets) {
          show.tickets = { balcony: {}, middle: {}, lower: {} };
        }

        show.tickets.balcony = {
          ...show.tickets.balcony,
          ...booking.ticketsData.balcony,
        };
        show.tickets.middle = {
          ...show.tickets.middle,
          ...booking.ticketsData.middle,
        };
        show.tickets.lower = {
          ...show.tickets.lower,
          ...booking.ticketsData.lower,
        };

        await show.save();
        sampleBookings.push(booking);
      }
    }

    await Booking.insertMany(sampleBookings);
    console.log("🎟️ Bookings seeded for test user");

    // Seed reviews
    const reviewData = insertedMovies.slice(0, 2).map((movie) => ({
      reviewId: uuidv4(),
      movieId: movie.movieId,
      review: "Amazing movie! A must-watch for anyone who loves thrilling adventures.",
      username: "user1",
      email: "user1@example.com",
      datetime: new Date(),
    }));

    await Review.insertMany(reviewData);
    console.log("🌟 Reviews seeded");

    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected. All data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seedDB();
