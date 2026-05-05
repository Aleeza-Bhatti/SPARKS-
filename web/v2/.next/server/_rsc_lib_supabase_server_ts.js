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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createAdminClient: () => (/* binding */ createAdminClient)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/index.mjs\");\n\nfunction createAdminClient() {\n    const url = \"https://eulevnomtahmlyekudum.supabase.co\";\n    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? \"sb_publishable_bX3nbejE8bYjoEKzD9C4Uw_02NxPDcs\";\n    if (!url || !key) throw new Error(\"Supabase env vars not set\");\n    return (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(url, key, {\n        auth: {\n            persistSession: false,\n            autoRefreshToken: false\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2Uvc2VydmVyLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQXFEO0FBRTlDLFNBQVNDO0lBQ2QsTUFBTUMsTUFBTUMsMENBQW9DO0lBQ2hELE1BQU1HLE1BQ0pILFFBQVFDLEdBQUcsQ0FBQ0cseUJBQXlCLElBQ3JDSixnREFBeUM7SUFDM0MsSUFBSSxDQUFDRCxPQUFPLENBQUNJLEtBQUssTUFBTSxJQUFJRyxNQUFNO0lBQ2xDLE9BQU9ULG1FQUFZQSxDQUFDRSxLQUFLSSxLQUFLO1FBQzVCSSxNQUFNO1lBQUVDLGdCQUFnQjtZQUFPQyxrQkFBa0I7UUFBTTtJQUN6RDtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvemFocmEvRGVza3RvcC9TUEFSS1MtL3dlYi92Mi9saWIvc3VwYWJhc2Uvc2VydmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCJAc3VwYWJhc2Uvc3VwYWJhc2UtanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFkbWluQ2xpZW50KCkge1xuICBjb25zdCB1cmwgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkw7XG4gIGNvbnN0IGtleSA9XG4gICAgcHJvY2Vzcy5lbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSA/P1xuICAgIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZO1xuICBpZiAoIXVybCB8fCAha2V5KSB0aHJvdyBuZXcgRXJyb3IoXCJTdXBhYmFzZSBlbnYgdmFycyBub3Qgc2V0XCIpO1xuICByZXR1cm4gY3JlYXRlQ2xpZW50KHVybCwga2V5LCB7XG4gICAgYXV0aDogeyBwZXJzaXN0U2Vzc2lvbjogZmFsc2UsIGF1dG9SZWZyZXNoVG9rZW46IGZhbHNlIH0sXG4gIH0pO1xufVxuIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsImNyZWF0ZUFkbWluQ2xpZW50IiwidXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsImtleSIsIlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSIsIkVycm9yIiwiYXV0aCIsInBlcnNpc3RTZXNzaW9uIiwiYXV0b1JlZnJlc2hUb2tlbiJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabase/server.ts\n");

/***/ })

};
;