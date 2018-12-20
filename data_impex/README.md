# LYONSCG Data Deployment

"Data Impex" is a set of conventions for site imports used for developing and supporting an SFCC site. See /build_tools/README.md for the commands used to run a data deployment.

## Data Folders

### config_test

The `config_test` data folder contains test configuration used for sandboxes and quality assurance.

### core

The `core` data folder contains core data essential to all site functionality.

### data_test

The `data_test` data folder containts test data used for sandboxes and quality assurance. Should cover all development needs and test cases.

### data_test_static

The `data_test_static` data folder contains static files to support test data. Useful when there are a lot of product and content images that do not change frequently, so they do not need to be included in regular data deployments.

## Data Bundles

Data bundles are defined in config.json and can be extended to meet project structure needs. A data bundle defines a set of data folders to be deployed.
