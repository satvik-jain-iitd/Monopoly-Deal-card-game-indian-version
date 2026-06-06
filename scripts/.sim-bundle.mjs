//#region \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
//#endregion
//#region node_modules/react/cjs/react.production.js
/**
* @license React
* react.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var ReactNoopUpdateQueue = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, assign = Object.assign, emptyObject = {};
	function Component(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	Component.prototype.isReactComponent = {};
	Component.prototype.setState = function(partialState, callback) {
		if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, partialState, callback, "setState");
	};
	Component.prototype.forceUpdate = function(callback) {
		this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
	};
	function ComponentDummy() {}
	ComponentDummy.prototype = Component.prototype;
	function PureComponent(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
	pureComponentPrototype.constructor = PureComponent;
	assign(pureComponentPrototype, Component.prototype);
	pureComponentPrototype.isPureReactComponent = !0;
	var isArrayImpl = Array.isArray;
	function noop() {}
	var ReactSharedInternals = {
		H: null,
		A: null,
		T: null,
		S: null
	}, hasOwnProperty = Object.prototype.hasOwnProperty;
	function ReactElement(type, key, props) {
		var refProp = props.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== refProp ? refProp : null,
			props
		};
	}
	function cloneAndReplaceKey(oldElement, newKey) {
		return ReactElement(oldElement.type, newKey, oldElement.props);
	}
	function isValidElement(object) {
		return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function escape(key) {
		var escaperLookup = {
			"=": "=0",
			":": "=2"
		};
		return "$" + key.replace(/[=:]/g, function(match) {
			return escaperLookup[match];
		});
	}
	var userProvidedKeyEscapeRegex = /\/+/g;
	function getElementKey(element, index) {
		return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
	}
	function resolveThenable(thenable) {
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
				"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
			}, function(error) {
				"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			})), thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
			}
		}
		throw thenable;
	}
	function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		var type = typeof children;
		if ("undefined" === type || "boolean" === type) children = null;
		var invokeCallback = !1;
		if (null === children) invokeCallback = !0;
		else switch (type) {
			case "bigint":
			case "string":
			case "number":
				invokeCallback = !0;
				break;
			case "object": switch (children.$$typeof) {
				case REACT_ELEMENT_TYPE:
				case REACT_PORTAL_TYPE:
					invokeCallback = !0;
					break;
				case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
			}
		}
		if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
			return c;
		})) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
		invokeCallback = 0;
		var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
		if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if (i = getIteratorFn(children), "function" === typeof i) for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if ("object" === type) {
			if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
			array = String(children);
			throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
		}
		return invokeCallback;
	}
	function mapChildren(children, func, context) {
		if (null == children) return children;
		var result = [], count = 0;
		mapIntoArray(children, result, "", "", function(child) {
			return func.call(context, child, count++);
		});
		return result;
	}
	function lazyInitializer(payload) {
		if (-1 === payload._status) {
			var ctor = payload._result;
			ctor = ctor();
			ctor.then(function(moduleObject) {
				if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject;
			}, function(error) {
				if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error;
			});
			-1 === payload._status && (payload._status = 0, payload._result = ctor);
		}
		if (1 === payload._status) return payload._result.default;
		throw payload._result;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	}, Children = {
		map: mapChildren,
		forEach: function(children, forEachFunc, forEachContext) {
			mapChildren(children, function() {
				forEachFunc.apply(this, arguments);
			}, forEachContext);
		},
		count: function(children) {
			var n = 0;
			mapChildren(children, function() {
				n++;
			});
			return n;
		},
		toArray: function(children) {
			return mapChildren(children, function(child) {
				return child;
			}) || [];
		},
		only: function(children) {
			if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
			return children;
		}
	};
	exports.Activity = REACT_ACTIVITY_TYPE;
	exports.Children = Children;
	exports.Component = Component;
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.Profiler = REACT_PROFILER_TYPE;
	exports.PureComponent = PureComponent;
	exports.StrictMode = REACT_STRICT_MODE_TYPE;
	exports.Suspense = REACT_SUSPENSE_TYPE;
	exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
	exports.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(size) {
			return ReactSharedInternals.H.useMemoCache(size);
		}
	};
	exports.cache = function(fn) {
		return function() {
			return fn.apply(null, arguments);
		};
	};
	exports.cacheSignal = function() {
		return null;
	};
	exports.cloneElement = function(element, config, children) {
		if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
		var props = assign({}, element.props), key = element.key;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
		var propName = arguments.length - 2;
		if (1 === propName) props.children = children;
		else if (1 < propName) {
			for (var childArray = Array(propName), i = 0; i < propName; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		return ReactElement(element.type, key, props);
	};
	exports.createContext = function(defaultValue) {
		defaultValue = {
			$$typeof: REACT_CONTEXT_TYPE,
			_currentValue: defaultValue,
			_currentValue2: defaultValue,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		};
		defaultValue.Provider = defaultValue;
		defaultValue.Consumer = {
			$$typeof: REACT_CONSUMER_TYPE,
			_context: defaultValue
		};
		return defaultValue;
	};
	exports.createElement = function(type, config, children) {
		var propName, props = {}, key = null;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
		var childrenLength = arguments.length - 2;
		if (1 === childrenLength) props.children = children;
		else if (1 < childrenLength) {
			for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === props[propName] && (props[propName] = childrenLength[propName]);
		return ReactElement(type, key, props);
	};
	exports.createRef = function() {
		return { current: null };
	};
	exports.forwardRef = function(render) {
		return {
			$$typeof: REACT_FORWARD_REF_TYPE,
			render
		};
	};
	exports.isValidElement = isValidElement;
	exports.lazy = function(ctor) {
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: {
				_status: -1,
				_result: ctor
			},
			_init: lazyInitializer
		};
	};
	exports.memo = function(type, compare) {
		return {
			$$typeof: REACT_MEMO_TYPE,
			type,
			compare: void 0 === compare ? null : compare
		};
	};
	exports.startTransition = function(scope) {
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		ReactSharedInternals.T = currentTransition;
		try {
			var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
		} catch (error) {
			reportGlobalError(error);
		} finally {
			null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	};
	exports.unstable_useCacheRefresh = function() {
		return ReactSharedInternals.H.useCacheRefresh();
	};
	exports.use = function(usable) {
		return ReactSharedInternals.H.use(usable);
	};
	exports.useActionState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useActionState(action, initialState, permalink);
	};
	exports.useCallback = function(callback, deps) {
		return ReactSharedInternals.H.useCallback(callback, deps);
	};
	exports.useContext = function(Context) {
		return ReactSharedInternals.H.useContext(Context);
	};
	exports.useDebugValue = function() {};
	exports.useDeferredValue = function(value, initialValue) {
		return ReactSharedInternals.H.useDeferredValue(value, initialValue);
	};
	exports.useEffect = function(create, deps) {
		return ReactSharedInternals.H.useEffect(create, deps);
	};
	exports.useEffectEvent = function(callback) {
		return ReactSharedInternals.H.useEffectEvent(callback);
	};
	exports.useId = function() {
		return ReactSharedInternals.H.useId();
	};
	exports.useImperativeHandle = function(ref, create, deps) {
		return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
	};
	exports.useInsertionEffect = function(create, deps) {
		return ReactSharedInternals.H.useInsertionEffect(create, deps);
	};
	exports.useLayoutEffect = function(create, deps) {
		return ReactSharedInternals.H.useLayoutEffect(create, deps);
	};
	exports.useMemo = function(create, deps) {
		return ReactSharedInternals.H.useMemo(create, deps);
	};
	exports.useOptimistic = function(passthrough, reducer) {
		return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
	};
	exports.useReducer = function(reducer, initialArg, init) {
		return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
	};
	exports.useRef = function(initialValue) {
		return ReactSharedInternals.H.useRef(initialValue);
	};
	exports.useState = function(initialState) {
		return ReactSharedInternals.H.useState(initialState);
	};
	exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
		return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	};
	exports.useTransition = function() {
		return ReactSharedInternals.H.useTransition();
	};
	exports.version = "19.2.7";
}));
//#endregion
//#region node_modules/react/cjs/react.development.js
/**
* @license React
* react.development.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_development = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	"production" !== process.env.NODE_ENV && (function() {
		function defineDeprecationWarning(methodName, info) {
			Object.defineProperty(Component.prototype, methodName, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]);
			} });
		}
		function getIteratorFn(maybeIterable) {
			if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
			maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
			return "function" === typeof maybeIterable ? maybeIterable : null;
		}
		function warnNoop(publicInstance, callerName) {
			publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
			var warningKey = publicInstance + "." + callerName;
			didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", callerName, publicInstance), didWarnStateUpdateForUnmountedComponent[warningKey] = !0);
		}
		function Component(props, context, updater) {
			this.props = props;
			this.context = context;
			this.refs = emptyObject;
			this.updater = updater || ReactNoopUpdateQueue;
		}
		function ComponentDummy() {}
		function PureComponent(props, context, updater) {
			this.props = props;
			this.context = context;
			this.refs = emptyObject;
			this.updater = updater || ReactNoopUpdateQueue;
		}
		function noop() {}
		function testStringCoercion(value) {
			return "" + value;
		}
		function checkKeyStringCoercion(value) {
			try {
				testStringCoercion(value);
				var JSCompiler_inline_result = !1;
			} catch (e) {
				JSCompiler_inline_result = !0;
			}
			if (JSCompiler_inline_result) {
				JSCompiler_inline_result = console;
				var JSCompiler_temp_const = JSCompiler_inline_result.error;
				var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
				JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
				return testStringCoercion(value);
			}
		}
		function getComponentNameFromType(type) {
			if (null == type) return null;
			if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
			if ("string" === typeof type) return type;
			switch (type) {
				case REACT_FRAGMENT_TYPE: return "Fragment";
				case REACT_PROFILER_TYPE: return "Profiler";
				case REACT_STRICT_MODE_TYPE: return "StrictMode";
				case REACT_SUSPENSE_TYPE: return "Suspense";
				case REACT_SUSPENSE_LIST_TYPE: return "SuspenseList";
				case REACT_ACTIVITY_TYPE: return "Activity";
			}
			if ("object" === typeof type) switch ("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof) {
				case REACT_PORTAL_TYPE: return "Portal";
				case REACT_CONTEXT_TYPE: return type.displayName || "Context";
				case REACT_CONSUMER_TYPE: return (type._context.displayName || "Context") + ".Consumer";
				case REACT_FORWARD_REF_TYPE:
					var innerType = type.render;
					type = type.displayName;
					type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
					return type;
				case REACT_MEMO_TYPE: return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
				case REACT_LAZY_TYPE:
					innerType = type._payload;
					type = type._init;
					try {
						return getComponentNameFromType(type(innerType));
					} catch (x) {}
			}
			return null;
		}
		function getTaskName(type) {
			if (type === REACT_FRAGMENT_TYPE) return "<>";
			if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
			try {
				var name = getComponentNameFromType(type);
				return name ? "<" + name + ">" : "<...>";
			} catch (x) {
				return "<...>";
			}
		}
		function getOwner() {
			var dispatcher = ReactSharedInternals.A;
			return null === dispatcher ? null : dispatcher.getOwner();
		}
		function UnknownOwner() {
			return Error("react-stack-top-frame");
		}
		function hasValidKey(config) {
			if (hasOwnProperty.call(config, "key")) {
				var getter = Object.getOwnPropertyDescriptor(config, "key").get;
				if (getter && getter.isReactWarning) return !1;
			}
			return void 0 !== config.key;
		}
		function defineKeyPropWarningGetter(props, displayName) {
			function warnAboutAccessingKey() {
				specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
			}
			warnAboutAccessingKey.isReactWarning = !0;
			Object.defineProperty(props, "key", {
				get: warnAboutAccessingKey,
				configurable: !0
			});
		}
		function elementRefGetterWithDeprecationWarning() {
			var componentName = getComponentNameFromType(this.type);
			didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
			componentName = this.props.ref;
			return void 0 !== componentName ? componentName : null;
		}
		function ReactElement(type, key, props, owner, debugStack, debugTask) {
			var refProp = props.ref;
			type = {
				$$typeof: REACT_ELEMENT_TYPE,
				type,
				key,
				props,
				_owner: owner
			};
			null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
				enumerable: !1,
				get: elementRefGetterWithDeprecationWarning
			}) : Object.defineProperty(type, "ref", {
				enumerable: !1,
				value: null
			});
			type._store = {};
			Object.defineProperty(type._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			});
			Object.defineProperty(type, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			});
			Object.defineProperty(type, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: debugStack
			});
			Object.defineProperty(type, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: debugTask
			});
			Object.freeze && (Object.freeze(type.props), Object.freeze(type));
			return type;
		}
		function cloneAndReplaceKey(oldElement, newKey) {
			newKey = ReactElement(oldElement.type, newKey, oldElement.props, oldElement._owner, oldElement._debugStack, oldElement._debugTask);
			oldElement._store && (newKey._store.validated = oldElement._store.validated);
			return newKey;
		}
		function validateChildKeys(node) {
			isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
		}
		function isValidElement(object) {
			return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
		}
		function escape(key) {
			var escaperLookup = {
				"=": "=0",
				":": "=2"
			};
			return "$" + key.replace(/[=:]/g, function(match) {
				return escaperLookup[match];
			});
		}
		function getElementKey(element, index) {
			return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
		}
		function resolveThenable(thenable) {
			switch (thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
				default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
					"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
				}, function(error) {
					"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
				})), thenable.status) {
					case "fulfilled": return thenable.value;
					case "rejected": throw thenable.reason;
				}
			}
			throw thenable;
		}
		function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
			var type = typeof children;
			if ("undefined" === type || "boolean" === type) children = null;
			var invokeCallback = !1;
			if (null === children) invokeCallback = !0;
			else switch (type) {
				case "bigint":
				case "string":
				case "number":
					invokeCallback = !0;
					break;
				case "object": switch (children.$$typeof) {
					case REACT_ELEMENT_TYPE:
					case REACT_PORTAL_TYPE:
						invokeCallback = !0;
						break;
					case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
				}
			}
			if (invokeCallback) {
				invokeCallback = children;
				callback = callback(invokeCallback);
				var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
				isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
					return c;
				})) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + childKey), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
				return 1;
			}
			invokeCallback = 0;
			childKey = "" === nameSoFar ? "." : nameSoFar + ":";
			if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
			else if (i = getIteratorFn(children), "function" === typeof i) for (i === children.entries && (didWarnAboutMaps || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), didWarnAboutMaps = !0), children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
			else if ("object" === type) {
				if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
				array = String(children);
				throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
			}
			return invokeCallback;
		}
		function mapChildren(children, func, context) {
			if (null == children) return children;
			var result = [], count = 0;
			mapIntoArray(children, result, "", "", function(child) {
				return func.call(context, child, count++);
			});
			return result;
		}
		function lazyInitializer(payload) {
			if (-1 === payload._status) {
				var ioInfo = payload._ioInfo;
				null != ioInfo && (ioInfo.start = ioInfo.end = performance.now());
				ioInfo = payload._result;
				var thenable = ioInfo();
				thenable.then(function(moduleObject) {
					if (0 === payload._status || -1 === payload._status) {
						payload._status = 1;
						payload._result = moduleObject;
						var _ioInfo = payload._ioInfo;
						null != _ioInfo && (_ioInfo.end = performance.now());
						void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
					}
				}, function(error) {
					if (0 === payload._status || -1 === payload._status) {
						payload._status = 2;
						payload._result = error;
						var _ioInfo2 = payload._ioInfo;
						null != _ioInfo2 && (_ioInfo2.end = performance.now());
						void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
					}
				});
				ioInfo = payload._ioInfo;
				if (null != ioInfo) {
					ioInfo.value = thenable;
					var displayName = thenable.displayName;
					"string" === typeof displayName && (ioInfo.name = displayName);
				}
				-1 === payload._status && (payload._status = 0, payload._result = thenable);
			}
			if (1 === payload._status) return ioInfo = payload._result, void 0 === ioInfo && console.error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", ioInfo), "default" in ioInfo || console.error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", ioInfo), ioInfo.default;
			throw payload._result;
		}
		function resolveDispatcher() {
			var dispatcher = ReactSharedInternals.H;
			null === dispatcher && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.");
			return dispatcher;
		}
		function releaseAsyncTransition() {
			ReactSharedInternals.asyncTransitions--;
		}
		function enqueueTask(task) {
			if (null === enqueueTaskImpl) try {
				var requireString = ("require" + Math.random()).slice(0, 7);
				enqueueTaskImpl = (module && module[requireString]).call(module, "timers").setImmediate;
			} catch (_err) {
				enqueueTaskImpl = function(callback) {
					!1 === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = !0, "undefined" === typeof MessageChannel && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var channel = new MessageChannel();
					channel.port1.onmessage = callback;
					channel.port2.postMessage(void 0);
				};
			}
			return enqueueTaskImpl(task);
		}
		function aggregateErrors(errors) {
			return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
		}
		function popActScope(prevActQueue, prevActScopeDepth) {
			prevActScopeDepth !== actScopeDepth - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. ");
			actScopeDepth = prevActScopeDepth;
		}
		function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
			var queue = ReactSharedInternals.actQueue;
			if (null !== queue) if (0 !== queue.length) try {
				flushActQueue(queue);
				enqueueTask(function() {
					return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
				});
				return;
			} catch (error) {
				ReactSharedInternals.thrownErrors.push(error);
			}
			else ReactSharedInternals.actQueue = null;
			0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
		}
		function flushActQueue(queue) {
			if (!isFlushing) {
				isFlushing = !0;
				var i = 0;
				try {
					for (; i < queue.length; i++) {
						var callback = queue[i];
						do {
							ReactSharedInternals.didUsePromise = !1;
							var continuation = callback(!1);
							if (null !== continuation) {
								if (ReactSharedInternals.didUsePromise) {
									queue[i] = callback;
									queue.splice(0, i);
									return;
								}
								callback = continuation;
							} else break;
						} while (1);
					}
					queue.length = 0;
				} catch (error) {
					queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
				} finally {
					isFlushing = !1;
				}
			}
		}
		"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
			isMounted: function() {
				return !1;
			},
			enqueueForceUpdate: function(publicInstance) {
				warnNoop(publicInstance, "forceUpdate");
			},
			enqueueReplaceState: function(publicInstance) {
				warnNoop(publicInstance, "replaceState");
			},
			enqueueSetState: function(publicInstance) {
				warnNoop(publicInstance, "setState");
			}
		}, assign = Object.assign, emptyObject = {};
		Object.freeze(emptyObject);
		Component.prototype.isReactComponent = {};
		Component.prototype.setState = function(partialState, callback) {
			if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, partialState, callback, "setState");
		};
		Component.prototype.forceUpdate = function(callback) {
			this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
		};
		var deprecatedAPIs = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (fnName in deprecatedAPIs) deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
		ComponentDummy.prototype = Component.prototype;
		deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
		deprecatedAPIs.constructor = PureComponent;
		assign(deprecatedAPIs, Component.prototype);
		deprecatedAPIs.isPureReactComponent = !0;
		var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = {
			H: null,
			A: null,
			T: null,
			S: null,
			actQueue: null,
			asyncTransitions: 0,
			isBatchingLegacy: !1,
			didScheduleLegacyUpdate: !1,
			didUsePromise: !1,
			thrownErrors: [],
			getCurrentStack: null,
			recentlyCreatedOwnerStacks: 0
		}, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
			return null;
		};
		deprecatedAPIs = { react_stack_bottom_frame: function(callStackForError) {
			return callStackForError();
		} };
		var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
		var didWarnAboutElementRef = {};
		var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(deprecatedAPIs, UnknownOwner)();
		var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
		var didWarnAboutMaps = !1, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
			if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
				var event = new window.ErrorEvent("error", {
					bubbles: !0,
					cancelable: !0,
					message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
					error
				});
				if (!window.dispatchEvent(event)) return;
			} else if ("object" === typeof process && "function" === typeof process.emit) {
				process.emit("uncaughtException", error);
				return;
			}
			console.error(error);
		}, didWarnAboutMessageChannel = !1, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = !1, isFlushing = !1, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
			queueMicrotask(function() {
				return queueMicrotask(callback);
			});
		} : enqueueTask;
		deprecatedAPIs = Object.freeze({
			__proto__: null,
			c: function(size) {
				return resolveDispatcher().useMemoCache(size);
			}
		});
		var fnName = {
			map: mapChildren,
			forEach: function(children, forEachFunc, forEachContext) {
				mapChildren(children, function() {
					forEachFunc.apply(this, arguments);
				}, forEachContext);
			},
			count: function(children) {
				var n = 0;
				mapChildren(children, function() {
					n++;
				});
				return n;
			},
			toArray: function(children) {
				return mapChildren(children, function(child) {
					return child;
				}) || [];
			},
			only: function(children) {
				if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
				return children;
			}
		};
		exports.Activity = REACT_ACTIVITY_TYPE;
		exports.Children = fnName;
		exports.Component = Component;
		exports.Fragment = REACT_FRAGMENT_TYPE;
		exports.Profiler = REACT_PROFILER_TYPE;
		exports.PureComponent = PureComponent;
		exports.StrictMode = REACT_STRICT_MODE_TYPE;
		exports.Suspense = REACT_SUSPENSE_TYPE;
		exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
		exports.__COMPILER_RUNTIME = deprecatedAPIs;
		exports.act = function(callback) {
			var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
			actScopeDepth++;
			var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = !1;
			try {
				var result = callback();
			} catch (error) {
				ReactSharedInternals.thrownErrors.push(error);
			}
			if (0 < ReactSharedInternals.thrownErrors.length) throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
			if (null !== result && "object" === typeof result && "function" === typeof result.then) {
				var thenable = result;
				queueSeveralMicrotasks(function() {
					didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				});
				return { then: function(resolve, reject) {
					didAwaitActCall = !0;
					thenable.then(function(returnValue) {
						popActScope(prevActQueue, prevActScopeDepth);
						if (0 === prevActScopeDepth) {
							try {
								flushActQueue(queue), enqueueTask(function() {
									return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
								});
							} catch (error$0) {
								ReactSharedInternals.thrownErrors.push(error$0);
							}
							if (0 < ReactSharedInternals.thrownErrors.length) {
								var _thrownError = aggregateErrors(ReactSharedInternals.thrownErrors);
								ReactSharedInternals.thrownErrors.length = 0;
								reject(_thrownError);
							}
						} else resolve(returnValue);
					}, function(error) {
						popActScope(prevActQueue, prevActScopeDepth);
						0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
					});
				} };
			}
			var returnValue$jscomp$0 = result;
			popActScope(prevActQueue, prevActScopeDepth);
			0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
				didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), ReactSharedInternals.actQueue = null);
			if (0 < ReactSharedInternals.thrownErrors.length) throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
			return { then: function(resolve, reject) {
				didAwaitActCall = !0;
				0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
					return recursivelyFlushAsyncActWork(returnValue$jscomp$0, resolve, reject);
				})) : resolve(returnValue$jscomp$0);
			} };
		};
		exports.cache = function(fn) {
			return function() {
				return fn.apply(null, arguments);
			};
		};
		exports.cacheSignal = function() {
			return null;
		};
		exports.captureOwnerStack = function() {
			var getCurrentStack = ReactSharedInternals.getCurrentStack;
			return null === getCurrentStack ? null : getCurrentStack();
		};
		exports.cloneElement = function(element, config, children) {
			if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
			var props = assign({}, element.props), key = element.key, owner = element._owner;
			if (null != config) {
				var JSCompiler_inline_result;
				a: {
					if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(config, "ref").get) && JSCompiler_inline_result.isReactWarning) {
						JSCompiler_inline_result = !1;
						break a;
					}
					JSCompiler_inline_result = void 0 !== config.ref;
				}
				JSCompiler_inline_result && (owner = getOwner());
				hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
				for (propName in config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
			}
			var propName = arguments.length - 2;
			if (1 === propName) props.children = children;
			else if (1 < propName) {
				JSCompiler_inline_result = Array(propName);
				for (var i = 0; i < propName; i++) JSCompiler_inline_result[i] = arguments[i + 2];
				props.children = JSCompiler_inline_result;
			}
			props = ReactElement(element.type, key, props, owner, element._debugStack, element._debugTask);
			for (key = 2; key < arguments.length; key++) validateChildKeys(arguments[key]);
			return props;
		};
		exports.createContext = function(defaultValue) {
			defaultValue = {
				$$typeof: REACT_CONTEXT_TYPE,
				_currentValue: defaultValue,
				_currentValue2: defaultValue,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			};
			defaultValue.Provider = defaultValue;
			defaultValue.Consumer = {
				$$typeof: REACT_CONSUMER_TYPE,
				_context: defaultValue
			};
			defaultValue._currentRenderer = null;
			defaultValue._currentRenderer2 = null;
			return defaultValue;
		};
		exports.createElement = function(type, config, children) {
			for (var i = 2; i < arguments.length; i++) validateChildKeys(arguments[i]);
			i = {};
			var key = null;
			if (null != config) for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
			var childrenLength = arguments.length - 2;
			if (1 === childrenLength) i.children = children;
			else if (1 < childrenLength) {
				for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++) childArray[_i] = arguments[_i + 2];
				Object.freeze && Object.freeze(childArray);
				i.children = childArray;
			}
			if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === i[propName] && (i[propName] = childrenLength[propName]);
			key && defineKeyPropWarningGetter(i, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
			var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
			return ReactElement(type, key, i, getOwner(), propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack, propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
		};
		exports.createRef = function() {
			var refObject = { current: null };
			Object.seal(refObject);
			return refObject;
		};
		exports.forwardRef = function(render) {
			null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : "function" !== typeof render ? console.error("forwardRef requires a render function but was given %s.", null === render ? "null" : typeof render) : 0 !== render.length && 2 !== render.length && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", 1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.");
			null != render && null != render.defaultProps && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var elementType = {
				$$typeof: REACT_FORWARD_REF_TYPE,
				render
			}, ownName;
			Object.defineProperty(elementType, "displayName", {
				enumerable: !1,
				configurable: !0,
				get: function() {
					return ownName;
				},
				set: function(name) {
					ownName = name;
					render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
				}
			});
			return elementType;
		};
		exports.isValidElement = isValidElement;
		exports.lazy = function(ctor) {
			ctor = {
				_status: -1,
				_result: ctor
			};
			var lazyType = {
				$$typeof: REACT_LAZY_TYPE,
				_payload: ctor,
				_init: lazyInitializer
			}, ioInfo = {
				name: "lazy",
				start: -1,
				end: -1,
				value: null,
				owner: null,
				debugStack: Error("react-stack-top-frame"),
				debugTask: console.createTask ? console.createTask("lazy()") : null
			};
			ctor._ioInfo = ioInfo;
			lazyType._debugInfo = [{ awaited: ioInfo }];
			return lazyType;
		};
		exports.memo = function(type, compare) {
			type ?? console.error("memo: The first argument must be a component. Instead received: %s", null === type ? "null" : typeof type);
			compare = {
				$$typeof: REACT_MEMO_TYPE,
				type,
				compare: void 0 === compare ? null : compare
			};
			var ownName;
			Object.defineProperty(compare, "displayName", {
				enumerable: !1,
				configurable: !0,
				get: function() {
					return ownName;
				},
				set: function(name) {
					ownName = name;
					type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
				}
			});
			return compare;
		};
		exports.startTransition = function(scope) {
			var prevTransition = ReactSharedInternals.T, currentTransition = {};
			currentTransition._updatedFibers = /* @__PURE__ */ new Set();
			ReactSharedInternals.T = currentTransition;
			try {
				var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
				null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
				"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop, reportGlobalError));
			} catch (error) {
				reportGlobalError(error);
			} finally {
				null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
			}
		};
		exports.unstable_useCacheRefresh = function() {
			return resolveDispatcher().useCacheRefresh();
		};
		exports.use = function(usable) {
			return resolveDispatcher().use(usable);
		};
		exports.useActionState = function(action, initialState, permalink) {
			return resolveDispatcher().useActionState(action, initialState, permalink);
		};
		exports.useCallback = function(callback, deps) {
			return resolveDispatcher().useCallback(callback, deps);
		};
		exports.useContext = function(Context) {
			var dispatcher = resolveDispatcher();
			Context.$$typeof === REACT_CONSUMER_TYPE && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?");
			return dispatcher.useContext(Context);
		};
		exports.useDebugValue = function(value, formatterFn) {
			return resolveDispatcher().useDebugValue(value, formatterFn);
		};
		exports.useDeferredValue = function(value, initialValue) {
			return resolveDispatcher().useDeferredValue(value, initialValue);
		};
		exports.useEffect = function(create, deps) {
			create ?? console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?");
			return resolveDispatcher().useEffect(create, deps);
		};
		exports.useEffectEvent = function(callback) {
			return resolveDispatcher().useEffectEvent(callback);
		};
		exports.useId = function() {
			return resolveDispatcher().useId();
		};
		exports.useImperativeHandle = function(ref, create, deps) {
			return resolveDispatcher().useImperativeHandle(ref, create, deps);
		};
		exports.useInsertionEffect = function(create, deps) {
			create ?? console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?");
			return resolveDispatcher().useInsertionEffect(create, deps);
		};
		exports.useLayoutEffect = function(create, deps) {
			create ?? console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?");
			return resolveDispatcher().useLayoutEffect(create, deps);
		};
		exports.useMemo = function(create, deps) {
			return resolveDispatcher().useMemo(create, deps);
		};
		exports.useOptimistic = function(passthrough, reducer) {
			return resolveDispatcher().useOptimistic(passthrough, reducer);
		};
		exports.useReducer = function(reducer, initialArg, init) {
			return resolveDispatcher().useReducer(reducer, initialArg, init);
		};
		exports.useRef = function(initialValue) {
			return resolveDispatcher().useRef(initialValue);
		};
		exports.useState = function(initialState) {
			return resolveDispatcher().useState(initialState);
		};
		exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
			return resolveDispatcher().useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
		};
		exports.useTransition = function() {
			return resolveDispatcher().useTransition();
		};
		exports.version = "19.2.7";
		"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
}));
(/* @__PURE__ */ __commonJSMin(((exports, module) => {
	if (process.env.NODE_ENV === "production") module.exports = require_react_production();
	else module.exports = require_react_development();
})))();
const COLORS = {
	BROWN: "brown",
	LIGHT_BLUE: "lightBlue",
	PINK: "pink",
	ORANGE: "orange",
	RED: "red",
	YELLOW: "yellow",
	GREEN: "green",
	DARK_BLUE: "darkBlue",
	RAILROAD: "railroad",
	UTILITY: "utility",
	WILD: "wild"
};
const COLOR_DISPLAY = {
	brown: {
		name: "Brown",
		hex: "#955436",
		light: "#C4845A"
	},
	lightBlue: {
		name: "Light Blue",
		hex: "#55C3F0",
		light: "#9ADDF7"
	},
	pink: {
		name: "Pink",
		hex: "#D93A96",
		light: "#F07DC3"
	},
	orange: {
		name: "Orange",
		hex: "#F7941D",
		light: "#FAB96A"
	},
	red: {
		name: "Red",
		hex: "#ED1C24",
		light: "#F56D72"
	},
	yellow: {
		name: "Yellow",
		hex: "#FEF200",
		light: "#FEF880"
	},
	green: {
		name: "Green",
		hex: "#1FB25A",
		light: "#6FCE96"
	},
	darkBlue: {
		name: "Dark Blue",
		hex: "#003F9E",
		light: "#4A7ECC"
	},
	railroad: {
		name: "Station",
		hex: "#2C2C2C",
		light: "#555555"
	},
	utility: {
		name: "Utility",
		hex: "#00796B",
		light: "#4DB6AC"
	},
	wild: {
		name: "Wild",
		hex: "#9B59B6",
		light: "#C39BD3"
	}
};
const PROPERTY_SETS = {
	brown: {
		cardsNeeded: 2,
		rentValues: [1, 2],
		houseBonus: 3,
		hotelBonus: 4
	},
	lightBlue: {
		cardsNeeded: 3,
		rentValues: [
			1,
			2,
			3
		],
		houseBonus: 4,
		hotelBonus: 5
	},
	pink: {
		cardsNeeded: 3,
		rentValues: [
			1,
			2,
			4
		],
		houseBonus: 4,
		hotelBonus: 5
	},
	orange: {
		cardsNeeded: 3,
		rentValues: [
			1,
			3,
			5
		],
		houseBonus: 4,
		hotelBonus: 5
	},
	red: {
		cardsNeeded: 3,
		rentValues: [
			2,
			3,
			6
		],
		houseBonus: 4,
		hotelBonus: 5
	},
	yellow: {
		cardsNeeded: 3,
		rentValues: [
			2,
			4,
			6
		],
		houseBonus: 4,
		hotelBonus: 5
	},
	green: {
		cardsNeeded: 3,
		rentValues: [
			2,
			4,
			7
		],
		houseBonus: 4,
		hotelBonus: 5
	},
	darkBlue: {
		cardsNeeded: 2,
		rentValues: [3, 8],
		houseBonus: 4,
		hotelBonus: 5
	},
	railroad: {
		cardsNeeded: 4,
		rentValues: [
			1,
			2,
			3,
			4
		],
		houseBonus: 0,
		hotelBonus: 0
	},
	utility: {
		cardsNeeded: 2,
		rentValues: [1, 2],
		houseBonus: 0,
		hotelBonus: 0
	}
};
const CARD_TYPES = {
	PROPERTY: "property",
	MONEY: "money",
	ACTION: "action",
	RENT: "rent",
	WILD_PROPERTY: "wildProperty"
};
const ACTION_TYPES = {
	DEAL_BREAKER: "dealBreaker",
	DEBT_COLLECTOR: "debtCollector",
	FORCED_DEAL: "forcedDeal",
	SLY_DEAL: "slyDeal",
	PASS_GO: "passGo",
	BIRTHDAY: "birthday",
	JUST_SAY_NO: "justSayNo",
	DOUBLE_RENT: "doubleRent",
	HOUSE: "house",
	HOTEL: "hotel",
	INSURANCE: "insurance",
	TRADE_ROUTE: "tradeRoute"
};
let _cardId = 1;
const id = () => `c${_cardId++}`;
function makeProp(color, name, value, landmark) {
	return {
		id: id(),
		type: CARD_TYPES.PROPERTY,
		color,
		name,
		value,
		landmark
	};
}
function makeWild(colors, value) {
	return {
		id: id(),
		type: CARD_TYPES.WILD_PROPERTY,
		colors,
		color: colors[0],
		value,
		name: `Wild: ${colors.map((c) => COLOR_DISPLAY[c]?.name).join("/")}`
	};
}
function makeMoney(amount) {
	return {
		id: id(),
		type: CARD_TYPES.MONEY,
		value: amount,
		name: `₹${amount} Cr`
	};
}
function makeAction(actionType, value, name) {
	return {
		id: id(),
		type: CARD_TYPES.ACTION,
		actionType,
		value,
		name
	};
}
function makeRent(colors, value, wild = false) {
	const name = wild ? "Wild Rent" : `Rent: ${colors.map((c) => COLOR_DISPLAY[c]?.name).join("/")}`;
	return {
		id: id(),
		type: CARD_TYPES.RENT,
		colors,
		value,
		wild,
		name
	};
}
function createDeck(customCards = false) {
	const cards = [
		makeProp(COLORS.BROWN, "Indore", 1, "indore"),
		makeProp(COLORS.BROWN, "Lucknow", 1, "lucknow"),
		makeProp(COLORS.LIGHT_BLUE, "Chandigarh", 1, "chandigarh"),
		makeProp(COLORS.LIGHT_BLUE, "Bhopal", 1, "bhopal"),
		makeProp(COLORS.LIGHT_BLUE, "Kochi", 1, "kochi"),
		makeProp(COLORS.PINK, "Jaipur", 2, "jaipur"),
		makeProp(COLORS.PINK, "Ahmedabad", 2, "ahmedabad"),
		makeProp(COLORS.PINK, "Kolkata", 2, "kolkata"),
		makeProp(COLORS.ORANGE, "Chennai", 2, "chennai"),
		makeProp(COLORS.ORANGE, "Hyderabad", 2, "hyderabad"),
		makeProp(COLORS.ORANGE, "Noida", 2, "noida"),
		makeProp(COLORS.RED, "Pune", 3, "pune"),
		makeProp(COLORS.RED, "Bengaluru", 3, "bengaluru"),
		makeProp(COLORS.RED, "Gurugram", 3, "gurugram"),
		makeProp(COLORS.YELLOW, "Goa", 3, "goa"),
		makeProp(COLORS.YELLOW, "Coimbatore", 3, "coimbatore"),
		makeProp(COLORS.YELLOW, "Vizag", 3, "vizag"),
		makeProp(COLORS.GREEN, "New Delhi", 4, "newdelhi"),
		makeProp(COLORS.GREEN, "Navi Mumbai", 4, "navimumbai"),
		makeProp(COLORS.GREEN, "Thane", 4, "thane"),
		makeProp(COLORS.DARK_BLUE, "South Mumbai", 4, "southmumbai"),
		makeProp(COLORS.DARK_BLUE, "Lutyens Delhi", 4, "lutyensdelhi"),
		makeProp(COLORS.RAILROAD, "Mumbai Local", 2, "mumbailocal"),
		makeProp(COLORS.RAILROAD, "Delhi Metro", 2, "delhimetro"),
		makeProp(COLORS.RAILROAD, "Namma Metro", 2, "nammametro"),
		makeProp(COLORS.RAILROAD, "Howrah Express", 2, "howrahexpress"),
		makeProp(COLORS.UTILITY, "Power Grid", 2, "powergrid"),
		makeProp(COLORS.UTILITY, "Water Works", 2, "waterworks"),
		makeWild([COLORS.WILD], 0),
		makeWild([COLORS.WILD], 0),
		makeWild([COLORS.RAILROAD, COLORS.UTILITY], 2),
		makeWild([COLORS.RAILROAD, COLORS.GREEN], 4),
		makeWild([COLORS.RAILROAD, COLORS.LIGHT_BLUE], 4),
		makeWild([COLORS.DARK_BLUE, COLORS.GREEN], 4),
		makeWild([COLORS.PINK, COLORS.ORANGE], 2),
		makeWild([COLORS.RED, COLORS.YELLOW], 3),
		makeWild([COLORS.LIGHT_BLUE, COLORS.BROWN], 1),
		makeWild([COLORS.LIGHT_BLUE, COLORS.RAILROAD], 4),
		makeMoney(10),
		makeMoney(5),
		makeMoney(5),
		makeMoney(4),
		makeMoney(4),
		makeMoney(4),
		makeMoney(3),
		makeMoney(3),
		makeMoney(3),
		makeMoney(2),
		makeMoney(2),
		makeMoney(2),
		makeMoney(2),
		makeMoney(2),
		makeMoney(1),
		makeMoney(1),
		makeMoney(1),
		makeMoney(1),
		makeMoney(1),
		makeMoney(1),
		makeAction(ACTION_TYPES.DEAL_BREAKER, 5, "Deal Breaker"),
		makeAction(ACTION_TYPES.DEAL_BREAKER, 5, "Deal Breaker"),
		makeAction(ACTION_TYPES.DEBT_COLLECTOR, 3, "Debt Collector"),
		makeAction(ACTION_TYPES.DEBT_COLLECTOR, 3, "Debt Collector"),
		makeAction(ACTION_TYPES.DEBT_COLLECTOR, 3, "Debt Collector"),
		makeAction(ACTION_TYPES.FORCED_DEAL, 3, "Forced Deal"),
		makeAction(ACTION_TYPES.FORCED_DEAL, 3, "Forced Deal"),
		makeAction(ACTION_TYPES.FORCED_DEAL, 3, "Forced Deal"),
		makeAction(ACTION_TYPES.SLY_DEAL, 3, "Sly Deal"),
		makeAction(ACTION_TYPES.SLY_DEAL, 3, "Sly Deal"),
		makeAction(ACTION_TYPES.SLY_DEAL, 3, "Sly Deal"),
		makeAction(ACTION_TYPES.PASS_GO, 1, "Pass Go"),
		makeAction(ACTION_TYPES.PASS_GO, 1, "Pass Go"),
		makeAction(ACTION_TYPES.PASS_GO, 1, "Pass Go"),
		makeAction(ACTION_TYPES.PASS_GO, 1, "Pass Go"),
		makeAction(ACTION_TYPES.PASS_GO, 1, "Pass Go"),
		makeAction(ACTION_TYPES.PASS_GO, 1, "Pass Go"),
		makeAction(ACTION_TYPES.PASS_GO, 1, "Pass Go"),
		makeAction(ACTION_TYPES.PASS_GO, 1, "Pass Go"),
		makeAction(ACTION_TYPES.PASS_GO, 1, "Pass Go"),
		makeAction(ACTION_TYPES.PASS_GO, 1, "Pass Go"),
		makeAction(ACTION_TYPES.BIRTHDAY, 2, "Mera Birthday!"),
		makeAction(ACTION_TYPES.BIRTHDAY, 2, "Mera Birthday!"),
		makeAction(ACTION_TYPES.BIRTHDAY, 2, "Mera Birthday!"),
		makeAction(ACTION_TYPES.JUST_SAY_NO, 4, "Nahi!"),
		makeAction(ACTION_TYPES.JUST_SAY_NO, 4, "Nahi!"),
		makeAction(ACTION_TYPES.JUST_SAY_NO, 4, "Nahi!"),
		makeAction(ACTION_TYPES.DOUBLE_RENT, 1, "Double Rent!"),
		makeAction(ACTION_TYPES.DOUBLE_RENT, 1, "Double Rent!"),
		makeAction(ACTION_TYPES.HOUSE, 3, "Ghar"),
		makeAction(ACTION_TYPES.HOUSE, 3, "Ghar"),
		makeAction(ACTION_TYPES.HOUSE, 3, "Ghar"),
		makeAction(ACTION_TYPES.HOTEL, 4, "Hotel"),
		makeAction(ACTION_TYPES.HOTEL, 4, "Hotel"),
		makeAction(ACTION_TYPES.HOTEL, 4, "Hotel"),
		makeRent([COLORS.BROWN, COLORS.LIGHT_BLUE], 1),
		makeRent([COLORS.BROWN, COLORS.LIGHT_BLUE], 1),
		makeRent([COLORS.PINK, COLORS.ORANGE], 1),
		makeRent([COLORS.PINK, COLORS.ORANGE], 1),
		makeRent([COLORS.RED, COLORS.YELLOW], 1),
		makeRent([COLORS.RED, COLORS.YELLOW], 1),
		makeRent([COLORS.GREEN, COLORS.DARK_BLUE], 1),
		makeRent([COLORS.GREEN, COLORS.DARK_BLUE], 1),
		makeRent([COLORS.RAILROAD, COLORS.UTILITY], 1),
		makeRent([COLORS.RAILROAD, COLORS.UTILITY], 1),
		makeRent([], 3, true),
		makeRent([], 3, true),
		makeRent([], 3, true)
	];
	if (customCards) cards.push(makeAction(ACTION_TYPES.INSURANCE, 2, "Insurance"), makeAction(ACTION_TYPES.TRADE_ROUTE, 1, "Trade Route"));
	return shuffle$1(cards);
}
function shuffle$1(arr) {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
//#endregion
//#region src/game/gameLogic.js
const PHASE = {
	DRAW: "draw",
	PLAY: "play",
	ACTION_RESPONSE: "actionResponse",
	RENT_COLLECT: "rentCollect",
	BIRTHDAY_COLLECT: "birthdayCollect",
	FORCED_DEAL_SELECT: "forcedDealSelect",
	SLY_DEAL_SELECT: "slyDealSelect",
	DEAL_BREAKER_SELECT: "dealBreakerSelect",
	TRADE_ROUTE_SELECT: "tradeRouteSelect",
	WILD_COLOR_SELECT: "wildColorSelect",
	DISCARD: "discard",
	GAME_OVER: "gameOver"
};
function initGame(playerNames, { customCards = false } = {}) {
	const deck = createDeck(customCards);
	const players = playerNames.map((name, i) => ({
		id: i,
		name,
		hand: [],
		bank: [],
		properties: {},
		buildings: {},
		insurance: null
	}));
	players.forEach((p) => {
		p.hand = deck.splice(0, 5);
	});
	return {
		gameId: Date.now(),
		customCards,
		players,
		deck,
		discard: [],
		currentPlayerIndex: 0,
		phase: PHASE.DRAW,
		cardsPlayedThisTurn: 0,
		maxCardsPerTurn: 3,
		pendingAction: null,
		doubleRentActive: false,
		winner: null,
		log: [`Game shuru! ${playerNames[0]} ki baari hai.`]
	};
}
function getRentForColor(color, count, buildings) {
	const set = PROPERTY_SETS[color];
	if (!set) return 0;
	const base = set.rentValues[Math.min(count, set.rentValues.length) - 1] || 0;
	const b = buildings?.[color] || {
		houses: 0,
		hotels: 0
	};
	return base + (b.houses > 0 ? set.houseBonus : 0) + (b.hotels > 0 ? set.hotelBonus : 0);
}
function isSetComplete(color, cards) {
	const needed = PROPERTY_SETS[color]?.cardsNeeded;
	if (!needed) return false;
	return cards.filter((c) => c.type === CARD_TYPES.PROPERTY).length + cards.filter((c) => c.type === CARD_TYPES.WILD_PROPERTY).length >= needed;
}
function countCompleteSets(player) {
	let count = 0;
	for (const [color, cards] of Object.entries(player.properties)) {
		if (color === COLORS.WILD) continue;
		if (isSetComplete(color, cards)) count++;
	}
	return count;
}
function checkWinner(players) {
	return players.find((p) => countCompleteSets(p) >= 3) || null;
}
function applyPayment(state, debtorId, creditorId, paidCards) {
	const s = deepClone$1(state);
	const debtor = s.players[debtorId];
	const creditor = s.players[creditorId];
	for (const card of paidCards) if (card._from === "bank") {
		const before = debtor.bank.length;
		debtor.bank = debtor.bank.filter((c) => c.id !== card.id);
		if (debtor.bank.length < before) creditor.bank.push({
			...card,
			_from: void 0,
			_color: void 0
		});
	} else if (card._from === "property") {
		const color = card._color;
		const pile = debtor.properties[color] || [];
		const before = pile.length;
		const remaining = pile.filter((c) => c.id !== card.id);
		if (remaining.length < before) {
			if (remaining.length === 0) delete debtor.properties[color];
			else debtor.properties[color] = remaining;
			if (!creditor.properties[color]) creditor.properties[color] = [];
			creditor.properties[color].push({
				...card,
				_from: void 0,
				_color: void 0
			});
		}
	}
	return s;
}
function playCardToBank(state, playerId, cardId) {
	const s = deepClone$1(state);
	const player = s.players[playerId];
	const cardIdx = player.hand.findIndex((c) => c.id === cardId);
	if (cardIdx === -1) return state;
	const card = player.hand[cardIdx];
	if (card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.WILD_PROPERTY) return state;
	player.hand.splice(cardIdx, 1);
	player.bank.push(card);
	s.cardsPlayedThisTurn++;
	s.log.push(`${player.name} ne ₹${card.value}Cr bank mein daala.`);
	return s;
}
function playPropertyCard(state, playerId, cardId, targetColor = null) {
	const s = deepClone$1(state);
	const player = s.players[playerId];
	const cardIdx = player.hand.findIndex((c) => c.id === cardId);
	if (cardIdx === -1) return state;
	const [card] = player.hand.splice(cardIdx, 1);
	let color = card.color;
	if (card.type === CARD_TYPES.WILD_PROPERTY && targetColor) {
		color = targetColor;
		card.color = targetColor;
	}
	if (!player.properties[color]) player.properties[color] = [];
	player.properties[color].push(card);
	s.cardsPlayedThisTurn++;
	s.log.push(`${player.name} ne ${card.name} property play kiya.`);
	return s;
}
function endTurn(state) {
	const s = deepClone$1(state);
	const player = s.players[s.currentPlayerIndex];
	if (player.hand.length > 7) {
		const excess = player.hand.splice(7);
		s.discard.push(...excess);
		s.log.push(`${player.name} ne ${excess.length} card(s) discard kiye.`);
	}
	s.currentPlayerIndex = (s.currentPlayerIndex + 1) % s.players.length;
	s.cardsPlayedThisTurn = 0;
	s.doubleRentActive = false;
	s.phase = PHASE.DRAW;
	const nextPlayer = s.players[s.currentPlayerIndex];
	s.log.push(`${nextPlayer.name} ki baari!`);
	return s;
}
function startTurn(state) {
	const s = deepClone$1(state);
	const player = s.players[s.currentPlayerIndex];
	const drawCount = player.hand.length === 0 ? 5 : 2;
	if (s.deck.length === 0) {
		s.deck = shuffle(s.discard);
		s.discard = [];
		s.log.push("Deck khatam ho gaya, discard pile se naya deck bana.");
	}
	const drawn = s.deck.splice(0, Math.min(drawCount, s.deck.length));
	player.hand.push(...drawn);
	s.phase = PHASE.PLAY;
	s.log.push(`${player.name} ne ${drawn.length} card draw kiye.`);
	return s;
}
function shuffle(arr) {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
function deepClone$1(obj) {
	return JSON.parse(JSON.stringify(obj));
}
//#endregion
//#region src/game/useGameState.js
function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}
function nextPhaseAfterPlay(s) {
	if (s.cardsPlayedThisTurn < s.maxCardsPerTurn) return PHASE.PLAY;
	return s.players[s.currentPlayerIndex].hand.length > 7 ? PHASE.DISCARD : PHASE.PLAY;
}
const PLAY_ACTIONS = new Set([
	"PLAY_AS_MONEY",
	"PLAY_PROPERTY",
	"PLAY_ACTION",
	"PLAY_RENT"
]);
function gameReducer(state, action) {
	if (state && PLAY_ACTIONS.has(action.type) && state.cardsPlayedThisTurn >= state.maxCardsPerTurn) return state;
	switch (action.type) {
		case "START_TURN": {
			const s = startTurn(state);
			const winner = checkWinner(s.players);
			if (winner) return {
				...s,
				phase: PHASE.GAME_OVER,
				winner
			};
			return s;
		}
		case "PLAY_AS_MONEY": {
			const banking = state.players[state.currentPlayerIndex].hand.find((c) => c.id === action.cardId);
			if (!banking || banking.type === CARD_TYPES.PROPERTY || banking.type === CARD_TYPES.WILD_PROPERTY) return state;
			const s = playCardToBank(state, state.currentPlayerIndex, action.cardId);
			const winner = checkWinner(s.players);
			if (winner) return {
				...s,
				phase: PHASE.GAME_OVER,
				winner
			};
			if (s.cardsPlayedThisTurn >= s.maxCardsPerTurn) return {
				...s,
				phase: nextPhaseAfterPlay(s)
			};
			return s;
		}
		case "PLAY_PROPERTY": {
			const { cardId, targetColor } = action;
			const card = state.players[state.currentPlayerIndex].hand.find((c) => c.id === cardId);
			if (!card) return state;
			if (card.type === CARD_TYPES.WILD_PROPERTY && !targetColor) return {
				...state,
				phase: PHASE.WILD_COLOR_SELECT,
				pendingAction: { cardId }
			};
			const s = playPropertyCard(state, state.currentPlayerIndex, cardId, targetColor);
			const winner = checkWinner(s.players);
			if (winner) return {
				...s,
				phase: PHASE.GAME_OVER,
				winner
			};
			if (s.cardsPlayedThisTurn >= s.maxCardsPerTurn) return {
				...s,
				phase: nextPhaseAfterPlay(s)
			};
			return s;
		}
		case "PLAY_ACTION": {
			const { cardId } = action;
			const s = deepClone(state);
			const player = s.players[s.currentPlayerIndex];
			const cardIdx = player.hand.findIndex((c) => c.id === cardId);
			if (cardIdx === -1) return state;
			const card = player.hand[cardIdx];
			switch (card.actionType) {
				case ACTION_TYPES.PASS_GO: {
					player.hand.splice(cardIdx, 1);
					s.discard.push(card);
					s.cardsPlayedThisTurn++;
					const drawn = s.deck.splice(0, 2);
					player.hand.push(...drawn);
					s.log.push(`${player.name} ne Pass Go khela — 2 extra cards mile!`);
					s.phase = nextPhaseAfterPlay(s);
					return s;
				}
				case ACTION_TYPES.DOUBLE_RENT:
					player.hand.splice(cardIdx, 1);
					s.discard.push(card);
					s.cardsPlayedThisTurn++;
					s.doubleRentActive = true;
					s.log.push(`${player.name} ne Double The Rent lagaaya!`);
					s.phase = nextPhaseAfterPlay(s);
					return s;
				case ACTION_TYPES.BIRTHDAY:
					player.hand.splice(cardIdx, 1);
					s.discard.push(card);
					s.cardsPlayedThisTurn++;
					s.log.push(`${player.name} ka birthday hai! Sabko ₹2Cr dena hoga.`);
					s.phase = PHASE.ACTION_RESPONSE;
					s.pendingAction = {
						type: ACTION_TYPES.BIRTHDAY,
						actingPlayerId: s.currentPlayerIndex,
						targetIds: s.players.map((_, i) => i).filter((i) => i !== s.currentPlayerIndex),
						currentTargetIdx: 0,
						amountPerPlayer: 2,
						collected: 0
					};
					return s;
				case ACTION_TYPES.DEBT_COLLECTOR:
					player.hand.splice(cardIdx, 1);
					s.discard.push(card);
					s.cardsPlayedThisTurn++;
					s.phase = PHASE.ACTION_RESPONSE;
					s.pendingAction = {
						type: ACTION_TYPES.DEBT_COLLECTOR,
						actingPlayerId: s.currentPlayerIndex,
						targetIds: null,
						amount: 5
					};
					return s;
				case ACTION_TYPES.SLY_DEAL:
					player.hand.splice(cardIdx, 1);
					s.discard.push(card);
					s.cardsPlayedThisTurn++;
					s.phase = PHASE.SLY_DEAL_SELECT;
					s.pendingAction = {
						type: ACTION_TYPES.SLY_DEAL,
						actingPlayerId: s.currentPlayerIndex
					};
					return s;
				case ACTION_TYPES.FORCED_DEAL:
					player.hand.splice(cardIdx, 1);
					s.discard.push(card);
					s.cardsPlayedThisTurn++;
					s.phase = PHASE.FORCED_DEAL_SELECT;
					s.pendingAction = {
						type: ACTION_TYPES.FORCED_DEAL,
						actingPlayerId: s.currentPlayerIndex
					};
					return s;
				case ACTION_TYPES.DEAL_BREAKER:
					player.hand.splice(cardIdx, 1);
					s.discard.push(card);
					s.cardsPlayedThisTurn++;
					s.phase = PHASE.DEAL_BREAKER_SELECT;
					s.pendingAction = {
						type: ACTION_TYPES.DEAL_BREAKER,
						actingPlayerId: s.currentPlayerIndex
					};
					return s;
				case ACTION_TYPES.HOUSE:
					player.hand.splice(cardIdx, 1);
					s.discard.push(card);
					s.cardsPlayedThisTurn++;
					s.pendingAction = {
						type: ACTION_TYPES.HOUSE,
						actingPlayerId: s.currentPlayerIndex
					};
					s.phase = PHASE.ACTION_RESPONSE;
					return s;
				case ACTION_TYPES.HOTEL:
					player.hand.splice(cardIdx, 1);
					s.discard.push(card);
					s.cardsPlayedThisTurn++;
					s.pendingAction = {
						type: ACTION_TYPES.HOTEL,
						actingPlayerId: s.currentPlayerIndex
					};
					s.phase = PHASE.ACTION_RESPONSE;
					return s;
				case ACTION_TYPES.INSURANCE:
					if (player.insurance) return state;
					player.hand.splice(cardIdx, 1);
					player.insurance = card;
					s.cardsPlayedThisTurn++;
					s.log.push(`${player.name} ne Insurance lagaya — Deal Breaker se safety! 🛡️`);
					s.phase = nextPhaseAfterPlay(s);
					return s;
				case ACTION_TYPES.TRADE_ROUTE:
					s.phase = PHASE.TRADE_ROUTE_SELECT;
					s.pendingAction = {
						type: ACTION_TYPES.TRADE_ROUTE,
						actingPlayerId: s.currentPlayerIndex,
						cardId
					};
					return s;
				default: return state;
			}
		}
		case "PLAY_RENT": {
			const { cardId, targetColor, targetPlayerId } = action;
			const s = deepClone(state);
			const player = s.players[s.currentPlayerIndex];
			const cardIdx = player.hand.findIndex((c) => c.id === cardId);
			if (cardIdx === -1) return state;
			const card = player.hand[cardIdx];
			player.hand.splice(cardIdx, 1);
			s.discard.push(card);
			s.cardsPlayedThisTurn++;
			const count = (player.properties[targetColor] || []).length;
			let rentAmount = getRentForColor(targetColor, count, player.buildings);
			if (s.doubleRentActive) {
				rentAmount *= 2;
				s.doubleRentActive = false;
			}
			const payerIds = card.wild ? targetPlayerId !== void 0 ? [targetPlayerId] : [] : s.players.map((_, i) => i).filter((i) => i !== s.currentPlayerIndex);
			s.log.push(`${player.name} ne ${targetColor} ka rent maanga — ₹${rentAmount}Cr!`);
			s.phase = PHASE.RENT_COLLECT;
			s.pendingAction = {
				type: "rent",
				actingPlayerId: s.currentPlayerIndex,
				payerIds,
				currentPayerIdx: 0,
				amount: rentAmount,
				targetColor
			};
			return s;
		}
		case "SELECT_TARGET_PLAYER": {
			const s = deepClone(state);
			if (!s.pendingAction) return state;
			s.pendingAction.targetIds = [action.targetPlayerId];
			s.pendingAction.currentTargetIdx = 0;
			if (s.pendingAction.type === ACTION_TYPES.DEBT_COLLECTOR) s.phase = PHASE.ACTION_RESPONSE;
			return s;
		}
		case "PAY_DEBT": {
			const { payerCards, payerId, amount } = action;
			let s = deepClone(state);
			const pa = s.pendingAction;
			if (!pa) return state;
			const creditorId = pa.actingPlayerId;
			s = applyPayment(s, payerId, creditorId, payerCards);
			const propsGiven = payerCards.filter((c) => c._from === "property");
			const propNote = propsGiven.length ? ` (${propsGiven.map((c) => c.name).join(", ")} → ${s.players[creditorId].name})` : "";
			const log = `${s.players[payerId].name} ne ₹${payerCards.reduce((a, c) => a + c.value, 0)}Cr diya${propNote}.`;
			s.log.push(log);
			if (pa.type === "rent") {
				pa.currentPayerIdx++;
				if (pa.currentPayerIdx >= pa.payerIds.length) {
					s.pendingAction = null;
					s.phase = nextPhaseAfterPlay(s);
				}
			} else if (pa.type === ACTION_TYPES.BIRTHDAY) {
				pa.currentTargetIdx++;
				if (pa.currentTargetIdx >= pa.targetIds.length) {
					s.pendingAction = null;
					s.phase = nextPhaseAfterPlay(s);
				}
			} else if (pa.type === ACTION_TYPES.DEBT_COLLECTOR) {
				s.pendingAction = null;
				s.phase = nextPhaseAfterPlay(s);
			}
			s.pendingAction = pa;
			const winner = checkWinner(s.players);
			if (winner) return {
				...s,
				phase: PHASE.GAME_OVER,
				winner
			};
			return s;
		}
		case "JUST_SAY_NO": {
			const { playerId, jsnCardId } = action;
			const s = deepClone(state);
			const player = s.players[playerId];
			const cardIdx = player.hand.findIndex((c) => c.id === jsnCardId);
			if (cardIdx === -1) return state;
			const [card] = player.hand.splice(cardIdx, 1);
			s.discard.push(card);
			s.log.push(`${player.name} ne "Just Say No!" bola! Action cancel ho gaya.`);
			s.pendingAction = null;
			s.phase = nextPhaseAfterPlay(s);
			return s;
		}
		case "SLY_DEAL_STEAL": {
			const { fromPlayerId, cardId, color } = action;
			const s = deepClone(state);
			const thief = s.players[s.currentPlayerIndex];
			const victim = s.players[fromPlayerId];
			if (!victim.properties[color]) return state;
			const cardIdx = victim.properties[color].findIndex((c) => c.id === cardId);
			if (cardIdx === -1) return state;
			if (isSetComplete(color, victim.properties[color])) return state;
			const [stolen] = victim.properties[color].splice(cardIdx, 1);
			if (victim.properties[color].length === 0) delete victim.properties[color];
			if (!thief.properties[color]) thief.properties[color] = [];
			stolen.color = color;
			thief.properties[color].push(stolen);
			s.log.push(`${thief.name} ne ${victim.name} se ${stolen.name} chura liya!`);
			s.pendingAction = null;
			s.phase = nextPhaseAfterPlay(s);
			const winner = checkWinner(s.players);
			if (winner) return {
				...s,
				phase: PHASE.GAME_OVER,
				winner
			};
			return s;
		}
		case "FORCED_DEAL_SWAP": {
			const { fromPlayerId, theirCardId, theirColor, myCardId, myColor } = action;
			const s = deepClone(state);
			const player = s.players[s.currentPlayerIndex];
			const other = s.players[fromPlayerId];
			if (isSetComplete(theirColor, other.properties[theirColor] || [])) return state;
			const theirIdx = (other.properties[theirColor] || []).findIndex((c) => c.id === theirCardId);
			const myIdx = (player.properties[myColor] || []).findIndex((c) => c.id === myCardId);
			if (theirIdx === -1 || myIdx === -1) return state;
			const [theirCard] = other.properties[theirColor].splice(theirIdx, 1);
			const [myCard] = player.properties[myColor].splice(myIdx, 1);
			if (other.properties[theirColor].length === 0) delete other.properties[theirColor];
			if (player.properties[myColor].length === 0) delete player.properties[myColor];
			theirCard.color = theirColor;
			myCard.color = myColor;
			if (!player.properties[theirColor]) player.properties[theirColor] = [];
			player.properties[theirColor].push(theirCard);
			if (!other.properties[myColor]) other.properties[myColor] = [];
			other.properties[myColor].push(myCard);
			s.log.push(`${player.name} ne ${other.name} ke saath deal force ki!`);
			s.pendingAction = null;
			s.phase = nextPhaseAfterPlay(s);
			const winner = checkWinner(s.players);
			if (winner) return {
				...s,
				phase: PHASE.GAME_OVER,
				winner
			};
			return s;
		}
		case "DEAL_BREAKER_STEAL": {
			const { fromPlayerId, color } = action;
			const s = deepClone(state);
			const thief = s.players[s.currentPlayerIndex];
			const victim = s.players[fromPlayerId];
			if (!isSetComplete(color, victim.properties[color] || [])) return state;
			if (victim.insurance) {
				s.discard.push(victim.insurance);
				victim.insurance = null;
				s.log.push(`${victim.name} ke Insurance ne ${thief.name} ka Deal Breaker rok diya! 🛡️`);
				s.pendingAction = null;
				s.phase = nextPhaseAfterPlay(s);
				return s;
			}
			const set = victim.properties[color];
			delete victim.properties[color];
			if (victim.buildings?.[color]) delete victim.buildings[color];
			if (!thief.properties[color]) thief.properties[color] = [];
			thief.properties[color].push(...set);
			s.log.push(`${thief.name} ne ${victim.name} ka poora ${color} set chura liya! Deal Breaker!`);
			s.pendingAction = null;
			s.phase = nextPhaseAfterPlay(s);
			const winner = checkWinner(s.players);
			if (winner) return {
				...s,
				phase: PHASE.GAME_OVER,
				winner
			};
			return s;
		}
		case "PLACE_HOUSE": {
			const { color } = action;
			const s = deepClone(state);
			const player = s.players[s.currentPlayerIndex];
			if (!player.buildings) player.buildings = {};
			if (!player.buildings[color]) player.buildings[color] = {
				houses: 0,
				hotels: 0
			};
			player.buildings[color].houses++;
			s.log.push(`${player.name} ne ${color} pe ghar banaya!`);
			s.pendingAction = null;
			s.phase = nextPhaseAfterPlay(s);
			return s;
		}
		case "PLACE_HOTEL": {
			const { color } = action;
			const s = deepClone(state);
			const player = s.players[s.currentPlayerIndex];
			if (!player.buildings) player.buildings = {};
			if (!player.buildings[color]) player.buildings[color] = {
				houses: 0,
				hotels: 0
			};
			player.buildings[color].hotels++;
			s.log.push(`${player.name} ne ${color} pe hotel banaya!`);
			s.pendingAction = null;
			s.phase = nextPhaseAfterPlay(s);
			return s;
		}
		case "TRADE_ROUTE_SWAP": {
			const { discardCardId, takeCardId } = action;
			const s = deepClone(state);
			const pa = s.pendingAction;
			if (!pa || pa.type !== ACTION_TYPES.TRADE_ROUTE) return state;
			const player = s.players[s.currentPlayerIndex];
			const trCard = player.hand.find((c) => c.id === pa.cardId);
			const handProp = player.hand.find((c) => c.id === discardCardId);
			const takeCard = s.discard.find((c) => c.id === takeCardId);
			if (!trCard || !handProp || !takeCard) return state;
			if (takeCard.color === handProp.color) return state;
			player.hand = player.hand.filter((c) => c.id !== pa.cardId && c.id !== discardCardId);
			s.discard = s.discard.filter((c) => c.id !== takeCardId);
			s.discard.push(trCard, handProp);
			delete takeCard._from;
			player.hand.push(takeCard);
			s.cardsPlayedThisTurn++;
			s.log.push(`${player.name} ne Trade Route khela — ${handProp.name} di, ${takeCard.name} li.`);
			s.pendingAction = null;
			s.phase = nextPhaseAfterPlay(s);
			return s;
		}
		case "SELECT_WILD_COLOR": {
			const { targetColor } = action;
			const s = deepClone(state);
			const pending = s.pendingAction;
			s.pendingAction = null;
			s.phase = PHASE.PLAY;
			return gameReducer(s, {
				type: "PLAY_PROPERTY",
				cardId: pending.cardId,
				targetColor
			});
		}
		case "DISCARD_CARD": {
			const s = deepClone(state);
			const player = s.players[s.currentPlayerIndex];
			const idx = player.hand.findIndex((c) => c.id === action.cardId);
			if (idx === -1) return state;
			const [card] = player.hand.splice(idx, 1);
			s.discard.push(card);
			if (player.hand.length <= 7) s.phase = PHASE.PLAY;
			return s;
		}
		case "END_TURN": return endTurn(state);
		case "_CANCEL_PENDING": {
			const s = deepClone(state);
			s.pendingAction = null;
			s.phase = PHASE.PLAY;
			return s;
		}
		default: return state;
	}
}
const originalReducer = gameReducer;
function patchedGameReducer(state, action) {
	if (action.type === "_INIT") return action._state;
	return originalReducer(state, action);
}
//#endregion
//#region scripts/simulate.js
function makeRng(seed) {
	let x = seed >>> 0;
	return () => {
		x ^= x << 13;
		x >>>= 0;
		x ^= x >> 17;
		x ^= x << 5;
		x >>>= 0;
		return x / 4294967296;
	};
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const EXPECTED_TOTAL = (customCards) => customCards ? 108 : 106;
function allCards(s) {
	const out = [];
	out.push(...s.deck, ...s.discard);
	for (const p of s.players) {
		out.push(...p.hand, ...p.bank);
		for (const color of Object.keys(p.properties)) out.push(...p.properties[color]);
		if (p.insurance) out.push(p.insurance);
	}
	return out;
}
function checkInvariants(s, ctx, customCards) {
	const errors = [];
	const cards = allCards(s);
	if (cards.length !== EXPECTED_TOTAL(customCards)) errors.push(`CARD COUNT: ${cards.length} != ${EXPECTED_TOTAL(customCards)}`);
	const ids = /* @__PURE__ */ new Set();
	for (const c of cards) {
		if (ids.has(c.id)) errors.push(`DUPLICATE CARD ID: ${c.id} (${c.name})`);
		ids.add(c.id);
	}
	if (s.cardsPlayedThisTurn > s.maxCardsPerTurn) errors.push(`PLAYS OVER CAP: cardsPlayedThisTurn=${s.cardsPlayedThisTurn} > ${s.maxCardsPerTurn}`);
	if (s.cardsPlayedThisTurn < 0) errors.push(`PLAYS NEGATIVE: ${s.cardsPlayedThisTurn}`);
	for (const p of s.players) {
		for (const c of p.bank) if (c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.WILD_PROPERTY) errors.push(`PROPERTY IN BANK: ${p.name} bank has ${c.name}`);
		for (const color of Object.keys(p.properties)) {
			for (const c of p.properties[color]) if (c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.WILD_PROPERTY) errors.push(`NON-PROPERTY IN PROPERTIES: ${p.name}/${color} has ${c.name} (${c.type})`);
			if (p.properties[color].length === 0) errors.push(`EMPTY PROPERTY PILE: ${p.name}/${color}`);
		}
		if (p.insurance && p.insurance.actionType !== ACTION_TYPES.INSURANCE) errors.push(`BAD INSURANCE CARD: ${p.name} insurance=${p.insurance.name}`);
	}
	for (const p of s.players) {
		const bankVal = p.bank.reduce((a, c) => a + (c.value || 0), 0);
		if (bankVal < 0) errors.push(`NEGATIVE BANK: ${p.name} = ${bankVal}`);
	}
	return errors.map((e) => `[${ctx}] ${e}`);
}
function chooseAssetsToPay(payer, amount) {
	const assets = [...payer.bank.map((c) => ({
		...c,
		_from: "bank",
		_color: null
	})), ...Object.entries(payer.properties).flatMap(([color, cards]) => cards.map((c) => ({
		...c,
		_from: "property",
		_color: color
	})))].sort((a, b) => (a.value || 0) - (b.value || 0));
	const chosen = [];
	let total = 0;
	for (const a of assets) {
		if (total >= amount) break;
		chosen.push(a);
		total += a.value || 0;
	}
	return chosen;
}
function eligibleRentColors(player, card) {
	return Object.keys(player.properties).filter((color) => {
		if (!card.wild) return (card.colors || []).includes(color);
		return true;
	});
}
function nextAction(s, rng) {
	const me = s.players[s.currentPlayerIndex];
	const pa = s.pendingAction;
	switch (s.phase) {
		case PHASE.GAME_OVER: return { done: true };
		case PHASE.DRAW: return { type: "START_TURN" };
		case PHASE.DISCARD:
			if (me.hand.length > 7) return {
				type: "DISCARD_CARD",
				cardId: pick(rng, me.hand).id
			};
			return { type: "END_TURN" };
		case PHASE.WILD_COLOR_SELECT: {
			const card = me.hand.find((c) => c.id === pa.cardId);
			return {
				type: "SELECT_WILD_COLOR",
				targetColor: pick(rng, card?.colors?.[0] === COLORS.WILD ? Object.keys(PROPERTY_SETS) : card?.colors || [])
			};
		}
		case PHASE.RENT_COLLECT: {
			const payerId = pa.payerIds[pa.currentPayerIdx];
			const payer = s.players[payerId];
			return {
				type: "PAY_DEBT",
				payerId,
				amount: pa.amount,
				payerCards: chooseAssetsToPay(payer, pa.amount)
			};
		}
		case PHASE.ACTION_RESPONSE:
			if (pa?.type === ACTION_TYPES.BIRTHDAY) {
				const payerId = pa.targetIds[pa.currentTargetIdx];
				const payer = s.players[payerId];
				return {
					type: "PAY_DEBT",
					payerId,
					amount: pa.amountPerPlayer,
					payerCards: chooseAssetsToPay(payer, pa.amountPerPlayer)
				};
			}
			if (pa?.type === ACTION_TYPES.DEBT_COLLECTOR) {
				if (!pa.targetIds) return {
					type: "SELECT_TARGET_PLAYER",
					targetPlayerId: pick(rng, s.players.map((_, i) => i).filter((i) => i !== s.currentPlayerIndex))
				};
				const payerId = pa.targetIds[0];
				const payer = s.players[payerId];
				return {
					type: "PAY_DEBT",
					payerId,
					amount: pa.amount,
					payerCards: chooseAssetsToPay(payer, pa.amount)
				};
			}
			if (pa?.type === ACTION_TYPES.HOUSE || pa?.type === ACTION_TYPES.HOTEL) {
				const wantHotel = pa.type === ACTION_TYPES.HOTEL;
				const eligible = Object.keys(me.properties).filter((color) => {
					if (color === COLORS.RAILROAD || color === COLORS.UTILITY) return false;
					if (!isSetComplete(color, me.properties[color])) return false;
					const b = me.buildings?.[color] || {
						houses: 0,
						hotels: 0
					};
					return wantHotel ? b.houses > 0 && !(b.hotels > 0) : !(b.houses > 0);
				});
				if (eligible.length === 0) return { type: "_CANCEL_PENDING" };
				return {
					type: wantHotel ? "PLACE_HOTEL" : "PLACE_HOUSE",
					color: pick(rng, eligible)
				};
			}
			return { type: "_CANCEL_PENDING" };
		case PHASE.SLY_DEAL_SELECT: {
			const targets = [];
			s.players.forEach((p, i) => {
				if (i === s.currentPlayerIndex) return;
				for (const [color, cards] of Object.entries(p.properties)) if (!isSetComplete(color, cards)) cards.forEach((c) => targets.push({
					fromPlayerId: i,
					cardId: c.id,
					color
				}));
			});
			if (targets.length === 0) return { type: "_CANCEL_PENDING" };
			return {
				type: "SLY_DEAL_STEAL",
				...pick(rng, targets)
			};
		}
		case PHASE.FORCED_DEAL_SELECT: {
			const mine = Object.entries(me.properties).flatMap(([color, cards]) => cards.map((c) => ({
				myCardId: c.id,
				myColor: color
			})));
			const theirs = [];
			s.players.forEach((p, i) => {
				if (i === s.currentPlayerIndex) return;
				for (const [color, cards] of Object.entries(p.properties)) if (!isSetComplete(color, cards)) cards.forEach((c) => theirs.push({
					fromPlayerId: i,
					theirCardId: c.id,
					theirColor: color
				}));
			});
			if (mine.length === 0 || theirs.length === 0) return { type: "_CANCEL_PENDING" };
			return {
				type: "FORCED_DEAL_SWAP",
				...pick(rng, mine),
				...pick(rng, theirs)
			};
		}
		case PHASE.DEAL_BREAKER_SELECT: {
			const sets = [];
			s.players.forEach((p, i) => {
				if (i === s.currentPlayerIndex) return;
				for (const [color, cards] of Object.entries(p.properties)) if (isSetComplete(color, cards)) sets.push({
					fromPlayerId: i,
					color
				});
			});
			if (sets.length === 0) return { type: "_CANCEL_PENDING" };
			return {
				type: "DEAL_BREAKER_STEAL",
				...pick(rng, sets)
			};
		}
		case PHASE.TRADE_ROUTE_SELECT: {
			const isProp = (c) => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.WILD_PROPERTY;
			const myProps = me.hand.filter(isProp);
			const pileProps = s.discard.filter(isProp);
			if (myProps.length === 0) return { type: "_CANCEL_PENDING" };
			const discardCard = pick(rng, myProps);
			const eligible = pileProps.filter((c) => c.color !== discardCard.color);
			if (eligible.length === 0) return { type: "_CANCEL_PENDING" };
			return {
				type: "TRADE_ROUTE_SWAP",
				discardCardId: discardCard.id,
				takeCardId: pick(rng, eligible).id
			};
		}
		case PHASE.PLAY: {
			if (s.maxCardsPerTurn - s.cardsPlayedThisTurn <= 0 || me.hand.length === 0) return { type: "END_TURN" };
			if (rng() < .08) return { type: "END_TURN" };
			const props = me.hand.filter((c) => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.WILD_PROPERTY);
			if (props.length && rng() < .7) return {
				type: "PLAY_PROPERTY",
				cardId: pick(rng, props).id
			};
			const card = pick(rng, me.hand);
			switch (card.type) {
				case CARD_TYPES.MONEY: return {
					type: "PLAY_AS_MONEY",
					cardId: card.id
				};
				case CARD_TYPES.PROPERTY:
				case CARD_TYPES.WILD_PROPERTY: return {
					type: "PLAY_PROPERTY",
					cardId: card.id
				};
				case CARD_TYPES.RENT: {
					const colors = eligibleRentColors(me, card);
					if (colors.length === 0) return {
						type: "PLAY_AS_MONEY",
						cardId: card.id
					};
					const targetColor = pick(rng, colors);
					const others = s.players.map((_, i) => i).filter((i) => i !== s.currentPlayerIndex);
					const targetPlayerId = card.wild ? pick(rng, others) : void 0;
					return {
						type: "PLAY_RENT",
						cardId: card.id,
						targetColor,
						targetPlayerId
					};
				}
				case CARD_TYPES.ACTION:
					if (rng() < .5) return {
						type: "PLAY_AS_MONEY",
						cardId: card.id
					};
					return {
						type: "PLAY_ACTION",
						cardId: card.id
					};
				default: return { type: "END_TURN" };
			}
		}
		default: return { type: "_CANCEL_PENDING" };
	}
}
function runGame(seed, customCards, names) {
	const rng = makeRng(seed);
	let s = patchedGameReducer(null, {
		type: "_INIT",
		_state: initGame(names, { customCards })
	});
	const bugs = [];
	let steps = 0;
	const MAX_STEPS = 3e4;
	let lastAction = "INIT";
	let noProgress = 0;
	bugs.push(...checkInvariants(s, `seed ${seed} init`, customCards));
	while (steps < MAX_STEPS) {
		steps++;
		let action;
		try {
			action = nextAction(s, rng);
		} catch (e) {
			bugs.push(`[seed ${seed} step ${steps}] AGENT THREW after ${lastAction} (phase=${s.phase}): ${e.message}`);
			break;
		}
		if (action.done) break;
		let next;
		try {
			next = patchedGameReducer(s, action);
		} catch (e) {
			bugs.push(`[seed ${seed} step ${steps}] REDUCER THREW on ${action.type} (after ${lastAction}): ${e.message}`);
			break;
		}
		if (next === s) {
			noProgress++;
			if (noProgress > 40) {
				bugs.push(`[seed ${seed} step ${steps}] SOFT-LOCK: ${action.type} is a no-op (phase=${s.phase})`);
				break;
			}
		} else noProgress = 0;
		bugs.push(...checkInvariants(next, `seed ${seed} step ${steps} ${action.type}`, customCards));
		s = next;
		lastAction = action.type;
		if (s.phase === PHASE.GAME_OVER) break;
	}
	const stalled = steps >= MAX_STEPS;
	return {
		bugs,
		finished: s.phase === PHASE.GAME_OVER,
		stalled,
		steps,
		winner: s.winner?.name
	};
}
const GAMES = Number(process.env.GAMES || 100);
const NAMES = [
	"satvik",
	"sanika",
	"aman",
	"sonu",
	"priya",
	"rahul"
];
let totalBugs = 0;
const seen = /* @__PURE__ */ new Map();
let finishedCount = 0;
let stalledCount = 0;
let totalSteps = 0;
for (let i = 0; i < GAMES; i++) {
	const { bugs, finished, stalled, steps } = runGame(1e3 + i, i % 2 === 0, NAMES);
	if (finished) finishedCount++;
	if (stalled) stalledCount++;
	totalSteps += steps;
	for (const b of bugs) {
		totalBugs++;
		const key = b.replace(/\[[^\]]*\]\s*/, "");
		seen.set(key, (seen.get(key) || 0) + 1);
		if (seen.get(key) <= 3) console.log(b);
	}
}
console.log("\n──────── SIMULATION SUMMARY ────────");
console.log(`Games:           ${GAMES} (6 players, custom cards alternating)`);
console.log(`Finished (win):  ${finishedCount}/${GAMES}`);
console.log(`Stalled (cap):   ${stalledCount}/${GAMES}  (random agents, no winner — not a correctness bug)`);
console.log(`Avg steps/game:  ${Math.round(totalSteps / GAMES)}`);
console.log(`Total bug hits:  ${totalBugs}`);
if (seen.size === 0) console.log("Distinct issues: 0  ✓ all invariants held");
else {
	console.log(`Distinct issues: ${seen.size}`);
	console.log("\nIssue counts:");
	for (const [k, n] of [...seen.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${n}×  ${k}`);
	process.exitCode = 1;
}
//#endregion
export {};
