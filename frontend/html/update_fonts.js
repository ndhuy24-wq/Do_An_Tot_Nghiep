const fs = require('fs');
const path = require('path');

const dir = __dirname;
const fontLinks = `
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">`;

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.html') && file !== 'main.html') {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (!content.includes('fonts.googleapis.com')) {
            content = content.replace(
                /<link rel="stylesheet" href="\.\.\/css\//i, 
                `${fontLinks}\n    <link rel="stylesheet" href="../css/`
            );
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
});
