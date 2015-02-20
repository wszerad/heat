/**
 * angular-bootstrap-switch
 * @version v0.4.0-alpha.1 - 2014-11-21
 * @author Francesco Pontillo (francescopontillo@gmail.com)
 * @link https://github.com/frapontillo/angular-bootstrap-switch
 * @license Apache License 2.0(http://www.apache.org/licenses/LICENSE-2.0.html)
 **/

'use strict';
// Source: common/module.js
angular.module('frapontillo.bootstrap-switch', []);
// Source: dist/.temp/directives/bsSwitch.js
angular.module('frapontillo.bootstrap-switch').directive('bsSwitch', [
	'$parse',
	'$timeout',
	function ($parse, $timeout) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function link(scope, element, attrs, controller) {
				var isInit = false;
				/**
				 * Return the true value for this specific checkbox.
				 * @returns {Object} representing the true view value; if undefined, returns true.
				 */
				var getTrueValue = function () {
					var trueValue = $parse(attrs.ngTrueValue)(scope);
					if (!angular.isString(trueValue)) {
						trueValue = true;
					}
					return trueValue;
				};
				/**
				 * Get a boolean value from a boolean-like string.
				 * @param value The input object
				 * @returns {boolean} A boolean value
				 */
				var getBooleanFromString = function (value) {
					return value === true || value === 'true' || !value;
				};
				/**
				 * Returns the value if it is truthy, or undefined.
				 *
				 * @param value The value to check.
				 * @returns the original value if it is truthy, {@link undefined} otherwise.
				 */
				var getValueOrUndefined = function (value) {
					return value ? value : undefined;
				};
				/**
				 * Get the value of the angular-bound attribute, given its name.
				 * The returned value may or may not equal the attribute value, as it may be transformed by a function.
				 *
				 * @param attrName  The angular-bound attribute name to get the value for
				 * @returns {*}     The attribute value
				 */
				var getSwitchAttrValue = function (attrName) {
					var map = {
						'switchRadioOff': function (value) {
							return value === true || value === 'true';
						},
						'switchReadonly': function (value) {
							return (value===undefined)? false : getBooleanFromString(value);
						},
						'switchActive': function (value) {
							return !getBooleanFromString(value);
						},
						'switchAnimate': function (value) {
							return scope.$eval(value || 'true');
						},
						'switchLabel': function (value) {
							return value ? value : '&nbsp;';
						},
						'switchIcon': function (value) {
							if (value) {
								return '<span class=\'' + value + '\'></span>';
							}
						},
						'switchWrapper': function (value) {
							return value || 'wrapper';
						}
					};
					var transFn = map[attrName] || getValueOrUndefined;
					return transFn(attrs[attrName]);
				};
				/**
				 * Set a bootstrapSwitch parameter according to the angular-bound attribute.
				 * The parameter will be changed only if the switch has already been initialized
				 * (to avoid creating it before the model is ready).
				 *
				 * @param element   The switch to apply the parameter modification to
				 * @param attr      The name of the switch parameter
				 * @param modelAttr The name of the angular-bound parameter
				 */
				var setSwitchParamMaybe = function (element, attr, modelAttr) {
					if (!isInit) {
						return;
					}
					var newValue = getSwitchAttrValue(modelAttr);
					element.bootstrapSwitch(attr, newValue);
				};
				var setActive = function () {
					setSwitchParamMaybe(element, 'disabled', 'switchActive');
				};
				/**
				 * If the directive has not been initialized yet, do so.
				 */
				var initMaybe = function () {
					// if it's the first initialization
					if (!isInit) {
						var viewValue = controller.$modelValue === getTrueValue();
						isInit = !isInit;
						// Bootstrap the switch plugin
						element.bootstrapSwitch({
							readonly: getSwitchAttrValue('switchReadonly'),
							radioAllOff: getSwitchAttrValue('switchRadioOff'),
							disabled: getSwitchAttrValue('switchActive'),
							state: viewValue,
							onText: getSwitchAttrValue('switchOnText'),
							offText: getSwitchAttrValue('switchOffText'),
							onColor: getSwitchAttrValue('switchOnColor'),
							offColor: getSwitchAttrValue('switchOffColor'),
							animate: getSwitchAttrValue('switchAnimate'),
							size: getSwitchAttrValue('switchSize'),
							labelText: attrs.switchLabel ? getSwitchAttrValue('switchLabel') : getSwitchAttrValue('switchIcon'),
							wrapperClass: getSwitchAttrValue('switchWrapper'),
							handleWidth: getSwitchAttrValue('switchHandleWidth'),
							labelWidth: getSwitchAttrValue('switchLabelWidth')
						});
						controller.$setViewValue(viewValue);
					}
				};
				/**
				 * Listen to model changes.
				 */
				var listenToModel = function () {
					attrs.$observe('switchActive', function (newValue) {
						var active = getBooleanFromString(newValue);
						// if we are disabling the switch, delay the deactivation so that the toggle can be switched
						if (!active) {
							$timeout(function () {
								setActive(active);
							});
						} else {
							// if we are enabling the switch, set active right away
							setActive(active);
						}
					});
					// When the model changes
					scope.$watch(attrs.ngModel, function (newValue) {
						initMaybe();
						if (newValue !== undefined) {
							if(getSwitchAttrValue('switchReadonly'))
								element.bootstrapSwitch("readonly", false);

							element.bootstrapSwitch('state', newValue === getTrueValue(), true);

							if(getSwitchAttrValue('switchReadonly'))
								element.bootstrapSwitch("readonly", true);
						}
					}, true);
					// angular attribute to switch property bindings
					var bindings = {
						'switchReadonly': 'readonly',
						'switchRadioOff': 'radioAllOff',
						'switchOnText': 'onText',
						'switchOffText': 'offText',
						'switchOnColor': 'onColor',
						'switchOffColor': 'offColor',
						'switchAnimate': 'animate',
						'switchSize': 'size',
						'switchLabel': 'labelText',
						'switchIcon': 'labelText',
						'switchWrapper': 'wrapperClass',
						'switchHandleWidth': 'handleWidth',
						'switchLabelWidth': 'labelWidth'
					};
					var observeProp = function (prop, bindings) {
						return function () {
							attrs.$observe(prop, function () {
								setSwitchParamMaybe(element, bindings[prop], prop);
							});
						};
					};
					// for every angular-bound attribute, observe it and trigger the appropriate switch function
					for (var prop in bindings) {
						attrs.$observe(prop, observeProp(prop, bindings));
					}
				};
				/**
				 * Listen to view changes.
				 */
				var listenToView = function () {
					// When the switch is clicked, set its value into the ngModel
					element.on('switchChange.bootstrapSwitch', function (e, data) {
						// $setViewValue --> $viewValue --> $parsers --> $modelValue
						controller.$setViewValue(data);
					});
				};
				// Listen and respond to view changes
				listenToView();
				// Listen and respond to model changes
				listenToModel();
				// On destroy, collect ya garbage
				scope.$on('$destroy', function () {
					element.bootstrapSwitch('destroy');
				});
			}
		};
	}
]).directive('bsSwitch', function () {
	return {
		restrict: 'E',
		require: 'ngModel',
		template: '<input bs-switch>',
		replace: true
	};
});