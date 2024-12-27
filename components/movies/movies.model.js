const mongoose = require('mongoose');
const movieDBConnection = require('../../config/movieDBConnection');

const MovieSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id: String,
  name_vn: String,
  name_en: String,
  director: String,
  actor: String,
  country_id: String,
  country_name_vn: String,
  country_name_en: String,
  formats_id: String,
  formats_name_vn: String,
  formats_name_en: String,
  type_id: String,
  type_name_vn: Array,
  type_name_en: Array,
  release_date: Date,
  end_date: Date,
  brief_vn: String,
  brief_en: String,
  image: String,
  himage: String,
  trailer: String,
  status: String,
  ratings: String,
  time: Number,
  limitage_id: String,
  limitage_vn: String,
  limitage_en: String,
  language_id: String,
  language_vn: String,
  language_en: String,
  sortorder: String,
  background_image_url: String,
});
const Movie = movieDBConnection.model("movies", MovieSchema);

//pagination
// const paginate = require('mongoose-paginate-v2');
// MovieSchema.plugin(paginate);

module.exports = Movie;
