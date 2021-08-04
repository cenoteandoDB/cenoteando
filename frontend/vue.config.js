module.exports = {
    devServer: {
        proxy: 'http://localhost/',
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
