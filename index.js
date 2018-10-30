if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/comment/sw.js', { scope: './' }).then(function(reg) {

    if(reg.installing) {
      console.log('Service worker installing');
    } else if(reg.waiting) {
      console.log('Service worker installed');
    } else if(reg.active) {
      console.log('Service worker active');
    }

  }).catch(function(error) {
    // registration failed
    console.log('Registration failed with ' + error);
  });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
function getCommentText(comments, counter) {
  return '"' + comments[counter][0] + '"'
}
function getCountryText(comments, counter) {
  return comments[counter][1]
}
function setText(commentText, countryText, maxLength) {
    var comment = document.getElementById('comment');
    var country = document.getElementById('country');
    comment.textContent = commentText
    country.textContent = countryText
    if (commentText.length > maxLength) {
        comment.classList.add('long-text');
    } else {
        comment.classList.remove('long-text');
    }
}
function getCountryTexts(comments, country) {
    var countryTexts = [];
    var hasFound = false;
    var numberOfComments = comments.length;
    for (var i = 0; i < numberOfComments; ++i) {
        var textCountry = comments[i][1];
        if (textCountry == country) {
            hasFound = true;
            countryTexts.push(comments[i]);
        } else if (hasFound) {
            // Assuming all countries comments stay together
            break;
        }
    }

    return countryTexts;
}

function getCountryParam() {
    var countries = {
      'sg': 'Singapore',
      'ph': 'Philippines',
      'my': 'Malaysia',
      'hk': 'Hong Kong',
      'tw': 'Taiwan',
      'id': 'Indonesia'
    };
    var params = new URL(location.href).searchParams;
    var raw_country = params.get('country');

    return typeof(countries[raw_country]) == 'undefined' ? '' : countries[raw_country];
}

function displayText(comments) {
    var timeToWait = 10000;
    var maxLength = 200; // should allow for 5 line with 40 characters per line
    var comments = comments || [];
    var countryParam = getCountryParam();

    if (countryParam != '') {
        comments = getCountryTexts(comments, countryParam);
    }

    var comment = document.getElementById('comment');
    var country = document.getElementById('country');
    var numberOfComments = comments.length;

    if (numberOfComments) {
      var counter = getRandomInt(numberOfComments);
      setText(getCommentText(comments, counter), getCountryText(comments, counter), maxLength)
      setInterval(function() {
          counter = (counter + 1) % comments.length;
          setText(getCommentText(comments, counter), getCountryText(comments, counter))
      }, timeToWait);
    }
}

var data = document.getElementById('data');
data.addEventListener('onload', displayText(comments));
