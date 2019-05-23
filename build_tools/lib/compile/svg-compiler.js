'use strict';

const SVGSpriter = require('svg-sprite'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require('fs'),
    File = require('vinyl'),
    glob = require('glob'),
    packageFile = require('../../../package.json'),
    xmldom = require('xmldom'),
    DOMParser = xmldom.DOMParser,
    XMLSerializer = xmldom.XMLSerializer,
    svgNamespace = 'http://www.w3.org/2000/svg';

/**
 * Generate <use> and <view> tags for css background styles
 *
 * @param {String} svg Sprite SVG
 * @return {String} Processed SVG
 */
var generateViewUseTags = function (svg) {
    const svgDom = new DOMParser().parseFromString(svg);
    let xCoordinate = 0;

    for (var c = 0, children = svgDom.documentElement.childNodes, cl = children.length; c < cl; ++c) {
        const symbol = children.item(c);

        const id = symbol.getAttribute('id');
        let viewBox = symbol.getAttribute('viewBox');
        let width = 0;
        let height = 0;

        if (viewBox.length) {
            viewBox = viewBox.split(/[^-\d\.]+/);

            while (viewBox.length < 4) {
                viewBox.push(0);
            }

            viewBox.forEach(function(value, index) {
                viewBox[index] = parseFloat(value, 10);
            });

            width = viewBox[2];
            height = viewBox[3];
            viewBox[0] = xCoordinate;
            viewBox = viewBox.join(' ');
        }

        let useElement = svgDom.createElementNS(svgNamespace, 'use');
        useElement.setAttribute('xlink:href', '#' + id);
        useElement.setAttribute('width', width);
        useElement.setAttribute('height', height);
        useElement.setAttribute('x', xCoordinate);

        let viewElement = svgDom.createElementNS(svgNamespace, 'view');
        viewElement.setAttribute('id', id + '-view');
        viewElement.setAttribute('viewBox', viewBox);

        svgDom.documentElement.appendChild(useElement);
        svgDom.documentElement.appendChild(viewElement);

        xCoordinate = xCoordinate + width;
    }

    return new XMLSerializer().serializeToString(svgDom.documentElement);
}

packageFile.sites.forEach(function (site) {
    site.cartridges.forEach(function (cartridge) {
        const cwd = path.resolve('cartridges', cartridge.name, 'cartridge/static/default');
        const svgIcons = path.join(cwd, 'svg-icons');
        const templateType = 'css';
        const templatePath = path.resolve(`build_tools/lib/compile/svg-sprite-styles/sprite.${templateType}`);

        const spriter = new SVGSpriter({
            dest: cwd,
            svg: {
                transform: [
                    /**
                     * Custom sprite SVG transformation
                     *
                     * @param {String} svg Sprite SVG
                     * @return {String} Processed SVG
                     */
                    function(svg) {
                        return generateViewUseTags(svg);
                    }
                ]
            },
            mode: {
                symbol: {
                    dest: './',
                    sprite: './images/compiled/sprites',
                    prefix: ".icon-%s",
                    render: {
                        css: {
                            dest: './css/sprites',
                            template: templatePath
                        }
                    }
                },
            }
        });

        // Find SVG files recursively via `glob`
        glob.glob('**/*.svg', { cwd: svgIcons }, function (err, files) {
            if (files.length) {
                files.forEach(function (file) {
                    // Create and add a vinyl file instance for each SVG
                    spriter.add(new File({
                        path: path.join(svgIcons, file),                 // Absolute path to the SVG file
                        base: svgIcons,                                  // Base path (see `name` argument)
                        contents: fs.readFileSync(path.join(svgIcons, file))  // SVG file contents
                    }));
                })

                spriter.compile(function (error, result, data) {
                    for (var type in result) {
                        if (result[type].sprite) {
                            mkdirp.sync(path.dirname(result[type].sprite.path));
                            fs.writeFileSync(result[type].sprite.path, result[type].sprite.contents);
                        }

                        if (result[type].css) {
                            mkdirp.sync(path.dirname(result[type].css.path));
                            fs.writeFileSync(result[type].css.path, result[type].css.contents);
                        }
                    }
                });
            }
        });
    });
});
