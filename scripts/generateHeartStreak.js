// scripts/generateHeartStreak.js
const fs = require('fs');
const fetch = require('node-fetch');

const username = process.env.GITHUB_USERNAME || 'YOUR_USERNAME';
const outputFile = 'dist/heart.svg';

// GitHub GraphQL API query to get contributions
const query = `
{
  user(login: "${username}") {
    contributionsCollection {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

async function generateSVG() {
  // Fetch contribution data
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  const weeks = data.data.user.contributionsCollection.contributionCalendar.weeks;

  // Start SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="120" viewBox="0 0 720 120">`;

  let x = 0;
  const boxSize = 12;
  const gap = 2;

  for (const week of weeks) {
    let y = 0;
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        svg += `
          <text x="${x}" y="${y + boxSize}" font-size="${boxSize}" text-anchor="middle" opacity="0">
            ❤️
            <animate 
              attributeName="opacity" from="0" to="1" dur="0.3s" begin="${Math.random()}s" fill="freeze"/>
            <animateTransform 
              attributeName="transform" type="scale" from="0.5" to="1.2" dur="0.3s" begin="${Math.random()}s" fill="freeze"/>
          </text>`;
      }
      y += boxSize + gap;
    }
    x += boxSize + gap;
  }

  svg += `</svg>`;

  // Ensure dist folder exists
  if (!fs.existsSync('dist')) fs.mkdirSync('dist');

  fs.writeFileSync(outputFile, svg);
  console.log('✅ Heart streak SVG generated!');
}

generateSVG().catch(console.error);
