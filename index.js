"use strict";
/*      gulp-avif-webp-html
© Copyright (04.11.2021) by powerrampage
Github: github.com/powerrampage/
Telegram: t.me/powerrampage
*/
const pluginName = 'gulp-avif-webp-html'
const gutil = require('gulp-util')
const PluginError = gutil.PluginError
const through = require('through2')
module.exports = function (extensions) {
    var extensions = extensions || ['.jpg', '.png', '.jpeg']
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file)
            return
        }
        if (file.isStream()) {
            cb(new PluginError(pluginName, 'Streaming not supported'))
            return
        }
        try {
            let inPicture = false
            const data = file.contents
                .toString()
                .split('\n')
                .map(function (line) {
                    if (line.indexOf('<picture') + 1) inPicture = true
                    if (line.indexOf('</picture') + 1) inPicture = false
                    if (line.indexOf('<img') + 1 && !inPicture) {
                        let Re = /<img([^>]+)src=[\"\'](\S+)[\"\']([^>\/]+)\/?>/gi
                        let regexpArray = Re.exec(line)
                        let imgTag = regexpArray[0]
                        let srcImage = regexpArray[2]
                        let newAvifUrl = srcImage
                        if (srcImage.indexOf('.avif') + 1) return line
                        extensions.forEach(ext => {
                            if (srcImage.indexOf(ext) == -1) {
                                return line;
                            } else {
                                let newWebpUrl = newAvifUrl.replace(ext, '.webp');
                                newAvifUrl = newAvifUrl.replace(ext, '.avif')
                                switch (ext) {
                                    case '.jpg':
                                        line = '<picture>' +
                                            '<source srcset="' + newAvifUrl + '" type="image/avif">' +
                                            '<source srcset="' + newWebpUrl + '" type="image/webp">' +
                                            imgTag +
                                            '</picture>'
                                        break;

                                    case '.png':
                                        line = '<picture>' +
                                            '<source srcset="' + newAvifUrl + '" type="image/avif">' +
                                            '<source srcset="' + newWebpUrl + '" type="image/webp">' +
                                            imgTag +
                                            '</picture>'
                                        break;

                                    default:
                                        line = '<picture>' +
                                            '<source srcset="' + newAvifUrl + '" type="image/avif">' +
                                            '<source srcset="' + newWebpUrl + '" type="image/webp">' +
                                            imgTag +
                                            '</picture>'
                                }
                            }
                        });
                        return line
                    }
                    return line
                })
                .join('\n')
            file.contents = new Buffer.from(data)
            this.push(file)
        } catch (err) {
            this.emit('error', new PluginError(pluginName, err))
        }
        cb()
    })
}