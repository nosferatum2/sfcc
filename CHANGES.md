## 1.3.0  9/27/2019

- LRA-382 Removed all references to "mfra"
- LRA-381 Updated Wishlist plugin
- LRA-378 Merged code with Salesforce SFRA version 4.3.0
- LRA-311 Optional quantity selector +/- controls
- LRA-372 Header Banner fix
- LRA-231 Confirm Email should not be required if Email is unchanged
- LRA-303 PDP Image Zoom fix
- LRA-374 Sitemap fix
- IEI-386 SARMS bug fix for duplicate components in multi-site project
- LRA-235 Source Code redirect added
- LRA-337 Fix to prevent skipping through checkout
- LRA-350 Sub category rendering template fix
- LRA-334 Tooltip fix
- LRA-332 SVG Builder added
- LRA-334 Merged code with Salesforce SFRA version 4.1.0
- LRA-293 Wishlist fix for mobile users

## 1.2.0  5/15/2019

- LRA-291	Updated LRA with Salesforce Releases 4.0.0, 3.6.0, 3.5.0, 3.4.0 - https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/releases
- LRA-285	Slick carousel update to 1.8.1
- LRA-331	Build Tools: Single dw.json at the project root now works for build tools and VSCode with adjusted properties 
- LRA-241	Build Tools: Clean untracked files
- LRA-213	Build Tools: README.md updates
- LRA-246	Make search icon clickable
- LRA-287	PDP category locic check for variants
- LRA-314	Custom build report publishing to Confluence to replace outdated plugin
- LRA-213	Build Tools: sfcc-ci command line tool integrated into build tools to use new OCAPI methods for code and data deploy
- LRA-200	Build Tools: UTF-8 encoding fix
- LRA-290	Navigation look and feel changes across all devices
- LRA-279	Prevent double click for place order
- LRA-196	Add the missing Search-ShowContent controller route
- LRA-180	Build Tools: Adjustments for SARMS and Sonar Qube

## 1.1.2  3/21/2019

- LRA-302	Silence ESlint warnings
- LRA-305	Checkout Card Validation bugfix
- LRA-304	Product Compare regression fix

## 1.1.1  2/26/2019

- LRA-240	Build Tools:  (Webpack Enhancements) ES6 Support
- LRA-220	Enhanced Navigation SFRA
- LRA-84	Wishlist search from login page
- LRA-254	Fixing Global styling of action butttons
- LRA-248	Fixed footer so column headers don't appear clickable
- LRA-231	Account Edit Profile Form Confirm Email Not Required If Email Unchanged
- LRA-203	Open Tracking consent modal on click in edit profile
- LRA-207	CVV validation added/fixed for saved cards
- LRA-241	Build Tools: Ability to clean cached files in build script
- LRA-265	Item numbers now will show in mobile view
- LRA-269	Fixed image issues with Product set variation images
- LRA-256	Safari - Double scroll in the mini cart
- LRA-255	Fixed to show logout link on mobile
- LRA-198	Manual product reccomendations now implemented
- LRA-268	Fix to show social icons on pdp mobile
- LRA-233	Account Registration password error message fix
- LRA-249	Footer blocked on PDP bug fixed
- LRA-263	Product tile swatch - ellipsis click and carry through swatch
- IEI-180	Build Tools: Fixed SARMS reporting
- LRA-238	Link to PDP from cart line items
- LRA-272	Continue shopping link on cart

## 1.1.0  2/04/2019

- LRA-150	Responsive code fixes.
- LRA-158	Build Tools: removed default code value for data bundles so value can be inherited from dw.json
- LRA-119	Content asset in checkout
- LRA-117	Category browse breadcrumb path added
- LRA-168	Update data deploy script to use non-cert host for data import function
- LRA-165	Build Tools: verbose flag
- LRA-154	Styling issues
- LRA-155	Styling issues
- LRA-96	added toggle for product tile promo callout message
- LRA-170	Build Tools: Add default data bundle options for data_test and config_test
- LRA-141	SFRA oneline styleguide v2 update
- LRA-164	Build Tools: json validator
- LRA-178	Build Tools: only runs tests on cartridges with tests
- LRA-144	Feature to swap product images via swatches on cat browse
- LRA-146	SEO attributes on store detail page
- LRA-147	Store details page
- LRA-148	Contact us page with Recaptcha
- LRA-134	My account header
- IEI-211	GTM cartridge conversion
- IEI-253	Cascading PageContext
- IEI-252	Default PageContext config
- LRA-186	Product tile path fix
- LRA-181	Build Tools: option to minimize css
- LRA-192	utils.js updates to enhance build performance
- LRA-187	Moved homepage email signup to content asset
- LRA-145	Implement Zoom for PDP image, quickview, cart edit
- LRA-182	Build Tools: Improvements to CSS compilation time
- LRA-185	Build Tools: Improvements to JS compilation time
- LRA-162	Build Tools: Updating and annotating default site data
- LRA-190	Build Tools: Incorporating Webpack watcher
- LRA-189	Create category Grid template with content slot
- LRA-202	Build Tools: bitbucket pipeline yml added to run eslint
- LRA-193	bugfix for address book error message
- LRA-163	Build Tools: Webpack enhancements / Build script refactoring
- LRA-197	Salesforce 3.3.0 release tag merged in
- LRA-184	Resource message fix
- LRA-177	Build Tools: git pre-commit hooks using husky for linting
- LRA-207	Adding additional form validations to match SG functionality
- LRA-209	Build Tools: Webpack Enhancements with linting
- LRA-215	Manual Recommendations
- LRA ???	Fix Add My Account addressId check fix for adding and editing addresses
- LRA-201	Wishlist and Product compare added into our base offering
- LRA-216	Bonus Product Selection fixes
- LRA-236	Fixed multiple address editing issues in checkout
- LRA-217	Address Book Styling update
- LRA-218	My Account styling issues fixed
- LRA-222	collapsible arrows fixed
- LRA-224	Added missing slotBannerImage for categories
- LRA-227	Test helper for styling order confirmation page
- LRA-229	Better form field validation
- LRA-230	Adjusting maxlength for login fields
- LRA-239	Removed link to fullpage image in Zoom tool
- LRA-234	Phone number validation on address fields
- IEI-180	Build Tools: SARMS data collection

## 1.0.0  9/27/2018

- LRA-109	Build Tools: overhaul to add lots of LyonsCG custom functionality, Webpack 4, new Bootstrap version etc.
- LRA-110	Build Tools: optional verbose build script log via setting in package.json
- LRA-115	Build Tools: New Bootstrap based style guide!
- LRA-123	Fixing SFRA source maps
- LRA-98	Added Mini Cart content slot
- LRA-125	Mobile Category navigation fix
- LRA-127	Fixing login bug from check order status page
- LRA-129	Build Tools: Fixing built in unit test command
- LRA-124	Bring our LyonsCG repo up to date with SFRA 3.2.0
- LRA-17	Updates so the Enhanced Navigation Cartridge is compatible with SFRA
- LRA-103	Support for cart abandonment integrations ( Marketing Cloud )
- LRA-194	Build Tools: New ANT task for automatic installation of npm modules on Jenkins
- LRA-18	Updating/fixing Carousel code to use Slick
- LRA-23	Fixing hard coded en language tag
- LRA-138	Fixing Bootstrap tooltips
- LRA-139	Option to disable commerce functionality sitewide
- LRA-132	Enabled new rule based metadata

