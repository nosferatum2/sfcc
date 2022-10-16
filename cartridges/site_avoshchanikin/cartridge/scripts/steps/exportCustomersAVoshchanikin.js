'use strict';

var CustomerMgr = require('dw/customer/CustomerMgr');
var iterator = require('dw/util/Iterator');
var File = require('dw/io/File');
var FileWriter = require('dw/io/FileWriter');
var CSVStreamWriter = require('dw/io/CSVStreamWriter');

/**
 * @function exportCustomers
 * @description Function that export Customers object for a isCustomer flag passed as a parameter.
 *
 * @param {Object} parameters Represents the parameters defined in the steptypes.json file
 */
module.exports = {
    exportCustomers: function (parameters) {
        var Site = require('dw/system/Site');
        var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
        var currentTime = new Date().toLocaleDateString();
        var fileName = currentTime + '_customersAVoshchanikin.csv';
        var csvFile;
        var fileWriter;
        var csvStreamWriter;
        var csvURL;

        csvFile = new File('/IMPEX/src/CustomObjectExport/' + fileName);
        fileWriter = new FileWriter(csvFile);
        csvStreamWriter = new CSVStreamWriter(fileWriter);

        csvStreamWriter.writeNext([
            'First Name',
            'Last name',
            'Email',
            'Creation Date']);

        iterator = CustomerMgr.searchProfiles(
            'creationDate >= {0} AND creationDate < {1} AND custom.isCustomer_avoshchanikin = true',
            'creationDate',
            parameters.startDate,
            parameters.endDate
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

        csvURL = 'https://zzrj-049.sandbox.us03.dx.commercecloud.salesforce.com/on/demandware.servlet/webdav/Sites' + csvFile.getFullPath();

        var emailObj = {
            to: parameters.email,
            subject: 'Daily csv file',
            from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com'
        };
        emailHelpers.send(emailObj, 'newsletter/csvsendfile', {
            csvURL: csvURL
        });
    }
};
