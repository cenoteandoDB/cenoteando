module.exports = {
    configureWebpack: {        
        devServer: {
            proxy: {
                '/api': {
                    target: 'http://localhost:8080',
                    changeOrigin: true,
                },
                '/oai': {
                    target: 'http://localhost:8080',
                    changeOrigin: true,
                },
            },
        },
    },
    transpileDependencies: ['vuetify'],
    pwa: {
        name: 'Cenoteando',
        themeColor: '#1976D2',
        msTileColor: '#000000',
        iconPaths: {
            msTileImage: 'img/icons/mstile-150x150.png',
        },
        workboxOptions: {
            skipWaiting: true,
        },
    },
};
