'use strict';

var CustomerMgr = require('dw/customer/CustomerMgr');
var iterator = require('dw/util/Iterator');
var File = require('dw/io/File');
var FileWriter = require('dw/io/FileWriter');
var CSVStreamWriter = require('dw/io/CSVStreamWriter');
var Site = require('dw/system/Site');
var URLUtils = require('dw/web/URLUtils');
var Logger = require('dw/system/Logger');

/**
 * @function exportCustomers
 * @description Function that export Customers object for a isCustomer flag passed as a parameter.
 *
 * @param {Object} parameters Represents the parameters defined in the steptypes.json file
 */
module.exports = {
    exportCustomers: function (parameters) {
        var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
        var currentTime = new Date().toLocaleDateString();
        var WEBDAV_SERVLET = '/on/demandware.servlet/webdav/Sites';
        var fileName = currentTime + '_customersAVoshchanikin.csv';
        var csvFile;
        var fileWriter;
        var csvStreamWriter;
        var csvURL;

        csvFile = new File(File.IMPEX + File.SEPARATOR + 'src' + File.SEPARATOR + 'CustomObjectExport' + File.SEPARATOR + fileName);
        fileWriter = new FileWriter(csvFile);
        csvStreamWriter = new CSVStreamWriter(fileWriter);

        csvStreamWriter.writeNext([
            'First Name',
            'Last name',
            'Email',
            'Creation Date']);

        iterator = CustomerMgr.searchProfiles(
            '(creationDate >= {0} AND creationDate <= {1}) AND custom.isCustomer_avoshchanikin = {2}',
            'creationDate',
            parameters.startDate,
            parameters.endDate,
            'true'
        );

        while (iterator.hasNext()) {
            var customer = iterator.next();
            csvStreamWriter.writeNext([
                customer.firstName,
                customer.lastName,
                customer.email,
                customer.creationDate
            ]);
        }
        csvStreamWriter.close();

        var rootPathcsvFile = WEBDAV_SERVLET + csvFile.fullPath;
        csvURL = URLUtils.https(rootPathcsvFile).toString().split('/on')[0] + rootPathcsvFile;

        // Checkes emails from parameter string
        var emails = [];
        var emailsArr = parameters.email.replace(/\s/, '').split(',');
        emailsArr.forEach(function (email) {
            if (emailHelpers.validateEmail(email)) {
                emails.push(email);
            } else {
                Logger.warn("The email address isn't in the correct format - " + email);
            }
        });
        emails.join(', ').toString();

        var emailObj = {
            to: emails,
            subject: 'Daily csv file',
            from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com'
        };
        emailHelpers.send(emailObj, 'newsletter/csvsendfile', {
            csvURL: csvURL
        });
    }
};
