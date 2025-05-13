import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import fs from 'fs';
import fetch from 'node-fetch';

// === CONFIG ===
const UNSPLASH_ACCESS_KEY = 'yvBnmPUxuJviYnvFfRYQCj5EN-FeNPBC-akvek8UsJA'; // <-- Put your Unsplash Access Key here
const INPUT_CSV = 'cars.csv';
const OUTPUT_CSV = 'cars_with_images.csv';

// === MAIN ===
async function main() {
  const csvData = fs.readFileSync(INPUT_CSV, 'utf8');
  const records = parse(csvData, { columns: true , delimiter: ';'});
  for (let car of records) {
    const query = `Car ${car.Brand} ${car.CarType} ${car.CarModel}`;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
    });

    const data = await res.json();
    if (data.results && data.results.length > 0) {
      car.Image = data.results[0].urls.regular;
      console.log(`Found image for ${car.Brand} ${car.CarModel}`);
    } else {
      car.Image = '';
      console.warn(`No image found for ${car.Brand} ${car.CarModel}`);
    }
    await new Promise(r => setTimeout(r, 1000))
    // To avoid hitting rate limits, you may want to add a delay here (e.g., await new Promise(r => setTimeout(r, 1000));)
  }

  const output = stringify(records, { header: true });
  fs.writeFileSync(OUTPUT_CSV, output);
  console.log(`Done! Output written to ${OUTPUT_CSV}`);
}

main().catch(console.error); 