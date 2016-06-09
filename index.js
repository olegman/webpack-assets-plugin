const path = require('path');
const fs   = require('fs');

module.exports = class WebpackAssetsPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        compiler.plugin('done', stats => {
            const json = stats.toJson({context: compiler.context});
            const assetsBaseUrl = compiler.options.devServer && compiler.options.devServer.publicPath ? compiler.options.devServer.publicPath : json.publicPath;
            let result = {
                javascript: {},
                styles: {}
            }
            Object.keys(json.assetsByChunkName).forEach(chunkName => {
                let chunkAssets = json.assetsByChunkName[chunkName];

                if (!Array.isArray(chunkAssets)) {
                    chunkAssets = [chunkAssets]
                }

                chunkAssets = chunkAssets.filter(name => name.indexOf('hot-update') == -1);
                chunkAssets.forEach(name => {
                    switch (path.extname(name)) {
                        case '.js':
                            result.javascript[chunkName] = assetsBaseUrl + name;
                            break;
                        case '.css':
                            result.styles[chunkName] = assetsBaseUrl + name
                            break;
                        default:
                            //noop
                    }
                })
            })
            const file = JSON.stringify(result, null, 2);
            fs.writeFileSync(compiler.context + '/webpack-assets.json', file);
        });
    }
}
