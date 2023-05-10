/*! 
 * jQuery Steps v1.1.0 - 09/04/2014
 * Copyright (c) 2014 Rafael Staib (http://www.jquery-steps.com)
 * Licensed under MIT http://www.opensource.org/licenses/MIT
 */
;(function ($, undefined)
{
$.fn.extend({
	_aria: function (name, value)
	{
		return this.attr("aria-" + name, value);
	},

	_removeAria: function (name)
	{
		return this.removeAttr("aria-" + name);
	},

	_enableAria: function (enable)
	{
		return (enable == null || enable) ? 
			this.removeClass("disabled")._aria("disabled", "false") : 
			this.addClass("disabled")._aria("disabled", "true");
	},

	_showAria: function (show)
	{
		return (show == null || show) ? 
			this.show()._aria("hidden", "false") : 
			this.hide()._aria("hidden", "true");
	},

	_selectAria: function (select)
	{
		return (select == null || select) ? 
			this.addClass("current")._aria("selected", "true") : 
			this.removeClass("current")._aria("selected", "false");
	},

	_id: function (id)
	{
		return (id) ? this.attr("id", id) : this.attr("id");
	}
});

if (!String.prototype.format)
{
	String.prototype.format = function()
	{
		var args = (arguments.length === 1 && $.isArray(arguments[0])) ? arguments[0] : arguments;
		var formattedString = this;
		for (var i = 0; i < args.length; i++)
		{
			var pattern = new RegExp("\\{" + i + "\\}", "gm");
			formattedString = formattedString.replace(pattern, args[i]);
		}
		return formattedString;
	};
}

/**
 * A global unique id count.
 *
 * @static
 * @private
 * @property _uniqueId
 * @type Integer
 **/
var _uniqueId = 0;

/**
 * The plugin prefix for cookies.
 *
 * @final
 * @private
 * @property _cookiePrefix
 * @type String
 **/
var _cookiePrefix = "jQu3ry_5teps_St@te_";

/**
 * Suffix for the unique tab id.
 *
 * @final
 * @private
 * @property _tabSuffix
 * @type String
 * @since 0.9.7
 **/
var _tabSuffix = "-t-";

/**
 * Suffix for the unique tabpanel id.
 *
 * @final
 * @private
 * @property _tabpanelSuffix
 * @type String
 * @since 0.9.7
 **/
var _tabpanelSuffix = "-p-";

/**
 * Suffix for the unique title id.
 *
 * @final
 * @private
 * @property _titleSuffix
 * @type String
 * @since 0.9.7
 **/
var _titleSuffix = "-h-";

/**
 * An error message for an "index out of range" error.
 *
 * @final
 * @private
 * @property _indexOutOfRangeErrorMessage
 * @type String
 **/
var _indexOutOfRangeErrorMessage = "Index out of range.";

/**
 * An error message for an "missing corresponding element" error.
 *
 * @final
 * @private
 * @property _missingCorrespondingElementErrorMessage
 * @type String
 **/
var _missingCorrespondingElementErrorMessage = "One or more corresponding step {0} are missing.";

/**
 * Adds a step to the cache.
 *
 * @static
 * @private
 * @method addStepToCache
 * @param wizard {Object} A jQuery wizard object
 * @param step {Object} The step object to add
 **/
function addStepToCache(wizard, step)
{
	getSteps(wizard).push(step);
}

function analyzeData(wizard, options, state)
{
	var stepTitles = wizard.children(options.headerTag),
		stepContents = wizard.children(options.bodyTag);

	// Validate content
	if (stepTitles.length > stepContents.length)
	{
		throwError(_missingCorrespondingElementErrorMessage, "contents");
	}
	else if (stepTitles.length < stepContents.length)
	{
		throwError(_missingCorrespondingElementErrorMessage, "titles");
	}
		
	var startIndex = options.startIndex;

	state.stepCount = stepTitles.length;

	// Tries to load the saved state (step position)
	if (options.saveState && $.cookie)
	{
		var savedState = $.cookie(_cookiePrefix + getUniqueId(wizard));
		// Sets the saved position to the start index if not undefined or out of range 
		var savedIndex = parseInt(savedState, 0);
		if (!isNaN(savedIndex) && savedIndex < state.stepCount)
		{
			startIndex = savedIndex;
		}
	}

	state.currentIndex = startIndex;

	stepTitles.each(function (index)
	{
		var item = $(this), // item == header
			content = stepContents.eq(index),
			modeData = content.data("mode"),
			mode = (modeData == null) ? contentMode.html : getValidEnumValue(contentMode,
				(/^\s*$/.test(modeData) || isNaN(modeData)) ? modeData : parseInt(modeData, 0)),
			contentUrl = (mode === contentMode.html || content.data("url") === undefined) ?
				"" : content.data("url"),
			contentLoaded = (mode !== contentMode.html && content.data("loaded") === "1"),
			step = $.extend({}, stepModel, {
				title: item.html(),
				content: (mode === contentMode.html) ? content.html() : "",
				contentUrl: contentUrl,
				contentMode: mode,
				contentLoaded: contentLoaded
			});

		addStepToCache(wizard, step);
	});
}

/**
 * Triggers the onCanceled event.
 *
 * @static
 * @private
 * @method cancel
 * @param wizard {Object} The jQuery wizard object
 **/
function cancel(wizard)
{
	wizard.triggerHandler("canceled");
}

function decreaseCurrentIndexBy(state, decreaseBy)
{
	return state.currentIndex - decreaseBy;
}

/**
 * Removes the control functionality completely and transforms the current state to the initial HTML structure.
 *
 * @static
 * @private
 * @method destroy
 * @param wizard {Object} A jQuery wizard object
 **/
function destroy(wizard, options)
{
	var eventNamespace = getEventNamespace(wizard);

	// Remove virtual data objects from the wizard
	wizard.unbind(eventNamespace).removeData("uid").removeData("options")
		.removeData("state").removeData("steps").removeData("eventNamespace")
		.find(".actions a").unbind(eventNamespace);

	// Remove attributes and CSS classes from the wizard
	wizard.removeClass(options.clearFixCssClass + " vertical");

	var contents = wizard.find(".content > *");

	// Remove virtual data objects from panels and their titles
	contents.removeData("loaded").removeData("mode").removeData("url");

	// Remove attributes, CSS classes and reset inline styles on all panels and their titles
	contents.removeAttr("id").removeAttr("role").removeAttr("tabindex")
		.removeAttr("class").removeAttr("style")._removeAria("labelledby")
		._removeAria("hidden");

	// Empty panels if the mode is set to 'async' or 'iframe'
	wizard.find(".content > [data-mode='async'],.content > [data-mode='iframe']").empty();

	var wizardSubstitute = $("<{0} class=\"{1}\"></{0}>".format(wizard.get(0).tagName, wizard.attr("class")));

	var wizardId = wizard._id();
	if (wizardId != null && wizardId !== "")
	{
		wizardSubstitute._id(wizardId);
	}

	wizardSubstitute.html(wizard.find(".content").html());
	wizard.after(wizardSubstitute);
	wizard.remove();

	return wizardSubstitute;
}

/**
 * Triggers the onFinishing and onFinished event.
 *
 * @static
 * @private
 * @method finishStep
 * @param wizard {Object} The jQuery wizard object
 * @param state {Object} The state container of the current wizard
 **/
function finishStep(wizard, state)
{
	var currentStep = wizard.find(".steps li").eq(state.currentIndex);

	if (wizard.triggerHandler("finishing", [state.currentIndex]))
	{
		currentStep.addClass("done").removeClass("error");
		wizard.triggerHandler("finished", [state.currentIndex]);
	}
	else
	{
		currentStep.addClass("error");
	}
}

/**
 * Gets or creates if not exist an unique event namespace for the given wizard instance.
 *
 * @static
 * @private
 * @method getEventNamespace
 * @param wizard {Object} A jQuery wizard object
 * @return {String} Returns the unique event namespace for the given wizard
 */
function getEventNamespace(wizard)
{
	var eventNamespace = wizard.data("eventNamespace");

	if (eventNamespace == null)
	{
		eventNamespace = "." + getUniqueId(wizard);
		wizard.data("eventNamespace", eventNamespace);
	}

	return eventNamespace;
}

function getStepAnchor(wizard, index)
{
	var uniqueId = getUniqueId(wizard);

	return wizard.find("#" + uniqueId + _tabSuffix + index);
}

function getStepPanel(wizard, index)
{
	var uniqueId = getUniqueId(wizard);

	return wizard.find("#" + uniqueId + _tabpanelSuffix + index);
}

function getStepTitle(wizard, index)
{
	var uniqueId = getUniqueId(wizard);

	return wizard.find("#" + uniqueId + _titleSuffix + index);
}

function getOptions(wizard)
{
	return wizard.data("options");
}

function getState(wizard)
{
	return wizard.data("state");
}

function getSteps(wizard)
{
	return wizard.data("steps");
}

/**
 * Gets a specific step object by index.
 *
 * @static
 * @private
 * @method getStep
 * @param index {Integer} An integer that belongs to the position of a step
 * @return {Object} A specific step object
 **/
function getStep(wizard, index)
{
	var steps = getSteps(wizard);

	if (index < 0 || index >= steps.length)
	{
		throwError(_indexOutOfRangeErrorMessage);
	}

	return steps[index];
}

/**
 * Gets or creates if not exist an unique id from the given wizard instance.
 *
 * @static
 * @private
 * @method getUniqueId
 * @param wizard {Object} A jQuery wizard object
 * @return {String} Returns the unique id for the given wizard
 */
function getUniqueId(wizard)
{
	var uniqueId = wizard.data("uid");

	if (uniqueId == null)
	{
		uniqueId = wizard._id();
		if (uniqueId == null)
		{
			uniqueId = "steps-uid-".concat(_uniqueId);
			wizard._id(uniqueId);
		}

		_uniqueId++;
		wizard.data("uid", uniqueId);
	}

	return uniqueId;
}

/**
 * Gets a valid enum value by checking a specific enum key or value.
 * 
 * @static
 * @private
 * @method getValidEnumValue
 * @param enumType {Object} Type of enum
 * @param keyOrValue {Object} Key as `String` or value as `Integer` to check for
 */
function getValidEnumValue(enumType, keyOrValue)
{
	validateArgument("enumType", enumType);
	validateArgument("keyOrValue", keyOrValue);

	// Is key
	if (typeof keyOrValue === "string")
	{
		var value = enumType[keyOrValue];
		if (value === undefined)
		{
			throwError("The enum key '{0}' does not exist.", keyOrValue);
		}

		return value;
	}
	// Is value
	else if (typeof keyOrValue === "number")
	{
		for (var key in enumType)
		{
			if (enumType[key] === keyOrValue)
			{
				return keyOrValue;
			}
		}

		throwError("Invalid enum value '{0}'.", keyOrValue);
	}
	// Type is not supported
	else
	{
		throwError("Invalid key or value type.");
	}
}

/**
 * Routes to the next step.
 *
 * @static
 * @private
 * @method goToNextStep
 * @param wizard {Object} The jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 * @return {Boolean} Indicates whether the action executed
 **/
function goToNextStep(wizard, options, state)
{
	return paginationClick(wizard, options, state, increaseCurrentIndexBy(state, 1));
}

/**
 * Routes to the previous step.
 *
 * @static
 * @private
 * @method goToPreviousStep
 * @param wizard {Object} The jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 * @return {Boolean} Indicates whether the action executed
 **/
function goToPreviousStep(wizard, options, state)
{
	return paginationClick(wizard, options, state, decreaseCurrentIndexBy(state, 1));
}

/**
 * Routes to a specific step by a given index.
 *
 * @static
 * @private
 * @method goToStep
 * @param wizard {Object} The jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 * @param index {Integer} The position (zero-based) to route to
 * @return {Boolean} Indicates whether the action succeeded or failed
 **/
function goToStep(wizard, options, state, index)
{
	if (index < 0 || index >= state.stepCount)
	{
		throwError(_indexOutOfRangeErrorMessage);
	}

	if (options.forceMoveForward && index < state.currentIndex)
	{
		return;
	}

	var oldIndex = state.currentIndex;
	if (wizard.triggerHandler("stepChanging", [state.currentIndex, index]))
	{
		// Save new state
		state.currentIndex = index;
		saveCurrentStateToCookie(wizard, options, state);

		// Change visualisation
		refreshStepNavigation(wizard, options, state, oldIndex);
		refreshPagination(wizard, options, state);
		loadAsyncContent(wizard, options, state);
		startTransitionEffect(wizard, options, state, index, oldIndex, function()
		{
			wizard.triggerHandler("stepChanged", [index, oldIndex]);
		});
	}
	else
	{
		wizard.find(".steps li").eq(oldIndex).addClass("error");
	}

	return true;
}

function increaseCurrentIndexBy(state, increaseBy)
{
	return state.currentIndex + increaseBy;
}

/**
 * Initializes the component.
 *
 * @static
 * @private
 * @method initialize
 * @param options {Object} The component settings
 **/
function initialize(options)
{
	/*jshint -W040 */
	var opts = $.extend(true, {}, defaults, options);

	return this.each(function ()
	{
		var wizard = $(this);
		var state = {
			currentIndex: opts.startIndex,
			currentStep: null,
			stepCount: 0,
			transitionElement: null
		};

		// Create data container
		wizard.data("options", opts);
		wizard.data("state", state);
		wizard.data("steps", []);

		analyzeData(wizard, opts, state);
		render(wizard, opts, state);
		registerEvents(wizard, opts);

		// Trigger focus
		if (opts.autoFocus && _uniqueId === 0)
		{
			getStepAnchor(wizard, opts.startIndex).focus();
		}

		wizard.triggerHandler("init", [opts.startIndex]);
	});
}

/**
 * Inserts a new step to a specific position.
 *
 * @static
 * @private
 * @method insertStep
 * @param wizard {Object} The jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 * @param index {Integer} The position (zero-based) to add
 * @param step {Object} The step object to add
 * @example
 *     $("#wizard").steps().insert(0, {
 *         title: "Title",
 *         content: "", // optional
 *         contentMode: "async", // optional
 *         contentUrl: "/Content/Step/1" // optional
 *     });
 * @chainable
 **/
function insertStep(wizard, options, state, index, step)
{
	if (index < 0 || index > state.stepCount)
	{
		throwError(_indexOutOfRangeErrorMessage);
	}

	// TODO: Validate step object

	// Change data
	step = $.extend({}, stepModel, step);
	insertStepToCache(wizard, index, step);
	if (state.currentIndex !== state.stepCount && state.currentIndex >= index)
	{
		state.currentIndex++;
		saveCurrentStateToCookie(wizard, options, state);
	}
	state.stepCount++;

	var contentContainer = wizard.find(".content"),
		header = $("<{0}>{1}</{0}>".format(options.headerTag, step.title)),
		body = $("<{0}></{0}>".format(options.bodyTag));

	if (step.contentMode == null || step.contentMode === contentMode.html)
	{
		body.html(step.content);
	}

	if (index === 0)
	{
		contentContainer.prepend(body).prepend(header);
	}
	else
	{
		getStepPanel(wizard, (index - 1)).after(body).after(header);
	}

	renderBody(wizard, state, body, index);
	renderTitle(wizard, options, state, header, index);
	refreshSteps(wizard, options, state, index);
	if (index === state.currentIndex)
	{
		refreshStepNavigation(wizard, options, state);
	}
	refreshPagination(wizard, options, state);

	return wizard;
}

/**
 * Inserts a step object to the cache at a specific position.
 *
 * @static
 * @private
 * @method insertStepToCache
 * @param wizard {Object} A jQuery wizard object
 * @param index {Integer} The position (zero-based) to add
 * @param step {Object} The step object to add
 **/
function insertStepToCache(wizard, index, step)
{
	getSteps(wizard).splice(index, 0, step);
}

/**
 * Handles the keyup DOM event for pagination.
 *
 * @static
 * @private
 * @event keyup
 * @param event {Object} An event object
 */
function keyUpHandler(event)
{
	var wizard = $(this),
		options = getOptions(wizard),
		state = getState(wizard);

	if (options.suppressPaginationOnFocus && wizard.find(":focus").is(":input"))
	{
		event.preventDefault();
		return false;
	}

	var keyCodes = { left: 37, right: 39 };
	if (event.keyCode === keyCodes.left)
	{
		event.preventDefault();
		goToPreviousStep(wizard, options, state);
	}
	else if (event.keyCode === keyCodes.right)
	{
		event.preventDefault();
		goToNextStep(wizard, options, state);
	}
}

/**
 * Loads and includes async content.
 *
 * @static
 * @private
 * @method loadAsyncContent
 * @param wizard {Object} A jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 */
function loadAsyncContent(wizard, options, state)
{
	if (state.stepCount > 0)
	{
		var currentIndex = state.currentIndex,
			currentStep = getStep(wizard, currentIndex);

		if (!options.enableContentCache || !currentStep.contentLoaded)
		{
			switch (getValidEnumValue(contentMode, currentStep.contentMode))
			{
				case contentMode.iframe:
					wizard.find(".content > .body").eq(state.currentIndex).empty()
						.html("<iframe src=\"" + currentStep.contentUrl + "\" frameborder=\"0\" scrolling=\"no\" />")
						.data("loaded", "1");
					break;

				case contentMode.async:
					var currentStepContent = getStepPanel(wizard, currentIndex)._aria("busy", "true")
						.empty().append(renderTemplate(options.loadingTemplate, { text: options.labels.loading }));

					$.ajax({ url: currentStep.contentUrl, cache: false }).done(function (data)
					{
						currentStepContent.empty().html(data)._aria("busy", "false").data("loaded", "1");
						wizard.triggerHandler("contentLoaded", [currentIndex]);
					});
					break;
			}
		}
	}
}

/**
 * Fires the action next or previous click event.
 *
 * @static
 * @private
 * @method paginationClick
 * @param wizard {Object} The jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 * @param index {Integer} The position (zero-based) to route to
 * @return {Boolean} Indicates whether the event fired successfully or not
 **/
function paginationClick(wizard, options, state, index)
{
	var oldIndex = state.currentIndex;

	if (index >= 0 && index < state.stepCount && !(options.forceMoveForward && index < state.currentIndex))
	{
		var anchor = getStepAnchor(wizard, index),
			parent = anchor.parent(),
			isDisabled = parent.hasClass("disabled");

		// Enable the step to make the anchor clickable!
		parent._enableAria();
		anchor.click();

		// An error occured
		if (oldIndex === state.currentIndex && isDisabled)
		{
			// Disable the step again if current index has not changed; prevents click action.
			parent._enableAria(false);
			return false;
		}

		return true;
	}

	return false;
}

/**
 * Fires when a pagination click happens.
 *
 * @static
 * @private
 * @event click
 * @param event {Object} An event object
 */
function paginationClickHandler(event)
{
	event.preventDefault();

	var anchor = $(this),
		wizard = anchor.parent().parent().parent().parent(),
		options = getOptions(wizard),
		state = getState(wizard),
		href = anchor.attr("href");

	switch (href.substring(href.lastIndexOf("#") + 1))
	{
		case "cancel":
			cancel(wizard);
			break;

		case "finish":
			finishStep(wizard, state);
			break;

		case "next":
			goToNextStep(wizard, options, state);
			break;

		case "previous":
			goToPreviousStep(wizard, options, state);
			break;
	}
}

/**
 * Refreshs the visualization state for the entire pagination.
 *
 * @static
 * @private
 * @method refreshPagination
 * @param wizard {Object} A jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 */
function refreshPagination(wizard, options, state)
{
	if (options.enablePagination)
	{
		var finish = wizard.find(".actions a[href$='#finish']").parent(),
			next = wizard.find(".actions a[href$='#next']").parent();

		if (!options.forceMoveForward)
		{
			var previous = wizard.find(".actions a[href$='#previous']").parent();
			previous._enableAria(state.currentIndex > 0);
		}

		if (options.enableFinishButton && options.showFinishButtonAlways)
		{
			finish._enableAria(state.stepCount > 0);
			next._enableAria(state.stepCount > 1 && state.stepCount > (state.currentIndex + 1));
		}
		else
		{
			finish._showAria(options.enableFinishButton && state.stepCount === (state.currentIndex + 1));
			next._showAria(state.stepCount === 0 || state.stepCount > (state.currentIndex + 1)).
				_enableAria(state.stepCount > (state.currentIndex + 1) || !options.enableFinishButton);
		}
	}
}

/**
 * Refreshs the visualization state for the step navigation (tabs).
 *
 * @static
 * @private
 * @method refreshStepNavigation
 * @param wizard {Object} A jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 * @param [oldIndex] {Integer} The index of the prior step
 */
function refreshStepNavigation(wizard, options, state, oldIndex)
{
	var currentOrNewStepAnchor = getStepAnchor(wizard, state.currentIndex),
		currentInfo = $("<span class=\"current-info audible\">" + options.labels.current + " </span>"),
		stepTitles = wizard.find(".content > .title");

	if (oldIndex != null)
	{
		var oldStepAnchor = getStepAnchor(wizard, oldIndex);
		oldStepAnchor.parent().addClass("done").removeClass("error")._selectAria(false);
		stepTitles.eq(oldIndex).removeClass("current").next(".body").removeClass("current");
		currentInfo = oldStepAnchor.find(".current-info");
		currentOrNewStepAnchor.focus();
	}

	currentOrNewStepAnchor.prepend(currentInfo).parent()._selectAria().removeClass("done")._enableAria();
	stepTitles.eq(state.currentIndex).addClass("current").next(".body").addClass("current");
}

/**
 * Refreshes step buttons and their related titles beyond a certain position.
 *
 * @static
 * @private
 * @method refreshSteps
 * @param wizard {Object} A jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 * @param index {Integer} The start point for refreshing ids
 */
function refreshSteps(wizard, options, state, index)
{
	var uniqueId = getUniqueId(wizard);

	for (var i = index; i < state.stepCount; i++)
	{
		var uniqueStepId = uniqueId + _tabSuffix + i,
			uniqueBodyId = uniqueId + _tabpanelSuffix + i,
			uniqueHeaderId = uniqueId + _titleSuffix + i,
			title = wizard.find(".title").eq(i)._id(uniqueHeaderId);

		wizard.find(".steps a").eq(i)._id(uniqueStepId)
			._aria("controls", uniqueBodyId).attr("href", "#" + uniqueHeaderId)
			.html(renderTemplate(options.titleTemplate, { index: i + 1, title: title.html() }));
		wizard.find(".body").eq(i)._id(uniqueBodyId)
			._aria("labelledby", uniqueHeaderId);
	}
}

function registerEvents(wizard, options)
{
	var eventNamespace = getEventNamespace(wizard);

	wizard.bind("canceled" + eventNamespace, options.onCanceled);
	wizard.bind("contentLoaded" + eventNamespace, options.onContentLoaded);
	wizard.bind("finishing" + eventNamespace, options.onFinishing);
	wizard.bind("finished" + eventNamespace, options.onFinished);
	wizard.bind("init" + eventNamespace, options.onInit);
	wizard.bind("stepChanging" + eventNamespace, options.onStepChanging);
	wizard.bind("stepChanged" + eventNamespace, options.onStepChanged);

	if (options.enableKeyNavigation)
	{
		wizard.bind("keyup" + eventNamespace, keyUpHandler);
	}

	wizard.find(".actions a").bind("click" + eventNamespace, paginationClickHandler);
}

/**
 * Removes a specific step by an given index.
 *
 * @static
 * @private
 * @method removeStep
 * @param wizard {Object} A jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 * @param index {Integer} The position (zero-based) of the step to remove
 * @return Indecates whether the item is removed.
 **/
function removeStep(wizard, options, state, index)
{
	// Index out of range and try deleting current item will return false.
	if (index < 0 || index >= state.stepCount || state.currentIndex === index)
	{
		return false;
	}

	// Change data
	removeStepFromCache(wizard, index);
	if (state.currentIndex > index)
	{
		state.currentIndex--;
		saveCurrentStateToCookie(wizard, options, state);
	}
	state.stepCount--;

	getStepTitle(wizard, index).remove();
	getStepPanel(wizard, index).remove();
	getStepAnchor(wizard, index).parent().remove();

	// Set the "first" class to the new first step button 
	if (index === 0)
	{
		wizard.find(".steps li").first().addClass("first");
	}

	// Set the "last" class to the new last step button 
	if (index === state.stepCount)
	{
		wizard.find(".steps li").eq(index).addClass("last");
	}

	refreshSteps(wizard, options, state, index);
	refreshPagination(wizard, options, state);

	return true;
}

function removeStepFromCache(wizard, index)
{
	getSteps(wizard).splice(index, 1);
}

/**
 * Transforms the base html structure to a more sensible html structure.
 *
 * @static
 * @private
 * @method render
 * @param wizard {Object} A jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 **/
function render(wizard, options, state)
{
	// Create a content wrapper and copy HTML from the intial wizard structure
	var wrapperTemplate = "<{0} class=\"{1}\">{2}</{0}>",
		orientation = getValidEnumValue(stepsOrientation, options.stepsOrientation),
		verticalCssClass = (orientation === stepsOrientation.vertical) ? " vertical" : "",
		contentWrapper = $(wrapperTemplate.format(options.contentContainerTag, "content " + options.clearFixCssClass, wizard.html())),
		stepsWrapper = $(wrapperTemplate.format(options.stepsContainerTag, "steps " + options.clearFixCssClass, "<ul role=\"tablist\"></ul>")),
		stepTitles = contentWrapper.children(options.headerTag),
		stepContents = contentWrapper.children(options.bodyTag);

	// Transform the wizard wrapper and remove the inner HTML
	wizard.attr("role", "application").empty().append(stepsWrapper).append(contentWrapper)
		.addClass(options.cssClass + " " + options.clearFixCssClass + verticalCssClass);

	// Add WIA-ARIA support
	stepContents.each(function (index)
	{
		renderBody(wizard, state, $(this), index);
	});

	stepTitles.each(function (index)
	{
		renderTitle(wizard, options, state, $(this), index);
	});

	refreshStepNavigation(wizard, options, state);
	renderPagination(wizard, options, state);
}

/**
 * Transforms the body to a proper tabpanel.
 *
 * @static
 * @private
 * @method renderBody
 * @param wizard {Object} A jQuery wizard object
 * @param body {Object} A jQuery body object
 * @param index {Integer} The position of the body
 */
function renderBody(wizard, state, body, index)
{
	var uniqueId = getUniqueId(wizard),
		uniqueBodyId = uniqueId + _tabpanelSuffix + index,
		uniqueHeaderId = uniqueId + _titleSuffix + index;

	body._id(uniqueBodyId).attr("role", "tabpanel")._aria("labelledby", uniqueHeaderId)
		.addClass("body")._showAria(state.currentIndex === index);
}

/**
 * Renders a pagination if enabled.
 *
 * @static
 * @private
 * @method renderPagination
 * @param wizard {Object} A jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 */
function renderPagination(wizard, options, state)
{
	if (options.enablePagination)
	{
		var pagination = "<{0} class=\"actions {1}\"><ul role=\"menu\" aria-label=\"{2}\">{3}</ul></{0}>",
			buttonTemplate = "<li><a href=\"#{0}\" role=\"menuitem\">{1}</a></li>",
			buttons = "";

		if (!options.forceMoveForward)
		{
			buttons += buttonTemplate.format("previous", options.labels.previous);
		}

		buttons += buttonTemplate.format("next", options.labels.next);

		if (options.enableFinishButton)
		{
			buttons += buttonTemplate.format("finish", options.labels.finish);
		}

		if (options.enableCancelButton)
		{
			buttons += buttonTemplate.format("cancel", options.labels.cancel);
		}

		wizard.append(pagination.format(options.actionContainerTag, options.clearFixCssClass,
			options.labels.pagination, buttons));

		refreshPagination(wizard, options, state);
		loadAsyncContent(wizard, options, state);
	}
}

/**
 * Renders a template and replaces all placeholder.
 *
 * @static
 * @private
 * @method renderTemplate
 * @param template {String} A template
 * @param substitutes {Object} A list of substitute
 * @return {String} The rendered template
 */
function renderTemplate(template, substitutes)
{
	var matches = template.match(/#([a-z]*)#/gi);

	for (var i = 0; i < matches.length; i++)
	{
		var match = matches[i], 
			key = match.substring(1, match.length - 1);

		if (substitutes[key] === undefined)
		{
			throwError("The key '{0}' does not exist in the substitute collection!", key);
		}

		template = template.replace(match, substitutes[key]);
	}

	return template;
}

/**
 * Transforms the title to a step item button.
 *
 * @static
 * @private
 * @method renderTitle
 * @param wizard {Object} A jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 * @param header {Object} A jQuery header object
 * @param index {Integer} The position of the header
 */
function renderTitle(wizard, options, state, header, index)
{
	var uniqueId = getUniqueId(wizard),
		uniqueStepId = uniqueId + _tabSuffix + index,
		uniqueBodyId = uniqueId + _tabpanelSuffix + index,
		uniqueHeaderId = uniqueId + _titleSuffix + index,
		stepCollection = wizard.find(".steps > ul"),
		title = renderTemplate(options.titleTemplate, {
			index: index + 1,
			title: header.html()
		}),
		stepItem = $("<li role=\"tab\"><a id=\"" + uniqueStepId + "\" href=\"#" + uniqueHeaderId + 
			"\" aria-controls=\"" + uniqueBodyId + "\">" + title + "</a></li>");
		
	stepItem._enableAria(options.enableAllSteps || state.currentIndex > index);

	if (state.currentIndex > index)
	{
		stepItem.addClass("done");
	}

	header._id(uniqueHeaderId).attr("tabindex", "-1").addClass("title");

	if (index === 0)
	{
		stepCollection.prepend(stepItem);
	}
	else
	{
		stepCollection.find("li").eq(index - 1).after(stepItem);
	}

	// Set the "first" class to the new first step button
	if (index === 0)
	{
		stepCollection.find("li").removeClass("first").eq(index).addClass("first");
	}

	// Set the "last" class to the new last step button
	if (index === (state.stepCount - 1))
	{
		stepCollection.find("li").removeClass("last").eq(index).addClass("last");
	}

	// Register click event
	stepItem.children("a").bind("click" + getEventNamespace(wizard), stepClickHandler);
}

/**
 * Saves the current state to a cookie.
 *
 * @static
 * @private
 * @method saveCurrentStateToCookie
 * @param wizard {Object} A jQuery wizard object
 * @param options {Object} Settings of the current wizard
 * @param state {Object} The state container of the current wizard
 */
function saveCurrentStateToCookie(wizard, options, state)
{
	if (options.saveState && $.cookie)
	{
		$.cookie(_cookiePrefix + getUniqueId(wizard), state.currentIndex);
	}
}

function startTransitionEffect(wizard, options, state, index, oldIndex, doneCallback)
{
	var stepContents = wizard.find(".content > .body"),
		effect = getValidEnumValue(transitionEffect, options.transitionEffect),
		effectSpeed = options.transitionEffectSpeed,
		newStep = stepContents.eq(index),
		currentStep = stepContents.eq(oldIndex);

	switch (effect)
	{
		case transitionEffect.fade:
		case transitionEffect.slide:
			var hide = (effect === transitionEffect.fade) ? "fadeOut" : "slideUp",
				show = (effect === transitionEffect.fade) ? "fadeIn" : "slideDown";

			state.transitionElement = newStep;
			currentStep[hide](effectSpeed, function ()
			{
				var wizard = $(this)._showAria(false).parent().parent(),
					state = getState(wizard);

				if (state.transitionElement)
				{
					state.transitionElement[show](effectSpeed, function ()
					{
						$(this)._showAria();
					}).promise().done(doneCallback);
					state.transitionElement = null;
				}
			});
			break;

		case transitionEffect.slideLeft:
			var outerWidth = currentStep.outerWidth(true),
				posFadeOut = (index > oldIndex) ? -(outerWidth) : outerWidth,
				posFadeIn = (index > oldIndex) ? outerWidth : -(outerWidth);

			$.when(currentStep.animate({ left: posFadeOut }, effectSpeed, 
					function () { $(this)._showAria(false); }),
				newStep.css("left", posFadeIn + "px")._showAria()
					.animate({ left: 0 }, effectSpeed)).done(doneCallback);
			break;

		default:
			$.when(currentStep._showAria(false), newStep._showAria())
				.done(doneCallback);
			break;
	}
}

/**
 * Fires when a step click happens.
 *
 * @static
 * @private
 * @event click
 * @param event {Object} An event object
 */
function stepClickHandler(event)
{
	event.preventDefault();

	var anchor = $(this),
		wizard = anchor.parent().parent().parent().parent(),
		options = getOptions(wizard),
		state = getState(wizard),
		oldIndex = state.currentIndex;

	if (anchor.parent().is(":not(.disabled):not(.current)"))
	{
		var href = anchor.attr("href"),
			position = parseInt(href.substring(href.lastIndexOf("-") + 1), 0);

		goToStep(wizard, options, state, position);
	}

	// If nothing has changed
	if (oldIndex === state.currentIndex)
	{
		getStepAnchor(wizard, oldIndex).focus();
		return false;
	}
}

function throwError(message)
{
	if (arguments.length > 1)
	{
		message = message.format(Array.prototype.slice.call(arguments, 1));
	}

	throw new Error(message);
}

/**
 * Checks an argument for null or undefined and throws an error if one check applies.
 *
 * @static
 * @private
 * @method validateArgument
 * @param argumentName {String} The name of the given argument
 * @param argumentValue {Object} The argument itself
 */
function validateArgument(argumentName, argumentValue)
{
	if (argumentValue == null)
	{
		throwError("The argument '{0}' is null or undefined.", argumentName);
	}
}

/**
 * Represents a jQuery wizard plugin.
 *
 * @class steps
 * @constructor
 * @param [method={}] The name of the method as `String` or an JSON object for initialization
 * @param [params=]* {Array} Additional arguments for a method call
 * @chainable
 **/
$.fn.steps = function (method)
{
	if ($.fn.steps[method])
	{
		return $.fn.steps[method].apply(this, Array.prototype.slice.call(arguments, 1));
	}
	else if (typeof method === "object" || !method)
	{
		return initialize.apply(this, arguments);
	}
	else
	{
		$.error("Method " + method + " does not exist on jQuery.steps");
	}
};

/**
 * Adds a new step.
 *
 * @method add
 * @param step {Object} The step object to add
 * @chainable
 **/
$.fn.steps.add = function (step)
{
	var state = getState(this);
	return insertStep(this, getOptions(this), state, state.stepCount, step);
};

/**
 * Removes the control functionality completely and transforms the current state to the initial HTML structure.
 *
 * @method destroy
 * @chainable
 **/
$.fn.steps.destroy = function ()
{
	return destroy(this, getOptions(this));
};

/**
 * Triggers the onFinishing and onFinished event.
 *
 * @method finish
 **/
$.fn.steps.finish = function ()
{
	finishStep(this, getState(this));
};

/**
 * Gets the current step index.
 *
 * @method getCurrentIndex
 * @return {Integer} The actual step index (zero-based)
 * @for steps
 **/
$.fn.steps.getCurrentIndex = function ()
{
	return getState(this).currentIndex;
};

/**
 * Gets the current step object.
 *
 * @method getCurrentStep
 * @return {Object} The actual step object
 **/
$.fn.steps.getCurrentStep = function ()
{
	return getStep(this, getState(this).currentIndex);
};

/**
 * Gets a specific step object by index.
 *
 * @method getStep
 * @param index {Integer} An integer that belongs to the position of a step
 * @return {Object} A specific step object
 **/
$.fn.steps.getStep = function (index)
{
	return getStep(this, index);
};

/**
 * Inserts a new step to a specific position.
 *
 * @method insert
 * @param index {Integer} The position (zero-based) to add
 * @param step {Object} The step object to add
 * @example
 *     $("#wizard").steps().insert(0, {
 *         title: "Title",
 *         content: "", // optional
 *         contentMode: "async", // optional
 *         contentUrl: "/Content/Step/1" // optional
 *     });
 * @chainable
 **/
$.fn.steps.insert = function (index, step)
{
	return insertStep(this, getOptions(this), getState(this), index, step);
};

/**
 * Routes to the next step.
 *
 * @method next
 * @return {Boolean} Indicates whether the action executed
 **/
$.fn.steps.next = function ()
{
	return goToNextStep(this, getOptions(this), getState(this));
};

/**
 * Routes to the previous step.
 *
 * @method previous
 * @return {Boolean} Indicates whether the action executed
 **/
$.fn.steps.previous = function ()
{
	return goToPreviousStep(this, getOptions(this), getState(this));
};

/**
 * Removes a specific step by an given index.
 *
 * @method remove
 * @param index {Integer} The position (zero-based) of the step to remove
 * @return Indecates whether the item is removed.
 **/
$.fn.steps.remove = function (index)
{
	return removeStep(this, getOptions(this), getState(this), index);
};

/**
 * Sets a specific step object by index.
 *
 * @method setStep
 * @param index {Integer} An integer that belongs to the position of a step
 * @param step {Object} The step object to change
 **/
$.fn.steps.setStep = function (index, step)
{
	throw new Error("Not yet implemented!");
};

/**
 * Skips an certain amount of steps.
 *
 * @method skip
 * @param count {Integer} The amount of steps that should be skipped
 * @return {Boolean} Indicates whether the action executed
 **/
$.fn.steps.skip = function (count)
{
	throw new Error("Not yet implemented!");
};

/**
 * An enum represents the different content types of a step and their loading mechanisms.
 *
 * @class contentMode
 * @for steps
 **/
var contentMode = $.fn.steps.contentMode = {
	/**
	 * HTML embedded content
	 *
	 * @readOnly
	 * @property html
	 * @type Integer
	 * @for contentMode
	 **/
	html: 0,

	/**
	 * IFrame embedded content
	 *
	 * @readOnly
	 * @property iframe
	 * @type Integer
	 * @for contentMode
	 **/
	iframe: 1,

	/**
	 * Async embedded content
	 *
	 * @readOnly
	 * @property async
	 * @type Integer
	 * @for contentMode
	 **/
	async: 2
};

/**
 * An enum represents the orientation of the steps navigation.
 *
 * @class stepsOrientation
 * @for steps
 **/
var stepsOrientation = $.fn.steps.stepsOrientation = {
	/**
	 * Horizontal orientation
	 *
	 * @readOnly
	 * @property horizontal
	 * @type Integer
	 * @for stepsOrientation
	 **/
	horizontal: 0,

	/**
	 * Vertical orientation
	 *
	 * @readOnly
	 * @property vertical
	 * @type Integer
	 * @for stepsOrientation
	 **/
	vertical: 1
};

/**
 * An enum that represents the various transition animations.
 *
 * @class transitionEffect
 * @for steps
 **/
var transitionEffect = $.fn.steps.transitionEffect = {
	/**
	 * No transition animation
	 *
	 * @readOnly
	 * @property none
	 * @type Integer
	 * @for transitionEffect
	 **/
	none: 0,

	/**
	 * Fade in transition
	 *
	 * @readOnly
	 * @property fade
	 * @type Integer
	 * @for transitionEffect
	 **/
	fade: 1,

	/**
	 * Slide up transition
	 *
	 * @readOnly
	 * @property slide
	 * @type Integer
	 * @for transitionEffect
	 **/
	slide: 2,

	/**
	 * Slide left transition
	 *
	 * @readOnly
	 * @property slideLeft
	 * @type Integer
	 * @for transitionEffect
	 **/
	slideLeft: 3
};

var stepModel = $.fn.steps.stepModel = {
	title: "",
	content: "",
	contentUrl: "",
	contentMode: contentMode.html,
	contentLoaded: false
};

/**
 * An object that represents the default settings.
 * There are two possibities to override the sub-properties.
 * Either by doing it generally (global) or on initialization.
 *
 * @static
 * @class defaults
 * @for steps
 * @example
 *   // Global approach
 *   $.steps.defaults.headerTag = "h3";
 * @example
 *   // Initialization approach
 *   $("#wizard").steps({ headerTag: "h3" });
 **/
var defaults = $.fn.steps.defaults = {
	/**
	 * The header tag is used to find the step button text within the declared wizard area.
	 *
	 * @property headerTag
	 * @type String
	 * @default "h1"
	 * @for defaults
	 **/
	headerTag: "h1",

	/**
	 * The body tag is used to find the step content within the declared wizard area.
	 *
	 * @property bodyTag
	 * @type String
	 * @default "div"
	 * @for defaults
	 **/
	bodyTag: "div",

	/**
	 * The content container tag which will be used to wrap all step contents.
	 *
	 * @property contentContainerTag
	 * @type String
	 * @default "div"
	 * @for defaults
	 **/
	contentContainerTag: "div",

	/**
	 * The action container tag which will be used to wrap the pagination navigation.
	 *
	 * @property actionContainerTag
	 * @type String
	 * @default "div"
	 * @for defaults
	 **/
	actionContainerTag: "div",

	/**
	 * The steps container tag which will be used to wrap the steps navigation.
	 *
	 * @property stepsContainerTag
	 * @type String
	 * @default "div"
	 * @for defaults
	 **/
	stepsContainerTag: "div",

	/**
	 * The css class which will be added to the outer component wrapper.
	 *
	 * @property cssClass
	 * @type String
	 * @default "wizard"
	 * @for defaults
	 * @example
	 *     <div class="wizard">
	 *         ...
	 *     </div>
	 **/
	cssClass: "wizard",

	/**
	 * The css class which will be used for floating scenarios.
	 *
	 * @property clearFixCssClass
	 * @type String
	 * @default "clearfix"
	 * @for defaults
	 **/
	clearFixCssClass: "clearfix",

	/**
	 * Determines whether the steps are vertically or horizontally oriented.
	 *
	 * @property stepsOrientation
	 * @type stepsOrientation
	 * @default horizontal
	 * @for defaults
	 * @since 1.0.0
	 **/
	stepsOrientation: stepsOrientation.horizontal,

	/*
	 * Tempplates
	 */

	/**
	 * The title template which will be used to create a step button.
	 *
	 * @property titleTemplate
	 * @type String
	 * @default "<span class=\"number\">#index#.</span> #title#"
	 * @for defaults
	 **/
	titleTemplate: "<span class=\"number\">#index#</span><span class=\"titxt\">. #title#</span>",

	/**
	 * The loading template which will be used to create the loading animation.
	 *
	 * @property loadingTemplate
	 * @type String
	 * @default "<span class=\"spinner\"></span> #text#"
	 * @for defaults
	 **/
	loadingTemplate: "<span class=\"spinner\"></span> #text#",

	/*
	 * Behaviour
	 */

	/**
	 * Sets the focus to the first wizard instance in order to enable the key navigation from the begining if `true`. 
	 *
	 * @property autoFocus
	 * @type Boolean
	 * @default false
	 * @for defaults
	 * @since 0.9.4
	 **/
	autoFocus: false,

	/**
	 * Enables all steps from the begining if `true` (all steps are clickable).
	 *
	 * @property enableAllSteps
	 * @type Boolean
	 * @default false
	 * @for defaults
	 **/
	enableAllSteps: false,

	/**
	 * Enables keyboard navigation if `true` (arrow left and arrow right).
	 *
	 * @property enableKeyNavigation
	 * @type Boolean
	 * @default true
	 * @for defaults
	 **/
	enableKeyNavigation: true,

	/**
	 * Enables pagination if `true`.
	 *
	 * @property enablePagination
	 * @type Boolean
	 * @default true
	 * @for defaults
	 **/
	enablePagination: true,

	/**
	 * Suppresses pagination if a form field is focused.
	 *
	 * @property suppressPaginationOnFocus
	 * @type Boolean
	 * @default true
	 * @for defaults
	 **/
	suppressPaginationOnFocus: true,

	/**
	 * Enables cache for async loaded or iframe embedded content.
	 *
	 * @property enableContentCache
	 * @type Boolean
	 * @default true
	 * @for defaults
	 **/
	enableContentCache: true,

	/**
	 * Shows the cancel button if enabled.
	 *
	 * @property enableCancelButton
	 * @type Boolean
	 * @default false
	 * @for defaults
	 **/
	enableCancelButton: false,

	/**
	 * Shows the finish button if enabled.
	 *
	 * @property enableFinishButton
	 * @type Boolean
	 * @default true
	 * @for defaults
	 **/
	enableFinishButton: true,

	/**
	 * Not yet implemented.
	 *
	 * @property preloadContent
	 * @type Boolean
	 * @default false
	 * @for defaults
	 **/
	preloadContent: false,

	/**
	 * Shows the finish button always (on each step; right beside the next button) if `true`. 
	 * Otherwise the next button will be replaced by the finish button if the last step becomes active.
	 *
	 * @property showFinishButtonAlways
	 * @type Boolean
	 * @default false
	 * @for defaults
	 **/
	showFinishButtonAlways: false,

	/**
	 * Prevents jumping to a previous step.
	 *
	 * @property forceMoveForward
	 * @type Boolean
	 * @default false
	 * @for defaults
	 **/
	forceMoveForward: false,

	/**
	 * Saves the current state (step position) to a cookie.
	 * By coming next time the last active step becomes activated.
	 *
	 * @property saveState
	 * @type Boolean
	 * @default false
	 * @for defaults
	 **/
	saveState: false,

	/**
	 * The position to start on (zero-based).
	 *
	 * @property startIndex
	 * @type Integer
	 * @default 0
	 * @for defaults
	 **/
	startIndex: 0,

	/*
	 * Animation Effect Configuration
	 */

	/**
	 * The animation effect which will be used for step transitions.
	 *
	 * @property transitionEffect
	 * @type transitionEffect
	 * @default none
	 * @for defaults
	 **/
	transitionEffect: transitionEffect.none,

	/**
	 * Animation speed for step transitions (in milliseconds).
	 *
	 * @property transitionEffectSpeed
	 * @type Integer
	 * @default 200
	 * @for defaults
	 **/
	transitionEffectSpeed: 200,

	/*
	 * Events
	 */

	/**
	 * Fires before the step changes and can be used to prevent step changing by returning `false`. 
	 * Very useful for form validation. 
	 *
	 * @property onStepChanging
	 * @type Event
	 * @default function (event, currentIndex, newIndex) { return true; }
	 * @for defaults
	 **/
	onStepChanging: function (event, currentIndex, newIndex) { return true; },

	/**
	 * Fires after the step has change. 
	 *
	 * @property onStepChanged
	 * @type Event
	 * @default function (event, currentIndex, priorIndex) { }
	 * @for defaults
	 **/
	onStepChanged: function (event, currentIndex, priorIndex) { },

	/**
	 * Fires after cancelation. 
	 *
	 * @property onCanceled
	 * @type Event
	 * @default function (event) { }
	 * @for defaults
	 **/
	onCanceled: function (event) { },

	/**
	 * Fires before finishing and can be used to prevent completion by returning `false`. 
	 * Very useful for form validation. 
	 *
	 * @property onFinishing
	 * @type Event
	 * @default function (event, currentIndex) { return true; }
	 * @for defaults
	 **/
	onFinishing: function (event, currentIndex) { return true; },

	/**
	 * Fires after completion. 
	 *
	 * @property onFinished
	 * @type Event
	 * @default function (event, currentIndex) { }
	 * @for defaults
	 **/
	onFinished: function (event, currentIndex) { },

	/**
	 * Fires after async content is loaded. 
	 *
	 * @property onContentLoaded
	 * @type Event
	 * @default function (event, index) { }
	 * @for defaults
	 **/
	onContentLoaded: function (event, currentIndex) { },

	/**
	 * Fires when the wizard is initialized. 
	 *
	 * @property onInit
	 * @type Event
	 * @default function (event) { }
	 * @for defaults
	 **/
	onInit: function (event, currentIndex) { },

	/**
	 * Contains all labels. 
	 *
	 * @property labels
	 * @type Object
	 * @for defaults
	 **/
	labels: {
		/**
		 * Label for the cancel button.
		 *
		 * @property cancel
		 * @type String
		 * @default "Cancel"
		 * @for defaults
		 **/
		cancel: "لغو",

		/**
		 * This label is important for accessability reasons.
		 * Indicates which step is activated.
		 *
		 * @property current
		 * @type String
		 * @default "current step:"
		 * @for defaults
		 **/
		current: "مرحله فعلی:",

		/**
		 * This label is important for accessability reasons and describes the kind of navigation.
		 *
		 * @property pagination
		 * @type String
		 * @default "Pagination"
		 * @for defaults
		 * @since 0.9.7
		 **/
		pagination: "صفحه بندی",

		/**
		 * Label for the finish button.
		 *
		 * @property finish
		 * @type String
		 * @default "Finish"
		 * @for defaults
		 **/
		finish: "پایان",

		/**
		 * Label for the next button.
		 *
		 * @property next
		 * @type String
		 * @default "Next"
		 * @for defaults
		 **/
		next: "بعدی",

		/**
		 * Label for the previous button.
		 *
		 * @property previous
		 * @type String
		 * @default "Previous"
		 * @for defaults
		 **/
		previous: "قبلی",

		/**
		 * Label for the loading animation.
		 *
		 * @property loading
		 * @type String
		 * @default "Loading ..."
		 * @for defaults
		 **/
		loading: "در حال بارگذاری ..."
	}
};
})(jQuery);




/*!
 * jQuery Validation Plugin v1.15.0
 *
 * http://jqueryvalidation.org/
 *
 * Copyright (c) 2016 Jörn Zaefferer
 * Released under the MIT license
 */
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( ["jquery"], factory );
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory( require( "jquery" ) );
	} else {
		factory( jQuery );
	}
}(function( $ ) {

$.extend( $.fn, {

	// http://jqueryvalidation.org/validate/
	validate: function( options ) {

		// If nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			if ( options && options.debug && window.console ) {
				console.warn( "Nothing selected, can't validate, returning nothing." );
			}
			return;
		}

		// Check if a validator for this form was already created
		var validator = $.data( this[ 0 ], "validator" );
		if ( validator ) {
			return validator;
		}

		// Add novalidate tag if HTML5.
		this.attr( "novalidate", "novalidate" );

		validator = new $.validator( options, this[ 0 ] );
		$.data( this[ 0 ], "validator", validator );

		if ( validator.settings.onsubmit ) {

			this.on( "click.validate", ":submit", function( event ) {
				if ( validator.settings.submitHandler ) {
					validator.submitButton = event.target;
				}

				// Allow suppressing validation by adding a cancel class to the submit button
				if ( $( this ).hasClass( "cancel" ) ) {
					validator.cancelSubmit = true;
				}

				// Allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
				if ( $( this ).attr( "formnovalidate" ) !== undefined ) {
					validator.cancelSubmit = true;
				}
			} );

			// Validate the form on submit
			this.on( "submit.validate", function( event ) {
				if ( validator.settings.debug ) {

					// Prevent form submit to be able to see console output
					event.preventDefault();
				}
				function handle() {
					var hidden, result;
					if ( validator.settings.submitHandler ) {
						if ( validator.submitButton ) {

							// Insert a hidden input as a replacement for the missing submit button
							hidden = $( "<input type='hidden'/>" )
								.attr( "name", validator.submitButton.name )
								.val( $( validator.submitButton ).val() )
								.appendTo( validator.currentForm );
						}
						result = validator.settings.submitHandler.call( validator, validator.currentForm, event );
						if ( validator.submitButton ) {

							// And clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						if ( result !== undefined ) {
							return result;
						}
						return false;
					}
					return true;
				}

				// Prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			} );
		}

		return validator;
	},

	// http://jqueryvalidation.org/valid/
	valid: function() {
		var valid, validator, errorList;

		if ( $( this[ 0 ] ).is( "form" ) ) {
			valid = this.validate().form();
		} else {
			errorList = [];
			valid = true;
			validator = $( this[ 0 ].form ).validate();
			this.each( function() {
				valid = validator.element( this ) && valid;
				if ( !valid ) {
					errorList = errorList.concat( validator.errorList );
				}
			} );
			validator.errorList = errorList;
		}
		return valid;
	},

	// http://jqueryvalidation.org/rules/
	rules: function( command, argument ) {

		// If nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			return;
		}

		var element = this[ 0 ],
			settings, staticRules, existingRules, data, param, filtered;

		if ( command ) {
			settings = $.data( element.form, "validator" ).settings;
			staticRules = settings.rules;
			existingRules = $.validator.staticRules( element );
			switch ( command ) {
			case "add":
				$.extend( existingRules, $.validator.normalizeRule( argument ) );

				// Remove messages from rules, but allow them to be set separately
				delete existingRules.messages;
				staticRules[ element.name ] = existingRules;
				if ( argument.messages ) {
					settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );
				}
				break;
			case "remove":
				if ( !argument ) {
					delete staticRules[ element.name ];
					return existingRules;
				}
				filtered = {};
				$.each( argument.split( /\s/ ), function( index, method ) {
					filtered[ method ] = existingRules[ method ];
					delete existingRules[ method ];
					if ( method === "required" ) {
						$( element ).removeAttr( "aria-required" );
					}
				} );
				return filtered;
			}
		}

		data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.classRules( element ),
			$.validator.attributeRules( element ),
			$.validator.dataRules( element ),
			$.validator.staticRules( element )
		), element );

		// Make sure required is at front
		if ( data.required ) {
			param = data.required;
			delete data.required;
			data = $.extend( { required: param }, data );
			$( element ).attr( "aria-required", "true" );
		}

		// Make sure remote is at back
		if ( data.remote ) {
			param = data.remote;
			delete data.remote;
			data = $.extend( data, { remote: param } );
		}

		return data;
	}
} );

// Custom selectors
$.extend( $.expr[ ":" ], {

	// http://jqueryvalidation.org/blank-selector/
	blank: function( a ) {
		return !$.trim( "" + $( a ).val() );
	},

	// http://jqueryvalidation.org/filled-selector/
	filled: function( a ) {
		var val = $( a ).val();
		return val !== null && !!$.trim( "" + val );
	},

	// http://jqueryvalidation.org/unchecked-selector/
	unchecked: function( a ) {
		return !$( a ).prop( "checked" );
	}
} );

// Constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

// http://jqueryvalidation.org/jQuery.validator.format/
$.validator.format = function( source, params ) {
	if ( arguments.length === 1 ) {
		return function() {
			var args = $.makeArray( arguments );
			args.unshift( source );
			return $.validator.format.apply( this, args );
		};
	}
	if ( params === undefined ) {
		return source;
	}
	if ( arguments.length > 2 && params.constructor !== Array  ) {
		params = $.makeArray( arguments ).slice( 1 );
	}
	if ( params.constructor !== Array ) {
		params = [ params ];
	}
	$.each( params, function( i, n ) {
		source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
			return n;
		} );
	} );
	return source;
};

$.extend( $.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		pendingClass: "pending",
		validClass: "valid",
		errorElement: "label",
		focusCleanup: false,
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: ":hidden",
		ignoreTitle: false,
		onfocusin: function( element ) {
			this.lastActive = element;

			// Hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup ) {
				if ( this.settings.unhighlight ) {
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				}
				this.hideThese( this.errorsFor( element ) );
			}
		},
		onfocusout: function( element ) {
			if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {
				this.element( element );
			}
		},
		onkeyup: function( element, event ) {

			// Avoid revalidate the field when pressing one of the following keys
			// Shift       => 16
			// Ctrl        => 17
			// Alt         => 18
			// Caps lock   => 20
			// End         => 35
			// Home        => 36
			// Left arrow  => 37
			// Up arrow    => 38
			// Right arrow => 39
			// Down arrow  => 40
			// Insert      => 45
			// Num lock    => 144
			// AltGr key   => 225
			var excludedKeys = [
				16, 17, 18, 20, 35, 36, 37,
				38, 39, 40, 45, 144, 225
			];

			if ( event.which === 9 && this.elementValue( element ) === "" || $.inArray( event.keyCode, excludedKeys ) !== -1 ) {
				return;
			} else if ( element.name in this.submitted || element.name in this.invalid ) {
				this.element( element );
			}
		},
		onclick: function( element ) {

			// Click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted ) {
				this.element( element );

			// Or option elements, check parent select in that case
			} else if ( element.parentNode.name in this.submitted ) {
				this.element( element.parentNode );
			}
		},
		highlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
			} else {
				$( element ).addClass( errorClass ).removeClass( validClass );
			}
		},
		unhighlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
			} else {
				$( element ).removeClass( errorClass ).addClass( validClass );
			}
		}
	},

	// http://jqueryvalidation.org/jQuery.validator.setDefaults/
	setDefaults: function( settings ) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "الزامی",
		remote: "لطفا این ورودی را اصلاح کنید.",
		email: "لطفا یک آدرس ایمیل معتبر وارد کنید.",
		url: "لطفا یک آدرس سایت معتبر وارد کنید.",
		date: "لطفا یک تاریخ معتبر وارد کنید.",
		dateISO: "لطفا یک تاریخ معتبر وارد کنید ( ISO ).",
		number: "لطفا یک عدد وارد کنید.",
		digits: "لطفا فقط حروف وارد کنید.",
		equalTo: "لطفا مقدار یکسان وارد کنید.",
		maxlength: $.validator.format( "لطفا کمتر از {0} کاراکتر وارد کنید." ),
		minlength: $.validator.format( "لطفا بیشتر از {0} کاراکتر وارد کنید." ),
		rangelength: $.validator.format( "تقاضا می شود طول متن بین {0} تا {1} کاراکتر باشد." ),
		range: $.validator.format( "لطفا مقداری بین {0} و {1} وارد کنید." ),
		max: $.validator.format( "لطفا مقداری کمتر یا برابر با {0} وارد کنید." ),
		min: $.validator.format( "لطفا مقداری بیشتر یا برابر با {0} وارد کنید." ),
		step: $.validator.format( "لطفا مضارب {0} را وارد کنید." )
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $( this.settings.errorLabelContainer );
			this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );
			this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = ( this.groups = {} ),
				rules;
			$.each( this.settings.groups, function( key, value ) {
				if ( typeof value === "string" ) {
					value = value.split( /\s/ );
				}
				$.each( value, function( index, name ) {
					groups[ name ] = key;
				} );
			} );
			rules = this.settings.rules;
			$.each( rules, function( key, value ) {
				rules[ key ] = $.validator.normalizeRule( value );
			} );

			function delegate( event ) {
				var validator = $.data( this.form, "validator" ),
					eventType = "on" + event.type.replace( /^validate/, "" ),
					settings = validator.settings;
				if ( settings[ eventType ] && !$( this ).is( settings.ignore ) ) {
					settings[ eventType ].call( validator, this, event );
				}
			}

			$( this.currentForm )
				.on( "focusin.validate focusout.validate keyup.validate",
					":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
					"[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
					"[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
					"[type='radio'], [type='checkbox'], [contenteditable]", delegate )

				// Support: Chrome, oldIE
				// "select" is provided as event.target when clicking a option
				.on( "click.validate", "select, option, [type='radio'], [type='checkbox']", delegate );

			if ( this.settings.invalidHandler ) {
				$( this.currentForm ).on( "invalid-form.validate", this.settings.invalidHandler );
			}

			// Add aria-required to any Static/Data/Class required fields before first validation
			// Screen readers require this attribute to be present before the initial submission http://www.w3.org/TR/WCAG-TECHS/ARIA2.html
			$( this.currentForm ).find( "[required], [data-rule-required], .required" ).attr( "aria-required", "true" );
		},

		// http://jqueryvalidation.org/Validator.form/
		form: function() {
			this.checkForm();
			$.extend( this.submitted, this.errorMap );
			this.invalid = $.extend( {}, this.errorMap );
			if ( !this.valid() ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
			}
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {
				this.check( elements[ i ] );
			}
			return this.valid();
		},

		// http://jqueryvalidation.org/Validator.element/
		element: function( element ) {
			var cleanElement = this.clean( element ),
				checkElement = this.validationTargetFor( cleanElement ),
				v = this,
				result = true,
				rs, group;

			if ( checkElement === undefined ) {
				delete this.invalid[ cleanElement.name ];
			} else {
				this.prepareElement( checkElement );
				this.currentElements = $( checkElement );

				// If this element is grouped, then validate all group elements already
				// containing a value
				group = this.groups[ checkElement.name ];
				if ( group ) {
					$.each( this.groups, function( name, testgroup ) {
						if ( testgroup === group && name !== checkElement.name ) {
							cleanElement = v.validationTargetFor( v.clean( v.findByName( name ) ) );
							if ( cleanElement && cleanElement.name in v.invalid ) {
								v.currentElements.push( cleanElement );
								result = result && v.check( cleanElement );
							}
						}
					} );
				}

				rs = this.check( checkElement ) !== false;
				result = result && rs;
				if ( rs ) {
					this.invalid[ checkElement.name ] = false;
				} else {
					this.invalid[ checkElement.name ] = true;
				}

				if ( !this.numberOfInvalids() ) {

					// Hide error containers on last error
					this.toHide = this.toHide.add( this.containers );
				}
				this.showErrors();

				// Add aria-invalid status for screen readers
				$( element ).attr( "aria-invalid", !rs );
			}

			return result;
		},

		// http://jqueryvalidation.org/Validator.showErrors/
		showErrors: function( errors ) {
			if ( errors ) {
				var validator = this;

				// Add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = $.map( this.errorMap, function( message, name ) {
					return {
						message: message,
						element: validator.findByName( name )[ 0 ]
					};
				} );

				// Remove items from success list
				this.successList = $.grep( this.successList, function( element ) {
					return !( element.name in errors );
				} );
			}
			if ( this.settings.showErrors ) {
				this.settings.showErrors.call( this, this.errorMap, this.errorList );
			} else {
				this.defaultShowErrors();
			}
		},

		// http://jqueryvalidation.org/Validator.resetForm/
		resetForm: function() {
			if ( $.fn.resetForm ) {
				$( this.currentForm ).resetForm();
			}
			this.invalid = {};
			this.submitted = {};
			this.prepareForm();
			this.hideErrors();
			var elements = this.elements()
				.removeData( "previousValue" )
				.removeAttr( "aria-invalid" );

			this.resetElements( elements );
		},

		resetElements: function( elements ) {
			var i;

			if ( this.settings.unhighlight ) {
				for ( i = 0; elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ],
						this.settings.errorClass, "" );
					this.findByName( elements[ i ].name ).removeClass( this.settings.validClass );
				}
			} else {
				elements
					.removeClass( this.settings.errorClass )
					.removeClass( this.settings.validClass );
			}
		},

		numberOfInvalids: function() {
			return this.objectLength( this.invalid );
		},

		objectLength: function( obj ) {
			/* jshint unused: false */
			var count = 0,
				i;
			for ( i in obj ) {
				if ( obj[ i ] ) {
					count++;
				}
			}
			return count;
		},

		hideErrors: function() {
			this.hideThese( this.toHide );
		},

		hideThese: function( errors ) {
			errors.not( this.containers ).text( "" );
			this.addWrapper( errors ).hide();
		},

		valid: function() {
			return this.size() === 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if ( this.settings.focusInvalid ) {
				try {
					$( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [] )
					.filter( ":visible" )
					.focus()

					// Manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger( "focusin" );
				} catch ( e ) {

					// Ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep( this.errorList, function( n ) {
				return n.element.name === lastActive.name;
			} ).length === 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// Select all valid inputs inside the form (no submit or reset buttons)
			return $( this.currentForm )
			.find( "input, select, textarea, [contenteditable]" )
			.not( ":submit, :reset, :image, :disabled" )
			.not( this.settings.ignore )
			.filter( function() {
				var name = this.name || $( this ).attr( "name" ); // For contenteditable
				if ( !name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this );
				}

				// Set form expando on contenteditable
				if ( this.hasAttribute( "contenteditable" ) ) {
					this.form = $( this ).closest( "form" )[ 0 ];
				}

				// Select only the first element for each name, and only those with rules specified
				if ( name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
					return false;
				}

				rulesCache[ name ] = true;
				return true;
			} );
		},

		clean: function( selector ) {
			return $( selector )[ 0 ];
		},

		errors: function() {
			var errorClass = this.settings.errorClass.split( " " ).join( "." );
			return $( this.settings.errorElement + "." + errorClass, this.errorContext );
		},

		resetInternals: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $( [] );
			this.toHide = $( [] );
		},

		reset: function() {
			this.resetInternals();
			this.currentElements = $( [] );
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor( element );
		},

		elementValue: function( element ) {
			var $element = $( element ),
				type = element.type,
				val, idx;

			if ( type === "radio" || type === "checkbox" ) {
				return this.findByName( element.name ).filter( ":checked" ).val();
			} else if ( type === "number" && typeof element.validity !== "undefined" ) {
				return element.validity.badInput ? "NaN" : $element.val();
			}

			if ( element.hasAttribute( "contenteditable" ) ) {
				val = $element.text();
			} else {
				val = $element.val();
			}

			if ( type === "file" ) {

				// Modern browser (chrome & safari)
				if ( val.substr( 0, 12 ) === "C:\\fakepath\\" ) {
					return val.substr( 12 );
				}

				// Legacy browsers
				// Unix-based path
				idx = val.lastIndexOf( "/" );
				if ( idx >= 0 ) {
					return val.substr( idx + 1 );
				}

				// Windows-based path
				idx = val.lastIndexOf( "\\" );
				if ( idx >= 0 ) {
					return val.substr( idx + 1 );
				}

				// Just the file name
				return val;
			}

			if ( typeof val === "string" ) {
				return val.replace( /\r/g, "" );
			}
			return val;
		},

		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $( element ).rules(),
				rulesCount = $.map( rules, function( n, i ) {
					return i;
				} ).length,
				dependencyMismatch = false,
				val = this.elementValue( element ),
				result, method, rule;

			// If a normalizer is defined for this element, then
			// call it to retreive the changed value instead
			// of using the real one.
			// Note that `this` in the normalizer is `element`.
			if ( typeof rules.normalizer === "function" ) {
				val = rules.normalizer.call( element, val );

				if ( typeof val !== "string" ) {
					throw new TypeError( "The normalizer should return a string value." );
				}

				// Delete the normalizer from rules to avoid treating
				// it as a pre-defined method.
				delete rules.normalizer;
			}

			for ( method in rules ) {
				rule = { method: method, parameters: rules[ method ] };
				try {
					result = $.validator.methods[ method ].call( this, val, element, rule.parameters );

					// If a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result === "dependency-mismatch" && rulesCount === 1 ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result === "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor( element ) );
						return;
					}

					if ( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch ( e ) {
					if ( this.settings.debug && window.console ) {
						console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
					}
					if ( e instanceof TypeError ) {
						e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
					}

					throw e;
				}
			}
			if ( dependencyMismatch ) {
				return;
			}
			if ( this.objectLength( rules ) ) {
				this.successList.push( element );
			}
			return true;
		},

		// Return the custom message for the given element and validation method
		// specified in the element's HTML5 data attribute
		// return the generic message if present and no method specific message is present
		customDataMessage: function( element, method ) {
			return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +
				method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );
		},

		// Return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[ name ];
			return m && ( m.constructor === String ? m : m[ method ] );
		},

		// Return the first defined argument, allowing empty strings
		findDefined: function() {
			for ( var i = 0; i < arguments.length; i++ ) {
				if ( arguments[ i ] !== undefined ) {
					return arguments[ i ];
				}
			}
			return undefined;
		},

		defaultMessage: function( element, rule ) {
			var message = this.findDefined(
					this.customMessage( element.name, rule.method ),
					this.customDataMessage( element, rule.method ),

					// 'title' is never undefined, so handle empty string as undefined
					!this.settings.ignoreTitle && element.title || undefined,
					$.validator.messages[ rule.method ],
					"<strong>Warning: No message defined for " + element.name + "</strong>"
				),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message === "function" ) {
				message = message.call( this, rule.parameters, element );
			} else if ( theregex.test( message ) ) {
				message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );
			}

			return message;
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule );

			this.errorList.push( {
				message: message,
				element: element,
				method: rule.method
			} );

			this.errorMap[ element.name ] = message;
			this.submitted[ element.name ] = message;
		},

		addWrapper: function( toToggle ) {
			if ( this.settings.wrapper ) {
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			}
			return toToggle;
		},

		defaultShowErrors: function() {
			var i, elements, error;
			for ( i = 0; this.errorList[ i ]; i++ ) {
				error = this.errorList[ i ];
				if ( this.settings.highlight ) {
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				}
				this.showLabel( error.element, error.message );
			}
			if ( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if ( this.settings.success ) {
				for ( i = 0; this.successList[ i ]; i++ ) {
					this.showLabel( this.successList[ i ] );
				}
			}
			if ( this.settings.unhighlight ) {
				for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not( this.invalidElements() );
		},

		invalidElements: function() {
			return $( this.errorList ).map( function() {
				return this.element;
			} );
		},

		showLabel: function( element, message ) {
			var place, group, errorID, v,
				error = this.errorsFor( element ),
				elementID = this.idOrName( element ),
				describedBy = $( element ).attr( "aria-describedby" );

			if ( error.length ) {

				// Refresh error/success class
				error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );

				// Replace message on existing label
				error.html( message );
			} else {

				// Create error element
				error = $( "<" + this.settings.errorElement + ">" )
					.attr( "id", elementID + "-error" )
					.addClass( this.settings.errorClass )
					.html( message || "" );

				// Maintain reference to the element to be placed into the DOM
				place = error;
				if ( this.settings.wrapper ) {

					// Make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();
				}
				if ( this.labelContainer.length ) {
					this.labelContainer.append( place );
				} else if ( this.settings.errorPlacement ) {
					this.settings.errorPlacement( place, $( element ) );
				} else {
					place.insertAfter( element );
				}

				// Link error back to the element
				if ( error.is( "label" ) ) {

					// If the error is a label, then associate using 'for'
					error.attr( "for", elementID );

					// If the element is not a child of an associated label, then it's necessary
					// to explicitly apply aria-describedby
				} else if ( error.parents( "label[for='" + this.escapeCssMeta( elementID ) + "']" ).length === 0 ) {
					errorID = error.attr( "id" );

					// Respect existing non-error aria-describedby
					if ( !describedBy ) {
						describedBy = errorID;
					} else if ( !describedBy.match( new RegExp( "\\b" + this.escapeCssMeta( errorID ) + "\\b" ) ) ) {

						// Add to end of list if not already present
						describedBy += " " + errorID;
					}
					$( element ).attr( "aria-describedby", describedBy );

					// If this element is grouped, then assign to all elements in the same group
					group = this.groups[ element.name ];
					if ( group ) {
						v = this;
						$.each( v.groups, function( name, testgroup ) {
							if ( testgroup === group ) {
								$( "[name='" + v.escapeCssMeta( name ) + "']", v.currentForm )
									.attr( "aria-describedby", error.attr( "id" ) );
							}
						} );
					}
				}
			}
			if ( !message && this.settings.success ) {
				error.text( "" );
				if ( typeof this.settings.success === "string" ) {
					error.addClass( this.settings.success );
				} else {
					this.settings.success( error, element );
				}
			}
			this.toShow = this.toShow.add( error );
		},

		errorsFor: function( element ) {
			var name = this.escapeCssMeta( this.idOrName( element ) ),
				describer = $( element ).attr( "aria-describedby" ),
				selector = "label[for='" + name + "'], label[for='" + name + "'] *";

			// 'aria-describedby' should directly reference the error element
			if ( describer ) {
				selector = selector + ", #" + this.escapeCssMeta( describer )
					.replace( /\s+/g, ", #" );
			}

			return this
				.errors()
				.filter( selector );
		},

		// See https://api.jquery.com/category/selectors/, for CSS
		// meta-characters that should be escaped in order to be used with JQuery
		// as a literal part of a name/id or any selector.
		escapeCssMeta: function( string ) {
			return string.replace( /([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1" );
		},

		idOrName: function( element ) {
			return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name );
		},

		validationTargetFor: function( element ) {

			// If radio/checkbox, validate first element in group instead
			if ( this.checkable( element ) ) {
				element = this.findByName( element.name );
			}

			// Always apply ignore filter
			return $( element ).not( this.settings.ignore )[ 0 ];
		},

		checkable: function( element ) {
			return ( /radio|checkbox/i ).test( element.type );
		},

		findByName: function( name ) {
			return $( this.currentForm ).find( "[name='" + this.escapeCssMeta( name ) + "']" );
		},

		getLength: function( value, element ) {
			switch ( element.nodeName.toLowerCase() ) {
			case "select":
				return $( "option:selected", element ).length;
			case "input":
				if ( this.checkable( element ) ) {
					return this.findByName( element.name ).filter( ":checked" ).length;
				}
			}
			return value.length;
		},

		depend: function( param, element ) {
			return this.dependTypes[ typeof param ] ? this.dependTypes[ typeof param ]( param, element ) : true;
		},

		dependTypes: {
			"boolean": function( param ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$( param, element.form ).length;
			},
			"function": function( param, element ) {
				return param( element );
			}
		},

		optional: function( element ) {
			var val = this.elementValue( element );
			return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";
		},

		startRequest: function( element ) {
			if ( !this.pending[ element.name ] ) {
				this.pendingRequest++;
				$( element ).addClass( this.settings.pendingClass );
				this.pending[ element.name ] = true;
			}
		},

		stopRequest: function( element, valid ) {
			this.pendingRequest--;

			// Sometimes synchronization fails, make sure pendingRequest is never < 0
			if ( this.pendingRequest < 0 ) {
				this.pendingRequest = 0;
			}
			delete this.pending[ element.name ];
			$( element ).removeClass( this.settings.pendingClass );
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
				$( this.currentForm ).submit();
				this.formSubmitted = false;
			} else if ( !valid && this.pendingRequest === 0 && this.formSubmitted ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
				this.formSubmitted = false;
			}
		},

		previousValue: function( element, method ) {
			return $.data( element, "previousValue" ) || $.data( element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, { method: method } )
			} );
		},

		// Cleans up all forms and elements, removes validator-specific events
		destroy: function() {
			this.resetForm();

			$( this.currentForm )
				.off( ".validate" )
				.removeData( "validator" )
				.find( ".validate-equalTo-blur" )
					.off( ".validate-equalTo" )
					.removeClass( "validate-equalTo-blur" );
		}

	},

	classRuleSettings: {
		required: { required: true },
		email: { email: true },
		url: { url: true },
		date: { date: true },
		dateISO: { dateISO: true },
		number: { number: true },
		digits: { digits: true },
		creditcard: { creditcard: true }
	},

	addClassRules: function( className, rules ) {
		if ( className.constructor === String ) {
			this.classRuleSettings[ className ] = rules;
		} else {
			$.extend( this.classRuleSettings, className );
		}
	},

	classRules: function( element ) {
		var rules = {},
			classes = $( element ).attr( "class" );

		if ( classes ) {
			$.each( classes.split( " " ), function() {
				if ( this in $.validator.classRuleSettings ) {
					$.extend( rules, $.validator.classRuleSettings[ this ] );
				}
			} );
		}
		return rules;
	},

	normalizeAttributeRule: function( rules, type, method, value ) {

		// Convert the value to a number for number inputs, and for text for backwards compability
		// allows type="date" and others to be compared as strings
		if ( /min|max|step/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
			value = Number( value );

			// Support Opera Mini, which returns NaN for undefined minlength
			if ( isNaN( value ) ) {
				value = undefined;
			}
		}

		if ( value || value === 0 ) {
			rules[ method ] = value;
		} else if ( type === method && type !== "range" ) {

			// Exception: the jquery validate 'range' method
			// does not test for the html5 'range' type
			rules[ method ] = true;
		}
	},

	attributeRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {

			// Support for <input required> in both html5 and older browsers
			if ( method === "required" ) {
				value = element.getAttribute( method );

				// Some browsers return an empty string for the required attribute
				// and non-HTML5 browsers might have required="" markup
				if ( value === "" ) {
					value = true;
				}

				// Force non-HTML5 browsers to return bool
				value = !!value;
			} else {
				value = $element.attr( method );
			}

			this.normalizeAttributeRule( rules, type, method, value );
		}

		// 'maxlength' may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
		if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {
			delete rules.maxlength;
		}

		return rules;
	},

	dataRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {
			value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );
			this.normalizeAttributeRule( rules, type, method, value );
		}
		return rules;
	},

	staticRules: function( element ) {
		var rules = {},
			validator = $.data( element.form, "validator" );

		if ( validator.settings.rules ) {
			rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};
		}
		return rules;
	},

	normalizeRules: function( rules, element ) {

		// Handle dependency check
		$.each( rules, function( prop, val ) {

			// Ignore rule when param is explicitly false, eg. required:false
			if ( val === false ) {
				delete rules[ prop ];
				return;
			}
			if ( val.param || val.depends ) {
				var keepRule = true;
				switch ( typeof val.depends ) {
				case "string":
					keepRule = !!$( val.depends, element.form ).length;
					break;
				case "function":
					keepRule = val.depends.call( element, element );
					break;
				}
				if ( keepRule ) {
					rules[ prop ] = val.param !== undefined ? val.param : true;
				} else {
					$.data( element.form, "validator" ).resetElements( $( element ) );
					delete rules[ prop ];
				}
			}
		} );

		// Evaluate parameters
		$.each( rules, function( rule, parameter ) {
			rules[ rule ] = $.isFunction( parameter ) && rule !== "normalizer" ? parameter( element ) : parameter;
		} );

		// Clean number parameters
		$.each( [ "minlength", "maxlength" ], function() {
			if ( rules[ this ] ) {
				rules[ this ] = Number( rules[ this ] );
			}
		} );
		$.each( [ "rangelength", "range" ], function() {
			var parts;
			if ( rules[ this ] ) {
				if ( $.isArray( rules[ this ] ) ) {
					rules[ this ] = [ Number( rules[ this ][ 0 ] ), Number( rules[ this ][ 1 ] ) ];
				} else if ( typeof rules[ this ] === "string" ) {
					parts = rules[ this ].replace( /[\[\]]/g, "" ).split( /[\s,]+/ );
					rules[ this ] = [ Number( parts[ 0 ] ), Number( parts[ 1 ] ) ];
				}
			}
		} );

		if ( $.validator.autoCreateRanges ) {

			// Auto-create ranges
			if ( rules.min != null && rules.max != null ) {
				rules.range = [ rules.min, rules.max ];
				delete rules.min;
				delete rules.max;
			}
			if ( rules.minlength != null && rules.maxlength != null ) {
				rules.rangelength = [ rules.minlength, rules.maxlength ];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function( data ) {
		if ( typeof data === "string" ) {
			var transformed = {};
			$.each( data.split( /\s/ ), function() {
				transformed[ this ] = true;
			} );
			data = transformed;
		}
		return data;
	},

	// http://jqueryvalidation.org/jQuery.validator.addMethod/
	addMethod: function( name, method, message ) {
		$.validator.methods[ name ] = method;
		$.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];
		if ( method.length < 3 ) {
			$.validator.addClassRules( name, $.validator.normalizeRule( name ) );
		}
	},

	// http://jqueryvalidation.org/jQuery.validator.methods/
	methods: {

		// http://jqueryvalidation.org/required-method/
		required: function( value, element, param ) {

			// Check if dependency is met
			if ( !this.depend( param, element ) ) {
				return "dependency-mismatch";
			}
			if ( element.nodeName.toLowerCase() === "select" ) {

				// Could be an array for select-multiple or a string, both are fine this way
				var val = $( element ).val();
				return val && val.length > 0;
			}
			if ( this.checkable( element ) ) {
				return this.getLength( value, element ) > 0;
			}
			return value.length > 0;
		},

		// http://jqueryvalidation.org/email-method/
		email: function( value, element ) {

			// From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
			// Retrieved 2014-01-14
			// If you have a problem with this implementation, report a bug against the above spec
			// Or use custom methods to implement your own email validation
			return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
		},

		// http://jqueryvalidation.org/url-method/
		url: function( value, element ) {

			// Copyright (c) 2010-2013 Diego Perini, MIT licensed
			// https://gist.github.com/dperini/729294
			// see also https://mathiasbynens.be/demo/url-regex
			// modified to allow protocol-relative URLs
			return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
		},

		// http://jqueryvalidation.org/date-method/
		date: function( value, element ) {
			return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
		},

		// http://jqueryvalidation.org/dateISO-method/
		dateISO: function( value, element ) {
			return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
		},

		// http://jqueryvalidation.org/number-method/
		number: function( value, element ) {
			return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
		},

		// http://jqueryvalidation.org/digits-method/
		digits: function( value, element ) {
			return this.optional( element ) || /^\d+$/.test( value );
		},

		// http://jqueryvalidation.org/minlength-method/
		minlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length >= param;
		},

		// http://jqueryvalidation.org/maxlength-method/
		maxlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length <= param;
		},

		// http://jqueryvalidation.org/rangelength-method/
		rangelength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
		},

		// http://jqueryvalidation.org/min-method/
		min: function( value, element, param ) {
			return this.optional( element ) || value >= param;
		},

		// http://jqueryvalidation.org/max-method/
		max: function( value, element, param ) {
			return this.optional( element ) || value <= param;
		},

		// http://jqueryvalidation.org/range-method/
		range: function( value, element, param ) {
			return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
		},

		// http://jqueryvalidation.org/step-method/
		step: function( value, element, param ) {
			var type = $( element ).attr( "type" ),
				errorMessage = "Step attribute on input type " + type + " is not supported.",
				supportedTypes = [ "text", "number", "range" ],
				re = new RegExp( "\\b" + type + "\\b" ),
				notSupported = type && !re.test( supportedTypes.join() );

			// Works only for text, number and range input types
			// TODO find a way to support input types date, datetime, datetime-local, month, time and week
			if ( notSupported ) {
				throw new Error( errorMessage );
			}
			return this.optional( element ) || ( value % param === 0 );
		},

		// http://jqueryvalidation.org/equalTo-method/
		equalTo: function( value, element, param ) {

			// Bind to the blur event of the target in order to revalidate whenever the target field is updated
			var target = $( param );
			if ( this.settings.onfocusout && target.not( ".validate-equalTo-blur" ).length ) {
				target.addClass( "validate-equalTo-blur" ).on( "blur.validate-equalTo", function() {
					$( element ).valid();
				} );
			}
			return value === target.val();
		},

		// http://jqueryvalidation.org/remote-method/
		remote: function( value, element, param, method ) {
			if ( this.optional( element ) ) {
				return "dependency-mismatch";
			}

			method = typeof method === "string" && method || "remote";

			var previous = this.previousValue( element, method ),
				validator, data, optionDataString;

			if ( !this.settings.messages[ element.name ] ) {
				this.settings.messages[ element.name ] = {};
			}
			previous.originalMessage = previous.originalMessage || this.settings.messages[ element.name ][ method ];
			this.settings.messages[ element.name ][ method ] = previous.message;

			param = typeof param === "string" && { url: param } || param;
			optionDataString = $.param( $.extend( { data: value }, param.data ) );
			if ( previous.old === optionDataString ) {
				return previous.valid;
			}

			previous.old = optionDataString;
			validator = this;
			this.startRequest( element );
			data = {};
			data[ element.name ] = value;
			$.ajax( $.extend( true, {
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				context: validator.currentForm,
				success: function( response ) {
					var valid = response === true || response === "true",
						errors, message, submitted;

					validator.settings.messages[ element.name ][ method ] = previous.originalMessage;
					if ( valid ) {
						submitted = validator.formSubmitted;
						validator.resetInternals();
						validator.toHide = validator.errorsFor( element );
						validator.formSubmitted = submitted;
						validator.successList.push( element );
						validator.invalid[ element.name ] = false;
						validator.showErrors();
					} else {
						errors = {};
						message = response || validator.defaultMessage( element, { method: method, parameters: value } );
						errors[ element.name ] = previous.message = message;
						validator.invalid[ element.name ] = true;
						validator.showErrors( errors );
					}
					previous.valid = valid;
					validator.stopRequest( element, valid );
				}
			}, param ) );
			return "pending";
		}
	}

} );

// Ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

var pendingRequests = {},
	ajax;

// Use a prefilter if available (1.5+)
if ( $.ajaxPrefilter ) {
	$.ajaxPrefilter( function( settings, _, xhr ) {
		var port = settings.port;
		if ( settings.mode === "abort" ) {
			if ( pendingRequests[ port ] ) {
				pendingRequests[ port ].abort();
			}
			pendingRequests[ port ] = xhr;
		}
	} );
} else {

	// Proxy ajax
	ajax = $.ajax;
	$.ajax = function( settings ) {
		var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
			port = ( "port" in settings ? settings : $.ajaxSettings ).port;
		if ( mode === "abort" ) {
			if ( pendingRequests[ port ] ) {
				pendingRequests[ port ].abort();
			}
			pendingRequests[ port ] = ajax.apply( this, arguments );
			return pendingRequests[ port ];
		}
		return ajax.apply( this, arguments );
	};
}

}));


