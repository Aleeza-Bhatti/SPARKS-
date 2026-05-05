"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_rsc_lib_supabase_server_ts";
exports.ids = ["_rsc_lib_supabase_server_ts"];
exports.modules = {

/***/ "(rsc)/./lib/supabase/server.ts":
/*!********************************!*\
  !*** ./lib/supabase/server.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createAdminClient: () => (/* binding */ createAdminClient)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/index.mjs\");\n\nfunction createAdminClient() {\n    const url = \"https://eulevnomtahmlyekudum.supabase.co\";\n    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? \"sb_publishable_bX3nbejE8bYjoEKzD9C4Uw_02NxPDcs\";\n    if (!url || !key) throw new Error(\"Supabase env vars not set\");\n    return (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(url, key, {\n        auth: {\n            persistSession: false,\n            autoRefreshToken: false\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2Uvc2VydmVyLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQXFEO0FBRTlDLFNBQVNDO0lBQ2QsTUFBTUMsTUFBTUMsMENBQW9DO0lBQ2hELE1BQU1HLE1BQ0pILFFBQVFDLEdBQUcsQ0FBQ0cseUJBQXlCLElBQ3JDSixnREFBeUM7SUFDM0MsSUFBSSxDQUFDRCxPQUFPLENBQUNJLEtBQUssTUFBTSxJQUFJRyxNQUFNO0lBQ2xDLE9BQU9ULG1FQUFZQSxDQUFDRSxLQUFLSSxLQUFLO1FBQzVCSSxNQUFNO1lBQUVDLGdCQUFnQjtZQUFPQyxrQkFBa0I7UUFBTTtJQUN6RDtBQUNGIiwic291cmNlcyI6WyJDOlxcc3BhcmtzXFxTUEFSS1MtXFx3ZWJcXHYyXFxsaWJcXHN1cGFiYXNlXFxzZXJ2ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIkBzdXBhYmFzZS9zdXBhYmFzZS1qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQWRtaW5DbGllbnQoKSB7XG4gIGNvbnN0IHVybCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTDtcbiAgY29uc3Qga2V5ID1cbiAgICBwcm9jZXNzLmVudi5TVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZID8/XG4gICAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVk7XG4gIGlmICghdXJsIHx8ICFrZXkpIHRocm93IG5ldyBFcnJvcihcIlN1cGFiYXNlIGVudiB2YXJzIG5vdCBzZXRcIik7XG4gIHJldHVybiBjcmVhdGVDbGllbnQodXJsLCBrZXksIHtcbiAgICBhdXRoOiB7IHBlcnNpc3RTZXNzaW9uOiBmYWxzZSwgYXV0b1JlZnJlc2hUb2tlbjogZmFsc2UgfSxcbiAgfSk7XG59XG4iXSwibmFtZXMiOlsiY3JlYXRlQ2xpZW50IiwiY3JlYXRlQWRtaW5DbGllbnQiLCJ1cmwiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwia2V5IiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIiwiRXJyb3IiLCJhdXRoIiwicGVyc2lzdFNlc3Npb24iLCJhdXRvUmVmcmVzaFRva2VuIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabase/server.ts\n");

/***/ })

};
;