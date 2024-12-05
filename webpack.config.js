import path from 'path';

export default {
    entry: './src/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve('.', 'dist'),
    },
    
};