const fs = require('fs');
const content = fs.readFileSync('c:/Users/ADMIN/Downloads/IA trabajaos/Elena Atalier/.gemini/max_step_content.txt', 'utf8');

const cleanContent = content.replace(/^\d+:\s/gm, '');

const tplMatch = cleanContent.indexOf('const oldTemplatesBlock = ');
const tplEnd = cleanContent.indexOf(';', tplMatch);
if (tplMatch > -1 && tplEnd > -1) {
    fs.writeFileSync('c:/Users/ADMIN/Downloads/IA trabajaos/Elena Atalier/.gemini/scratch/old_templates.js', cleanContent.substring(tplMatch + 27, tplEnd), 'utf8');
}

const sketchMatch = cleanContent.indexOf('const oldInteractiveSketchAndSave = ');
const sketchEnd = cleanContent.indexOf(';', sketchMatch);
if (sketchMatch > -1 && sketchEnd > -1) {
    fs.writeFileSync('c:/Users/ADMIN/Downloads/IA trabajaos/Elena Atalier/.gemini/scratch/old_sketch.js', cleanContent.substring(sketchMatch + 37, sketchEnd), 'utf8');
}

const carouselMatch = cleanContent.indexOf('const oldCarouselItem = ');
const carouselEnd = cleanContent.indexOf(';', carouselMatch);
if (carouselMatch > -1 && carouselEnd > -1) {
    fs.writeFileSync('c:/Users/ADMIN/Downloads/IA trabajaos/Elena Atalier/.gemini/scratch/old_carousel.js', cleanContent.substring(carouselMatch + 25, carouselEnd), 'utf8');
}
console.log("Extraction done!");
