import { a as __toCommonJS, n as __esmMin, r as __exportAll, t as __commonJSMin } from "../_runtime.mjs";
import { a as require_assertThisInitialized, c as require_classCallCheck, d as require_asyncToGenerator, f as require_regenerator, i as require_possibleConstructorReturn, l as require_defineProperty, n as require_toConsumableArray, o as require_inherits, r as require_getPrototypeOf, s as require_createClass, t as require_get, u as require_slicedToArray } from "./babel__runtime.mjs";
//#region node_modules/core-js/internals/global-this.js
var require_global_this = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var check = function(it) {
		return it && it.Math === Math && it;
	};
	module.exports = check(typeof globalThis == "object" && globalThis) || check(typeof window == "object" && window) || check(typeof self == "object" && self) || check(typeof global == "object" && global) || check(typeof exports == "object" && exports) || (function() {
		return this;
	})() || Function("return this")();
}));
//#endregion
//#region node_modules/core-js/internals/is-pure.js
var require_is_pure = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = false;
}));
//#endregion
//#region node_modules/core-js/internals/define-global-property.js
var require_define_global_property = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var defineProperty = Object.defineProperty;
	module.exports = function(key, value) {
		try {
			defineProperty(globalThis, key, {
				value,
				configurable: true,
				writable: true
			});
		} catch (error) {
			globalThis[key] = value;
		}
		return value;
	};
}));
//#endregion
//#region node_modules/core-js/internals/shared-store.js
var require_shared_store = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var IS_PURE = require_is_pure();
	var globalThis = require_global_this();
	var defineGlobalProperty = require_define_global_property();
	var SHARED = "__core-js_shared__";
	var store = module.exports = globalThis[SHARED] || defineGlobalProperty(SHARED, {});
	(store.versions || (store.versions = [])).push({
		version: "3.50.0",
		mode: IS_PURE ? "pure" : "global",
		copyright: "© 2013–2025 Denis Pushkarev (zloirock.ru), 2025–2026 CoreJS Company (core-js.io). All rights reserved.",
		license: "https://github.com/zloirock/core-js/blob/v3.50.0/LICENSE",
		source: "https://github.com/zloirock/core-js"
	});
}));
//#endregion
//#region node_modules/core-js/internals/shared.js
var require_shared = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var store = require_shared_store();
	var create = Object.create || Object;
	module.exports = function(key, value) {
		return store[key] || (store[key] = value || create(null));
	};
}));
//#endregion
//#region node_modules/core-js/internals/fails.js
var require_fails = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function(exec) {
		try {
			return !!exec();
		} catch (error) {
			return true;
		}
	};
}));
//#endregion
//#region node_modules/core-js/internals/function-bind-native.js
var require_function_bind_native = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = !require_fails()(function() {
		var test = function() {}.bind();
		return typeof test != "function" || test.hasOwnProperty("prototype");
	});
}));
//#endregion
//#region node_modules/core-js/internals/function-uncurry-this.js
var require_function_uncurry_this = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var NATIVE_BIND = require_function_bind_native();
	var FunctionPrototype = Function.prototype;
	var call = FunctionPrototype.call;
	var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);
	module.exports = NATIVE_BIND ? uncurryThisWithBind : function(fn) {
		return function() {
			return call.apply(fn, arguments);
		};
	};
}));
//#endregion
//#region node_modules/core-js/internals/is-null-or-undefined.js
var require_is_null_or_undefined = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function(it) {
		return it === null || it === void 0;
	};
}));
//#endregion
//#region node_modules/core-js/internals/require-object-coercible.js
var require_require_object_coercible = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isNullOrUndefined = require_is_null_or_undefined();
	var $TypeError = TypeError;
	module.exports = function(it) {
		if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
		return it;
	};
}));
//#endregion
//#region node_modules/core-js/internals/to-object.js
var require_to_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var requireObjectCoercible = require_require_object_coercible();
	var $Object = Object;
	module.exports = function(argument) {
		return $Object(requireObjectCoercible(argument));
	};
}));
//#endregion
//#region node_modules/core-js/internals/has-own-property.js
var require_has_own_property = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this();
	var toObject = require_to_object();
	var hasOwnProperty = uncurryThis({}.hasOwnProperty);
	module.exports = Object.hasOwn || function hasOwn(it, key) {
		return hasOwnProperty(toObject(it), key);
	};
}));
//#endregion
//#region node_modules/core-js/internals/uid.js
var require_uid = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this();
	var id = 0;
	var postfix = Math.random();
	var toString = uncurryThis(1.1.toString);
	module.exports = function(key) {
		return "Symbol(" + (key === void 0 ? "" : key) + ")_" + toString(++id + postfix, 36);
	};
}));
//#endregion
//#region node_modules/core-js/internals/environment-user-agent.js
var require_environment_user_agent = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var navigator = require_global_this().navigator;
	var userAgent = navigator && navigator.userAgent;
	module.exports = userAgent ? String(userAgent) : "";
}));
//#endregion
//#region node_modules/core-js/internals/environment-v8-version.js
var require_environment_v8_version = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var userAgent = require_environment_user_agent();
	var process = globalThis.process;
	var Deno = globalThis.Deno;
	var versions = process && process.versions || Deno && Deno.version;
	var v8 = versions && versions.v8;
	var match;
	var version;
	if (v8) {
		match = v8.split(".");
		version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
	}
	if (!version && userAgent) {
		match = userAgent.match(/Edge\/(\d+)/);
		if (!match || match[1] >= 74) {
			match = userAgent.match(/Chrome\/(\d+)/);
			if (match) version = +match[1];
		}
	}
	module.exports = version;
}));
//#endregion
//#region node_modules/core-js/internals/symbol-constructor-detection.js
var require_symbol_constructor_detection = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var V8_VERSION = require_environment_v8_version();
	var fails = require_fails();
	var $String = require_global_this().String;
	module.exports = !!Object.getOwnPropertySymbols && !fails(function() {
		var symbol = Symbol("symbol detection");
		return !$String(symbol) || !(Object(symbol) instanceof Symbol) || !Symbol.sham && V8_VERSION && V8_VERSION < 41;
	});
}));
//#endregion
//#region node_modules/core-js/internals/use-symbol-as-uid.js
var require_use_symbol_as_uid = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_symbol_constructor_detection() && !Symbol.sham && typeof Symbol.iterator == "symbol";
}));
//#endregion
//#region node_modules/core-js/internals/well-known-symbol.js
var require_well_known_symbol = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var shared = require_shared();
	var hasOwn = require_has_own_property();
	var uid = require_uid();
	var NATIVE_SYMBOL = require_symbol_constructor_detection();
	var USE_SYMBOL_AS_UID = require_use_symbol_as_uid();
	var Symbol = globalThis.Symbol;
	var WellKnownSymbolsStore = shared("wks");
	var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol["for"] || Symbol : Symbol && Symbol.withoutSetter || uid;
	module.exports = function(name) {
		if (!hasOwn(WellKnownSymbolsStore, name)) WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol, name) ? Symbol[name] : createWellKnownSymbol("Symbol." + name);
		return WellKnownSymbolsStore[name];
	};
}));
//#endregion
//#region node_modules/core-js/internals/to-string-tag-support.js
var require_to_string_tag_support = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var TO_STRING_TAG = require_well_known_symbol()("toStringTag");
	var test = {};
	test[TO_STRING_TAG] = "z";
	module.exports = String(test) === "[object z]";
}));
//#endregion
//#region node_modules/core-js/internals/is-callable.js
var require_is_callable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var documentAll = typeof document == "object" && document.all;
	module.exports = typeof documentAll == "undefined" && documentAll !== void 0 ? function(argument) {
		return typeof argument == "function" || argument === documentAll;
	} : function(argument) {
		return typeof argument == "function";
	};
}));
//#endregion
//#region node_modules/core-js/internals/descriptors.js
var require_descriptors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = !require_fails()(function() {
		return Object.defineProperty({}, 1, { get: function() {
			return 7;
		} })[1] !== 7;
	});
}));
//#endregion
//#region node_modules/core-js/internals/is-object.js
var require_is_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isCallable = require_is_callable();
	module.exports = function(it) {
		return typeof it == "object" ? it !== null : isCallable(it);
	};
}));
//#endregion
//#region node_modules/core-js/internals/document-create-element.js
var require_document_create_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var isObject = require_is_object();
	var document = globalThis.document;
	var EXISTS = isObject(document) && isObject(document.createElement);
	module.exports = function(it) {
		return EXISTS ? document.createElement(it) : {};
	};
}));
//#endregion
//#region node_modules/core-js/internals/ie8-dom-define.js
var require_ie8_dom_define = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var DESCRIPTORS = require_descriptors();
	var fails = require_fails();
	var createElement = require_document_create_element();
	module.exports = !DESCRIPTORS && !fails(function() {
		return Object.defineProperty(createElement("div"), "a", { get: function() {
			return 7;
		} }).a !== 7;
	});
}));
//#endregion
//#region node_modules/core-js/internals/v8-prototype-define-bug.js
var require_v8_prototype_define_bug = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var DESCRIPTORS = require_descriptors();
	var fails = require_fails();
	module.exports = DESCRIPTORS && fails(function() {
		return Object.defineProperty(function() {}, "prototype", {
			value: 42,
			writable: false
		}).prototype !== 42;
	});
}));
//#endregion
//#region node_modules/core-js/internals/an-object.js
var require_an_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isObject = require_is_object();
	var $String = String;
	var $TypeError = TypeError;
	module.exports = function(argument) {
		if (isObject(argument)) return argument;
		throw new $TypeError($String(argument) + " is not an object");
	};
}));
//#endregion
//#region node_modules/core-js/internals/function-call.js
var require_function_call = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var NATIVE_BIND = require_function_bind_native();
	var call = Function.prototype.call;
	module.exports = NATIVE_BIND ? call.bind(call) : function() {
		return call.apply(call, arguments);
	};
}));
//#endregion
//#region node_modules/core-js/internals/get-built-in.js
var require_get_built_in = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var isCallable = require_is_callable();
	var aFunction = function(argument) {
		return isCallable(argument) ? argument : void 0;
	};
	module.exports = function(namespace, method) {
		return arguments.length < 2 ? aFunction(globalThis[namespace]) : globalThis[namespace] && globalThis[namespace][method];
	};
}));
//#endregion
//#region node_modules/core-js/internals/object-is-prototype-of.js
var require_object_is_prototype_of = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_function_uncurry_this()({}.isPrototypeOf);
}));
//#endregion
//#region node_modules/core-js/internals/is-symbol.js
var require_is_symbol = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getBuiltIn = require_get_built_in();
	var isCallable = require_is_callable();
	var isPrototypeOf = require_object_is_prototype_of();
	var USE_SYMBOL_AS_UID = require_use_symbol_as_uid();
	var $Object = Object;
	module.exports = USE_SYMBOL_AS_UID ? function(it) {
		return typeof it == "symbol";
	} : function(it) {
		var $Symbol = getBuiltIn("Symbol");
		return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
	};
}));
//#endregion
//#region node_modules/core-js/internals/try-to-string.js
var require_try_to_string = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var $String = String;
	module.exports = function(argument) {
		try {
			return $String(argument);
		} catch (error) {
			return "Object";
		}
	};
}));
//#endregion
//#region node_modules/core-js/internals/a-callable.js
var require_a_callable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isCallable = require_is_callable();
	var tryToString = require_try_to_string();
	var $TypeError = TypeError;
	module.exports = function(argument) {
		if (isCallable(argument)) return argument;
		throw new $TypeError(tryToString(argument) + " is not a function");
	};
}));
//#endregion
//#region node_modules/core-js/internals/get-method.js
var require_get_method = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var aCallable = require_a_callable();
	var isNullOrUndefined = require_is_null_or_undefined();
	module.exports = function(V, P) {
		var func = V[P];
		return isNullOrUndefined(func) ? void 0 : aCallable(func);
	};
}));
//#endregion
//#region node_modules/core-js/internals/ordinary-to-primitive.js
var require_ordinary_to_primitive = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var call = require_function_call();
	var isCallable = require_is_callable();
	var isObject = require_is_object();
	var $TypeError = TypeError;
	module.exports = function(input, pref) {
		var fn, val;
		if (pref === "string" && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
		if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
		if (pref !== "string" && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
		throw new $TypeError("Can't convert object to primitive value");
	};
}));
//#endregion
//#region node_modules/core-js/internals/to-primitive.js
var require_to_primitive = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var call = require_function_call();
	var isObject = require_is_object();
	var isSymbol = require_is_symbol();
	var getMethod = require_get_method();
	var ordinaryToPrimitive = require_ordinary_to_primitive();
	var wellKnownSymbol = require_well_known_symbol();
	var $TypeError = TypeError;
	var TO_PRIMITIVE = wellKnownSymbol("toPrimitive");
	module.exports = function(input, pref) {
		if (!isObject(input) || isSymbol(input)) return input;
		var exoticToPrim = getMethod(input, TO_PRIMITIVE);
		var result;
		if (exoticToPrim) {
			if (pref === void 0) pref = "default";
			result = call(exoticToPrim, input, pref);
			if (!isObject(result) || isSymbol(result)) return result;
			throw new $TypeError("Can't convert object to primitive value");
		}
		if (pref === void 0) pref = "number";
		return ordinaryToPrimitive(input, pref);
	};
}));
//#endregion
//#region node_modules/core-js/internals/to-property-key.js
var require_to_property_key = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var toPrimitive = require_to_primitive();
	var isSymbol = require_is_symbol();
	module.exports = function(argument) {
		var key = toPrimitive(argument, "string");
		return isSymbol(key) ? key : key + "";
	};
}));
//#endregion
//#region node_modules/core-js/internals/object-define-property.js
var require_object_define_property = /* @__PURE__ */ __commonJSMin(((exports) => {
	var DESCRIPTORS = require_descriptors();
	var IE8_DOM_DEFINE = require_ie8_dom_define();
	var V8_PROTOTYPE_DEFINE_BUG = require_v8_prototype_define_bug();
	var anObject = require_an_object();
	var toPropertyKey = require_to_property_key();
	var $TypeError = TypeError;
	var $defineProperty = Object.defineProperty;
	var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var ENUMERABLE = "enumerable";
	var CONFIGURABLE = "configurable";
	var WRITABLE = "writable";
	exports.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
		anObject(O);
		P = toPropertyKey(P);
		anObject(Attributes);
		if (typeof O === "function" && P === "prototype" && "value" in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
			var current = $getOwnPropertyDescriptor(O, P);
			if (current && current[WRITABLE]) {
				O[P] = Attributes.value;
				Attributes = {
					configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
					enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
					writable: false
				};
			}
		}
		return $defineProperty(O, P, Attributes);
	} : $defineProperty : function defineProperty(O, P, Attributes) {
		anObject(O);
		P = toPropertyKey(P);
		anObject(Attributes);
		if (IE8_DOM_DEFINE) try {
			return $defineProperty(O, P, Attributes);
		} catch (error) {}
		if ("get" in Attributes || "set" in Attributes) throw new $TypeError("Accessors not supported");
		if ("value" in Attributes) O[P] = Attributes.value;
		return O;
	};
}));
//#endregion
//#region node_modules/core-js/internals/function-name.js
var require_function_name = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var DESCRIPTORS = require_descriptors();
	var hasOwn = require_has_own_property();
	var FunctionPrototype = Function.prototype;
	var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;
	var EXISTS = hasOwn(FunctionPrototype, "name");
	module.exports = {
		EXISTS,
		PROPER: EXISTS && function something() {}.name === "something",
		CONFIGURABLE: EXISTS && (!DESCRIPTORS || DESCRIPTORS && getDescriptor(FunctionPrototype, "name").configurable)
	};
}));
//#endregion
//#region node_modules/core-js/internals/inspect-source.js
var require_inspect_source = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this();
	var isCallable = require_is_callable();
	var store = require_shared_store();
	var functionToString = uncurryThis(Function.toString);
	if (!isCallable(store.inspectSource)) store.inspectSource = function(it) {
		return functionToString(it);
	};
	module.exports = store.inspectSource;
}));
//#endregion
//#region node_modules/core-js/internals/weak-map-basic-detection.js
var require_weak_map_basic_detection = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var isCallable = require_is_callable();
	var WeakMap = globalThis.WeakMap;
	module.exports = isCallable(WeakMap) && /native code/.test(String(WeakMap));
}));
//#endregion
//#region node_modules/core-js/internals/create-property-descriptor.js
var require_create_property_descriptor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function(bitmap, value) {
		return {
			enumerable: !(bitmap & 1),
			configurable: !(bitmap & 2),
			writable: !(bitmap & 4),
			value
		};
	};
}));
//#endregion
//#region node_modules/core-js/internals/create-non-enumerable-property.js
var require_create_non_enumerable_property = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var DESCRIPTORS = require_descriptors();
	var definePropertyModule = require_object_define_property();
	var createPropertyDescriptor = require_create_property_descriptor();
	module.exports = DESCRIPTORS ? function(object, key, value) {
		return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
	} : function(object, key, value) {
		object[key] = value;
		return object;
	};
}));
//#endregion
//#region node_modules/core-js/internals/shared-key.js
var require_shared_key = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var shared = require_shared();
	var uid = require_uid();
	var keys = shared("keys");
	module.exports = function(key) {
		return keys[key] || (keys[key] = uid(key));
	};
}));
//#endregion
//#region node_modules/core-js/internals/hidden-keys.js
var require_hidden_keys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {};
}));
//#endregion
//#region node_modules/core-js/internals/internal-state.js
var require_internal_state = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var NATIVE_WEAK_MAP = require_weak_map_basic_detection();
	var globalThis = require_global_this();
	var isObject = require_is_object();
	var createNonEnumerableProperty = require_create_non_enumerable_property();
	var hasOwn = require_has_own_property();
	var shared = require_shared_store();
	var sharedKey = require_shared_key();
	var hiddenKeys = require_hidden_keys();
	var OBJECT_ALREADY_INITIALIZED = "Object already initialized";
	var TypeError = globalThis.TypeError;
	var WeakMap = globalThis.WeakMap;
	var set;
	var get;
	var has;
	var enforce = function(it) {
		return has(it) ? get(it) : set(it, {});
	};
	var getterFor = function(TYPE) {
		return function(it) {
			var state;
			if (!isObject(it) || (state = get(it)).type !== TYPE) throw new TypeError("Incompatible receiver, " + TYPE + " required");
			return state;
		};
	};
	if (NATIVE_WEAK_MAP || shared.state) {
		var store = shared.state || (shared.state = new WeakMap());
		store.get = store.get;
		store.has = store.has;
		store.set = store.set;
		set = function(it, metadata) {
			if (store.has(it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
			metadata.facade = it;
			store.set(it, metadata);
			return metadata;
		};
		get = function(it) {
			return store.get(it) || {};
		};
		has = function(it) {
			return store.has(it);
		};
	} else {
		var STATE = sharedKey("state");
		hiddenKeys[STATE] = true;
		set = function(it, metadata) {
			if (hasOwn(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
			metadata.facade = it;
			createNonEnumerableProperty(it, STATE, metadata);
			return metadata;
		};
		get = function(it) {
			return hasOwn(it, STATE) ? it[STATE] : {};
		};
		has = function(it) {
			return hasOwn(it, STATE);
		};
	}
	module.exports = {
		set,
		get,
		has,
		enforce,
		getterFor
	};
}));
//#endregion
//#region node_modules/core-js/internals/make-built-in.js
var require_make_built_in = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this();
	var fails = require_fails();
	var isCallable = require_is_callable();
	var hasOwn = require_has_own_property();
	var DESCRIPTORS = require_descriptors();
	var CONFIGURABLE_FUNCTION_NAME = require_function_name().CONFIGURABLE;
	var inspectSource = require_inspect_source();
	var InternalStateModule = require_internal_state();
	var enforceInternalState = InternalStateModule.enforce;
	var getInternalState = InternalStateModule.get;
	var $String = String;
	var defineProperty = Object.defineProperty;
	var stringSlice = uncurryThis("".slice);
	var replace = uncurryThis("".replace);
	var join = uncurryThis([].join);
	var CONFIGURABLE_LENGTH = DESCRIPTORS && !fails(function() {
		return defineProperty(function() {}, "length", { value: 8 }).length !== 8;
	});
	var TEMPLATE = String(String).split("String");
	var makeBuiltIn = module.exports = function(value, name, options) {
		if (stringSlice($String(name), 0, 7) === "Symbol(") name = "[" + replace($String(name), /^Symbol\(([^)]*)\).*$/, "$1") + "]";
		if (options && options.getter) name = "get " + name;
		if (options && options.setter) name = "set " + name;
		if (!hasOwn(value, "name") || CONFIGURABLE_FUNCTION_NAME && value.name !== name) {
			if (DESCRIPTORS) defineProperty(value, "name", {
				value: name,
				configurable: true
			});
			else value.name = name;
		}
		if (CONFIGURABLE_LENGTH && options && hasOwn(options, "arity") && value.length !== options.arity) defineProperty(value, "length", { value: options.arity });
		try {
			if (options && hasOwn(options, "constructor") && options.constructor) {
				if (DESCRIPTORS) defineProperty(value, "prototype", { writable: false });
			} else if (value.prototype) value.prototype = void 0;
		} catch (error) {}
		var state = enforceInternalState(value);
		if (!hasOwn(state, "source")) state.source = join(TEMPLATE, typeof name == "string" ? name : "");
		return value;
	};
	Function.prototype.toString = makeBuiltIn(function toString() {
		return isCallable(this) && getInternalState(this).source || inspectSource(this);
	}, "toString");
}));
//#endregion
//#region node_modules/core-js/internals/define-built-in.js
var require_define_built_in = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isCallable = require_is_callable();
	var definePropertyModule = require_object_define_property();
	var makeBuiltIn = require_make_built_in();
	var defineGlobalProperty = require_define_global_property();
	module.exports = function(O, key, value, options) {
		if (!options) options = {};
		var simple = options.enumerable;
		var name = options.name !== void 0 ? options.name : key;
		if (isCallable(value)) makeBuiltIn(value, name, options);
		if (options.global) {
			if (simple) O[key] = value;
			else defineGlobalProperty(key, value);
		} else {
			try {
				if (!options.unsafe) delete O[key];
				else if (O[key]) simple = true;
			} catch (error) {}
			if (simple) O[key] = value;
			else definePropertyModule.f(O, key, {
				value,
				enumerable: false,
				configurable: !options.nonConfigurable,
				writable: !options.nonWritable
			});
		}
		return O;
	};
}));
//#endregion
//#region node_modules/core-js/internals/classof-raw.js
var require_classof_raw = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this();
	var toString = uncurryThis({}.toString);
	var stringSlice = uncurryThis("".slice);
	module.exports = function(it) {
		return stringSlice(toString(it), 8, -1);
	};
}));
//#endregion
//#region node_modules/core-js/internals/classof.js
var require_classof = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var TO_STRING_TAG_SUPPORT = require_to_string_tag_support();
	var isCallable = require_is_callable();
	var classofRaw = require_classof_raw();
	var TO_STRING_TAG = require_well_known_symbol()("toStringTag");
	var $Object = Object;
	var CORRECT_ARGUMENTS = classofRaw(function() {
		return arguments;
	}()) === "Arguments";
	var tryGet = function(it, key) {
		try {
			return it[key];
		} catch (error) {}
	};
	module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function(it) {
		var O, tag, result;
		return it === void 0 ? "Undefined" : it === null ? "Null" : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == "string" ? tag : CORRECT_ARGUMENTS ? classofRaw(O) : (result = classofRaw(O)) === "Object" && isCallable(O.callee) ? "Arguments" : result;
	};
}));
//#endregion
//#region node_modules/core-js/internals/object-to-string.js
var require_object_to_string = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var TO_STRING_TAG_SUPPORT = require_to_string_tag_support();
	var classof = require_classof();
	module.exports = TO_STRING_TAG_SUPPORT ? {}.toString : function toString() {
		return "[object " + classof(this) + "]";
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.object.to-string.js
var require_es_object_to_string = /* @__PURE__ */ __commonJSMin((() => {
	var TO_STRING_TAG_SUPPORT = require_to_string_tag_support();
	var defineBuiltIn = require_define_built_in();
	var toString = require_object_to_string();
	if (!TO_STRING_TAG_SUPPORT) defineBuiltIn(Object.prototype, "toString", toString, { unsafe: true });
}));
//#endregion
//#region node_modules/core-js/internals/object-property-is-enumerable.js
var require_object_property_is_enumerable = /* @__PURE__ */ __commonJSMin(((exports) => {
	var $propertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	exports.f = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1) ? function propertyIsEnumerable(V) {
		var descriptor = getOwnPropertyDescriptor(this, V);
		return !!descriptor && descriptor.enumerable;
	} : $propertyIsEnumerable;
}));
//#endregion
//#region node_modules/core-js/internals/indexed-object.js
var require_indexed_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this();
	var fails = require_fails();
	var classof = require_classof_raw();
	var $Object = Object;
	var split = uncurryThis("".split);
	module.exports = fails(function() {
		return !$Object("z").propertyIsEnumerable(0);
	}) ? function(it) {
		return classof(it) === "String" ? split(it, "") : $Object(it);
	} : $Object;
}));
//#endregion
//#region node_modules/core-js/internals/to-indexed-object.js
var require_to_indexed_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var IndexedObject = require_indexed_object();
	var requireObjectCoercible = require_require_object_coercible();
	module.exports = function(it) {
		return IndexedObject(requireObjectCoercible(it));
	};
}));
//#endregion
//#region node_modules/core-js/internals/object-get-own-property-descriptor.js
var require_object_get_own_property_descriptor = /* @__PURE__ */ __commonJSMin(((exports) => {
	var DESCRIPTORS = require_descriptors();
	var call = require_function_call();
	var propertyIsEnumerableModule = require_object_property_is_enumerable();
	var createPropertyDescriptor = require_create_property_descriptor();
	var toIndexedObject = require_to_indexed_object();
	var toPropertyKey = require_to_property_key();
	var hasOwn = require_has_own_property();
	var IE8_DOM_DEFINE = require_ie8_dom_define();
	var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
		O = toIndexedObject(O);
		P = toPropertyKey(P);
		if (IE8_DOM_DEFINE) try {
			return $getOwnPropertyDescriptor(O, P);
		} catch (error) {}
		if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
	};
}));
//#endregion
//#region node_modules/core-js/internals/math-trunc.js
var require_math_trunc = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ceil = Math.ceil;
	var floor = Math.floor;
	module.exports = Math.trunc || function trunc(x) {
		var n = +x;
		return (n > 0 ? floor : ceil)(n);
	};
}));
//#endregion
//#region node_modules/core-js/internals/to-integer-or-infinity.js
var require_to_integer_or_infinity = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var trunc = require_math_trunc();
	module.exports = function(argument) {
		var number = +argument;
		return number !== number || number === 0 ? 0 : trunc(number);
	};
}));
//#endregion
//#region node_modules/core-js/internals/to-absolute-index.js
var require_to_absolute_index = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var toIntegerOrInfinity = require_to_integer_or_infinity();
	var max = Math.max;
	var min = Math.min;
	module.exports = function(index, length) {
		var integer = toIntegerOrInfinity(index);
		return integer < 0 ? max(integer + length, 0) : min(integer, length);
	};
}));
//#endregion
//#region node_modules/core-js/internals/to-length.js
var require_to_length = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var toIntegerOrInfinity = require_to_integer_or_infinity();
	var min = Math.min;
	module.exports = function(argument) {
		var len = toIntegerOrInfinity(argument);
		return len > 0 ? min(len, 9007199254740991) : 0;
	};
}));
//#endregion
//#region node_modules/core-js/internals/length-of-array-like.js
var require_length_of_array_like = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var toLength = require_to_length();
	module.exports = function(obj) {
		return toLength(obj.length);
	};
}));
//#endregion
//#region node_modules/core-js/internals/array-includes.js
var require_array_includes = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var toIndexedObject = require_to_indexed_object();
	var toAbsoluteIndex = require_to_absolute_index();
	var lengthOfArrayLike = require_length_of_array_like();
	var createMethod = function(IS_INCLUDES) {
		return function($this, el, fromIndex) {
			var O = toIndexedObject($this);
			var length = lengthOfArrayLike(O);
			if (length === 0) return !IS_INCLUDES && -1;
			var index = toAbsoluteIndex(fromIndex, length);
			var value;
			if (IS_INCLUDES && el !== el) while (length > index) {
				value = O[index++];
				if (value !== value) return true;
			}
			else for (; length > index; index++) if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
			return !IS_INCLUDES && -1;
		};
	};
	module.exports = {
		includes: createMethod(true),
		indexOf: createMethod(false)
	};
}));
//#endregion
//#region node_modules/core-js/internals/object-keys-internal.js
var require_object_keys_internal = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this();
	var hasOwn = require_has_own_property();
	var toIndexedObject = require_to_indexed_object();
	var indexOf = require_array_includes().indexOf;
	var hiddenKeys = require_hidden_keys();
	var push = uncurryThis([].push);
	module.exports = function(object, names) {
		var O = toIndexedObject(object);
		var i = 0;
		var result = [];
		var key;
		for (key in O) !hasOwn(hiddenKeys, key) && hasOwn(O, key) && push(result, key);
		while (names.length > i) if (hasOwn(O, key = names[i++])) ~indexOf(result, key) || push(result, key);
		return result;
	};
}));
//#endregion
//#region node_modules/core-js/internals/enum-bug-keys.js
var require_enum_bug_keys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = [
		"constructor",
		"hasOwnProperty",
		"isPrototypeOf",
		"propertyIsEnumerable",
		"toLocaleString",
		"toString",
		"valueOf"
	];
}));
//#endregion
//#region node_modules/core-js/internals/object-get-own-property-names.js
var require_object_get_own_property_names = /* @__PURE__ */ __commonJSMin(((exports) => {
	var internalObjectKeys = require_object_keys_internal();
	var hiddenKeys = require_enum_bug_keys().concat("length", "prototype");
	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
		return internalObjectKeys(O, hiddenKeys);
	};
}));
//#endregion
//#region node_modules/core-js/internals/object-get-own-property-symbols.js
var require_object_get_own_property_symbols = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.f = Object.getOwnPropertySymbols;
}));
//#endregion
//#region node_modules/core-js/internals/own-keys.js
var require_own_keys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getBuiltIn = require_get_built_in();
	var uncurryThis = require_function_uncurry_this();
	var getOwnPropertyNamesModule = require_object_get_own_property_names();
	var getOwnPropertySymbolsModule = require_object_get_own_property_symbols();
	var anObject = require_an_object();
	var concat = uncurryThis([].concat);
	module.exports = getBuiltIn("Reflect", "ownKeys") || function ownKeys(it) {
		var keys = getOwnPropertyNamesModule.f(anObject(it));
		var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
		return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
	};
}));
//#endregion
//#region node_modules/core-js/internals/copy-constructor-properties.js
var require_copy_constructor_properties = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var hasOwn = require_has_own_property();
	var ownKeys = require_own_keys();
	var getOwnPropertyDescriptorModule = require_object_get_own_property_descriptor();
	var definePropertyModule = require_object_define_property();
	module.exports = function(target, source, exceptions) {
		var keys = ownKeys(source);
		var defineProperty = definePropertyModule.f;
		var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
		}
	};
}));
//#endregion
//#region node_modules/core-js/internals/is-forced.js
var require_is_forced = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fails = require_fails();
	var isCallable = require_is_callable();
	var replacement = /#|\.prototype\./;
	var isForced = function(feature, detection) {
		var value = data[normalize(feature)];
		return value === POLYFILL ? true : value === NATIVE ? false : isCallable(detection) ? fails(detection) : !!detection;
	};
	var normalize = isForced.normalize = function(string) {
		return String(string).replace(replacement, ".").toLowerCase();
	};
	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = "N";
	var POLYFILL = isForced.POLYFILL = "P";
	module.exports = isForced;
}));
//#endregion
//#region node_modules/core-js/internals/export.js
var require_export = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var getOwnPropertyDescriptor = require_object_get_own_property_descriptor().f;
	var createNonEnumerableProperty = require_create_non_enumerable_property();
	var defineBuiltIn = require_define_built_in();
	var defineGlobalProperty = require_define_global_property();
	var copyConstructorProperties = require_copy_constructor_properties();
	var isForced = require_is_forced();
	module.exports = function(options, source) {
		var TARGET = options.target;
		var GLOBAL = options.global;
		var STATIC = options.stat;
		var FORCED, target, key, targetProperty, sourceProperty, descriptor;
		if (GLOBAL) target = globalThis;
		else if (STATIC) target = globalThis[TARGET] || defineGlobalProperty(TARGET, {});
		else target = globalThis[TARGET] && globalThis[TARGET].prototype;
		if (target) for (key in source) {
			sourceProperty = source[key];
			if (options.dontCallGetSet) {
				descriptor = getOwnPropertyDescriptor(target, key);
				targetProperty = descriptor && descriptor.value;
			} else targetProperty = target[key];
			FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? "." : "#") + key, options.forced);
			if (!FORCED && targetProperty !== void 0) {
				if (typeof sourceProperty == typeof targetProperty) continue;
				copyConstructorProperties(sourceProperty, targetProperty);
			}
			if (options.sham || targetProperty && targetProperty.sham) createNonEnumerableProperty(sourceProperty, "sham", true);
			defineBuiltIn(target, key, sourceProperty, options);
		}
	};
}));
//#endregion
//#region node_modules/core-js/internals/environment.js
var require_environment = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var userAgent = require_environment_user_agent();
	var classof = require_classof_raw();
	var userAgentStartsWith = function(string) {
		return userAgent.slice(0, string.length) === string;
	};
	module.exports = (function() {
		if (userAgentStartsWith("Bun/")) return "BUN";
		if (userAgentStartsWith("Cloudflare-Workers")) return "CLOUDFLARE";
		if (userAgentStartsWith("Deno/")) return "DENO";
		if (userAgentStartsWith("Node.js/")) return "NODE";
		if (globalThis.Bun && typeof Bun.version == "string") return "BUN";
		if (globalThis.Deno && typeof Deno.version == "object") return "DENO";
		if (classof(globalThis.process) === "process") return "NODE";
		if (globalThis.window && globalThis.document) return "BROWSER";
		return "REST";
	})();
}));
//#endregion
//#region node_modules/core-js/internals/environment-is-node.js
var require_environment_is_node = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_environment() === "NODE";
}));
//#endregion
//#region node_modules/core-js/internals/path.js
var require_path = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_global_this();
}));
//#endregion
//#region node_modules/core-js/internals/function-uncurry-this-accessor.js
var require_function_uncurry_this_accessor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this();
	var aCallable = require_a_callable();
	module.exports = function(object, key, method) {
		try {
			return uncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
		} catch (error) {}
	};
}));
//#endregion
//#region node_modules/core-js/internals/is-possible-prototype.js
var require_is_possible_prototype = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isObject = require_is_object();
	module.exports = function(argument) {
		return isObject(argument) || argument === null;
	};
}));
//#endregion
//#region node_modules/core-js/internals/a-possible-prototype.js
var require_a_possible_prototype = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isPossiblePrototype = require_is_possible_prototype();
	var $String = String;
	var $TypeError = TypeError;
	module.exports = function(argument) {
		if (isPossiblePrototype(argument)) return argument;
		throw new $TypeError("Can't set " + $String(argument) + " as a prototype");
	};
}));
//#endregion
//#region node_modules/core-js/internals/object-set-prototype-of.js
var require_object_set_prototype_of = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThisAccessor = require_function_uncurry_this_accessor();
	var isObject = require_is_object();
	var requireObjectCoercible = require_require_object_coercible();
	var aPossiblePrototype = require_a_possible_prototype();
	module.exports = Object.setPrototypeOf || ("__proto__" in {} ? function() {
		var CORRECT_SETTER = false;
		var test = {};
		var setter;
		try {
			setter = uncurryThisAccessor(Object.prototype, "__proto__", "set");
			setter(test, []);
			CORRECT_SETTER = test instanceof Array;
		} catch (error) {}
		return function setPrototypeOf(O, proto) {
			requireObjectCoercible(O);
			aPossiblePrototype(proto);
			if (!isObject(O)) return O;
			if (CORRECT_SETTER) setter(O, proto);
			else O.__proto__ = proto;
			return O;
		};
	}() : void 0);
}));
//#endregion
//#region node_modules/core-js/internals/set-to-string-tag.js
var require_set_to_string_tag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var defineProperty = require_object_define_property().f;
	var hasOwn = require_has_own_property();
	var TO_STRING_TAG = require_well_known_symbol()("toStringTag");
	module.exports = function(target, TAG, STATIC) {
		if (target && !STATIC) target = target.prototype;
		if (target && !hasOwn(target, TO_STRING_TAG)) defineProperty(target, TO_STRING_TAG, {
			configurable: true,
			value: TAG
		});
	};
}));
//#endregion
//#region node_modules/core-js/internals/define-built-in-accessor.js
var require_define_built_in_accessor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var makeBuiltIn = require_make_built_in();
	var defineProperty = require_object_define_property();
	module.exports = function(target, name, descriptor) {
		if (descriptor.get) makeBuiltIn(descriptor.get, name, { getter: true });
		if (descriptor.set) makeBuiltIn(descriptor.set, name, { setter: true });
		return defineProperty.f(target, name, descriptor);
	};
}));
//#endregion
//#region node_modules/core-js/internals/set-species.js
var require_set_species = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getBuiltIn = require_get_built_in();
	var defineBuiltInAccessor = require_define_built_in_accessor();
	var wellKnownSymbol = require_well_known_symbol();
	var DESCRIPTORS = require_descriptors();
	var SPECIES = wellKnownSymbol("species");
	module.exports = function(CONSTRUCTOR_NAME) {
		var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
		if (DESCRIPTORS && Constructor && !Constructor[SPECIES]) defineBuiltInAccessor(Constructor, SPECIES, {
			configurable: true,
			get: function() {
				return this;
			}
		});
	};
}));
//#endregion
//#region node_modules/core-js/internals/an-instance.js
var require_an_instance = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isPrototypeOf = require_object_is_prototype_of();
	var $TypeError = TypeError;
	module.exports = function(it, Prototype) {
		if (isPrototypeOf(Prototype, it)) return it;
		throw new $TypeError("Incorrect invocation");
	};
}));
//#endregion
//#region node_modules/core-js/internals/is-constructor.js
var require_is_constructor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this();
	var fails = require_fails();
	var isCallable = require_is_callable();
	var classof = require_classof();
	var getBuiltIn = require_get_built_in();
	var inspectSource = require_inspect_source();
	var noop = function() {};
	var construct = getBuiltIn("Reflect", "construct");
	var constructorRegExp = /^\s*(?:class|function)\b/;
	var exec = uncurryThis(constructorRegExp.exec);
	var INCORRECT_TO_STRING = !constructorRegExp.test(noop);
	var isConstructorModern = function isConstructor(argument) {
		if (!isCallable(argument)) return false;
		try {
			construct(noop, [], argument);
			return true;
		} catch (error) {
			return false;
		}
	};
	var isConstructorLegacy = function isConstructor(argument) {
		if (!isCallable(argument)) return false;
		switch (classof(argument)) {
			case "AsyncFunction":
			case "GeneratorFunction":
			case "AsyncGeneratorFunction": return false;
		}
		try {
			return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
		} catch (error) {
			return true;
		}
	};
	isConstructorLegacy.sham = true;
	module.exports = !construct || fails(function() {
		var called;
		return isConstructorModern(isConstructorModern.call) || !isConstructorModern(Object) || !isConstructorModern(function() {
			called = true;
		}) || called;
	}) ? isConstructorLegacy : isConstructorModern;
}));
//#endregion
//#region node_modules/core-js/internals/a-constructor.js
var require_a_constructor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isConstructor = require_is_constructor();
	var tryToString = require_try_to_string();
	var $TypeError = TypeError;
	module.exports = function(argument) {
		if (isConstructor(argument)) return argument;
		throw new $TypeError(tryToString(argument) + " is not a constructor");
	};
}));
//#endregion
//#region node_modules/core-js/internals/species-constructor.js
var require_species_constructor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var anObject = require_an_object();
	var aConstructor = require_a_constructor();
	var isNullOrUndefined = require_is_null_or_undefined();
	var SPECIES = require_well_known_symbol()("species");
	module.exports = function(O, defaultConstructor) {
		var C = anObject(O).constructor;
		var S;
		return C === void 0 || isNullOrUndefined(S = anObject(C)[SPECIES]) ? defaultConstructor : aConstructor(S);
	};
}));
//#endregion
//#region node_modules/core-js/internals/function-apply.js
var require_function_apply = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var NATIVE_BIND = require_function_bind_native();
	var FunctionPrototype = Function.prototype;
	var apply = FunctionPrototype.apply;
	var call = FunctionPrototype.call;
	module.exports = typeof Reflect == "object" && Reflect.apply || (NATIVE_BIND ? call.bind(apply) : function() {
		return call.apply(apply, arguments);
	});
}));
//#endregion
//#region node_modules/core-js/internals/function-uncurry-this-clause.js
var require_function_uncurry_this_clause = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var classofRaw = require_classof_raw();
	var uncurryThis = require_function_uncurry_this();
	module.exports = function(fn) {
		if (classofRaw(fn) === "Function") return uncurryThis(fn);
	};
}));
//#endregion
//#region node_modules/core-js/internals/function-bind-context.js
var require_function_bind_context = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this_clause();
	var aCallable = require_a_callable();
	var NATIVE_BIND = require_function_bind_native();
	var bind = uncurryThis(uncurryThis.bind);
	module.exports = function(fn, that) {
		aCallable(fn);
		return that === void 0 ? fn : NATIVE_BIND ? bind(fn, that) : function() {
			return fn.apply(that, arguments);
		};
	};
}));
//#endregion
//#region node_modules/core-js/internals/html.js
var require_html = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_get_built_in()("document", "documentElement");
}));
//#endregion
//#region node_modules/core-js/internals/array-slice.js
var require_array_slice = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_function_uncurry_this()([].slice);
}));
//#endregion
//#region node_modules/core-js/internals/validate-arguments-length.js
var require_validate_arguments_length = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var $TypeError = TypeError;
	module.exports = function(passed, required) {
		if (passed < required) throw new $TypeError("Not enough arguments");
		return passed;
	};
}));
//#endregion
//#region node_modules/core-js/internals/environment-is-ios.js
var require_environment_is_ios = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var userAgent = require_environment_user_agent();
	module.exports = /ipad|iphone|ipod/i.test(userAgent) && /applewebkit/i.test(userAgent);
}));
//#endregion
//#region node_modules/core-js/internals/task.js
var require_task = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var apply = require_function_apply();
	var bind = require_function_bind_context();
	var isCallable = require_is_callable();
	var hasOwn = require_has_own_property();
	var fails = require_fails();
	var html = require_html();
	var arraySlice = require_array_slice();
	var createElement = require_document_create_element();
	var validateArgumentsLength = require_validate_arguments_length();
	var IS_IOS = require_environment_is_ios();
	var IS_NODE = require_environment_is_node();
	var set = globalThis.setImmediate;
	var clear = globalThis.clearImmediate;
	var process = globalThis.process;
	var Dispatch = globalThis.Dispatch;
	var Function = globalThis.Function;
	var MessageChannel = globalThis.MessageChannel;
	var String = globalThis.String;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = "onreadystatechange";
	var $location;
	var defer;
	var channel;
	var port;
	fails(function() {
		$location = globalThis.location;
	});
	var run = function(id) {
		if (hasOwn(queue, id)) {
			var fn = queue[id];
			delete queue[id];
			fn();
		}
	};
	var runner = function(id) {
		return function() {
			run(id);
		};
	};
	var eventListener = function(event) {
		run(event.data);
	};
	var globalPostMessageDefer = function(id) {
		globalThis.postMessage(String(id), $location.protocol + "//" + $location.host);
	};
	if (!set || !clear) {
		set = function setImmediate(handler) {
			validateArgumentsLength(arguments.length, 1);
			var fn = isCallable(handler) ? handler : Function(handler);
			var args = arraySlice(arguments, 1);
			queue[++counter] = function() {
				apply(fn, void 0, args);
			};
			defer(counter);
			return counter;
		};
		clear = function clearImmediate(id) {
			delete queue[id];
		};
		if (IS_NODE) defer = function(id) {
			process.nextTick(runner(id));
		};
		else if (Dispatch && Dispatch.now) defer = function(id) {
			Dispatch.now(runner(id));
		};
		else if (MessageChannel && !IS_IOS) {
			channel = new MessageChannel();
			port = channel.port2;
			channel.port1.onmessage = eventListener;
			defer = bind(port.postMessage, port);
		} else if (globalThis.addEventListener && isCallable(globalThis.postMessage) && !globalThis.importScripts && $location && $location.protocol !== "file:" && !fails(globalPostMessageDefer)) {
			defer = globalPostMessageDefer;
			globalThis.addEventListener("message", eventListener, false);
		} else if (ONREADYSTATECHANGE in createElement("script")) defer = function(id) {
			html.appendChild(createElement("script"))[ONREADYSTATECHANGE] = function() {
				html.removeChild(this);
				run(id);
			};
		};
		else defer = function(id) {
			setTimeout(runner(id), 0);
		};
	}
	module.exports = {
		set,
		clear
	};
}));
//#endregion
//#region node_modules/core-js/internals/safe-get-built-in.js
var require_safe_get_built_in = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var DESCRIPTORS = require_descriptors();
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	module.exports = function(name) {
		if (!DESCRIPTORS) return globalThis[name];
		var descriptor = getOwnPropertyDescriptor(globalThis, name);
		return descriptor && descriptor.value;
	};
}));
//#endregion
//#region node_modules/core-js/internals/queue.js
var require_queue = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Queue = function() {
		this.head = null;
		this.tail = null;
	};
	Queue.prototype = {
		add: function(item) {
			var entry = {
				item,
				next: null
			};
			var tail = this.tail;
			if (tail) tail.next = entry;
			else this.head = entry;
			this.tail = entry;
		},
		get: function() {
			var entry = this.head;
			if (entry) {
				if ((this.head = entry.next) === null) this.tail = null;
				return entry.item;
			}
		}
	};
	module.exports = Queue;
}));
//#endregion
//#region node_modules/core-js/internals/environment-is-ios-pebble.js
var require_environment_is_ios_pebble = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var userAgent = require_environment_user_agent();
	module.exports = /ipad|iphone|ipod/i.test(userAgent) && typeof Pebble != "undefined";
}));
//#endregion
//#region node_modules/core-js/internals/environment-is-webos-webkit.js
var require_environment_is_webos_webkit = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var userAgent = require_environment_user_agent();
	module.exports = /web0s(?!.*chrome)/i.test(userAgent);
}));
//#endregion
//#region node_modules/core-js/internals/microtask.js
var require_microtask = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var safeGetBuiltIn = require_safe_get_built_in();
	var bind = require_function_bind_context();
	var macrotask = require_task().set;
	var Queue = require_queue();
	var IS_IOS = require_environment_is_ios();
	var IS_IOS_PEBBLE = require_environment_is_ios_pebble();
	var IS_WEBOS_WEBKIT = require_environment_is_webos_webkit();
	var IS_NODE = require_environment_is_node();
	var MutationObserver = globalThis.MutationObserver || globalThis.WebKitMutationObserver;
	var document = globalThis.document;
	var process = globalThis.process;
	var Promise = globalThis.Promise;
	var microtask = safeGetBuiltIn("queueMicrotask");
	var notify;
	var toggle;
	var node;
	var promise;
	var then;
	if (!microtask) {
		var queue = new Queue();
		var flush = function() {
			var parent, fn;
			if (IS_NODE && (parent = process.domain)) parent.exit();
			while (fn = queue.get()) try {
				fn();
			} catch (error) {
				if (queue.head) notify();
				throw error;
			}
			if (parent) parent.enter();
		};
		if (!IS_IOS && !IS_NODE && !IS_WEBOS_WEBKIT && MutationObserver && document) {
			toggle = true;
			node = document.createTextNode("");
			new MutationObserver(flush).observe(node, { characterData: true });
			notify = function() {
				node.data = toggle = !toggle;
			};
		} else if (!IS_IOS_PEBBLE && Promise && Promise.resolve) {
			promise = Promise.resolve(void 0);
			promise.constructor = Promise;
			then = bind(promise.then, promise);
			notify = function() {
				then(flush);
			};
		} else if (IS_NODE) notify = function() {
			process.nextTick(flush);
		};
		else {
			macrotask = bind(macrotask, globalThis);
			notify = function() {
				macrotask(flush);
			};
		}
		microtask = function(fn) {
			if (!queue.head) notify();
			queue.add(fn);
		};
	}
	module.exports = microtask;
}));
//#endregion
//#region node_modules/core-js/internals/host-report-errors.js
var require_host_report_errors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function(a, b) {
		try {
			arguments.length === 1 ? console.error(a) : console.error(a, b);
		} catch (error) {}
	};
}));
//#endregion
//#region node_modules/core-js/internals/perform.js
var require_perform = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function(exec) {
		try {
			return {
				error: false,
				value: exec()
			};
		} catch (error) {
			return {
				error: true,
				value: error
			};
		}
	};
}));
//#endregion
//#region node_modules/core-js/internals/promise-native-constructor.js
var require_promise_native_constructor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_global_this().Promise;
}));
//#endregion
//#region node_modules/core-js/internals/promise-constructor-detection.js
var require_promise_constructor_detection = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var NativePromiseConstructor = require_promise_native_constructor();
	var isCallable = require_is_callable();
	var isForced = require_is_forced();
	var inspectSource = require_inspect_source();
	var wellKnownSymbol = require_well_known_symbol();
	var ENVIRONMENT = require_environment();
	var IS_PURE = require_is_pure();
	var V8_VERSION = require_environment_v8_version();
	var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;
	var SPECIES = wellKnownSymbol("species");
	var SUBCLASSING = false;
	var NATIVE_PROMISE_REJECTION_EVENT = isCallable(globalThis.PromiseRejectionEvent);
	module.exports = {
		CONSTRUCTOR: isForced("Promise", function() {
			var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(NativePromiseConstructor);
			var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(NativePromiseConstructor);
			if (!GLOBAL_CORE_JS_PROMISE && V8_VERSION === 66) return true;
			if (IS_PURE && !(NativePromisePrototype["catch"] && NativePromisePrototype["finally"])) return true;
			if (!V8_VERSION || V8_VERSION < 51 || !/native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) {
				var promise = new NativePromiseConstructor(function(resolve) {
					resolve(1);
				});
				var FakePromise = function(exec) {
					exec(function() {}, function() {});
				};
				var constructor = promise.constructor = {};
				constructor[SPECIES] = FakePromise;
				SUBCLASSING = promise.then(function() {}) instanceof FakePromise;
				if (!SUBCLASSING) return true;
			}
			return !GLOBAL_CORE_JS_PROMISE && (ENVIRONMENT === "BROWSER" || ENVIRONMENT === "DENO") && !NATIVE_PROMISE_REJECTION_EVENT;
		}),
		REJECTION_EVENT: NATIVE_PROMISE_REJECTION_EVENT,
		SUBCLASSING
	};
}));
//#endregion
//#region node_modules/core-js/internals/new-promise-capability.js
var require_new_promise_capability = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var aCallable = require_a_callable();
	var $TypeError = TypeError;
	var PromiseCapability = function(C) {
		var resolve, reject;
		this.promise = new C(function($$resolve, $$reject) {
			if (resolve !== void 0 || reject !== void 0) throw new $TypeError("Bad Promise constructor");
			resolve = $$resolve;
			reject = $$reject;
		});
		this.resolve = aCallable(resolve);
		this.reject = aCallable(reject);
	};
	module.exports.f = function(C) {
		return new PromiseCapability(C);
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.promise.constructor.js
var require_es_promise_constructor = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var IS_PURE = require_is_pure();
	var IS_NODE = require_environment_is_node();
	var globalThis = require_global_this();
	var path = require_path();
	var call = require_function_call();
	var defineBuiltIn = require_define_built_in();
	var setPrototypeOf = require_object_set_prototype_of();
	var setToStringTag = require_set_to_string_tag();
	var setSpecies = require_set_species();
	var aCallable = require_a_callable();
	var isCallable = require_is_callable();
	var isObject = require_is_object();
	var anInstance = require_an_instance();
	var speciesConstructor = require_species_constructor();
	var task = require_task().set;
	var microtask = require_microtask();
	var hostReportErrors = require_host_report_errors();
	var perform = require_perform();
	var Queue = require_queue();
	var InternalStateModule = require_internal_state();
	var NativePromiseConstructor = require_promise_native_constructor();
	var PromiseConstructorDetection = require_promise_constructor_detection();
	var newPromiseCapabilityModule = require_new_promise_capability();
	var PROMISE = "Promise";
	var FORCED_PROMISE_CONSTRUCTOR = PromiseConstructorDetection.CONSTRUCTOR;
	var NATIVE_PROMISE_REJECTION_EVENT = PromiseConstructorDetection.REJECTION_EVENT;
	var NATIVE_PROMISE_SUBCLASSING = PromiseConstructorDetection.SUBCLASSING;
	var getInternalPromiseState = InternalStateModule.getterFor(PROMISE);
	var setInternalState = InternalStateModule.set;
	var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;
	var PromiseConstructor = NativePromiseConstructor;
	var PromisePrototype = NativePromisePrototype;
	var TypeError = globalThis.TypeError;
	var document = globalThis.document;
	var process = globalThis.process;
	var newPromiseCapability = newPromiseCapabilityModule.f;
	var newGenericPromiseCapability = newPromiseCapability;
	var DISPATCH_EVENT = !!(document && document.createEvent && globalThis.dispatchEvent);
	var UNHANDLED_REJECTION = "unhandledrejection";
	var REJECTION_HANDLED = "rejectionhandled";
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;
	var Internal;
	var OwnPromiseCapability;
	var PromiseWrapper;
	var nativeThen;
	var isThenable = function(it) {
		var then;
		return isObject(it) && isCallable(then = it.then) ? then : false;
	};
	var callReaction = function(reaction, state) {
		var value = state.value;
		var ok = state.state === FULFILLED;
		var handler = ok ? reaction.ok : reaction.fail;
		var resolve = reaction.resolve;
		var reject = reaction.reject;
		var domain = reaction.domain;
		var result, then, exited;
		try {
			if (handler) {
				if (!ok) {
					if (state.rejection === UNHANDLED) onHandleUnhandled(state);
					state.rejection = HANDLED;
				}
				if (handler === true) result = value;
				else {
					if (domain) domain.enter();
					result = handler(value);
					if (domain) {
						domain.exit();
						exited = true;
					}
				}
				if (result === reaction.promise) reject(new TypeError("Promise-chain cycle"));
				else if (then = isThenable(result)) call(then, result, resolve, reject);
				else resolve(result);
			} else reject(value);
		} catch (error) {
			if (domain && !exited) domain.exit();
			reject(error);
		}
	};
	var notify = function(state, isReject) {
		if (state.notified) return;
		state.notified = true;
		microtask(function() {
			var reactions = state.reactions;
			var reaction;
			while (reaction = reactions.get()) callReaction(reaction, state);
			state.notified = false;
			if (isReject && !state.rejection) onUnhandled(state);
		});
	};
	var dispatchEvent = function(name, promise, reason) {
		var event, handler;
		if (DISPATCH_EVENT) {
			event = document.createEvent("Event");
			event.promise = promise;
			event.reason = reason;
			event.initEvent(name, false, true);
			globalThis.dispatchEvent(event);
		} else event = {
			promise,
			reason
		};
		if (!NATIVE_PROMISE_REJECTION_EVENT && (handler = globalThis["on" + name])) handler(event);
		else if (name === UNHANDLED_REJECTION) hostReportErrors("Unhandled promise rejection", reason);
	};
	var onUnhandled = function(state) {
		call(task, globalThis, function() {
			var promise = state.facade;
			var value = state.value;
			var IS_UNHANDLED = isUnhandled(state);
			var result;
			if (IS_UNHANDLED) {
				result = perform(function() {
					if (IS_NODE) process.emit("unhandledRejection", value, promise);
					else dispatchEvent(UNHANDLED_REJECTION, promise, value);
				});
				state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
				if (result.error) throw result.value;
			}
		});
	};
	var isUnhandled = function(state) {
		return state.rejection !== HANDLED && !state.parent;
	};
	var onHandleUnhandled = function(state) {
		call(task, globalThis, function() {
			var promise = state.facade;
			if (IS_NODE) process.emit("rejectionHandled", promise);
			else dispatchEvent(REJECTION_HANDLED, promise, state.value);
		});
	};
	var bind = function(fn, state, unwrap) {
		return function(value) {
			fn(state, value, unwrap);
		};
	};
	var internalReject = function(state, value, unwrap) {
		if (state.done) return;
		state.done = true;
		if (unwrap) state = unwrap;
		state.value = value;
		state.state = REJECTED;
		notify(state, true);
	};
	var internalResolve = function(state, value, unwrap) {
		if (state.done) return;
		state.done = true;
		if (unwrap) state = unwrap;
		try {
			if (state.facade === value) throw new TypeError("Promise can't be resolved itself");
			var then = isThenable(value);
			if (then) microtask(function() {
				var wrapper = { done: false };
				try {
					call(then, value, bind(internalResolve, wrapper, state), bind(internalReject, wrapper, state));
				} catch (error) {
					internalReject(wrapper, error, state);
				}
			});
			else {
				state.value = value;
				state.state = FULFILLED;
				notify(state, false);
			}
		} catch (error) {
			internalReject({ done: false }, error, state);
		}
	};
	if (FORCED_PROMISE_CONSTRUCTOR) {
		PromiseConstructor = function Promise(executor) {
			anInstance(this, PromisePrototype);
			aCallable(executor);
			call(Internal, this);
			var state = getInternalPromiseState(this);
			try {
				executor(bind(internalResolve, state), bind(internalReject, state));
			} catch (error) {
				internalReject(state, error);
			}
		};
		PromisePrototype = PromiseConstructor.prototype;
		Internal = function Promise(executor) {
			setInternalState(this, {
				type: PROMISE,
				done: false,
				notified: false,
				parent: false,
				reactions: new Queue(),
				rejection: false,
				state: PENDING,
				value: null
			});
		};
		Internal.prototype = defineBuiltIn(PromisePrototype, "then", function then(onFulfilled, onRejected) {
			var state = getInternalPromiseState(this);
			var reaction = newPromiseCapability(speciesConstructor(this, PromiseConstructor));
			state.parent = true;
			reaction.ok = isCallable(onFulfilled) ? onFulfilled : true;
			reaction.fail = isCallable(onRejected) && onRejected;
			reaction.domain = IS_NODE ? process.domain : void 0;
			if (state.state === PENDING) state.reactions.add(reaction);
			else microtask(function() {
				callReaction(reaction, state);
			});
			return reaction.promise;
		});
		OwnPromiseCapability = function() {
			var promise = new Internal();
			var state = getInternalPromiseState(promise);
			this.promise = promise;
			this.resolve = bind(internalResolve, state);
			this.reject = bind(internalReject, state);
		};
		newPromiseCapabilityModule.f = newPromiseCapability = function(C) {
			return C === PromiseConstructor || C === PromiseWrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
		};
		if (!IS_PURE && isCallable(NativePromiseConstructor) && NativePromisePrototype !== Object.prototype) {
			nativeThen = NativePromisePrototype.then;
			if (!NATIVE_PROMISE_SUBCLASSING) defineBuiltIn(NativePromisePrototype, "then", function then(onFulfilled, onRejected) {
				var that = this;
				return new PromiseConstructor(function(resolve, reject) {
					call(nativeThen, that, resolve, reject);
				}).then(onFulfilled, onRejected);
			}, { unsafe: true });
			try {
				delete NativePromisePrototype.constructor;
			} catch (error) {}
			if (setPrototypeOf) setPrototypeOf(NativePromisePrototype, PromisePrototype);
		}
	}
	$({
		global: true,
		constructor: true,
		wrap: true,
		forced: FORCED_PROMISE_CONSTRUCTOR
	}, { Promise: PromiseConstructor });
	PromiseWrapper = path.Promise;
	setToStringTag(PromiseConstructor, PROMISE, false, true);
	setSpecies(PROMISE);
}));
//#endregion
//#region node_modules/core-js/internals/iterators.js
var require_iterators = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = Object.create ? Object.create(null) : {};
}));
//#endregion
//#region node_modules/core-js/internals/is-array-iterator-method.js
var require_is_array_iterator_method = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var wellKnownSymbol = require_well_known_symbol();
	var Iterators = require_iterators();
	var ITERATOR = wellKnownSymbol("iterator");
	var ArrayPrototype = Array.prototype;
	module.exports = function(it) {
		return it !== void 0 && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
	};
}));
//#endregion
//#region node_modules/core-js/internals/get-iterator-method-internal.js
var require_get_iterator_method_internal = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var classof = require_classof_raw();
	var isNullOrUndefined = require_is_null_or_undefined();
	var getMethod = require_get_method();
	var ITERATOR = require_well_known_symbol()("iterator");
	var ArrayPrototype = Array.prototype;
	module.exports = function(it) {
		if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR) || getMethod(it, "@@iterator") || (classof(it) === "Arguments" ? ArrayPrototype[ITERATOR] : void 0);
	};
}));
//#endregion
//#region node_modules/core-js/internals/get-iterator-internal.js
var require_get_iterator_internal = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var call = require_function_call();
	var isCallable = require_is_callable();
	var anObject = require_an_object();
	var tryToString = require_try_to_string();
	var getIteratorMethod = require_get_iterator_method_internal();
	var $TypeError = TypeError;
	module.exports = function(argument, usingIterator) {
		var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
		if (isCallable(iteratorMethod)) return anObject(call(iteratorMethod, argument));
		throw new $TypeError(tryToString(argument) + " is not iterable");
	};
}));
//#endregion
//#region node_modules/core-js/internals/iterator-close.js
var require_iterator_close = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var call = require_function_call();
	var anObject = require_an_object();
	var getMethod = require_get_method();
	module.exports = function(iterator, kind, value) {
		var innerResult, innerError;
		anObject(iterator);
		try {
			innerResult = getMethod(iterator, "return");
			if (!innerResult) {
				if (kind === "throw") throw value;
				return value;
			}
			innerResult = call(innerResult, iterator);
		} catch (error) {
			innerError = true;
			innerResult = error;
		}
		if (kind === "throw") throw value;
		if (innerError) throw innerResult;
		anObject(innerResult);
		return value;
	};
}));
//#endregion
//#region node_modules/core-js/internals/iterate.js
var require_iterate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var bind = require_function_bind_context();
	var call = require_function_call();
	var anObject = require_an_object();
	var tryToString = require_try_to_string();
	var isArrayIteratorMethod = require_is_array_iterator_method();
	var lengthOfArrayLike = require_length_of_array_like();
	var isPrototypeOf = require_object_is_prototype_of();
	var getIterator = require_get_iterator_internal();
	var getIteratorMethod = require_get_iterator_method_internal();
	var iteratorClose = require_iterator_close();
	var $TypeError = TypeError;
	var Result = function(stopped, result) {
		this.stopped = stopped;
		this.result = result;
	};
	var ResultPrototype = Result.prototype;
	module.exports = function(iterable, unboundFunction, options) {
		var that = options && options.that;
		var AS_ENTRIES = !!(options && options.AS_ENTRIES);
		var IS_RECORD = !!(options && options.IS_RECORD);
		var IS_ITERATOR = !!(options && options.IS_ITERATOR);
		var INTERRUPTED = !!(options && options.INTERRUPTED);
		var fn = bind(unboundFunction, that);
		var iterator, iterFn, index, length, result, next, step;
		var stop = function(condition) {
			var $iterator = iterator;
			iterator = void 0;
			if ($iterator) iteratorClose($iterator, "normal");
			return new Result(true, condition);
		};
		var callFn = function(value) {
			if (AS_ENTRIES) {
				anObject(value);
				return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
			}
			return INTERRUPTED ? fn(value, stop) : fn(value);
		};
		if (IS_RECORD) iterator = iterable.iterator;
		else if (IS_ITERATOR) iterator = iterable;
		else {
			iterFn = getIteratorMethod(iterable);
			if (!iterFn) throw new $TypeError(tryToString(iterable) + " is not iterable");
			if (isArrayIteratorMethod(iterFn)) {
				for (index = 0, length = lengthOfArrayLike(iterable); length > index; index++) {
					result = callFn(iterable[index]);
					if (result && isPrototypeOf(ResultPrototype, result)) return result;
				}
				return new Result(false);
			}
			iterator = getIterator(iterable, iterFn);
		}
		next = IS_RECORD ? iterable.next : iterator.next;
		while (!(step = call(next, iterator)).done) {
			var value = step.value;
			try {
				result = callFn(value);
			} catch (error) {
				if (iterator) iteratorClose(iterator, "throw", error);
				else throw error;
			}
			if (typeof result == "object" && result && isPrototypeOf(ResultPrototype, result)) return result;
		}
		return new Result(false);
	};
}));
//#endregion
//#region node_modules/core-js/internals/check-correctness-of-iteration.js
var require_check_correctness_of_iteration = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ITERATOR = require_well_known_symbol()("iterator");
	var SAFE_CLOSING = false;
	try {
		var called = 0;
		var iteratorWithReturn = {
			next: function() {
				return { done: !!called++ };
			},
			"return": function() {
				SAFE_CLOSING = true;
			}
		};
		iteratorWithReturn[ITERATOR] = function() {
			return this;
		};
		Array.from(iteratorWithReturn, function() {
			throw 2;
		});
	} catch (error) {}
	module.exports = function(exec, SKIP_CLOSING) {
		try {
			if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
		} catch (error) {
			return false;
		}
		var ITERATION_SUPPORT = false;
		try {
			var object = {};
			object[ITERATOR] = function() {
				return { next: function() {
					return { done: ITERATION_SUPPORT = true };
				} };
			};
			exec(object);
		} catch (error) {}
		return ITERATION_SUPPORT;
	};
}));
//#endregion
//#region node_modules/core-js/internals/promise-statics-incorrect-iteration.js
var require_promise_statics_incorrect_iteration = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var NativePromiseConstructor = require_promise_native_constructor();
	var checkCorrectnessOfIteration = require_check_correctness_of_iteration();
	module.exports = require_promise_constructor_detection().CONSTRUCTOR || !checkCorrectnessOfIteration(function(iterable) {
		NativePromiseConstructor.all(iterable).then(void 0, function() {});
	});
}));
//#endregion
//#region node_modules/core-js/modules/es.promise.all.js
var require_es_promise_all = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var call = require_function_call();
	var aCallable = require_a_callable();
	var newPromiseCapabilityModule = require_new_promise_capability();
	var perform = require_perform();
	var iterate = require_iterate();
	$({
		target: "Promise",
		stat: true,
		forced: require_promise_statics_incorrect_iteration()
	}, { all: function all(iterable) {
		var C = this;
		var capability = newPromiseCapabilityModule.f(C);
		var resolve = capability.resolve;
		var reject = capability.reject;
		var result = perform(function() {
			var $promiseResolve = aCallable(C.resolve);
			var values = [];
			var counter = 0;
			var remaining = 1;
			iterate(iterable, function(promise) {
				var index = counter++;
				var alreadyCalled = false;
				remaining++;
				call($promiseResolve, C, promise).then(function(value) {
					if (alreadyCalled) return;
					alreadyCalled = true;
					values[index] = value;
					--remaining || resolve(values);
				}, reject);
			});
			--remaining || resolve(values);
		});
		if (result.error) reject(result.value);
		return capability.promise;
	} });
}));
//#endregion
//#region node_modules/core-js/modules/es.promise.catch.js
var require_es_promise_catch = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var IS_PURE = require_is_pure();
	var FORCED_PROMISE_CONSTRUCTOR = require_promise_constructor_detection().CONSTRUCTOR;
	var NativePromiseConstructor = require_promise_native_constructor();
	var getBuiltIn = require_get_built_in();
	var isCallable = require_is_callable();
	var defineBuiltIn = require_define_built_in();
	var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;
	$({
		target: "Promise",
		proto: true,
		forced: FORCED_PROMISE_CONSTRUCTOR,
		real: true
	}, { "catch": function(onRejected) {
		return this.then(void 0, onRejected);
	} });
	if (!IS_PURE && isCallable(NativePromiseConstructor)) {
		var method = getBuiltIn("Promise").prototype["catch"];
		if (NativePromisePrototype["catch"] !== method) defineBuiltIn(NativePromisePrototype, "catch", method, { unsafe: true });
	}
}));
//#endregion
//#region node_modules/core-js/modules/es.promise.race.js
var require_es_promise_race = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var call = require_function_call();
	var aCallable = require_a_callable();
	var newPromiseCapabilityModule = require_new_promise_capability();
	var perform = require_perform();
	var iterate = require_iterate();
	$({
		target: "Promise",
		stat: true,
		forced: require_promise_statics_incorrect_iteration()
	}, { race: function race(iterable) {
		var C = this;
		var capability = newPromiseCapabilityModule.f(C);
		var reject = capability.reject;
		var result = perform(function() {
			var $promiseResolve = aCallable(C.resolve);
			iterate(iterable, function(promise) {
				call($promiseResolve, C, promise).then(capability.resolve, reject);
			});
		});
		if (result.error) reject(result.value);
		return capability.promise;
	} });
}));
//#endregion
//#region node_modules/core-js/modules/es.promise.reject.js
var require_es_promise_reject = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var newPromiseCapabilityModule = require_new_promise_capability();
	var FORCED_PROMISE_CONSTRUCTOR = require_promise_constructor_detection().CONSTRUCTOR;
	$({
		target: "Promise",
		stat: true,
		forced: FORCED_PROMISE_CONSTRUCTOR
	}, { reject: function reject(r) {
		var capability = newPromiseCapabilityModule.f(this);
		var capabilityReject = capability.reject;
		capabilityReject(r);
		return capability.promise;
	} });
}));
//#endregion
//#region node_modules/core-js/internals/promise-resolve.js
var require_promise_resolve = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var anObject = require_an_object();
	var isObject = require_is_object();
	var newPromiseCapability = require_new_promise_capability();
	module.exports = function(C, x) {
		anObject(C);
		if (isObject(x) && x.constructor === C) return x;
		var promiseCapability = newPromiseCapability.f(C);
		var resolve = promiseCapability.resolve;
		resolve(x);
		return promiseCapability.promise;
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.promise.resolve.js
var require_es_promise_resolve = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var getBuiltIn = require_get_built_in();
	var IS_PURE = require_is_pure();
	var NativePromiseConstructor = require_promise_native_constructor();
	var FORCED_PROMISE_CONSTRUCTOR = require_promise_constructor_detection().CONSTRUCTOR;
	var promiseResolve = require_promise_resolve();
	var PromiseConstructorWrapper = getBuiltIn("Promise");
	var CHECK_WRAPPER = IS_PURE && !FORCED_PROMISE_CONSTRUCTOR;
	$({
		target: "Promise",
		stat: true,
		forced: IS_PURE || FORCED_PROMISE_CONSTRUCTOR
	}, { resolve: function resolve(x) {
		return promiseResolve(CHECK_WRAPPER && this === PromiseConstructorWrapper ? NativePromiseConstructor : this, x);
	} });
}));
//#endregion
//#region node_modules/core-js/modules/es.promise.js
var require_es_promise = /* @__PURE__ */ __commonJSMin((() => {
	require_es_promise_constructor();
	require_es_promise_all();
	require_es_promise_catch();
	require_es_promise_race();
	require_es_promise_reject();
	require_es_promise_resolve();
}));
//#endregion
//#region node_modules/core-js/modules/es.reflect.delete-property.js
var require_es_reflect_delete_property = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var anObject = require_an_object();
	var getOwnPropertyDescriptor = require_object_get_own_property_descriptor().f;
	var toPropertyKey = require_to_property_key();
	$({
		target: "Reflect",
		stat: true
	}, { deleteProperty: function deleteProperty(target, propertyKey) {
		anObject(target);
		var key = toPropertyKey(propertyKey);
		var descriptor = getOwnPropertyDescriptor(target, key);
		return descriptor && !descriptor.configurable ? false : delete target[key];
	} });
}));
//#endregion
//#region node_modules/core-js/internals/is-array.js
var require_is_array = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var classof = require_classof_raw();
	module.exports = Array.isArray || function isArray(argument) {
		return classof(argument) === "Array";
	};
}));
//#endregion
//#region node_modules/core-js/internals/array-species-constructor.js
var require_array_species_constructor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isArray = require_is_array();
	var isConstructor = require_is_constructor();
	var isObject = require_is_object();
	var SPECIES = require_well_known_symbol()("species");
	var $Array = Array;
	module.exports = function(originalArray) {
		var C;
		if (isArray(originalArray)) {
			C = originalArray.constructor;
			if (isConstructor(C) && (C === $Array || isArray(C.prototype))) C = void 0;
			else if (isObject(C)) {
				C = C[SPECIES];
				if (C === null) C = void 0;
			}
		}
		return C === void 0 ? $Array : C;
	};
}));
//#endregion
//#region node_modules/core-js/internals/array-species-create.js
var require_array_species_create = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arraySpeciesConstructor = require_array_species_constructor();
	module.exports = function(originalArray, length) {
		return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
	};
}));
//#endregion
//#region node_modules/core-js/internals/create-property.js
var require_create_property = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var DESCRIPTORS = require_descriptors();
	var definePropertyModule = require_object_define_property();
	var createPropertyDescriptor = require_create_property_descriptor();
	module.exports = function(object, key, value) {
		if (DESCRIPTORS) definePropertyModule.f(object, key, createPropertyDescriptor(0, value));
		else object[key] = value;
	};
}));
//#endregion
//#region node_modules/core-js/internals/array-iteration.js
var require_array_iteration = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var bind = require_function_bind_context();
	var IndexedObject = require_indexed_object();
	var toObject = require_to_object();
	var lengthOfArrayLike = require_length_of_array_like();
	var arraySpeciesCreate = require_array_species_create();
	var createProperty = require_create_property();
	var createMethod = function(TYPE) {
		var IS_MAP = TYPE === 1;
		var IS_FILTER = TYPE === 2;
		var IS_SOME = TYPE === 3;
		var IS_EVERY = TYPE === 4;
		var IS_FIND_INDEX = TYPE === 6;
		var IS_FILTER_REJECT = TYPE === 7;
		var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
		return function($this, callbackfn, that) {
			var O = toObject($this);
			var self = IndexedObject(O);
			var length = lengthOfArrayLike(self);
			var boundFunction = bind(callbackfn, that);
			var index = 0;
			var resIndex = 0;
			var target = IS_MAP ? arraySpeciesCreate($this, length) : IS_FILTER || IS_FILTER_REJECT ? arraySpeciesCreate($this, 0) : void 0;
			var value, result;
			for (; length > index; index++) if (NO_HOLES || index in self) {
				value = self[index];
				result = boundFunction(value, index, O);
				if (TYPE) {
					if (IS_MAP) createProperty(target, index, result);
					else if (result) switch (TYPE) {
						case 3: return true;
						case 5: return value;
						case 6: return index;
						case 2: createProperty(target, resIndex++, value);
					}
					else switch (TYPE) {
						case 4: return false;
						case 7: createProperty(target, resIndex++, value);
					}
				}
			}
			return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
		};
	};
	module.exports = {
		forEach: createMethod(0),
		map: createMethod(1),
		filter: createMethod(2),
		some: createMethod(3),
		every: createMethod(4),
		find: createMethod(5),
		findIndex: createMethod(6),
		filterReject: createMethod(7)
	};
}));
//#endregion
//#region node_modules/core-js/internals/array-method-has-species-support.js
var require_array_method_has_species_support = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fails = require_fails();
	var wellKnownSymbol = require_well_known_symbol();
	var V8_VERSION = require_environment_v8_version();
	var SPECIES = wellKnownSymbol("species");
	module.exports = function(METHOD_NAME) {
		return V8_VERSION >= 51 || !fails(function() {
			var array = [];
			var constructor = array.constructor = {};
			constructor[SPECIES] = function() {
				return { foo: 1 };
			};
			return array[METHOD_NAME](Boolean).foo !== 1;
		});
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.array.map.js
var require_es_array_map = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var $map = require_array_iteration().map;
	$({
		target: "Array",
		proto: true,
		forced: !require_array_method_has_species_support()("map")
	}, { map: function map(callbackfn) {
		return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
	} });
}));
//#endregion
//#region node_modules/core-js/internals/to-string.js
var require_to_string = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var classof = require_classof();
	var $String = String;
	module.exports = function(argument) {
		if (classof(argument) === "Symbol") throw new TypeError("Cannot convert a Symbol value to a string");
		return $String(argument);
	};
}));
//#endregion
//#region node_modules/core-js/internals/whitespaces.js
var require_whitespaces = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = "	\n\v\f\r \xA0              　\u2028\u2029﻿";
}));
//#endregion
//#region node_modules/core-js/internals/string-trim.js
var require_string_trim = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this();
	var requireObjectCoercible = require_require_object_coercible();
	var toString = require_to_string();
	var whitespaces = require_whitespaces();
	var replace = uncurryThis("".replace);
	var ltrim = RegExp("^[" + whitespaces + "]+");
	var rtrim = RegExp("(^|[^" + whitespaces + "])[" + whitespaces + "]+$");
	var createMethod = function(TYPE) {
		return function($this) {
			var string = toString(requireObjectCoercible($this));
			if (TYPE & 1) string = replace(string, ltrim, "");
			if (TYPE & 2) string = replace(string, rtrim, "$1");
			return string;
		};
	};
	module.exports = {
		start: createMethod(1),
		end: createMethod(2),
		trim: createMethod(3)
	};
}));
//#endregion
//#region node_modules/core-js/internals/number-parse-float.js
var require_number_parse_float = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var fails = require_fails();
	var uncurryThis = require_function_uncurry_this();
	var toString = require_to_string();
	var trim = require_string_trim().trim;
	var whitespaces = require_whitespaces();
	var charAt = uncurryThis("".charAt);
	var $parseFloat = globalThis.parseFloat;
	var Symbol = globalThis.Symbol;
	var ITERATOR = Symbol && Symbol.iterator;
	module.exports = 1 / $parseFloat(whitespaces + "-0") !== -Infinity || ITERATOR && !fails(function() {
		$parseFloat(Object(ITERATOR));
	}) ? function parseFloat(string) {
		var trimmedString = trim(toString(string));
		var result = $parseFloat(trimmedString);
		return result === 0 && charAt(trimmedString, 0) === "-" ? -0 : result;
	} : $parseFloat;
}));
//#endregion
//#region node_modules/core-js/modules/es.parse-float.js
var require_es_parse_float = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var $parseFloat = require_number_parse_float();
	$({
		global: true,
		forced: parseFloat !== $parseFloat
	}, { parseFloat: $parseFloat });
}));
//#endregion
//#region node_modules/core-js/internals/regexp-flags.js
var require_regexp_flags = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var anObject = require_an_object();
	module.exports = function() {
		var that = anObject(this);
		var result = "";
		if (that.hasIndices) result += "d";
		if (that.global) result += "g";
		if (that.ignoreCase) result += "i";
		if (that.multiline) result += "m";
		if (that.dotAll) result += "s";
		if (that.unicode) result += "u";
		if (that.unicodeSets) result += "v";
		if (that.sticky) result += "y";
		return result;
	};
}));
//#endregion
//#region node_modules/core-js/internals/regexp-sticky-helpers.js
var require_regexp_sticky_helpers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fails = require_fails();
	var $RegExp = require_global_this().RegExp;
	var UNSUPPORTED_Y = fails(function() {
		var re = $RegExp("a", "y");
		re.lastIndex = 2;
		return re.exec("abcd") !== null;
	});
	var MISSED_STICKY = UNSUPPORTED_Y || fails(function() {
		return !$RegExp("a", "y").sticky;
	});
	module.exports = {
		BROKEN_CARET: UNSUPPORTED_Y || fails(function() {
			var re = $RegExp("^r", "gy");
			re.lastIndex = 2;
			return re.exec("str") !== null;
		}),
		MISSED_STICKY,
		UNSUPPORTED_Y
	};
}));
//#endregion
//#region node_modules/core-js/internals/object-keys.js
var require_object_keys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var internalObjectKeys = require_object_keys_internal();
	var enumBugKeys = require_enum_bug_keys();
	module.exports = Object.keys || function keys(O) {
		return internalObjectKeys(O, enumBugKeys);
	};
}));
//#endregion
//#region node_modules/core-js/internals/object-define-properties.js
var require_object_define_properties = /* @__PURE__ */ __commonJSMin(((exports) => {
	var DESCRIPTORS = require_descriptors();
	var V8_PROTOTYPE_DEFINE_BUG = require_v8_prototype_define_bug();
	var definePropertyModule = require_object_define_property();
	var anObject = require_an_object();
	var toIndexedObject = require_to_indexed_object();
	var objectKeys = require_object_keys();
	exports.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
		anObject(O);
		var props = toIndexedObject(Properties);
		var keys = objectKeys(Properties);
		var length = keys.length;
		var index = 0;
		var key;
		while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
		return O;
	};
}));
//#endregion
//#region node_modules/core-js/internals/object-create.js
var require_object_create = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var anObject = require_an_object();
	var definePropertiesModule = require_object_define_properties();
	var enumBugKeys = require_enum_bug_keys();
	var hiddenKeys = require_hidden_keys();
	var html = require_html();
	var documentCreateElement = require_document_create_element();
	var sharedKey = require_shared_key();
	var GT = ">";
	var LT = "<";
	var PROTOTYPE = "prototype";
	var SCRIPT = "script";
	var IE_PROTO = sharedKey("IE_PROTO");
	var EmptyConstructor = function() {};
	var scriptTag = function(content) {
		return LT + SCRIPT + GT + content + LT + "/" + SCRIPT + GT;
	};
	var NullProtoObjectViaActiveX = function(activeXDocument) {
		activeXDocument.write(scriptTag(""));
		activeXDocument.close();
		var temp = activeXDocument.parentWindow.Object;
		activeXDocument = null;
		return temp;
	};
	var NullProtoObjectViaIFrame = function() {
		var iframe = documentCreateElement("iframe");
		var JS = "java" + SCRIPT + ":";
		var iframeDocument;
		iframe.style.display = "none";
		html.appendChild(iframe);
		iframe.src = String(JS);
		iframeDocument = iframe.contentWindow.document;
		iframeDocument.open();
		iframeDocument.write(scriptTag("document.F=Object"));
		iframeDocument.close();
		return iframeDocument.F;
	};
	var activeXDocument;
	var NullProtoObject = function() {
		try {
			activeXDocument = new ActiveXObject("htmlfile");
		} catch (error) {}
		NullProtoObject = typeof document != "undefined" ? document.domain && activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame() : NullProtoObjectViaActiveX(activeXDocument);
		var length = enumBugKeys.length;
		while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
		return NullProtoObject();
	};
	hiddenKeys[IE_PROTO] = true;
	module.exports = Object.create || function create(O, Properties) {
		var result;
		if (O !== null) {
			EmptyConstructor[PROTOTYPE] = anObject(O);
			result = new EmptyConstructor();
			EmptyConstructor[PROTOTYPE] = null;
			result[IE_PROTO] = O;
		} else result = NullProtoObject();
		return Properties === void 0 ? result : definePropertiesModule.f(result, Properties);
	};
}));
//#endregion
//#region node_modules/core-js/internals/regexp-unsupported-dot-all.js
var require_regexp_unsupported_dot_all = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fails = require_fails();
	var $RegExp = require_global_this().RegExp;
	module.exports = fails(function() {
		var re = $RegExp(".", "s");
		return !(re.dotAll && re.test("\n") && re.flags === "s");
	});
}));
//#endregion
//#region node_modules/core-js/internals/regexp-unsupported-ncg.js
var require_regexp_unsupported_ncg = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fails = require_fails();
	var $RegExp = require_global_this().RegExp;
	module.exports = fails(function() {
		var re = $RegExp("(?<a>b)", "g");
		return re.exec("b").groups.a !== "b" || "b".replace(re, "$<a>c") !== "bc";
	});
}));
//#endregion
//#region node_modules/core-js/internals/regexp-exec.js
var require_regexp_exec = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var call = require_function_call();
	var uncurryThis = require_function_uncurry_this();
	var toString = require_to_string();
	var regexpFlags = require_regexp_flags();
	var stickyHelpers = require_regexp_sticky_helpers();
	var shared = require_shared();
	var create = require_object_create();
	var getInternalState = require_internal_state().get;
	var UNSUPPORTED_DOT_ALL = require_regexp_unsupported_dot_all();
	var UNSUPPORTED_NCG = require_regexp_unsupported_ncg();
	var nativeReplace = shared("native-string-replace", String.prototype.replace);
	var nativeExec = RegExp.prototype.exec;
	var patchedExec = nativeExec;
	var charAt = uncurryThis("".charAt);
	var indexOf = uncurryThis("".indexOf);
	var replace = uncurryThis("".replace);
	var stringSlice = uncurryThis("".slice);
	var UPDATES_LAST_INDEX_WRONG = (function() {
		var re1 = /a/;
		var re2 = /b*/g;
		call(nativeExec, re1, "a");
		call(nativeExec, re2, "a");
		return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	})();
	var UNSUPPORTED_Y = stickyHelpers.BROKEN_CARET;
	var NPCG_INCLUDED = /()??/.exec("")[1] !== void 0;
	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;
	var setGroups = function(re, groups) {
		var object = re.groups = create(null);
		for (var i = 0; i < groups.length; i++) {
			var group = groups[i];
			object[group[0]] = re[group[1]];
		}
	};
	if (PATCH) patchedExec = function exec(string) {
		var re = this;
		var state = getInternalState(re);
		var str = toString(string);
		var raw = state.raw;
		var result, reCopy, lastIndex;
		if (raw) {
			raw.lastIndex = re.lastIndex;
			result = call(patchedExec, raw, str);
			re.lastIndex = raw.lastIndex;
			if (result && state.groups) setGroups(result, state.groups);
			return result;
		}
		var groups = state.groups;
		var sticky = UNSUPPORTED_Y && re.sticky;
		var flags = call(regexpFlags, re);
		var source = re.source;
		var charsAdded = 0;
		var strCopy = str;
		if (sticky) {
			flags = replace(flags, "y", "");
			if (indexOf(flags, "g") === -1) flags += "g";
			strCopy = stringSlice(str, re.lastIndex);
			var prevChar = re.lastIndex > 0 && charAt(str, re.lastIndex - 1);
			if (re.lastIndex > 0 && (!re.multiline || re.multiline && prevChar !== "\n" && prevChar !== "\r" && prevChar !== "\u2028" && prevChar !== "\u2029")) {
				source = "(?: (?:" + source + "))";
				strCopy = " " + strCopy;
				charsAdded++;
			}
			reCopy = new RegExp("^(?:" + source + ")", flags);
		}
		if (NPCG_INCLUDED) reCopy = new RegExp("^" + source + "$(?!\\s)", flags);
		if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
		var match = call(nativeExec, sticky ? reCopy : re, strCopy);
		if (sticky) {
			if (match) {
				match.input = str;
				match[0] = stringSlice(match[0], charsAdded);
				match.index = re.lastIndex;
				re.lastIndex += match[0].length;
			} else re.lastIndex = 0;
		} else if (UPDATES_LAST_INDEX_WRONG && match) re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
		if (NPCG_INCLUDED && match && match.length > 1) call(nativeReplace, match[0], reCopy, function() {
			for (var i = 1; i < arguments.length - 2; i++) if (arguments[i] === void 0) match[i] = void 0;
		});
		if (match && groups) setGroups(match, groups);
		return match;
	};
	module.exports = patchedExec;
}));
//#endregion
//#region node_modules/core-js/modules/es.regexp.exec.js
var require_es_regexp_exec = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var exec = require_regexp_exec();
	$({
		target: "RegExp",
		proto: true,
		forced: /./.exec !== exec
	}, { exec });
}));
//#endregion
//#region node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js
var require_fix_regexp_well_known_symbol_logic = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	require_es_regexp_exec();
	var call = require_function_call();
	var defineBuiltIn = require_define_built_in();
	var regexpExec = require_regexp_exec();
	var fails = require_fails();
	var wellKnownSymbol = require_well_known_symbol();
	var createNonEnumerableProperty = require_create_non_enumerable_property();
	var SPECIES = wellKnownSymbol("species");
	var RegExpPrototype = RegExp.prototype;
	module.exports = function(KEY, exec, FORCED, SHAM) {
		var SYMBOL = wellKnownSymbol(KEY);
		var DELEGATES_TO_SYMBOL = !fails(function() {
			var O = {};
			O[SYMBOL] = function() {
				return 7;
			};
			return ""[KEY](O) !== 7;
		});
		var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function() {
			var execCalled = false;
			var re = /a/;
			if (KEY === "split") {
				var constructor = {};
				constructor[SPECIES] = function() {
					return re;
				};
				re = {
					constructor,
					flags: ""
				};
				re[SYMBOL] = /./[SYMBOL];
			}
			re.exec = function() {
				execCalled = true;
				return null;
			};
			re[SYMBOL]("");
			return !execCalled;
		});
		if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || FORCED) {
			var nativeRegExpMethod = /./[SYMBOL];
			var methods = exec(SYMBOL, ""[KEY], function(nativeMethod, regexp, str, arg2, forceStringMethod) {
				var $exec = regexp.exec;
				if ($exec === regexpExec || $exec === RegExpPrototype.exec) {
					if (DELEGATES_TO_SYMBOL && !forceStringMethod) return {
						done: true,
						value: call(nativeRegExpMethod, regexp, str, arg2)
					};
					return {
						done: true,
						value: call(nativeMethod, str, regexp, arg2)
					};
				}
				return { done: false };
			});
			defineBuiltIn(String.prototype, KEY, methods[0]);
			defineBuiltIn(RegExpPrototype, SYMBOL, methods[1]);
		}
		if (SHAM) createNonEnumerableProperty(RegExpPrototype[SYMBOL], "sham", true);
	};
}));
//#endregion
//#region node_modules/core-js/internals/string-multibyte.js
var require_string_multibyte = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this();
	var toIntegerOrInfinity = require_to_integer_or_infinity();
	var toString = require_to_string();
	var requireObjectCoercible = require_require_object_coercible();
	var charAt = uncurryThis("".charAt);
	var charCodeAt = uncurryThis("".charCodeAt);
	var stringSlice = uncurryThis("".slice);
	var createMethod = function(CONVERT_TO_STRING) {
		return function($this, pos) {
			var S = toString(requireObjectCoercible($this));
			var position = toIntegerOrInfinity(pos);
			var size = S.length;
			var first, second;
			if (position < 0 || position >= size) return CONVERT_TO_STRING ? "" : void 0;
			first = charCodeAt(S, position);
			return first < 55296 || first > 56319 || position + 1 === size || (second = charCodeAt(S, position + 1)) < 56320 || second > 57343 ? CONVERT_TO_STRING ? charAt(S, position) : first : CONVERT_TO_STRING ? stringSlice(S, position, position + 2) : (first - 55296 << 10) + (second - 56320) + 65536;
		};
	};
	module.exports = {
		codeAt: createMethod(false),
		charAt: createMethod(true)
	};
}));
//#endregion
//#region node_modules/core-js/internals/advance-string-index.js
var require_advance_string_index = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var charAt = require_string_multibyte().charAt;
	module.exports = function(S, index, unicode) {
		return index + (unicode ? charAt(S, index).length || 1 : 1);
	};
}));
//#endregion
//#region node_modules/core-js/internals/regexp-flags-detection.js
var require_regexp_flags_detection = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var globalThis = require_global_this();
	var fails = require_fails();
	var RegExp = globalThis.RegExp;
	module.exports = { correct: !fails(function() {
		var INDICES_SUPPORT = true;
		try {
			RegExp(".", "d");
		} catch (error) {
			INDICES_SUPPORT = false;
		}
		var O = {};
		var calls = "";
		var expected = INDICES_SUPPORT ? "dgimsy" : "gimsy";
		var addGetter = function(key, chr) {
			Object.defineProperty(O, key, { get: function() {
				calls += chr;
				return true;
			} });
		};
		var pairs = {
			dotAll: "s",
			global: "g",
			ignoreCase: "i",
			multiline: "m",
			sticky: "y"
		};
		if (INDICES_SUPPORT) pairs.hasIndices = "d";
		for (var key in pairs) addGetter(key, pairs[key]);
		return Object.getOwnPropertyDescriptor(RegExp.prototype, "flags").get.call(O) !== expected || calls !== expected;
	}) };
}));
//#endregion
//#region node_modules/core-js/internals/regexp-get-flags.js
var require_regexp_get_flags = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var call = require_function_call();
	var hasOwn = require_has_own_property();
	var isPrototypeOf = require_object_is_prototype_of();
	var regExpFlagsDetection = require_regexp_flags_detection();
	var regExpFlagsGetterImplementation = require_regexp_flags();
	var RegExpPrototype = RegExp.prototype;
	module.exports = regExpFlagsDetection.correct ? function(it) {
		return it.flags;
	} : function(it) {
		return !regExpFlagsDetection.correct && isPrototypeOf(RegExpPrototype, it) && !hasOwn(it, "flags") ? call(regExpFlagsGetterImplementation, it) : it.flags;
	};
}));
//#endregion
//#region node_modules/core-js/internals/regexp-exec-abstract.js
var require_regexp_exec_abstract = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var call = require_function_call();
	var anObject = require_an_object();
	var isCallable = require_is_callable();
	var classof = require_classof_raw();
	var regexpExec = require_regexp_exec();
	var $TypeError = TypeError;
	module.exports = function(R, S) {
		var exec = R.exec;
		if (isCallable(exec)) {
			var result = call(exec, R, S);
			if (result !== null) anObject(result);
			return result;
		}
		if (classof(R) === "RegExp") return call(regexpExec, R, S);
		throw new $TypeError("RegExp#exec called on incompatible receiver");
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.string.match.js
var require_es_string_match = /* @__PURE__ */ __commonJSMin((() => {
	var call = require_function_call();
	var uncurryThis = require_function_uncurry_this();
	var fixRegExpWellKnownSymbolLogic = require_fix_regexp_well_known_symbol_logic();
	var anObject = require_an_object();
	var isObject = require_is_object();
	var toLength = require_to_length();
	var toString = require_to_string();
	var requireObjectCoercible = require_require_object_coercible();
	var getMethod = require_get_method();
	var advanceStringIndex = require_advance_string_index();
	var getRegExpFlags = require_regexp_get_flags();
	var regExpExec = require_regexp_exec_abstract();
	var stringIndexOf = uncurryThis("".indexOf);
	fixRegExpWellKnownSymbolLogic("match", function(MATCH, nativeMatch, maybeCallNative) {
		return [function match(regexp) {
			var O = requireObjectCoercible(this);
			var matcher = isObject(regexp) ? getMethod(regexp, MATCH) : void 0;
			if (matcher) return call(matcher, regexp, O);
			var S = toString(O);
			return new RegExp(regexp)[MATCH](S);
		}, function(string) {
			var rx = anObject(this);
			var S = toString(string);
			var res = maybeCallNative(nativeMatch, rx, S);
			if (res.done) return res.value;
			var flags = toString(getRegExpFlags(rx));
			if (!~stringIndexOf(flags, "g")) return regExpExec(rx, S);
			var fullUnicode = !!~stringIndexOf(flags, "u") || !!~stringIndexOf(flags, "v");
			rx.lastIndex = 0;
			var A = [];
			var n = 0;
			var result;
			while ((result = regExpExec(rx, S)) !== null) {
				var matchStr = toString(result[0]);
				A[n] = matchStr;
				if (matchStr === "") rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
				n++;
			}
			return n === 0 ? null : A;
		}];
	});
}));
//#endregion
//#region node_modules/core-js/internals/get-substitution.js
var require_get_substitution = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var uncurryThis = require_function_uncurry_this();
	var toObject = require_to_object();
	var floor = Math.floor;
	var charAt = uncurryThis("".charAt);
	var replace = uncurryThis("".replace);
	var stringSlice = uncurryThis("".slice);
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;
	module.exports = function(matched, str, position, captures, namedCaptures, replacement) {
		var tailPos = position + matched.length;
		var m = captures.length;
		var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
		if (namedCaptures !== void 0) {
			namedCaptures = toObject(namedCaptures);
			symbols = SUBSTITUTION_SYMBOLS;
		}
		return replace(replacement, symbols, function(match, ch) {
			var capture;
			switch (charAt(ch, 0)) {
				case "$": return "$";
				case "&": return matched;
				case "`": return stringSlice(str, 0, position);
				case "'": return stringSlice(str, tailPos);
				case "<":
					capture = namedCaptures[stringSlice(ch, 1, -1)];
					break;
				default:
					var n = +ch;
					if (n === 0) return match;
					if (n > m) {
						var f = floor(n / 10);
						if (f === 0) return match;
						if (f <= m) return captures[f - 1] === void 0 ? charAt(ch, 1) : captures[f - 1] + charAt(ch, 1);
						return match;
					}
					capture = captures[n - 1];
			}
			return capture === void 0 ? "" : capture;
		});
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.string.replace.js
var require_es_string_replace = /* @__PURE__ */ __commonJSMin((() => {
	var apply = require_function_apply();
	var call = require_function_call();
	var uncurryThis = require_function_uncurry_this();
	var fixRegExpWellKnownSymbolLogic = require_fix_regexp_well_known_symbol_logic();
	var fails = require_fails();
	var anObject = require_an_object();
	var isCallable = require_is_callable();
	var isObject = require_is_object();
	var toIntegerOrInfinity = require_to_integer_or_infinity();
	var toLength = require_to_length();
	var toString = require_to_string();
	var requireObjectCoercible = require_require_object_coercible();
	var advanceStringIndex = require_advance_string_index();
	var getMethod = require_get_method();
	var getSubstitution = require_get_substitution();
	var getRegExpFlags = require_regexp_get_flags();
	var regExpExec = require_regexp_exec_abstract();
	var REPLACE = require_well_known_symbol()("replace");
	var max = Math.max;
	var min = Math.min;
	var concat = uncurryThis([].concat);
	var push = uncurryThis([].push);
	var stringIndexOf = uncurryThis("".indexOf);
	var stringSlice = uncurryThis("".slice);
	var maybeToString = function(it) {
		return it === void 0 ? it : String(it);
	};
	var REPLACE_KEEPS_$0 = (function() {
		return "a".replace(/./, "$0") === "$0";
	})();
	var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function() {
		if (/./[REPLACE]) return /./[REPLACE]("a", "$0") === "";
		return false;
	})();
	fixRegExpWellKnownSymbolLogic("replace", function(_, nativeReplace, maybeCallNative) {
		var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? "$" : "$0";
		return [function replace(searchValue, replaceValue) {
			var O = requireObjectCoercible(this);
			var replacer = isObject(searchValue) ? getMethod(searchValue, REPLACE) : void 0;
			return replacer ? call(replacer, searchValue, O, replaceValue) : call(nativeReplace, toString(O), searchValue, replaceValue);
		}, function(string, replaceValue) {
			var rx = anObject(this);
			var S = toString(string);
			var functionalReplace = isCallable(replaceValue);
			if (!functionalReplace) replaceValue = toString(replaceValue);
			var flags = toString(getRegExpFlags(rx));
			if (typeof replaceValue == "string" && !~stringIndexOf(replaceValue, UNSAFE_SUBSTITUTE) && !~stringIndexOf(replaceValue, "$<") && !~stringIndexOf(flags, "y")) {
				var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
				if (res.done) return res.value;
			}
			var global = !!~stringIndexOf(flags, "g");
			var fullUnicode;
			if (global) {
				fullUnicode = !!~stringIndexOf(flags, "u") || !!~stringIndexOf(flags, "v");
				rx.lastIndex = 0;
			}
			var results = [];
			var result;
			while (true) {
				result = regExpExec(rx, S);
				if (result === null) break;
				push(results, result);
				if (!global) break;
				if (toString(result[0]) === "") rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
			}
			var accumulatedResult = "";
			var nextSourcePosition = 0;
			for (var i = 0; i < results.length; i++) {
				result = results[i];
				var matched = toString(result[0]);
				var position = max(min(toIntegerOrInfinity(result.index), S.length), 0);
				var captures = [];
				var replacement;
				for (var j = 1; j < result.length; j++) push(captures, maybeToString(result[j]));
				var namedCaptures = result.groups;
				if (functionalReplace) {
					var replacerArgs = concat([matched], captures, position, S);
					if (namedCaptures !== void 0) push(replacerArgs, namedCaptures);
					replacement = toString(apply(replaceValue, void 0, replacerArgs));
				} else replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
				if (position >= nextSourcePosition) {
					accumulatedResult += stringSlice(S, nextSourcePosition, position) + replacement;
					nextSourcePosition = position + matched.length;
				}
			}
			return accumulatedResult + stringSlice(S, nextSourcePosition);
		}];
	}, !!fails(function() {
		var re = /./;
		re.exec = function() {
			var result = [];
			result.groups = { a: "7" };
			return result;
		};
		return "".replace(re, "$<a>") !== "7";
	}) || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);
}));
//#endregion
//#region node_modules/core-js/internals/is-regexp.js
var require_is_regexp = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isObject = require_is_object();
	var classof = require_classof_raw();
	var MATCH = require_well_known_symbol()("match");
	module.exports = function(it) {
		var isRegExp;
		return isObject(it) && ((isRegExp = it[MATCH]) !== void 0 ? !!isRegExp : classof(it) === "RegExp");
	};
}));
//#endregion
//#region node_modules/core-js/internals/not-a-regexp.js
var require_not_a_regexp = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isRegExp = require_is_regexp();
	var $TypeError = TypeError;
	module.exports = function(it) {
		if (isRegExp(it)) throw new $TypeError("The method doesn't accept regular expressions");
		return it;
	};
}));
//#endregion
//#region node_modules/core-js/internals/correct-is-regexp-logic.js
var require_correct_is_regexp_logic = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var MATCH = require_well_known_symbol()("match");
	module.exports = function(METHOD_NAME) {
		var regexp = /./;
		try {
			"/./"[METHOD_NAME](regexp);
		} catch (error1) {
			try {
				regexp[MATCH] = false;
				return "/./"[METHOD_NAME](regexp);
			} catch (error2) {}
		}
		return false;
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.string.starts-with.js
var require_es_string_starts_with = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var uncurryThis = require_function_uncurry_this_clause();
	var getOwnPropertyDescriptor = require_object_get_own_property_descriptor().f;
	var toLength = require_to_length();
	var toString = require_to_string();
	var notARegExp = require_not_a_regexp();
	var requireObjectCoercible = require_require_object_coercible();
	var correctIsRegExpLogic = require_correct_is_regexp_logic();
	var IS_PURE = require_is_pure();
	var stringSlice = uncurryThis("".slice);
	var min = Math.min;
	var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic("startsWith");
	$({
		target: "String",
		proto: true,
		forced: !(!IS_PURE && !CORRECT_IS_REGEXP_LOGIC && !!function() {
			var descriptor = getOwnPropertyDescriptor(String.prototype, "startsWith");
			return descriptor && !descriptor.writable;
		}()) && !CORRECT_IS_REGEXP_LOGIC
	}, { startsWith: function startsWith(searchString) {
		var that = toString(requireObjectCoercible(this));
		notARegExp(searchString);
		var search = toString(searchString);
		var index = toLength(min(arguments.length > 1 ? arguments[1] : void 0, that.length));
		return stringSlice(that, index, index + search.length) === search;
	} });
}));
//#endregion
//#region node_modules/core-js/internals/array-method-is-strict.js
var require_array_method_is_strict = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fails = require_fails();
	module.exports = function(METHOD_NAME, argument) {
		var method = [][METHOD_NAME];
		return !!method && fails(function() {
			method.call(null, argument || function() {
				return 1;
			}, 1);
		});
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.array.join.js
var require_es_array_join = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var uncurryThis = require_function_uncurry_this();
	var IndexedObject = require_indexed_object();
	var toIndexedObject = require_to_indexed_object();
	var arrayMethodIsStrict = require_array_method_is_strict();
	var nativeJoin = uncurryThis([].join);
	$({
		target: "Array",
		proto: true,
		forced: IndexedObject !== Object || !arrayMethodIsStrict("join", ",")
	}, { join: function join(separator) {
		return nativeJoin(toIndexedObject(this), separator === void 0 ? "," : separator);
	} });
}));
//#endregion
//#region node_modules/core-js/internals/does-not-exceed-safe-integer.js
var require_does_not_exceed_safe_integer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var $TypeError = TypeError;
	var MAX_SAFE_INTEGER = 9007199254740991;
	module.exports = function(it) {
		if (it > MAX_SAFE_INTEGER) throw new $TypeError("Maximum allowed index exceeded");
		return it;
	};
}));
//#endregion
//#region node_modules/core-js/internals/array-set-length.js
var require_array_set_length = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var DESCRIPTORS = require_descriptors();
	var isArray = require_is_array();
	var $TypeError = TypeError;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	module.exports = DESCRIPTORS && !function() {
		if (this !== void 0) return true;
		try {
			Object.defineProperty([], "length", { writable: false }).length = 1;
		} catch (error) {
			return error instanceof TypeError;
		}
	}() ? function(O, length) {
		if (isArray(O) && !getOwnPropertyDescriptor(O, "length").writable) throw new $TypeError("Cannot set read only .length");
		return O.length = length;
	} : function(O, length) {
		return O.length = length;
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.array.concat.js
var require_es_array_concat = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var fails = require_fails();
	var isArray = require_is_array();
	var isObject = require_is_object();
	var toObject = require_to_object();
	var lengthOfArrayLike = require_length_of_array_like();
	var doesNotExceedSafeInteger = require_does_not_exceed_safe_integer();
	var createProperty = require_create_property();
	var setArrayLength = require_array_set_length();
	var arraySpeciesCreate = require_array_species_create();
	var arrayMethodHasSpeciesSupport = require_array_method_has_species_support();
	var wellKnownSymbol = require_well_known_symbol();
	var V8_VERSION = require_environment_v8_version();
	var IS_CONCAT_SPREADABLE = wellKnownSymbol("isConcatSpreadable");
	var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function() {
		var array = [];
		array[IS_CONCAT_SPREADABLE] = false;
		return array.concat()[0] !== array;
	});
	var isConcatSpreadable = function(O) {
		if (!isObject(O)) return false;
		var spreadable = O[IS_CONCAT_SPREADABLE];
		return spreadable !== void 0 ? !!spreadable : isArray(O);
	};
	$({
		target: "Array",
		proto: true,
		arity: 1,
		forced: !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport("concat")
	}, { concat: function concat(arg) {
		var O = toObject(this);
		var A = arraySpeciesCreate(O, 0);
		var n = 0;
		var i, k, length, len, E;
		for (i = -1, length = arguments.length; i < length; i++) {
			E = i === -1 ? O : arguments[i];
			if (isConcatSpreadable(E)) {
				len = lengthOfArrayLike(E);
				doesNotExceedSafeInteger(n + len);
				for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
			} else {
				doesNotExceedSafeInteger(n + 1);
				createProperty(A, n++, E);
			}
		}
		setArrayLength(A, n);
		return A;
	} });
}));
//#endregion
//#region node_modules/core-js/modules/es.array.every.js
var require_es_array_every = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var $every = require_array_iteration().every;
	$({
		target: "Array",
		proto: true,
		forced: !require_array_method_is_strict()("every")
	}, { every: function every(callbackfn) {
		return $every(this, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
	} });
}));
//#endregion
//#region node_modules/core-js/internals/array-reduce.js
var require_array_reduce = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var aCallable = require_a_callable();
	var toObject = require_to_object();
	var IndexedObject = require_indexed_object();
	var lengthOfArrayLike = require_length_of_array_like();
	var $TypeError = TypeError;
	var REDUCE_EMPTY = "Reduce of empty array with no initial value";
	var createMethod = function(IS_RIGHT) {
		return function(that, callbackfn, argumentsLength, memo) {
			var O = toObject(that);
			var self = IndexedObject(O);
			var length = lengthOfArrayLike(O);
			aCallable(callbackfn);
			if (length === 0 && argumentsLength < 2) throw new $TypeError(REDUCE_EMPTY);
			var index = IS_RIGHT ? length - 1 : 0;
			var i = IS_RIGHT ? -1 : 1;
			if (argumentsLength < 2) while (true) {
				if (index in self) {
					memo = self[index];
					index += i;
					break;
				}
				index += i;
				if (IS_RIGHT ? index < 0 : length <= index) throw new $TypeError(REDUCE_EMPTY);
			}
			for (; IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) memo = callbackfn(memo, self[index], index, O);
			return memo;
		};
	};
	module.exports = {
		left: createMethod(false),
		right: createMethod(true)
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.array.reduce.js
var require_es_array_reduce = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var $reduce = require_array_reduce().left;
	var arrayMethodIsStrict = require_array_method_is_strict();
	var CHROME_VERSION = require_environment_v8_version();
	$({
		target: "Array",
		proto: true,
		forced: !require_environment_is_node() && CHROME_VERSION > 79 && CHROME_VERSION < 83 || !arrayMethodIsStrict("reduce")
	}, { reduce: function reduce(callbackfn) {
		var length = arguments.length;
		return $reduce(this, callbackfn, length, length > 1 ? arguments[1] : void 0);
	} });
}));
//#endregion
//#region node_modules/core-js/modules/es.string.ends-with.js
var require_es_string_ends_with = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var uncurryThis = require_function_uncurry_this_clause();
	var getOwnPropertyDescriptor = require_object_get_own_property_descriptor().f;
	var toLength = require_to_length();
	var toString = require_to_string();
	var notARegExp = require_not_a_regexp();
	var requireObjectCoercible = require_require_object_coercible();
	var correctIsRegExpLogic = require_correct_is_regexp_logic();
	var IS_PURE = require_is_pure();
	var slice = uncurryThis("".slice);
	var min = Math.min;
	var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic("endsWith");
	$({
		target: "String",
		proto: true,
		forced: !(!IS_PURE && !CORRECT_IS_REGEXP_LOGIC && !!function() {
			var descriptor = getOwnPropertyDescriptor(String.prototype, "endsWith");
			return descriptor && !descriptor.writable;
		}()) && !CORRECT_IS_REGEXP_LOGIC
	}, { endsWith: function endsWith(searchString) {
		var that = toString(requireObjectCoercible(this));
		notARegExp(searchString);
		var search = toString(searchString);
		var endPosition = arguments.length > 1 ? arguments[1] : void 0;
		var len = that.length;
		var end = endPosition === void 0 ? len : min(toLength(endPosition), len);
		return slice(that, end - search.length, end) === search;
	} });
}));
//#endregion
//#region node_modules/core-js/modules/es.string.split.js
var require_es_string_split = /* @__PURE__ */ __commonJSMin((() => {
	var call = require_function_call();
	var uncurryThis = require_function_uncurry_this();
	var fixRegExpWellKnownSymbolLogic = require_fix_regexp_well_known_symbol_logic();
	var anObject = require_an_object();
	var isObject = require_is_object();
	var requireObjectCoercible = require_require_object_coercible();
	var speciesConstructor = require_species_constructor();
	var advanceStringIndex = require_advance_string_index();
	var toLength = require_to_length();
	var toString = require_to_string();
	var getMethod = require_get_method();
	var getRegExpFlags = require_regexp_get_flags();
	var regExpExec = require_regexp_exec_abstract();
	var stickyHelpers = require_regexp_sticky_helpers();
	var fails = require_fails();
	var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;
	var MAX_UINT32 = 4294967295;
	var min = Math.min;
	var push = uncurryThis([].push);
	var stringSlice = uncurryThis("".slice);
	var stringIndexOf = uncurryThis("".indexOf);
	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function() {
		var re = /(?:)/;
		var originalExec = re.exec;
		re.exec = function() {
			return originalExec.apply(this, arguments);
		};
		var result = "ab".split(re);
		return result.length !== 2 || result[0] !== "a" || result[1] !== "b";
	});
	var BUGGY = "abbc".split(/(b)*/)[1] === "c" || "test".split(/(?:)/, -1).length !== 4 || "ab".split(/(?:ab)*/).length !== 2 || ".".split(/(.?)(.?)/).length !== 4 || ".".split(/()()/).length > 1 || "".split(/.?/).length;
	fixRegExpWellKnownSymbolLogic("split", function(SPLIT, nativeSplit, maybeCallNative) {
		var internalSplit = "0".split(void 0, 0).length ? function(separator, limit) {
			return separator === void 0 && limit === 0 ? [] : call(nativeSplit, this, separator, limit);
		} : nativeSplit;
		return [function split(separator, limit) {
			var O = requireObjectCoercible(this);
			var splitter = isObject(separator) ? getMethod(separator, SPLIT) : void 0;
			return splitter ? call(splitter, separator, O, limit) : call(internalSplit, toString(O), separator, limit);
		}, function(string, limit) {
			var rx = anObject(this);
			var S = toString(string);
			if (!BUGGY) {
				var res = maybeCallNative(internalSplit, rx, S, limit, internalSplit !== nativeSplit);
				if (res.done) return res.value;
			}
			var C = speciesConstructor(rx, RegExp);
			var flags = toString(getRegExpFlags(rx));
			var unicodeMatching = !!~stringIndexOf(flags, "u") || !!~stringIndexOf(flags, "v");
			if (UNSUPPORTED_Y) {
				if (!~stringIndexOf(flags, "g")) flags += "g";
			} else if (!~stringIndexOf(flags, "y")) flags += "y";
			var splitter = new C(UNSUPPORTED_Y ? "^(?:" + rx.source + ")" : rx, flags);
			var lim = limit === void 0 ? MAX_UINT32 : limit >>> 0;
			if (lim === 0) return [];
			if (S.length === 0) return regExpExec(splitter, S) === null ? [S] : [];
			var p = 0;
			var q = 0;
			var A = [];
			while (q < S.length) {
				splitter.lastIndex = UNSUPPORTED_Y ? 0 : q;
				var z = regExpExec(splitter, UNSUPPORTED_Y ? stringSlice(S, q) : S);
				var e;
				if (z === null || (e = min(toLength(splitter.lastIndex + (UNSUPPORTED_Y ? q : 0)), S.length)) === p) q = advanceStringIndex(S, q, unicodeMatching);
				else {
					push(A, stringSlice(S, p, q));
					if (A.length === lim) return A;
					for (var i = 1; i <= z.length - 1; i++) {
						push(A, z[i]);
						if (A.length === lim) return A;
					}
					q = p = e;
				}
			}
			push(A, stringSlice(S, p));
			return A;
		}];
	}, BUGGY || !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC, UNSUPPORTED_Y);
}));
//#endregion
//#region node_modules/performance-now/lib/performance-now.js
var require_performance_now = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function() {
		var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;
		if (typeof performance !== "undefined" && performance !== null && performance.now) module.exports = function() {
			return performance.now();
		};
		else if (typeof process !== "undefined" && process !== null && process.hrtime) {
			module.exports = function() {
				return (getNanoSeconds() - nodeLoadTime) / 1e6;
			};
			hrtime = process.hrtime;
			getNanoSeconds = function() {
				var hr = hrtime();
				return hr[0] * 1e9 + hr[1];
			};
			moduleLoadTime = getNanoSeconds();
			upTime = process.uptime() * 1e9;
			nodeLoadTime = moduleLoadTime - upTime;
		} else if (Date.now) {
			module.exports = function() {
				return Date.now() - loadTime;
			};
			loadTime = Date.now();
		} else {
			module.exports = function() {
				return (/* @__PURE__ */ new Date()).getTime() - loadTime;
			};
			loadTime = (/* @__PURE__ */ new Date()).getTime();
		}
	}).call(exports);
}));
//#endregion
//#region node_modules/raf/index.js
var require_raf = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var now = require_performance_now();
	var root = typeof window === "undefined" ? global : window;
	var vendors = ["moz", "webkit"];
	var suffix = "AnimationFrame";
	var raf = root["request" + suffix];
	var caf = root["cancel" + suffix] || root["cancelRequest" + suffix];
	for (var i = 0; !raf && i < vendors.length; i++) {
		raf = root[vendors[i] + "Request" + suffix];
		caf = root[vendors[i] + "Cancel" + suffix] || root[vendors[i] + "CancelRequest" + suffix];
	}
	if (!raf || !caf) {
		var last = 0, id = 0, queue = [], frameDuration = 1e3 / 60;
		raf = function(callback) {
			if (queue.length === 0) {
				var _now = now(), next = Math.max(0, frameDuration - (_now - last));
				last = next + _now;
				setTimeout(function() {
					var cp = queue.slice(0);
					queue.length = 0;
					for (var i = 0; i < cp.length; i++) if (!cp[i].cancelled) try {
						cp[i].callback(last);
					} catch (e) {
						setTimeout(function() {
							throw e;
						}, 0);
					}
				}, Math.round(next));
			}
			queue.push({
				handle: ++id,
				callback,
				cancelled: false
			});
			return id;
		};
		caf = function(handle) {
			for (var i = 0; i < queue.length; i++) if (queue[i].handle === handle) queue[i].cancelled = true;
		};
	}
	module.exports = function(fn) {
		return raf.call(root, fn);
	};
	module.exports.cancel = function() {
		caf.apply(root, arguments);
	};
	module.exports.polyfill = function(object) {
		if (!object) object = root;
		object.requestAnimationFrame = raf;
		object.cancelAnimationFrame = caf;
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.function.name.js
var require_es_function_name = /* @__PURE__ */ __commonJSMin((() => {
	var DESCRIPTORS = require_descriptors();
	var FUNCTION_NAME_EXISTS = require_function_name().EXISTS;
	var uncurryThis = require_function_uncurry_this();
	var defineBuiltInAccessor = require_define_built_in_accessor();
	var FunctionPrototype = Function.prototype;
	var functionToString = uncurryThis(FunctionPrototype.toString);
	var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
	var regExpExec = uncurryThis(nameRE.exec);
	var NAME = "name";
	if (DESCRIPTORS && !FUNCTION_NAME_EXISTS) defineBuiltInAccessor(FunctionPrototype, NAME, {
		configurable: true,
		get: function() {
			try {
				return regExpExec(nameRE, functionToString(this))[1];
			} catch (error) {
				return "";
			}
		}
	});
}));
//#endregion
//#region node_modules/core-js/internals/string-trim-forced.js
var require_string_trim_forced = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var PROPER_FUNCTION_NAME = require_function_name().PROPER;
	var fails = require_fails();
	var whitespaces = require_whitespaces();
	var non = "​᠎";
	module.exports = function(METHOD_NAME) {
		return fails(function() {
			return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() !== non || PROPER_FUNCTION_NAME && whitespaces[METHOD_NAME].name !== METHOD_NAME;
		});
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.string.trim.js
var require_es_string_trim = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var $trim = require_string_trim().trim;
	$({
		target: "String",
		proto: true,
		forced: require_string_trim_forced()("trim")
	}, { trim: function trim() {
		return $trim(this);
	} });
}));
//#endregion
//#region node_modules/rgbcolor/index.js
var require_rgbcolor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function(color_string) {
		this.ok = false;
		this.alpha = 1;
		if (color_string.charAt(0) == "#") color_string = color_string.substr(1, 6);
		color_string = color_string.replace(/ /g, "");
		color_string = color_string.toLowerCase();
		var simple_colors = {
			aliceblue: "f0f8ff",
			antiquewhite: "faebd7",
			aqua: "00ffff",
			aquamarine: "7fffd4",
			azure: "f0ffff",
			beige: "f5f5dc",
			bisque: "ffe4c4",
			black: "000000",
			blanchedalmond: "ffebcd",
			blue: "0000ff",
			blueviolet: "8a2be2",
			brown: "a52a2a",
			burlywood: "deb887",
			cadetblue: "5f9ea0",
			chartreuse: "7fff00",
			chocolate: "d2691e",
			coral: "ff7f50",
			cornflowerblue: "6495ed",
			cornsilk: "fff8dc",
			crimson: "dc143c",
			cyan: "00ffff",
			darkblue: "00008b",
			darkcyan: "008b8b",
			darkgoldenrod: "b8860b",
			darkgray: "a9a9a9",
			darkgreen: "006400",
			darkkhaki: "bdb76b",
			darkmagenta: "8b008b",
			darkolivegreen: "556b2f",
			darkorange: "ff8c00",
			darkorchid: "9932cc",
			darkred: "8b0000",
			darksalmon: "e9967a",
			darkseagreen: "8fbc8f",
			darkslateblue: "483d8b",
			darkslategray: "2f4f4f",
			darkturquoise: "00ced1",
			darkviolet: "9400d3",
			deeppink: "ff1493",
			deepskyblue: "00bfff",
			dimgray: "696969",
			dodgerblue: "1e90ff",
			feldspar: "d19275",
			firebrick: "b22222",
			floralwhite: "fffaf0",
			forestgreen: "228b22",
			fuchsia: "ff00ff",
			gainsboro: "dcdcdc",
			ghostwhite: "f8f8ff",
			gold: "ffd700",
			goldenrod: "daa520",
			gray: "808080",
			green: "008000",
			greenyellow: "adff2f",
			honeydew: "f0fff0",
			hotpink: "ff69b4",
			indianred: "cd5c5c",
			indigo: "4b0082",
			ivory: "fffff0",
			khaki: "f0e68c",
			lavender: "e6e6fa",
			lavenderblush: "fff0f5",
			lawngreen: "7cfc00",
			lemonchiffon: "fffacd",
			lightblue: "add8e6",
			lightcoral: "f08080",
			lightcyan: "e0ffff",
			lightgoldenrodyellow: "fafad2",
			lightgrey: "d3d3d3",
			lightgreen: "90ee90",
			lightpink: "ffb6c1",
			lightsalmon: "ffa07a",
			lightseagreen: "20b2aa",
			lightskyblue: "87cefa",
			lightslateblue: "8470ff",
			lightslategray: "778899",
			lightsteelblue: "b0c4de",
			lightyellow: "ffffe0",
			lime: "00ff00",
			limegreen: "32cd32",
			linen: "faf0e6",
			magenta: "ff00ff",
			maroon: "800000",
			mediumaquamarine: "66cdaa",
			mediumblue: "0000cd",
			mediumorchid: "ba55d3",
			mediumpurple: "9370d8",
			mediumseagreen: "3cb371",
			mediumslateblue: "7b68ee",
			mediumspringgreen: "00fa9a",
			mediumturquoise: "48d1cc",
			mediumvioletred: "c71585",
			midnightblue: "191970",
			mintcream: "f5fffa",
			mistyrose: "ffe4e1",
			moccasin: "ffe4b5",
			navajowhite: "ffdead",
			navy: "000080",
			oldlace: "fdf5e6",
			olive: "808000",
			olivedrab: "6b8e23",
			orange: "ffa500",
			orangered: "ff4500",
			orchid: "da70d6",
			palegoldenrod: "eee8aa",
			palegreen: "98fb98",
			paleturquoise: "afeeee",
			palevioletred: "d87093",
			papayawhip: "ffefd5",
			peachpuff: "ffdab9",
			peru: "cd853f",
			pink: "ffc0cb",
			plum: "dda0dd",
			powderblue: "b0e0e6",
			purple: "800080",
			rebeccapurple: "663399",
			red: "ff0000",
			rosybrown: "bc8f8f",
			royalblue: "4169e1",
			saddlebrown: "8b4513",
			salmon: "fa8072",
			sandybrown: "f4a460",
			seagreen: "2e8b57",
			seashell: "fff5ee",
			sienna: "a0522d",
			silver: "c0c0c0",
			skyblue: "87ceeb",
			slateblue: "6a5acd",
			slategray: "708090",
			snow: "fffafa",
			springgreen: "00ff7f",
			steelblue: "4682b4",
			tan: "d2b48c",
			teal: "008080",
			thistle: "d8bfd8",
			tomato: "ff6347",
			turquoise: "40e0d0",
			violet: "ee82ee",
			violetred: "d02090",
			wheat: "f5deb3",
			white: "ffffff",
			whitesmoke: "f5f5f5",
			yellow: "ffff00",
			yellowgreen: "9acd32"
		};
		color_string = simple_colors[color_string] || color_string;
		var color_defs = [
			{
				re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*((?:\d?\.)?\d)\)$/,
				example: ["rgba(123, 234, 45, 0.8)", "rgba(255,234,245,1.0)"],
				process: function(bits) {
					return [
						parseInt(bits[1]),
						parseInt(bits[2]),
						parseInt(bits[3]),
						parseFloat(bits[4])
					];
				}
			},
			{
				re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
				example: ["rgb(123, 234, 45)", "rgb(255,234,245)"],
				process: function(bits) {
					return [
						parseInt(bits[1]),
						parseInt(bits[2]),
						parseInt(bits[3])
					];
				}
			},
			{
				re: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
				example: ["#00ff00", "336699"],
				process: function(bits) {
					return [
						parseInt(bits[1], 16),
						parseInt(bits[2], 16),
						parseInt(bits[3], 16)
					];
				}
			},
			{
				re: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
				example: ["#fb0", "f0f"],
				process: function(bits) {
					return [
						parseInt(bits[1] + bits[1], 16),
						parseInt(bits[2] + bits[2], 16),
						parseInt(bits[3] + bits[3], 16)
					];
				}
			}
		];
		for (var i = 0; i < color_defs.length; i++) {
			var re = color_defs[i].re;
			var processor = color_defs[i].process;
			var bits = re.exec(color_string);
			if (bits) {
				var channels = processor(bits);
				this.r = channels[0];
				this.g = channels[1];
				this.b = channels[2];
				if (channels.length > 3) this.alpha = channels[3];
				this.ok = true;
			}
		}
		this.r = this.r < 0 || isNaN(this.r) ? 0 : this.r > 255 ? 255 : this.r;
		this.g = this.g < 0 || isNaN(this.g) ? 0 : this.g > 255 ? 255 : this.g;
		this.b = this.b < 0 || isNaN(this.b) ? 0 : this.b > 255 ? 255 : this.b;
		this.alpha = this.alpha < 0 ? 0 : this.alpha > 1 || isNaN(this.alpha) ? 1 : this.alpha;
		this.toRGB = function() {
			return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
		};
		this.toRGBA = function() {
			return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.alpha + ")";
		};
		this.toHex = function() {
			var r = this.r.toString(16);
			var g = this.g.toString(16);
			var b = this.b.toString(16);
			if (r.length == 1) r = "0" + r;
			if (g.length == 1) g = "0" + g;
			if (b.length == 1) b = "0" + b;
			return "#" + r + g + b;
		};
		this.getHelpXML = function() {
			var examples = new Array();
			for (var i = 0; i < color_defs.length; i++) {
				var example = color_defs[i].example;
				for (var j = 0; j < example.length; j++) examples[examples.length] = example[j];
			}
			for (var sc in simple_colors) examples[examples.length] = sc;
			var xml = document.createElement("ul");
			xml.setAttribute("id", "rgbcolor-examples");
			for (var i = 0; i < examples.length; i++) try {
				var list_item = document.createElement("li");
				var list_color = new RGBColor(examples[i]);
				var example_div = document.createElement("div");
				example_div.style.cssText = "margin: 3px; border: 1px solid black; background:" + list_color.toHex() + "; color:" + list_color.toHex();
				example_div.appendChild(document.createTextNode("test"));
				var list_item_value = document.createTextNode(" " + examples[i] + " -> " + list_color.toRGB() + " -> " + list_color.toHex());
				list_item.appendChild(example_div);
				list_item.appendChild(list_item_value);
				xml.appendChild(list_item);
			} catch (e) {}
			return xml;
		};
	};
}));
//#endregion
//#region node_modules/core-js/internals/array-for-each.js
var require_array_for_each = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var $forEach = require_array_iteration().forEach;
	module.exports = !require_array_method_is_strict()("forEach") ? function forEach(callbackfn) {
		return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
	} : [].forEach;
}));
//#endregion
//#region node_modules/core-js/modules/es.array.for-each.js
var require_es_array_for_each = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var forEach = require_array_for_each();
	$({
		target: "Array",
		proto: true,
		forced: [].forEach !== forEach
	}, { forEach });
}));
//#endregion
//#region node_modules/core-js/internals/dom-iterables.js
var require_dom_iterables = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		CSSRuleList: 0,
		CSSStyleDeclaration: 0,
		CSSValueList: 0,
		ClientRectList: 0,
		DOMRectList: 0,
		DOMStringList: 0,
		DOMTokenList: 1,
		DataTransferItemList: 0,
		FileList: 0,
		HTMLAllCollection: 0,
		HTMLCollection: 0,
		HTMLFormElement: 0,
		HTMLSelectElement: 0,
		MediaList: 0,
		MimeTypeArray: 0,
		NamedNodeMap: 0,
		NodeList: 1,
		PaintRequestList: 0,
		Plugin: 0,
		PluginArray: 0,
		SVGLengthList: 0,
		SVGNumberList: 0,
		SVGPathSegList: 0,
		SVGPointList: 0,
		SVGStringList: 0,
		SVGTransformList: 0,
		SourceBufferList: 0,
		StyleSheetList: 0,
		TextTrackCueList: 0,
		TextTrackList: 0,
		TouchList: 0
	};
}));
//#endregion
//#region node_modules/core-js/internals/dom-token-list-prototype.js
var require_dom_token_list_prototype = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var classList = require_document_create_element()("span").classList;
	var DOMTokenListPrototype = classList && classList.constructor && classList.constructor.prototype;
	module.exports = DOMTokenListPrototype === Object.prototype ? void 0 : DOMTokenListPrototype;
}));
//#endregion
//#region node_modules/core-js/modules/web.dom-collections.for-each.js
var require_web_dom_collections_for_each = /* @__PURE__ */ __commonJSMin((() => {
	var globalThis = require_global_this();
	var DOMIterables = require_dom_iterables();
	var DOMTokenListPrototype = require_dom_token_list_prototype();
	var forEach = require_array_for_each();
	var createNonEnumerableProperty = require_create_non_enumerable_property();
	var handlePrototype = function(CollectionPrototype) {
		if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
			createNonEnumerableProperty(CollectionPrototype, "forEach", forEach);
		} catch (error) {
			CollectionPrototype.forEach = forEach;
		}
	};
	for (var COLLECTION_NAME in DOMIterables) if (DOMIterables[COLLECTION_NAME]) handlePrototype(globalThis[COLLECTION_NAME] && globalThis[COLLECTION_NAME].prototype);
	handlePrototype(DOMTokenListPrototype);
}));
//#endregion
//#region node_modules/core-js/internals/call-with-safe-iteration-closing.js
var require_call_with_safe_iteration_closing = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var anObject = require_an_object();
	var iteratorClose = require_iterator_close();
	module.exports = function(iterator, fn, value, ENTRIES) {
		try {
			return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
		} catch (error) {
			iteratorClose(iterator, "throw", error);
		}
	};
}));
//#endregion
//#region node_modules/core-js/internals/array-from.js
var require_array_from = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var bind = require_function_bind_context();
	var call = require_function_call();
	var toObject = require_to_object();
	var callWithSafeIterationClosing = require_call_with_safe_iteration_closing();
	var isArrayIteratorMethod = require_is_array_iterator_method();
	var isConstructor = require_is_constructor();
	var lengthOfArrayLike = require_length_of_array_like();
	var createProperty = require_create_property();
	var setArrayLength = require_array_set_length();
	var getIterator = require_get_iterator_internal();
	var getIteratorMethod = require_get_iterator_method_internal();
	var iteratorClose = require_iterator_close();
	var doesNotExceedSafeInteger = require_does_not_exceed_safe_integer();
	var $Array = Array;
	module.exports = function from(arrayLike) {
		var IS_CONSTRUCTOR = isConstructor(this);
		var argumentsLength = arguments.length;
		var mapfn = argumentsLength > 1 ? arguments[1] : void 0;
		var mapping = mapfn !== void 0;
		if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : void 0);
		var O = toObject(arrayLike);
		var iteratorMethod = getIteratorMethod(O);
		var index = 0;
		var length, result, step, iterator, next, value;
		if (iteratorMethod && !(this === $Array && isArrayIteratorMethod(iteratorMethod))) {
			result = IS_CONSTRUCTOR ? new this() : [];
			iterator = getIterator(O, iteratorMethod);
			next = iterator.next;
			for (; !(step = call(next, iterator)).done; index++) {
				try {
					doesNotExceedSafeInteger(index);
				} catch (error) {
					iteratorClose(iterator, "throw", error);
				}
				value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
				try {
					createProperty(result, index, value);
				} catch (error) {
					iteratorClose(iterator, "throw", error);
				}
			}
		} else {
			length = lengthOfArrayLike(O);
			result = IS_CONSTRUCTOR ? new this(length) : $Array(length);
			for (; length > index; index++) {
				value = mapping ? mapfn(O[index], index) : O[index];
				createProperty(result, index, value);
			}
		}
		setArrayLength(result, index);
		return result;
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.array.from.js
var require_es_array_from = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var from = require_array_from();
	$({
		target: "Array",
		stat: true,
		forced: !require_check_correctness_of_iteration()(function(iterable) {
			Array.from(iterable);
		})
	}, { from });
}));
//#endregion
//#region node_modules/core-js/internals/add-to-unscopables.js
var require_add_to_unscopables = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var wellKnownSymbol = require_well_known_symbol();
	var create = require_object_create();
	var defineProperty = require_object_define_property().f;
	var UNSCOPABLES = wellKnownSymbol("unscopables");
	var ArrayPrototype = Array.prototype;
	if (ArrayPrototype[UNSCOPABLES] === void 0) defineProperty(ArrayPrototype, UNSCOPABLES, {
		configurable: true,
		value: create(null)
	});
	module.exports = function(key) {
		ArrayPrototype[UNSCOPABLES][key] = true;
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.array.includes.js
var require_es_array_includes = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var $includes = require_array_includes().includes;
	var fails = require_fails();
	var addToUnscopables = require_add_to_unscopables();
	var BROKEN_ON_SPARSE = fails(function() {
		return !Array(1).includes();
	});
	var BROKEN_ON_SPARSE_WITH_FROM_INDEX = fails(function() {
		return [, 1].includes(void 0, 1);
	});
	$({
		target: "Array",
		proto: true,
		forced: BROKEN_ON_SPARSE || BROKEN_ON_SPARSE_WITH_FROM_INDEX
	}, { includes: function includes(el) {
		return $includes(this, el, arguments.length > 1 ? arguments[1] : void 0);
	} });
	addToUnscopables("includes");
}));
//#endregion
//#region node_modules/core-js/modules/es.array.index-of.js
var require_es_array_index_of = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var uncurryThis = require_function_uncurry_this_clause();
	var $indexOf = require_array_includes().indexOf;
	var arrayMethodIsStrict = require_array_method_is_strict();
	var nativeIndexOf = uncurryThis([].indexOf);
	var NEGATIVE_ZERO = !!nativeIndexOf && 1 / nativeIndexOf([1], 1, -0) < 0;
	$({
		target: "Array",
		proto: true,
		forced: NEGATIVE_ZERO || !arrayMethodIsStrict("indexOf")
	}, { indexOf: function indexOf(searchElement) {
		var fromIndex = arguments.length > 1 ? arguments[1] : void 0;
		return NEGATIVE_ZERO ? nativeIndexOf(this, searchElement, fromIndex) || 0 : $indexOf(this, searchElement, fromIndex);
	} });
}));
//#endregion
//#region node_modules/core-js/modules/es.array.some.js
var require_es_array_some = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var $some = require_array_iteration().some;
	$({
		target: "Array",
		proto: true,
		forced: !require_array_method_is_strict()("some")
	}, { some: function some(callbackfn) {
		return $some(this, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
	} });
}));
//#endregion
//#region node_modules/core-js/modules/es.string.includes.js
var require_es_string_includes = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var uncurryThis = require_function_uncurry_this();
	var notARegExp = require_not_a_regexp();
	var requireObjectCoercible = require_require_object_coercible();
	var toString = require_to_string();
	var correctIsRegExpLogic = require_correct_is_regexp_logic();
	var stringIndexOf = uncurryThis("".indexOf);
	$({
		target: "String",
		proto: true,
		forced: !correctIsRegExpLogic("includes")
	}, { includes: function includes(searchString) {
		return !!~stringIndexOf(toString(requireObjectCoercible(this)), toString(notARegExp(searchString)), arguments.length > 1 ? arguments[1] : void 0);
	} });
}));
//#endregion
//#region node_modules/core-js/internals/correct-prototype-getter.js
var require_correct_prototype_getter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = !require_fails()(function() {
		function F() {}
		F.prototype.constructor = null;
		return Object.getPrototypeOf(new F()) !== F.prototype;
	});
}));
//#endregion
//#region node_modules/core-js/internals/object-get-prototype-of.js
var require_object_get_prototype_of = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var hasOwn = require_has_own_property();
	var isCallable = require_is_callable();
	var toObject = require_to_object();
	var sharedKey = require_shared_key();
	var CORRECT_PROTOTYPE_GETTER = require_correct_prototype_getter();
	var IE_PROTO = sharedKey("IE_PROTO");
	var $Object = Object;
	var ObjectPrototype = $Object.prototype;
	module.exports = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function(O) {
		var object = toObject(O);
		if (hasOwn(object, IE_PROTO)) return object[IE_PROTO];
		var constructor = object.constructor;
		if (isCallable(constructor) && object instanceof constructor) return constructor.prototype;
		return object instanceof $Object ? ObjectPrototype : null;
	};
}));
//#endregion
//#region node_modules/core-js/internals/iterators-core.js
var require_iterators_core = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fails = require_fails();
	var isCallable = require_is_callable();
	var isObject = require_is_object();
	var create = require_object_create();
	var getPrototypeOf = require_object_get_prototype_of();
	var defineBuiltIn = require_define_built_in();
	var wellKnownSymbol = require_well_known_symbol();
	var IS_PURE = require_is_pure();
	var ITERATOR = wellKnownSymbol("iterator");
	var BUGGY_SAFARI_ITERATORS = false;
	var IteratorPrototype;
	var PrototypeOfArrayIteratorPrototype;
	var arrayIterator;
	if ([].keys) {
		arrayIterator = [].keys();
		if (!("next" in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
		else {
			PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
			if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
		}
	}
	if (!isObject(IteratorPrototype) || fails(function() {
		var test = {};
		return IteratorPrototype[ITERATOR].call(test) !== test;
	})) IteratorPrototype = {};
	else if (IS_PURE) IteratorPrototype = create(IteratorPrototype);
	if (!isCallable(IteratorPrototype[ITERATOR])) defineBuiltIn(IteratorPrototype, ITERATOR, function() {
		return this;
	});
	module.exports = {
		IteratorPrototype,
		BUGGY_SAFARI_ITERATORS
	};
}));
//#endregion
//#region node_modules/core-js/internals/iterator-create-constructor.js
var require_iterator_create_constructor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var IteratorPrototype = require_iterators_core().IteratorPrototype;
	var create = require_object_create();
	var createPropertyDescriptor = require_create_property_descriptor();
	var setToStringTag = require_set_to_string_tag();
	var Iterators = require_iterators();
	var returnThis = function() {
		return this;
	};
	module.exports = function(IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
		var TO_STRING_TAG = NAME + " Iterator";
		IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next) });
		setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
		Iterators[TO_STRING_TAG] = returnThis;
		return IteratorConstructor;
	};
}));
//#endregion
//#region node_modules/core-js/internals/iterator-define.js
var require_iterator_define = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var $ = require_export();
	var call = require_function_call();
	var IS_PURE = require_is_pure();
	var FunctionName = require_function_name();
	var isCallable = require_is_callable();
	var createIteratorConstructor = require_iterator_create_constructor();
	var getPrototypeOf = require_object_get_prototype_of();
	var setPrototypeOf = require_object_set_prototype_of();
	var setToStringTag = require_set_to_string_tag();
	var createNonEnumerableProperty = require_create_non_enumerable_property();
	var defineBuiltIn = require_define_built_in();
	var wellKnownSymbol = require_well_known_symbol();
	var Iterators = require_iterators();
	var IteratorsCore = require_iterators_core();
	var PROPER_FUNCTION_NAME = FunctionName.PROPER;
	var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
	var IteratorPrototype = IteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR = wellKnownSymbol("iterator");
	var KEYS = "keys";
	var VALUES = "values";
	var ENTRIES = "entries";
	var returnThis = function() {
		return this;
	};
	module.exports = function(Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
		createIteratorConstructor(IteratorConstructor, NAME, next);
		var getIterationMethod = function(KIND) {
			if (KIND === DEFAULT && defaultIterator) return defaultIterator;
			if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];
			switch (KIND) {
				case KEYS: return function keys() {
					return new IteratorConstructor(this, KIND);
				};
				case VALUES: return function values() {
					return new IteratorConstructor(this, KIND);
				};
				case ENTRIES: return function entries() {
					return new IteratorConstructor(this, KIND);
				};
			}
			return function() {
				return new IteratorConstructor(this);
			};
		};
		var TO_STRING_TAG = NAME + " Iterator";
		var INCORRECT_VALUES_NAME = false;
		var IterablePrototype = Iterable.prototype;
		var nativeIterator = IterablePrototype[ITERATOR] || IterablePrototype["@@iterator"] || DEFAULT && IterablePrototype[DEFAULT];
		var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
		var anyNativeIterator = NAME === "Array" ? IterablePrototype.entries || nativeIterator : nativeIterator;
		var CurrentIteratorPrototype, methods, KEY;
		if (anyNativeIterator) {
			CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
			if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
				if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
					if (setPrototypeOf) setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
					else if (!isCallable(CurrentIteratorPrototype[ITERATOR])) defineBuiltIn(CurrentIteratorPrototype, ITERATOR, returnThis);
				}
				setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
				if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
			}
		}
		if (PROPER_FUNCTION_NAME && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
			if (!IS_PURE && CONFIGURABLE_FUNCTION_NAME) createNonEnumerableProperty(IterablePrototype, "name", VALUES);
			else {
				INCORRECT_VALUES_NAME = true;
				defaultIterator = function values() {
					return call(nativeIterator, this);
				};
			}
		}
		if (DEFAULT) {
			methods = {
				values: getIterationMethod(VALUES),
				keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
				entries: getIterationMethod(ENTRIES)
			};
			if (FORCED) {
				for (KEY in methods) if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) defineBuiltIn(IterablePrototype, KEY, methods[KEY]);
			} else $({
				target: NAME,
				proto: true,
				forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME
			}, methods);
		}
		if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) defineBuiltIn(IterablePrototype, ITERATOR, defaultIterator, { name: DEFAULT });
		Iterators[NAME] = defaultIterator;
		return methods;
	};
}));
//#endregion
//#region node_modules/core-js/internals/create-iter-result-object.js
var require_create_iter_result_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function(value, done) {
		return {
			value,
			done
		};
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.string.iterator.js
var require_es_string_iterator = /* @__PURE__ */ __commonJSMin((() => {
	var charAt = require_string_multibyte().charAt;
	var toString = require_to_string();
	var InternalStateModule = require_internal_state();
	var defineIterator = require_iterator_define();
	var createIterResultObject = require_create_iter_result_object();
	var STRING_ITERATOR = "String Iterator";
	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);
	defineIterator(String, "String", function(iterated) {
		setInternalState(this, {
			type: STRING_ITERATOR,
			string: toString(iterated),
			index: 0
		});
	}, function next() {
		var state = getInternalState(this);
		var string = state.string;
		var index = state.index;
		var point;
		if (index >= string.length) return createIterResultObject(void 0, true);
		point = charAt(string, index);
		state.index += point.length;
		return createIterResultObject(point, false);
	});
}));
//#endregion
//#region node_modules/core-js/modules/es.array.reverse.js
var require_es_array_reverse = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var uncurryThis = require_function_uncurry_this();
	var isArray = require_is_array();
	var nativeReverse = uncurryThis([].reverse);
	var test = [1, 2];
	$({
		target: "Array",
		proto: true,
		forced: String(test) === String(test.reverse())
	}, { reverse: function reverse() {
		if (isArray(this)) this.length = this.length;
		return nativeReverse(this);
	} });
}));
//#endregion
//#region node_modules/core-js/internals/inherit-if-required.js
var require_inherit_if_required = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isCallable = require_is_callable();
	var isObject = require_is_object();
	var setPrototypeOf = require_object_set_prototype_of();
	module.exports = function($this, dummy, Wrapper) {
		var NewTarget, NewTargetPrototype;
		if (setPrototypeOf && isCallable(NewTarget = dummy.constructor) && NewTarget !== Wrapper && isObject(NewTargetPrototype = NewTarget.prototype) && NewTargetPrototype !== Wrapper.prototype) setPrototypeOf($this, NewTargetPrototype);
		return $this;
	};
}));
//#endregion
//#region node_modules/core-js/internals/this-number-value.js
var require_this_number_value = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_function_uncurry_this()(1.1.valueOf);
}));
//#endregion
//#region node_modules/core-js/modules/es.number.constructor.js
var require_es_number_constructor = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var IS_PURE = require_is_pure();
	var DESCRIPTORS = require_descriptors();
	var globalThis = require_global_this();
	var path = require_path();
	var uncurryThis = require_function_uncurry_this();
	var isForced = require_is_forced();
	var hasOwn = require_has_own_property();
	var inheritIfRequired = require_inherit_if_required();
	var isPrototypeOf = require_object_is_prototype_of();
	var isSymbol = require_is_symbol();
	var toPrimitive = require_to_primitive();
	var fails = require_fails();
	var getOwnPropertyNames = require_object_get_own_property_names().f;
	var getOwnPropertyDescriptor = require_object_get_own_property_descriptor().f;
	var defineProperty = require_object_define_property().f;
	var thisNumberValue = require_this_number_value();
	var trim = require_string_trim().trim;
	var NUMBER = "Number";
	var NativeNumber = globalThis[NUMBER];
	var PureNumberNamespace = path[NUMBER];
	var NumberPrototype = NativeNumber.prototype;
	var TypeError = globalThis.TypeError;
	var stringSlice = uncurryThis("".slice);
	var charCodeAt = uncurryThis("".charCodeAt);
	var toNumeric = function(value) {
		var primValue = toPrimitive(value, "number");
		return typeof primValue == "bigint" ? primValue : toNumber(primValue);
	};
	var toNumber = function(argument) {
		var it = toPrimitive(argument, "number");
		var first, third, radix, maxCode, digits, length, index, code;
		if (isSymbol(it)) throw new TypeError("Cannot convert a Symbol value to a number");
		if (typeof it == "string" && it.length > 2) {
			it = trim(it);
			first = charCodeAt(it, 0);
			if (first === 43 || first === 45) {
				third = charCodeAt(it, 2);
				if (third === 88 || third === 120) return NaN;
			} else if (first === 48) {
				switch (charCodeAt(it, 1)) {
					case 66:
					case 98:
						radix = 2;
						maxCode = 49;
						break;
					case 79:
					case 111:
						radix = 8;
						maxCode = 55;
						break;
					default: return +it;
				}
				digits = stringSlice(it, 2);
				length = digits.length;
				for (index = 0; index < length; index++) {
					code = charCodeAt(digits, index);
					if (code < 48 || code > maxCode) return NaN;
				}
				return parseInt(digits, radix);
			}
		}
		return +it;
	};
	var FORCED = isForced(NUMBER, !NativeNumber(" 0o1") || !NativeNumber("0b1") || NativeNumber("+0x1"));
	var calledWithNew = function(dummy) {
		return isPrototypeOf(NumberPrototype, dummy) && fails(function() {
			thisNumberValue(dummy);
		});
	};
	var NumberWrapper = function Number(value) {
		var n = arguments.length < 1 ? 0 : NativeNumber(toNumeric(value));
		return calledWithNew(this) ? inheritIfRequired(Object(n), this, NumberWrapper) : n;
	};
	NumberWrapper.prototype = NumberPrototype;
	if (FORCED && !IS_PURE) NumberPrototype.constructor = NumberWrapper;
	$({
		global: true,
		constructor: true,
		wrap: true,
		forced: FORCED
	}, { Number: NumberWrapper });
	var copyConstructorProperties = function(target, source) {
		for (var keys = DESCRIPTORS ? getOwnPropertyNames(source) : "MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,isFinite,isInteger,isNaN,isSafeInteger,parseFloat,parseInt,fromString,range".split(","), j = 0, key; keys.length > j; j++) if (hasOwn(source, key = keys[j]) && !hasOwn(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	};
	if (IS_PURE && PureNumberNamespace) copyConstructorProperties(path[NUMBER], PureNumberNamespace);
	if (FORCED || IS_PURE) copyConstructorProperties(path[NUMBER], NativeNumber);
}));
//#endregion
//#region node_modules/core-js/internals/array-fill.js
var require_array_fill = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var toObject = require_to_object();
	var toAbsoluteIndex = require_to_absolute_index();
	var lengthOfArrayLike = require_length_of_array_like();
	module.exports = [].fill || function fill(value) {
		var O = toObject(this);
		var length = lengthOfArrayLike(O);
		var argumentsLength = arguments.length;
		var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : void 0, length);
		var end = argumentsLength > 2 ? arguments[2] : void 0;
		var endPos = end === void 0 ? length : toAbsoluteIndex(end, length);
		while (endPos > index) O[index++] = value;
		return O;
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.array.fill.js
var require_es_array_fill = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var fill = require_array_fill();
	var addToUnscopables = require_add_to_unscopables();
	$({
		target: "Array",
		proto: true
	}, { fill });
	addToUnscopables("fill");
}));
//#endregion
//#region node_modules/svg-pathdata/lib/SVGPathData.cjs
var require_SVGPathData = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(t, r) {
		"object" == typeof exports && "undefined" != typeof module ? r(exports) : "function" == typeof define && define.amd ? define(["exports"], r) : r((t = "undefined" != typeof globalThis ? globalThis : t || self).svgpathdata = {});
	})(exports, (function(t) {
		"use strict";
		/*! *****************************************************************************
		Copyright (c) Microsoft Corporation.
		
		Permission to use, copy, modify, and/or distribute this software for any
		purpose with or without fee is hereby granted.
		
		THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
		REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
		AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
		INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
		LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
		OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
		PERFORMANCE OF THIS SOFTWARE.
		***************************************************************************** */ var r = function(t, e) {
			return (r = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t, r) {
				t.__proto__ = r;
			} || function(t, r) {
				for (var e in r) Object.prototype.hasOwnProperty.call(r, e) && (t[e] = r[e]);
			})(t, e);
		};
		function e(t, e) {
			if ("function" != typeof e && null !== e) throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
			function a() {
				this.constructor = t;
			}
			r(t, e), t.prototype = null === e ? Object.create(e) : (a.prototype = e.prototype, new a());
		}
		var a = " ";
		function i(t) {
			var r = "";
			Array.isArray(t) || (t = [t]);
			for (var e = 0; e < t.length; e++) {
				var i = t[e];
				if (i.type === N.CLOSE_PATH) r += "z";
				else if (i.type === N.HORIZ_LINE_TO) r += (i.relative ? "h" : "H") + i.x;
				else if (i.type === N.VERT_LINE_TO) r += (i.relative ? "v" : "V") + i.y;
				else if (i.type === N.MOVE_TO) r += (i.relative ? "m" : "M") + i.x + a + i.y;
				else if (i.type === N.LINE_TO) r += (i.relative ? "l" : "L") + i.x + a + i.y;
				else if (i.type === N.CURVE_TO) r += (i.relative ? "c" : "C") + i.x1 + a + i.y1 + a + i.x2 + a + i.y2 + a + i.x + a + i.y;
				else if (i.type === N.SMOOTH_CURVE_TO) r += (i.relative ? "s" : "S") + i.x2 + a + i.y2 + a + i.x + a + i.y;
				else if (i.type === N.QUAD_TO) r += (i.relative ? "q" : "Q") + i.x1 + a + i.y1 + a + i.x + a + i.y;
				else if (i.type === N.SMOOTH_QUAD_TO) r += (i.relative ? "t" : "T") + i.x + a + i.y;
				else {
					if (i.type !== N.ARC) throw new Error("Unexpected command type \"" + i.type + "\" at index " + e + ".");
					r += (i.relative ? "a" : "A") + i.rX + a + i.rY + a + i.xRot + a + +i.lArcFlag + a + +i.sweepFlag + a + i.x + a + i.y;
				}
			}
			return r;
		}
		function n(t, r) {
			var e = t[0], a = t[1];
			return [e * Math.cos(r) - a * Math.sin(r), e * Math.sin(r) + a * Math.cos(r)];
		}
		function o() {
			for (var t = [], r = 0; r < arguments.length; r++) t[r] = arguments[r];
			for (var e = 0; e < t.length; e++) if ("number" != typeof t[e]) throw new Error("assertNumbers arguments[" + e + "] is not a number. " + typeof t[e] + " == typeof " + t[e]);
			return !0;
		}
		var s = Math.PI;
		function u(t, r, e) {
			t.lArcFlag = 0 === t.lArcFlag ? 0 : 1, t.sweepFlag = 0 === t.sweepFlag ? 0 : 1;
			var a = t.rX, i = t.rY, o = t.x, u = t.y;
			a = Math.abs(t.rX), i = Math.abs(t.rY);
			var h = n([(r - o) / 2, (e - u) / 2], -t.xRot / 180 * s), c = h[0], m = h[1], y = Math.pow(c, 2) / Math.pow(a, 2) + Math.pow(m, 2) / Math.pow(i, 2);
			1 < y && (a *= Math.sqrt(y), i *= Math.sqrt(y)), t.rX = a, t.rY = i;
			var p = Math.pow(a, 2) * Math.pow(m, 2) + Math.pow(i, 2) * Math.pow(c, 2), f = (t.lArcFlag !== t.sweepFlag ? 1 : -1) * Math.sqrt(Math.max(0, (Math.pow(a, 2) * Math.pow(i, 2) - p) / p)), T = a * m / i * f, O = -i * c / a * f, l = n([T, O], t.xRot / 180 * s);
			t.cX = l[0] + (r + o) / 2, t.cY = l[1] + (e + u) / 2, t.phi1 = Math.atan2((m - O) / i, (c - T) / a), t.phi2 = Math.atan2((-m - O) / i, (-c - T) / a), 0 === t.sweepFlag && t.phi2 > t.phi1 && (t.phi2 -= 2 * s), 1 === t.sweepFlag && t.phi2 < t.phi1 && (t.phi2 += 2 * s), t.phi1 *= 180 / s, t.phi2 *= 180 / s;
		}
		function h(t, r, e) {
			o(t, r, e);
			var a = t * t + r * r - e * e;
			if (0 > a) return [];
			if (0 === a) return [[t * e / (t * t + r * r), r * e / (t * t + r * r)]];
			var i = Math.sqrt(a);
			return [[(t * e + r * i) / (t * t + r * r), (r * e - t * i) / (t * t + r * r)], [(t * e - r * i) / (t * t + r * r), (r * e + t * i) / (t * t + r * r)]];
		}
		var c = Math.PI / 180;
		function m(t, r, e) {
			return (1 - e) * t + e * r;
		}
		function y(t, r, e, a) {
			return t + Math.cos(a / 180 * s) * r + Math.sin(a / 180 * s) * e;
		}
		function p(t, r, e, a) {
			var i = 1e-6, n = r - t, o = e - r, s = 3 * n + 3 * (a - e) - 6 * o, u = 6 * (o - n), h = 3 * n;
			return Math.abs(s) < i ? [-h / u] : function(t, r, e) {
				void 0 === e && (e = 1e-6);
				var a = t * t / 4 - r;
				if (a < -e) return [];
				if (a <= e) return [-t / 2];
				var i = Math.sqrt(a);
				return [-t / 2 - i, -t / 2 + i];
			}(u / s, h / s, i);
		}
		function f(t, r, e, a, i) {
			var n = 1 - i;
			return t * (n * n * n) + r * (3 * n * n * i) + e * (3 * n * i * i) + a * (i * i * i);
		}
		t.SVGPathDataTransformer = void 0, function(t) {
			function r() {
				return i((function(t, r, e) {
					return t.relative && (void 0 !== t.x1 && (t.x1 += r), void 0 !== t.y1 && (t.y1 += e), void 0 !== t.x2 && (t.x2 += r), void 0 !== t.y2 && (t.y2 += e), void 0 !== t.x && (t.x += r), void 0 !== t.y && (t.y += e), t.relative = !1), t;
				}));
			}
			function e() {
				var t = NaN, r = NaN, e = NaN, a = NaN;
				return i((function(i, n, o) {
					return i.type & N.SMOOTH_CURVE_TO && (i.type = N.CURVE_TO, t = isNaN(t) ? n : t, r = isNaN(r) ? o : r, i.x1 = i.relative ? n - t : 2 * n - t, i.y1 = i.relative ? o - r : 2 * o - r), i.type & N.CURVE_TO ? (t = i.relative ? n + i.x2 : i.x2, r = i.relative ? o + i.y2 : i.y2) : (t = NaN, r = NaN), i.type & N.SMOOTH_QUAD_TO && (i.type = N.QUAD_TO, e = isNaN(e) ? n : e, a = isNaN(a) ? o : a, i.x1 = i.relative ? n - e : 2 * n - e, i.y1 = i.relative ? o - a : 2 * o - a), i.type & N.QUAD_TO ? (e = i.relative ? n + i.x1 : i.x1, a = i.relative ? o + i.y1 : i.y1) : (e = NaN, a = NaN), i;
				}));
			}
			function a() {
				var t = NaN, r = NaN;
				return i((function(e, a, i) {
					if (e.type & N.SMOOTH_QUAD_TO && (e.type = N.QUAD_TO, t = isNaN(t) ? a : t, r = isNaN(r) ? i : r, e.x1 = e.relative ? a - t : 2 * a - t, e.y1 = e.relative ? i - r : 2 * i - r), e.type & N.QUAD_TO) {
						t = e.relative ? a + e.x1 : e.x1, r = e.relative ? i + e.y1 : e.y1;
						var n = e.x1, o = e.y1;
						e.type = N.CURVE_TO, e.x1 = ((e.relative ? 0 : a) + 2 * n) / 3, e.y1 = ((e.relative ? 0 : i) + 2 * o) / 3, e.x2 = (e.x + 2 * n) / 3, e.y2 = (e.y + 2 * o) / 3;
					} else t = NaN, r = NaN;
					return e;
				}));
			}
			function i(t) {
				var r = 0, e = 0, a = NaN, i = NaN;
				return function(n) {
					if (isNaN(a) && !(n.type & N.MOVE_TO)) throw new Error("path must start with moveto");
					var o = t(n, r, e, a, i);
					return n.type & N.CLOSE_PATH && (r = a, e = i), void 0 !== n.x && (r = n.relative ? r + n.x : n.x), void 0 !== n.y && (e = n.relative ? e + n.y : n.y), n.type & N.MOVE_TO && (a = r, i = e), o;
				};
			}
			function s(t, r, e, a, n, s) {
				return o(t, r, e, a, n, s), i((function(i, o, u, h) {
					var c = i.x1, m = i.x2, y = i.relative && !isNaN(h), p = void 0 !== i.x ? i.x : y ? 0 : o, f = void 0 !== i.y ? i.y : y ? 0 : u;
					function T(t) {
						return t * t;
					}
					i.type & N.HORIZ_LINE_TO && 0 !== r && (i.type = N.LINE_TO, i.y = i.relative ? 0 : u), i.type & N.VERT_LINE_TO && 0 !== e && (i.type = N.LINE_TO, i.x = i.relative ? 0 : o), void 0 !== i.x && (i.x = i.x * t + f * e + (y ? 0 : n)), void 0 !== i.y && (i.y = p * r + i.y * a + (y ? 0 : s)), void 0 !== i.x1 && (i.x1 = i.x1 * t + i.y1 * e + (y ? 0 : n)), void 0 !== i.y1 && (i.y1 = c * r + i.y1 * a + (y ? 0 : s)), void 0 !== i.x2 && (i.x2 = i.x2 * t + i.y2 * e + (y ? 0 : n)), void 0 !== i.y2 && (i.y2 = m * r + i.y2 * a + (y ? 0 : s));
					var O = t * a - r * e;
					if (void 0 !== i.xRot && (1 !== t || 0 !== r || 0 !== e || 1 !== a)) if (0 === O) delete i.rX, delete i.rY, delete i.xRot, delete i.lArcFlag, delete i.sweepFlag, i.type = N.LINE_TO;
					else {
						var l = i.xRot * Math.PI / 180, v = Math.sin(l), _ = Math.cos(l), d = 1 / T(i.rX), x = 1 / T(i.rY), A = T(_) * d + T(v) * x, E = 2 * v * _ * (d - x), C = T(v) * d + T(_) * x, M = A * a * a - E * r * a + C * r * r, R = E * (t * a + r * e) - 2 * (A * e * a + C * t * r), S = A * e * e - E * t * e + C * t * t, g = (Math.atan2(R, M - S) + Math.PI) % Math.PI / 2, I = Math.sin(g), V = Math.cos(g);
						i.rX = Math.abs(O) / Math.sqrt(M * T(V) + R * I * V + S * T(I)), i.rY = Math.abs(O) / Math.sqrt(M * T(I) - R * I * V + S * T(V)), i.xRot = 180 * g / Math.PI;
					}
					return void 0 !== i.sweepFlag && 0 > O && (i.sweepFlag = +!i.sweepFlag), i;
				}));
			}
			function T() {
				return function(t) {
					var r = {};
					for (var e in t) r[e] = t[e];
					return r;
				};
			}
			t.ROUND = function(t) {
				function r(r) {
					return Math.round(r * t) / t;
				}
				return void 0 === t && (t = 0x9184e72a000), o(t), function(t) {
					return void 0 !== t.x1 && (t.x1 = r(t.x1)), void 0 !== t.y1 && (t.y1 = r(t.y1)), void 0 !== t.x2 && (t.x2 = r(t.x2)), void 0 !== t.y2 && (t.y2 = r(t.y2)), void 0 !== t.x && (t.x = r(t.x)), void 0 !== t.y && (t.y = r(t.y)), void 0 !== t.rX && (t.rX = r(t.rX)), void 0 !== t.rY && (t.rY = r(t.rY)), t;
				};
			}, t.TO_ABS = r, t.TO_REL = function() {
				return i((function(t, r, e) {
					return t.relative || (void 0 !== t.x1 && (t.x1 -= r), void 0 !== t.y1 && (t.y1 -= e), void 0 !== t.x2 && (t.x2 -= r), void 0 !== t.y2 && (t.y2 -= e), void 0 !== t.x && (t.x -= r), void 0 !== t.y && (t.y -= e), t.relative = !0), t;
				}));
			}, t.NORMALIZE_HVZ = function(t, r, e) {
				return void 0 === t && (t = !0), void 0 === r && (r = !0), void 0 === e && (e = !0), i((function(a, i, n, o, s) {
					if (isNaN(o) && !(a.type & N.MOVE_TO)) throw new Error("path must start with moveto");
					return r && a.type & N.HORIZ_LINE_TO && (a.type = N.LINE_TO, a.y = a.relative ? 0 : n), e && a.type & N.VERT_LINE_TO && (a.type = N.LINE_TO, a.x = a.relative ? 0 : i), t && a.type & N.CLOSE_PATH && (a.type = N.LINE_TO, a.x = a.relative ? o - i : o, a.y = a.relative ? s - n : s), a.type & N.ARC && (0 === a.rX || 0 === a.rY) && (a.type = N.LINE_TO, delete a.rX, delete a.rY, delete a.xRot, delete a.lArcFlag, delete a.sweepFlag), a;
				}));
			}, t.NORMALIZE_ST = e, t.QT_TO_C = a, t.INFO = i, t.SANITIZE = function(t) {
				void 0 === t && (t = 0), o(t);
				var r = NaN, e = NaN, a = NaN, n = NaN;
				return i((function(i, o, s, u, h) {
					var c = Math.abs, m = !1, y = 0, p = 0;
					if (i.type & N.SMOOTH_CURVE_TO && (y = isNaN(r) ? 0 : o - r, p = isNaN(e) ? 0 : s - e), i.type & (N.CURVE_TO | N.SMOOTH_CURVE_TO) ? (r = i.relative ? o + i.x2 : i.x2, e = i.relative ? s + i.y2 : i.y2) : (r = NaN, e = NaN), i.type & N.SMOOTH_QUAD_TO ? (a = isNaN(a) ? o : 2 * o - a, n = isNaN(n) ? s : 2 * s - n) : i.type & N.QUAD_TO ? (a = i.relative ? o + i.x1 : i.x1, n = i.relative ? s + i.y1 : i.y2) : (a = NaN, n = NaN), i.type & N.LINE_COMMANDS || i.type & N.ARC && (0 === i.rX || 0 === i.rY || !i.lArcFlag) || i.type & N.CURVE_TO || i.type & N.SMOOTH_CURVE_TO || i.type & N.QUAD_TO || i.type & N.SMOOTH_QUAD_TO) {
						var f = void 0 === i.x ? 0 : i.relative ? i.x : i.x - o, T = void 0 === i.y ? 0 : i.relative ? i.y : i.y - s;
						y = isNaN(a) ? void 0 === i.x1 ? y : i.relative ? i.x : i.x1 - o : a - o, p = isNaN(n) ? void 0 === i.y1 ? p : i.relative ? i.y : i.y1 - s : n - s;
						var O = void 0 === i.x2 ? 0 : i.relative ? i.x : i.x2 - o, l = void 0 === i.y2 ? 0 : i.relative ? i.y : i.y2 - s;
						c(f) <= t && c(T) <= t && c(y) <= t && c(p) <= t && c(O) <= t && c(l) <= t && (m = !0);
					}
					return i.type & N.CLOSE_PATH && c(o - u) <= t && c(s - h) <= t && (m = !0), m ? [] : i;
				}));
			}, t.MATRIX = s, t.ROTATE = function(t, r, e) {
				void 0 === r && (r = 0), void 0 === e && (e = 0), o(t, r, e);
				var a = Math.sin(t), i = Math.cos(t);
				return s(i, a, -a, i, r - r * i + e * a, e - r * a - e * i);
			}, t.TRANSLATE = function(t, r) {
				return void 0 === r && (r = 0), o(t, r), s(1, 0, 0, 1, t, r);
			}, t.SCALE = function(t, r) {
				return void 0 === r && (r = t), o(t, r), s(t, 0, 0, r, 0, 0);
			}, t.SKEW_X = function(t) {
				return o(t), s(1, 0, Math.atan(t), 1, 0, 0);
			}, t.SKEW_Y = function(t) {
				return o(t), s(1, Math.atan(t), 0, 1, 0, 0);
			}, t.X_AXIS_SYMMETRY = function(t) {
				return void 0 === t && (t = 0), o(t), s(-1, 0, 0, 1, t, 0);
			}, t.Y_AXIS_SYMMETRY = function(t) {
				return void 0 === t && (t = 0), o(t), s(1, 0, 0, -1, 0, t);
			}, t.A_TO_C = function() {
				return i((function(t, r, e) {
					return N.ARC === t.type ? function(t, r, e) {
						var a, i, o, s;
						t.cX || u(t, r, e);
						for (var h = Math.min(t.phi1, t.phi2), y = Math.max(t.phi1, t.phi2) - h, p = Math.ceil(y / 90), f = new Array(p), T = r, O = e, l = 0; l < p; l++) {
							var v = m(t.phi1, t.phi2, l / p), _ = m(t.phi1, t.phi2, (l + 1) / p), d = _ - v, x = 4 / 3 * Math.tan(d * c / 4), A = [Math.cos(v * c) - x * Math.sin(v * c), Math.sin(v * c) + x * Math.cos(v * c)], E = A[0], C = A[1], M = [Math.cos(_ * c), Math.sin(_ * c)], R = M[0], S = M[1], g = [R + x * Math.sin(_ * c), S - x * Math.cos(_ * c)], I = g[0], V = g[1];
							f[l] = {
								relative: t.relative,
								type: N.CURVE_TO
							};
							var D = function(r, e) {
								var a = n([r * t.rX, e * t.rY], t.xRot), i = a[0], o = a[1];
								return [t.cX + i, t.cY + o];
							};
							a = D(E, C), f[l].x1 = a[0], f[l].y1 = a[1], i = D(I, V), f[l].x2 = i[0], f[l].y2 = i[1], o = D(R, S), f[l].x = o[0], f[l].y = o[1], t.relative && (f[l].x1 -= T, f[l].y1 -= O, f[l].x2 -= T, f[l].y2 -= O, f[l].x -= T, f[l].y -= O), T = (s = [f[l].x, f[l].y])[0], O = s[1];
						}
						return f;
					}(t, t.relative ? 0 : r, t.relative ? 0 : e) : t;
				}));
			}, t.ANNOTATE_ARCS = function() {
				return i((function(t, r, e) {
					return t.relative && (r = 0, e = 0), N.ARC === t.type && u(t, r, e), t;
				}));
			}, t.CLONE = T, t.CALCULATE_BOUNDS = function() {
				var t = function(t) {
					var r = {};
					for (var e in t) r[e] = t[e];
					return r;
				}, n = r(), o = a(), s = e(), c = i((function(r, e, a) {
					var i = s(o(n(t(r))));
					function m(t) {
						t > c.maxX && (c.maxX = t), t < c.minX && (c.minX = t);
					}
					function T(t) {
						t > c.maxY && (c.maxY = t), t < c.minY && (c.minY = t);
					}
					if (i.type & N.DRAWING_COMMANDS && (m(e), T(a)), i.type & N.HORIZ_LINE_TO && m(i.x), i.type & N.VERT_LINE_TO && T(i.y), i.type & N.LINE_TO && (m(i.x), T(i.y)), i.type & N.CURVE_TO) {
						m(i.x), T(i.y);
						for (var O = 0, l = p(e, i.x1, i.x2, i.x); O < l.length; O++) 0 < (H = l[O]) && 1 > H && m(f(e, i.x1, i.x2, i.x, H));
						for (var v = 0, _ = p(a, i.y1, i.y2, i.y); v < _.length; v++) 0 < (H = _[v]) && 1 > H && T(f(a, i.y1, i.y2, i.y, H));
					}
					if (i.type & N.ARC) {
						m(i.x), T(i.y), u(i, e, a);
						for (var d = i.xRot / 180 * Math.PI, x = Math.cos(d) * i.rX, A = Math.sin(d) * i.rX, E = -Math.sin(d) * i.rY, C = Math.cos(d) * i.rY, M = i.phi1 < i.phi2 ? [i.phi1, i.phi2] : -180 > i.phi2 ? [i.phi2 + 360, i.phi1 + 360] : [i.phi2, i.phi1], R = M[0], S = M[1], g = function(t) {
							var r = t[0], e = t[1], a = 180 * Math.atan2(e, r) / Math.PI;
							return a < R ? a + 360 : a;
						}, I = 0, V = h(E, -x, 0).map(g); I < V.length; I++) (H = V[I]) > R && H < S && m(y(i.cX, x, E, H));
						for (var D = 0, L = h(C, -A, 0).map(g); D < L.length; D++) {
							var H;
							(H = L[D]) > R && H < S && T(y(i.cY, A, C, H));
						}
					}
					return r;
				}));
				return c.minX = 1 / 0, c.maxX = -1 / 0, c.minY = 1 / 0, c.maxY = -1 / 0, c;
			};
		}(t.SVGPathDataTransformer || (t.SVGPathDataTransformer = {}));
		var T, O = function() {
			function r() {}
			return r.prototype.round = function(r) {
				return this.transform(t.SVGPathDataTransformer.ROUND(r));
			}, r.prototype.toAbs = function() {
				return this.transform(t.SVGPathDataTransformer.TO_ABS());
			}, r.prototype.toRel = function() {
				return this.transform(t.SVGPathDataTransformer.TO_REL());
			}, r.prototype.normalizeHVZ = function(r, e, a) {
				return this.transform(t.SVGPathDataTransformer.NORMALIZE_HVZ(r, e, a));
			}, r.prototype.normalizeST = function() {
				return this.transform(t.SVGPathDataTransformer.NORMALIZE_ST());
			}, r.prototype.qtToC = function() {
				return this.transform(t.SVGPathDataTransformer.QT_TO_C());
			}, r.prototype.aToC = function() {
				return this.transform(t.SVGPathDataTransformer.A_TO_C());
			}, r.prototype.sanitize = function(r) {
				return this.transform(t.SVGPathDataTransformer.SANITIZE(r));
			}, r.prototype.translate = function(r, e) {
				return this.transform(t.SVGPathDataTransformer.TRANSLATE(r, e));
			}, r.prototype.scale = function(r, e) {
				return this.transform(t.SVGPathDataTransformer.SCALE(r, e));
			}, r.prototype.rotate = function(r, e, a) {
				return this.transform(t.SVGPathDataTransformer.ROTATE(r, e, a));
			}, r.prototype.matrix = function(r, e, a, i, n, o) {
				return this.transform(t.SVGPathDataTransformer.MATRIX(r, e, a, i, n, o));
			}, r.prototype.skewX = function(r) {
				return this.transform(t.SVGPathDataTransformer.SKEW_X(r));
			}, r.prototype.skewY = function(r) {
				return this.transform(t.SVGPathDataTransformer.SKEW_Y(r));
			}, r.prototype.xSymmetry = function(r) {
				return this.transform(t.SVGPathDataTransformer.X_AXIS_SYMMETRY(r));
			}, r.prototype.ySymmetry = function(r) {
				return this.transform(t.SVGPathDataTransformer.Y_AXIS_SYMMETRY(r));
			}, r.prototype.annotateArcs = function() {
				return this.transform(t.SVGPathDataTransformer.ANNOTATE_ARCS());
			}, r;
		}(), l = function(t) {
			return " " === t || "	" === t || "\r" === t || "\n" === t;
		}, v = function(t) {
			return "0".charCodeAt(0) <= t.charCodeAt(0) && t.charCodeAt(0) <= "9".charCodeAt(0);
		}, _ = function(t) {
			function r() {
				var r = t.call(this) || this;
				return r.curNumber = "", r.curCommandType = -1, r.curCommandRelative = !1, r.canParseCommandOrComma = !0, r.curNumberHasExp = !1, r.curNumberHasExpDigits = !1, r.curNumberHasDecimal = !1, r.curArgs = [], r;
			}
			return e(r, t), r.prototype.finish = function(t) {
				if (void 0 === t && (t = []), this.parse(" ", t), 0 !== this.curArgs.length || !this.canParseCommandOrComma) throw new SyntaxError("Unterminated command at the path end.");
				return t;
			}, r.prototype.parse = function(t, r) {
				var e = this;
				void 0 === r && (r = []);
				for (var a = function(t) {
					r.push(t), e.curArgs.length = 0, e.canParseCommandOrComma = !0;
				}, i = 0; i < t.length; i++) {
					var n = t[i], o = !(this.curCommandType !== N.ARC || 3 !== this.curArgs.length && 4 !== this.curArgs.length || 1 !== this.curNumber.length || "0" !== this.curNumber && "1" !== this.curNumber), s = v(n) && ("0" === this.curNumber && "0" === n || o);
					if (!v(n) || s) if ("e" !== n && "E" !== n) if ("-" !== n && "+" !== n || !this.curNumberHasExp || this.curNumberHasExpDigits) if ("." !== n || this.curNumberHasExp || this.curNumberHasDecimal || o) {
						if (this.curNumber && -1 !== this.curCommandType) {
							var u = Number(this.curNumber);
							if (isNaN(u)) throw new SyntaxError("Invalid number ending at " + i);
							if (this.curCommandType === N.ARC) {
								if (0 === this.curArgs.length || 1 === this.curArgs.length) {
									if (0 > u) throw new SyntaxError("Expected positive number, got \"" + u + "\" at index \"" + i + "\"");
								} else if ((3 === this.curArgs.length || 4 === this.curArgs.length) && "0" !== this.curNumber && "1" !== this.curNumber) throw new SyntaxError("Expected a flag, got \"" + this.curNumber + "\" at index \"" + i + "\"");
							}
							this.curArgs.push(u), this.curArgs.length === d[this.curCommandType] && (N.HORIZ_LINE_TO === this.curCommandType ? a({
								type: N.HORIZ_LINE_TO,
								relative: this.curCommandRelative,
								x: u
							}) : N.VERT_LINE_TO === this.curCommandType ? a({
								type: N.VERT_LINE_TO,
								relative: this.curCommandRelative,
								y: u
							}) : this.curCommandType === N.MOVE_TO || this.curCommandType === N.LINE_TO || this.curCommandType === N.SMOOTH_QUAD_TO ? (a({
								type: this.curCommandType,
								relative: this.curCommandRelative,
								x: this.curArgs[0],
								y: this.curArgs[1]
							}), N.MOVE_TO === this.curCommandType && (this.curCommandType = N.LINE_TO)) : this.curCommandType === N.CURVE_TO ? a({
								type: N.CURVE_TO,
								relative: this.curCommandRelative,
								x1: this.curArgs[0],
								y1: this.curArgs[1],
								x2: this.curArgs[2],
								y2: this.curArgs[3],
								x: this.curArgs[4],
								y: this.curArgs[5]
							}) : this.curCommandType === N.SMOOTH_CURVE_TO ? a({
								type: N.SMOOTH_CURVE_TO,
								relative: this.curCommandRelative,
								x2: this.curArgs[0],
								y2: this.curArgs[1],
								x: this.curArgs[2],
								y: this.curArgs[3]
							}) : this.curCommandType === N.QUAD_TO ? a({
								type: N.QUAD_TO,
								relative: this.curCommandRelative,
								x1: this.curArgs[0],
								y1: this.curArgs[1],
								x: this.curArgs[2],
								y: this.curArgs[3]
							}) : this.curCommandType === N.ARC && a({
								type: N.ARC,
								relative: this.curCommandRelative,
								rX: this.curArgs[0],
								rY: this.curArgs[1],
								xRot: this.curArgs[2],
								lArcFlag: this.curArgs[3],
								sweepFlag: this.curArgs[4],
								x: this.curArgs[5],
								y: this.curArgs[6]
							})), this.curNumber = "", this.curNumberHasExpDigits = !1, this.curNumberHasExp = !1, this.curNumberHasDecimal = !1, this.canParseCommandOrComma = !0;
						}
						if (!l(n)) if ("," === n && this.canParseCommandOrComma) this.canParseCommandOrComma = !1;
						else if ("+" !== n && "-" !== n && "." !== n) if (s) this.curNumber = n, this.curNumberHasDecimal = !1;
						else {
							if (0 !== this.curArgs.length) throw new SyntaxError("Unterminated command at index " + i + ".");
							if (!this.canParseCommandOrComma) throw new SyntaxError("Unexpected character \"" + n + "\" at index " + i + ". Command cannot follow comma");
							if (this.canParseCommandOrComma = !1, "z" !== n && "Z" !== n) if ("h" === n || "H" === n) this.curCommandType = N.HORIZ_LINE_TO, this.curCommandRelative = "h" === n;
							else if ("v" === n || "V" === n) this.curCommandType = N.VERT_LINE_TO, this.curCommandRelative = "v" === n;
							else if ("m" === n || "M" === n) this.curCommandType = N.MOVE_TO, this.curCommandRelative = "m" === n;
							else if ("l" === n || "L" === n) this.curCommandType = N.LINE_TO, this.curCommandRelative = "l" === n;
							else if ("c" === n || "C" === n) this.curCommandType = N.CURVE_TO, this.curCommandRelative = "c" === n;
							else if ("s" === n || "S" === n) this.curCommandType = N.SMOOTH_CURVE_TO, this.curCommandRelative = "s" === n;
							else if ("q" === n || "Q" === n) this.curCommandType = N.QUAD_TO, this.curCommandRelative = "q" === n;
							else if ("t" === n || "T" === n) this.curCommandType = N.SMOOTH_QUAD_TO, this.curCommandRelative = "t" === n;
							else {
								if ("a" !== n && "A" !== n) throw new SyntaxError("Unexpected character \"" + n + "\" at index " + i + ".");
								this.curCommandType = N.ARC, this.curCommandRelative = "a" === n;
							}
							else r.push({ type: N.CLOSE_PATH }), this.canParseCommandOrComma = !0, this.curCommandType = -1;
						}
						else this.curNumber = n, this.curNumberHasDecimal = "." === n;
					} else this.curNumber += n, this.curNumberHasDecimal = !0;
					else this.curNumber += n;
					else this.curNumber += n, this.curNumberHasExp = !0;
					else this.curNumber += n, this.curNumberHasExpDigits = this.curNumberHasExp;
				}
				return r;
			}, r.prototype.transform = function(t) {
				return Object.create(this, { parse: { value: function(r, e) {
					void 0 === e && (e = []);
					for (var a = 0, i = Object.getPrototypeOf(this).parse.call(this, r); a < i.length; a++) {
						var n = i[a], o = t(n);
						Array.isArray(o) ? e.push.apply(e, o) : e.push(o);
					}
					return e;
				} } });
			}, r;
		}(O), N = function(r) {
			function a(t) {
				var e = r.call(this) || this;
				return e.commands = "string" == typeof t ? a.parse(t) : t, e;
			}
			return e(a, r), a.prototype.encode = function() {
				return a.encode(this.commands);
			}, a.prototype.getBounds = function() {
				var r = t.SVGPathDataTransformer.CALCULATE_BOUNDS();
				return this.transform(r), r;
			}, a.prototype.transform = function(t) {
				for (var r = [], e = 0, a = this.commands; e < a.length; e++) {
					var i = t(a[e]);
					Array.isArray(i) ? r.push.apply(r, i) : r.push(i);
				}
				return this.commands = r, this;
			}, a.encode = function(t) {
				return i(t);
			}, a.parse = function(t) {
				var r = new _(), e = [];
				return r.parse(t, e), r.finish(e), e;
			}, a.CLOSE_PATH = 1, a.MOVE_TO = 2, a.HORIZ_LINE_TO = 4, a.VERT_LINE_TO = 8, a.LINE_TO = 16, a.CURVE_TO = 32, a.SMOOTH_CURVE_TO = 64, a.QUAD_TO = 128, a.SMOOTH_QUAD_TO = 256, a.ARC = 512, a.LINE_COMMANDS = a.LINE_TO | a.HORIZ_LINE_TO | a.VERT_LINE_TO, a.DRAWING_COMMANDS = a.HORIZ_LINE_TO | a.VERT_LINE_TO | a.LINE_TO | a.CURVE_TO | a.SMOOTH_CURVE_TO | a.QUAD_TO | a.SMOOTH_QUAD_TO | a.ARC, a;
		}(O), d = ((T = {})[N.MOVE_TO] = 2, T[N.LINE_TO] = 2, T[N.HORIZ_LINE_TO] = 1, T[N.VERT_LINE_TO] = 1, T[N.CLOSE_PATH] = 0, T[N.QUAD_TO] = 4, T[N.SMOOTH_QUAD_TO] = 2, T[N.CURVE_TO] = 6, T[N.SMOOTH_CURVE_TO] = 4, T[N.ARC] = 7, T);
		t.COMMAND_ARG_COUNTS = d, t.SVGPathData = N, t.SVGPathDataParser = _, t.encodeSVGPath = i, Object.defineProperty(t, "__esModule", { value: !0 });
	}));
}));
//#endregion
//#region node_modules/core-js/modules/es.regexp.to-string.js
var require_es_regexp_to_string = /* @__PURE__ */ __commonJSMin((() => {
	var PROPER_FUNCTION_NAME = require_function_name().PROPER;
	var defineBuiltIn = require_define_built_in();
	var anObject = require_an_object();
	var $toString = require_to_string();
	var fails = require_fails();
	var getRegExpFlags = require_regexp_get_flags();
	var TO_STRING = "toString";
	var RegExpPrototype = RegExp.prototype;
	var nativeToString = RegExpPrototype[TO_STRING];
	var NOT_GENERIC = fails(function() {
		return nativeToString.call({
			source: "a",
			flags: "b"
		}) !== "/a/b";
	});
	var INCORRECT_NAME = PROPER_FUNCTION_NAME && nativeToString.name !== TO_STRING;
	if (NOT_GENERIC || INCORRECT_NAME) defineBuiltIn(RegExpPrototype, TO_STRING, function toString() {
		var R = anObject(this);
		var pattern = $toString(R.source);
		var flags = $toString(getRegExpFlags(R));
		return "/" + pattern + "/" + flags;
	}, { unsafe: true });
}));
//#endregion
//#region node_modules/core-js/modules/es.array.iterator.js
var require_es_array_iterator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var toIndexedObject = require_to_indexed_object();
	var addToUnscopables = require_add_to_unscopables();
	var Iterators = require_iterators();
	var InternalStateModule = require_internal_state();
	var defineProperty = require_object_define_property().f;
	var defineIterator = require_iterator_define();
	var createIterResultObject = require_create_iter_result_object();
	var IS_PURE = require_is_pure();
	var DESCRIPTORS = require_descriptors();
	var ARRAY_ITERATOR = "Array Iterator";
	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);
	module.exports = defineIterator(Array, "Array", function(iterated, kind) {
		setInternalState(this, {
			type: ARRAY_ITERATOR,
			target: toIndexedObject(iterated),
			index: 0,
			kind
		});
	}, function() {
		var state = getInternalState(this);
		var target = state.target;
		var index = state.index++;
		if (!target || index >= target.length) {
			state.target = null;
			return createIterResultObject(void 0, true);
		}
		switch (state.kind) {
			case "keys": return createIterResultObject(index, false);
			case "values": return createIterResultObject(target[index], false);
		}
		return createIterResultObject([index, target[index]], false);
	}, "values");
	var values = Iterators.Arguments = Iterators.Array;
	addToUnscopables("keys");
	addToUnscopables("values");
	addToUnscopables("entries");
	if (!IS_PURE && DESCRIPTORS && values.name !== "values") try {
		defineProperty(values, "name", { value: "values" });
	} catch (error) {}
}));
//#endregion
//#region node_modules/core-js/modules/web.dom-collections.iterator.js
var require_web_dom_collections_iterator = /* @__PURE__ */ __commonJSMin((() => {
	var globalThis = require_global_this();
	var DOMIterables = require_dom_iterables();
	var DOMTokenListPrototype = require_dom_token_list_prototype();
	var ArrayIteratorMethods = require_es_array_iterator();
	var createNonEnumerableProperty = require_create_non_enumerable_property();
	var setToStringTag = require_set_to_string_tag();
	var ITERATOR = require_well_known_symbol()("iterator");
	var ArrayValues = ArrayIteratorMethods.values;
	var handlePrototype = function(CollectionPrototype, COLLECTION_NAME) {
		if (CollectionPrototype) {
			if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
				createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
			} catch (error) {
				CollectionPrototype[ITERATOR] = ArrayValues;
			}
			setToStringTag(CollectionPrototype, COLLECTION_NAME, true);
			if (DOMIterables[COLLECTION_NAME]) {
				for (var METHOD_NAME in ArrayIteratorMethods) if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
					createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
				} catch (error) {
					CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
				}
			}
		}
	};
	for (var COLLECTION_NAME in DOMIterables) handlePrototype(globalThis[COLLECTION_NAME] && globalThis[COLLECTION_NAME].prototype, COLLECTION_NAME);
	handlePrototype(DOMTokenListPrototype, "DOMTokenList");
}));
//#endregion
//#region node_modules/core-js/internals/object-get-own-property-names-external.js
var require_object_get_own_property_names_external = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var classof = require_classof_raw();
	var toIndexedObject = require_to_indexed_object();
	var $getOwnPropertyNames = require_object_get_own_property_names().f;
	var arraySlice = require_array_slice();
	var windowNames = typeof window == "object" && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
	var getWindowNames = function(it) {
		try {
			return $getOwnPropertyNames(it);
		} catch (error) {
			return arraySlice(windowNames);
		}
	};
	module.exports.f = function getOwnPropertyNames(it) {
		return windowNames && classof(it) === "Window" ? getWindowNames(it) : $getOwnPropertyNames(toIndexedObject(it));
	};
}));
//#endregion
//#region node_modules/core-js/internals/array-buffer-non-extensible.js
var require_array_buffer_non_extensible = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_fails()(function() {
		if (typeof ArrayBuffer == "function") {
			var buffer = /* @__PURE__ */ new ArrayBuffer(8);
			if (Object.isExtensible(buffer)) Object.defineProperty(buffer, "a", { value: 8 });
		}
	});
}));
//#endregion
//#region node_modules/core-js/internals/object-is-extensible.js
var require_object_is_extensible = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fails = require_fails();
	var isObject = require_is_object();
	var classof = require_classof_raw();
	var ARRAY_BUFFER_NON_EXTENSIBLE = require_array_buffer_non_extensible();
	var $isExtensible = Object.isExtensible;
	module.exports = fails(function() {
		$isExtensible(1);
	}) || ARRAY_BUFFER_NON_EXTENSIBLE ? function isExtensible(it) {
		if (!isObject(it)) return false;
		if (ARRAY_BUFFER_NON_EXTENSIBLE && classof(it) === "ArrayBuffer") return false;
		return $isExtensible ? $isExtensible(it) : true;
	} : $isExtensible;
}));
//#endregion
//#region node_modules/core-js/internals/freezing.js
var require_freezing = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = !require_fails()(function() {
		return Object.isExtensible(Object.preventExtensions({}));
	});
}));
//#endregion
//#region node_modules/core-js/internals/internal-metadata.js
var require_internal_metadata = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var $ = require_export();
	var uncurryThis = require_function_uncurry_this();
	var hiddenKeys = require_hidden_keys();
	var isObject = require_is_object();
	var hasOwn = require_has_own_property();
	var defineProperty = require_object_define_property().f;
	var getOwnPropertyNamesModule = require_object_get_own_property_names();
	var getOwnPropertyNamesExternalModule = require_object_get_own_property_names_external();
	var isExtensible = require_object_is_extensible();
	var uid = require_uid();
	var FREEZING = require_freezing();
	var REQUIRED = false;
	var METADATA = uid("meta");
	var id = 0;
	var setMetadata = function(it) {
		defineProperty(it, METADATA, { value: {
			objectID: "O" + id++,
			weakData: {}
		} });
	};
	var fastKey = function(it, create) {
		if (!isObject(it)) return typeof it == "symbol" ? it : (typeof it == "string" ? "S" : "P") + it;
		if (!hasOwn(it, METADATA)) {
			if (!isExtensible(it)) return "F";
			if (!create) return "E";
			setMetadata(it);
		}
		return it[METADATA].objectID;
	};
	var getWeakData = function(it, create) {
		if (!hasOwn(it, METADATA)) {
			if (!isExtensible(it)) return true;
			if (!create) return false;
			setMetadata(it);
		}
		return it[METADATA].weakData;
	};
	var onFreeze = function(it) {
		if (FREEZING && REQUIRED && isExtensible(it) && !hasOwn(it, METADATA)) setMetadata(it);
		return it;
	};
	var enable = function() {
		meta.enable = function() {};
		REQUIRED = true;
		var getOwnPropertyNames = getOwnPropertyNamesModule.f;
		var splice = uncurryThis([].splice);
		var test = {};
		test[METADATA] = 1;
		if (getOwnPropertyNames(test).length) {
			getOwnPropertyNamesModule.f = function(it) {
				var result = getOwnPropertyNames(it);
				for (var i = 0, length = result.length; i < length; i++) if (result[i] === METADATA) {
					splice(result, i, 1);
					break;
				}
				return result;
			};
			$({
				target: "Object",
				stat: true,
				forced: true
			}, { getOwnPropertyNames: getOwnPropertyNamesExternalModule.f });
		}
	};
	var meta = module.exports = {
		enable,
		fastKey,
		getWeakData,
		onFreeze
	};
	hiddenKeys[METADATA] = true;
}));
//#endregion
//#region node_modules/core-js/internals/collection.js
var require_collection = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var $ = require_export();
	var globalThis = require_global_this();
	var uncurryThis = require_function_uncurry_this();
	var isForced = require_is_forced();
	var defineBuiltIn = require_define_built_in();
	var InternalMetadataModule = require_internal_metadata();
	var iterate = require_iterate();
	var anInstance = require_an_instance();
	var isCallable = require_is_callable();
	var isNullOrUndefined = require_is_null_or_undefined();
	var isObject = require_is_object();
	var fails = require_fails();
	var checkCorrectnessOfIteration = require_check_correctness_of_iteration();
	var setToStringTag = require_set_to_string_tag();
	var inheritIfRequired = require_inherit_if_required();
	module.exports = function(CONSTRUCTOR_NAME, wrapper, common) {
		var IS_MAP = CONSTRUCTOR_NAME.indexOf("Map") !== -1;
		var IS_WEAK = CONSTRUCTOR_NAME.indexOf("Weak") !== -1;
		var ADDER = IS_MAP ? "set" : "add";
		var NativeConstructor = globalThis[CONSTRUCTOR_NAME];
		var NativePrototype = NativeConstructor && NativeConstructor.prototype;
		var Constructor = NativeConstructor;
		var exported = {};
		var fixMethod = function(KEY) {
			var uncurriedNativeMethod = uncurryThis(NativePrototype[KEY]);
			defineBuiltIn(NativePrototype, KEY, KEY === "add" ? function add(value) {
				uncurriedNativeMethod(this, value === 0 ? 0 : value);
				return this;
			} : KEY === "delete" ? function(key) {
				return IS_WEAK && !isObject(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
			} : KEY === "get" ? function get(key) {
				return IS_WEAK && !isObject(key) ? void 0 : uncurriedNativeMethod(this, key === 0 ? 0 : key);
			} : KEY === "has" ? function has(key) {
				return IS_WEAK && !isObject(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
			} : function set(key, value) {
				uncurriedNativeMethod(this, key === 0 ? 0 : key, value);
				return this;
			});
		};
		if (isForced(CONSTRUCTOR_NAME, !isCallable(NativeConstructor) || !(IS_WEAK || NativePrototype.forEach && !fails(function() {
			new NativeConstructor().entries().next();
		})))) {
			Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
			InternalMetadataModule.enable();
		} else if (isForced(CONSTRUCTOR_NAME, true)) {
			var instance = new Constructor();
			var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) !== instance;
			var THROWS_ON_PRIMITIVES = fails(function() {
				instance.has(1);
			});
			var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function(iterable) {
				new NativeConstructor(iterable);
			});
			var BUGGY_ZERO = !IS_WEAK && fails(function() {
				var $instance = new NativeConstructor();
				var index = 5;
				while (index--) $instance[ADDER](index, index);
				return !$instance.has(-0);
			});
			if (!ACCEPT_ITERABLES) {
				Constructor = wrapper(function(dummy, iterable) {
					anInstance(dummy, NativePrototype);
					var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
					if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], {
						that,
						AS_ENTRIES: IS_MAP
					});
					return that;
				});
				Constructor.prototype = NativePrototype;
				NativePrototype.constructor = Constructor;
			}
			if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
				fixMethod("delete");
				fixMethod("has");
				IS_MAP && fixMethod("get");
			}
			if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
			if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
		}
		exported[CONSTRUCTOR_NAME] = Constructor;
		$({
			global: true,
			constructor: true,
			forced: Constructor !== NativeConstructor
		}, exported);
		setToStringTag(Constructor, CONSTRUCTOR_NAME);
		if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);
		return Constructor;
	};
}));
//#endregion
//#region node_modules/core-js/internals/define-built-ins.js
var require_define_built_ins = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var defineBuiltIn = require_define_built_in();
	module.exports = function(target, src, options) {
		for (var key in src) defineBuiltIn(target, key, src[key], options);
		return target;
	};
}));
//#endregion
//#region node_modules/core-js/internals/collection-strong.js
var require_collection_strong = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var create = require_object_create();
	var defineBuiltInAccessor = require_define_built_in_accessor();
	var defineBuiltIns = require_define_built_ins();
	var bind = require_function_bind_context();
	var anInstance = require_an_instance();
	var isNullOrUndefined = require_is_null_or_undefined();
	var iterate = require_iterate();
	var defineIterator = require_iterator_define();
	var createIterResultObject = require_create_iter_result_object();
	var setSpecies = require_set_species();
	var DESCRIPTORS = require_descriptors();
	var fastKey = require_internal_metadata().fastKey;
	var InternalStateModule = require_internal_state();
	var setInternalState = InternalStateModule.set;
	var internalStateGetterFor = InternalStateModule.getterFor;
	module.exports = {
		getConstructor: function(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
			var Constructor = wrapper(function(that, iterable) {
				anInstance(that, Prototype);
				setInternalState(that, {
					type: CONSTRUCTOR_NAME,
					index: create(null),
					first: null,
					last: null,
					size: 0
				});
				if (!DESCRIPTORS) that.size = 0;
				if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], {
					that,
					AS_ENTRIES: IS_MAP
				});
			});
			var Prototype = Constructor.prototype;
			var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);
			var define = function(that, key, value) {
				var state = getInternalState(that);
				var entry = getEntry(that, key);
				var previous, index;
				if (entry) entry.value = value;
				else {
					state.last = entry = {
						index: index = fastKey(key, true),
						key,
						value,
						previous: previous = state.last,
						next: null,
						removed: false
					};
					if (!state.first) state.first = entry;
					if (previous) previous.next = entry;
					if (DESCRIPTORS) state.size++;
					else that.size++;
					if (index !== "F") state.index[index] = entry;
				}
				return that;
			};
			var getEntry = function(that, key) {
				var state = getInternalState(that);
				var index = fastKey(key);
				var entry;
				if (index !== "F") return state.index[index];
				for (entry = state.first; entry; entry = entry.next) if (entry.key === key) return entry;
			};
			defineBuiltIns(Prototype, {
				clear: function clear() {
					var that = this;
					var state = getInternalState(that);
					var entry = state.first;
					while (entry) {
						entry.removed = true;
						if (entry.previous) entry.previous = entry.previous.next = null;
						entry = entry.next;
					}
					state.first = state.last = null;
					state.index = create(null);
					if (DESCRIPTORS) state.size = 0;
					else that.size = 0;
				},
				"delete": function(key) {
					var that = this;
					var state = getInternalState(that);
					var entry = getEntry(that, key);
					if (entry) {
						var next = entry.next;
						var prev = entry.previous;
						delete state.index[entry.index];
						entry.removed = true;
						if (prev) prev.next = next;
						if (next) next.previous = prev;
						if (state.first === entry) state.first = next;
						if (state.last === entry) state.last = prev;
						if (DESCRIPTORS) state.size--;
						else that.size--;
					}
					return !!entry;
				},
				forEach: function forEach(callbackfn) {
					var state = getInternalState(this);
					var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : void 0);
					var entry;
					while (entry = entry ? entry.next : state.first) {
						boundFunction(entry.value, entry.key, this);
						while (entry && entry.removed) entry = entry.previous;
					}
				},
				has: function has(key) {
					return !!getEntry(this, key);
				}
			});
			defineBuiltIns(Prototype, IS_MAP ? {
				get: function get(key) {
					var entry = getEntry(this, key);
					return entry && entry.value;
				},
				set: function set(key, value) {
					return define(this, key === 0 ? 0 : key, value);
				}
			} : { add: function add(value) {
				return define(this, value = value === 0 ? 0 : value, value);
			} });
			if (DESCRIPTORS) defineBuiltInAccessor(Prototype, "size", {
				configurable: true,
				get: function() {
					return getInternalState(this).size;
				}
			});
			return Constructor;
		},
		setStrong: function(Constructor, CONSTRUCTOR_NAME, IS_MAP) {
			var ITERATOR_NAME = CONSTRUCTOR_NAME + " Iterator";
			var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
			var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
			defineIterator(Constructor, CONSTRUCTOR_NAME, function(iterated, kind) {
				setInternalState(this, {
					type: ITERATOR_NAME,
					target: iterated,
					state: getInternalCollectionState(iterated),
					kind,
					last: null
				});
			}, function() {
				var state = getInternalIteratorState(this);
				var kind = state.kind;
				var entry = state.last;
				while (entry && entry.removed) entry = entry.previous;
				if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
					state.target = null;
					return createIterResultObject(void 0, true);
				}
				if (kind === "keys") return createIterResultObject(entry.key, false);
				if (kind === "values") return createIterResultObject(entry.value, false);
				return createIterResultObject([entry.key, entry.value], false);
			}, IS_MAP ? "entries" : "values", !IS_MAP, true);
			setSpecies(CONSTRUCTOR_NAME);
		}
	};
}));
//#endregion
//#region node_modules/core-js/modules/es.map.constructor.js
var require_es_map_constructor = /* @__PURE__ */ __commonJSMin((() => {
	require_collection()("Map", function(init) {
		return function Map() {
			return init(this, arguments.length ? arguments[0] : void 0);
		};
	}, require_collection_strong());
}));
//#endregion
//#region node_modules/core-js/modules/es.map.js
var require_es_map = /* @__PURE__ */ __commonJSMin((() => {
	require_es_map_constructor();
}));
//#endregion
//#region node_modules/core-js/modules/es.reflect.apply.js
var require_es_reflect_apply = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var functionApply = require_function_apply();
	var aCallable = require_a_callable();
	var anObject = require_an_object();
	$({
		target: "Reflect",
		stat: true,
		forced: !require_fails()(function() {
			Reflect.apply(function() {});
		})
	}, { apply: function apply(target, thisArgument, argumentsList) {
		return functionApply(aCallable(target), thisArgument, anObject(argumentsList));
	} });
}));
//#endregion
//#region node_modules/core-js/modules/es.reflect.get-prototype-of.js
var require_es_reflect_get_prototype_of = /* @__PURE__ */ __commonJSMin((() => {
	var $ = require_export();
	var anObject = require_an_object();
	var objectGetPrototypeOf = require_object_get_prototype_of();
	$({
		target: "Reflect",
		stat: true,
		sham: !require_correct_prototype_getter()
	}, { getPrototypeOf: function getPrototypeOf(target) {
		return objectGetPrototypeOf(anObject(target));
	} });
}));
//#endregion
//#region node_modules/stackblur-canvas/dist/stackblur-es.js
var stackblur_es_exports = /* @__PURE__ */ __exportAll({
	BlurStack: () => BlurStack,
	canvasRGB: () => processCanvasRGB,
	canvasRGBA: () => processCanvasRGBA,
	image: () => processImage,
	imageDataRGB: () => processImageDataRGB,
	imageDataRGBA: () => processImageDataRGBA
});
function _typeof(obj) {
	"@babel/helpers - typeof";
	if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") _typeof = function(obj) {
		return typeof obj;
	};
	else _typeof = function(obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};
	return _typeof(obj);
}
function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
}
/**
* @param {string|HTMLImageElement} img
* @param {string|HTMLCanvasElement} canvas
* @param {Float} radius
* @param {boolean} blurAlphaChannel
* @param {boolean} useOffset
* @param {boolean} skipStyles
* @returns {undefined}
*/
function processImage(img, canvas, radius, blurAlphaChannel, useOffset, skipStyles) {
	if (typeof img === "string") img = document.getElementById(img);
	if (!img || Object.prototype.toString.call(img).slice(8, -1) === "HTMLImageElement" && !("naturalWidth" in img)) return;
	var dimensionType = useOffset ? "offset" : "natural";
	var w = img[dimensionType + "Width"];
	var h = img[dimensionType + "Height"];
	if (Object.prototype.toString.call(img).slice(8, -1) === "ImageBitmap") {
		w = img.width;
		h = img.height;
	}
	if (typeof canvas === "string") canvas = document.getElementById(canvas);
	if (!canvas || !("getContext" in canvas)) return;
	if (!skipStyles) {
		canvas.style.width = w + "px";
		canvas.style.height = h + "px";
	}
	canvas.width = w;
	canvas.height = h;
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, w, h);
	context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, w, h);
	if (isNaN(radius) || radius < 1) return;
	if (blurAlphaChannel) processCanvasRGBA(canvas, 0, 0, w, h, radius);
	else processCanvasRGB(canvas, 0, 0, w, h, radius);
}
/**
* @param {string|HTMLCanvasElement} canvas
* @param {Integer} topX
* @param {Integer} topY
* @param {Integer} width
* @param {Integer} height
* @throws {Error|TypeError}
* @returns {ImageData} See {@link https://html.spec.whatwg.org/multipage/canvas.html#imagedata}
*/
function getImageDataFromCanvas(canvas, topX, topY, width, height) {
	if (typeof canvas === "string") canvas = document.getElementById(canvas);
	if (!canvas || _typeof(canvas) !== "object" || !("getContext" in canvas)) throw new TypeError("Expecting canvas with `getContext` method in processCanvasRGB(A) calls!");
	var context = canvas.getContext("2d");
	try {
		return context.getImageData(topX, topY, width, height);
	} catch (e) {
		throw new Error("unable to access image data: " + e);
	}
}
/**
* @param {HTMLCanvasElement} canvas
* @param {Integer} topX
* @param {Integer} topY
* @param {Integer} width
* @param {Integer} height
* @param {Float} radius
* @returns {undefined}
*/
function processCanvasRGBA(canvas, topX, topY, width, height, radius) {
	if (isNaN(radius) || radius < 1) return;
	radius |= 0;
	var imageData = getImageDataFromCanvas(canvas, topX, topY, width, height);
	imageData = processImageDataRGBA(imageData, topX, topY, width, height, radius);
	canvas.getContext("2d").putImageData(imageData, topX, topY);
}
/**
* @param {ImageData} imageData
* @param {Integer} topX
* @param {Integer} topY
* @param {Integer} width
* @param {Integer} height
* @param {Float} radius
* @returns {ImageData}
*/
function processImageDataRGBA(imageData, topX, topY, width, height, radius) {
	var pixels = imageData.data;
	var div = 2 * radius + 1;
	var widthMinus1 = width - 1;
	var heightMinus1 = height - 1;
	var radiusPlus1 = radius + 1;
	var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
	var stackStart = new BlurStack();
	var stack = stackStart;
	var stackEnd;
	for (var i = 1; i < div; i++) {
		stack = stack.next = new BlurStack();
		if (i === radiusPlus1) stackEnd = stack;
	}
	stack.next = stackStart;
	var stackIn = null, stackOut = null, yw = 0, yi = 0;
	var mulSum = mulTable[radius];
	var shgSum = shgTable[radius];
	for (var y = 0; y < height; y++) {
		stack = stackStart;
		var pr = pixels[yi], pg = pixels[yi + 1], pb = pixels[yi + 2], pa = pixels[yi + 3];
		for (var _i = 0; _i < radiusPlus1; _i++) {
			stack.r = pr;
			stack.g = pg;
			stack.b = pb;
			stack.a = pa;
			stack = stack.next;
		}
		var rInSum = 0, gInSum = 0, bInSum = 0, aInSum = 0, rOutSum = radiusPlus1 * pr, gOutSum = radiusPlus1 * pg, bOutSum = radiusPlus1 * pb, aOutSum = radiusPlus1 * pa, rSum = sumFactor * pr, gSum = sumFactor * pg, bSum = sumFactor * pb, aSum = sumFactor * pa;
		for (var _i2 = 1; _i2 < radiusPlus1; _i2++) {
			var p = yi + ((widthMinus1 < _i2 ? widthMinus1 : _i2) << 2);
			var r = pixels[p], g = pixels[p + 1], b = pixels[p + 2], a = pixels[p + 3];
			var rbs = radiusPlus1 - _i2;
			rSum += (stack.r = r) * rbs;
			gSum += (stack.g = g) * rbs;
			bSum += (stack.b = b) * rbs;
			aSum += (stack.a = a) * rbs;
			rInSum += r;
			gInSum += g;
			bInSum += b;
			aInSum += a;
			stack = stack.next;
		}
		stackIn = stackStart;
		stackOut = stackEnd;
		for (var x = 0; x < width; x++) {
			var paInitial = aSum * mulSum >>> shgSum;
			pixels[yi + 3] = paInitial;
			if (paInitial !== 0) {
				var _a2 = 255 / paInitial;
				pixels[yi] = (rSum * mulSum >>> shgSum) * _a2;
				pixels[yi + 1] = (gSum * mulSum >>> shgSum) * _a2;
				pixels[yi + 2] = (bSum * mulSum >>> shgSum) * _a2;
			} else pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
			rSum -= rOutSum;
			gSum -= gOutSum;
			bSum -= bOutSum;
			aSum -= aOutSum;
			rOutSum -= stackIn.r;
			gOutSum -= stackIn.g;
			bOutSum -= stackIn.b;
			aOutSum -= stackIn.a;
			var _p = x + radius + 1;
			_p = yw + (_p < widthMinus1 ? _p : widthMinus1) << 2;
			rInSum += stackIn.r = pixels[_p];
			gInSum += stackIn.g = pixels[_p + 1];
			bInSum += stackIn.b = pixels[_p + 2];
			aInSum += stackIn.a = pixels[_p + 3];
			rSum += rInSum;
			gSum += gInSum;
			bSum += bInSum;
			aSum += aInSum;
			stackIn = stackIn.next;
			var _stackOut = stackOut, _r = _stackOut.r, _g = _stackOut.g, _b = _stackOut.b, _a = _stackOut.a;
			rOutSum += _r;
			gOutSum += _g;
			bOutSum += _b;
			aOutSum += _a;
			rInSum -= _r;
			gInSum -= _g;
			bInSum -= _b;
			aInSum -= _a;
			stackOut = stackOut.next;
			yi += 4;
		}
		yw += width;
	}
	for (var _x = 0; _x < width; _x++) {
		yi = _x << 2;
		var _pr = pixels[yi], _pg = pixels[yi + 1], _pb = pixels[yi + 2], _pa = pixels[yi + 3], _rOutSum = radiusPlus1 * _pr, _gOutSum = radiusPlus1 * _pg, _bOutSum = radiusPlus1 * _pb, _aOutSum = radiusPlus1 * _pa, _rSum = sumFactor * _pr, _gSum = sumFactor * _pg, _bSum = sumFactor * _pb, _aSum = sumFactor * _pa;
		stack = stackStart;
		for (var _i3 = 0; _i3 < radiusPlus1; _i3++) {
			stack.r = _pr;
			stack.g = _pg;
			stack.b = _pb;
			stack.a = _pa;
			stack = stack.next;
		}
		var yp = width;
		var _gInSum = 0, _bInSum = 0, _aInSum = 0, _rInSum = 0;
		for (var _i4 = 1; _i4 <= radius; _i4++) {
			yi = yp + _x << 2;
			var _rbs = radiusPlus1 - _i4;
			_rSum += (stack.r = _pr = pixels[yi]) * _rbs;
			_gSum += (stack.g = _pg = pixels[yi + 1]) * _rbs;
			_bSum += (stack.b = _pb = pixels[yi + 2]) * _rbs;
			_aSum += (stack.a = _pa = pixels[yi + 3]) * _rbs;
			_rInSum += _pr;
			_gInSum += _pg;
			_bInSum += _pb;
			_aInSum += _pa;
			stack = stack.next;
			if (_i4 < heightMinus1) yp += width;
		}
		yi = _x;
		stackIn = stackStart;
		stackOut = stackEnd;
		for (var _y = 0; _y < height; _y++) {
			var _p2 = yi << 2;
			pixels[_p2 + 3] = _pa = _aSum * mulSum >>> shgSum;
			if (_pa > 0) {
				_pa = 255 / _pa;
				pixels[_p2] = (_rSum * mulSum >>> shgSum) * _pa;
				pixels[_p2 + 1] = (_gSum * mulSum >>> shgSum) * _pa;
				pixels[_p2 + 2] = (_bSum * mulSum >>> shgSum) * _pa;
			} else pixels[_p2] = pixels[_p2 + 1] = pixels[_p2 + 2] = 0;
			_rSum -= _rOutSum;
			_gSum -= _gOutSum;
			_bSum -= _bOutSum;
			_aSum -= _aOutSum;
			_rOutSum -= stackIn.r;
			_gOutSum -= stackIn.g;
			_bOutSum -= stackIn.b;
			_aOutSum -= stackIn.a;
			_p2 = _x + ((_p2 = _y + radiusPlus1) < heightMinus1 ? _p2 : heightMinus1) * width << 2;
			_rSum += _rInSum += stackIn.r = pixels[_p2];
			_gSum += _gInSum += stackIn.g = pixels[_p2 + 1];
			_bSum += _bInSum += stackIn.b = pixels[_p2 + 2];
			_aSum += _aInSum += stackIn.a = pixels[_p2 + 3];
			stackIn = stackIn.next;
			_rOutSum += _pr = stackOut.r;
			_gOutSum += _pg = stackOut.g;
			_bOutSum += _pb = stackOut.b;
			_aOutSum += _pa = stackOut.a;
			_rInSum -= _pr;
			_gInSum -= _pg;
			_bInSum -= _pb;
			_aInSum -= _pa;
			stackOut = stackOut.next;
			yi += width;
		}
	}
	return imageData;
}
/**
* @param {HTMLCanvasElement} canvas
* @param {Integer} topX
* @param {Integer} topY
* @param {Integer} width
* @param {Integer} height
* @param {Float} radius
* @returns {undefined}
*/
function processCanvasRGB(canvas, topX, topY, width, height, radius) {
	if (isNaN(radius) || radius < 1) return;
	radius |= 0;
	var imageData = getImageDataFromCanvas(canvas, topX, topY, width, height);
	imageData = processImageDataRGB(imageData, topX, topY, width, height, radius);
	canvas.getContext("2d").putImageData(imageData, topX, topY);
}
/**
* @param {ImageData} imageData
* @param {Integer} topX
* @param {Integer} topY
* @param {Integer} width
* @param {Integer} height
* @param {Float} radius
* @returns {ImageData}
*/
function processImageDataRGB(imageData, topX, topY, width, height, radius) {
	var pixels = imageData.data;
	var div = 2 * radius + 1;
	var widthMinus1 = width - 1;
	var heightMinus1 = height - 1;
	var radiusPlus1 = radius + 1;
	var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
	var stackStart = new BlurStack();
	var stack = stackStart;
	var stackEnd;
	for (var i = 1; i < div; i++) {
		stack = stack.next = new BlurStack();
		if (i === radiusPlus1) stackEnd = stack;
	}
	stack.next = stackStart;
	var stackIn = null;
	var stackOut = null;
	var mulSum = mulTable[radius];
	var shgSum = shgTable[radius];
	var p, rbs;
	var yw = 0, yi = 0;
	for (var y = 0; y < height; y++) {
		var pr = pixels[yi], pg = pixels[yi + 1], pb = pixels[yi + 2], rOutSum = radiusPlus1 * pr, gOutSum = radiusPlus1 * pg, bOutSum = radiusPlus1 * pb, rSum = sumFactor * pr, gSum = sumFactor * pg, bSum = sumFactor * pb;
		stack = stackStart;
		for (var _i5 = 0; _i5 < radiusPlus1; _i5++) {
			stack.r = pr;
			stack.g = pg;
			stack.b = pb;
			stack = stack.next;
		}
		var rInSum = 0, gInSum = 0, bInSum = 0;
		for (var _i6 = 1; _i6 < radiusPlus1; _i6++) {
			p = yi + ((widthMinus1 < _i6 ? widthMinus1 : _i6) << 2);
			rSum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - _i6);
			gSum += (stack.g = pg = pixels[p + 1]) * rbs;
			bSum += (stack.b = pb = pixels[p + 2]) * rbs;
			rInSum += pr;
			gInSum += pg;
			bInSum += pb;
			stack = stack.next;
		}
		stackIn = stackStart;
		stackOut = stackEnd;
		for (var x = 0; x < width; x++) {
			pixels[yi] = rSum * mulSum >>> shgSum;
			pixels[yi + 1] = gSum * mulSum >>> shgSum;
			pixels[yi + 2] = bSum * mulSum >>> shgSum;
			rSum -= rOutSum;
			gSum -= gOutSum;
			bSum -= bOutSum;
			rOutSum -= stackIn.r;
			gOutSum -= stackIn.g;
			bOutSum -= stackIn.b;
			p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;
			rInSum += stackIn.r = pixels[p];
			gInSum += stackIn.g = pixels[p + 1];
			bInSum += stackIn.b = pixels[p + 2];
			rSum += rInSum;
			gSum += gInSum;
			bSum += bInSum;
			stackIn = stackIn.next;
			rOutSum += pr = stackOut.r;
			gOutSum += pg = stackOut.g;
			bOutSum += pb = stackOut.b;
			rInSum -= pr;
			gInSum -= pg;
			bInSum -= pb;
			stackOut = stackOut.next;
			yi += 4;
		}
		yw += width;
	}
	for (var _x2 = 0; _x2 < width; _x2++) {
		yi = _x2 << 2;
		var _pr2 = pixels[yi], _pg2 = pixels[yi + 1], _pb2 = pixels[yi + 2], _rOutSum2 = radiusPlus1 * _pr2, _gOutSum2 = radiusPlus1 * _pg2, _bOutSum2 = radiusPlus1 * _pb2, _rSum2 = sumFactor * _pr2, _gSum2 = sumFactor * _pg2, _bSum2 = sumFactor * _pb2;
		stack = stackStart;
		for (var _i7 = 0; _i7 < radiusPlus1; _i7++) {
			stack.r = _pr2;
			stack.g = _pg2;
			stack.b = _pb2;
			stack = stack.next;
		}
		var _rInSum2 = 0, _gInSum2 = 0, _bInSum2 = 0;
		for (var _i8 = 1, yp = width; _i8 <= radius; _i8++) {
			yi = yp + _x2 << 2;
			_rSum2 += (stack.r = _pr2 = pixels[yi]) * (rbs = radiusPlus1 - _i8);
			_gSum2 += (stack.g = _pg2 = pixels[yi + 1]) * rbs;
			_bSum2 += (stack.b = _pb2 = pixels[yi + 2]) * rbs;
			_rInSum2 += _pr2;
			_gInSum2 += _pg2;
			_bInSum2 += _pb2;
			stack = stack.next;
			if (_i8 < heightMinus1) yp += width;
		}
		yi = _x2;
		stackIn = stackStart;
		stackOut = stackEnd;
		for (var _y2 = 0; _y2 < height; _y2++) {
			p = yi << 2;
			pixels[p] = _rSum2 * mulSum >>> shgSum;
			pixels[p + 1] = _gSum2 * mulSum >>> shgSum;
			pixels[p + 2] = _bSum2 * mulSum >>> shgSum;
			_rSum2 -= _rOutSum2;
			_gSum2 -= _gOutSum2;
			_bSum2 -= _bOutSum2;
			_rOutSum2 -= stackIn.r;
			_gOutSum2 -= stackIn.g;
			_bOutSum2 -= stackIn.b;
			p = _x2 + ((p = _y2 + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;
			_rSum2 += _rInSum2 += stackIn.r = pixels[p];
			_gSum2 += _gInSum2 += stackIn.g = pixels[p + 1];
			_bSum2 += _bInSum2 += stackIn.b = pixels[p + 2];
			stackIn = stackIn.next;
			_rOutSum2 += _pr2 = stackOut.r;
			_gOutSum2 += _pg2 = stackOut.g;
			_bOutSum2 += _pb2 = stackOut.b;
			_rInSum2 -= _pr2;
			_gInSum2 -= _pg2;
			_bInSum2 -= _pb2;
			stackOut = stackOut.next;
			yi += width;
		}
	}
	return imageData;
}
var mulTable, shgTable, BlurStack;
var init_stackblur_es = __esmMin((() => {
	mulTable = [
		512,
		512,
		456,
		512,
		328,
		456,
		335,
		512,
		405,
		328,
		271,
		456,
		388,
		335,
		292,
		512,
		454,
		405,
		364,
		328,
		298,
		271,
		496,
		456,
		420,
		388,
		360,
		335,
		312,
		292,
		273,
		512,
		482,
		454,
		428,
		405,
		383,
		364,
		345,
		328,
		312,
		298,
		284,
		271,
		259,
		496,
		475,
		456,
		437,
		420,
		404,
		388,
		374,
		360,
		347,
		335,
		323,
		312,
		302,
		292,
		282,
		273,
		265,
		512,
		497,
		482,
		468,
		454,
		441,
		428,
		417,
		405,
		394,
		383,
		373,
		364,
		354,
		345,
		337,
		328,
		320,
		312,
		305,
		298,
		291,
		284,
		278,
		271,
		265,
		259,
		507,
		496,
		485,
		475,
		465,
		456,
		446,
		437,
		428,
		420,
		412,
		404,
		396,
		388,
		381,
		374,
		367,
		360,
		354,
		347,
		341,
		335,
		329,
		323,
		318,
		312,
		307,
		302,
		297,
		292,
		287,
		282,
		278,
		273,
		269,
		265,
		261,
		512,
		505,
		497,
		489,
		482,
		475,
		468,
		461,
		454,
		447,
		441,
		435,
		428,
		422,
		417,
		411,
		405,
		399,
		394,
		389,
		383,
		378,
		373,
		368,
		364,
		359,
		354,
		350,
		345,
		341,
		337,
		332,
		328,
		324,
		320,
		316,
		312,
		309,
		305,
		301,
		298,
		294,
		291,
		287,
		284,
		281,
		278,
		274,
		271,
		268,
		265,
		262,
		259,
		257,
		507,
		501,
		496,
		491,
		485,
		480,
		475,
		470,
		465,
		460,
		456,
		451,
		446,
		442,
		437,
		433,
		428,
		424,
		420,
		416,
		412,
		408,
		404,
		400,
		396,
		392,
		388,
		385,
		381,
		377,
		374,
		370,
		367,
		363,
		360,
		357,
		354,
		350,
		347,
		344,
		341,
		338,
		335,
		332,
		329,
		326,
		323,
		320,
		318,
		315,
		312,
		310,
		307,
		304,
		302,
		299,
		297,
		294,
		292,
		289,
		287,
		285,
		282,
		280,
		278,
		275,
		273,
		271,
		269,
		267,
		265,
		263,
		261,
		259
	];
	shgTable = [
		9,
		11,
		12,
		13,
		13,
		14,
		14,
		15,
		15,
		15,
		15,
		16,
		16,
		16,
		16,
		17,
		17,
		17,
		17,
		17,
		17,
		17,
		18,
		18,
		18,
		18,
		18,
		18,
		18,
		18,
		18,
		19,
		19,
		19,
		19,
		19,
		19,
		19,
		19,
		19,
		19,
		19,
		19,
		19,
		19,
		20,
		20,
		20,
		20,
		20,
		20,
		20,
		20,
		20,
		20,
		20,
		20,
		20,
		20,
		20,
		20,
		20,
		20,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		21,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		22,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		23,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24
	];
	BlurStack = function BlurStack() {
		_classCallCheck(this, BlurStack);
		this.r = 0;
		this.g = 0;
		this.b = 0;
		this.a = 0;
		this.next = null;
	};
}));
//#endregion
//#region node_modules/canvg/lib/index.cjs
var require_lib = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	require_es_object_to_string();
	require_es_promise();
	require_es_reflect_delete_property();
	var _regeneratorRuntime = require_regenerator();
	var _asyncToGenerator = require_asyncToGenerator();
	require_es_array_map();
	require_es_parse_float();
	require_es_regexp_exec();
	require_es_string_match();
	require_es_string_replace();
	require_es_string_starts_with();
	require_es_array_join();
	var _slicedToArray = require_slicedToArray();
	var _defineProperty = require_defineProperty();
	var _classCallCheck = require_classCallCheck();
	var _createClass = require_createClass();
	require_es_array_concat();
	require_es_array_every();
	require_es_array_reduce();
	require_es_string_ends_with();
	require_es_string_split();
	var requestAnimationFrame = require_raf();
	require_es_function_name();
	require_es_string_trim();
	var RGBColor = require_rgbcolor();
	require_es_array_for_each();
	require_web_dom_collections_for_each();
	var _inherits = require_inherits();
	var _possibleConstructorReturn = require_possibleConstructorReturn();
	var _getPrototypeOf = require_getPrototypeOf();
	require_es_array_from();
	require_es_array_includes();
	require_es_array_index_of();
	require_es_array_some();
	require_es_string_includes();
	require_es_string_iterator();
	var _toConsumableArray = require_toConsumableArray();
	require_es_array_reverse();
	require_es_number_constructor();
	var _get = require_get();
	require_es_array_fill();
	var svgPathdata = require_SVGPathData();
	require_es_regexp_to_string();
	var _assertThisInitialized = require_assertThisInitialized();
	require_es_array_iterator();
	require_web_dom_collections_iterator();
	require_es_map();
	require_es_reflect_apply();
	require_es_reflect_get_prototype_of();
	var stackblurCanvas = (init_stackblur_es(), __toCommonJS(stackblur_es_exports));
	function _interopDefaultLegacy(e) {
		return e && typeof e === "object" && "default" in e ? e : { "default": e };
	}
	var _regeneratorRuntime__default = /*#__PURE__*/ _interopDefaultLegacy(_regeneratorRuntime);
	var _asyncToGenerator__default = /*#__PURE__*/ _interopDefaultLegacy(_asyncToGenerator);
	var _slicedToArray__default = /*#__PURE__*/ _interopDefaultLegacy(_slicedToArray);
	var _defineProperty__default = /*#__PURE__*/ _interopDefaultLegacy(_defineProperty);
	var _classCallCheck__default = /*#__PURE__*/ _interopDefaultLegacy(_classCallCheck);
	var _createClass__default = /*#__PURE__*/ _interopDefaultLegacy(_createClass);
	var requestAnimationFrame__default = /*#__PURE__*/ _interopDefaultLegacy(requestAnimationFrame);
	var RGBColor__default = /*#__PURE__*/ _interopDefaultLegacy(RGBColor);
	var _inherits__default = /*#__PURE__*/ _interopDefaultLegacy(_inherits);
	var _possibleConstructorReturn__default = /*#__PURE__*/ _interopDefaultLegacy(_possibleConstructorReturn);
	var _getPrototypeOf__default = /*#__PURE__*/ _interopDefaultLegacy(_getPrototypeOf);
	var _toConsumableArray__default = /*#__PURE__*/ _interopDefaultLegacy(_toConsumableArray);
	var _get__default = /*#__PURE__*/ _interopDefaultLegacy(_get);
	var _assertThisInitialized__default = /*#__PURE__*/ _interopDefaultLegacy(_assertThisInitialized);
	/**
	* Options preset for `OffscreenCanvas`.
	* @param config - Preset requirements.
	* @param config.DOMParser - XML/HTML parser from string into DOM Document.
	* @returns Preset object.
	*/
	function offscreen() {
		var DOMParserFallback = (arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}).DOMParser;
		var preset = {
			window: null,
			ignoreAnimation: true,
			ignoreMouse: true,
			DOMParser: DOMParserFallback,
			createCanvas: function createCanvas(width, height) {
				return new OffscreenCanvas(width, height);
			},
			createImage: function createImage(url) {
				return _asyncToGenerator__default["default"](/*#__PURE__*/ _regeneratorRuntime__default["default"].mark(function _callee() {
					var response, blob, img;
					return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
						while (1) switch (_context.prev = _context.next) {
							case 0:
								_context.next = 2;
								return fetch(url);
							case 2:
								response = _context.sent;
								_context.next = 5;
								return response.blob();
							case 5:
								blob = _context.sent;
								_context.next = 8;
								return createImageBitmap(blob);
							case 8:
								img = _context.sent;
								return _context.abrupt("return", img);
							case 10:
							case "end": return _context.stop();
						}
					}, _callee);
				}))();
			}
		};
		if (typeof DOMParser !== "undefined" || typeof DOMParserFallback === "undefined") Reflect.deleteProperty(preset, "DOMParser");
		return preset;
	}
	/**
	* Options preset for `node-canvas`.
	* @param config - Preset requirements.
	* @param config.DOMParser - XML/HTML parser from string into DOM Document.
	* @param config.canvas - `node-canvas` exports.
	* @param config.fetch - WHATWG-compatible `fetch` function.
	* @returns Preset object.
	*/
	function node(_ref) {
		var DOMParser = _ref.DOMParser, canvas = _ref.canvas;
		return {
			window: null,
			ignoreAnimation: true,
			ignoreMouse: true,
			DOMParser,
			fetch: _ref.fetch,
			createCanvas: canvas.createCanvas,
			createImage: canvas.loadImage
		};
	}
	var index = /*#__PURE__*/ Object.freeze({
		__proto__: null,
		offscreen,
		node
	});
	/**
	* HTML-safe compress white-spaces.
	* @param str - String to compress.
	* @returns String.
	*/
	function compressSpaces(str) {
		return str.replace(/(?!\u3000)\s+/gm, " ");
	}
	/**
	* HTML-safe left trim.
	* @param str - String to trim.
	* @returns String.
	*/
	function trimLeft(str) {
		return str.replace(/^[\n \t]+/, "");
	}
	/**
	* HTML-safe right trim.
	* @param str - String to trim.
	* @returns String.
	*/
	function trimRight(str) {
		return str.replace(/[\n \t]+$/, "");
	}
	/**
	* String to numbers array.
	* @param str - Numbers string.
	* @returns Numbers array.
	*/
	function toNumbers(str) {
		return ((str || "").match(/-?(\d+(?:\.\d*(?:[eE][+-]?\d+)?)?|\.\d+)(?=\D|$)/gm) || []).map(parseFloat);
	}
	var allUppercase = /^[A-Z-]+$/;
	/**
	* Normalize attribute name.
	* @param name - Attribute name.
	* @returns Normalized attribute name.
	*/
	function normalizeAttributeName(name) {
		if (allUppercase.test(name)) return name.toLowerCase();
		return name;
	}
	/**
	* Parse external URL.
	* @param url - CSS url string.
	* @returns Parsed URL.
	*/
	function parseExternalUrl(url) {
		var urlMatch = /url\(('([^']+)'|"([^"]+)"|([^'")]+))\)/.exec(url) || [];
		return urlMatch[2] || urlMatch[3] || urlMatch[4];
	}
	/**
	* Transform floats to integers in rgb colors.
	* @param color - Color to normalize.
	* @returns Normalized color.
	*/
	function normalizeColor(color) {
		if (!color.startsWith("rgb")) return color;
		var rgbParts = 3;
		return color.replace(/\d+(\.\d+)?/g, function(num, isFloat) {
			return rgbParts-- && isFloat ? String(Math.round(parseFloat(num))) : num;
		});
	}
	var attributeRegex = /(\[[^\]]+\])/g;
	var idRegex = /(#[^\s+>~.[:]+)/g;
	var classRegex = /(\.[^\s+>~.[:]+)/g;
	var pseudoElementRegex = /(::[^\s+>~.[:]+|:first-line|:first-letter|:before|:after)/gi;
	var pseudoClassWithBracketsRegex = /(:[\w-]+\([^)]*\))/gi;
	var pseudoClassRegex = /(:[^\s+>~.[:]+)/g;
	var elementRegex = /([^\s+>~.[:]+)/g;
	function findSelectorMatch(selector, regex) {
		var matches = regex.exec(selector);
		if (!matches) return [selector, 0];
		return [selector.replace(regex, " "), matches.length];
	}
	/**
	* Measure selector specificity.
	* @param selector - Selector to measure.
	* @returns Specificity.
	*/
	function getSelectorSpecificity(selector) {
		var specificity = [
			0,
			0,
			0
		];
		var currentSelector = selector.replace(/:not\(([^)]*)\)/g, "     $1 ").replace(/{[\s\S]*/gm, " ");
		var delta = 0;
		var _findSelectorMatch = findSelectorMatch(currentSelector, attributeRegex);
		var _findSelectorMatch2 = _slicedToArray__default["default"](_findSelectorMatch, 2);
		currentSelector = _findSelectorMatch2[0];
		delta = _findSelectorMatch2[1];
		specificity[1] += delta;
		var _findSelectorMatch3 = findSelectorMatch(currentSelector, idRegex);
		var _findSelectorMatch4 = _slicedToArray__default["default"](_findSelectorMatch3, 2);
		currentSelector = _findSelectorMatch4[0];
		delta = _findSelectorMatch4[1];
		specificity[0] += delta;
		var _findSelectorMatch5 = findSelectorMatch(currentSelector, classRegex);
		var _findSelectorMatch6 = _slicedToArray__default["default"](_findSelectorMatch5, 2);
		currentSelector = _findSelectorMatch6[0];
		delta = _findSelectorMatch6[1];
		specificity[1] += delta;
		var _findSelectorMatch7 = findSelectorMatch(currentSelector, pseudoElementRegex);
		var _findSelectorMatch8 = _slicedToArray__default["default"](_findSelectorMatch7, 2);
		currentSelector = _findSelectorMatch8[0];
		delta = _findSelectorMatch8[1];
		specificity[2] += delta;
		var _findSelectorMatch9 = findSelectorMatch(currentSelector, pseudoClassWithBracketsRegex);
		var _findSelectorMatch10 = _slicedToArray__default["default"](_findSelectorMatch9, 2);
		currentSelector = _findSelectorMatch10[0];
		delta = _findSelectorMatch10[1];
		specificity[1] += delta;
		var _findSelectorMatch11 = findSelectorMatch(currentSelector, pseudoClassRegex);
		var _findSelectorMatch12 = _slicedToArray__default["default"](_findSelectorMatch11, 2);
		currentSelector = _findSelectorMatch12[0];
		delta = _findSelectorMatch12[1];
		specificity[1] += delta;
		currentSelector = currentSelector.replace(/[*\s+>~]/g, " ").replace(/[#.]/g, " ");
		var _findSelectorMatch13 = findSelectorMatch(currentSelector, elementRegex);
		var _findSelectorMatch14 = _slicedToArray__default["default"](_findSelectorMatch13, 2);
		currentSelector = _findSelectorMatch14[0];
		delta = _findSelectorMatch14[1];
		specificity[2] += delta;
		return specificity.join("");
	}
	var PSEUDO_ZERO = 1e-8;
	/**
	* Vector magnitude.
	* @param v
	* @returns Number result.
	*/
	function vectorMagnitude(v) {
		return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
	}
	/**
	* Ratio between two vectors.
	* @param u
	* @param v
	* @returns Number result.
	*/
	function vectorsRatio(u, v) {
		return (u[0] * v[0] + u[1] * v[1]) / (vectorMagnitude(u) * vectorMagnitude(v));
	}
	/**
	* Angle between two vectors.
	* @param u
	* @param v
	* @returns Number result.
	*/
	function vectorsAngle(u, v) {
		return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vectorsRatio(u, v));
	}
	function CB1(t) {
		return t * t * t;
	}
	function CB2(t) {
		return 3 * t * t * (1 - t);
	}
	function CB3(t) {
		return 3 * t * (1 - t) * (1 - t);
	}
	function CB4(t) {
		return (1 - t) * (1 - t) * (1 - t);
	}
	function QB1(t) {
		return t * t;
	}
	function QB2(t) {
		return 2 * t * (1 - t);
	}
	function QB3(t) {
		return (1 - t) * (1 - t);
	}
	var Property = /*#__PURE__*/ function() {
		function Property(document, name, value) {
			_classCallCheck__default["default"](this, Property);
			this.document = document;
			this.name = name;
			this.value = value;
			this.isNormalizedColor = false;
		}
		_createClass__default["default"](Property, [
			{
				key: "split",
				value: function split() {
					var separator = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : " ";
					var document = this.document, name = this.name;
					return compressSpaces(this.getString()).trim().split(separator).map(function(value) {
						return new Property(document, name, value);
					});
				}
			},
			{
				key: "hasValue",
				value: function hasValue(zeroIsValue) {
					var value = this.value;
					return value !== null && value !== "" && (zeroIsValue || value !== 0) && typeof value !== "undefined";
				}
			},
			{
				key: "isString",
				value: function isString(regexp) {
					var value = this.value;
					var result = typeof value === "string";
					if (!result || !regexp) return result;
					return regexp.test(value);
				}
			},
			{
				key: "isUrlDefinition",
				value: function isUrlDefinition() {
					return this.isString(/^url\(/);
				}
			},
			{
				key: "isPixels",
				value: function isPixels() {
					if (!this.hasValue()) return false;
					var asString = this.getString();
					switch (true) {
						case asString.endsWith("px"):
						case /^[0-9]+$/.test(asString): return true;
						default: return false;
					}
				}
			},
			{
				key: "setValue",
				value: function setValue(value) {
					this.value = value;
					return this;
				}
			},
			{
				key: "getValue",
				value: function getValue(def) {
					if (typeof def === "undefined" || this.hasValue()) return this.value;
					return def;
				}
			},
			{
				key: "getNumber",
				value: function getNumber(def) {
					if (!this.hasValue()) {
						if (typeof def === "undefined") return 0;
						return parseFloat(def);
					}
					var value = this.value;
					var n = parseFloat(value);
					if (this.isString(/%$/)) n /= 100;
					return n;
				}
			},
			{
				key: "getString",
				value: function getString(def) {
					if (typeof def === "undefined" || this.hasValue()) return typeof this.value === "undefined" ? "" : String(this.value);
					return String(def);
				}
			},
			{
				key: "getColor",
				value: function getColor(def) {
					var color = this.getString(def);
					if (this.isNormalizedColor) return color;
					this.isNormalizedColor = true;
					color = normalizeColor(color);
					this.value = color;
					return color;
				}
			},
			{
				key: "getDpi",
				value: function getDpi() {
					return 96;
				}
			},
			{
				key: "getRem",
				value: function getRem() {
					return this.document.rootEmSize;
				}
			},
			{
				key: "getEm",
				value: function getEm() {
					return this.document.emSize;
				}
			},
			{
				key: "getUnits",
				value: function getUnits() {
					return this.getString().replace(/[0-9.-]/g, "");
				}
			},
			{
				key: "getPixels",
				value: function getPixels(axisOrIsFontSize) {
					var processPercent = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
					if (!this.hasValue()) return 0;
					var _ref = typeof axisOrIsFontSize === "boolean" ? [void 0, axisOrIsFontSize] : [axisOrIsFontSize], _ref2 = _slicedToArray__default["default"](_ref, 2), axis = _ref2[0], isFontSize = _ref2[1];
					var viewPort = this.document.screen.viewPort;
					switch (true) {
						case this.isString(/vmin$/): return this.getNumber() / 100 * Math.min(viewPort.computeSize("x"), viewPort.computeSize("y"));
						case this.isString(/vmax$/): return this.getNumber() / 100 * Math.max(viewPort.computeSize("x"), viewPort.computeSize("y"));
						case this.isString(/vw$/): return this.getNumber() / 100 * viewPort.computeSize("x");
						case this.isString(/vh$/): return this.getNumber() / 100 * viewPort.computeSize("y");
						case this.isString(/rem$/): return this.getNumber() * this.getRem();
						case this.isString(/em$/): return this.getNumber() * this.getEm();
						case this.isString(/ex$/): return this.getNumber() * this.getEm() / 2;
						case this.isString(/px$/): return this.getNumber();
						case this.isString(/pt$/): return this.getNumber() * this.getDpi() * (1 / 72);
						case this.isString(/pc$/): return this.getNumber() * 15;
						case this.isString(/cm$/): return this.getNumber() * this.getDpi() / 2.54;
						case this.isString(/mm$/): return this.getNumber() * this.getDpi() / 25.4;
						case this.isString(/in$/): return this.getNumber() * this.getDpi();
						case this.isString(/%$/) && isFontSize: return this.getNumber() * this.getEm();
						case this.isString(/%$/): return this.getNumber() * viewPort.computeSize(axis);
						default:
							var n = this.getNumber();
							if (processPercent && n < 1) return n * viewPort.computeSize(axis);
							return n;
					}
				}
			},
			{
				key: "getMilliseconds",
				value: function getMilliseconds() {
					if (!this.hasValue()) return 0;
					if (this.isString(/ms$/)) return this.getNumber();
					return this.getNumber() * 1e3;
				}
			},
			{
				key: "getRadians",
				value: function getRadians() {
					if (!this.hasValue()) return 0;
					switch (true) {
						case this.isString(/deg$/): return this.getNumber() * (Math.PI / 180);
						case this.isString(/grad$/): return this.getNumber() * (Math.PI / 200);
						case this.isString(/rad$/): return this.getNumber();
						default: return this.getNumber() * (Math.PI / 180);
					}
				}
			},
			{
				key: "getDefinition",
				value: function getDefinition() {
					var asString = this.getString();
					var name = /#([^)'"]+)/.exec(asString);
					if (name) name = name[1];
					if (!name) name = asString;
					return this.document.definitions[name];
				}
			},
			{
				key: "getFillStyleDefinition",
				value: function getFillStyleDefinition(element, opacity) {
					var def = this.getDefinition();
					if (!def) return null;
					if (typeof def.createGradient === "function") return def.createGradient(this.document.ctx, element, opacity);
					if (typeof def.createPattern === "function") {
						if (def.getHrefAttribute().hasValue()) {
							var patternTransform = def.getAttribute("patternTransform");
							def = def.getHrefAttribute().getDefinition();
							if (patternTransform.hasValue()) def.getAttribute("patternTransform", true).setValue(patternTransform.value);
						}
						return def.createPattern(this.document.ctx, element, opacity);
					}
					return null;
				}
			},
			{
				key: "getTextBaseline",
				value: function getTextBaseline() {
					if (!this.hasValue()) return null;
					return Property.textBaselineMapping[this.getString()];
				}
			},
			{
				key: "addOpacity",
				value: function addOpacity(opacity) {
					var value = this.getColor();
					var len = value.length;
					var commas = 0;
					for (var i = 0; i < len; i++) {
						if (value[i] === ",") commas++;
						if (commas === 3) break;
					}
					if (opacity.hasValue() && this.isString() && commas !== 3) {
						var color = new RGBColor__default["default"](value);
						if (color.ok) {
							color.alpha = opacity.getNumber();
							value = color.toRGBA();
						}
					}
					return new Property(this.document, this.name, value);
				}
			}
		], [{
			key: "empty",
			value: function empty(document) {
				return new Property(document, "EMPTY", "");
			}
		}]);
		return Property;
	}();
	Property.textBaselineMapping = {
		"baseline": "alphabetic",
		"before-edge": "top",
		"text-before-edge": "top",
		"middle": "middle",
		"central": "middle",
		"after-edge": "bottom",
		"text-after-edge": "bottom",
		"ideographic": "ideographic",
		"alphabetic": "alphabetic",
		"hanging": "hanging",
		"mathematical": "alphabetic"
	};
	var ViewPort = /*#__PURE__*/ function() {
		function ViewPort() {
			_classCallCheck__default["default"](this, ViewPort);
			this.viewPorts = [];
		}
		_createClass__default["default"](ViewPort, [
			{
				key: "clear",
				value: function clear() {
					this.viewPorts = [];
				}
			},
			{
				key: "setCurrent",
				value: function setCurrent(width, height) {
					this.viewPorts.push({
						width,
						height
					});
				}
			},
			{
				key: "removeCurrent",
				value: function removeCurrent() {
					this.viewPorts.pop();
				}
			},
			{
				key: "getCurrent",
				value: function getCurrent() {
					var viewPorts = this.viewPorts;
					return viewPorts[viewPorts.length - 1];
				}
			},
			{
				key: "computeSize",
				value: function computeSize(d) {
					if (typeof d === "number") return d;
					if (d === "x") return this.width;
					if (d === "y") return this.height;
					return Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2)) / Math.sqrt(2);
				}
			},
			{
				key: "width",
				get: function get() {
					return this.getCurrent().width;
				}
			},
			{
				key: "height",
				get: function get() {
					return this.getCurrent().height;
				}
			}
		]);
		return ViewPort;
	}();
	var Point = /*#__PURE__*/ function() {
		function Point(x, y) {
			_classCallCheck__default["default"](this, Point);
			this.x = x;
			this.y = y;
		}
		_createClass__default["default"](Point, [{
			key: "angleTo",
			value: function angleTo(point) {
				return Math.atan2(point.y - this.y, point.x - this.x);
			}
		}, {
			key: "applyTransform",
			value: function applyTransform(transform) {
				var x = this.x, y = this.y;
				var xp = x * transform[0] + y * transform[2] + transform[4];
				var yp = x * transform[1] + y * transform[3] + transform[5];
				this.x = xp;
				this.y = yp;
			}
		}], [
			{
				key: "parse",
				value: function parse(point) {
					var defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
					var _toNumbers = toNumbers(point), _toNumbers2 = _slicedToArray__default["default"](_toNumbers, 2), _toNumbers2$ = _toNumbers2[0], x = _toNumbers2$ === void 0 ? defaultValue : _toNumbers2$, _toNumbers2$2 = _toNumbers2[1];
					return new Point(x, _toNumbers2$2 === void 0 ? defaultValue : _toNumbers2$2);
				}
			},
			{
				key: "parseScale",
				value: function parseScale(scale) {
					var defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
					var _toNumbers3 = toNumbers(scale), _toNumbers4 = _slicedToArray__default["default"](_toNumbers3, 2), _toNumbers4$ = _toNumbers4[0], x = _toNumbers4$ === void 0 ? defaultValue : _toNumbers4$, _toNumbers4$2 = _toNumbers4[1];
					return new Point(x, _toNumbers4$2 === void 0 ? x : _toNumbers4$2);
				}
			},
			{
				key: "parsePath",
				value: function parsePath(path) {
					var points = toNumbers(path);
					var len = points.length;
					var pathPoints = [];
					for (var i = 0; i < len; i += 2) pathPoints.push(new Point(points[i], points[i + 1]));
					return pathPoints;
				}
			}
		]);
		return Point;
	}();
	var Mouse = /*#__PURE__*/ function() {
		function Mouse(screen) {
			_classCallCheck__default["default"](this, Mouse);
			this.screen = screen;
			this.working = false;
			this.events = [];
			this.eventElements = [];
			this.onClick = this.onClick.bind(this);
			this.onMouseMove = this.onMouseMove.bind(this);
		}
		_createClass__default["default"](Mouse, [
			{
				key: "isWorking",
				value: function isWorking() {
					return this.working;
				}
			},
			{
				key: "start",
				value: function start() {
					if (this.working) return;
					var screen = this.screen, onClick = this.onClick, onMouseMove = this.onMouseMove;
					var canvas = screen.ctx.canvas;
					canvas.onclick = onClick;
					canvas.onmousemove = onMouseMove;
					this.working = true;
				}
			},
			{
				key: "stop",
				value: function stop() {
					if (!this.working) return;
					var canvas = this.screen.ctx.canvas;
					this.working = false;
					canvas.onclick = null;
					canvas.onmousemove = null;
				}
			},
			{
				key: "hasEvents",
				value: function hasEvents() {
					return this.working && this.events.length > 0;
				}
			},
			{
				key: "runEvents",
				value: function runEvents() {
					if (!this.working) return;
					var document = this.screen, events = this.events, eventElements = this.eventElements;
					var style = document.ctx.canvas.style;
					if (style) style.cursor = "";
					events.forEach(function(_ref, i) {
						var run = _ref.run;
						var element = eventElements[i];
						while (element) {
							run(element);
							element = element.parent;
						}
					});
					this.events = [];
					this.eventElements = [];
				}
			},
			{
				key: "checkPath",
				value: function checkPath(element, ctx) {
					if (!this.working || !ctx) return;
					var events = this.events, eventElements = this.eventElements;
					events.forEach(function(_ref2, i) {
						var x = _ref2.x, y = _ref2.y;
						if (!eventElements[i] && ctx.isPointInPath && ctx.isPointInPath(x, y)) eventElements[i] = element;
					});
				}
			},
			{
				key: "checkBoundingBox",
				value: function checkBoundingBox(element, boundingBox) {
					if (!this.working || !boundingBox) return;
					var events = this.events, eventElements = this.eventElements;
					events.forEach(function(_ref3, i) {
						var x = _ref3.x, y = _ref3.y;
						if (!eventElements[i] && boundingBox.isPointInBox(x, y)) eventElements[i] = element;
					});
				}
			},
			{
				key: "mapXY",
				value: function mapXY(x, y) {
					var _this$screen = this.screen, window = _this$screen.window, ctx = _this$screen.ctx;
					var point = new Point(x, y);
					var element = ctx.canvas;
					while (element) {
						point.x -= element.offsetLeft;
						point.y -= element.offsetTop;
						element = element.offsetParent;
					}
					if (window.scrollX) point.x += window.scrollX;
					if (window.scrollY) point.y += window.scrollY;
					return point;
				}
			},
			{
				key: "onClick",
				value: function onClick(event) {
					var _this$mapXY = this.mapXY(event.clientX, event.clientY), x = _this$mapXY.x, y = _this$mapXY.y;
					this.events.push({
						type: "onclick",
						x,
						y,
						run: function run(eventTarget) {
							if (eventTarget.onClick) eventTarget.onClick();
						}
					});
				}
			},
			{
				key: "onMouseMove",
				value: function onMouseMove(event) {
					var _this$mapXY2 = this.mapXY(event.clientX, event.clientY), x = _this$mapXY2.x, y = _this$mapXY2.y;
					this.events.push({
						type: "onmousemove",
						x,
						y,
						run: function run(eventTarget) {
							if (eventTarget.onMouseMove) eventTarget.onMouseMove();
						}
					});
				}
			}
		]);
		return Mouse;
	}();
	var defaultWindow = typeof window !== "undefined" ? window : null;
	var defaultFetch$1 = typeof fetch !== "undefined" ? fetch.bind(void 0) : null;
	var Screen = /*#__PURE__*/ function() {
		function Screen(ctx) {
			var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref$fetch = _ref.fetch, fetch = _ref$fetch === void 0 ? defaultFetch$1 : _ref$fetch, _ref$window = _ref.window, window = _ref$window === void 0 ? defaultWindow : _ref$window;
			_classCallCheck__default["default"](this, Screen);
			this.ctx = ctx;
			this.FRAMERATE = 30;
			this.MAX_VIRTUAL_PIXELS = 3e4;
			this.CLIENT_WIDTH = 800;
			this.CLIENT_HEIGHT = 600;
			this.viewPort = new ViewPort();
			this.mouse = new Mouse(this);
			this.animations = [];
			this.waits = [];
			this.frameDuration = 0;
			this.isReadyLock = false;
			this.isFirstRender = true;
			this.intervalId = null;
			this.window = window;
			this.fetch = fetch;
		}
		_createClass__default["default"](Screen, [
			{
				key: "wait",
				value: function wait(checker) {
					this.waits.push(checker);
				}
			},
			{
				key: "ready",
				value: function ready() {
					if (!this.readyPromise) return Promise.resolve();
					return this.readyPromise;
				}
			},
			{
				key: "isReady",
				value: function isReady() {
					if (this.isReadyLock) return true;
					var isReadyLock = this.waits.every(function(_) {
						return _();
					});
					if (isReadyLock) {
						this.waits = [];
						if (this.resolveReady) this.resolveReady();
					}
					this.isReadyLock = isReadyLock;
					return isReadyLock;
				}
			},
			{
				key: "setDefaults",
				value: function setDefaults(ctx) {
					ctx.strokeStyle = "rgba(0,0,0,0)";
					ctx.lineCap = "butt";
					ctx.lineJoin = "miter";
					ctx.miterLimit = 4;
				}
			},
			{
				key: "setViewBox",
				value: function setViewBox(_ref2) {
					var document = _ref2.document, ctx = _ref2.ctx, aspectRatio = _ref2.aspectRatio, width = _ref2.width, desiredWidth = _ref2.desiredWidth, height = _ref2.height, desiredHeight = _ref2.desiredHeight, _ref2$minX = _ref2.minX, minX = _ref2$minX === void 0 ? 0 : _ref2$minX, _ref2$minY = _ref2.minY, minY = _ref2$minY === void 0 ? 0 : _ref2$minY, refX = _ref2.refX, refY = _ref2.refY, _ref2$clip = _ref2.clip, clip = _ref2$clip === void 0 ? false : _ref2$clip, _ref2$clipX = _ref2.clipX, clipX = _ref2$clipX === void 0 ? 0 : _ref2$clipX, _ref2$clipY = _ref2.clipY, clipY = _ref2$clipY === void 0 ? 0 : _ref2$clipY;
					var _cleanAspectRatio$spl = compressSpaces(aspectRatio).replace(/^defer\s/, "").split(" "), _cleanAspectRatio$spl2 = _slicedToArray__default["default"](_cleanAspectRatio$spl, 2), aspectRatioAlign = _cleanAspectRatio$spl2[0], aspectRatioMeetOrSlice = _cleanAspectRatio$spl2[1];
					var align = aspectRatioAlign || "xMidYMid";
					var meetOrSlice = aspectRatioMeetOrSlice || "meet";
					var scaleX = width / desiredWidth;
					var scaleY = height / desiredHeight;
					var scaleMin = Math.min(scaleX, scaleY);
					var scaleMax = Math.max(scaleX, scaleY);
					var finalDesiredWidth = desiredWidth;
					var finalDesiredHeight = desiredHeight;
					if (meetOrSlice === "meet") {
						finalDesiredWidth *= scaleMin;
						finalDesiredHeight *= scaleMin;
					}
					if (meetOrSlice === "slice") {
						finalDesiredWidth *= scaleMax;
						finalDesiredHeight *= scaleMax;
					}
					var refXProp = new Property(document, "refX", refX);
					var refYProp = new Property(document, "refY", refY);
					var hasRefs = refXProp.hasValue() && refYProp.hasValue();
					if (hasRefs) ctx.translate(-scaleMin * refXProp.getPixels("x"), -scaleMin * refYProp.getPixels("y"));
					if (clip) {
						var scaledClipX = scaleMin * clipX;
						var scaledClipY = scaleMin * clipY;
						ctx.beginPath();
						ctx.moveTo(scaledClipX, scaledClipY);
						ctx.lineTo(width, scaledClipY);
						ctx.lineTo(width, height);
						ctx.lineTo(scaledClipX, height);
						ctx.closePath();
						ctx.clip();
					}
					if (!hasRefs) {
						var isMeetMinY = meetOrSlice === "meet" && scaleMin === scaleY;
						var isSliceMaxY = meetOrSlice === "slice" && scaleMax === scaleY;
						var isMeetMinX = meetOrSlice === "meet" && scaleMin === scaleX;
						var isSliceMaxX = meetOrSlice === "slice" && scaleMax === scaleX;
						if (align.startsWith("xMid") && (isMeetMinY || isSliceMaxY)) ctx.translate(width / 2 - finalDesiredWidth / 2, 0);
						if (align.endsWith("YMid") && (isMeetMinX || isSliceMaxX)) ctx.translate(0, height / 2 - finalDesiredHeight / 2);
						if (align.startsWith("xMax") && (isMeetMinY || isSliceMaxY)) ctx.translate(width - finalDesiredWidth, 0);
						if (align.endsWith("YMax") && (isMeetMinX || isSliceMaxX)) ctx.translate(0, height - finalDesiredHeight);
					}
					switch (true) {
						case align === "none":
							ctx.scale(scaleX, scaleY);
							break;
						case meetOrSlice === "meet":
							ctx.scale(scaleMin, scaleMin);
							break;
						case meetOrSlice === "slice": ctx.scale(scaleMax, scaleMax);
					}
					ctx.translate(-minX, -minY);
				}
			},
			{
				key: "start",
				value: function start(element) {
					var _this = this;
					var _ref3 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref3$enableRedraw = _ref3.enableRedraw, enableRedraw = _ref3$enableRedraw === void 0 ? false : _ref3$enableRedraw, _ref3$ignoreMouse = _ref3.ignoreMouse, ignoreMouse = _ref3$ignoreMouse === void 0 ? false : _ref3$ignoreMouse, _ref3$ignoreAnimation = _ref3.ignoreAnimation, ignoreAnimation = _ref3$ignoreAnimation === void 0 ? false : _ref3$ignoreAnimation, _ref3$ignoreDimension = _ref3.ignoreDimensions, ignoreDimensions = _ref3$ignoreDimension === void 0 ? false : _ref3$ignoreDimension, _ref3$ignoreClear = _ref3.ignoreClear, ignoreClear = _ref3$ignoreClear === void 0 ? false : _ref3$ignoreClear, forceRedraw = _ref3.forceRedraw, scaleWidth = _ref3.scaleWidth, scaleHeight = _ref3.scaleHeight, offsetX = _ref3.offsetX, offsetY = _ref3.offsetY;
					var FRAMERATE = this.FRAMERATE, mouse = this.mouse;
					var frameDuration = 1e3 / FRAMERATE;
					this.frameDuration = frameDuration;
					this.readyPromise = new Promise(function(resolve) {
						_this.resolveReady = resolve;
					});
					if (this.isReady()) this.render(element, ignoreDimensions, ignoreClear, scaleWidth, scaleHeight, offsetX, offsetY);
					if (!enableRedraw) return;
					var now = Date.now();
					var then = now;
					var delta = 0;
					var tick = function tick() {
						now = Date.now();
						delta = now - then;
						if (delta >= frameDuration) {
							then = now - delta % frameDuration;
							if (_this.shouldUpdate(ignoreAnimation, forceRedraw)) {
								_this.render(element, ignoreDimensions, ignoreClear, scaleWidth, scaleHeight, offsetX, offsetY);
								mouse.runEvents();
							}
						}
						_this.intervalId = requestAnimationFrame__default["default"](tick);
					};
					if (!ignoreMouse) mouse.start();
					this.intervalId = requestAnimationFrame__default["default"](tick);
				}
			},
			{
				key: "stop",
				value: function stop() {
					if (this.intervalId) {
						requestAnimationFrame__default["default"].cancel(this.intervalId);
						this.intervalId = null;
					}
					this.mouse.stop();
				}
			},
			{
				key: "shouldUpdate",
				value: function shouldUpdate(ignoreAnimation, forceRedraw) {
					if (!ignoreAnimation) {
						var frameDuration = this.frameDuration;
						if (this.animations.reduce(function(shouldUpdate, animation) {
							return animation.update(frameDuration) || shouldUpdate;
						}, false)) return true;
					}
					if (typeof forceRedraw === "function" && forceRedraw()) return true;
					if (!this.isReadyLock && this.isReady()) return true;
					if (this.mouse.hasEvents()) return true;
					return false;
				}
			},
			{
				key: "render",
				value: function render(element, ignoreDimensions, ignoreClear, scaleWidth, scaleHeight, offsetX, offsetY) {
					var CLIENT_WIDTH = this.CLIENT_WIDTH, CLIENT_HEIGHT = this.CLIENT_HEIGHT, viewPort = this.viewPort, ctx = this.ctx, isFirstRender = this.isFirstRender;
					var canvas = ctx.canvas;
					viewPort.clear();
					if (canvas.width && canvas.height) viewPort.setCurrent(canvas.width, canvas.height);
					else viewPort.setCurrent(CLIENT_WIDTH, CLIENT_HEIGHT);
					var widthStyle = element.getStyle("width");
					var heightStyle = element.getStyle("height");
					if (!ignoreDimensions && (isFirstRender || typeof scaleWidth !== "number" && typeof scaleHeight !== "number")) {
						if (widthStyle.hasValue()) {
							canvas.width = widthStyle.getPixels("x");
							if (canvas.style) canvas.style.width = "".concat(canvas.width, "px");
						}
						if (heightStyle.hasValue()) {
							canvas.height = heightStyle.getPixels("y");
							if (canvas.style) canvas.style.height = "".concat(canvas.height, "px");
						}
					}
					var cWidth = canvas.clientWidth || canvas.width;
					var cHeight = canvas.clientHeight || canvas.height;
					if (ignoreDimensions && widthStyle.hasValue() && heightStyle.hasValue()) {
						cWidth = widthStyle.getPixels("x");
						cHeight = heightStyle.getPixels("y");
					}
					viewPort.setCurrent(cWidth, cHeight);
					if (typeof offsetX === "number") element.getAttribute("x", true).setValue(offsetX);
					if (typeof offsetY === "number") element.getAttribute("y", true).setValue(offsetY);
					if (typeof scaleWidth === "number" || typeof scaleHeight === "number") {
						var viewBox = toNumbers(element.getAttribute("viewBox").getString());
						var xRatio = 0;
						var yRatio = 0;
						if (typeof scaleWidth === "number") {
							var _widthStyle = element.getStyle("width");
							if (_widthStyle.hasValue()) xRatio = _widthStyle.getPixels("x") / scaleWidth;
							else if (!isNaN(viewBox[2])) xRatio = viewBox[2] / scaleWidth;
						}
						if (typeof scaleHeight === "number") {
							var _heightStyle = element.getStyle("height");
							if (_heightStyle.hasValue()) yRatio = _heightStyle.getPixels("y") / scaleHeight;
							else if (!isNaN(viewBox[3])) yRatio = viewBox[3] / scaleHeight;
						}
						if (!xRatio) xRatio = yRatio;
						if (!yRatio) yRatio = xRatio;
						element.getAttribute("width", true).setValue(scaleWidth);
						element.getAttribute("height", true).setValue(scaleHeight);
						var transformStyle = element.getStyle("transform", true, true);
						transformStyle.setValue("".concat(transformStyle.getString(), " scale(").concat(1 / xRatio, ", ").concat(1 / yRatio, ")"));
					}
					if (!ignoreClear) ctx.clearRect(0, 0, cWidth, cHeight);
					element.render(ctx);
					if (isFirstRender) this.isFirstRender = false;
				}
			}
		]);
		return Screen;
	}();
	Screen.defaultWindow = defaultWindow;
	Screen.defaultFetch = defaultFetch$1;
	var defaultFetch = Screen.defaultFetch;
	var DefaultDOMParser = typeof DOMParser !== "undefined" ? DOMParser : null;
	var Parser = /*#__PURE__*/ function() {
		function Parser() {
			var _ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ref$fetch = _ref.fetch, fetch = _ref$fetch === void 0 ? defaultFetch : _ref$fetch, _ref$DOMParser = _ref.DOMParser, DOMParser = _ref$DOMParser === void 0 ? DefaultDOMParser : _ref$DOMParser;
			_classCallCheck__default["default"](this, Parser);
			this.fetch = fetch;
			this.DOMParser = DOMParser;
		}
		_createClass__default["default"](Parser, [
			{
				key: "parse",
				value: function() {
					var _parse = _asyncToGenerator__default["default"](/*#__PURE__*/ _regeneratorRuntime__default["default"].mark(function _callee(resource) {
						return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
							while (1) switch (_context.prev = _context.next) {
								case 0:
									if (!resource.startsWith("<")) {
										_context.next = 2;
										break;
									}
									return _context.abrupt("return", this.parseFromString(resource));
								case 2: return _context.abrupt("return", this.load(resource));
								case 3:
								case "end": return _context.stop();
							}
						}, _callee, this);
					}));
					function parse(_x) {
						return _parse.apply(this, arguments);
					}
					return parse;
				}()
			},
			{
				key: "parseFromString",
				value: function parseFromString(xml) {
					var parser = new this.DOMParser();
					try {
						return this.checkDocument(parser.parseFromString(xml, "image/svg+xml"));
					} catch (err) {
						return this.checkDocument(parser.parseFromString(xml, "text/xml"));
					}
				}
			},
			{
				key: "checkDocument",
				value: function checkDocument(document) {
					var parserError = document.getElementsByTagName("parsererror")[0];
					if (parserError) throw new Error(parserError.textContent);
					return document;
				}
			},
			{
				key: "load",
				value: function() {
					var _load = _asyncToGenerator__default["default"](/*#__PURE__*/ _regeneratorRuntime__default["default"].mark(function _callee2(url) {
						var response, xml;
						return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
							while (1) switch (_context2.prev = _context2.next) {
								case 0:
									_context2.next = 2;
									return this.fetch(url);
								case 2:
									response = _context2.sent;
									_context2.next = 5;
									return response.text();
								case 5:
									xml = _context2.sent;
									return _context2.abrupt("return", this.parseFromString(xml));
								case 7:
								case "end": return _context2.stop();
							}
						}, _callee2, this);
					}));
					function load(_x2) {
						return _load.apply(this, arguments);
					}
					return load;
				}()
			}
		]);
		return Parser;
	}();
	var Translate = /*#__PURE__*/ function() {
		function Translate(_, point) {
			_classCallCheck__default["default"](this, Translate);
			this.type = "translate";
			this.point = null;
			this.point = Point.parse(point);
		}
		_createClass__default["default"](Translate, [
			{
				key: "apply",
				value: function apply(ctx) {
					var _this$point = this.point, x = _this$point.x, y = _this$point.y;
					ctx.translate(x || 0, y || 0);
				}
			},
			{
				key: "unapply",
				value: function unapply(ctx) {
					var _this$point2 = this.point, x = _this$point2.x, y = _this$point2.y;
					ctx.translate(-1 * x || 0, -1 * y || 0);
				}
			},
			{
				key: "applyToPoint",
				value: function applyToPoint(point) {
					var _this$point3 = this.point, x = _this$point3.x, y = _this$point3.y;
					point.applyTransform([
						1,
						0,
						0,
						1,
						x || 0,
						y || 0
					]);
				}
			}
		]);
		return Translate;
	}();
	var Rotate = /*#__PURE__*/ function() {
		function Rotate(document, rotate, transformOrigin) {
			_classCallCheck__default["default"](this, Rotate);
			this.type = "rotate";
			this.angle = null;
			this.originX = null;
			this.originY = null;
			this.cx = 0;
			this.cy = 0;
			var numbers = toNumbers(rotate);
			this.angle = new Property(document, "angle", numbers[0]);
			this.originX = transformOrigin[0];
			this.originY = transformOrigin[1];
			this.cx = numbers[1] || 0;
			this.cy = numbers[2] || 0;
		}
		_createClass__default["default"](Rotate, [
			{
				key: "apply",
				value: function apply(ctx) {
					var cx = this.cx, cy = this.cy, originX = this.originX, originY = this.originY, angle = this.angle;
					var tx = cx + originX.getPixels("x");
					var ty = cy + originY.getPixels("y");
					ctx.translate(tx, ty);
					ctx.rotate(angle.getRadians());
					ctx.translate(-tx, -ty);
				}
			},
			{
				key: "unapply",
				value: function unapply(ctx) {
					var cx = this.cx, cy = this.cy, originX = this.originX, originY = this.originY, angle = this.angle;
					var tx = cx + originX.getPixels("x");
					var ty = cy + originY.getPixels("y");
					ctx.translate(tx, ty);
					ctx.rotate(-1 * angle.getRadians());
					ctx.translate(-tx, -ty);
				}
			},
			{
				key: "applyToPoint",
				value: function applyToPoint(point) {
					var cx = this.cx, cy = this.cy;
					var rad = this.angle.getRadians();
					point.applyTransform([
						1,
						0,
						0,
						1,
						cx || 0,
						cy || 0
					]);
					point.applyTransform([
						Math.cos(rad),
						Math.sin(rad),
						-Math.sin(rad),
						Math.cos(rad),
						0,
						0
					]);
					point.applyTransform([
						1,
						0,
						0,
						1,
						-cx || 0,
						-cy || 0
					]);
				}
			}
		]);
		return Rotate;
	}();
	var Scale = /*#__PURE__*/ function() {
		function Scale(_, scale, transformOrigin) {
			_classCallCheck__default["default"](this, Scale);
			this.type = "scale";
			this.scale = null;
			this.originX = null;
			this.originY = null;
			var scaleSize = Point.parseScale(scale);
			if (scaleSize.x === 0 || scaleSize.y === 0) {
				scaleSize.x = PSEUDO_ZERO;
				scaleSize.y = PSEUDO_ZERO;
			}
			this.scale = scaleSize;
			this.originX = transformOrigin[0];
			this.originY = transformOrigin[1];
		}
		_createClass__default["default"](Scale, [
			{
				key: "apply",
				value: function apply(ctx) {
					var _this$scale = this.scale, x = _this$scale.x, y = _this$scale.y, originX = this.originX, originY = this.originY;
					var tx = originX.getPixels("x");
					var ty = originY.getPixels("y");
					ctx.translate(tx, ty);
					ctx.scale(x, y || x);
					ctx.translate(-tx, -ty);
				}
			},
			{
				key: "unapply",
				value: function unapply(ctx) {
					var _this$scale2 = this.scale, x = _this$scale2.x, y = _this$scale2.y, originX = this.originX, originY = this.originY;
					var tx = originX.getPixels("x");
					var ty = originY.getPixels("y");
					ctx.translate(tx, ty);
					ctx.scale(1 / x, 1 / y || x);
					ctx.translate(-tx, -ty);
				}
			},
			{
				key: "applyToPoint",
				value: function applyToPoint(point) {
					var _this$scale3 = this.scale, x = _this$scale3.x, y = _this$scale3.y;
					point.applyTransform([
						x || 0,
						0,
						0,
						y || 0,
						0,
						0
					]);
				}
			}
		]);
		return Scale;
	}();
	var Matrix = /*#__PURE__*/ function() {
		function Matrix(_, matrix, transformOrigin) {
			_classCallCheck__default["default"](this, Matrix);
			this.type = "matrix";
			this.matrix = [];
			this.originX = null;
			this.originY = null;
			this.matrix = toNumbers(matrix);
			this.originX = transformOrigin[0];
			this.originY = transformOrigin[1];
		}
		_createClass__default["default"](Matrix, [
			{
				key: "apply",
				value: function apply(ctx) {
					var originX = this.originX, originY = this.originY, matrix = this.matrix;
					var tx = originX.getPixels("x");
					var ty = originY.getPixels("y");
					ctx.translate(tx, ty);
					ctx.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
					ctx.translate(-tx, -ty);
				}
			},
			{
				key: "unapply",
				value: function unapply(ctx) {
					var originX = this.originX, originY = this.originY, matrix = this.matrix;
					var a = matrix[0];
					var b = matrix[2];
					var c = matrix[4];
					var d = matrix[1];
					var e = matrix[3];
					var f = matrix[5];
					var g = 0;
					var h = 0;
					var i = 1;
					var det = 1 / (a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g));
					var tx = originX.getPixels("x");
					var ty = originY.getPixels("y");
					ctx.translate(tx, ty);
					ctx.transform(det * (e * i - f * h), det * (f * g - d * i), det * (c * h - b * i), det * (a * i - c * g), det * (b * f - c * e), det * (c * d - a * f));
					ctx.translate(-tx, -ty);
				}
			},
			{
				key: "applyToPoint",
				value: function applyToPoint(point) {
					point.applyTransform(this.matrix);
				}
			}
		]);
		return Matrix;
	}();
	function _createSuper$M(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$M();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$M() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var Skew = /*#__PURE__*/ function(_Matrix) {
		_inherits__default["default"](Skew, _Matrix);
		var _super = _createSuper$M(Skew);
		function Skew(document, skew, transformOrigin) {
			var _this;
			_classCallCheck__default["default"](this, Skew);
			_this = _super.call(this, document, skew, transformOrigin);
			_this.type = "skew";
			_this.angle = null;
			_this.angle = new Property(document, "angle", skew);
			return _this;
		}
		return Skew;
	}(Matrix);
	function _createSuper$L(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$L();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$L() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var SkewX = /*#__PURE__*/ function(_Skew) {
		_inherits__default["default"](SkewX, _Skew);
		var _super = _createSuper$L(SkewX);
		function SkewX(document, skew, transformOrigin) {
			var _this;
			_classCallCheck__default["default"](this, SkewX);
			_this = _super.call(this, document, skew, transformOrigin);
			_this.type = "skewX";
			_this.matrix = [
				1,
				0,
				Math.tan(_this.angle.getRadians()),
				1,
				0,
				0
			];
			return _this;
		}
		return SkewX;
	}(Skew);
	function _createSuper$K(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$K();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$K() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var SkewY = /*#__PURE__*/ function(_Skew) {
		_inherits__default["default"](SkewY, _Skew);
		var _super = _createSuper$K(SkewY);
		function SkewY(document, skew, transformOrigin) {
			var _this;
			_classCallCheck__default["default"](this, SkewY);
			_this = _super.call(this, document, skew, transformOrigin);
			_this.type = "skewY";
			_this.matrix = [
				1,
				Math.tan(_this.angle.getRadians()),
				0,
				1,
				0,
				0
			];
			return _this;
		}
		return SkewY;
	}(Skew);
	function parseTransforms(transform) {
		return compressSpaces(transform).trim().replace(/\)([a-zA-Z])/g, ") $1").replace(/\)(\s?,\s?)/g, ") ").split(/\s(?=[a-z])/);
	}
	function parseTransform(transform) {
		var _transform$split = transform.split("("), _transform$split2 = _slicedToArray__default["default"](_transform$split, 2), type = _transform$split2[0], value = _transform$split2[1];
		return [type.trim(), value.trim().replace(")", "")];
	}
	var Transform = /*#__PURE__*/ function() {
		function Transform(document, transform, transformOrigin) {
			var _this = this;
			_classCallCheck__default["default"](this, Transform);
			this.document = document;
			this.transforms = [];
			parseTransforms(transform).forEach(function(transform) {
				if (transform === "none") return;
				var _parseTransform = parseTransform(transform), _parseTransform2 = _slicedToArray__default["default"](_parseTransform, 2), type = _parseTransform2[0], value = _parseTransform2[1];
				var TransformType = Transform.transformTypes[type];
				if (typeof TransformType !== "undefined") _this.transforms.push(new TransformType(_this.document, value, transformOrigin));
			});
		}
		_createClass__default["default"](Transform, [
			{
				key: "apply",
				value: function apply(ctx) {
					var transforms = this.transforms;
					var len = transforms.length;
					for (var i = 0; i < len; i++) transforms[i].apply(ctx);
				}
			},
			{
				key: "unapply",
				value: function unapply(ctx) {
					var transforms = this.transforms;
					for (var i = transforms.length - 1; i >= 0; i--) transforms[i].unapply(ctx);
				}
			},
			{
				key: "applyToPoint",
				value: function applyToPoint(point) {
					var transforms = this.transforms;
					var len = transforms.length;
					for (var i = 0; i < len; i++) transforms[i].applyToPoint(point);
				}
			}
		], [{
			key: "fromElement",
			value: function fromElement(document, element) {
				var transformStyle = element.getStyle("transform", false, true);
				var _element$getStyle$spl = element.getStyle("transform-origin", false, true).split(), _element$getStyle$spl2 = _slicedToArray__default["default"](_element$getStyle$spl, 2), transformOriginXProperty = _element$getStyle$spl2[0], _element$getStyle$spl3 = _element$getStyle$spl2[1];
				var transformOrigin = [transformOriginXProperty, _element$getStyle$spl3 === void 0 ? transformOriginXProperty : _element$getStyle$spl3];
				if (transformStyle.hasValue()) return new Transform(document, transformStyle.getString(), transformOrigin);
				return null;
			}
		}]);
		return Transform;
	}();
	Transform.transformTypes = {
		translate: Translate,
		rotate: Rotate,
		scale: Scale,
		matrix: Matrix,
		skewX: SkewX,
		skewY: SkewY
	};
	var Element = /*#__PURE__*/ function() {
		function Element(document, node) {
			var _this = this;
			var captureTextNodes = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
			_classCallCheck__default["default"](this, Element);
			this.document = document;
			this.node = node;
			this.captureTextNodes = captureTextNodes;
			this.attributes = Object.create(null);
			this.styles = Object.create(null);
			this.stylesSpecificity = Object.create(null);
			this.animationFrozen = false;
			this.animationFrozenValue = "";
			this.parent = null;
			this.children = [];
			if (!node || node.nodeType !== 1) return;
			Array.from(node.attributes).forEach(function(attribute) {
				var nodeName = normalizeAttributeName(attribute.nodeName);
				_this.attributes[nodeName] = new Property(document, nodeName, attribute.value);
			});
			this.addStylesFromStyleDefinition();
			if (this.getAttribute("style").hasValue()) this.getAttribute("style").getString().split(";").map(function(_) {
				return _.trim();
			}).forEach(function(style) {
				if (!style) return;
				var _style$split$map = style.split(":").map(function(_) {
					return _.trim();
				}), _style$split$map2 = _slicedToArray__default["default"](_style$split$map, 2), name = _style$split$map2[0], value = _style$split$map2[1];
				_this.styles[name] = new Property(document, name, value);
			});
			var definitions = document.definitions;
			var id = this.getAttribute("id");
			if (id.hasValue()) {
				if (!definitions[id.getString()]) definitions[id.getString()] = this;
			}
			Array.from(node.childNodes).forEach(function(childNode) {
				if (childNode.nodeType === 1) _this.addChild(childNode);
				else if (captureTextNodes && (childNode.nodeType === 3 || childNode.nodeType === 4)) {
					var textNode = document.createTextNode(childNode);
					if (textNode.getText().length > 0) _this.addChild(textNode);
				}
			});
		}
		_createClass__default["default"](Element, [
			{
				key: "getAttribute",
				value: function getAttribute(name) {
					var createIfNotExists = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
					var attr = this.attributes[name];
					if (!attr && createIfNotExists) {
						var _attr = new Property(this.document, name, "");
						this.attributes[name] = _attr;
						return _attr;
					}
					return attr || Property.empty(this.document);
				}
			},
			{
				key: "getHrefAttribute",
				value: function getHrefAttribute() {
					for (var key in this.attributes) if (key === "href" || key.endsWith(":href")) return this.attributes[key];
					return Property.empty(this.document);
				}
			},
			{
				key: "getStyle",
				value: function getStyle(name) {
					var createIfNotExists = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
					var skipAncestors = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
					var style = this.styles[name];
					if (style) return style;
					var attr = this.getAttribute(name);
					if (attr !== null && attr !== void 0 && attr.hasValue()) {
						this.styles[name] = attr;
						return attr;
					}
					if (!skipAncestors) {
						var parent = this.parent;
						if (parent) {
							var parentStyle = parent.getStyle(name);
							if (parentStyle !== null && parentStyle !== void 0 && parentStyle.hasValue()) return parentStyle;
						}
					}
					if (createIfNotExists) {
						var _style = new Property(this.document, name, "");
						this.styles[name] = _style;
						return _style;
					}
					return style || Property.empty(this.document);
				}
			},
			{
				key: "render",
				value: function render(ctx) {
					if (this.getStyle("display").getString() === "none" || this.getStyle("visibility").getString() === "hidden") return;
					ctx.save();
					if (this.getStyle("mask").hasValue()) {
						var mask = this.getStyle("mask").getDefinition();
						if (mask) {
							this.applyEffects(ctx);
							mask.apply(ctx, this);
						}
					} else if (this.getStyle("filter").getValue("none") !== "none") {
						var filter = this.getStyle("filter").getDefinition();
						if (filter) {
							this.applyEffects(ctx);
							filter.apply(ctx, this);
						}
					} else {
						this.setContext(ctx);
						this.renderChildren(ctx);
						this.clearContext(ctx);
					}
					ctx.restore();
				}
			},
			{
				key: "setContext",
				value: function setContext(_) {}
			},
			{
				key: "applyEffects",
				value: function applyEffects(ctx) {
					var transform = Transform.fromElement(this.document, this);
					if (transform) transform.apply(ctx);
					var clipPathStyleProp = this.getStyle("clip-path", false, true);
					if (clipPathStyleProp.hasValue()) {
						var clip = clipPathStyleProp.getDefinition();
						if (clip) clip.apply(ctx);
					}
				}
			},
			{
				key: "clearContext",
				value: function clearContext(_) {}
			},
			{
				key: "renderChildren",
				value: function renderChildren(ctx) {
					this.children.forEach(function(child) {
						child.render(ctx);
					});
				}
			},
			{
				key: "addChild",
				value: function addChild(childNode) {
					var child = childNode instanceof Element ? childNode : this.document.createElement(childNode);
					child.parent = this;
					if (!Element.ignoreChildTypes.includes(child.type)) this.children.push(child);
				}
			},
			{
				key: "matchesSelector",
				value: function matchesSelector(selector) {
					var _node$getAttribute;
					var node = this.node;
					if (typeof node.matches === "function") return node.matches(selector);
					var styleClasses = (_node$getAttribute = node.getAttribute) === null || _node$getAttribute === void 0 ? void 0 : _node$getAttribute.call(node, "class");
					if (!styleClasses || styleClasses === "") return false;
					return styleClasses.split(" ").some(function(styleClass) {
						return ".".concat(styleClass) === selector;
					});
				}
			},
			{
				key: "addStylesFromStyleDefinition",
				value: function addStylesFromStyleDefinition() {
					var _this$document = this.document, styles = _this$document.styles, stylesSpecificity = _this$document.stylesSpecificity;
					for (var selector in styles) if (!selector.startsWith("@") && this.matchesSelector(selector)) {
						var style = styles[selector];
						var specificity = stylesSpecificity[selector];
						if (style) for (var name in style) {
							var existingSpecificity = this.stylesSpecificity[name];
							if (typeof existingSpecificity === "undefined") existingSpecificity = "000";
							if (specificity >= existingSpecificity) {
								this.styles[name] = style[name];
								this.stylesSpecificity[name] = specificity;
							}
						}
					}
				}
			},
			{
				key: "removeStyles",
				value: function removeStyles(element, ignoreStyles) {
					return ignoreStyles.reduce(function(toRestore, name) {
						var styleProp = element.getStyle(name);
						if (!styleProp.hasValue()) return toRestore;
						var value = styleProp.getString();
						styleProp.setValue("");
						return [].concat(_toConsumableArray__default["default"](toRestore), [[name, value]]);
					}, []);
				}
			},
			{
				key: "restoreStyles",
				value: function restoreStyles(element, styles) {
					styles.forEach(function(_ref) {
						var _ref2 = _slicedToArray__default["default"](_ref, 2), name = _ref2[0], value = _ref2[1];
						element.getStyle(name, true).setValue(value);
					});
				}
			},
			{
				key: "isFirstChild",
				value: function isFirstChild() {
					var _this$parent;
					return ((_this$parent = this.parent) === null || _this$parent === void 0 ? void 0 : _this$parent.children.indexOf(this)) === 0;
				}
			}
		]);
		return Element;
	}();
	Element.ignoreChildTypes = ["title"];
	function _createSuper$J(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$J();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$J() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var UnknownElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](UnknownElement, _Element);
		var _super = _createSuper$J(UnknownElement);
		function UnknownElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, UnknownElement);
			_this = _super.call(this, document, node, captureTextNodes);
			return _this;
		}
		return UnknownElement;
	}(Element);
	function wrapFontFamily(fontFamily) {
		var trimmed = fontFamily.trim();
		return /^('|")/.test(trimmed) ? trimmed : "\"".concat(trimmed, "\"");
	}
	function prepareFontFamily(fontFamily) {
		return typeof process === "undefined" ? fontFamily : fontFamily.trim().split(",").map(wrapFontFamily).join(",");
	}
	/**
	* https://developer.mozilla.org/en-US/docs/Web/CSS/font-style
	* @param fontStyle
	* @returns CSS font style.
	*/
	function prepareFontStyle(fontStyle) {
		if (!fontStyle) return "";
		var targetFontStyle = fontStyle.trim().toLowerCase();
		switch (targetFontStyle) {
			case "normal":
			case "italic":
			case "oblique":
			case "inherit":
			case "initial":
			case "unset": return targetFontStyle;
			default:
				if (/^oblique\s+(-|)\d+deg$/.test(targetFontStyle)) return targetFontStyle;
				return "";
		}
	}
	/**
	* https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
	* @param fontWeight
	* @returns CSS font weight.
	*/
	function prepareFontWeight(fontWeight) {
		if (!fontWeight) return "";
		var targetFontWeight = fontWeight.trim().toLowerCase();
		switch (targetFontWeight) {
			case "normal":
			case "bold":
			case "lighter":
			case "bolder":
			case "inherit":
			case "initial":
			case "unset": return targetFontWeight;
			default:
				if (/^[\d.]+$/.test(targetFontWeight)) return targetFontWeight;
				return "";
		}
	}
	var Font = /*#__PURE__*/ function() {
		function Font(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit) {
			_classCallCheck__default["default"](this, Font);
			var inheritFont = inherit ? typeof inherit === "string" ? Font.parse(inherit) : inherit : {};
			this.fontFamily = fontFamily || inheritFont.fontFamily;
			this.fontSize = fontSize || inheritFont.fontSize;
			this.fontStyle = fontStyle || inheritFont.fontStyle;
			this.fontWeight = fontWeight || inheritFont.fontWeight;
			this.fontVariant = fontVariant || inheritFont.fontVariant;
		}
		_createClass__default["default"](Font, [{
			key: "toString",
			value: function toString() {
				return [
					prepareFontStyle(this.fontStyle),
					this.fontVariant,
					prepareFontWeight(this.fontWeight),
					this.fontSize,
					prepareFontFamily(this.fontFamily)
				].join(" ").trim();
			}
		}], [{
			key: "parse",
			value: function parse() {
				var font = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
				var inherit = arguments.length > 1 ? arguments[1] : void 0;
				var fontStyle = "";
				var fontVariant = "";
				var fontWeight = "";
				var fontSize = "";
				var fontFamily = "";
				var parts = compressSpaces(font).trim().split(" ");
				var set = {
					fontSize: false,
					fontStyle: false,
					fontWeight: false,
					fontVariant: false
				};
				parts.forEach(function(part) {
					switch (true) {
						case !set.fontStyle && Font.styles.includes(part):
							if (part !== "inherit") fontStyle = part;
							set.fontStyle = true;
							break;
						case !set.fontVariant && Font.variants.includes(part):
							if (part !== "inherit") fontVariant = part;
							set.fontStyle = true;
							set.fontVariant = true;
							break;
						case !set.fontWeight && Font.weights.includes(part):
							if (part !== "inherit") fontWeight = part;
							set.fontStyle = true;
							set.fontVariant = true;
							set.fontWeight = true;
							break;
						case !set.fontSize:
							if (part !== "inherit") {
								var _part$split = part.split("/");
								fontSize = _slicedToArray__default["default"](_part$split, 1)[0];
							}
							set.fontStyle = true;
							set.fontVariant = true;
							set.fontWeight = true;
							set.fontSize = true;
							break;
						default: if (part !== "inherit") fontFamily += part;
					}
				});
				return new Font(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit);
			}
		}]);
		return Font;
	}();
	Font.styles = "normal|italic|oblique|inherit";
	Font.variants = "normal|small-caps|inherit";
	Font.weights = "normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit";
	var BoundingBox = /*#__PURE__*/ function() {
		function BoundingBox() {
			var x1 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : NaN;
			var y1 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : NaN;
			var x2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : NaN;
			var y2 = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : NaN;
			_classCallCheck__default["default"](this, BoundingBox);
			this.x1 = x1;
			this.y1 = y1;
			this.x2 = x2;
			this.y2 = y2;
			this.addPoint(x1, y1);
			this.addPoint(x2, y2);
		}
		_createClass__default["default"](BoundingBox, [
			{
				key: "addPoint",
				value: function addPoint(x, y) {
					if (typeof x !== "undefined") {
						if (isNaN(this.x1) || isNaN(this.x2)) {
							this.x1 = x;
							this.x2 = x;
						}
						if (x < this.x1) this.x1 = x;
						if (x > this.x2) this.x2 = x;
					}
					if (typeof y !== "undefined") {
						if (isNaN(this.y1) || isNaN(this.y2)) {
							this.y1 = y;
							this.y2 = y;
						}
						if (y < this.y1) this.y1 = y;
						if (y > this.y2) this.y2 = y;
					}
				}
			},
			{
				key: "addX",
				value: function addX(x) {
					this.addPoint(x, null);
				}
			},
			{
				key: "addY",
				value: function addY(y) {
					this.addPoint(null, y);
				}
			},
			{
				key: "addBoundingBox",
				value: function addBoundingBox(boundingBox) {
					if (!boundingBox) return;
					var x1 = boundingBox.x1, y1 = boundingBox.y1, x2 = boundingBox.x2, y2 = boundingBox.y2;
					this.addPoint(x1, y1);
					this.addPoint(x2, y2);
				}
			},
			{
				key: "sumCubic",
				value: function sumCubic(t, p0, p1, p2, p3) {
					return Math.pow(1 - t, 3) * p0 + 3 * Math.pow(1 - t, 2) * t * p1 + 3 * (1 - t) * Math.pow(t, 2) * p2 + Math.pow(t, 3) * p3;
				}
			},
			{
				key: "bezierCurveAdd",
				value: function bezierCurveAdd(forX, p0, p1, p2, p3) {
					var b = 6 * p0 - 12 * p1 + 6 * p2;
					var a = -3 * p0 + 9 * p1 - 9 * p2 + 3 * p3;
					var c = 3 * p1 - 3 * p0;
					if (a === 0) {
						if (b === 0) return;
						var t = -c / b;
						if (0 < t && t < 1) {
							if (forX) this.addX(this.sumCubic(t, p0, p1, p2, p3));
							else this.addY(this.sumCubic(t, p0, p1, p2, p3));
						}
						return;
					}
					var b2ac = Math.pow(b, 2) - 4 * c * a;
					if (b2ac < 0) return;
					var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
					if (0 < t1 && t1 < 1) {
						if (forX) this.addX(this.sumCubic(t1, p0, p1, p2, p3));
						else this.addY(this.sumCubic(t1, p0, p1, p2, p3));
					}
					var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
					if (0 < t2 && t2 < 1) {
						if (forX) this.addX(this.sumCubic(t2, p0, p1, p2, p3));
						else this.addY(this.sumCubic(t2, p0, p1, p2, p3));
					}
				}
			},
			{
				key: "addBezierCurve",
				value: function addBezierCurve(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
					this.addPoint(p0x, p0y);
					this.addPoint(p3x, p3y);
					this.bezierCurveAdd(true, p0x, p1x, p2x, p3x);
					this.bezierCurveAdd(false, p0y, p1y, p2y, p3y);
				}
			},
			{
				key: "addQuadraticCurve",
				value: function addQuadraticCurve(p0x, p0y, p1x, p1y, p2x, p2y) {
					var cp1x = p0x + 2 / 3 * (p1x - p0x);
					var cp1y = p0y + 2 / 3 * (p1y - p0y);
					var cp2x = cp1x + 1 / 3 * (p2x - p0x);
					var cp2y = cp1y + 1 / 3 * (p2y - p0y);
					this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y, cp2y, p2x, p2y);
				}
			},
			{
				key: "isPointInBox",
				value: function isPointInBox(x, y) {
					var x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2;
					return x1 <= x && x <= x2 && y1 <= y && y <= y2;
				}
			},
			{
				key: "x",
				get: function get() {
					return this.x1;
				}
			},
			{
				key: "y",
				get: function get() {
					return this.y1;
				}
			},
			{
				key: "width",
				get: function get() {
					return this.x2 - this.x1;
				}
			},
			{
				key: "height",
				get: function get() {
					return this.y2 - this.y1;
				}
			}
		]);
		return BoundingBox;
	}();
	function _createSuper$I(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$I();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$I() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var PathParser = /*#__PURE__*/ function(_SVGPathData) {
		_inherits__default["default"](PathParser, _SVGPathData);
		var _super = _createSuper$I(PathParser);
		function PathParser(path) {
			var _this;
			_classCallCheck__default["default"](this, PathParser);
			_this = _super.call(this, path.replace(/([+\-.])\s+/gm, "$1").replace(/[^MmZzLlHhVvCcSsQqTtAae\d\s.,+-].*/g, ""));
			_this.control = null;
			_this.start = null;
			_this.current = null;
			_this.command = null;
			_this.commands = _this.commands;
			_this.i = -1;
			_this.previousCommand = null;
			_this.points = [];
			_this.angles = [];
			return _this;
		}
		_createClass__default["default"](PathParser, [
			{
				key: "reset",
				value: function reset() {
					this.i = -1;
					this.command = null;
					this.previousCommand = null;
					this.start = new Point(0, 0);
					this.control = new Point(0, 0);
					this.current = new Point(0, 0);
					this.points = [];
					this.angles = [];
				}
			},
			{
				key: "isEnd",
				value: function isEnd() {
					return this.i >= this.commands.length - 1;
				}
			},
			{
				key: "next",
				value: function next() {
					var command = this.commands[++this.i];
					this.previousCommand = this.command;
					this.command = command;
					return command;
				}
			},
			{
				key: "getPoint",
				value: function getPoint() {
					var xProp = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "x";
					var yProp = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "y";
					var point = new Point(this.command[xProp], this.command[yProp]);
					return this.makeAbsolute(point);
				}
			},
			{
				key: "getAsControlPoint",
				value: function getAsControlPoint(xProp, yProp) {
					var point = this.getPoint(xProp, yProp);
					this.control = point;
					return point;
				}
			},
			{
				key: "getAsCurrentPoint",
				value: function getAsCurrentPoint(xProp, yProp) {
					var point = this.getPoint(xProp, yProp);
					this.current = point;
					return point;
				}
			},
			{
				key: "getReflectedControlPoint",
				value: function getReflectedControlPoint() {
					var previousCommand = this.previousCommand.type;
					if (previousCommand !== svgPathdata.SVGPathData.CURVE_TO && previousCommand !== svgPathdata.SVGPathData.SMOOTH_CURVE_TO && previousCommand !== svgPathdata.SVGPathData.QUAD_TO && previousCommand !== svgPathdata.SVGPathData.SMOOTH_QUAD_TO) return this.current;
					var _this$current = this.current, cx = _this$current.x, cy = _this$current.y, _this$control = this.control, ox = _this$control.x, oy = _this$control.y;
					return new Point(2 * cx - ox, 2 * cy - oy);
				}
			},
			{
				key: "makeAbsolute",
				value: function makeAbsolute(point) {
					if (this.command.relative) {
						var _this$current2 = this.current, x = _this$current2.x, y = _this$current2.y;
						point.x += x;
						point.y += y;
					}
					return point;
				}
			},
			{
				key: "addMarker",
				value: function addMarker(point, from, priorTo) {
					var points = this.points, angles = this.angles;
					if (priorTo && angles.length > 0 && !angles[angles.length - 1]) angles[angles.length - 1] = points[points.length - 1].angleTo(priorTo);
					this.addMarkerAngle(point, from ? from.angleTo(point) : null);
				}
			},
			{
				key: "addMarkerAngle",
				value: function addMarkerAngle(point, angle) {
					this.points.push(point);
					this.angles.push(angle);
				}
			},
			{
				key: "getMarkerPoints",
				value: function getMarkerPoints() {
					return this.points;
				}
			},
			{
				key: "getMarkerAngles",
				value: function getMarkerAngles() {
					var angles = this.angles;
					var len = angles.length;
					for (var i = 0; i < len; i++) if (!angles[i]) {
						for (var j = i + 1; j < len; j++) if (angles[j]) {
							angles[i] = angles[j];
							break;
						}
					}
					return angles;
				}
			}
		]);
		return PathParser;
	}(svgPathdata.SVGPathData);
	function _createSuper$H(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$H();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$H() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var RenderedElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](RenderedElement, _Element);
		var _super = _createSuper$H(RenderedElement);
		function RenderedElement() {
			var _this;
			_classCallCheck__default["default"](this, RenderedElement);
			_this = _super.apply(this, arguments);
			_this.modifiedEmSizeStack = false;
			return _this;
		}
		_createClass__default["default"](RenderedElement, [
			{
				key: "calculateOpacity",
				value: function calculateOpacity() {
					var opacity = 1;
					var element = this;
					while (element) {
						var opacityStyle = element.getStyle("opacity", false, true);
						if (opacityStyle.hasValue(true)) opacity *= opacityStyle.getNumber();
						element = element.parent;
					}
					return opacity;
				}
			},
			{
				key: "setContext",
				value: function setContext(ctx) {
					var fromMeasure = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
					if (!fromMeasure) {
						var fillStyleProp = this.getStyle("fill");
						var fillOpacityStyleProp = this.getStyle("fill-opacity");
						var strokeStyleProp = this.getStyle("stroke");
						var strokeOpacityProp = this.getStyle("stroke-opacity");
						if (fillStyleProp.isUrlDefinition()) {
							var fillStyle = fillStyleProp.getFillStyleDefinition(this, fillOpacityStyleProp);
							if (fillStyle) ctx.fillStyle = fillStyle;
						} else if (fillStyleProp.hasValue()) {
							if (fillStyleProp.getString() === "currentColor") fillStyleProp.setValue(this.getStyle("color").getColor());
							var _fillStyle = fillStyleProp.getColor();
							if (_fillStyle !== "inherit") ctx.fillStyle = _fillStyle === "none" ? "rgba(0,0,0,0)" : _fillStyle;
						}
						if (fillOpacityStyleProp.hasValue()) ctx.fillStyle = new Property(this.document, "fill", ctx.fillStyle).addOpacity(fillOpacityStyleProp).getColor();
						if (strokeStyleProp.isUrlDefinition()) {
							var strokeStyle = strokeStyleProp.getFillStyleDefinition(this, strokeOpacityProp);
							if (strokeStyle) ctx.strokeStyle = strokeStyle;
						} else if (strokeStyleProp.hasValue()) {
							if (strokeStyleProp.getString() === "currentColor") strokeStyleProp.setValue(this.getStyle("color").getColor());
							var _strokeStyle = strokeStyleProp.getString();
							if (_strokeStyle !== "inherit") ctx.strokeStyle = _strokeStyle === "none" ? "rgba(0,0,0,0)" : _strokeStyle;
						}
						if (strokeOpacityProp.hasValue()) ctx.strokeStyle = new Property(this.document, "stroke", ctx.strokeStyle).addOpacity(strokeOpacityProp).getString();
						var strokeWidthStyleProp = this.getStyle("stroke-width");
						if (strokeWidthStyleProp.hasValue()) {
							var newLineWidth = strokeWidthStyleProp.getPixels();
							ctx.lineWidth = !newLineWidth ? PSEUDO_ZERO : newLineWidth;
						}
						var strokeLinecapStyleProp = this.getStyle("stroke-linecap");
						var strokeLinejoinStyleProp = this.getStyle("stroke-linejoin");
						var strokeMiterlimitProp = this.getStyle("stroke-miterlimit");
						var strokeDasharrayStyleProp = this.getStyle("stroke-dasharray");
						var strokeDashoffsetProp = this.getStyle("stroke-dashoffset");
						if (strokeLinecapStyleProp.hasValue()) ctx.lineCap = strokeLinecapStyleProp.getString();
						if (strokeLinejoinStyleProp.hasValue()) ctx.lineJoin = strokeLinejoinStyleProp.getString();
						if (strokeMiterlimitProp.hasValue()) ctx.miterLimit = strokeMiterlimitProp.getNumber();
						if (strokeDasharrayStyleProp.hasValue() && strokeDasharrayStyleProp.getString() !== "none") {
							var gaps = toNumbers(strokeDasharrayStyleProp.getString());
							if (typeof ctx.setLineDash !== "undefined") ctx.setLineDash(gaps);
							else if (typeof ctx.webkitLineDash !== "undefined") ctx.webkitLineDash = gaps;
							else if (typeof ctx.mozDash !== "undefined" && !(gaps.length === 1 && gaps[0] === 0)) ctx.mozDash = gaps;
							var offset = strokeDashoffsetProp.getPixels();
							if (typeof ctx.lineDashOffset !== "undefined") ctx.lineDashOffset = offset;
							else if (typeof ctx.webkitLineDashOffset !== "undefined") ctx.webkitLineDashOffset = offset;
							else if (typeof ctx.mozDashOffset !== "undefined") ctx.mozDashOffset = offset;
						}
					}
					this.modifiedEmSizeStack = false;
					if (typeof ctx.font !== "undefined") {
						var fontStyleProp = this.getStyle("font");
						var fontStyleStyleProp = this.getStyle("font-style");
						var fontVariantStyleProp = this.getStyle("font-variant");
						var fontWeightStyleProp = this.getStyle("font-weight");
						var fontSizeStyleProp = this.getStyle("font-size");
						var fontFamilyStyleProp = this.getStyle("font-family");
						var font = new Font(fontStyleStyleProp.getString(), fontVariantStyleProp.getString(), fontWeightStyleProp.getString(), fontSizeStyleProp.hasValue() ? "".concat(fontSizeStyleProp.getPixels(true), "px") : "", fontFamilyStyleProp.getString(), Font.parse(fontStyleProp.getString(), ctx.font));
						fontStyleStyleProp.setValue(font.fontStyle);
						fontVariantStyleProp.setValue(font.fontVariant);
						fontWeightStyleProp.setValue(font.fontWeight);
						fontSizeStyleProp.setValue(font.fontSize);
						fontFamilyStyleProp.setValue(font.fontFamily);
						ctx.font = font.toString();
						if (fontSizeStyleProp.isPixels()) {
							this.document.emSize = fontSizeStyleProp.getPixels();
							this.modifiedEmSizeStack = true;
						}
					}
					if (!fromMeasure) {
						this.applyEffects(ctx);
						ctx.globalAlpha = this.calculateOpacity();
					}
				}
			},
			{
				key: "clearContext",
				value: function clearContext(ctx) {
					_get__default["default"](_getPrototypeOf__default["default"](RenderedElement.prototype), "clearContext", this).call(this, ctx);
					if (this.modifiedEmSizeStack) this.document.popEmSize();
				}
			}
		]);
		return RenderedElement;
	}(Element);
	function _createSuper$G(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$G();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$G() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var PathElement = /*#__PURE__*/ function(_RenderedElement) {
		_inherits__default["default"](PathElement, _RenderedElement);
		var _super = _createSuper$G(PathElement);
		function PathElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, PathElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "path";
			_this.pathParser = null;
			_this.pathParser = new PathParser(_this.getAttribute("d").getString());
			return _this;
		}
		_createClass__default["default"](PathElement, [
			{
				key: "path",
				value: function path(ctx) {
					var pathParser = this.pathParser;
					var boundingBox = new BoundingBox();
					pathParser.reset();
					if (ctx) ctx.beginPath();
					while (!pathParser.isEnd()) switch (pathParser.next().type) {
						case PathParser.MOVE_TO:
							this.pathM(ctx, boundingBox);
							break;
						case PathParser.LINE_TO:
							this.pathL(ctx, boundingBox);
							break;
						case PathParser.HORIZ_LINE_TO:
							this.pathH(ctx, boundingBox);
							break;
						case PathParser.VERT_LINE_TO:
							this.pathV(ctx, boundingBox);
							break;
						case PathParser.CURVE_TO:
							this.pathC(ctx, boundingBox);
							break;
						case PathParser.SMOOTH_CURVE_TO:
							this.pathS(ctx, boundingBox);
							break;
						case PathParser.QUAD_TO:
							this.pathQ(ctx, boundingBox);
							break;
						case PathParser.SMOOTH_QUAD_TO:
							this.pathT(ctx, boundingBox);
							break;
						case PathParser.ARC:
							this.pathA(ctx, boundingBox);
							break;
						case PathParser.CLOSE_PATH: this.pathZ(ctx, boundingBox);
					}
					return boundingBox;
				}
			},
			{
				key: "getBoundingBox",
				value: function getBoundingBox(_) {
					return this.path();
				}
			},
			{
				key: "getMarkers",
				value: function getMarkers() {
					var pathParser = this.pathParser;
					var points = pathParser.getMarkerPoints();
					var angles = pathParser.getMarkerAngles();
					return points.map(function(point, i) {
						return [point, angles[i]];
					});
				}
			},
			{
				key: "renderChildren",
				value: function renderChildren(ctx) {
					this.path(ctx);
					this.document.screen.mouse.checkPath(this, ctx);
					var fillRuleStyleProp = this.getStyle("fill-rule");
					if (ctx.fillStyle !== "") {
						if (fillRuleStyleProp.getString("inherit") !== "inherit") ctx.fill(fillRuleStyleProp.getString());
						else ctx.fill();
					}
					if (ctx.strokeStyle !== "") {
						if (this.getAttribute("vector-effect").getString() === "non-scaling-stroke") {
							ctx.save();
							ctx.setTransform(1, 0, 0, 1, 0, 0);
							ctx.stroke();
							ctx.restore();
						} else ctx.stroke();
					}
					var markers = this.getMarkers();
					if (markers) {
						var markersLastIndex = markers.length - 1;
						var markerStartStyleProp = this.getStyle("marker-start");
						var markerMidStyleProp = this.getStyle("marker-mid");
						var markerEndStyleProp = this.getStyle("marker-end");
						if (markerStartStyleProp.isUrlDefinition()) {
							var marker = markerStartStyleProp.getDefinition();
							var _markers$ = _slicedToArray__default["default"](markers[0], 2), point = _markers$[0], angle = _markers$[1];
							marker.render(ctx, point, angle);
						}
						if (markerMidStyleProp.isUrlDefinition()) {
							var _marker = markerMidStyleProp.getDefinition();
							for (var i = 1; i < markersLastIndex; i++) {
								var _markers$i = _slicedToArray__default["default"](markers[i], 2), _point = _markers$i[0], _angle = _markers$i[1];
								_marker.render(ctx, _point, _angle);
							}
						}
						if (markerEndStyleProp.isUrlDefinition()) {
							var _marker2 = markerEndStyleProp.getDefinition();
							var _markers$markersLastI = _slicedToArray__default["default"](markers[markersLastIndex], 2), _point2 = _markers$markersLastI[0], _angle2 = _markers$markersLastI[1];
							_marker2.render(ctx, _point2, _angle2);
						}
					}
				}
			},
			{
				key: "pathM",
				value: function pathM(ctx, boundingBox) {
					var pathParser = this.pathParser;
					var point = PathElement.pathM(pathParser).point;
					var x = point.x, y = point.y;
					pathParser.addMarker(point);
					boundingBox.addPoint(x, y);
					if (ctx) ctx.moveTo(x, y);
				}
			},
			{
				key: "pathL",
				value: function pathL(ctx, boundingBox) {
					var pathParser = this.pathParser;
					var _PathElement$pathL = PathElement.pathL(pathParser), current = _PathElement$pathL.current, point = _PathElement$pathL.point;
					var x = point.x, y = point.y;
					pathParser.addMarker(point, current);
					boundingBox.addPoint(x, y);
					if (ctx) ctx.lineTo(x, y);
				}
			},
			{
				key: "pathH",
				value: function pathH(ctx, boundingBox) {
					var pathParser = this.pathParser;
					var _PathElement$pathH = PathElement.pathH(pathParser), current = _PathElement$pathH.current, point = _PathElement$pathH.point;
					var x = point.x, y = point.y;
					pathParser.addMarker(point, current);
					boundingBox.addPoint(x, y);
					if (ctx) ctx.lineTo(x, y);
				}
			},
			{
				key: "pathV",
				value: function pathV(ctx, boundingBox) {
					var pathParser = this.pathParser;
					var _PathElement$pathV = PathElement.pathV(pathParser), current = _PathElement$pathV.current, point = _PathElement$pathV.point;
					var x = point.x, y = point.y;
					pathParser.addMarker(point, current);
					boundingBox.addPoint(x, y);
					if (ctx) ctx.lineTo(x, y);
				}
			},
			{
				key: "pathC",
				value: function pathC(ctx, boundingBox) {
					var pathParser = this.pathParser;
					var _PathElement$pathC = PathElement.pathC(pathParser), current = _PathElement$pathC.current, point = _PathElement$pathC.point, controlPoint = _PathElement$pathC.controlPoint, currentPoint = _PathElement$pathC.currentPoint;
					pathParser.addMarker(currentPoint, controlPoint, point);
					boundingBox.addBezierCurve(current.x, current.y, point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
					if (ctx) ctx.bezierCurveTo(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
				}
			},
			{
				key: "pathS",
				value: function pathS(ctx, boundingBox) {
					var pathParser = this.pathParser;
					var _PathElement$pathS = PathElement.pathS(pathParser), current = _PathElement$pathS.current, point = _PathElement$pathS.point, controlPoint = _PathElement$pathS.controlPoint, currentPoint = _PathElement$pathS.currentPoint;
					pathParser.addMarker(currentPoint, controlPoint, point);
					boundingBox.addBezierCurve(current.x, current.y, point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
					if (ctx) ctx.bezierCurveTo(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
				}
			},
			{
				key: "pathQ",
				value: function pathQ(ctx, boundingBox) {
					var pathParser = this.pathParser;
					var _PathElement$pathQ = PathElement.pathQ(pathParser), current = _PathElement$pathQ.current, controlPoint = _PathElement$pathQ.controlPoint, currentPoint = _PathElement$pathQ.currentPoint;
					pathParser.addMarker(currentPoint, controlPoint, controlPoint);
					boundingBox.addQuadraticCurve(current.x, current.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
					if (ctx) ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
				}
			},
			{
				key: "pathT",
				value: function pathT(ctx, boundingBox) {
					var pathParser = this.pathParser;
					var _PathElement$pathT = PathElement.pathT(pathParser), current = _PathElement$pathT.current, controlPoint = _PathElement$pathT.controlPoint, currentPoint = _PathElement$pathT.currentPoint;
					pathParser.addMarker(currentPoint, controlPoint, controlPoint);
					boundingBox.addQuadraticCurve(current.x, current.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
					if (ctx) ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
				}
			},
			{
				key: "pathA",
				value: function pathA(ctx, boundingBox) {
					var pathParser = this.pathParser;
					var _PathElement$pathA = PathElement.pathA(pathParser), currentPoint = _PathElement$pathA.currentPoint, rX = _PathElement$pathA.rX, rY = _PathElement$pathA.rY, sweepFlag = _PathElement$pathA.sweepFlag, xAxisRotation = _PathElement$pathA.xAxisRotation, centp = _PathElement$pathA.centp, a1 = _PathElement$pathA.a1, ad = _PathElement$pathA.ad;
					var dir = 1 - sweepFlag ? 1 : -1;
					var ah = a1 + dir * (ad / 2);
					var halfWay = new Point(centp.x + rX * Math.cos(ah), centp.y + rY * Math.sin(ah));
					pathParser.addMarkerAngle(halfWay, ah - dir * Math.PI / 2);
					pathParser.addMarkerAngle(currentPoint, ah - dir * Math.PI);
					boundingBox.addPoint(currentPoint.x, currentPoint.y);
					if (ctx && !isNaN(a1) && !isNaN(ad)) {
						var r = rX > rY ? rX : rY;
						var sx = rX > rY ? 1 : rX / rY;
						var sy = rX > rY ? rY / rX : 1;
						ctx.translate(centp.x, centp.y);
						ctx.rotate(xAxisRotation);
						ctx.scale(sx, sy);
						ctx.arc(0, 0, r, a1, a1 + ad, Boolean(1 - sweepFlag));
						ctx.scale(1 / sx, 1 / sy);
						ctx.rotate(-xAxisRotation);
						ctx.translate(-centp.x, -centp.y);
					}
				}
			},
			{
				key: "pathZ",
				value: function pathZ(ctx, boundingBox) {
					PathElement.pathZ(this.pathParser);
					if (ctx) {
						if (boundingBox.x1 !== boundingBox.x2 && boundingBox.y1 !== boundingBox.y2) ctx.closePath();
					}
				}
			}
		], [
			{
				key: "pathM",
				value: function pathM(pathParser) {
					var point = pathParser.getAsCurrentPoint();
					pathParser.start = pathParser.current;
					return { point };
				}
			},
			{
				key: "pathL",
				value: function pathL(pathParser) {
					return {
						current: pathParser.current,
						point: pathParser.getAsCurrentPoint()
					};
				}
			},
			{
				key: "pathH",
				value: function pathH(pathParser) {
					var current = pathParser.current, command = pathParser.command;
					var point = new Point((command.relative ? current.x : 0) + command.x, current.y);
					pathParser.current = point;
					return {
						current,
						point
					};
				}
			},
			{
				key: "pathV",
				value: function pathV(pathParser) {
					var current = pathParser.current, command = pathParser.command;
					var point = new Point(current.x, (command.relative ? current.y : 0) + command.y);
					pathParser.current = point;
					return {
						current,
						point
					};
				}
			},
			{
				key: "pathC",
				value: function pathC(pathParser) {
					return {
						current: pathParser.current,
						point: pathParser.getPoint("x1", "y1"),
						controlPoint: pathParser.getAsControlPoint("x2", "y2"),
						currentPoint: pathParser.getAsCurrentPoint()
					};
				}
			},
			{
				key: "pathS",
				value: function pathS(pathParser) {
					return {
						current: pathParser.current,
						point: pathParser.getReflectedControlPoint(),
						controlPoint: pathParser.getAsControlPoint("x2", "y2"),
						currentPoint: pathParser.getAsCurrentPoint()
					};
				}
			},
			{
				key: "pathQ",
				value: function pathQ(pathParser) {
					return {
						current: pathParser.current,
						controlPoint: pathParser.getAsControlPoint("x1", "y1"),
						currentPoint: pathParser.getAsCurrentPoint()
					};
				}
			},
			{
				key: "pathT",
				value: function pathT(pathParser) {
					var current = pathParser.current;
					var controlPoint = pathParser.getReflectedControlPoint();
					pathParser.control = controlPoint;
					return {
						current,
						controlPoint,
						currentPoint: pathParser.getAsCurrentPoint()
					};
				}
			},
			{
				key: "pathA",
				value: function pathA(pathParser) {
					var current = pathParser.current, command = pathParser.command;
					var rX = command.rX, rY = command.rY, xRot = command.xRot, lArcFlag = command.lArcFlag, sweepFlag = command.sweepFlag;
					var xAxisRotation = xRot * (Math.PI / 180);
					var currentPoint = pathParser.getAsCurrentPoint();
					var currp = new Point(Math.cos(xAxisRotation) * (current.x - currentPoint.x) / 2 + Math.sin(xAxisRotation) * (current.y - currentPoint.y) / 2, -Math.sin(xAxisRotation) * (current.x - currentPoint.x) / 2 + Math.cos(xAxisRotation) * (current.y - currentPoint.y) / 2);
					var l = Math.pow(currp.x, 2) / Math.pow(rX, 2) + Math.pow(currp.y, 2) / Math.pow(rY, 2);
					if (l > 1) {
						rX *= Math.sqrt(l);
						rY *= Math.sqrt(l);
					}
					var s = (lArcFlag === sweepFlag ? -1 : 1) * Math.sqrt((Math.pow(rX, 2) * Math.pow(rY, 2) - Math.pow(rX, 2) * Math.pow(currp.y, 2) - Math.pow(rY, 2) * Math.pow(currp.x, 2)) / (Math.pow(rX, 2) * Math.pow(currp.y, 2) + Math.pow(rY, 2) * Math.pow(currp.x, 2)));
					if (isNaN(s)) s = 0;
					var cpp = new Point(s * rX * currp.y / rY, s * -rY * currp.x / rX);
					var centp = new Point((current.x + currentPoint.x) / 2 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y, (current.y + currentPoint.y) / 2 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y);
					var a1 = vectorsAngle([1, 0], [(currp.x - cpp.x) / rX, (currp.y - cpp.y) / rY]);
					var u = [(currp.x - cpp.x) / rX, (currp.y - cpp.y) / rY];
					var v = [(-currp.x - cpp.x) / rX, (-currp.y - cpp.y) / rY];
					var ad = vectorsAngle(u, v);
					if (vectorsRatio(u, v) <= -1) ad = Math.PI;
					if (vectorsRatio(u, v) >= 1) ad = 0;
					return {
						currentPoint,
						rX,
						rY,
						sweepFlag,
						xAxisRotation,
						centp,
						a1,
						ad
					};
				}
			},
			{
				key: "pathZ",
				value: function pathZ(pathParser) {
					pathParser.current = pathParser.start;
				}
			}
		]);
		return PathElement;
	}(RenderedElement);
	function _createSuper$F(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$F();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$F() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var GlyphElement = /*#__PURE__*/ function(_PathElement) {
		_inherits__default["default"](GlyphElement, _PathElement);
		var _super = _createSuper$F(GlyphElement);
		function GlyphElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, GlyphElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "glyph";
			_this.horizAdvX = _this.getAttribute("horiz-adv-x").getNumber();
			_this.unicode = _this.getAttribute("unicode").getString();
			_this.arabicForm = _this.getAttribute("arabic-form").getString();
			return _this;
		}
		return GlyphElement;
	}(PathElement);
	function _createSuper$E(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$E();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$E() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var TextElement = /*#__PURE__*/ function(_RenderedElement) {
		_inherits__default["default"](TextElement, _RenderedElement);
		var _super = _createSuper$E(TextElement);
		function TextElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, TextElement);
			_this = _super.call(this, document, node, (this instanceof TextElement ? this.constructor : void 0) === TextElement ? true : captureTextNodes);
			_this.type = "text";
			_this.x = 0;
			_this.y = 0;
			_this.measureCache = -1;
			return _this;
		}
		_createClass__default["default"](TextElement, [
			{
				key: "setContext",
				value: function setContext(ctx) {
					var fromMeasure = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
					_get__default["default"](_getPrototypeOf__default["default"](TextElement.prototype), "setContext", this).call(this, ctx, fromMeasure);
					var textBaseline = this.getStyle("dominant-baseline").getTextBaseline() || this.getStyle("alignment-baseline").getTextBaseline();
					if (textBaseline) ctx.textBaseline = textBaseline;
				}
			},
			{
				key: "initializeCoordinates",
				value: function initializeCoordinates() {
					this.x = 0;
					this.y = 0;
					this.leafTexts = [];
					this.textChunkStart = 0;
					this.minX = Number.POSITIVE_INFINITY;
					this.maxX = Number.NEGATIVE_INFINITY;
				}
			},
			{
				key: "getBoundingBox",
				value: function getBoundingBox(ctx) {
					var _this2 = this;
					if (this.type !== "text") return this.getTElementBoundingBox(ctx);
					this.initializeCoordinates();
					this.adjustChildCoordinatesRecursive(ctx);
					var boundingBox = null;
					this.children.forEach(function(_, i) {
						var childBoundingBox = _this2.getChildBoundingBox(ctx, _this2, _this2, i);
						if (!boundingBox) boundingBox = childBoundingBox;
						else boundingBox.addBoundingBox(childBoundingBox);
					});
					return boundingBox;
				}
			},
			{
				key: "getFontSize",
				value: function getFontSize() {
					var document = this.document, parent = this.parent;
					var inheritFontSize = Font.parse(document.ctx.font).fontSize;
					return parent.getStyle("font-size").getNumber(inheritFontSize);
				}
			},
			{
				key: "getTElementBoundingBox",
				value: function getTElementBoundingBox(ctx) {
					var fontSize = this.getFontSize();
					return new BoundingBox(this.x, this.y - fontSize, this.x + this.measureText(ctx), this.y);
				}
			},
			{
				key: "getGlyph",
				value: function getGlyph(font, text, i) {
					var char = text[i];
					var glyph = null;
					if (font.isArabic) {
						var len = text.length;
						var prevChar = text[i - 1];
						var nextChar = text[i + 1];
						var arabicForm = "isolated";
						if ((i === 0 || prevChar === " ") && i < len - 1 && nextChar !== " ") arabicForm = "terminal";
						if (i > 0 && prevChar !== " " && i < len - 1 && nextChar !== " ") arabicForm = "medial";
						if (i > 0 && prevChar !== " " && (i === len - 1 || nextChar === " ")) arabicForm = "initial";
						if (typeof font.glyphs[char] !== "undefined") {
							var maybeGlyph = font.glyphs[char];
							glyph = maybeGlyph instanceof GlyphElement ? maybeGlyph : maybeGlyph[arabicForm];
						}
					} else glyph = font.glyphs[char];
					if (!glyph) glyph = font.missingGlyph;
					return glyph;
				}
			},
			{
				key: "getText",
				value: function getText() {
					return "";
				}
			},
			{
				key: "getTextFromNode",
				value: function getTextFromNode(node) {
					var textNode = node || this.node;
					var childNodes = Array.from(textNode.parentNode.childNodes);
					var index = childNodes.indexOf(textNode);
					var lastIndex = childNodes.length - 1;
					var text = compressSpaces(textNode.textContent || "");
					if (index === 0) text = trimLeft(text);
					if (index === lastIndex) text = trimRight(text);
					return text;
				}
			},
			{
				key: "renderChildren",
				value: function renderChildren(ctx) {
					var _this3 = this;
					if (this.type !== "text") {
						this.renderTElementChildren(ctx);
						return;
					}
					this.initializeCoordinates();
					this.adjustChildCoordinatesRecursive(ctx);
					this.children.forEach(function(_, i) {
						_this3.renderChild(ctx, _this3, _this3, i);
					});
					var mouse = this.document.screen.mouse;
					if (mouse.isWorking()) mouse.checkBoundingBox(this, this.getBoundingBox(ctx));
				}
			},
			{
				key: "renderTElementChildren",
				value: function renderTElementChildren(ctx) {
					var document = this.document, parent = this.parent;
					var renderText = this.getText();
					var customFont = parent.getStyle("font-family").getDefinition();
					if (customFont) {
						var unitsPerEm = customFont.fontFace.unitsPerEm;
						var ctxFont = Font.parse(document.ctx.font);
						var fontSize = parent.getStyle("font-size").getNumber(ctxFont.fontSize);
						var fontStyle = parent.getStyle("font-style").getString(ctxFont.fontStyle);
						var scale = fontSize / unitsPerEm;
						var text = customFont.isRTL ? renderText.split("").reverse().join("") : renderText;
						var dx = toNumbers(parent.getAttribute("dx").getString());
						var len = text.length;
						for (var i = 0; i < len; i++) {
							var glyph = this.getGlyph(customFont, text, i);
							ctx.translate(this.x, this.y);
							ctx.scale(scale, -scale);
							var lw = ctx.lineWidth;
							ctx.lineWidth = ctx.lineWidth * unitsPerEm / fontSize;
							if (fontStyle === "italic") ctx.transform(1, 0, .4, 1, 0, 0);
							glyph.render(ctx);
							if (fontStyle === "italic") ctx.transform(1, 0, -.4, 1, 0, 0);
							ctx.lineWidth = lw;
							ctx.scale(1 / scale, -1 / scale);
							ctx.translate(-this.x, -this.y);
							this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / unitsPerEm;
							if (typeof dx[i] !== "undefined" && !isNaN(dx[i])) this.x += dx[i];
						}
						return;
					}
					var x = this.x, y = this.y;
					if (ctx.fillStyle) ctx.fillText(renderText, x, y);
					if (ctx.strokeStyle) ctx.strokeText(renderText, x, y);
				}
			},
			{
				key: "applyAnchoring",
				value: function applyAnchoring() {
					if (this.textChunkStart >= this.leafTexts.length) return;
					var firstElement = this.leafTexts[this.textChunkStart];
					var textAnchor = firstElement.getStyle("text-anchor").getString("start");
					var isRTL = false;
					var shift = 0;
					if (textAnchor === "start" && !isRTL || textAnchor === "end" && isRTL) shift = firstElement.x - this.minX;
					else if (textAnchor === "end" && !isRTL || textAnchor === "start" && isRTL) shift = firstElement.x - this.maxX;
					else shift = firstElement.x - (this.minX + this.maxX) / 2;
					for (var i = this.textChunkStart; i < this.leafTexts.length; i++) this.leafTexts[i].x += shift;
					this.minX = Number.POSITIVE_INFINITY;
					this.maxX = Number.NEGATIVE_INFINITY;
					this.textChunkStart = this.leafTexts.length;
				}
			},
			{
				key: "adjustChildCoordinatesRecursive",
				value: function adjustChildCoordinatesRecursive(ctx) {
					var _this4 = this;
					this.children.forEach(function(_, i) {
						_this4.adjustChildCoordinatesRecursiveCore(ctx, _this4, _this4, i);
					});
					this.applyAnchoring();
				}
			},
			{
				key: "adjustChildCoordinatesRecursiveCore",
				value: function adjustChildCoordinatesRecursiveCore(ctx, textParent, parent, i) {
					var child = parent.children[i];
					if (child.children.length > 0) child.children.forEach(function(_, i) {
						textParent.adjustChildCoordinatesRecursiveCore(ctx, textParent, child, i);
					});
					else this.adjustChildCoordinates(ctx, textParent, parent, i);
				}
			},
			{
				key: "adjustChildCoordinates",
				value: function adjustChildCoordinates(ctx, textParent, parent, i) {
					var child = parent.children[i];
					if (typeof child.measureText !== "function") return child;
					ctx.save();
					child.setContext(ctx, true);
					var xAttr = child.getAttribute("x");
					var yAttr = child.getAttribute("y");
					var dxAttr = child.getAttribute("dx");
					var dyAttr = child.getAttribute("dy");
					var customFont = child.getStyle("font-family").getDefinition();
					var isRTL = Boolean(customFont) && customFont.isRTL;
					if (i === 0) {
						if (!xAttr.hasValue()) xAttr.setValue(child.getInheritedAttribute("x"));
						if (!yAttr.hasValue()) yAttr.setValue(child.getInheritedAttribute("y"));
						if (!dxAttr.hasValue()) dxAttr.setValue(child.getInheritedAttribute("dx"));
						if (!dyAttr.hasValue()) dyAttr.setValue(child.getInheritedAttribute("dy"));
					}
					var width = child.measureText(ctx);
					if (isRTL) textParent.x -= width;
					if (xAttr.hasValue()) {
						textParent.applyAnchoring();
						child.x = xAttr.getPixels("x");
						if (dxAttr.hasValue()) child.x += dxAttr.getPixels("x");
					} else {
						if (dxAttr.hasValue()) textParent.x += dxAttr.getPixels("x");
						child.x = textParent.x;
					}
					textParent.x = child.x;
					if (!isRTL) textParent.x += width;
					if (yAttr.hasValue()) {
						child.y = yAttr.getPixels("y");
						if (dyAttr.hasValue()) child.y += dyAttr.getPixels("y");
					} else {
						if (dyAttr.hasValue()) textParent.y += dyAttr.getPixels("y");
						child.y = textParent.y;
					}
					textParent.y = child.y;
					textParent.leafTexts.push(child);
					textParent.minX = Math.min(textParent.minX, child.x, child.x + width);
					textParent.maxX = Math.max(textParent.maxX, child.x, child.x + width);
					child.clearContext(ctx);
					ctx.restore();
					return child;
				}
			},
			{
				key: "getChildBoundingBox",
				value: function getChildBoundingBox(ctx, textParent, parent, i) {
					var child = parent.children[i];
					if (typeof child.getBoundingBox !== "function") return null;
					var boundingBox = child.getBoundingBox(ctx);
					if (!boundingBox) return null;
					child.children.forEach(function(_, i) {
						var childBoundingBox = textParent.getChildBoundingBox(ctx, textParent, child, i);
						boundingBox.addBoundingBox(childBoundingBox);
					});
					return boundingBox;
				}
			},
			{
				key: "renderChild",
				value: function renderChild(ctx, textParent, parent, i) {
					var child = parent.children[i];
					child.render(ctx);
					child.children.forEach(function(_, i) {
						textParent.renderChild(ctx, textParent, child, i);
					});
				}
			},
			{
				key: "measureText",
				value: function measureText(ctx) {
					var measureCache = this.measureCache;
					if (~measureCache) return measureCache;
					var renderText = this.getText();
					var measure = this.measureTargetText(ctx, renderText);
					this.measureCache = measure;
					return measure;
				}
			},
			{
				key: "measureTargetText",
				value: function measureTargetText(ctx, targetText) {
					if (!targetText.length) return 0;
					var parent = this.parent;
					var customFont = parent.getStyle("font-family").getDefinition();
					if (customFont) {
						var fontSize = this.getFontSize();
						var text = customFont.isRTL ? targetText.split("").reverse().join("") : targetText;
						var dx = toNumbers(parent.getAttribute("dx").getString());
						var len = text.length;
						var _measure = 0;
						for (var i = 0; i < len; i++) {
							var glyph = this.getGlyph(customFont, text, i);
							_measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm;
							if (typeof dx[i] !== "undefined" && !isNaN(dx[i])) _measure += dx[i];
						}
						return _measure;
					}
					if (!ctx.measureText) return targetText.length * 10;
					ctx.save();
					this.setContext(ctx, true);
					var measure = ctx.measureText(targetText).width;
					this.clearContext(ctx);
					ctx.restore();
					return measure;
				}
			},
			{
				key: "getInheritedAttribute",
				value: function getInheritedAttribute(name) {
					var current = this;
					while (current instanceof TextElement && current.isFirstChild()) {
						var parentAttr = current.parent.getAttribute(name);
						if (parentAttr.hasValue(true)) return parentAttr.getValue("0");
						current = current.parent;
					}
					return null;
				}
			}
		]);
		return TextElement;
	}(RenderedElement);
	function _createSuper$D(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$D();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$D() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var TSpanElement = /*#__PURE__*/ function(_TextElement) {
		_inherits__default["default"](TSpanElement, _TextElement);
		var _super = _createSuper$D(TSpanElement);
		function TSpanElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, TSpanElement);
			_this = _super.call(this, document, node, (this instanceof TSpanElement ? this.constructor : void 0) === TSpanElement ? true : captureTextNodes);
			_this.type = "tspan";
			_this.text = _this.children.length > 0 ? "" : _this.getTextFromNode();
			return _this;
		}
		_createClass__default["default"](TSpanElement, [{
			key: "getText",
			value: function getText() {
				return this.text;
			}
		}]);
		return TSpanElement;
	}(TextElement);
	function _createSuper$C(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$C();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$C() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var TextNode = /*#__PURE__*/ function(_TSpanElement) {
		_inherits__default["default"](TextNode, _TSpanElement);
		var _super = _createSuper$C(TextNode);
		function TextNode() {
			var _this;
			_classCallCheck__default["default"](this, TextNode);
			_this = _super.apply(this, arguments);
			_this.type = "textNode";
			return _this;
		}
		return TextNode;
	}(TSpanElement);
	function _createSuper$B(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$B();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$B() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var SVGElement = /*#__PURE__*/ function(_RenderedElement) {
		_inherits__default["default"](SVGElement, _RenderedElement);
		var _super = _createSuper$B(SVGElement);
		function SVGElement() {
			var _this;
			_classCallCheck__default["default"](this, SVGElement);
			_this = _super.apply(this, arguments);
			_this.type = "svg";
			_this.root = false;
			return _this;
		}
		_createClass__default["default"](SVGElement, [
			{
				key: "setContext",
				value: function setContext(ctx) {
					var _this$node$parentNode;
					var document = this.document;
					var screen = document.screen, window = document.window;
					var canvas = ctx.canvas;
					screen.setDefaults(ctx);
					if (canvas.style && typeof ctx.font !== "undefined" && window && typeof window.getComputedStyle !== "undefined") {
						ctx.font = window.getComputedStyle(canvas).getPropertyValue("font");
						var fontSizeProp = new Property(document, "fontSize", Font.parse(ctx.font).fontSize);
						if (fontSizeProp.hasValue()) {
							document.rootEmSize = fontSizeProp.getPixels("y");
							document.emSize = document.rootEmSize;
						}
					}
					if (!this.getAttribute("x").hasValue()) this.getAttribute("x", true).setValue(0);
					if (!this.getAttribute("y").hasValue()) this.getAttribute("y", true).setValue(0);
					var _screen$viewPort = screen.viewPort, width = _screen$viewPort.width, height = _screen$viewPort.height;
					if (!this.getStyle("width").hasValue()) this.getStyle("width", true).setValue("100%");
					if (!this.getStyle("height").hasValue()) this.getStyle("height", true).setValue("100%");
					if (!this.getStyle("color").hasValue()) this.getStyle("color", true).setValue("black");
					var refXAttr = this.getAttribute("refX");
					var refYAttr = this.getAttribute("refY");
					var viewBoxAttr = this.getAttribute("viewBox");
					var viewBox = viewBoxAttr.hasValue() ? toNumbers(viewBoxAttr.getString()) : null;
					var clip = !this.root && this.getStyle("overflow").getValue("hidden") !== "visible";
					var minX = 0;
					var minY = 0;
					var clipX = 0;
					var clipY = 0;
					if (viewBox) {
						minX = viewBox[0];
						minY = viewBox[1];
					}
					if (!this.root) {
						width = this.getStyle("width").getPixels("x");
						height = this.getStyle("height").getPixels("y");
						if (this.type === "marker") {
							clipX = minX;
							clipY = minY;
							minX = 0;
							minY = 0;
						}
					}
					screen.viewPort.setCurrent(width, height);
					if (this.node && (!this.parent || ((_this$node$parentNode = this.node.parentNode) === null || _this$node$parentNode === void 0 ? void 0 : _this$node$parentNode.nodeName) === "foreignObject") && this.getStyle("transform", false, true).hasValue() && !this.getStyle("transform-origin", false, true).hasValue()) this.getStyle("transform-origin", true, true).setValue("50% 50%");
					_get__default["default"](_getPrototypeOf__default["default"](SVGElement.prototype), "setContext", this).call(this, ctx);
					ctx.translate(this.getAttribute("x").getPixels("x"), this.getAttribute("y").getPixels("y"));
					if (viewBox) {
						width = viewBox[2];
						height = viewBox[3];
					}
					document.setViewBox({
						ctx,
						aspectRatio: this.getAttribute("preserveAspectRatio").getString(),
						width: screen.viewPort.width,
						desiredWidth: width,
						height: screen.viewPort.height,
						desiredHeight: height,
						minX,
						minY,
						refX: refXAttr.getValue(),
						refY: refYAttr.getValue(),
						clip,
						clipX,
						clipY
					});
					if (viewBox) {
						screen.viewPort.removeCurrent();
						screen.viewPort.setCurrent(width, height);
					}
				}
			},
			{
				key: "clearContext",
				value: function clearContext(ctx) {
					_get__default["default"](_getPrototypeOf__default["default"](SVGElement.prototype), "clearContext", this).call(this, ctx);
					this.document.screen.viewPort.removeCurrent();
				}
			},
			{
				key: "resize",
				value: function resize(width) {
					var height = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : width;
					var preserveAspectRatio = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
					var widthAttr = this.getAttribute("width", true);
					var heightAttr = this.getAttribute("height", true);
					var viewBoxAttr = this.getAttribute("viewBox");
					var styleAttr = this.getAttribute("style");
					var originWidth = widthAttr.getNumber(0);
					var originHeight = heightAttr.getNumber(0);
					if (preserveAspectRatio) {
						if (typeof preserveAspectRatio === "string") this.getAttribute("preserveAspectRatio", true).setValue(preserveAspectRatio);
						else {
							var preserveAspectRatioAttr = this.getAttribute("preserveAspectRatio");
							if (preserveAspectRatioAttr.hasValue()) preserveAspectRatioAttr.setValue(preserveAspectRatioAttr.getString().replace(/^\s*(\S.*\S)\s*$/, "$1"));
						}
					}
					widthAttr.setValue(width);
					heightAttr.setValue(height);
					if (!viewBoxAttr.hasValue()) viewBoxAttr.setValue("0 0 ".concat(originWidth || width, " ").concat(originHeight || height));
					if (styleAttr.hasValue()) {
						var widthStyle = this.getStyle("width");
						var heightStyle = this.getStyle("height");
						if (widthStyle.hasValue()) widthStyle.setValue("".concat(width, "px"));
						if (heightStyle.hasValue()) heightStyle.setValue("".concat(height, "px"));
					}
				}
			}
		]);
		return SVGElement;
	}(RenderedElement);
	function _createSuper$A(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$A();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$A() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var RectElement = /*#__PURE__*/ function(_PathElement) {
		_inherits__default["default"](RectElement, _PathElement);
		var _super = _createSuper$A(RectElement);
		function RectElement() {
			var _this;
			_classCallCheck__default["default"](this, RectElement);
			_this = _super.apply(this, arguments);
			_this.type = "rect";
			return _this;
		}
		_createClass__default["default"](RectElement, [{
			key: "path",
			value: function path(ctx) {
				var x = this.getAttribute("x").getPixels("x");
				var y = this.getAttribute("y").getPixels("y");
				var width = this.getStyle("width", false, true).getPixels("x");
				var height = this.getStyle("height", false, true).getPixels("y");
				var rxAttr = this.getAttribute("rx");
				var ryAttr = this.getAttribute("ry");
				var rx = rxAttr.getPixels("x");
				var ry = ryAttr.getPixels("y");
				if (rxAttr.hasValue() && !ryAttr.hasValue()) ry = rx;
				if (ryAttr.hasValue() && !rxAttr.hasValue()) rx = ry;
				rx = Math.min(rx, width / 2);
				ry = Math.min(ry, height / 2);
				if (ctx) {
					var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
					ctx.beginPath();
					if (height > 0 && width > 0) {
						ctx.moveTo(x + rx, y);
						ctx.lineTo(x + width - rx, y);
						ctx.bezierCurveTo(x + width - rx + KAPPA * rx, y, x + width, y + ry - KAPPA * ry, x + width, y + ry);
						ctx.lineTo(x + width, y + height - ry);
						ctx.bezierCurveTo(x + width, y + height - ry + KAPPA * ry, x + width - rx + KAPPA * rx, y + height, x + width - rx, y + height);
						ctx.lineTo(x + rx, y + height);
						ctx.bezierCurveTo(x + rx - KAPPA * rx, y + height, x, y + height - ry + KAPPA * ry, x, y + height - ry);
						ctx.lineTo(x, y + ry);
						ctx.bezierCurveTo(x, y + ry - KAPPA * ry, x + rx - KAPPA * rx, y, x + rx, y);
						ctx.closePath();
					}
				}
				return new BoundingBox(x, y, x + width, y + height);
			}
		}, {
			key: "getMarkers",
			value: function getMarkers() {
				return null;
			}
		}]);
		return RectElement;
	}(PathElement);
	function _createSuper$z(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$z();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$z() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var CircleElement = /*#__PURE__*/ function(_PathElement) {
		_inherits__default["default"](CircleElement, _PathElement);
		var _super = _createSuper$z(CircleElement);
		function CircleElement() {
			var _this;
			_classCallCheck__default["default"](this, CircleElement);
			_this = _super.apply(this, arguments);
			_this.type = "circle";
			return _this;
		}
		_createClass__default["default"](CircleElement, [{
			key: "path",
			value: function path(ctx) {
				var cx = this.getAttribute("cx").getPixels("x");
				var cy = this.getAttribute("cy").getPixels("y");
				var r = this.getAttribute("r").getPixels();
				if (ctx && r > 0) {
					ctx.beginPath();
					ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
					ctx.closePath();
				}
				return new BoundingBox(cx - r, cy - r, cx + r, cy + r);
			}
		}, {
			key: "getMarkers",
			value: function getMarkers() {
				return null;
			}
		}]);
		return CircleElement;
	}(PathElement);
	function _createSuper$y(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$y();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$y() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var EllipseElement = /*#__PURE__*/ function(_PathElement) {
		_inherits__default["default"](EllipseElement, _PathElement);
		var _super = _createSuper$y(EllipseElement);
		function EllipseElement() {
			var _this;
			_classCallCheck__default["default"](this, EllipseElement);
			_this = _super.apply(this, arguments);
			_this.type = "ellipse";
			return _this;
		}
		_createClass__default["default"](EllipseElement, [{
			key: "path",
			value: function path(ctx) {
				var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
				var rx = this.getAttribute("rx").getPixels("x");
				var ry = this.getAttribute("ry").getPixels("y");
				var cx = this.getAttribute("cx").getPixels("x");
				var cy = this.getAttribute("cy").getPixels("y");
				if (ctx && rx > 0 && ry > 0) {
					ctx.beginPath();
					ctx.moveTo(cx + rx, cy);
					ctx.bezierCurveTo(cx + rx, cy + KAPPA * ry, cx + KAPPA * rx, cy + ry, cx, cy + ry);
					ctx.bezierCurveTo(cx - KAPPA * rx, cy + ry, cx - rx, cy + KAPPA * ry, cx - rx, cy);
					ctx.bezierCurveTo(cx - rx, cy - KAPPA * ry, cx - KAPPA * rx, cy - ry, cx, cy - ry);
					ctx.bezierCurveTo(cx + KAPPA * rx, cy - ry, cx + rx, cy - KAPPA * ry, cx + rx, cy);
					ctx.closePath();
				}
				return new BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);
			}
		}, {
			key: "getMarkers",
			value: function getMarkers() {
				return null;
			}
		}]);
		return EllipseElement;
	}(PathElement);
	function _createSuper$x(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$x();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$x() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var LineElement = /*#__PURE__*/ function(_PathElement) {
		_inherits__default["default"](LineElement, _PathElement);
		var _super = _createSuper$x(LineElement);
		function LineElement() {
			var _this;
			_classCallCheck__default["default"](this, LineElement);
			_this = _super.apply(this, arguments);
			_this.type = "line";
			return _this;
		}
		_createClass__default["default"](LineElement, [
			{
				key: "getPoints",
				value: function getPoints() {
					return [new Point(this.getAttribute("x1").getPixels("x"), this.getAttribute("y1").getPixels("y")), new Point(this.getAttribute("x2").getPixels("x"), this.getAttribute("y2").getPixels("y"))];
				}
			},
			{
				key: "path",
				value: function path(ctx) {
					var _this$getPoints = this.getPoints(), _this$getPoints2 = _slicedToArray__default["default"](_this$getPoints, 2), _this$getPoints2$ = _this$getPoints2[0], x0 = _this$getPoints2$.x, y0 = _this$getPoints2$.y, _this$getPoints2$2 = _this$getPoints2[1], x1 = _this$getPoints2$2.x, y1 = _this$getPoints2$2.y;
					if (ctx) {
						ctx.beginPath();
						ctx.moveTo(x0, y0);
						ctx.lineTo(x1, y1);
					}
					return new BoundingBox(x0, y0, x1, y1);
				}
			},
			{
				key: "getMarkers",
				value: function getMarkers() {
					var _this$getPoints3 = this.getPoints(), _this$getPoints4 = _slicedToArray__default["default"](_this$getPoints3, 2), p0 = _this$getPoints4[0], p1 = _this$getPoints4[1];
					var a = p0.angleTo(p1);
					return [[p0, a], [p1, a]];
				}
			}
		]);
		return LineElement;
	}(PathElement);
	function _createSuper$w(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$w();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$w() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var PolylineElement = /*#__PURE__*/ function(_PathElement) {
		_inherits__default["default"](PolylineElement, _PathElement);
		var _super = _createSuper$w(PolylineElement);
		function PolylineElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, PolylineElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "polyline";
			_this.points = [];
			_this.points = Point.parsePath(_this.getAttribute("points").getString());
			return _this;
		}
		_createClass__default["default"](PolylineElement, [{
			key: "path",
			value: function path(ctx) {
				var points = this.points;
				var _points$ = _slicedToArray__default["default"](points, 1)[0], x0 = _points$.x, y0 = _points$.y;
				var boundingBox = new BoundingBox(x0, y0);
				if (ctx) {
					ctx.beginPath();
					ctx.moveTo(x0, y0);
				}
				points.forEach(function(_ref) {
					var x = _ref.x, y = _ref.y;
					boundingBox.addPoint(x, y);
					if (ctx) ctx.lineTo(x, y);
				});
				return boundingBox;
			}
		}, {
			key: "getMarkers",
			value: function getMarkers() {
				var points = this.points;
				var lastIndex = points.length - 1;
				var markers = [];
				points.forEach(function(point, i) {
					if (i === lastIndex) return;
					markers.push([point, point.angleTo(points[i + 1])]);
				});
				if (markers.length > 0) markers.push([points[points.length - 1], markers[markers.length - 1][1]]);
				return markers;
			}
		}]);
		return PolylineElement;
	}(PathElement);
	function _createSuper$v(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$v();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$v() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var PolygonElement = /*#__PURE__*/ function(_PolylineElement) {
		_inherits__default["default"](PolygonElement, _PolylineElement);
		var _super = _createSuper$v(PolygonElement);
		function PolygonElement() {
			var _this;
			_classCallCheck__default["default"](this, PolygonElement);
			_this = _super.apply(this, arguments);
			_this.type = "polygon";
			return _this;
		}
		_createClass__default["default"](PolygonElement, [{
			key: "path",
			value: function path(ctx) {
				var boundingBox = _get__default["default"](_getPrototypeOf__default["default"](PolygonElement.prototype), "path", this).call(this, ctx);
				var _this$points$ = _slicedToArray__default["default"](this.points, 1)[0], x = _this$points$.x, y = _this$points$.y;
				if (ctx) {
					ctx.lineTo(x, y);
					ctx.closePath();
				}
				return boundingBox;
			}
		}]);
		return PolygonElement;
	}(PolylineElement);
	function _createSuper$u(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$u();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$u() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var PatternElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](PatternElement, _Element);
		var _super = _createSuper$u(PatternElement);
		function PatternElement() {
			var _this;
			_classCallCheck__default["default"](this, PatternElement);
			_this = _super.apply(this, arguments);
			_this.type = "pattern";
			return _this;
		}
		_createClass__default["default"](PatternElement, [{
			key: "createPattern",
			value: function createPattern(ctx, _, parentOpacityProp) {
				var width = this.getStyle("width").getPixels("x", true);
				var height = this.getStyle("height").getPixels("y", true);
				var patternSvg = new SVGElement(this.document, null);
				patternSvg.attributes.viewBox = new Property(this.document, "viewBox", this.getAttribute("viewBox").getValue());
				patternSvg.attributes.width = new Property(this.document, "width", "".concat(width, "px"));
				patternSvg.attributes.height = new Property(this.document, "height", "".concat(height, "px"));
				patternSvg.attributes.transform = new Property(this.document, "transform", this.getAttribute("patternTransform").getValue());
				patternSvg.children = this.children;
				var patternCanvas = this.document.createCanvas(width, height);
				var patternCtx = patternCanvas.getContext("2d");
				var xAttr = this.getAttribute("x");
				var yAttr = this.getAttribute("y");
				if (xAttr.hasValue() && yAttr.hasValue()) patternCtx.translate(xAttr.getPixels("x", true), yAttr.getPixels("y", true));
				if (parentOpacityProp.hasValue()) this.styles["fill-opacity"] = parentOpacityProp;
				else Reflect.deleteProperty(this.styles, "fill-opacity");
				for (var x = -1; x <= 1; x++) for (var y = -1; y <= 1; y++) {
					patternCtx.save();
					patternSvg.attributes.x = new Property(this.document, "x", x * patternCanvas.width);
					patternSvg.attributes.y = new Property(this.document, "y", y * patternCanvas.height);
					patternSvg.render(patternCtx);
					patternCtx.restore();
				}
				return ctx.createPattern(patternCanvas, "repeat");
			}
		}]);
		return PatternElement;
	}(Element);
	function _createSuper$t(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$t();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$t() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var MarkerElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](MarkerElement, _Element);
		var _super = _createSuper$t(MarkerElement);
		function MarkerElement() {
			var _this;
			_classCallCheck__default["default"](this, MarkerElement);
			_this = _super.apply(this, arguments);
			_this.type = "marker";
			return _this;
		}
		_createClass__default["default"](MarkerElement, [{
			key: "render",
			value: function render(ctx, point, angle) {
				if (!point) return;
				var x = point.x, y = point.y;
				var orient = this.getAttribute("orient").getString("auto");
				var markerUnits = this.getAttribute("markerUnits").getString("strokeWidth");
				ctx.translate(x, y);
				if (orient === "auto") ctx.rotate(angle);
				if (markerUnits === "strokeWidth") ctx.scale(ctx.lineWidth, ctx.lineWidth);
				ctx.save();
				var markerSvg = new SVGElement(this.document, null);
				markerSvg.type = this.type;
				markerSvg.attributes.viewBox = new Property(this.document, "viewBox", this.getAttribute("viewBox").getValue());
				markerSvg.attributes.refX = new Property(this.document, "refX", this.getAttribute("refX").getValue());
				markerSvg.attributes.refY = new Property(this.document, "refY", this.getAttribute("refY").getValue());
				markerSvg.attributes.width = new Property(this.document, "width", this.getAttribute("markerWidth").getValue());
				markerSvg.attributes.height = new Property(this.document, "height", this.getAttribute("markerHeight").getValue());
				markerSvg.attributes.overflow = new Property(this.document, "overflow", this.getAttribute("overflow").getValue());
				markerSvg.attributes.fill = new Property(this.document, "fill", this.getAttribute("fill").getColor("black"));
				markerSvg.attributes.stroke = new Property(this.document, "stroke", this.getAttribute("stroke").getValue("none"));
				markerSvg.children = this.children;
				markerSvg.render(ctx);
				ctx.restore();
				if (markerUnits === "strokeWidth") ctx.scale(1 / ctx.lineWidth, 1 / ctx.lineWidth);
				if (orient === "auto") ctx.rotate(-angle);
				ctx.translate(-x, -y);
			}
		}]);
		return MarkerElement;
	}(Element);
	function _createSuper$s(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$s();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$s() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var DefsElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](DefsElement, _Element);
		var _super = _createSuper$s(DefsElement);
		function DefsElement() {
			var _this;
			_classCallCheck__default["default"](this, DefsElement);
			_this = _super.apply(this, arguments);
			_this.type = "defs";
			return _this;
		}
		_createClass__default["default"](DefsElement, [{
			key: "render",
			value: function render() {}
		}]);
		return DefsElement;
	}(Element);
	function _createSuper$r(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$r();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$r() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var GElement = /*#__PURE__*/ function(_RenderedElement) {
		_inherits__default["default"](GElement, _RenderedElement);
		var _super = _createSuper$r(GElement);
		function GElement() {
			var _this;
			_classCallCheck__default["default"](this, GElement);
			_this = _super.apply(this, arguments);
			_this.type = "g";
			return _this;
		}
		_createClass__default["default"](GElement, [{
			key: "getBoundingBox",
			value: function getBoundingBox(ctx) {
				var boundingBox = new BoundingBox();
				this.children.forEach(function(child) {
					boundingBox.addBoundingBox(child.getBoundingBox(ctx));
				});
				return boundingBox;
			}
		}]);
		return GElement;
	}(RenderedElement);
	function _createSuper$q(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$q();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$q() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var GradientElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](GradientElement, _Element);
		var _super = _createSuper$q(GradientElement);
		function GradientElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, GradientElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.attributesToInherit = ["gradientUnits"];
			_this.stops = [];
			var _assertThisInitialize = _assertThisInitialized__default["default"](_this), stops = _assertThisInitialize.stops;
			_assertThisInitialize.children.forEach(function(child) {
				if (child.type === "stop") stops.push(child);
			});
			return _this;
		}
		_createClass__default["default"](GradientElement, [
			{
				key: "getGradientUnits",
				value: function getGradientUnits() {
					return this.getAttribute("gradientUnits").getString("objectBoundingBox");
				}
			},
			{
				key: "createGradient",
				value: function createGradient(ctx, element, parentOpacityProp) {
					var _this2 = this;
					var stopsContainer = this;
					if (this.getHrefAttribute().hasValue()) {
						stopsContainer = this.getHrefAttribute().getDefinition();
						this.inheritStopContainer(stopsContainer);
					}
					var stops = stopsContainer.stops;
					var gradient = this.getGradient(ctx, element);
					if (!gradient) return this.addParentOpacity(parentOpacityProp, stops[stops.length - 1].color);
					stops.forEach(function(stop) {
						gradient.addColorStop(stop.offset, _this2.addParentOpacity(parentOpacityProp, stop.color));
					});
					if (this.getAttribute("gradientTransform").hasValue()) {
						var document = this.document;
						var _document$screen = document.screen, MAX_VIRTUAL_PIXELS = _document$screen.MAX_VIRTUAL_PIXELS, viewPort = _document$screen.viewPort;
						var rootView = _slicedToArray__default["default"](viewPort.viewPorts, 1)[0];
						var rect = new RectElement(document, null);
						rect.attributes.x = new Property(document, "x", -MAX_VIRTUAL_PIXELS / 3);
						rect.attributes.y = new Property(document, "y", -MAX_VIRTUAL_PIXELS / 3);
						rect.attributes.width = new Property(document, "width", MAX_VIRTUAL_PIXELS);
						rect.attributes.height = new Property(document, "height", MAX_VIRTUAL_PIXELS);
						var group = new GElement(document, null);
						group.attributes.transform = new Property(document, "transform", this.getAttribute("gradientTransform").getValue());
						group.children = [rect];
						var patternSvg = new SVGElement(document, null);
						patternSvg.attributes.x = new Property(document, "x", 0);
						patternSvg.attributes.y = new Property(document, "y", 0);
						patternSvg.attributes.width = new Property(document, "width", rootView.width);
						patternSvg.attributes.height = new Property(document, "height", rootView.height);
						patternSvg.children = [group];
						var patternCanvas = document.createCanvas(rootView.width, rootView.height);
						var patternCtx = patternCanvas.getContext("2d");
						patternCtx.fillStyle = gradient;
						patternSvg.render(patternCtx);
						return patternCtx.createPattern(patternCanvas, "no-repeat");
					}
					return gradient;
				}
			},
			{
				key: "inheritStopContainer",
				value: function inheritStopContainer(stopsContainer) {
					var _this3 = this;
					this.attributesToInherit.forEach(function(attributeToInherit) {
						if (!_this3.getAttribute(attributeToInherit).hasValue() && stopsContainer.getAttribute(attributeToInherit).hasValue()) _this3.getAttribute(attributeToInherit, true).setValue(stopsContainer.getAttribute(attributeToInherit).getValue());
					});
				}
			},
			{
				key: "addParentOpacity",
				value: function addParentOpacity(parentOpacityProp, color) {
					if (parentOpacityProp.hasValue()) return new Property(this.document, "color", color).addOpacity(parentOpacityProp).getColor();
					return color;
				}
			}
		]);
		return GradientElement;
	}(Element);
	function _createSuper$p(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$p();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$p() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var LinearGradientElement = /*#__PURE__*/ function(_GradientElement) {
		_inherits__default["default"](LinearGradientElement, _GradientElement);
		var _super = _createSuper$p(LinearGradientElement);
		function LinearGradientElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, LinearGradientElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "linearGradient";
			_this.attributesToInherit.push("x1", "y1", "x2", "y2");
			return _this;
		}
		_createClass__default["default"](LinearGradientElement, [{
			key: "getGradient",
			value: function getGradient(ctx, element) {
				var isBoundingBoxUnits = this.getGradientUnits() === "objectBoundingBox";
				var boundingBox = isBoundingBoxUnits ? element.getBoundingBox(ctx) : null;
				if (isBoundingBoxUnits && !boundingBox) return null;
				if (!this.getAttribute("x1").hasValue() && !this.getAttribute("y1").hasValue() && !this.getAttribute("x2").hasValue() && !this.getAttribute("y2").hasValue()) {
					this.getAttribute("x1", true).setValue(0);
					this.getAttribute("y1", true).setValue(0);
					this.getAttribute("x2", true).setValue(1);
					this.getAttribute("y2", true).setValue(0);
				}
				var x1 = isBoundingBoxUnits ? boundingBox.x + boundingBox.width * this.getAttribute("x1").getNumber() : this.getAttribute("x1").getPixels("x");
				var y1 = isBoundingBoxUnits ? boundingBox.y + boundingBox.height * this.getAttribute("y1").getNumber() : this.getAttribute("y1").getPixels("y");
				var x2 = isBoundingBoxUnits ? boundingBox.x + boundingBox.width * this.getAttribute("x2").getNumber() : this.getAttribute("x2").getPixels("x");
				var y2 = isBoundingBoxUnits ? boundingBox.y + boundingBox.height * this.getAttribute("y2").getNumber() : this.getAttribute("y2").getPixels("y");
				if (x1 === x2 && y1 === y2) return null;
				return ctx.createLinearGradient(x1, y1, x2, y2);
			}
		}]);
		return LinearGradientElement;
	}(GradientElement);
	function _createSuper$o(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$o();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$o() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var RadialGradientElement = /*#__PURE__*/ function(_GradientElement) {
		_inherits__default["default"](RadialGradientElement, _GradientElement);
		var _super = _createSuper$o(RadialGradientElement);
		function RadialGradientElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, RadialGradientElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "radialGradient";
			_this.attributesToInherit.push("cx", "cy", "r", "fx", "fy", "fr");
			return _this;
		}
		_createClass__default["default"](RadialGradientElement, [{
			key: "getGradient",
			value: function getGradient(ctx, element) {
				var isBoundingBoxUnits = this.getGradientUnits() === "objectBoundingBox";
				var boundingBox = element.getBoundingBox(ctx);
				if (isBoundingBoxUnits && !boundingBox) return null;
				if (!this.getAttribute("cx").hasValue()) this.getAttribute("cx", true).setValue("50%");
				if (!this.getAttribute("cy").hasValue()) this.getAttribute("cy", true).setValue("50%");
				if (!this.getAttribute("r").hasValue()) this.getAttribute("r", true).setValue("50%");
				var cx = isBoundingBoxUnits ? boundingBox.x + boundingBox.width * this.getAttribute("cx").getNumber() : this.getAttribute("cx").getPixels("x");
				var cy = isBoundingBoxUnits ? boundingBox.y + boundingBox.height * this.getAttribute("cy").getNumber() : this.getAttribute("cy").getPixels("y");
				var fx = cx;
				var fy = cy;
				if (this.getAttribute("fx").hasValue()) fx = isBoundingBoxUnits ? boundingBox.x + boundingBox.width * this.getAttribute("fx").getNumber() : this.getAttribute("fx").getPixels("x");
				if (this.getAttribute("fy").hasValue()) fy = isBoundingBoxUnits ? boundingBox.y + boundingBox.height * this.getAttribute("fy").getNumber() : this.getAttribute("fy").getPixels("y");
				var r = isBoundingBoxUnits ? (boundingBox.width + boundingBox.height) / 2 * this.getAttribute("r").getNumber() : this.getAttribute("r").getPixels();
				var fr = this.getAttribute("fr").getPixels();
				return ctx.createRadialGradient(fx, fy, fr, cx, cy, r);
			}
		}]);
		return RadialGradientElement;
	}(GradientElement);
	function _createSuper$n(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$n();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$n() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var StopElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](StopElement, _Element);
		var _super = _createSuper$n(StopElement);
		function StopElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, StopElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "stop";
			var offset = Math.max(0, Math.min(1, _this.getAttribute("offset").getNumber()));
			var stopOpacity = _this.getStyle("stop-opacity");
			var stopColor = _this.getStyle("stop-color", true);
			if (stopColor.getString() === "") stopColor.setValue("#000");
			if (stopOpacity.hasValue()) stopColor = stopColor.addOpacity(stopOpacity);
			_this.offset = offset;
			_this.color = stopColor.getColor();
			return _this;
		}
		return StopElement;
	}(Element);
	function _createSuper$m(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$m();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$m() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var AnimateElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](AnimateElement, _Element);
		var _super = _createSuper$m(AnimateElement);
		function AnimateElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, AnimateElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "animate";
			_this.duration = 0;
			_this.initialValue = null;
			_this.initialUnits = "";
			_this.removed = false;
			_this.frozen = false;
			document.screen.animations.push(_assertThisInitialized__default["default"](_this));
			_this.begin = _this.getAttribute("begin").getMilliseconds();
			_this.maxDuration = _this.begin + _this.getAttribute("dur").getMilliseconds();
			_this.from = _this.getAttribute("from");
			_this.to = _this.getAttribute("to");
			_this.values = new Property(document, "values", null);
			var valuesAttr = _this.getAttribute("values");
			if (valuesAttr.hasValue()) _this.values.setValue(valuesAttr.getString().split(";"));
			return _this;
		}
		_createClass__default["default"](AnimateElement, [
			{
				key: "getProperty",
				value: function getProperty() {
					var attributeType = this.getAttribute("attributeType").getString();
					var attributeName = this.getAttribute("attributeName").getString();
					if (attributeType === "CSS") return this.parent.getStyle(attributeName, true);
					return this.parent.getAttribute(attributeName, true);
				}
			},
			{
				key: "calcValue",
				value: function calcValue() {
					var initialUnits = this.initialUnits;
					var _this$getProgress = this.getProgress(), progress = _this$getProgress.progress, from = _this$getProgress.from, to = _this$getProgress.to;
					var newValue = from.getNumber() + (to.getNumber() - from.getNumber()) * progress;
					if (initialUnits === "%") newValue *= 100;
					return "".concat(newValue).concat(initialUnits);
				}
			},
			{
				key: "update",
				value: function update(delta) {
					var parent = this.parent;
					var prop = this.getProperty();
					if (!this.initialValue) {
						this.initialValue = prop.getString();
						this.initialUnits = prop.getUnits();
					}
					if (this.duration > this.maxDuration) {
						var fill = this.getAttribute("fill").getString("remove");
						if (this.getAttribute("repeatCount").getString() === "indefinite" || this.getAttribute("repeatDur").getString() === "indefinite") this.duration = 0;
						else if (fill === "freeze" && !this.frozen) {
							this.frozen = true;
							parent.animationFrozen = true;
							parent.animationFrozenValue = prop.getString();
						} else if (fill === "remove" && !this.removed) {
							this.removed = true;
							prop.setValue(parent.animationFrozen ? parent.animationFrozenValue : this.initialValue);
							return true;
						}
						return false;
					}
					this.duration += delta;
					var updated = false;
					if (this.begin < this.duration) {
						var newValue = this.calcValue();
						var typeAttr = this.getAttribute("type");
						if (typeAttr.hasValue()) {
							var type = typeAttr.getString();
							newValue = "".concat(type, "(").concat(newValue, ")");
						}
						prop.setValue(newValue);
						updated = true;
					}
					return updated;
				}
			},
			{
				key: "getProgress",
				value: function getProgress() {
					var document = this.document, values = this.values;
					var result = { progress: (this.duration - this.begin) / (this.maxDuration - this.begin) };
					if (values.hasValue()) {
						var p = result.progress * (values.getValue().length - 1);
						var lb = Math.floor(p);
						var ub = Math.ceil(p);
						result.from = new Property(document, "from", parseFloat(values.getValue()[lb]));
						result.to = new Property(document, "to", parseFloat(values.getValue()[ub]));
						result.progress = (p - lb) / (ub - lb);
					} else {
						result.from = this.from;
						result.to = this.to;
					}
					return result;
				}
			}
		]);
		return AnimateElement;
	}(Element);
	function _createSuper$l(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$l();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$l() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var AnimateColorElement = /*#__PURE__*/ function(_AnimateElement) {
		_inherits__default["default"](AnimateColorElement, _AnimateElement);
		var _super = _createSuper$l(AnimateColorElement);
		function AnimateColorElement() {
			var _this;
			_classCallCheck__default["default"](this, AnimateColorElement);
			_this = _super.apply(this, arguments);
			_this.type = "animateColor";
			return _this;
		}
		_createClass__default["default"](AnimateColorElement, [{
			key: "calcValue",
			value: function calcValue() {
				var _this$getProgress = this.getProgress(), progress = _this$getProgress.progress, from = _this$getProgress.from, to = _this$getProgress.to;
				var colorFrom = new RGBColor__default["default"](from.getColor());
				var colorTo = new RGBColor__default["default"](to.getColor());
				if (colorFrom.ok && colorTo.ok) {
					var r = colorFrom.r + (colorTo.r - colorFrom.r) * progress;
					var g = colorFrom.g + (colorTo.g - colorFrom.g) * progress;
					var b = colorFrom.b + (colorTo.b - colorFrom.b) * progress;
					return "rgb(".concat(Math.floor(r), ", ").concat(Math.floor(g), ", ").concat(Math.floor(b), ")");
				}
				return this.getAttribute("from").getColor();
			}
		}]);
		return AnimateColorElement;
	}(AnimateElement);
	function _createSuper$k(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$k();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$k() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var AnimateTransformElement = /*#__PURE__*/ function(_AnimateElement) {
		_inherits__default["default"](AnimateTransformElement, _AnimateElement);
		var _super = _createSuper$k(AnimateTransformElement);
		function AnimateTransformElement() {
			var _this;
			_classCallCheck__default["default"](this, AnimateTransformElement);
			_this = _super.apply(this, arguments);
			_this.type = "animateTransform";
			return _this;
		}
		_createClass__default["default"](AnimateTransformElement, [{
			key: "calcValue",
			value: function calcValue() {
				var _this$getProgress = this.getProgress(), progress = _this$getProgress.progress, from = _this$getProgress.from, to = _this$getProgress.to;
				var transformFrom = toNumbers(from.getString());
				var transformTo = toNumbers(to.getString());
				return transformFrom.map(function(from, i) {
					return from + (transformTo[i] - from) * progress;
				}).join(" ");
			}
		}]);
		return AnimateTransformElement;
	}(AnimateElement);
	function _createForOfIteratorHelper$1(o, allowArrayLike) {
		var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
		if (!it) {
			if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") {
				if (it) o = it;
				var i = 0;
				var F = function F() {};
				return {
					s: F,
					n: function n() {
						if (i >= o.length) return { done: true };
						return {
							done: false,
							value: o[i++]
						};
					},
					e: function e(_e) {
						throw _e;
					},
					f: F
				};
			}
			throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
		}
		var normalCompletion = true, didErr = false, err;
		return {
			s: function s() {
				it = it.call(o);
			},
			n: function n() {
				var step = it.next();
				normalCompletion = step.done;
				return step;
			},
			e: function e(_e2) {
				didErr = true;
				err = _e2;
			},
			f: function f() {
				try {
					if (!normalCompletion && it.return != null) it.return();
				} finally {
					if (didErr) throw err;
				}
			}
		};
	}
	function _unsupportedIterableToArray$1(o, minLen) {
		if (!o) return;
		if (typeof o === "string") return _arrayLikeToArray$1(o, minLen);
		var n = Object.prototype.toString.call(o).slice(8, -1);
		if (n === "Object" && o.constructor) n = o.constructor.name;
		if (n === "Map" || n === "Set") return Array.from(o);
		if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen);
	}
	function _arrayLikeToArray$1(arr, len) {
		if (len == null || len > arr.length) len = arr.length;
		for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
		return arr2;
	}
	function _createSuper$j(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$j();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$j() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var FontElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](FontElement, _Element);
		var _super = _createSuper$j(FontElement);
		function FontElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, FontElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "font";
			_this.glyphs = Object.create(null);
			_this.horizAdvX = _this.getAttribute("horiz-adv-x").getNumber();
			var definitions = document.definitions;
			var children = _assertThisInitialized__default["default"](_this).children;
			var _iterator = _createForOfIteratorHelper$1(children), _step;
			try {
				for (_iterator.s(); !(_step = _iterator.n()).done;) {
					var child = _step.value;
					switch (child.type) {
						case "font-face":
							_this.fontFace = child;
							var fontFamilyStyle = child.getStyle("font-family");
							if (fontFamilyStyle.hasValue()) definitions[fontFamilyStyle.getString()] = _assertThisInitialized__default["default"](_this);
							break;
						case "missing-glyph":
							_this.missingGlyph = child;
							break;
						case "glyph":
							var glyph = child;
							if (glyph.arabicForm) {
								_this.isRTL = true;
								_this.isArabic = true;
								if (typeof _this.glyphs[glyph.unicode] === "undefined") _this.glyphs[glyph.unicode] = Object.create(null);
								_this.glyphs[glyph.unicode][glyph.arabicForm] = glyph;
							} else _this.glyphs[glyph.unicode] = glyph;
					}
				}
			} catch (err) {
				_iterator.e(err);
			} finally {
				_iterator.f();
			}
			return _this;
		}
		_createClass__default["default"](FontElement, [{
			key: "render",
			value: function render() {}
		}]);
		return FontElement;
	}(Element);
	function _createSuper$i(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$i();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$i() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var FontFaceElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](FontFaceElement, _Element);
		var _super = _createSuper$i(FontFaceElement);
		function FontFaceElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, FontFaceElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "font-face";
			_this.ascent = _this.getAttribute("ascent").getNumber();
			_this.descent = _this.getAttribute("descent").getNumber();
			_this.unitsPerEm = _this.getAttribute("units-per-em").getNumber();
			return _this;
		}
		return FontFaceElement;
	}(Element);
	function _createSuper$h(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$h();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$h() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var MissingGlyphElement = /*#__PURE__*/ function(_PathElement) {
		_inherits__default["default"](MissingGlyphElement, _PathElement);
		var _super = _createSuper$h(MissingGlyphElement);
		function MissingGlyphElement() {
			var _this;
			_classCallCheck__default["default"](this, MissingGlyphElement);
			_this = _super.apply(this, arguments);
			_this.type = "missing-glyph";
			_this.horizAdvX = 0;
			return _this;
		}
		return MissingGlyphElement;
	}(PathElement);
	function _createSuper$g(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$g();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$g() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var TRefElement = /*#__PURE__*/ function(_TextElement) {
		_inherits__default["default"](TRefElement, _TextElement);
		var _super = _createSuper$g(TRefElement);
		function TRefElement() {
			var _this;
			_classCallCheck__default["default"](this, TRefElement);
			_this = _super.apply(this, arguments);
			_this.type = "tref";
			return _this;
		}
		_createClass__default["default"](TRefElement, [{
			key: "getText",
			value: function getText() {
				var element = this.getHrefAttribute().getDefinition();
				if (element) {
					var firstChild = element.children[0];
					if (firstChild) return firstChild.getText();
				}
				return "";
			}
		}]);
		return TRefElement;
	}(TextElement);
	function _createSuper$f(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$f();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$f() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var AElement = /*#__PURE__*/ function(_TextElement) {
		_inherits__default["default"](AElement, _TextElement);
		var _super = _createSuper$f(AElement);
		function AElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, AElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "a";
			var childNodes = node.childNodes;
			var firstChild = childNodes[0];
			var hasText = childNodes.length > 0 && Array.from(childNodes).every(function(node) {
				return node.nodeType === 3;
			});
			_this.hasText = hasText;
			_this.text = hasText ? _this.getTextFromNode(firstChild) : "";
			return _this;
		}
		_createClass__default["default"](AElement, [
			{
				key: "getText",
				value: function getText() {
					return this.text;
				}
			},
			{
				key: "renderChildren",
				value: function renderChildren(ctx) {
					if (this.hasText) {
						_get__default["default"](_getPrototypeOf__default["default"](AElement.prototype), "renderChildren", this).call(this, ctx);
						var document = this.document, x = this.x, y = this.y;
						var mouse = document.screen.mouse;
						var fontSize = new Property(document, "fontSize", Font.parse(document.ctx.font).fontSize);
						if (mouse.isWorking()) mouse.checkBoundingBox(this, new BoundingBox(x, y - fontSize.getPixels("y"), x + this.measureText(ctx), y));
					} else if (this.children.length > 0) {
						var g = new GElement(this.document, null);
						g.children = this.children;
						g.parent = this;
						g.render(ctx);
					}
				}
			},
			{
				key: "onClick",
				value: function onClick() {
					var window = this.document.window;
					if (window) window.open(this.getHrefAttribute().getString());
				}
			},
			{
				key: "onMouseMove",
				value: function onMouseMove() {
					var ctx = this.document.ctx;
					ctx.canvas.style.cursor = "pointer";
				}
			}
		]);
		return AElement;
	}(TextElement);
	function _createForOfIteratorHelper(o, allowArrayLike) {
		var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
		if (!it) {
			if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
				if (it) o = it;
				var i = 0;
				var F = function F() {};
				return {
					s: F,
					n: function n() {
						if (i >= o.length) return { done: true };
						return {
							done: false,
							value: o[i++]
						};
					},
					e: function e(_e) {
						throw _e;
					},
					f: F
				};
			}
			throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
		}
		var normalCompletion = true, didErr = false, err;
		return {
			s: function s() {
				it = it.call(o);
			},
			n: function n() {
				var step = it.next();
				normalCompletion = step.done;
				return step;
			},
			e: function e(_e2) {
				didErr = true;
				err = _e2;
			},
			f: function f() {
				try {
					if (!normalCompletion && it.return != null) it.return();
				} finally {
					if (didErr) throw err;
				}
			}
		};
	}
	function _unsupportedIterableToArray(o, minLen) {
		if (!o) return;
		if (typeof o === "string") return _arrayLikeToArray(o, minLen);
		var n = Object.prototype.toString.call(o).slice(8, -1);
		if (n === "Object" && o.constructor) n = o.constructor.name;
		if (n === "Map" || n === "Set") return Array.from(o);
		if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}
	function _arrayLikeToArray(arr, len) {
		if (len == null || len > arr.length) len = arr.length;
		for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
		return arr2;
	}
	function ownKeys$2(object, enumerableOnly) {
		var keys = Object.keys(object);
		if (Object.getOwnPropertySymbols) {
			var symbols = Object.getOwnPropertySymbols(object);
			if (enumerableOnly) symbols = symbols.filter(function(sym) {
				return Object.getOwnPropertyDescriptor(object, sym).enumerable;
			});
			keys.push.apply(keys, symbols);
		}
		return keys;
	}
	function _objectSpread$2(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i] != null ? arguments[i] : {};
			if (i % 2) ownKeys$2(Object(source), true).forEach(function(key) {
				_defineProperty__default["default"](target, key, source[key]);
			});
			else if (Object.getOwnPropertyDescriptors) Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
			else ownKeys$2(Object(source)).forEach(function(key) {
				Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
			});
		}
		return target;
	}
	function _createSuper$e(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$e();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$e() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var TextPathElement = /*#__PURE__*/ function(_TextElement) {
		_inherits__default["default"](TextPathElement, _TextElement);
		var _super = _createSuper$e(TextPathElement);
		function TextPathElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, TextPathElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "textPath";
			_this.textWidth = 0;
			_this.textHeight = 0;
			_this.pathLength = -1;
			_this.glyphInfo = null;
			_this.letterSpacingCache = [];
			_this.measuresCache = /* @__PURE__ */ new Map([["", 0]]);
			var pathElement = _this.getHrefAttribute().getDefinition();
			_this.text = _this.getTextFromNode();
			_this.dataArray = _this.parsePathData(pathElement);
			return _this;
		}
		_createClass__default["default"](TextPathElement, [
			{
				key: "getText",
				value: function getText() {
					return this.text;
				}
			},
			{
				key: "path",
				value: function path(ctx) {
					var dataArray = this.dataArray;
					if (ctx) ctx.beginPath();
					dataArray.forEach(function(_ref) {
						var type = _ref.type, points = _ref.points;
						switch (type) {
							case PathParser.LINE_TO:
								if (ctx) ctx.lineTo(points[0], points[1]);
								break;
							case PathParser.MOVE_TO:
								if (ctx) ctx.moveTo(points[0], points[1]);
								break;
							case PathParser.CURVE_TO:
								if (ctx) ctx.bezierCurveTo(points[0], points[1], points[2], points[3], points[4], points[5]);
								break;
							case PathParser.QUAD_TO:
								if (ctx) ctx.quadraticCurveTo(points[0], points[1], points[2], points[3]);
								break;
							case PathParser.ARC:
								var _points = _slicedToArray__default["default"](points, 8), cx = _points[0], cy = _points[1], rx = _points[2], ry = _points[3], theta = _points[4], dTheta = _points[5], psi = _points[6], fs = _points[7];
								var r = rx > ry ? rx : ry;
								var scaleX = rx > ry ? 1 : rx / ry;
								var scaleY = rx > ry ? ry / rx : 1;
								if (ctx) {
									ctx.translate(cx, cy);
									ctx.rotate(psi);
									ctx.scale(scaleX, scaleY);
									ctx.arc(0, 0, r, theta, theta + dTheta, Boolean(1 - fs));
									ctx.scale(1 / scaleX, 1 / scaleY);
									ctx.rotate(-psi);
									ctx.translate(-cx, -cy);
								}
								break;
							case PathParser.CLOSE_PATH: if (ctx) ctx.closePath();
						}
					});
				}
			},
			{
				key: "renderChildren",
				value: function renderChildren(ctx) {
					this.setTextData(ctx);
					ctx.save();
					var textDecoration = this.parent.getStyle("text-decoration").getString();
					var fontSize = this.getFontSize();
					var glyphInfo = this.glyphInfo;
					var fill = ctx.fillStyle;
					if (textDecoration === "underline") ctx.beginPath();
					glyphInfo.forEach(function(glyph, i) {
						var p0 = glyph.p0, p1 = glyph.p1, rotation = glyph.rotation, partialText = glyph.text;
						ctx.save();
						ctx.translate(p0.x, p0.y);
						ctx.rotate(rotation);
						if (ctx.fillStyle) ctx.fillText(partialText, 0, 0);
						if (ctx.strokeStyle) ctx.strokeText(partialText, 0, 0);
						ctx.restore();
						if (textDecoration === "underline") {
							if (i === 0) ctx.moveTo(p0.x, p0.y + fontSize / 8);
							ctx.lineTo(p1.x, p1.y + fontSize / 5);
						}
					});
					if (textDecoration === "underline") {
						ctx.lineWidth = fontSize / 20;
						ctx.strokeStyle = fill;
						ctx.stroke();
						ctx.closePath();
					}
					ctx.restore();
				}
			},
			{
				key: "getLetterSpacingAt",
				value: function getLetterSpacingAt() {
					var idx = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
					return this.letterSpacingCache[idx] || 0;
				}
			},
			{
				key: "findSegmentToFitChar",
				value: function findSegmentToFitChar(ctx, anchor, textFullWidth, fullPathWidth, spacesNumber, inputOffset, dy, c, charI) {
					var offset = inputOffset;
					var glyphWidth = this.measureText(ctx, c);
					if (c === " " && anchor === "justify" && textFullWidth < fullPathWidth) glyphWidth += (fullPathWidth - textFullWidth) / spacesNumber;
					if (charI > -1) offset += this.getLetterSpacingAt(charI);
					var splineStep = this.textHeight / 20;
					var p0 = this.getEquidistantPointOnPath(offset, splineStep, 0);
					var p1 = this.getEquidistantPointOnPath(offset + glyphWidth, splineStep, 0);
					var segment = {
						p0,
						p1
					};
					var rotation = p0 && p1 ? Math.atan2(p1.y - p0.y, p1.x - p0.x) : 0;
					if (dy) {
						var dyX = Math.cos(Math.PI / 2 + rotation) * dy;
						var dyY = Math.cos(-rotation) * dy;
						segment.p0 = _objectSpread$2(_objectSpread$2({}, p0), {}, {
							x: p0.x + dyX,
							y: p0.y + dyY
						});
						segment.p1 = _objectSpread$2(_objectSpread$2({}, p1), {}, {
							x: p1.x + dyX,
							y: p1.y + dyY
						});
					}
					offset += glyphWidth;
					return {
						offset,
						segment,
						rotation
					};
				}
			},
			{
				key: "measureText",
				value: function measureText(ctx, text) {
					var measuresCache = this.measuresCache;
					var targetText = text || this.getText();
					if (measuresCache.has(targetText)) return measuresCache.get(targetText);
					var measure = this.measureTargetText(ctx, targetText);
					measuresCache.set(targetText, measure);
					return measure;
				}
			},
			{
				key: "setTextData",
				value: function setTextData(ctx) {
					var _this2 = this;
					if (this.glyphInfo) return;
					var renderText = this.getText();
					var chars = renderText.split("");
					var spacesNumber = renderText.split(" ").length - 1;
					var dx = this.parent.getAttribute("dx").split().map(function(_) {
						return _.getPixels("x");
					});
					var dy = this.parent.getAttribute("dy").getPixels("y");
					var anchor = this.parent.getStyle("text-anchor").getString("start");
					var thisSpacing = this.getStyle("letter-spacing");
					var parentSpacing = this.parent.getStyle("letter-spacing");
					var letterSpacing = 0;
					if (!thisSpacing.hasValue() || thisSpacing.getValue() === "inherit") letterSpacing = parentSpacing.getPixels();
					else if (thisSpacing.hasValue()) {
						if (thisSpacing.getValue() !== "initial" && thisSpacing.getValue() !== "unset") letterSpacing = thisSpacing.getPixels();
					}
					var letterSpacingCache = [];
					var textLen = renderText.length;
					this.letterSpacingCache = letterSpacingCache;
					for (var i = 0; i < textLen; i++) letterSpacingCache.push(typeof dx[i] !== "undefined" ? dx[i] : letterSpacing);
					var dxSum = letterSpacingCache.reduce(function(acc, cur, i) {
						return i === 0 ? 0 : acc + cur || 0;
					}, 0);
					var textWidth = this.measureText(ctx);
					var textFullWidth = Math.max(textWidth + dxSum, 0);
					this.textWidth = textWidth;
					this.textHeight = this.getFontSize();
					this.glyphInfo = [];
					var fullPathWidth = this.getPathLength();
					var startOffset = this.getStyle("startOffset").getNumber(0) * fullPathWidth;
					var offset = 0;
					if (anchor === "middle" || anchor === "center") offset = -textFullWidth / 2;
					if (anchor === "end" || anchor === "right") offset = -textFullWidth;
					offset += startOffset;
					chars.forEach(function(char, i) {
						var _this2$findSegmentToF = _this2.findSegmentToFitChar(ctx, anchor, textFullWidth, fullPathWidth, spacesNumber, offset, dy, char, i), nextOffset = _this2$findSegmentToF.offset, segment = _this2$findSegmentToF.segment, rotation = _this2$findSegmentToF.rotation;
						offset = nextOffset;
						if (!segment.p0 || !segment.p1) return;
						_this2.glyphInfo.push({
							text: chars[i],
							p0: segment.p0,
							p1: segment.p1,
							rotation
						});
					});
				}
			},
			{
				key: "parsePathData",
				value: function parsePathData(path) {
					this.pathLength = -1;
					if (!path) return [];
					var pathCommands = [];
					var pathParser = path.pathParser;
					pathParser.reset();
					while (!pathParser.isEnd()) {
						var current = pathParser.current;
						var startX = current ? current.x : 0;
						var startY = current ? current.y : 0;
						var command = pathParser.next();
						var nextCommandType = command.type;
						var points = [];
						switch (command.type) {
							case PathParser.MOVE_TO:
								this.pathM(pathParser, points);
								break;
							case PathParser.LINE_TO:
								nextCommandType = this.pathL(pathParser, points);
								break;
							case PathParser.HORIZ_LINE_TO:
								nextCommandType = this.pathH(pathParser, points);
								break;
							case PathParser.VERT_LINE_TO:
								nextCommandType = this.pathV(pathParser, points);
								break;
							case PathParser.CURVE_TO:
								this.pathC(pathParser, points);
								break;
							case PathParser.SMOOTH_CURVE_TO:
								nextCommandType = this.pathS(pathParser, points);
								break;
							case PathParser.QUAD_TO:
								this.pathQ(pathParser, points);
								break;
							case PathParser.SMOOTH_QUAD_TO:
								nextCommandType = this.pathT(pathParser, points);
								break;
							case PathParser.ARC:
								points = this.pathA(pathParser);
								break;
							case PathParser.CLOSE_PATH: PathElement.pathZ(pathParser);
						}
						if (command.type !== PathParser.CLOSE_PATH) pathCommands.push({
							type: nextCommandType,
							points,
							start: {
								x: startX,
								y: startY
							},
							pathLength: this.calcLength(startX, startY, nextCommandType, points)
						});
						else pathCommands.push({
							type: PathParser.CLOSE_PATH,
							points: [],
							pathLength: 0
						});
					}
					return pathCommands;
				}
			},
			{
				key: "pathM",
				value: function pathM(pathParser, points) {
					var _PathElement$pathM$po = PathElement.pathM(pathParser).point, x = _PathElement$pathM$po.x, y = _PathElement$pathM$po.y;
					points.push(x, y);
				}
			},
			{
				key: "pathL",
				value: function pathL(pathParser, points) {
					var _PathElement$pathL$po = PathElement.pathL(pathParser).point, x = _PathElement$pathL$po.x, y = _PathElement$pathL$po.y;
					points.push(x, y);
					return PathParser.LINE_TO;
				}
			},
			{
				key: "pathH",
				value: function pathH(pathParser, points) {
					var _PathElement$pathH$po = PathElement.pathH(pathParser).point, x = _PathElement$pathH$po.x, y = _PathElement$pathH$po.y;
					points.push(x, y);
					return PathParser.LINE_TO;
				}
			},
			{
				key: "pathV",
				value: function pathV(pathParser, points) {
					var _PathElement$pathV$po = PathElement.pathV(pathParser).point, x = _PathElement$pathV$po.x, y = _PathElement$pathV$po.y;
					points.push(x, y);
					return PathParser.LINE_TO;
				}
			},
			{
				key: "pathC",
				value: function pathC(pathParser, points) {
					var _PathElement$pathC = PathElement.pathC(pathParser), point = _PathElement$pathC.point, controlPoint = _PathElement$pathC.controlPoint, currentPoint = _PathElement$pathC.currentPoint;
					points.push(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
				}
			},
			{
				key: "pathS",
				value: function pathS(pathParser, points) {
					var _PathElement$pathS = PathElement.pathS(pathParser), point = _PathElement$pathS.point, controlPoint = _PathElement$pathS.controlPoint, currentPoint = _PathElement$pathS.currentPoint;
					points.push(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
					return PathParser.CURVE_TO;
				}
			},
			{
				key: "pathQ",
				value: function pathQ(pathParser, points) {
					var _PathElement$pathQ = PathElement.pathQ(pathParser), controlPoint = _PathElement$pathQ.controlPoint, currentPoint = _PathElement$pathQ.currentPoint;
					points.push(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
				}
			},
			{
				key: "pathT",
				value: function pathT(pathParser, points) {
					var _PathElement$pathT = PathElement.pathT(pathParser), controlPoint = _PathElement$pathT.controlPoint, currentPoint = _PathElement$pathT.currentPoint;
					points.push(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
					return PathParser.QUAD_TO;
				}
			},
			{
				key: "pathA",
				value: function pathA(pathParser) {
					var _PathElement$pathA = PathElement.pathA(pathParser), rX = _PathElement$pathA.rX, rY = _PathElement$pathA.rY, sweepFlag = _PathElement$pathA.sweepFlag, xAxisRotation = _PathElement$pathA.xAxisRotation, centp = _PathElement$pathA.centp, a1 = _PathElement$pathA.a1, ad = _PathElement$pathA.ad;
					if (sweepFlag === 0 && ad > 0) ad -= 2 * Math.PI;
					if (sweepFlag === 1 && ad < 0) ad += 2 * Math.PI;
					return [
						centp.x,
						centp.y,
						rX,
						rY,
						a1,
						ad,
						xAxisRotation,
						sweepFlag
					];
				}
			},
			{
				key: "calcLength",
				value: function calcLength(x, y, commandType, points) {
					var len = 0;
					var p1 = null;
					var p2 = null;
					var t = 0;
					switch (commandType) {
						case PathParser.LINE_TO: return this.getLineLength(x, y, points[0], points[1]);
						case PathParser.CURVE_TO:
							len = 0;
							p1 = this.getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
							for (t = .01; t <= 1; t += .01) {
								p2 = this.getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
								len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
								p1 = p2;
							}
							return len;
						case PathParser.QUAD_TO:
							len = 0;
							p1 = this.getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
							for (t = .01; t <= 1; t += .01) {
								p2 = this.getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
								len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
								p1 = p2;
							}
							return len;
						case PathParser.ARC:
							len = 0;
							var start = points[4];
							var dTheta = points[5];
							var end = points[4] + dTheta;
							var inc = Math.PI / 180;
							if (Math.abs(start - end) < inc) inc = Math.abs(start - end);
							p1 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
							if (dTheta < 0) for (t = start - inc; t > end; t -= inc) {
								p2 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
								len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
								p1 = p2;
							}
							else for (t = start + inc; t < end; t += inc) {
								p2 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
								len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
								p1 = p2;
							}
							p2 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
							len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
							return len;
					}
					return 0;
				}
			},
			{
				key: "getPointOnLine",
				value: function getPointOnLine(dist, p1x, p1y, p2x, p2y) {
					var fromX = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : p1x;
					var fromY = arguments.length > 6 && arguments[6] !== void 0 ? arguments[6] : p1y;
					var m = (p2y - p1y) / (p2x - p1x + PSEUDO_ZERO);
					var run = Math.sqrt(dist * dist / (1 + m * m));
					if (p2x < p1x) run *= -1;
					var rise = m * run;
					var pt = null;
					if (p2x === p1x) pt = {
						x: fromX,
						y: fromY + rise
					};
					else if ((fromY - p1y) / (fromX - p1x + PSEUDO_ZERO) === m) pt = {
						x: fromX + run,
						y: fromY + rise
					};
					else {
						var ix = 0;
						var iy = 0;
						var len = this.getLineLength(p1x, p1y, p2x, p2y);
						if (len < PSEUDO_ZERO) return null;
						var u = (fromX - p1x) * (p2x - p1x) + (fromY - p1y) * (p2y - p1y);
						u /= len * len;
						ix = p1x + u * (p2x - p1x);
						iy = p1y + u * (p2y - p1y);
						var pRise = this.getLineLength(fromX, fromY, ix, iy);
						var pRun = Math.sqrt(dist * dist - pRise * pRise);
						run = Math.sqrt(pRun * pRun / (1 + m * m));
						if (p2x < p1x) run *= -1;
						rise = m * run;
						pt = {
							x: ix + run,
							y: iy + rise
						};
					}
					return pt;
				}
			},
			{
				key: "getPointOnPath",
				value: function getPointOnPath(distance) {
					var fullLen = this.getPathLength();
					var cumulativePathLength = 0;
					var p = null;
					if (distance < -5e-5 || distance - 5e-5 > fullLen) return null;
					var dataArray = this.dataArray;
					var _iterator = _createForOfIteratorHelper(dataArray), _step;
					try {
						for (_iterator.s(); !(_step = _iterator.n()).done;) {
							var command = _step.value;
							if (command && (command.pathLength < 5e-5 || cumulativePathLength + command.pathLength + 5e-5 < distance)) {
								cumulativePathLength += command.pathLength;
								continue;
							}
							var delta = distance - cumulativePathLength;
							var currentT = 0;
							switch (command.type) {
								case PathParser.LINE_TO:
									p = this.getPointOnLine(delta, command.start.x, command.start.y, command.points[0], command.points[1], command.start.x, command.start.y);
									break;
								case PathParser.ARC:
									var start = command.points[4];
									var dTheta = command.points[5];
									var end = command.points[4] + dTheta;
									currentT = start + delta / command.pathLength * dTheta;
									if (dTheta < 0 && currentT < end || dTheta >= 0 && currentT > end) break;
									p = this.getPointOnEllipticalArc(command.points[0], command.points[1], command.points[2], command.points[3], currentT, command.points[6]);
									break;
								case PathParser.CURVE_TO:
									currentT = delta / command.pathLength;
									if (currentT > 1) currentT = 1;
									p = this.getPointOnCubicBezier(currentT, command.start.x, command.start.y, command.points[0], command.points[1], command.points[2], command.points[3], command.points[4], command.points[5]);
									break;
								case PathParser.QUAD_TO:
									currentT = delta / command.pathLength;
									if (currentT > 1) currentT = 1;
									p = this.getPointOnQuadraticBezier(currentT, command.start.x, command.start.y, command.points[0], command.points[1], command.points[2], command.points[3]);
							}
							if (p) return p;
							break;
						}
					} catch (err) {
						_iterator.e(err);
					} finally {
						_iterator.f();
					}
					return null;
				}
			},
			{
				key: "getLineLength",
				value: function getLineLength(x1, y1, x2, y2) {
					return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
				}
			},
			{
				key: "getPathLength",
				value: function getPathLength() {
					if (this.pathLength === -1) this.pathLength = this.dataArray.reduce(function(length, command) {
						return command.pathLength > 0 ? length + command.pathLength : length;
					}, 0);
					return this.pathLength;
				}
			},
			{
				key: "getPointOnCubicBezier",
				value: function getPointOnCubicBezier(pct, p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
					return {
						x: p4x * CB1(pct) + p3x * CB2(pct) + p2x * CB3(pct) + p1x * CB4(pct),
						y: p4y * CB1(pct) + p3y * CB2(pct) + p2y * CB3(pct) + p1y * CB4(pct)
					};
				}
			},
			{
				key: "getPointOnQuadraticBezier",
				value: function getPointOnQuadraticBezier(pct, p1x, p1y, p2x, p2y, p3x, p3y) {
					return {
						x: p3x * QB1(pct) + p2x * QB2(pct) + p1x * QB3(pct),
						y: p3y * QB1(pct) + p2y * QB2(pct) + p1y * QB3(pct)
					};
				}
			},
			{
				key: "getPointOnEllipticalArc",
				value: function getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi) {
					var cosPsi = Math.cos(psi);
					var sinPsi = Math.sin(psi);
					var pt = {
						x: rx * Math.cos(theta),
						y: ry * Math.sin(theta)
					};
					return {
						x: cx + (pt.x * cosPsi - pt.y * sinPsi),
						y: cy + (pt.x * sinPsi + pt.y * cosPsi)
					};
				}
			},
			{
				key: "buildEquidistantCache",
				value: function buildEquidistantCache(inputStep, inputPrecision) {
					var fullLen = this.getPathLength();
					var precision = inputPrecision || .25;
					var step = inputStep || fullLen / 100;
					if (!this.equidistantCache || this.equidistantCache.step !== step || this.equidistantCache.precision !== precision) {
						this.equidistantCache = {
							step,
							precision,
							points: []
						};
						var s = 0;
						for (var l = 0; l <= fullLen; l += precision) {
							var p0 = this.getPointOnPath(l);
							var p1 = this.getPointOnPath(l + precision);
							if (!p0 || !p1) continue;
							s += this.getLineLength(p0.x, p0.y, p1.x, p1.y);
							if (s >= step) {
								this.equidistantCache.points.push({
									x: p0.x,
									y: p0.y,
									distance: l
								});
								s -= step;
							}
						}
					}
				}
			},
			{
				key: "getEquidistantPointOnPath",
				value: function getEquidistantPointOnPath(targetDistance, step, precision) {
					this.buildEquidistantCache(step, precision);
					if (targetDistance < 0 || targetDistance - this.getPathLength() > 5e-5) return null;
					var idx = Math.round(targetDistance / this.getPathLength() * (this.equidistantCache.points.length - 1));
					return this.equidistantCache.points[idx] || null;
				}
			}
		]);
		return TextPathElement;
	}(TextElement);
	function _createSuper$d(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$d();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$d() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var dataUriRegex = /^\s*data:(([^/,;]+\/[^/,;]+)(?:;([^,;=]+=[^,;=]+))?)?(?:;(base64))?,(.*)$/i;
	var ImageElement = /*#__PURE__*/ function(_RenderedElement) {
		_inherits__default["default"](ImageElement, _RenderedElement);
		var _super = _createSuper$d(ImageElement);
		function ImageElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, ImageElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "image";
			_this.loaded = false;
			var href = _this.getHrefAttribute().getString();
			if (!href) return _possibleConstructorReturn__default["default"](_this);
			var isSvg = href.endsWith(".svg") || /^\s*data:image\/svg\+xml/i.test(href);
			document.images.push(_assertThisInitialized__default["default"](_this));
			if (!isSvg) _this.loadImage(href);
			else _this.loadSvg(href);
			_this.isSvg = isSvg;
			return _this;
		}
		_createClass__default["default"](ImageElement, [
			{
				key: "loadImage",
				value: function() {
					var _loadImage = _asyncToGenerator__default["default"](/*#__PURE__*/ _regeneratorRuntime__default["default"].mark(function _callee(href) {
						var image;
						return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
							while (1) switch (_context.prev = _context.next) {
								case 0:
									_context.prev = 0;
									_context.next = 3;
									return this.document.createImage(href);
								case 3:
									image = _context.sent;
									this.image = image;
									_context.next = 10;
									break;
								case 7:
									_context.prev = 7;
									_context.t0 = _context["catch"](0);
									console.error("Error while loading image \"".concat(href, "\":"), _context.t0);
								case 10: this.loaded = true;
								case 11:
								case "end": return _context.stop();
							}
						}, _callee, this, [[0, 7]]);
					}));
					function loadImage(_x) {
						return _loadImage.apply(this, arguments);
					}
					return loadImage;
				}()
			},
			{
				key: "loadSvg",
				value: function() {
					var _loadSvg = _asyncToGenerator__default["default"](/*#__PURE__*/ _regeneratorRuntime__default["default"].mark(function _callee2(href) {
						var match, data, response, svg;
						return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
							while (1) switch (_context2.prev = _context2.next) {
								case 0:
									match = dataUriRegex.exec(href);
									if (!match) {
										_context2.next = 6;
										break;
									}
									data = match[5];
									if (match[4] === "base64") this.image = atob(data);
									else this.image = decodeURIComponent(data);
									_context2.next = 19;
									break;
								case 6:
									_context2.prev = 6;
									_context2.next = 9;
									return this.document.fetch(href);
								case 9:
									response = _context2.sent;
									_context2.next = 12;
									return response.text();
								case 12:
									svg = _context2.sent;
									this.image = svg;
									_context2.next = 19;
									break;
								case 16:
									_context2.prev = 16;
									_context2.t0 = _context2["catch"](6);
									console.error("Error while loading image \"".concat(href, "\":"), _context2.t0);
								case 19: this.loaded = true;
								case 20:
								case "end": return _context2.stop();
							}
						}, _callee2, this, [[6, 16]]);
					}));
					function loadSvg(_x2) {
						return _loadSvg.apply(this, arguments);
					}
					return loadSvg;
				}()
			},
			{
				key: "renderChildren",
				value: function renderChildren(ctx) {
					var document = this.document, image = this.image, loaded = this.loaded;
					var x = this.getAttribute("x").getPixels("x");
					var y = this.getAttribute("y").getPixels("y");
					var width = this.getStyle("width").getPixels("x");
					var height = this.getStyle("height").getPixels("y");
					if (!loaded || !image || !width || !height) return;
					ctx.save();
					ctx.translate(x, y);
					if (this.isSvg) {
						var subDocument = document.canvg.forkString(ctx, this.image, {
							ignoreMouse: true,
							ignoreAnimation: true,
							ignoreDimensions: true,
							ignoreClear: true,
							offsetX: 0,
							offsetY: 0,
							scaleWidth: width,
							scaleHeight: height
						});
						subDocument.document.documentElement.parent = this;
						subDocument.render();
					} else {
						var _image = this.image;
						document.setViewBox({
							ctx,
							aspectRatio: this.getAttribute("preserveAspectRatio").getString(),
							width,
							desiredWidth: _image.width,
							height,
							desiredHeight: _image.height
						});
						if (this.loaded) {
							if (typeof _image.complete === "undefined" || _image.complete) ctx.drawImage(_image, 0, 0);
						}
					}
					ctx.restore();
				}
			},
			{
				key: "getBoundingBox",
				value: function getBoundingBox() {
					var x = this.getAttribute("x").getPixels("x");
					var y = this.getAttribute("y").getPixels("y");
					var width = this.getStyle("width").getPixels("x");
					var height = this.getStyle("height").getPixels("y");
					return new BoundingBox(x, y, x + width, y + height);
				}
			}
		]);
		return ImageElement;
	}(RenderedElement);
	function _createSuper$c(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$c();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$c() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var SymbolElement = /*#__PURE__*/ function(_RenderedElement) {
		_inherits__default["default"](SymbolElement, _RenderedElement);
		var _super = _createSuper$c(SymbolElement);
		function SymbolElement() {
			var _this;
			_classCallCheck__default["default"](this, SymbolElement);
			_this = _super.apply(this, arguments);
			_this.type = "symbol";
			return _this;
		}
		_createClass__default["default"](SymbolElement, [{
			key: "render",
			value: function render(_) {}
		}]);
		return SymbolElement;
	}(RenderedElement);
	var SVGFontLoader = /*#__PURE__*/ function() {
		function SVGFontLoader(document) {
			_classCallCheck__default["default"](this, SVGFontLoader);
			this.document = document;
			this.loaded = false;
			document.fonts.push(this);
		}
		_createClass__default["default"](SVGFontLoader, [{
			key: "load",
			value: function() {
				var _load = _asyncToGenerator__default["default"](/*#__PURE__*/ _regeneratorRuntime__default["default"].mark(function _callee(fontFamily, url) {
					var document, svgDocument, fonts;
					return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
						while (1) switch (_context.prev = _context.next) {
							case 0:
								_context.prev = 0;
								document = this.document;
								_context.next = 4;
								return document.canvg.parser.load(url);
							case 4:
								svgDocument = _context.sent;
								fonts = svgDocument.getElementsByTagName("font");
								Array.from(fonts).forEach(function(fontNode) {
									var font = document.createElement(fontNode);
									document.definitions[fontFamily] = font;
								});
								_context.next = 12;
								break;
							case 9:
								_context.prev = 9;
								_context.t0 = _context["catch"](0);
								console.error("Error while loading font \"".concat(url, "\":"), _context.t0);
							case 12: this.loaded = true;
							case 13:
							case "end": return _context.stop();
						}
					}, _callee, this, [[0, 9]]);
				}));
				function load(_x, _x2) {
					return _load.apply(this, arguments);
				}
				return load;
			}()
		}]);
		return SVGFontLoader;
	}();
	function _createSuper$b(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$b();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$b() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var StyleElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](StyleElement, _Element);
		var _super = _createSuper$b(StyleElement);
		function StyleElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, StyleElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "style";
			compressSpaces(Array.from(node.childNodes).map(function(_) {
				return _.textContent;
			}).join("").replace(/(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, "").replace(/@import.*;/g, "")).split("}").forEach(function(_) {
				var def = _.trim();
				if (!def) return;
				var cssParts = def.split("{");
				var cssClasses = cssParts[0].split(",");
				var cssProps = cssParts[1].split(";");
				cssClasses.forEach(function(_) {
					var cssClass = _.trim();
					if (!cssClass) return;
					var props = document.styles[cssClass] || {};
					cssProps.forEach(function(cssProp) {
						var prop = cssProp.indexOf(":");
						var name = cssProp.substr(0, prop).trim();
						var value = cssProp.substr(prop + 1, cssProp.length - prop).trim();
						if (name && value) props[name] = new Property(document, name, value);
					});
					document.styles[cssClass] = props;
					document.stylesSpecificity[cssClass] = getSelectorSpecificity(cssClass);
					if (cssClass === "@font-face") {
						var fontFamily = props["font-family"].getString().replace(/"|'/g, "");
						props.src.getString().split(",").forEach(function(src) {
							if (src.indexOf("format(\"svg\")") > 0) {
								var url = parseExternalUrl(src);
								if (url) new SVGFontLoader(document).load(fontFamily, url);
							}
						});
					}
				});
			});
			return _this;
		}
		return StyleElement;
	}(Element);
	StyleElement.parseExternalUrl = parseExternalUrl;
	function _createSuper$a(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$a();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$a() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var UseElement = /*#__PURE__*/ function(_RenderedElement) {
		_inherits__default["default"](UseElement, _RenderedElement);
		var _super = _createSuper$a(UseElement);
		function UseElement() {
			var _this;
			_classCallCheck__default["default"](this, UseElement);
			_this = _super.apply(this, arguments);
			_this.type = "use";
			return _this;
		}
		_createClass__default["default"](UseElement, [
			{
				key: "setContext",
				value: function setContext(ctx) {
					_get__default["default"](_getPrototypeOf__default["default"](UseElement.prototype), "setContext", this).call(this, ctx);
					var xAttr = this.getAttribute("x");
					var yAttr = this.getAttribute("y");
					if (xAttr.hasValue()) ctx.translate(xAttr.getPixels("x"), 0);
					if (yAttr.hasValue()) ctx.translate(0, yAttr.getPixels("y"));
				}
			},
			{
				key: "path",
				value: function path(ctx) {
					var element = this.element;
					if (element) element.path(ctx);
				}
			},
			{
				key: "renderChildren",
				value: function renderChildren(ctx) {
					var document = this.document, element = this.element;
					if (element) {
						var tempSvg = element;
						if (element.type === "symbol") {
							tempSvg = new SVGElement(document, null);
							tempSvg.attributes.viewBox = new Property(document, "viewBox", element.getAttribute("viewBox").getString());
							tempSvg.attributes.preserveAspectRatio = new Property(document, "preserveAspectRatio", element.getAttribute("preserveAspectRatio").getString());
							tempSvg.attributes.overflow = new Property(document, "overflow", element.getAttribute("overflow").getString());
							tempSvg.children = element.children;
							element.styles.opacity = new Property(document, "opacity", this.calculateOpacity());
						}
						if (tempSvg.type === "svg") {
							var widthStyle = this.getStyle("width", false, true);
							var heightStyle = this.getStyle("height", false, true);
							if (widthStyle.hasValue()) tempSvg.attributes.width = new Property(document, "width", widthStyle.getString());
							if (heightStyle.hasValue()) tempSvg.attributes.height = new Property(document, "height", heightStyle.getString());
						}
						var oldParent = tempSvg.parent;
						tempSvg.parent = this;
						tempSvg.render(ctx);
						tempSvg.parent = oldParent;
					}
				}
			},
			{
				key: "getBoundingBox",
				value: function getBoundingBox(ctx) {
					var element = this.element;
					if (element) return element.getBoundingBox(ctx);
					return null;
				}
			},
			{
				key: "elementTransform",
				value: function elementTransform() {
					var document = this.document, element = this.element;
					return Transform.fromElement(document, element);
				}
			},
			{
				key: "element",
				get: function get() {
					if (!this.cachedElement) this.cachedElement = this.getHrefAttribute().getDefinition();
					return this.cachedElement;
				}
			}
		]);
		return UseElement;
	}(RenderedElement);
	function _createSuper$9(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$9();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$9() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	function imGet(img, x, y, width, _height, rgba) {
		return img[y * width * 4 + x * 4 + rgba];
	}
	function imSet(img, x, y, width, _height, rgba, val) {
		img[y * width * 4 + x * 4 + rgba] = val;
	}
	function m(matrix, i, v) {
		return matrix[i] * v;
	}
	function c(a, m1, m2, m3) {
		return m1 + Math.cos(a) * m2 + Math.sin(a) * m3;
	}
	var FeColorMatrixElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](FeColorMatrixElement, _Element);
		var _super = _createSuper$9(FeColorMatrixElement);
		function FeColorMatrixElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, FeColorMatrixElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "feColorMatrix";
			var matrix = toNumbers(_this.getAttribute("values").getString());
			switch (_this.getAttribute("type").getString("matrix")) {
				case "saturate":
					var s = matrix[0];
					matrix = [
						.213 + .787 * s,
						.715 - .715 * s,
						.072 - .072 * s,
						0,
						0,
						.213 - .213 * s,
						.715 + .285 * s,
						.072 - .072 * s,
						0,
						0,
						.213 - .213 * s,
						.715 - .715 * s,
						.072 + .928 * s,
						0,
						0,
						0,
						0,
						0,
						1,
						0,
						0,
						0,
						0,
						0,
						1
					];
					break;
				case "hueRotate":
					var a = matrix[0] * Math.PI / 180;
					matrix = [
						c(a, .213, .787, -.213),
						c(a, .715, -.715, -.715),
						c(a, .072, -.072, .928),
						0,
						0,
						c(a, .213, -.213, .143),
						c(a, .715, .285, .14),
						c(a, .072, -.072, -.283),
						0,
						0,
						c(a, .213, -.213, -.787),
						c(a, .715, -.715, .715),
						c(a, .072, .928, .072),
						0,
						0,
						0,
						0,
						0,
						1,
						0,
						0,
						0,
						0,
						0,
						1
					];
					break;
				case "luminanceToAlpha": matrix = [
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					.2125,
					.7154,
					.0721,
					0,
					0,
					0,
					0,
					0,
					0,
					1
				];
			}
			_this.matrix = matrix;
			_this.includeOpacity = _this.getAttribute("includeOpacity").hasValue();
			return _this;
		}
		_createClass__default["default"](FeColorMatrixElement, [{
			key: "apply",
			value: function apply(ctx, _x, _y, width, height) {
				var includeOpacity = this.includeOpacity, matrix = this.matrix;
				var srcData = ctx.getImageData(0, 0, width, height);
				for (var y = 0; y < height; y++) for (var x = 0; x < width; x++) {
					var r = imGet(srcData.data, x, y, width, height, 0);
					var g = imGet(srcData.data, x, y, width, height, 1);
					var b = imGet(srcData.data, x, y, width, height, 2);
					var a = imGet(srcData.data, x, y, width, height, 3);
					var nr = m(matrix, 0, r) + m(matrix, 1, g) + m(matrix, 2, b) + m(matrix, 3, a) + m(matrix, 4, 1);
					var ng = m(matrix, 5, r) + m(matrix, 6, g) + m(matrix, 7, b) + m(matrix, 8, a) + m(matrix, 9, 1);
					var nb = m(matrix, 10, r) + m(matrix, 11, g) + m(matrix, 12, b) + m(matrix, 13, a) + m(matrix, 14, 1);
					var na = m(matrix, 15, r) + m(matrix, 16, g) + m(matrix, 17, b) + m(matrix, 18, a) + m(matrix, 19, 1);
					if (includeOpacity) {
						nr = 0;
						ng = 0;
						nb = 0;
						na *= a / 255;
					}
					imSet(srcData.data, x, y, width, height, 0, nr);
					imSet(srcData.data, x, y, width, height, 1, ng);
					imSet(srcData.data, x, y, width, height, 2, nb);
					imSet(srcData.data, x, y, width, height, 3, na);
				}
				ctx.clearRect(0, 0, width, height);
				ctx.putImageData(srcData, 0, 0);
			}
		}]);
		return FeColorMatrixElement;
	}(Element);
	function _createSuper$8(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$8();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$8() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var MaskElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](MaskElement, _Element);
		var _super = _createSuper$8(MaskElement);
		function MaskElement() {
			var _this;
			_classCallCheck__default["default"](this, MaskElement);
			_this = _super.apply(this, arguments);
			_this.type = "mask";
			return _this;
		}
		_createClass__default["default"](MaskElement, [{
			key: "apply",
			value: function apply(ctx, element) {
				var document = this.document;
				var x = this.getAttribute("x").getPixels("x");
				var y = this.getAttribute("y").getPixels("y");
				var width = this.getStyle("width").getPixels("x");
				var height = this.getStyle("height").getPixels("y");
				if (!width && !height) {
					var boundingBox = new BoundingBox();
					this.children.forEach(function(child) {
						boundingBox.addBoundingBox(child.getBoundingBox(ctx));
					});
					x = Math.floor(boundingBox.x1);
					y = Math.floor(boundingBox.y1);
					width = Math.floor(boundingBox.width);
					height = Math.floor(boundingBox.height);
				}
				var ignoredStyles = this.removeStyles(element, MaskElement.ignoreStyles);
				var maskCanvas = document.createCanvas(x + width, y + height);
				var maskCtx = maskCanvas.getContext("2d");
				document.screen.setDefaults(maskCtx);
				this.renderChildren(maskCtx);
				new FeColorMatrixElement(document, {
					nodeType: 1,
					childNodes: [],
					attributes: [{
						nodeName: "type",
						value: "luminanceToAlpha"
					}, {
						nodeName: "includeOpacity",
						value: "true"
					}]
				}).apply(maskCtx, 0, 0, x + width, y + height);
				var tmpCanvas = document.createCanvas(x + width, y + height);
				var tmpCtx = tmpCanvas.getContext("2d");
				document.screen.setDefaults(tmpCtx);
				element.render(tmpCtx);
				tmpCtx.globalCompositeOperation = "destination-in";
				tmpCtx.fillStyle = maskCtx.createPattern(maskCanvas, "no-repeat");
				tmpCtx.fillRect(0, 0, x + width, y + height);
				ctx.fillStyle = tmpCtx.createPattern(tmpCanvas, "no-repeat");
				ctx.fillRect(0, 0, x + width, y + height);
				this.restoreStyles(element, ignoredStyles);
			}
		}, {
			key: "render",
			value: function render(_) {}
		}]);
		return MaskElement;
	}(Element);
	MaskElement.ignoreStyles = [
		"mask",
		"transform",
		"clip-path"
	];
	function _createSuper$7(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$7();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$7() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var noop = function noop() {};
	var ClipPathElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](ClipPathElement, _Element);
		var _super = _createSuper$7(ClipPathElement);
		function ClipPathElement() {
			var _this;
			_classCallCheck__default["default"](this, ClipPathElement);
			_this = _super.apply(this, arguments);
			_this.type = "clipPath";
			return _this;
		}
		_createClass__default["default"](ClipPathElement, [{
			key: "apply",
			value: function apply(ctx) {
				var document = this.document;
				var contextProto = Reflect.getPrototypeOf(ctx);
				var beginPath = ctx.beginPath, closePath = ctx.closePath;
				if (contextProto) {
					contextProto.beginPath = noop;
					contextProto.closePath = noop;
				}
				Reflect.apply(beginPath, ctx, []);
				this.children.forEach(function(child) {
					if (typeof child.path === "undefined") return;
					var transform = typeof child.elementTransform !== "undefined" ? child.elementTransform() : null;
					if (!transform) transform = Transform.fromElement(document, child);
					if (transform) transform.apply(ctx);
					child.path(ctx);
					if (contextProto) contextProto.closePath = closePath;
					if (transform) transform.unapply(ctx);
				});
				Reflect.apply(closePath, ctx, []);
				ctx.clip();
				if (contextProto) {
					contextProto.beginPath = beginPath;
					contextProto.closePath = closePath;
				}
			}
		}, {
			key: "render",
			value: function render(_) {}
		}]);
		return ClipPathElement;
	}(Element);
	function _createSuper$6(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$6();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$6() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var FilterElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](FilterElement, _Element);
		var _super = _createSuper$6(FilterElement);
		function FilterElement() {
			var _this;
			_classCallCheck__default["default"](this, FilterElement);
			_this = _super.apply(this, arguments);
			_this.type = "filter";
			return _this;
		}
		_createClass__default["default"](FilterElement, [{
			key: "apply",
			value: function apply(ctx, element) {
				var document = this.document, children = this.children;
				var boundingBox = element.getBoundingBox(ctx);
				if (!boundingBox) return;
				var px = 0;
				var py = 0;
				children.forEach(function(child) {
					var efd = child.extraFilterDistance || 0;
					px = Math.max(px, efd);
					py = Math.max(py, efd);
				});
				var width = Math.floor(boundingBox.width);
				var height = Math.floor(boundingBox.height);
				var tmpCanvasWidth = width + 2 * px;
				var tmpCanvasHeight = height + 2 * py;
				if (tmpCanvasWidth < 1 || tmpCanvasHeight < 1) return;
				var x = Math.floor(boundingBox.x);
				var y = Math.floor(boundingBox.y);
				var ignoredStyles = this.removeStyles(element, FilterElement.ignoreStyles);
				var tmpCanvas = document.createCanvas(tmpCanvasWidth, tmpCanvasHeight);
				var tmpCtx = tmpCanvas.getContext("2d");
				document.screen.setDefaults(tmpCtx);
				tmpCtx.translate(-x + px, -y + py);
				element.render(tmpCtx);
				children.forEach(function(child) {
					if (typeof child.apply === "function") child.apply(tmpCtx, 0, 0, tmpCanvasWidth, tmpCanvasHeight);
				});
				ctx.drawImage(tmpCanvas, 0, 0, tmpCanvasWidth, tmpCanvasHeight, x - px, y - py, tmpCanvasWidth, tmpCanvasHeight);
				this.restoreStyles(element, ignoredStyles);
			}
		}, {
			key: "render",
			value: function render(_) {}
		}]);
		return FilterElement;
	}(Element);
	FilterElement.ignoreStyles = [
		"filter",
		"transform",
		"clip-path"
	];
	function _createSuper$5(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$5();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$5() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var FeDropShadowElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](FeDropShadowElement, _Element);
		var _super = _createSuper$5(FeDropShadowElement);
		function FeDropShadowElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, FeDropShadowElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "feDropShadow";
			_this.addStylesFromStyleDefinition();
			return _this;
		}
		_createClass__default["default"](FeDropShadowElement, [{
			key: "apply",
			value: function apply(_, _x, _y, _width, _height) {}
		}]);
		return FeDropShadowElement;
	}(Element);
	function _createSuper$4(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$4();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$4() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var FeMorphologyElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](FeMorphologyElement, _Element);
		var _super = _createSuper$4(FeMorphologyElement);
		function FeMorphologyElement() {
			var _this;
			_classCallCheck__default["default"](this, FeMorphologyElement);
			_this = _super.apply(this, arguments);
			_this.type = "feMorphology";
			return _this;
		}
		_createClass__default["default"](FeMorphologyElement, [{
			key: "apply",
			value: function apply(_, _x, _y, _width, _height) {}
		}]);
		return FeMorphologyElement;
	}(Element);
	function _createSuper$3(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$3();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$3() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var FeCompositeElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](FeCompositeElement, _Element);
		var _super = _createSuper$3(FeCompositeElement);
		function FeCompositeElement() {
			var _this;
			_classCallCheck__default["default"](this, FeCompositeElement);
			_this = _super.apply(this, arguments);
			_this.type = "feComposite";
			return _this;
		}
		_createClass__default["default"](FeCompositeElement, [{
			key: "apply",
			value: function apply(_, _x, _y, _width, _height) {}
		}]);
		return FeCompositeElement;
	}(Element);
	function _createSuper$2(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$2();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$2() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var FeGaussianBlurElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](FeGaussianBlurElement, _Element);
		var _super = _createSuper$2(FeGaussianBlurElement);
		function FeGaussianBlurElement(document, node, captureTextNodes) {
			var _this;
			_classCallCheck__default["default"](this, FeGaussianBlurElement);
			_this = _super.call(this, document, node, captureTextNodes);
			_this.type = "feGaussianBlur";
			_this.blurRadius = Math.floor(_this.getAttribute("stdDeviation").getNumber());
			_this.extraFilterDistance = _this.blurRadius;
			return _this;
		}
		_createClass__default["default"](FeGaussianBlurElement, [{
			key: "apply",
			value: function apply(ctx, x, y, width, height) {
				var document = this.document, blurRadius = this.blurRadius;
				var body = document.window ? document.window.document.body : null;
				var canvas = ctx.canvas;
				canvas.id = document.getUniqueId();
				if (body) {
					canvas.style.display = "none";
					body.appendChild(canvas);
				}
				stackblurCanvas.canvasRGBA(canvas, x, y, width, height, blurRadius);
				if (body) body.removeChild(canvas);
			}
		}]);
		return FeGaussianBlurElement;
	}(Element);
	function _createSuper$1(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct$1();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct$1() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var TitleElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](TitleElement, _Element);
		var _super = _createSuper$1(TitleElement);
		function TitleElement() {
			var _this;
			_classCallCheck__default["default"](this, TitleElement);
			_this = _super.apply(this, arguments);
			_this.type = "title";
			return _this;
		}
		return TitleElement;
	}(Element);
	function _createSuper(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf__default["default"](Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf__default["default"](this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn__default["default"](this, result);
		};
	}
	function _isNativeReflectConstruct() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	var DescElement = /*#__PURE__*/ function(_Element) {
		_inherits__default["default"](DescElement, _Element);
		var _super = _createSuper(DescElement);
		function DescElement() {
			var _this;
			_classCallCheck__default["default"](this, DescElement);
			_this = _super.apply(this, arguments);
			_this.type = "desc";
			return _this;
		}
		return DescElement;
	}(Element);
	var elements = {
		"svg": SVGElement,
		"rect": RectElement,
		"circle": CircleElement,
		"ellipse": EllipseElement,
		"line": LineElement,
		"polyline": PolylineElement,
		"polygon": PolygonElement,
		"path": PathElement,
		"pattern": PatternElement,
		"marker": MarkerElement,
		"defs": DefsElement,
		"linearGradient": LinearGradientElement,
		"radialGradient": RadialGradientElement,
		"stop": StopElement,
		"animate": AnimateElement,
		"animateColor": AnimateColorElement,
		"animateTransform": AnimateTransformElement,
		"font": FontElement,
		"font-face": FontFaceElement,
		"missing-glyph": MissingGlyphElement,
		"glyph": GlyphElement,
		"text": TextElement,
		"tspan": TSpanElement,
		"tref": TRefElement,
		"a": AElement,
		"textPath": TextPathElement,
		"image": ImageElement,
		"g": GElement,
		"symbol": SymbolElement,
		"style": StyleElement,
		"use": UseElement,
		"mask": MaskElement,
		"clipPath": ClipPathElement,
		"filter": FilterElement,
		"feDropShadow": FeDropShadowElement,
		"feMorphology": FeMorphologyElement,
		"feComposite": FeCompositeElement,
		"feColorMatrix": FeColorMatrixElement,
		"feGaussianBlur": FeGaussianBlurElement,
		"title": TitleElement,
		"desc": DescElement
	};
	function ownKeys$1(object, enumerableOnly) {
		var keys = Object.keys(object);
		if (Object.getOwnPropertySymbols) {
			var symbols = Object.getOwnPropertySymbols(object);
			if (enumerableOnly) symbols = symbols.filter(function(sym) {
				return Object.getOwnPropertyDescriptor(object, sym).enumerable;
			});
			keys.push.apply(keys, symbols);
		}
		return keys;
	}
	function _objectSpread$1(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i] != null ? arguments[i] : {};
			if (i % 2) ownKeys$1(Object(source), true).forEach(function(key) {
				_defineProperty__default["default"](target, key, source[key]);
			});
			else if (Object.getOwnPropertyDescriptors) Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
			else ownKeys$1(Object(source)).forEach(function(key) {
				Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
			});
		}
		return target;
	}
	function createCanvas(width, height) {
		var canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		return canvas;
	}
	function createImage(_x) {
		return _createImage.apply(this, arguments);
	}
	function _createImage() {
		_createImage = _asyncToGenerator__default["default"](/*#__PURE__*/ _regeneratorRuntime__default["default"].mark(function _callee(src) {
			var anonymousCrossOrigin, image, _args = arguments;
			return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
				while (1) switch (_context.prev = _context.next) {
					case 0:
						anonymousCrossOrigin = _args.length > 1 && _args[1] !== void 0 ? _args[1] : false;
						image = document.createElement("img");
						if (anonymousCrossOrigin) image.crossOrigin = "Anonymous";
						return _context.abrupt("return", new Promise(function(resolve, reject) {
							image.onload = function() {
								resolve(image);
							};
							image.onerror = function(_event, _source, _lineno, _colno, error) {
								reject(error);
							};
							image.src = src;
						}));
					case 4:
					case "end": return _context.stop();
				}
			}, _callee);
		}));
		return _createImage.apply(this, arguments);
	}
	var Document = /*#__PURE__*/ function() {
		function Document(canvg) {
			var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref$rootEmSize = _ref.rootEmSize, rootEmSize = _ref$rootEmSize === void 0 ? 12 : _ref$rootEmSize, _ref$emSize = _ref.emSize, emSize = _ref$emSize === void 0 ? 12 : _ref$emSize, _ref$createCanvas = _ref.createCanvas, createCanvas = _ref$createCanvas === void 0 ? Document.createCanvas : _ref$createCanvas, _ref$createImage = _ref.createImage, createImage = _ref$createImage === void 0 ? Document.createImage : _ref$createImage, anonymousCrossOrigin = _ref.anonymousCrossOrigin;
			_classCallCheck__default["default"](this, Document);
			this.canvg = canvg;
			this.definitions = Object.create(null);
			this.styles = Object.create(null);
			this.stylesSpecificity = Object.create(null);
			this.images = [];
			this.fonts = [];
			this.emSizeStack = [];
			this.uniqueId = 0;
			this.screen = canvg.screen;
			this.rootEmSize = rootEmSize;
			this.emSize = emSize;
			this.createCanvas = createCanvas;
			this.createImage = this.bindCreateImage(createImage, anonymousCrossOrigin);
			this.screen.wait(this.isImagesLoaded.bind(this));
			this.screen.wait(this.isFontsLoaded.bind(this));
		}
		_createClass__default["default"](Document, [
			{
				key: "bindCreateImage",
				value: function bindCreateImage(createImage, anonymousCrossOrigin) {
					if (typeof anonymousCrossOrigin === "boolean") return function(source, forceAnonymousCrossOrigin) {
						return createImage(source, typeof forceAnonymousCrossOrigin === "boolean" ? forceAnonymousCrossOrigin : anonymousCrossOrigin);
					};
					return createImage;
				}
			},
			{
				key: "popEmSize",
				value: function popEmSize() {
					this.emSizeStack.pop();
				}
			},
			{
				key: "getUniqueId",
				value: function getUniqueId() {
					return "canvg".concat(++this.uniqueId);
				}
			},
			{
				key: "isImagesLoaded",
				value: function isImagesLoaded() {
					return this.images.every(function(_) {
						return _.loaded;
					});
				}
			},
			{
				key: "isFontsLoaded",
				value: function isFontsLoaded() {
					return this.fonts.every(function(_) {
						return _.loaded;
					});
				}
			},
			{
				key: "createDocumentElement",
				value: function createDocumentElement(document) {
					var documentElement = this.createElement(document.documentElement);
					documentElement.root = true;
					documentElement.addStylesFromStyleDefinition();
					this.documentElement = documentElement;
					return documentElement;
				}
			},
			{
				key: "createElement",
				value: function createElement(node) {
					var elementType = node.nodeName.replace(/^[^:]+:/, "");
					var ElementType = Document.elementTypes[elementType];
					if (typeof ElementType !== "undefined") return new ElementType(this, node);
					return new UnknownElement(this, node);
				}
			},
			{
				key: "createTextNode",
				value: function createTextNode(node) {
					return new TextNode(this, node);
				}
			},
			{
				key: "setViewBox",
				value: function setViewBox(config) {
					this.screen.setViewBox(_objectSpread$1({ document: this }, config));
				}
			},
			{
				key: "window",
				get: function get() {
					return this.screen.window;
				}
			},
			{
				key: "fetch",
				get: function get() {
					return this.screen.fetch;
				}
			},
			{
				key: "ctx",
				get: function get() {
					return this.screen.ctx;
				}
			},
			{
				key: "emSize",
				get: function get() {
					var emSizeStack = this.emSizeStack;
					return emSizeStack[emSizeStack.length - 1];
				},
				set: function set(value) {
					this.emSizeStack.push(value);
				}
			}
		]);
		return Document;
	}();
	Document.createCanvas = createCanvas;
	Document.createImage = createImage;
	Document.elementTypes = elements;
	function ownKeys(object, enumerableOnly) {
		var keys = Object.keys(object);
		if (Object.getOwnPropertySymbols) {
			var symbols = Object.getOwnPropertySymbols(object);
			if (enumerableOnly) symbols = symbols.filter(function(sym) {
				return Object.getOwnPropertyDescriptor(object, sym).enumerable;
			});
			keys.push.apply(keys, symbols);
		}
		return keys;
	}
	function _objectSpread(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i] != null ? arguments[i] : {};
			if (i % 2) ownKeys(Object(source), true).forEach(function(key) {
				_defineProperty__default["default"](target, key, source[key]);
			});
			else if (Object.getOwnPropertyDescriptors) Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
			else ownKeys(Object(source)).forEach(function(key) {
				Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
			});
		}
		return target;
	}
	/**
	* SVG renderer on canvas.
	*/
	var Canvg = /*#__PURE__*/ function() {
		/**
		* Main constructor.
		* @param ctx - Rendering context.
		* @param svg - SVG Document.
		* @param options - Rendering options.
		*/
		function Canvg(ctx, svg) {
			var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
			_classCallCheck__default["default"](this, Canvg);
			this.parser = new Parser(options);
			this.screen = new Screen(ctx, options);
			this.options = options;
			var document = new Document(this, options);
			var documentElement = document.createDocumentElement(svg);
			this.document = document;
			this.documentElement = documentElement;
		}
		/**
		* Create Canvg instance from SVG source string or URL.
		* @param ctx - Rendering context.
		* @param svg - SVG source string or URL.
		* @param options - Rendering options.
		* @returns Canvg instance.
		*/
		_createClass__default["default"](Canvg, [
			{
				key: "fork",
				/**
				* Create new Canvg instance with inherited options.
				* @param ctx - Rendering context.
				* @param svg - SVG source string or URL.
				* @param options - Rendering options.
				* @returns Canvg instance.
				*/
				value: function fork(ctx, svg) {
					var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
					return Canvg.from(ctx, svg, _objectSpread(_objectSpread({}, this.options), options));
				}
			},
			{
				key: "forkString",
				value: function forkString(ctx, svg) {
					var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
					return Canvg.fromString(ctx, svg, _objectSpread(_objectSpread({}, this.options), options));
				}
			},
			{
				key: "ready",
				value: function ready() {
					return this.screen.ready();
				}
			},
			{
				key: "isReady",
				value: function isReady() {
					return this.screen.isReady();
				}
			},
			{
				key: "render",
				value: function() {
					var _render = _asyncToGenerator__default["default"](/*#__PURE__*/ _regeneratorRuntime__default["default"].mark(function _callee() {
						var options, _args = arguments;
						return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
							while (1) switch (_context.prev = _context.next) {
								case 0:
									options = _args.length > 0 && _args[0] !== void 0 ? _args[0] : {};
									this.start(_objectSpread({
										enableRedraw: true,
										ignoreAnimation: true,
										ignoreMouse: true
									}, options));
									_context.next = 4;
									return this.ready();
								case 4: this.stop();
								case 5:
								case "end": return _context.stop();
							}
						}, _callee, this);
					}));
					function render() {
						return _render.apply(this, arguments);
					}
					return render;
				}()
			},
			{
				key: "start",
				value: function start() {
					var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
					var documentElement = this.documentElement, screen = this.screen, baseOptions = this.options;
					screen.start(documentElement, _objectSpread(_objectSpread({ enableRedraw: true }, baseOptions), options));
				}
			},
			{
				key: "stop",
				value: function stop() {
					this.screen.stop();
				}
			},
			{
				key: "resize",
				value: function resize(width) {
					var height = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : width;
					var preserveAspectRatio = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
					this.documentElement.resize(width, height, preserveAspectRatio);
				}
			}
		], [{
			key: "from",
			value: function() {
				var _from = _asyncToGenerator__default["default"](/*#__PURE__*/ _regeneratorRuntime__default["default"].mark(function _callee2(ctx, svg) {
					var options, parser, svgDocument, _args2 = arguments;
					return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
						while (1) switch (_context2.prev = _context2.next) {
							case 0:
								options = _args2.length > 2 && _args2[2] !== void 0 ? _args2[2] : {};
								parser = new Parser(options);
								_context2.next = 4;
								return parser.parse(svg);
							case 4:
								svgDocument = _context2.sent;
								return _context2.abrupt("return", new Canvg(ctx, svgDocument, options));
							case 6:
							case "end": return _context2.stop();
						}
					}, _callee2);
				}));
				function from(_x, _x2) {
					return _from.apply(this, arguments);
				}
				return from;
			}()
		}, {
			key: "fromString",
			value: function fromString(ctx, svg) {
				var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
				return new Canvg(ctx, new Parser(options).parseFromString(svg), options);
			}
		}]);
		return Canvg;
	}();
	exports.AElement = AElement;
	exports.AnimateColorElement = AnimateColorElement;
	exports.AnimateElement = AnimateElement;
	exports.AnimateTransformElement = AnimateTransformElement;
	exports.BoundingBox = BoundingBox;
	exports.CB1 = CB1;
	exports.CB2 = CB2;
	exports.CB3 = CB3;
	exports.CB4 = CB4;
	exports.Canvg = Canvg;
	exports.CircleElement = CircleElement;
	exports.ClipPathElement = ClipPathElement;
	exports.DefsElement = DefsElement;
	exports.DescElement = DescElement;
	exports.Document = Document;
	exports.Element = Element;
	exports.EllipseElement = EllipseElement;
	exports.FeColorMatrixElement = FeColorMatrixElement;
	exports.FeCompositeElement = FeCompositeElement;
	exports.FeDropShadowElement = FeDropShadowElement;
	exports.FeGaussianBlurElement = FeGaussianBlurElement;
	exports.FeMorphologyElement = FeMorphologyElement;
	exports.FilterElement = FilterElement;
	exports.Font = Font;
	exports.FontElement = FontElement;
	exports.FontFaceElement = FontFaceElement;
	exports.GElement = GElement;
	exports.GlyphElement = GlyphElement;
	exports.GradientElement = GradientElement;
	exports.ImageElement = ImageElement;
	exports.LineElement = LineElement;
	exports.LinearGradientElement = LinearGradientElement;
	exports.MarkerElement = MarkerElement;
	exports.MaskElement = MaskElement;
	exports.Matrix = Matrix;
	exports.MissingGlyphElement = MissingGlyphElement;
	exports.Mouse = Mouse;
	exports.PSEUDO_ZERO = PSEUDO_ZERO;
	exports.Parser = Parser;
	exports.PathElement = PathElement;
	exports.PathParser = PathParser;
	exports.PatternElement = PatternElement;
	exports.Point = Point;
	exports.PolygonElement = PolygonElement;
	exports.PolylineElement = PolylineElement;
	exports.Property = Property;
	exports.QB1 = QB1;
	exports.QB2 = QB2;
	exports.QB3 = QB3;
	exports.RadialGradientElement = RadialGradientElement;
	exports.RectElement = RectElement;
	exports.RenderedElement = RenderedElement;
	exports.Rotate = Rotate;
	exports.SVGElement = SVGElement;
	exports.SVGFontLoader = SVGFontLoader;
	exports.Scale = Scale;
	exports.Screen = Screen;
	exports.Skew = Skew;
	exports.SkewX = SkewX;
	exports.SkewY = SkewY;
	exports.StopElement = StopElement;
	exports.StyleElement = StyleElement;
	exports.SymbolElement = SymbolElement;
	exports.TRefElement = TRefElement;
	exports.TSpanElement = TSpanElement;
	exports.TextElement = TextElement;
	exports.TextPathElement = TextPathElement;
	exports.TitleElement = TitleElement;
	exports.Transform = Transform;
	exports.Translate = Translate;
	exports.UnknownElement = UnknownElement;
	exports.UseElement = UseElement;
	exports.ViewPort = ViewPort;
	exports.compressSpaces = compressSpaces;
	exports["default"] = Canvg;
	exports.getSelectorSpecificity = getSelectorSpecificity;
	exports.normalizeAttributeName = normalizeAttributeName;
	exports.normalizeColor = normalizeColor;
	exports.parseExternalUrl = parseExternalUrl;
	exports.presets = index;
	exports.toNumbers = toNumbers;
	exports.trimLeft = trimLeft;
	exports.trimRight = trimRight;
	exports.vectorMagnitude = vectorMagnitude;
	exports.vectorsAngle = vectorsAngle;
	exports.vectorsRatio = vectorsRatio;
}));
//#endregion
export { require_lib as t };
