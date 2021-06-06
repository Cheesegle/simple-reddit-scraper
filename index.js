const fetch = require('node-fetch');
const fs = require('fs');
const https = require('https');
const get_extension = require('get-url-extension')
const prompts = require('prompts');
const colors = require('colors');

function scrape(subreddit, upvotethreshold) {
  let dupes = false;
  let dcheck = [];
  let finished = false;
  function nya(e) {
    let url = "https://www.reddit.com/r/+" + subreddit + "+.json?limit=100&sort=top" + e;
    if (!fs.existsSync('./' + subreddit + '/')) {
      fs.mkdirSync('./' + subreddit + '/')
    }
    let settings = { method: "Get" };
    fetch(url, settings)
      .then(res => res.json())
      .then((json) => {
        if (dupes == false) {
          let ext = "&after=" + json.data.after;
          nya(ext);
        }
        for (var i = 0; i < json.data.children.length; i++) {
          if (json.data.children[i].data.url) {
            if (json.data.children[i].data.url.endsWith(".gif") === true || json.data.children[i].data.url.endsWith(".png") === true || json.data.children[i].data.url.endsWith(".jpg") === true || json.data.children[i].data.url.endsWith(".mp4") === true) {
              let p = json.data.children[i].data;
              if (!dcheck.includes(p.name)) {
                dcheck.push(p.name);
                if (p.ups >= upvotethreshold) {
                  console.log('Scraping... ' + p.name + ' | ' + p.url);
                  https.get(p.url, response => {
                    response.pipe(require('fs').createWriteStream('./' + subreddit + '/' + p.name + get_extension(p.url)));
                  }).catch(err => 1 + 1);
                }
              } else {
                dupes = true;
                if (i === json.data.children.length - 1 && finished == false) {
                  finished = true;
                  dcheck = null;
                  console.log(colors.green("Finished scraping r/" + subreddit));
                  console.log('Press any key to scrape another subreddit.');
                  process.stdin.once('data', function() {
                    startp();
                  });
                }
              }
            }
          }
        }
      })
      .catch(err => 1 + 1);
  }
  nya();
}

const questions = [
  {
    type: 'text',
    name: 'subreddit',
    message: 'Subreddit to scrape'
  },
  {
    type: 'number',
    name: 'threshold',
    message: 'Upvote threshold'
  }
];

async function startp() {
  let response = await prompts(questions);
  scrape(response.subreddit, response.threshold);
};

startp();