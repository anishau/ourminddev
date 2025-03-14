require('dotenv').config()

module.exports = function(eleventyConfig) {
    // Pass environment variables to templates
    eleventyConfig.addGlobalData("env", {
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    });

    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "../_includes",
            layouts: "../_includes"
        }
    };
}; 