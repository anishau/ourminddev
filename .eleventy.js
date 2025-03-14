const path = require('path')
const fs = require('fs')

// Must be first! Use absolute path to .env specifically
const envPath = path.resolve(process.cwd(), '.env')

// Debug .env file
console.log('Looking for .env at:', envPath)
console.log('.env exists:', fs.existsSync(envPath))
if (fs.existsSync(envPath)) {
    console.log('.env contents:', fs.readFileSync(envPath, 'utf8'))
}

require('dotenv').config({ 
    path: envPath,
    override: true
})

// Debug environment variables
console.log('Process env after dotenv:', {
    SUPABASE_URL: process.env.SUPABASE_URL ? 'Found' : 'Missing',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Found' : 'Missing'
})

module.exports = function(eleventyConfig) {
    // Set Nunjucks as the default template engine
    eleventyConfig.setTemplateFormats([
        "md",
        "njk"
    ]);

    // Add Nunjucks filters
    eleventyConfig.addNunjucksFilter("safe", function(content) {
        return content;
    });

    // Pass environment variables to templates
    const envVars = {
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
    
    // Debug raw values
    console.log('Raw environment values:', {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_ANON_KEY,
        envVars
    })
    
    eleventyConfig.addGlobalData("env", envVars);

    // Copy JS files
    eleventyConfig.addPassthroughCopy({
        "src/_includes/js": "js"
    });

    // Debug template processing
    eleventyConfig.addTransform("debugHTML", function(content, outputPath) {
        if(outputPath && outputPath.endsWith(".html")) {
            console.log('Processing:', outputPath);
            console.log('First 500 chars:', content.substring(0, 500));
        }
        return content;
    });

    // Add this near the top of your module.exports function
    eleventyConfig.setNunjucksEnvironmentOptions({
        throwOnUndefined: true,
        autoescape: false
    });

    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            layouts: "_includes",
            data: "_data"
        },
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
        templateFormats: ["md", "njk"]
    };
}; 