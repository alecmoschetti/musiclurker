// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const async = require('async');
const Artist = require('./models/artist');
const Album = require('./models/album');
const Genre = require('./models/genre');
const Label = require('./models/label');

const mongoose = require('mongoose');
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let artists = []
let genres = []
let albums = []
let labels = []

function createArtist(name, profile, albums, portrait, cb) {
  let artistDetail = {name, profile, albums, portrait};
  const artist = new Artist(artistDetail);
  artist.save(err => {
    if (err) {
      cb(err, null);
      return;
    }
    artists.push(artist);
    cb(null, artist);
  });
}

function createAlbum(title, artist, tracks, date_released, genre, label, cover, cb) {
  let albumDetail = {title, artist, tracks, date_released, genre, label, cover};
  const album = new Album(albumDetail);
  album.save(err => {
    if (err) {
      cb(err, null);
      return;
    }
    albums.push(album);
    cb(null, album);
  });
}

function createGenre(name, description, cb) {
  let genreDetail = {name, description};
  const genre = new Genre(genreDetail);
  genre.save(err => {
    if (err) {
      cb(err, null);
      return;
    }
    genres.push(genre);
    cb(null, genre);
  });
}

function createLabel(name, location, cb) {
  let labelDetail = {name, location};
  const label = new Label(labelDetail);
  label.save(err => {
    if (err) {
      cb(err, null);
      return;
    }
    labels.push(label);
    cb(null, label);
  });
}

function createData(cb) {
    async.series([
        function(callback) {
          createGenre("Indie Rock", "The term indie rock, which comes from independent, describes the small and relatively low-budget labels on which it is released and the do-it-yourself attitude of the bands and artists involved. Although distribution deals are often struck with major corporate companies, these labels and the bands they host have attempted to retain their autonomy, leaving them free to explore sounds, emotions and subjects of limited appeal to large, mainstream audiences.", callback);
        },
        function(callback) {
          createGenre('Punk', 'Typically short, fast-paced songs with hard-edged melodies and singing styles, stripped-down instrumentation, and often shouted political, anti-establishment lyrics. Punk embraces a DIY ethic; many bands self-produce recordings and distribute them through independent record labels.', callback);
        },
        function(callback) {
          createGenre('Contemporary Folk', 'Acoustic and/or tradition-based music from the U.K. and the United States.', callback);
        },
        function(callback) {
          createGenre('Hip-Hop', "Hip-Hop is a cultural movement that emerged in the South Bronx in New York City during the 1970s, with MCing (or rapping) being one of the primary four elements. Hip hop's other three essential elements are graffiti art, break dancing, and DJing.", callback);
        },
        function(callback) {
          createLabel("Saddle Creek Records", "Omaha, Nebraska", callback)
        },
        function(callback) {
            createLabel("Slash Records", "Los Angeles, California", callback)
        },
        function(callback) {
            createLabel("Columbia Records", "New York City, New York", callback)
        },
        function(callback) {
            createLabel("Top Dawg Entertainment", "Carson, California", callback)
        },
        function(callback) {
          createArtist("Land of Talk", "Land of Talk is a Canadian indie rock band formed in 2006 from Montreal, Quebec, Canada. The band is led by singer and guitarist Elizabeth Powell.", [albums[0],], "/uploads/landoftalk@0.75x.jpg", callback);
        },
        function(callback) {
          createArtist("Germs", "The Germs were an American punk rock band from Los Angeles, California, originally active from 1976 to 1980.", [albums[1],], "/uploads/germs@0.75x.jpg", callback);
        },
        function(callback) {
          createArtist("Bob Dylan", "Bob Dylan (Born May 24, 1941) is an American singer-songwriter, author and visual artist. Often regarded as one of the greatest songwriters of all time, Dylan has been a major figure in popular culture during a career spanning nearly 60 years.", [albums[2],], "/uploads/bobdylan@0.75x.jpg", callback);
        },
        function(callback) {
          createArtist("Kendrick Lamar", "Kendrick Lamar Duckworth (born June 17, 1987) is an American rapper, songwriter, and record producer.", [albums[3],], "/uploads/kendricklamar@0.75x.jpg", callback);
        },
        function(callback) {
          createArtist('Young Jesus', "Young Jesus is an American art rock band originally from Chicago, Illinois, and currently based in Los Angeles, California.", [albums[4],], "/uploads/youngjesus@0.75x.jpg", callback);
        },
        function(callback) {
          createAlbum("Some Are Lakes", artists[0], 10, "2008-10-07", [genres[0],], labels[0], "/uploads/somearelakes.jpeg", callback);
        },
        function(callback) {
          createAlbum("GI", artists[1], 12, "1979-10-01", [genres[1],], labels[1], "/uploads/gi.png", callback);
        },
        function(callback) {
          createAlbum("Bringing It All Back Home", artists[2], 10, "1965-03-22", [genres[2],], labels[2], "/uploads/bringingitallbackhome.jpeg", callback);
        },
        function(callback) {
          createAlbum("To Pimp A Butterfly", artists[3], 17, "2015-03-15", [genres[3],], labels[3], "/uploads/topimpabutterfly.png", callback);
        },
        function(callback) {
          createAlbum("The Whole Thing Is Just There", artists[4], 8, "2018-10-12", [genres[0], genres[1]], labels[0], "/uploads/thewholethingisjustthere.jpeg", callback);
        },
        ]);
}

async.series([
    createData
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});