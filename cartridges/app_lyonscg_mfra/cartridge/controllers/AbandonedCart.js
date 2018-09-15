'use strict'

var server = require('server');
var BasketMgr = require('dw/order/BasketMgr');
var URLUtils = require('dw/web/URLUtils');

/**
 * Checks if the customer basket exists and has any product line items.
 */
function hasNonEmptyBasket() {
    let basket = BasketMgr.getCurrentBasket();

    // Is there an existing basket?
    if (basket) {
        // Are there any products in the basket?
        if (!basket.getAllProductLineItems().isEmpty()) {
            return true;
        }
    }

    return false;
}

/**
 * Creates a list of products, and optional quantities, from indexed query parameters.
 * @example ?p=firstprodid&q=2&p1=secondprod&q1=1&p2=thirdprod&q2=1... or simply ?p=first&p1=second...
 */
function parseQueryParams(querystring) {
    let products = [];

    // Products specified as indexed parameters p=abc&q=2&p1=def&q1=1...
    if (querystring.p) {
        let index = 0;
        let paramIndex = '';

        while(querystring['p' + paramIndex]) {
            products.push({ 
                id: querystring['p' + paramIndex],
                quantity: parseInt(querystring['q' + paramIndex] || 1)
            });

            paramIndex = ++index + '';
        }
    }

    return products;
}

/**
 * Takes the parsed list of products and attempts to add each to the cart, using existing helper scripts.
 * Logs all errors but does not throw. Worst case user will be taken to an empty cart, not an error page.
 */
function createBasket(products) {
    let Transaction = require('dw/system/Transaction');
    let ProductMgr = require('dw/catalog/ProductMgr');
    let Logger = require('dw/system/Logger');
    let cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    let basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    let basket = BasketMgr.getCurrentOrNewBasket();

    if (products && products.length) {
        Transaction.begin();

        try {
            // Attempt to add all products
            let results = products.map(function (prod) {
                // People don't null check their code :/
                if (!ProductMgr.getProduct(prod.id)) {
                    return {
                        error: true,
                        message: 'Product does not exist: ' + prod.id
                    };
                }

                return cartHelper.addProductToCart(
                    basket,
                    prod.id,
                    prod.quantity,
                    []);
            });

            // Do the basket things
            cartHelper.ensureAllShipmentsHaveMethods(basket);
            basketCalculationHelpers.calculateTotals(basket);
        
            Transaction.commit();

            // Errors on certain products will not stop cart build, but should be logged.
            let errors = results.filter(function (result) { return result.error; })
            .map(function(result) { return result.message; })
            .join(" | ");

            Logger.error("Could not create entire cart. Error summary: " + errors);
        } 
        catch (error) {
            Transaction.rollback();

            // Capture and log the error.
            Logger.error("Failed to create cart! " + error.message);
        }
    }
}

server.get('Start', function (req, res, next) {
    if (hasNonEmptyBasket()) {
        // Show existing basket.
        res.redirect(URLUtils.url('Cart-Show'));
    }

    next();
},
function (req, res, next) {
    let products = parseQueryParams(req.querystring);
    createBasket(products);

    res.redirect(URLUtils.url('Cart-Show'));

    next();
});

module.exports = server.exports();
